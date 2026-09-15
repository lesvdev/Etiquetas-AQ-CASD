import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search,
  Upload,
  ExternalLink,
  Download,
  X,
  FileSpreadsheet,
  Check,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Folder,
  MapPin,
  AlertTriangle,
  FlaskConical,
  Image as ImageIcon,
  Camera,
  FolderCheck,
} from 'lucide-react';
import Papa from 'papaparse';
import { INITIAL_REAGENTS } from './data/defaultReagents';
import { ReagentItem } from './types';
import {
  getDirectImageUrl,
  getDriveThumbnailUrl,
  getDriveViewerUrl,
} from './utils/driveUrlHelper';
import { parseReagentsCsv, generateSampleCsvContent, exportToCsv } from './utils/csvParser';

const STORAGE_KEY = 'casd_lab_reagents_v3';

export default function App() {
  // Estado de reactivos con persistencia local
  const [reagents, setReagents] = useState<ReagentItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error al cargar datos:', e);
    }
    return INITIAL_REAGENTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reagents));
    } catch (e) {
      console.error(e);
    }
  }, [reagents]);

  // Búsqueda y Filtros
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedReagent, setSelectedReagent] = useState<ReagentItem | null>(null);

  // Modal de carga CSV
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [toast, setToast] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imagesInputRef = useRef<HTMLInputElement>(null);
  const singleImageInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // Categorías únicas
  const categories = useMemo(() => {
    const set = new Set<string>();
    reagents.forEach((r) => set.add(r.categoria || 'General'));
    return ['Todos', ...Array.from(set)];
  }, [reagents]);

  // Lista filtrada
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return reagents.filter((item) => {
      const matchesCat =
        selectedCategory === 'Todos' || item.categoria === selectedCategory;
      if (!matchesCat) return false;

      if (!q) return true;

      return (
        item.nombre.toLowerCase().includes(q) ||
        (item.formula && item.formula.toLowerCase().includes(q)) ||
        (item.cas && item.cas.toLowerCase().includes(q)) ||
        (item.ubicacion && item.ubicacion.toLowerCase().includes(q)) ||
        (item.carpetaDrive && item.carpetaDrive.toLowerCase().includes(q))
      );
    });
  }, [reagents, search, selectedCategory]);

  // Auto-seleccionar el primer reactivo si no hay ninguno seleccionado
  useEffect(() => {
    if (filtered.length > 0 && !selectedReagent) {
      setSelectedReagent(filtered[0]);
    } else if (filtered.length > 0 && selectedReagent) {
      const stillExists = filtered.some((r) => r.id === selectedReagent.id);
      if (!stillExists) {
        setSelectedReagent(filtered[0]);
      }
    }
  }, [filtered, selectedReagent]);

  // Reset zoom al cambiar de reactivo
  useEffect(() => {
    setZoomLevel(1);
  }, [selectedReagent?.id]);

  // Cargar archivo CSV directamente
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      try {
        const parsed = await parseReagentsCsv(text);
        if (parsed.length > 0) {
          setReagents(parsed);
          setSelectedReagent(parsed[0]);
          setIsCsvModalOpen(false);
          showToast(`✓ Se cargaron ${parsed.length} reactivos desde tu archivo CSV.`);
        } else {
          alert('No se encontraron registros válidos en el archivo CSV.');
        }
      } catch (err: any) {
        alert('Error al leer el archivo CSV: ' + err?.message);
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = '';
  };

  // Subir fotos múltiples y vincularlas automáticamente por nombre de archivo
  const handleBatchImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    let matchedCount = 0;
    const fileList = Array.from(files) as File[];

    fileList.forEach((file: File) => {
      const fileName = file.name;
      const fileNameWithoutExt = fileName.replace(/\.[^/.]+$/, '').trim().toLowerCase();

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (!dataUrl) return;

        setReagents((prev) =>
          prev.map((item) => {
            const itemFileName = (item.imageUrl || '').toLowerCase();
            const itemName = item.nombre.toLowerCase();

            // Comprobar coincidencia exacta de nombre de archivo o nombre de reactivo
            const isMatch =
              itemFileName === fileName.toLowerCase() ||
              itemFileName.includes(fileName.toLowerCase()) ||
              fileName.toLowerCase().includes(itemFileName) ||
              itemName === fileNameWithoutExt ||
              fileNameWithoutExt.includes(itemName) ||
              itemName.includes(fileNameWithoutExt);

            if (isMatch) {
              matchedCount++;
              return {
                ...item,
                imageUrl: dataUrl,
              };
            }
            return item;
          })
        );
      };
      reader.readAsDataURL(file);
    });

    showToast(`✓ Procesando ${fileList.length} fotografías. Se actualizarán en pantalla.`);
    if (e.target) e.target.value = '';
  };

  // Cambiar la foto del reactivo actualmente seleccionado
  const handleSingleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedReagent) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) return;

      const updated = { ...selectedReagent, imageUrl: dataUrl };
      setSelectedReagent(updated);
      setReagents((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      showToast(`✓ Fotografía actualizada para "${selectedReagent.nombre}".`);
    };
    reader.readAsDataURL(file);
    if (e.target) e.target.value = '';
  };

  const handleDownloadSample = () => {
    const sample = generateSampleCsvContent();
    const blob = new Blob(['\ufeff' + sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla_reactivos.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const activeDirectUrl = selectedReagent
    ? getDirectImageUrl(selectedReagent.imageUrl)
    : '';
  const activeDriveUrl = selectedReagent
    ? getDriveViewerUrl(selectedReagent.imageUrl)
    : null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased">
      {/* Toast informativo */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* 1. Barra Superior Sencilla y Limpia */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold shadow-xs">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black text-slate-900 leading-none">
                Buscador de Reactivos
              </h1>
              <span className="text-xs text-slate-500 font-medium">
                {reagents.length} reactivos registrados
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Input oculto para subir CSV directamente */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            {/* Input oculto para subir fotografías de reactivos en lote */}
            <input
              ref={imagesInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleBatchImagesUpload}
              className="hidden"
            />
            {/* Input oculto para subir fotografía individual */}
            <input
              ref={singleImageInputRef}
              type="file"
              accept="image/*"
              onChange={handleSingleImageUpload}
              className="hidden"
            />

            <button
              id="btn-upload-images-batch"
              onClick={() => imagesInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-xs transition-colors"
              title="Selecciona una o varias fotos desde tu computador"
            >
              <ImageIcon className="w-4 h-4 text-teal-400" />
              <span>Subir Fotos</span>
            </button>

            <button
              id="btn-upload-csv-direct"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-xs transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>Cargar mi CSV</span>
            </button>

            <button
              id="btn-export-csv"
              onClick={() => exportToCsv(reagents)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
              title="Descargar lista actual en CSV"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              id="btn-restore-samples"
              onClick={() => {
                if (window.confirm('¿Deseas restaurar la lista de reactivos inicial con las 70 fichas?')) {
                  setReagents(INITIAL_REAGENTS);
                  setSelectedReagent(INITIAL_REAGENTS[0]);
                  showToast('Lista restaurada con el catálogo oficial de 70 reactivos.');
                }
              }}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              title="Restaurar lista oficial"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Barra Principal de Búsqueda y Filtros de Categoría */}
      <section className="bg-white border-b border-slate-200/80 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto space-y-3">
          {/* Campo de búsqueda grande y claro */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              id="search-input-simple"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre del reactivo, fórmula química (ej. H2SO4, NaOH), número CAS..."
              className="w-full pl-11 pr-10 py-3 bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-teal-600 rounded-2xl text-sm sm:text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-teal-500/10 transition-all font-medium"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Botones de Categorías */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs sm:text-sm font-semibold scrollbar-none">
            {categories.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  id={`cat-filter-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                    active
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Contenedor Principal en Dos Paneles (Lista a la izquierda + Visor a la derecha) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Panel Izquierdo: Lista de Reactivos (5 columnas en pantallas grandes) */}
        <div className="lg:col-span-5 flex flex-col gap-2 max-h-[calc(100vh-14rem)] overflow-y-auto pr-1">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
            Reactivos encontrados ({filtered.length})
          </div>

          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 text-slate-500 space-y-2">
              <p className="text-sm font-bold text-slate-700">No hay coincidencias</p>
              <p className="text-xs text-slate-400">Intenta buscar con otra palabra clave o selecciona "Todos".</p>
              <button
                onClick={() => {
                  setSearch('');
                  setSelectedCategory('Todos');
                }}
                className="mt-2 text-xs font-bold text-teal-600 hover:underline"
              >
                Limpiar búsqueda
              </button>
            </div>
          ) : (
            filtered.map((item) => {
              const isSelected = selectedReagent?.id === item.id;
              const directThumb = getDirectImageUrl(item.imageUrl);

              return (
                <div
                  key={item.id}
                  id={`item-row-${item.id}`}
                  onClick={() => setSelectedReagent(item)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 ${
                    isSelected
                      ? 'bg-teal-50/80 border-teal-500 ring-2 ring-teal-500/20 shadow-xs'
                      : 'bg-white hover:bg-slate-50/80 border-slate-200/90'
                  }`}
                >
                  {/* Miniatura de la imagen */}
                  <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                    <img
                      src={directThumb}
                      alt={item.nombre}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain p-1"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>

                  {/* Datos del Reactivo */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-extrabold text-teal-700 font-mono">
                        {item.formula || item.categoria}
                      </span>
                      {item.cas && (
                        <span className="text-[10px] font-mono text-slate-400">
                          CAS: {item.cas}
                        </span>
                      )}
                    </div>

                    <h3
                      className={`text-sm font-bold truncate leading-tight mt-0.5 ${
                        isSelected ? 'text-teal-950' : 'text-slate-900'
                      }`}
                    >
                      {item.nombre}
                    </h3>

                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 truncate">
                      {item.ubicacion && (
                        <span className="flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{item.ubicacion}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Panel Derecho: Visor de la Imagen Informativa (7 columnas) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-xs flex flex-col space-y-4 sticky top-24">
          {selectedReagent ? (
            <>
              {/* Encabezado del visor */}
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-extrabold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-lg border border-slate-200">
                      {selectedReagent.categoria}
                    </span>
                    {selectedReagent.formula && (
                      <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                        {selectedReagent.formula}
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
                    {selectedReagent.nombre}
                  </h2>
                </div>

                {/* Acciones directas (Subir foto individual / Abrir en Drive / Zoom) */}
                <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                  <button
                    id="btn-upload-single-photo"
                    onClick={() => singleImageInputRef.current?.click()}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
                    title="Cargar o reemplazar foto para este reactivo"
                  >
                    <Camera className="w-3.5 h-3.5 text-teal-600" />
                    <span>Cambiar Foto</span>
                  </button>

                  {activeDriveUrl && (
                    <a
                      id="btn-open-drive-direct"
                      href={activeDriveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Abrir en Drive</span>
                    </a>
                  )}
                  <div className="flex items-center bg-slate-100 rounded-xl p-0.5">
                    <button
                      onClick={() => setZoomLevel((z) => Math.min(z + 0.2, 2.5))}
                      className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-colors"
                      title="Acercar"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setZoomLevel((z) => Math.max(z - 0.2, 0.6))}
                      className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-colors"
                      title="Alejar"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Contenedor de la Imagen Informativa */}
              <div className="w-full aspect-[4/3] bg-slate-900 rounded-2xl overflow-hidden flex items-center justify-center p-3 relative select-none">
                <div
                  className="transition-transform duration-150 ease-out max-h-full max-w-full flex items-center justify-center"
                  style={{ transform: `scale(${zoomLevel})` }}
                >
                  <img
                    src={activeDirectUrl}
                    alt={selectedReagent.nombre}
                    referrerPolicy="no-referrer"
                    className="max-h-[380px] max-w-full object-contain rounded-lg shadow-xl"
                    onError={(e) => {
                      // Fallback visual si no carga
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              </div>

              {/* Ficha rápida de detalles */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
                {selectedReagent.cas && (
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
                    <span className="text-[10px] font-bold text-slate-400 block">NÚMERO CAS</span>
                    <span className="font-mono font-bold text-slate-800">{selectedReagent.cas}</span>
                  </div>
                )}
                {selectedReagent.ubicacion && (
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
                    <span className="text-[10px] font-bold text-slate-400 block">UBICACIÓN</span>
                    <span className="font-semibold text-slate-800 truncate block">{selectedReagent.ubicacion}</span>
                  </div>
                )}
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 col-span-2 sm:col-span-1">
                  <span className="text-[10px] font-bold text-slate-400 block">ARCHIVO VINCULADO</span>
                  <span className="font-mono text-[11px] text-teal-800 truncate block font-semibold" title={selectedReagent.imageUrl}>
                    {selectedReagent.imageUrl.startsWith('data:') ? 'Foto personalizada cargada' : selectedReagent.imageUrl}
                  </span>
                </div>
              </div>

              {/* Precauciones / Riesgos */}
              {selectedReagent.precauciones && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/70 text-xs text-amber-900 space-y-0.5">
                  <span className="font-bold flex items-center gap-1 text-amber-950">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    Precauciones de Seguridad:
                  </span>
                  <p className="leading-relaxed font-medium">{selectedReagent.precauciones}</p>
                </div>
              )}
            </>
          ) : (
            <div className="py-24 text-center text-slate-400">
              <p className="text-sm font-semibold">Selecciona un reactivo de la lista para observar su ficha.</p>
            </div>
          )}
        </div>
      </main>

      {/* 4. Pie de página sencillo con ayuda y descarga de plantilla */}
      <footer className="bg-white border-t border-slate-200 py-4 px-4 sm:px-6 mt-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            ¿Tienes un archivo con fotos? Haz clic en{' '}
            <strong className="text-teal-700">"Cargar mi CSV"</strong> arriba para sincronizar tu catálogo.
          </div>
          <button
            onClick={handleDownloadSample}
            className="text-teal-600 hover:text-teal-800 font-bold underline inline-flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            Descargar plantilla .CSV de ejemplo
          </button>
        </div>
      </footer>
    </div>
  );
}
