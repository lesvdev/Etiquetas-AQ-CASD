import React, { useState } from 'react';
import {
  ExternalLink,
  Eye,
  MapPin,
  Folder,
  Copy,
  Check,
  AlertOctagon,
  Image as ImageIcon,
  Edit2,
  Trash2,
} from 'lucide-react';
import { ReagentItem } from '../types';
import {
  getDirectImageUrl,
  getDriveThumbnailUrl,
  getDriveViewerUrl,
  getUrlSourceType,
} from '../utils/driveUrlHelper';

interface ReagentCardProps {
  reagent: ReagentItem;
  onSelect: (reagent: ReagentItem) => void;
  onEdit: (reagent: ReagentItem) => void;
  onDelete: (id: string) => void;
}

export const ReagentCard: React.FC<ReagentCardProps> = ({
  reagent,
  onSelect,
  onEdit,
  onDelete,
}) => {
  const [imageError, setImageError] = useState(false);
  const [useThumbnailFallback, setUseThumbnailFallback] = useState(false);
  const [copied, setCopied] = useState(false);

  const directUrl = useThumbnailFallback
    ? getDriveThumbnailUrl(reagent.imageUrl, 800)
    : getDirectImageUrl(reagent.imageUrl);

  const driveViewerUrl = getDriveViewerUrl(reagent.imageUrl);
  const sourceType = getUrlSourceType(reagent.imageUrl);

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const linkToCopy = driveViewerUrl || reagent.imageUrl;
    navigator.clipboard.writeText(linkToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImageError = () => {
    if (!useThumbnailFallback && sourceType === 'drive') {
      setUseThumbnailFallback(true);
    } else {
      setImageError(true);
    }
  };

  // Color mapping based on category
  const getCategoryTheme = (cat: string) => {
    const c = cat.toLowerCase();
    if (c.includes('ácid') || c.includes('acid')) return 'bg-rose-50 text-rose-700 border-rose-200';
    if (c.includes('base') || c.includes('alcali')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (c.includes('solvente') || c.includes('orgánic')) return 'bg-amber-50 text-amber-700 border-amber-200';
    if (c.includes('oxidan') || c.includes('sal')) return 'bg-purple-50 text-purple-700 border-purple-200';
    if (c.includes('indicador')) return 'bg-pink-50 text-pink-700 border-pink-200';
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  };

  return (
    <div
      id={`reagent-card-${reagent.id}`}
      onClick={() => onSelect(reagent)}
      className="group bg-white border border-slate-200/90 hover:border-teal-500/50 rounded-2xl overflow-hidden shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col cursor-pointer"
    >
      {/* Image Preview Container */}
      <div className="relative aspect-[4/3] bg-slate-100/80 overflow-hidden flex items-center justify-center border-b border-slate-100">
        {imageError ? (
          <div className="p-4 text-center flex flex-col items-center justify-center text-slate-400 bg-slate-50 w-full h-full">
            <ImageIcon className="w-10 h-10 mb-2 text-slate-300 stroke-1" />
            <span className="text-xs font-semibold text-slate-600">
              Vista previa no disponible
            </span>
            <p className="text-[11px] text-slate-400 mt-1 max-w-[200px]">
              {sourceType === 'drive'
                ? 'Verifica que el archivo en Drive tenga permisos de acceso público'
                : 'Verifica la URL de la imagen'}
            </p>
            {driveViewerUrl && (
              <a
                href={driveViewerUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="mt-2 text-xs font-semibold text-teal-600 hover:text-teal-700 inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-md border border-slate-200"
              >
                <ExternalLink className="w-3 h-3" />
                Abrir en Drive
              </a>
            )}
          </div>
        ) : (
          <>
            <img
              src={directUrl}
              alt={reagent.nombre}
              onError={handleImageError}
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain p-2 group-hover:scale-103 transition-transform duration-300"
              loading="lazy"
            />
            {/* Overlay button on hover */}
            <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                id={`btn-card-view-${reagent.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(reagent);
                }}
                className="px-3.5 py-1.5 bg-white/95 text-slate-900 text-xs font-bold rounded-lg shadow-sm hover:bg-white flex items-center gap-1.5 transform translate-y-1 group-hover:translate-y-0 transition-all"
              >
                <Eye className="w-3.5 h-3.5 text-teal-600" />
                Ver Ficha Completa
              </button>
            </div>
          </>
        )}

        {/* Source Badge (Drive / GitHub / Local) */}
        <div className="absolute top-2.5 left-2.5">
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-md shadow-2xs backdrop-blur-md ${
              sourceType === 'drive'
                ? 'bg-blue-600/90 text-white'
                : sourceType === 'github'
                ? 'bg-slate-800/90 text-white'
                : 'bg-slate-700/80 text-white'
            }`}
          >
            {sourceType === 'drive' ? 'Google Drive' : sourceType === 'github' ? 'GitHub' : 'Ficha Digital'}
          </span>
        </div>

        {/* Category Tag */}
        <div className="absolute top-2.5 right-2.5">
          <span
            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-lg border shadow-2xs ${getCategoryTheme(
              reagent.categoria
            )}`}
          >
            {reagent.categoria}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Formula and CAS codes */}
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            {reagent.formula && (
              <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200/60">
                {reagent.formula}
              </span>
            )}
            {reagent.cas && (
              <span className="font-mono text-[11px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                CAS: {reagent.cas}
              </span>
            )}
          </div>

          {/* Reagent Title */}
          <h3 className="text-sm sm:text-base font-bold text-slate-900 line-clamp-1 group-hover:text-teal-700 transition-colors">
            {reagent.nombre}
          </h3>

          {/* Description snippet */}
          {reagent.descripcion && (
            <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
              {reagent.descripcion}
            </p>
          )}
        </div>

        {/* Bottom Details & GHS Dangers */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          {/* Danger Tags */}
          {reagent.peligro && reagent.peligro.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              {reagent.peligro.map((p) => (
                <span
                  key={p}
                  className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200/50"
                >
                  <AlertOctagon className="w-2.5 h-2.5 text-rose-600" />
                  {p}
                </span>
              ))}
            </div>
          )}

          {/* Location & Folder Breadcrumb */}
          <div className="flex flex-col gap-1 text-[11px] text-slate-500">
            {reagent.ubicacion && (
              <div className="flex items-center gap-1.5 truncate">
                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="truncate">{reagent.ubicacion}</span>
              </div>
            )}
            {reagent.carpetaDrive && (
              <div className="flex items-center gap-1.5 text-slate-400 truncate">
                <Folder className="w-3 h-3 shrink-0" />
                <span className="truncate font-mono text-[10px]">
                  {reagent.carpetaDrive}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Footer Action Toolbar */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
          <button
            id={`btn-card-copy-${reagent.id}`}
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 transition-colors font-medium"
            title="Copiar enlace directo"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600 font-semibold">¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Link</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-1">
            <button
              id={`btn-card-edit-${reagent.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onEdit(reagent);
              }}
              className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
              title="Editar reactivo"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              id={`btn-card-delete-${reagent.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(reagent.id);
              }}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Eliminar de catálogo"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
