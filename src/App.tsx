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
  Plus,
  ShieldAlert,
  Printer,
  Sparkles,
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
import { exportToExcel } from './utils/excelExporter';
import { downloadReagentImage } from './utils/imageDownloader';
import { AddEditReagentModal } from './components/AddEditReagentModal';
import { CasdLogo } from './components/CasdLogo';

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

  // Modales
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingReagent, setEditingReagent] = useState<ReagentItem | null>(null);
  const [viewerViewMode, setViewerViewMode] = useState<'photo' | 'sga'>('photo');
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

          <div className="flex items-center gap-2 flex-wrap justify-end">
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
              id="btn-add-reagent-header"
              onClick={() => {
                setEditingReagent(null);
                setIsAddModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-xs transition-colors"
              title="Registrar manualmente un nuevo reactivo"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Reactivo</span>
            </button>

            <button
              id="btn-upload-images-batch"
              onClick={() => imagesInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-xs transition-colors"
              title="Selecciona una o varias fotos desde tu computador"
            >
              <ImageIcon className="w-4 h-4 text-teal-400" />
              <span>Subir Fotos</span>
            </button>

            <button
              id="btn-upload-csv-direct"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-xs transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>Cargar CSV</span>
            </button>

            <button
              id="btn-export-excel"
              onClick={() => {
                exportToExcel(reagents);
                showToast('✓ Descargando archivo Excel con las fichas completas.');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl transition-colors shadow-xs"
              title="Descargar listado completo formateado en Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Descargar Excel</span>
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
              title="Restaurar lista oficial de 70 reactivos"
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

        {/* Panel Derecho: Visor Directo de la Etiqueta (7 columnas) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-xs flex flex-col space-y-4 sticky top-24">
          {selectedReagent ? (
            <>
              {/* Encabezado del visor de etiqueta */}
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-extrabold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-lg border border-slate-200">
                      {selectedReagent.categoria}
                    </span>
                    {selectedReagent.formula && (
                      <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                        {selectedReagent.formula}
                      </span>
                    )}
                    {selectedReagent.pureza && (
                      <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {selectedReagent.pureza}
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
                    {selectedReagent.nombre}
                  </h2>
                </div>

                {/* Acciones principales: Descargar Etiqueta y opciones */}
                <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                  {/* Botón Principal: DESCARGAR ETIQUETA */}
                  <button
                    id="btn-download-selected-label"
                    onClick={async () => {
                      const success = await downloadReagentImage(activeDirectUrl, selectedReagent.nombre);
                      if (success) {
                        showToast(`✓ Descargando etiqueta de "${selectedReagent.nombre}"...`);
                      } else {
                        showToast(`Abriendo archivo para descarga...`);
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl transition-all shadow-xs"
                    title="Descargar la imagen o etiqueta de este reactivo"
                  >
                    <Download className="w-4 h-4 text-emerald-100" />
                    <span>Descargar Etiqueta</span>
                  </button>

                  <button
                    id="btn-upload-single-photo"
                    onClick={() => singleImageInputRef.current?.click()}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
                    title="Cargar o cambiar la foto de la etiqueta de este reactivo"
                  >
                    <Camera className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Cambiar Foto</span>
                  </button>

                  {activeDriveUrl && (
                    <a
                      id="btn-open-drive-direct"
                      href={activeDriveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors"
                      title="Abrir archivo en Google Drive"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Drive</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Barra de Controles de Zoom para la Etiqueta (Ampliar / Alejar / Restablecer) */}
              <div className="flex items-center justify-between gap-2 bg-slate-50 px-3 py-2 rounded-2xl border border-slate-200/80">
                <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-emerald-600" />
                  <span>Etiqueta del Envase</span>
                </span>

                <div className="flex items-center gap-1 bg-white rounded-xl p-1 border border-slate-200 shadow-2xs">
                  <button
                    id="btn-zoom-out"
                    onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.5))}
                    className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
                    title="Alejar (-)"
                  >
                    <ZoomOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Alejar</span>
                  </button>

                  <button
                    id="btn-zoom-reset"
                    onClick={() => setZoomLevel(1)}
                    className="px-2 py-1 text-xs font-mono font-bold text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                    title="Restablecer tamaño original (100%)"
                  >
                    {Math.round(zoomLevel * 100)}%
                  </button>

                  <button
                    id="btn-zoom-in"
                    onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 3.0))}
                    className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
                    title="Ampliar (+)"
                  >
                    <ZoomIn className="w-4 h-4" />
                    <span className="hidden sm:inline">Ampliar</span>
                  </button>

                  <button
                    id="btn-zoom-reset-icon"
                    onClick={() => setZoomLevel(1)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Restablecer vista"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Lienzo de Visualización de la Etiqueta */}
              <div className="w-full min-h-[380px] max-h-[560px] bg-slate-950 rounded-2xl overflow-auto flex items-center justify-center p-4 relative select-none border border-slate-800 shadow-inner">
                <div
                  className="transition-transform duration-150 ease-out max-h-full max-w-full flex items-center justify-center origin-center"
                  style={{ transform: `scale(${zoomLevel})` }}
                >
                  <img
                    src={activeDirectUrl}
                    alt={`Etiqueta de ${selectedReagent.nombre}`}
                    referrerPolicy="no-referrer"
                    className="max-h-[460px] max-w-full object-contain rounded-lg shadow-2xl transition-all"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>

                {/* Botón flotante para guardar o descargar imagen en un toque */}
                <button
                  id="btn-floating-download"
                  onClick={async () => {
                    await downloadReagentImage(activeDirectUrl, selectedReagent.nombre);
                    showToast(`✓ Descarga iniciada para ${selectedReagent.nombre}`);
                  }}
                  className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/90 hover:bg-slate-900 text-white rounded-xl text-xs font-bold backdrop-blur-md border border-slate-700 shadow-lg transition-all hover:scale-105"
                  title="Descargar archivo de imagen en tu equipo"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Descargar</span>
                </button>
              </div>
            </>
          ) : (
            /* Estado Inicial: Sin reactivo seleccionado, mostrando identidad CASD */
            <div className="py-20 px-6 text-center flex flex-col items-center justify-center space-y-4">
              <CasdLogo size={96} className="opacity-90 hover:scale-105 transition-transform" />
              <div className="max-w-md">
                <h3 className="text-lg font-black text-slate-900">
                  Laboratorio de Química CASD
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  I.E. José Prudencio Padilla • Barrancabermeja
                </p>
                <div className="mt-6 p-3 bg-emerald-50 rounded-2xl border border-emerald-100 text-xs font-semibold text-emerald-800 inline-block">
                  👈 Selecciona un reactivo de la lista para ver, ampliar y descargar su etiqueta.
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Pie de página con identidad CASD */}
      <footer className="bg-white border-t border-slate-200 py-4 px-4 sm:px-6 mt-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CasdLogo size={24} />
            <span>
              <strong>I.E. CASD José Prudencio Padilla</strong> — Laboratorio de Química • Barrancabermeja
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => exportToExcel(reagents)}
              className="text-emerald-700 hover:text-emerald-900 font-bold underline inline-flex items-center gap-1"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Descargar Catálogo Excel (.xlsx)
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={() => exportToCsv(reagents)}
              className="text-slate-600 hover:text-slate-900 font-medium underline inline-flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              Descargar CSV
            </button>
          </div>
        </div>
      </footer>

      {/* Modal para Registrar / Editar Reactivo */}
      <AddEditReagentModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingReagent(null);
        }}
        initialData={editingReagent}
        existingCategories={categories.filter((c) => c !== 'Todos')}
        onSave={(newReagent) => {
          setReagents((prev) => {
            const exists = prev.some((r) => r.id === newReagent.id);
            if (exists) {
              return prev.map((r) => (r.id === newReagent.id ? newReagent : r));
            }
            return [newReagent, ...prev];
          });
          setSelectedReagent(newReagent);
          setEditingReagent(null);
          showToast(`✓ Reactivo "${newReagent.nombre}" guardado con éxito.`);
        }}
      />
    </div>
  );
}
