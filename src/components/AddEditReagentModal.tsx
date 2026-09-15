import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  FlaskConical,
  Link2,
  Check,
  AlertCircle,
  UploadCloud,
  Download,
  FileCode,
  Image as ImageIcon,
  Sparkles,
  ShieldAlert,
  AlertTriangle,
  Building2,
  MapPin,
  Eye,
  FileText,
  Plus,
  Trash2,
} from 'lucide-react';
import { ReagentItem } from '../types';
import {
  extractDriveFileId,
  getDirectImageUrl,
} from '../utils/driveUrlHelper';
import {
  SGA_PICTOGRAMS,
  COMMON_H_PHRASES,
  COMMON_P_PHRASES,
} from '../utils/sgaConstants';
import { SgaPictogramIcon } from './SgaPictogramIcon';
import { SgaLabelCard } from './SgaLabelCard';

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

export const AddEditReagentModal: React.FC<AddEditReagentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  existingCategories,
}) => {
  // Navigation Tabs inside modal
  const [activeTab, setActiveTab] = useState<'sga' | 'image' | 'preview'>('sga');

  // Identificación del Producto
  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState('Ácidos');
  const [customCategoria, setCustomCategoria] = useState('');
  const [formula, setFormula] = useState('');
  const [cas, setCas] = useState('');
  const [pureza, setPureza] = useState('');
  const [proveedor, setProveedor] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [temperatura, setTemperatura] = useState('');
  const [carpetaDrive, setCarpetaDrive] = useState('');
  const [descripcion, setDescripcion] = useState('');

  // Clasificación SGA / GHS
  const [palabraAdvertencia, setPalabraAdvertencia] = useState<'PELIGRO' | 'ATENCIÓN' | 'SIN_PALABRA'>('PELIGRO');
  const [selectedPictos, setSelectedPictos] = useState<string[]>([]);
  const [selectedFrasesH, setSelectedFrasesH] = useState<string[]>([]);
  const [selectedFrasesP, setSelectedFrasesP] = useState<string[]>([]);
  const [customH, setCustomH] = useState('');
  const [customP, setCustomP] = useState('');
  const [precauciones, setPrecauciones] = useState('');

  // Fotografía / Etiqueta del Envase
  const [imageMode, setImageMode] = useState<'upload' | 'link'>('upload');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFileName, setImageFileName] = useState('');
  const [uploadedBlobUrl, setUploadedBlobUrl] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewError, setPreviewError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setPureza(initialData.pureza || '');
      setProveedor(initialData.proveedor || '');
      setUbicacion(initialData.ubicacion || '');
      setTemperatura(initialData.temperaturaAlmacenamiento || '');
      setCarpetaDrive(initialData.carpetaDrive || '');
      setDescripcion(initialData.descripcion || '');
      setPrecauciones(initialData.precauciones || '');

      // SGA
      if (initialData.palabraAdvertencia === 'ATENCIÓN' || initialData.palabraAdvertencia === 'SIN_PALABRA') {
        setPalabraAdvertencia(initialData.palabraAdvertencia as any);
      } else {
        setPalabraAdvertencia('PELIGRO');
      }

      if (initialData.pictogramasSga && initialData.pictogramasSga.length > 0) {
        setSelectedPictos(initialData.pictogramasSga);
      } else if (initialData.peligro && initialData.peligro.length > 0) {
        // Mapear desde array antiguo
        const mapped: string[] = [];
        initialData.peligro.forEach((p) => {
          const l = p.toLowerCase();
          if (l.includes('inflam')) mapped.push('GHS02');
          else if (l.includes('corros')) mapped.push('GHS05');
          else if (l.includes('tóxic') || l.includes('toxic')) mapped.push('GHS06');
          else if (l.includes('irrit') || l.includes('nociv')) mapped.push('GHS07');
          else if (l.includes('combur') || l.includes('oxidan')) mapped.push('GHS03');
          else if (l.includes('ambient') || l.includes('ecotox')) mapped.push('GHS09');
          else if (l.includes('salud') || l.includes('cancer')) mapped.push('GHS08');
          else if (l.includes('explos')) mapped.push('GHS01');
          else if (l.includes('gas')) mapped.push('GHS04');
        });
        setSelectedPictos(Array.from(new Set(mapped)));
      } else {
        setSelectedPictos([]);
      }

      setSelectedFrasesH(initialData.frasesH || []);
      setSelectedFrasesP(initialData.frasesP || []);

      setImageUrl(initialData.imageUrl || '');
      setImageFileName(initialData.imageUrl || '');

      if (initialData.imageUrl?.startsWith('http') || initialData.imageUrl?.includes('drive.google.com')) {
        setImageMode('link');
      } else {
        setImageMode('upload');
      }
    } else {
      // Default blank
      setNombre('');
      setCategoria('Ácidos');
      setCustomCategoria('');
      setFormula('');
      setCas('');
      setPureza('');
      setProveedor('');
      setUbicacion('');
      setTemperatura('');
      setCarpetaDrive('');
      setDescripcion('');
      setPrecauciones('');
      setPalabraAdvertencia('PELIGRO');
      setSelectedPictos(['GHS05']);
      setSelectedFrasesH(['H314: Provoca quemaduras graves en la piel y lesiones oculares graves']);
      setSelectedFrasesP(['P280: Llevar guantes, prendas, gafas y máscara de protección.']);
      setImageUrl('');
      setImageFileName('');
      setUploadedBlobUrl(null);
      setUploadedFile(null);
      setImageMode('upload');
    }
    setPreviewError(false);
    setActiveTab('sga');
  }, [initialData, isOpen]);

  // Actualizar sugerencia de archivo
  const handleNombreChange = (newName: string) => {
    setNombre(newName);
    if (!initialData && (!imageFileName || imageFileName.includes('.jpeg') || imageFileName.includes('.png'))) {
      const sanitized = newName.trim().toUpperCase() || 'REACTIVO';
      const ext = uploadedFile ? (uploadedFile.name.endsWith('.png') ? '.png' : '.jpeg') : '.jpeg';
      setImageFileName(`${sanitized}${ext}`);
    }
  };

  const handleLocalImageSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpeg';
    const cleanExt = extension === 'jpg' ? 'jpeg' : extension;
    const suggestedName = nombre.trim() ? `${nombre.trim().toUpperCase()}.${cleanExt}` : file.name;
    setImageFileName(suggestedName);

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setImageUrl(dataUrl);
      setUploadedBlobUrl(dataUrl);
      setPreviewError(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDownloadRenamedImage = () => {
    if (!imageUrl) return;
    const targetName = imageFileName.trim() || `${nombre.trim().toUpperCase() || 'REACTIVO'}.jpeg`;
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = targetName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const togglePicto = (pictoCode: string) => {
    if (selectedPictos.includes(pictoCode)) {
      setSelectedPictos(selectedPictos.filter((p) => p !== pictoCode));
    } else {
      setSelectedPictos([...selectedPictos, pictoCode]);
    }
  };

  const toggleFraseH = (hCode: string, hText: string) => {
    const fullText = `${hCode}: ${hText}`;
    if (selectedFrasesH.some((f) => f.startsWith(hCode))) {
      setSelectedFrasesH(selectedFrasesH.filter((f) => !f.startsWith(hCode)));
    } else {
      setSelectedFrasesH([...selectedFrasesH, fullText]);
    }
  };

  const toggleFraseP = (pCode: string, pText: string) => {
    const fullText = `${pCode}: ${pText}`;
    if (selectedFrasesP.some((f) => f.startsWith(pCode))) {
      setSelectedFrasesP(selectedFrasesP.filter((f) => !f.startsWith(pCode)));
    } else {
      setSelectedFrasesP([...selectedFrasesP, fullText]);
    }
  };

  const addCustomH = () => {
    if (!customH.trim()) return;
    setSelectedFrasesH([...selectedFrasesH, customH.trim()]);
    setCustomH('');
  };

  const addCustomP = () => {
    if (!customP.trim()) return;
    setSelectedFrasesP([...selectedFrasesP, customP.trim()]);
    setCustomP('');
  };

  if (!isOpen) return null;

  const directPreviewUrl = getDirectImageUrl(imageUrl);

  // Armar el reactivo provisional para previsualizar la etiqueta SGA
  const draftReagent: ReagentItem = {
    id: initialData?.id || 'temp-preview',
    nombre: nombre.trim() || 'NOMBRE DEL REACTIVO',
    categoria: categoria === 'Otro' ? customCategoria || 'General' : categoria,
    formula: formula.trim() || undefined,
    cas: cas.trim() || undefined,
    pureza: pureza.trim() || undefined,
    proveedor: proveedor.trim() || undefined,
    ubicacion: ubicacion.trim() || undefined,
    imageUrl: imageUrl || imageFileName || 'reactivo.jpeg',
    temperaturaAlmacenamiento: temperatura.trim() || undefined,
    palabraAdvertencia,
    pictogramasSga: selectedPictos,
    frasesH: selectedFrasesH,
    frasesP: selectedFrasesP,
    precauciones: precauciones.trim() || undefined,
    descripcion: descripcion.trim() || undefined,
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    const finalCategory =
      categoria === 'Otro' ? customCategoria.trim() || 'General' : categoria;

    const finalImageUrl =
      imageUrl.trim() || imageFileName.trim() || `${nombre.trim().toUpperCase()}.jpeg`;

    // Mapeo retrocompatible para 'peligro'
    const legacyPeligro = selectedPictos.map((code) => {
      const found = SGA_PICTOGRAMS.find((p) => p.code === code);
      return found ? found.nombre : code;
    });

    const item: ReagentItem = {
      id: initialData?.id || `reag-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      nombre: nombre.trim(),
      categoria: finalCategory,
      formula: formula.trim() || undefined,
      cas: cas.trim() || undefined,
      ubicacion: ubicacion.trim() || undefined,
      carpetaDrive: carpetaDrive.trim() || undefined,
      imageUrl: finalImageUrl,
      peligro: legacyPeligro.length > 0 ? legacyPeligro : undefined,
      pureza: pureza.trim() || undefined,
      proveedor: proveedor.trim() || undefined,
      temperaturaAlmacenamiento: temperatura.trim() || undefined,
      descripcion: descripcion.trim() || undefined,
      precauciones: precauciones.trim() || undefined,
      palabraAdvertencia,
      pictogramasSga: selectedPictos,
      frasesH: selectedFrasesH.length > 0 ? selectedFrasesH : undefined,
      frasesP: selectedFrasesP.length > 0 ? selectedFrasesP : undefined,
      fechaRegistro: initialData?.fechaRegistro || new Date().toISOString().split('T')[0],
    };

    onSave(item);
    onClose();
  };

  const allCategoryOptions = Array.from(
    new Set([...COMMON_CATEGORIES, ...existingCategories])
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Encabezado Estándar SGA */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight">
                  {initialData ? 'Editar Ficha y Etiqueta SGA' : 'Nuevo Reactivo (Norma SGA / GHS)'}
                </h2>
                <span className="text-[10px] font-bold bg-teal-900 text-teal-300 px-2 py-0.5 rounded border border-teal-700">
                  SGA Oficial
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Formulario estandarizado con pictogramas GHS, frases H/P y gestión de etiquetas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pestañas de Navegación del Formulario */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50 px-6 gap-2 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('sga')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'sga'
                ? 'border-teal-600 text-teal-700 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>1. Datos &amp; Clasificación SGA</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('image')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'image'
                ? 'border-teal-600 text-teal-700 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>2. Foto / Etiqueta ({imageUrl ? '1 cargada' : '0'})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'preview'
                ? 'border-teal-600 text-teal-700 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>3. Vista Previa Etiqueta SGA</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* TAB 1: DATOS & CLASIFICACIÓN SGA */}
          {activeTab === 'sga' && (
            <div className="space-y-5">
              {/* Sección 1: Identificación del Producto */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                  <FlaskConical className="w-4 h-4 text-teal-600" />
                  Identificación del Producto Químico
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nombre Químico Oficial / Comercial *
                    </label>
                    <input
                      type="text"
                      required
                      value={nombre}
                      onChange={(e) => handleNombreChange(e.target.value)}
                      placeholder="ej. ÁCIDO CLORHÍDRICO 37%"
                      className="w-full px-3 py-2 text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Categoría / Familia
                    </label>
                    <select
                      value={categoria}
                      onChange={(e) => setCategoria(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none font-medium"
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

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Fórmula Química
                    </label>
                    <input
                      type="text"
                      value={formula}
                      onChange={(e) => setFormula(e.target.value)}
                      placeholder="ej. HCl o H2SO4"
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
                      placeholder="ej. 7647-01-0"
                      className="w-full px-3 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Pureza / Grado
                    </label>
                    <input
                      type="text"
                      value={pureza}
                      onChange={(e) => setPureza(e.target.value)}
                      placeholder="ej. ≥37% P.A. / USP"
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Proveedor / Marca
                    </label>
                    <input
                      type="text"
                      value={proveedor}
                      onChange={(e) => setProveedor(e.target.value)}
                      placeholder="ej. Merck, PanReac, Sigma"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Ubicación en Laboratorio
                    </label>
                    <input
                      type="text"
                      value={ubicacion}
                      onChange={(e) => setUbicacion(e.target.value)}
                      placeholder="ej. Armario Ácidos A1"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Temp. Almacenamiento
                    </label>
                    <input
                      type="text"
                      value={temperatura}
                      onChange={(e) => setTemperatura(e.target.value)}
                      placeholder="ej. 15-25°C • Lugar seco"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Sección 2: Clasificación SGA / GHS Oficial */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-red-600" />
                    Clasificación SGA / GHS (Rombo Rojo y Advertencia)
                  </h4>

                  {/* Selector de Palabra de Advertencia */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-600">Palabra de Advertencia:</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setPalabraAdvertencia('PELIGRO')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all ${
                          palabraAdvertencia === 'PELIGRO'
                            ? 'bg-red-700 text-white shadow-2xs'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                      >
                        PELIGRO
                      </button>
                      <button
                        type="button"
                        onClick={() => setPalabraAdvertencia('ATENCIÓN')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all ${
                          palabraAdvertencia === 'ATENCIÓN'
                            ? 'bg-amber-600 text-white shadow-2xs'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                      >
                        ATENCIÓN
                      </button>
                      <button
                        type="button"
                        onClick={() => setPalabraAdvertencia('SIN_PALABRA')}
                        className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                          palabraAdvertencia === 'SIN_PALABRA'
                            ? 'bg-slate-700 text-white'
                            : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                        }`}
                      >
                        Sin palabra
                      </button>
                    </div>
                  </div>
                </div>

                {/* 9 Pictogramas SGA Interactivos con Rombo Rojo */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Selecciona los Pictogramas de Peligro SGA Aplicables:
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-9 gap-2">
                    {SGA_PICTOGRAMS.map((pic) => {
                      const isSelected = selectedPictos.includes(pic.code);
                      return (
                        <button
                          key={pic.code}
                          type="button"
                          onClick={() => togglePicto(pic.code)}
                          className={`flex flex-col items-center justify-between p-2 rounded-xl transition-all border text-center ${
                            isSelected
                              ? 'bg-red-50 border-red-500 ring-2 ring-red-400 shadow-xs'
                              : 'bg-white border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <SgaPictogramIcon code={pic.code} size="md" />
                          <span className="text-[9px] font-bold text-slate-800 leading-tight mt-1 truncate max-w-full">
                            {pic.nombre}
                          </span>
                          <span
                            className={`text-[9px] font-black mt-0.5 px-1 py-0.2 rounded ${
                              isSelected ? 'bg-red-600 text-white' : 'text-slate-400'
                            }`}
                          >
                            {isSelected ? '✓ ' + pic.code : pic.code}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Frases H (Indicaciones de peligro) */}
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <span className="text-red-600 font-black">Indicaciones de Peligro (Frases H):</span>
                    </label>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {selectedFrasesH.length} seleccionadas
                    </span>
                  </div>

                  {/* Sugerencias Rápidas Frases H */}
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1.5 bg-white rounded-xl border border-slate-200">
                    {COMMON_H_PHRASES.map((h) => {
                      const isSelected = selectedFrasesH.some((f) => f.startsWith(h.code));
                      return (
                        <button
                          key={h.code}
                          type="button"
                          onClick={() => toggleFraseH(h.code, h.text)}
                          className={`px-2 py-1 text-[11px] rounded-lg font-medium transition-all ${
                            isSelected
                              ? 'bg-red-700 text-white font-bold shadow-2xs'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {isSelected ? '✓ ' : '+ '}
                          <strong>{h.code}</strong>: {h.text.slice(0, 24)}...
                        </button>
                      );
                    })}
                  </div>

                  {/* Frase H personalizada */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customH}
                      onChange={(e) => setCustomH(e.target.value)}
                      placeholder="Agregar otra frase H (ej. H314: Provoca quemaduras...)"
                      className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <button
                      type="button"
                      onClick={addCustomH}
                      className="px-3 py-1.5 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl"
                    >
                      + Añadir H
                    </button>
                  </div>
                </div>

                {/* Frases P (Consejos de prudencia) */}
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <span className="text-teal-700 font-black">Consejos de Prudencia (Frases P):</span>
                    </label>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {selectedFrasesP.length} seleccionadas
                    </span>
                  </div>

                  {/* Sugerencias Rápidas Frases P */}
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1.5 bg-white rounded-xl border border-slate-200">
                    {COMMON_P_PHRASES.map((p) => {
                      const isSelected = selectedFrasesP.some((f) => f.startsWith(p.code));
                      return (
                        <button
                          key={p.code}
                          type="button"
                          onClick={() => toggleFraseP(p.code, p.text)}
                          className={`px-2 py-1 text-[11px] rounded-lg font-medium transition-all ${
                            isSelected
                              ? 'bg-teal-700 text-white font-bold shadow-2xs'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {isSelected ? '✓ ' : '+ '}
                          <strong>{p.code}</strong>: {p.text.slice(0, 24)}...
                        </button>
                      );
                    })}
                  </div>

                  {/* Frase P personalizada */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customP}
                      onChange={(e) => setCustomP(e.target.value)}
                      placeholder="Agregar otro consejo P (ej. P280: Llevar guantes y gafas...)"
                      className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <button
                      type="button"
                      onClick={addCustomP}
                      className="px-3 py-1.5 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl"
                    >
                      + Añadir P
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FOTOGRAFÍA / ETIQUETA DEL ENVASE */}
          {activeTab === 'image' && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-teal-600" />
                      Fotografía / Etiqueta del Envase Físico
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Sube la foto para verla de inmediato y descargarla con el nombre adecuado para tu repositorio GitHub.
                    </p>
                  </div>

                  {/* Modo Selector */}
                  <div className="flex items-center bg-slate-200/80 p-0.5 rounded-lg text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setImageMode('upload')}
                      className={`px-3 py-1 rounded-md transition-all ${
                        imageMode === 'upload'
                          ? 'bg-white text-slate-900 shadow-2xs font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Subir y Renombrar
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageMode('link')}
                      className={`px-3 py-1 rounded-md transition-all ${
                        imageMode === 'link'
                          ? 'bg-white text-slate-900 shadow-2xs font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Enlace Web / Drive
                    </button>
                  </div>
                </div>

                {imageMode === 'upload' ? (
                  <div className="space-y-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLocalImageSelected}
                      className="hidden"
                    />

                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-teal-300 hover:border-teal-500 bg-teal-50/40 hover:bg-teal-50/80 rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2"
                    >
                      <UploadCloud className="w-8 h-8 text-teal-600" />
                      <span className="text-sm font-bold text-teal-950">
                        Haz clic aquí para seleccionar o arrastrar la foto/etiqueta
                      </span>
                      <span className="text-xs text-slate-500">
                        Formatos soportados: .jpeg, .jpg, .png, .webp
                      </span>
                    </div>

                    {/* Nombre del archivo estandarizado para GitHub */}
                    <div className="space-y-1 bg-white p-3 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700 flex items-center gap-1">
                          <FileCode className="w-4 h-4 text-slate-500" />
                          Nombre de archivo para GitHub (carpeta public/reactivos/):
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const sanitized = nombre.trim().toUpperCase() || 'REACTIVO';
                            setImageFileName(`${sanitized}.jpeg`);
                          }}
                          className="text-teal-600 hover:text-teal-800 font-semibold inline-flex items-center gap-1"
                        >
                          <Sparkles className="w-3.5 h-3.5" /> Auto-formato
                        </button>
                      </div>
                      <input
                        type="text"
                        value={imageFileName}
                        onChange={(e) => setImageFileName(e.target.value)}
                        placeholder="ej. ÁCIDO CLORHÍDRICO 37%.jpeg"
                        className="w-full px-3 py-2 text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none text-slate-900"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 bg-white p-3 rounded-xl border border-slate-200">
                    <label className="block text-xs font-bold text-slate-700">
                      Enlace de Google Drive o URL Directa
                    </label>
                    <input
                      type="text"
                      value={imageUrl}
                      onChange={(e) => {
                        setImageUrl(e.target.value);
                        setPreviewError(false);
                      }}
                      placeholder="https://drive.google.com/file/d/... o https://..."
                      className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                )}

                {/* Previsualización y Descargador */}
                {imageUrl && (
                  <div className="p-3 bg-white rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <div className="w-16 h-16 bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center shrink-0 border border-slate-800">
                        {previewError ? (
                          <AlertCircle className="w-6 h-6 text-amber-400" />
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
                      <div className="text-xs">
                        <span className="font-extrabold text-slate-900 block truncate max-w-[280px]">
                          {imageFileName || 'Foto asignada'}
                        </span>
                        <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 mt-0.5">
                          <Check className="w-3.5 h-3.5" /> Vinculada y lista para mostrar
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleDownloadRenamedImage}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-colors shadow-2xs"
                    >
                      <Download className="w-4 h-4 text-teal-400" />
                      <span>Descargar Foto Renombrada</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: VISTA PREVIA DE ETIQUETA SGA ESTÁNDAR */}
          {activeTab === 'preview' && (
            <div className="space-y-3">
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-900 flex items-center justify-between">
                <div>
                  <strong>Vista Previa en Vivo:</strong> Esta etiqueta refleja exactamente la norma SGA / GHS con sus datos, pictogramas y advertencias.
                </div>
              </div>

              <SgaLabelCard reagent={draftReagent} showActions={true} />
            </div>
          )}

          {/* Footer Submit Bar */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg"
            >
              Cancelar
            </button>

            <div className="flex items-center gap-2">
              {activeTab !== 'preview' ? (
                <button
                  type="button"
                  onClick={() => setActiveTab(activeTab === 'sga' ? 'image' : 'preview')}
                  className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Siguiente paso &rarr;
                </button>
              ) : null}

              <button
                type="submit"
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{initialData ? 'Guardar Cambios' : 'Añadir al Catálogo'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
