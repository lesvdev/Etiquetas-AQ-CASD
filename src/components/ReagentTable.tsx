import React, { useState } from 'react';
import { Eye, ExternalLink, MapPin, Folder, Edit2, Trash2, Copy, Check } from 'lucide-react';
import { ReagentItem } from '../types';
import { getDirectImageUrl, getDriveViewerUrl } from '../utils/driveUrlHelper';

interface ReagentTableProps {
  reagents: ReagentItem[];
  onSelect: (reagent: ReagentItem) => void;
  onEdit: (reagent: ReagentItem) => void;
  onDelete: (id: string) => void;
}

export const ReagentTable: React.FC<ReagentTableProps> = ({
  reagents,
  onSelect,
  onEdit,
  onDelete,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 text-xs uppercase tracking-wider">
            <tr>
              <th className="py-3.5 px-4">Ficha / Imagen</th>
              <th className="py-3.5 px-4">Nombre del Reactivo</th>
              <th className="py-3.5 px-4">Fórmula &amp; CAS</th>
              <th className="py-3.5 px-4">Categoría</th>
              <th className="py-3.5 px-4">Ubicación / Carpeta</th>
              <th className="py-3.5 px-4">Peligros</th>
              <th className="py-3.5 px-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {reagents.map((item) => {
              const directUrl = getDirectImageUrl(item.imageUrl);
              const driveViewerUrl = getDriveViewerUrl(item.imageUrl);

              return (
                <tr
                  key={item.id}
                  id={`table-row-${item.id}`}
                  onClick={() => onSelect(item)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                >
                  {/* Thumbnail */}
                  <td className="py-3 px-4 w-18">
                    <div className="w-14 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center relative">
                      <img
                        src={directUrl}
                        alt={item.nombre}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain p-1"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                  </td>

                  {/* Name */}
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                      {item.nombre}
                    </div>
                    {item.descripcion && (
                      <div className="text-xs text-slate-500 line-clamp-1 max-w-xs">
                        {item.descripcion}
                      </div>
                    )}
                  </td>

                  {/* Formula & CAS */}
                  <td className="py-3 px-4">
                    <div className="flex flex-col gap-0.5">
                      {item.formula && (
                        <span className="font-mono text-xs font-bold text-teal-800">
                          {item.formula}
                        </span>
                      )}
                      {item.cas && (
                        <span className="font-mono text-[11px] text-slate-500">
                          CAS: {item.cas}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3 px-4">
                    <span className="inline-block px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200/60">
                      {item.categoria}
                    </span>
                  </td>

                  {/* Location / Folder */}
                  <td className="py-3 px-4 text-xs text-slate-600">
                    {item.ubicacion && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{item.ubicacion}</span>
                      </div>
                    )}
                    {item.carpetaDrive && (
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono mt-0.5">
                        <Folder className="w-3 h-3 shrink-0" />
                        <span className="truncate max-w-[150px]">{item.carpetaDrive}</span>
                      </div>
                    )}
                  </td>

                  {/* Dangers */}
                  <td className="py-3 px-4">
                    {item.peligro && item.peligro.length > 0 ? (
                      <div className="flex gap-1 flex-wrap">
                        {item.peligro.map((p) => (
                          <span
                            key={p}
                            className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">-</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div
                      className="flex items-center justify-end gap-1.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        id={`btn-table-view-${item.id}`}
                        onClick={() => onSelect(item)}
                        className="p-1.5 text-slate-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                        title="Ver ficha informativa"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {driveViewerUrl && (
                        <a
                          href={driveViewerUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Abrir en Google Drive"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}

                      <button
                        id={`btn-table-copy-${item.id}`}
                        onClick={(e) => handleCopy(item.id, driveViewerUrl || item.imageUrl, e)}
                        className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Copiar enlace"
                      >
                        {copiedId === item.id ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>

                      <button
                        id={`btn-table-edit-${item.id}`}
                        onClick={() => onEdit(item)}
                        className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        id={`btn-table-delete-${item.id}`}
                        onClick={() => onDelete(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
