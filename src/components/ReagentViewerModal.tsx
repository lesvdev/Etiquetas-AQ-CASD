import React, { useState, useEffect } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Minimize2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Download,
  Printer,
  Copy,
  Check,
  Folder,
  MapPin,
  AlertTriangle,
  Info,
  ShieldAlert,
} from 'lucide-react';
import { ReagentItem } from '../types';
import {
  getDirectImageUrl,
  getDriveThumbnailUrl,
  getDriveViewerUrl,
  getUrlSourceType,
} from '../utils/driveUrlHelper';

interface ReagentViewerModalProps {
  reagent: ReagentItem | null;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}

export const ReagentViewerModal: React.FC<ReagentViewerModalProps> = ({
  reagent,
  onClose,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [copied, setCopied] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [useThumbnailFallback, setUseThumbnailFallback] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Reset controls when reagent changes
  useEffect(() => {
    setZoomLevel(1);
    setRotation(0);
    setImageError(false);
    setUseThumbnailFallback(false);
  }, [reagent?.id]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!reagent) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && hasPrev) onPrev();
      if (e.key === 'ArrowRight' && hasNext) onNext();
      if (e.key === '+' || e.key === '=') setZoomLevel((z) => Math.min(z + 0.25, 3));
      if (e.key === '-') setZoomLevel((z) => Math.max(z - 0.25, 0.5));
      if (e.key === 'r') setRotation((r) => (r + 90) % 360);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [reagent, hasPrev, hasNext, onClose, onPrev, onNext]);

  if (!reagent) return null;

  const directUrl = useThumbnailFallback
    ? getDriveThumbnailUrl(reagent.imageUrl, 1600)
    : getDirectImageUrl(reagent.imageUrl);

  const driveViewerUrl = getDriveViewerUrl(reagent.imageUrl);
  const sourceType = getUrlSourceType(reagent.imageUrl);

  const handleCopyLink = () => {
    const url = driveViewerUrl || reagent.imageUrl;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = directUrl;
    link.download = `ficha_${reagent.nombre.replace(/[^a-z0-9]/gi, '_')}.png`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImageError = () => {
    if (!useThumbnailFallback && sourceType === 'drive') {
      setUseThumbnailFallback(true);
    } else {
      setImageError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 lg:p-6 animate-in fade-in duration-200">
      <div
        className={`bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col transition-all duration-200 w-full ${
          isFullscreen
            ? 'h-full max-w-full'
            : 'max-w-6xl max-h-[92vh] h-[850px]'
        }`}
      >
        {/* Header Bar */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3 truncate mr-4">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-sm">
              {reagent.formula ? reagent.formula.slice(0, 2) : 'Rx'}
            </div>
            <div className="truncate">
              <h2 className="text-base font-extrabold text-white truncate flex items-center gap-2">
                <span>{reagent.nombre}</span>
                {reagent.formula && (
                  <span className="text-xs font-mono font-medium text-teal-300 bg-teal-950/80 px-2 py-0.5 rounded border border-teal-800">
                    {reagent.formula}
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">
                Categoría: <span className="text-slate-200 font-semibold">{reagent.categoria}</span>
                {reagent.cas && ` • CAS: ${reagent.cas}`}
              </p>
            </div>
          </div>

          {/* Quick Top Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Nav Arrows */}
            <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
              <button
                id="btn-modal-prev"
                onClick={onPrev}
                disabled={!hasPrev}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent rounded transition-colors"
                title="Reactivo anterior (Flecha Izquierda)"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                id="btn-modal-next"
                onClick={onNext}
                disabled={!hasNext}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent rounded transition-colors"
                title="Reactivo siguiente (Flecha Derecha)"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Toggle Fullscreen */}
            <button
              id="btn-modal-fullscreen"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors hidden sm:inline-flex"
              title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close */}
            <button
              id="btn-modal-close"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-rose-600/80 rounded-lg transition-colors"
              title="Cerrar visor (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body: Split View (Image Canvas + Info Drawer) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden bg-slate-100">
          {/* Main Stage: Image Viewer with Tools (8 cols) */}
          <div className="lg:col-span-8 flex flex-col min-h-0 bg-slate-900/95 relative">
            {/* Floating Image Toolbar */}
            <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-700 shadow-lg text-white">
              <button
                id="btn-zoom-in"
                onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 3))}
                className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors"
                title="Acercar (+)"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono px-1 font-bold text-slate-300">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                id="btn-zoom-out"
                onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.5))}
                className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors"
                title="Alejar (-)"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <div className="w-px h-4 bg-slate-700 mx-1" />
              <button
                id="btn-rotate"
                onClick={() => setRotation((r) => (r + 90) % 360)}
                className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors"
                title="Rotar 90° (R)"
              >
                <RotateCw className="w-4 h-4" />
              </button>
              <button
                id="btn-reset-view"
                onClick={() => {
                  setZoomLevel(1);
                  setRotation(0);
                }}
                className="px-2 py-1 text-xs font-medium hover:bg-slate-800 rounded-lg transition-colors text-slate-300"
              >
                Restablecer
              </button>
            </div>

            {/* Bottom Actions Floating Bar */}
            <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                {driveViewerUrl && (
                  <a
                    id="btn-open-drive"
                    href={driveViewerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-md transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Abrir en Google Drive
                  </a>
                )}
                <button
                  id="btn-copy-link"
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/90 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold shadow-md transition-colors border border-slate-700"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Enlace</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  id="btn-download-img"
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/90 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold shadow-md transition-colors border border-slate-700"
                  title="Descargar imagen"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Descargar</span>
                </button>
                <button
                  id="btn-print-sheet"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/90 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold shadow-md transition-colors border border-slate-700"
                  title="Imprimir ficha técnica"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Imprimir Ficha</span>
                </button>
              </div>
            </div>

            {/* Canvas Stage */}
            <div className="flex-1 flex items-center justify-center p-6 overflow-auto min-h-0 relative select-none">
              {imageError ? (
                <div className="text-center p-8 bg-slate-800/80 rounded-2xl border border-slate-700 max-w-md text-white space-y-3">
                  <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto" />
                  <h4 className="text-base font-bold">No se pudo cargar la vista directa</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Si el archivo está en Google Drive, asegúrate de que esté configurado como
                    <strong className="text-amber-300"> "Cualquier persona con el enlace puede ver"</strong>.
                  </p>
                  <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
                    {driveViewerUrl && (
                      <a
                        href={driveViewerUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold inline-flex items-center justify-center gap-1.5"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Ver directamente en Drive
                      </a>
                    )}
                    <button
                      onClick={() => {
                        setImageError(false);
                        setUseThumbnailFallback(!useThumbnailFallback);
                      }}
                      className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-semibold"
                    >
                      Reintentar conexión
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className="transition-transform duration-200 ease-out max-h-full max-w-full flex items-center justify-center"
                  style={{
                    transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                  }}
                >
                  <img
                    src={directUrl}
                    alt={reagent.nombre}
                    onError={handleImageError}
                    referrerPolicy="no-referrer"
                    className="max-h-[65vh] max-w-full object-contain rounded-lg shadow-2xl ring-1 ring-white/10"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: Chemical & Safety Details (4 cols) */}
          <div className="lg:col-span-4 bg-white p-5 sm:p-6 overflow-y-auto border-l border-slate-200 flex flex-col justify-between space-y-5">
            <div className="space-y-5">
              {/* Header Info */}
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-teal-600 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200">
                  {reagent.categoria}
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-2 leading-tight">
                  {reagent.nombre}
                </h3>
                {reagent.descripcion && (
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {reagent.descripcion}
                  </p>
                )}
              </div>

              {/* Specifications Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Fórmula Química
                  </span>
                  <span className="font-mono text-sm font-extrabold text-slate-900 block mt-0.5">
                    {reagent.formula || 'N/A'}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Número CAS
                  </span>
                  <span className="font-mono text-sm font-extrabold text-slate-900 block mt-0.5">
                    {reagent.cas || 'No asignado'}
                  </span>
                </div>
                {reagent.pureza && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Pureza / Grado
                    </span>
                    <span className="text-xs font-bold text-slate-900 block mt-0.5">
                      {reagent.pureza}
                    </span>
                  </div>
                )}
                {reagent.temperaturaAlmacenamiento && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Almacenamiento
                    </span>
                    <span className="text-xs font-bold text-slate-900 block mt-0.5">
                      {reagent.temperaturaAlmacenamiento}
                    </span>
                  </div>
                )}
              </div>

              {/* Dangers & Pictograms */}
              {reagent.peligro && reagent.peligro.length > 0 && (
                <div className="space-y-2 p-3.5 bg-rose-50/80 rounded-xl border border-rose-200/80">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    <span>Clasificación de Peligro (GHS / SGA)</span>
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {reagent.peligro.map((p) => (
                      <span
                        key={p}
                        className="text-xs font-bold text-rose-900 bg-white px-2 py-1 rounded-md border border-rose-300 shadow-2xs"
                      >
                        ⚠️ {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Safety Precautions */}
              {reagent.precauciones && (
                <div className="space-y-1.5 p-3.5 bg-amber-50/70 rounded-xl border border-amber-200/70">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Medidas de Precaución &amp; EPP</span>
                  </div>
                  <p className="text-xs text-amber-950 leading-relaxed font-medium">
                    {reagent.precauciones}
                  </p>
                </div>
              )}

              {/* Physical Location & Drive Folder */}
              <div className="space-y-2 pt-2 border-t border-slate-200 text-xs">
                {reagent.ubicacion && (
                  <div className="flex items-start gap-2 text-slate-700">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-slate-900 font-semibold">Ubicación en Laboratorio:</strong>
                      <span>{reagent.ubicacion}</span>
                    </div>
                  </div>
                )}
                {reagent.carpetaDrive && (
                  <div className="flex items-start gap-2 text-slate-700">
                    <Folder className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-slate-900 font-semibold">Carpeta de Origen en Drive:</strong>
                      <span className="font-mono text-[11px] text-slate-500">{reagent.carpetaDrive}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer Note */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Info className="w-3.5 h-3.5" />
                Acceso directo sin entrar a Drive
              </span>
              <span>ID: {reagent.id.slice(-6)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
