import React, { useState } from 'react';
import {
  X,
  Link2,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Info,
} from 'lucide-react';
import { extractDriveFileId, getDirectImageUrl, getDriveThumbnailUrl } from '../utils/driveUrlHelper';

interface DriveToDirectLinkToolProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DriveToDirectLinkTool: React.FC<DriveToDirectLinkToolProps> = ({
  isOpen,
  onClose,
}) => {
  const [inputText, setInputText] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  // Process multiple lines
  const lines = inputText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const convertedResults = lines.map((line) => {
    const fileId = extractDriveFileId(line);
    const directUrl = fileId ? getDirectImageUrl(line) : '';
    const thumbUrl = fileId ? getDriveThumbnailUrl(line, 1600) : '';
    return {
      original: line,
      fileId,
      directUrl,
      thumbUrl,
      isValid: Boolean(fileId),
    };
  });

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyAllDirect = () => {
    const text = convertedResults
      .filter((r) => r.isValid)
      .map((r) => r.directUrl)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopiedIndex(9999);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-blue-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
              <Link2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                Convertidor de Enlaces de Google Drive
              </h2>
              <p className="text-xs text-blue-100">
                Convierte enlaces compartidos de Drive a URLs directas de imagen para web y CSV
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

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Pega uno o varios enlaces de Google Drive (uno por línea):
            </label>
            <textarea
              rows={4}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`https://drive.google.com/file/d/1A2B3C4D5E6F7G8H9I0/view?usp=sharing\nhttps://drive.google.com/open?id=1X9Y8Z...`}
              className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Results */}
          {convertedResults.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  Enlaces Convertidos ({convertedResults.filter((r) => r.isValid).length} válidos):
                </span>
                <button
                  onClick={handleCopyAllDirect}
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-lg transition-colors"
                >
                  {copiedIndex === 9999 ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>¡Todos copiados!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar todas las URLs directas</span>
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {convertedResults.map((res, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 ${
                      res.isValid
                        ? 'bg-slate-50 border-slate-200'
                        : 'bg-rose-50 border-rose-200 text-rose-800'
                    }`}
                  >
                    <div className="truncate flex-1">
                      {res.isValid ? (
                        <>
                          <div className="font-mono text-slate-500 text-[11px] truncate">
                            ID: <strong className="text-blue-700">{res.fileId}</strong>
                          </div>
                          <div className="font-mono text-slate-800 text-xs font-bold truncate">
                            {res.directUrl}
                          </div>
                        </>
                      ) : (
                        <span className="font-medium">
                          No se detectó un ID de Drive válido en: {res.original}
                        </span>
                      )}
                    </div>

                    {res.isValid && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleCopy(res.directUrl, idx)}
                          className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-medium inline-flex items-center gap-1 shadow-2xs"
                        >
                          {copiedIndex === idx ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          <span>Copiar</span>
                        </button>
                        <a
                          href={res.directUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1 text-slate-400 hover:text-blue-600"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Guide tip box */}
          <div className="p-4 bg-amber-50/80 border border-amber-200/80 rounded-2xl text-xs text-amber-900 space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-950">
              <Info className="w-4 h-4 text-amber-600" />
              <span>Paso indispensable en Google Drive:</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              En Google Drive, haz clic derecho sobre la carpeta o las fotos &gt; <strong>Compartir</strong> &gt; En "Acceso general" cambia a <strong className="text-amber-950">"Cualquier persona con el enlace"</strong> con rol de <strong className="text-amber-950">"Lector"</strong>. De lo contrario, Google bloqueará las imágenes a usuarios no autenticados.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Entendido / Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
