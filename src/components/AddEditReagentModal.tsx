import React, { useState, useEffect } from 'react';
import {
  X,
  FlaskConical,
  Link2,
  Check,
  AlertCircle,
  Eye,
  Plus,
} from 'lucide-react';
import { ReagentItem } from '../types';
import {
  extractDriveFileId,
  getDirectImageUrl,
  getUrlSourceType,
} from '../utils/driveUrlHelper';

interface AddEditReagentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (reagent: ReagentItem) => void;
  initialData?: ReagentItem | null;
  existingCategories: string[];
}

const COMMON_CATEGORIES = [
  'Ácidos',
  'Bases',
  'Solventes Orgánicos',
  'Sales & Oxidantes',
  'Indicadores',
  'Reactivos Analíticos',
  'Buffer & Estándares',
  'Otros',
];

const GHS_OPTIONS = [
  'Corrosivo',
  'Inflamable',
  'Tóxico',
  'Irritante',
  'Comburente',
  'Peligro Ambiental',
  'Explosivo',
  'Gas Comprimido',
];

export const AddEditReagentModal: React.FC<AddEditReagentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  existingCategories,
}) => {
  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState('Ácidos');
  const [customCategoria, setCustomCategoria] = useState('');
  const [formula, setFormula] = useState('');
  const [cas, setCas] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [carpetaDrive, setCarpetaDrive] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedPeligros, setSelectedPeligros] = useState<string[]>([]);
  const [pureza, setPureza] = useState('');
  const [temperatura, setTemperatura] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precauciones, setPrecauciones] = useState('');

  const [previewError, setPreviewError] = useState(false);

  useEffect(() => {
    if (initialData) {
      setNombre(initialData.nombre);
      if (COMMON_CATEGORIES.includes(initialData.categoria)) {
        setCategoria(initialData.categoria);
        setCustomCategoria('');
      } else {
        setCategoria('Otro');
        setCustomCategoria(initialData.categoria);
      }
      setFormula(initialData.formula || '');
      setCas(initialData.cas || '');
      setUbicacion(initialData.ubicacion || '');
      setCarpetaDrive(initialData.carpetaDrive || '');
      setImageUrl(initialData.imageUrl || '');
      setSelectedPeligros(initialData.peligro || []);
      setPureza(initialData.pureza || '');
      setTemperatura(initialData.temperaturaAlmacenamiento || '');
      setDescripcion(initialData.descripcion || '');
      setPrecauciones(initialData.precauciones || '');
    } else {
      // Default blank
      setNombre('');
      setCategoria('Ácidos');
      setCustomCategoria('');
      setFormula('');
      setCas('');
      setUbicacion('');
      setCarpetaDrive('');
      setImageUrl('');
      setSelectedPeligros([]);
      setPureza('');
      setTemperatura('');
      setDescripcion('');
      setPrecauciones('');
    }
    setPreviewError(false);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const detectedDriveId = extractDriveFileId(imageUrl);
  const directPreviewUrl = getDirectImageUrl(imageUrl);
  const sourceType = getUrlSourceType(imageUrl);

  const togglePeligro = (tag: string) => {
    if (selectedPeligros.includes(tag)) {
      setSelectedPeligros(selectedPeligros.filter((p) => p !== tag));
    } else {
      setSelectedPeligros([...selectedPeligros, tag]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    const finalCategory =
      categoria === 'Otro' ? customCategoria.trim() || 'General' : categoria;

    const item: ReagentItem = {
      id: initialData?.id || `reag-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      nombre: nombre.trim(),
      categoria: finalCategory,
      formula: formula.trim() || undefined,
      cas: cas.trim() || undefined,
      ubicacion: ubicacion.trim() || undefined,
      carpetaDrive: carpetaDrive.trim() || undefined,
      imageUrl: imageUrl.trim(),
      peligro: selectedPeligros.length > 0 ? selectedPeligros : undefined,
      pureza: pureza.trim() || undefined,
      temperaturaAlmacenamiento: temperatura.trim() || undefined,
      descripcion: descripcion.trim() || undefined,
      precauciones: precauciones.trim() || undefined,
      fechaRegistro: initialData?.fechaRegistro || new Date().toISOString().split('T')[0],
    };

    onSave(item);
    onClose();
  };

  const allCategoryOptions = Array.from(
    new Set([...COMMON_CATEGORIES, ...existingCategories])
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-teal-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center font-bold">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                {initialData ? 'Editar Ficha de Reactivo' : 'Registrar Nuevo Reactivo'}
              </h2>
              <p className="text-xs text-teal-100">
                Enlaza la imagen de Google Drive, GitHub o URL y agrega sus especificaciones
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {/* Nombre & Categoría */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nombre del Reactivo *
              </label>
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="ej. Ácido Clorhídrico 37%"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Categoría / Familia
              </label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              >
                {allCategoryOptions.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="Otro">+ Otra categoría...</option>
              </select>
              {categoria === 'Otro' && (
                <input
                  type="text"
                  value={customCategoria}
                  onChange={(e) => setCustomCategoria(e.target.value)}
                  placeholder="Escribe la nueva categoría"
                  className="mt-2 w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              )}
            </div>
          </div>

          {/* URL de Imagen / Google Drive link */}
          <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5 text-teal-600" />
                Enlace de la Imagen / Archivo de Drive *
              </span>
              {detectedDriveId && (
                <span className="text-[10px] font-mono text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full font-bold">
                  ✓ ID de Drive Detectado: {detectedDriveId.slice(0, 10)}...
                </span>
              )}
            </label>
            <input
              type="text"
              required
              value={imageUrl}
              onChange={(e) => {
                setImageUrl(e.target.value);
                setPreviewError(false);
              }}
              placeholder="https://drive.google.com/file/d/1SAMPLE_ID/view... o https://raw.githubusercontent.com/..."
              className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
            <p className="text-[11px] text-slate-500">
              Pega el enlace de compartir de Google Drive (asegúrate de que tenga permiso público de lectura) o la URL de GitHub.
            </p>

            {/* Quick Live Preview Box */}
            {imageUrl && (
              <div className="mt-2 pt-2 border-t border-slate-200 flex items-center gap-3">
                <div className="w-16 h-14 bg-white rounded-lg border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                  {previewError ? (
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                  ) : (
                    <img
                      src={directPreviewUrl}
                      alt="Previsualización"
                      onError={() => setPreviewError(true)}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain p-1"
                    />
                  )}
                </div>
                <div className="text-xs text-slate-600">
                  {previewError ? (
                    <span className="text-amber-700 font-medium">
                      ⚠️ No se pudo previsualizar directamente. Se habilitará botón para abrir en Drive.
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-medium flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Enlace procesado correctamente
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Formula, CAS, Ubicación */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Fórmula Química
              </label>
              <input
                type="text"
                value={formula}
                onChange={(e) => setFormula(e.target.value)}
                placeholder="ej. H2SO4 o KMnO4"
                className="w-full px-3 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Número CAS
              </label>
              <input
                type="text"
                value={cas}
                onChange={(e) => setCas(e.target.value)}
                placeholder="ej. 7664-93-9"
                className="w-full px-3 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ubicación / Estante
              </label>
              <input
                type="text"
                value={ubicacion}
                onChange={(e) => setUbicacion(e.target.value)}
                placeholder="ej. Armario A1 - Ácidos"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Carpeta Drive & Pureza */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ruta / Carpeta en Drive (Referencia)
              </label>
              <input
                type="text"
                value={carpetaDrive}
                onChange={(e) => setCarpetaDrive(e.target.value)}
                placeholder="ej. Laboratorio/Acidos_Minerales"
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Pureza / Almacenamiento
              </label>
              <input
                type="text"
                value={pureza}
                onChange={(e) => setPureza(e.target.value)}
                placeholder="ej. 98% P.A. • 15-25°C"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>

          {/* GHS Peligros */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Peligros / Clasificación GHS
            </label>
            <div className="flex flex-wrap gap-1.5">
              {GHS_OPTIONS.map((tag) => {
                const isSelected = selectedPeligros.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => togglePeligro(tag)}
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                      isSelected
                        ? 'bg-rose-600 text-white shadow-2xs font-bold'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/80'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Descripción y Precauciones */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Descripción / Observaciones
              </label>
              <textarea
                rows={2}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Descripción física, usos principales o notas de inventario..."
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Precauciones de Seguridad / EPP
              </label>
              <input
                type="text"
                value={precauciones}
                onChange={(e) => setPrecauciones(e.target.value)}
                placeholder="ej. Usar guantes de nitrilo, gafas y trabajar en campana de extracción."
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all"
            >
              {initialData ? 'Guardar Cambios' : 'Añadir al Catálogo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
