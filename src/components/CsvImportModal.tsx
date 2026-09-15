import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  FileText,
} from 'lucide-react';
import { ReagentItem } from '../types';
import { parseReagentsCsv, generateSampleCsvContent } from '../utils/csvParser';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (reagents: ReagentItem[], mode: 'replace' | 'append') => void;
  currentCount: number;
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
  currentCount,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [rawText, setRawText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsedItems, setParsedItems] = useState<ReagentItem[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [importMode, setImportMode] = useState<'replace' | 'append'>('replace');
  const [activeTab, setActiveTab] = useState<'file' | 'text'>('file');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const processCsvText = async (text: string, name?: string) => {
    if (!text.trim()) {
      setErrorMessage('El contenido del archivo CSV está vacío.');
      return;
    }

    setIsParsing(true);
    setErrorMessage(null);

    try {
      const items = await parseReagentsCsv(text);
      if (items.length === 0) {
        setErrorMessage(
          'No se encontraron filas válidas. Asegúrate de incluir al menos columnas como "nombre" y "url_imagen" o "link_drive".'
        );
      } else {
        setParsedItems(items);
        if (name) setFileName(name);
      }
    } catch (err: any) {
      setErrorMessage(`Error al procesar el archivo CSV: ${err?.message || 'Formato no reconocido'}`);
    } finally {
      setIsParsing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      processCsvText(text, file.name);
    };
    reader.readAsText(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      processCsvText(text, file.name);
    };
    reader.readAsText(file);
  };

  const handleDownloadSample = () => {
    const sample = generateSampleCsvContent();
    const blob = new Blob(['\ufeff' + sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'plantilla_reactivos_drive.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleConfirmImport = () => {
    if (parsedItems.length === 0) return;
    onImport(parsedItems, importMode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-emerald-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">Importar Registro CSV de Fotografías</h2>
              <p className="text-xs text-emerald-100">
                Sincroniza tus reactivos y enlaces de Drive desde tu archivo .csv
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Tabs: Upload File vs Paste Text */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('file')}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${
                  activeTab === 'file'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Subir Archivo .CSV
              </button>
              <button
                onClick={() => setActiveTab('text')}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${
                  activeTab === 'text'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Pegar Texto / Tabla
              </button>
            </div>

            <button
              onClick={handleDownloadSample}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Descargar Plantilla CSV
            </button>
          </div>

          {/* Tab 1: File Upload / Drag & Drop */}
          {activeTab === 'file' && (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-emerald-500 bg-emerald-50/60 scale-101'
                  : 'border-slate-300 hover:border-emerald-400 bg-slate-50/50 hover:bg-slate-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv,text/plain"
                onChange={handleFileChange}
                className="hidden"
              />
              <Upload className="w-10 h-10 text-emerald-600 mx-auto mb-3 stroke-1" />
              <p className="text-sm font-bold text-slate-800">
                Arrastra y suelta tu archivo <span className="text-emerald-700">.CSV</span> aquí
              </p>
              <p className="text-xs text-slate-500 mt-1">
                o haz clic para examinar desde tu computadora
              </p>
              {fileName && (
                <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-100/70 px-3 py-1 rounded-full border border-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Archivo cargado: {fileName}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Raw Text Paste */}
          {activeTab === 'text' && (
            <div className="space-y-2">
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Pega aquí el contenido separado por comas o tabulaciones..."
                rows={6}
                className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                onClick={() => processCsvText(rawText, 'csv_pegado.csv')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors"
              >
                Analizar y Procesar Texto
              </button>
            </div>
          )}

          {/* Parsing error message */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Parsed Preview Section */}
          {parsedItems.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Vista previa de importación ({parsedItems.length} reactivos detectados)
                </h3>
              </div>

              {/* Sample parsed items table */}
              <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2">#</th>
                      <th className="p-2">Reactivo</th>
                      <th className="p-2">Categoría</th>
                      <th className="p-2">Fórmula</th>
                      <th className="p-2">Enlace / Drive ID</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedItems.slice(0, 5).map((item, idx) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="p-2 text-slate-400">{idx + 1}</td>
                        <td className="p-2 font-bold text-slate-800">{item.nombre}</td>
                        <td className="p-2 text-slate-600">{item.categoria}</td>
                        <td className="p-2 font-mono text-teal-700">{item.formula || '-'}</td>
                        <td className="p-2 font-mono text-slate-500 truncate max-w-[180px]">
                          {item.imageUrl}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedItems.length > 5 && (
                <p className="text-[11px] text-slate-500 text-center">
                  y {parsedItems.length - 5} reactivos más...
                </p>
              )}

              {/* Import Mode Radio */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-800 block">
                  ¿Cómo deseas aplicar esta lista?
                </span>
                <div className="flex flex-col sm:flex-row gap-3">
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'replace'}
                      onChange={() => setImportMode('replace')}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>
                      <strong>Reemplazar catálogo completo</strong> (elimina los {currentCount} actuales)
                    </span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'append'}
                      onChange={() => setImportMode('append')}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>
                      <strong>Añadir a los existentes</strong> (sumar a los {currentCount} actuales)
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Quick Guidance Box */}
          <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
            <HelpCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="block font-semibold">Columnas reconocidas automáticamente:</strong>
              <p className="text-blue-800 leading-relaxed text-[11px]">
                <code className="bg-blue-100 px-1 py-0.5 rounded font-mono font-bold">nombre</code>,{' '}
                <code className="bg-blue-100 px-1 py-0.5 rounded font-mono font-bold">categoria</code>,{' '}
                <code className="bg-blue-100 px-1 py-0.5 rounded font-mono font-bold">url_imagen</code> o{' '}
                <code className="bg-blue-100 px-1 py-0.5 rounded font-mono font-bold">link_drive</code>,{' '}
                <code className="bg-blue-100 px-1 py-0.5 rounded font-mono font-bold">formula</code>,{' '}
                <code className="bg-blue-100 px-1 py-0.5 rounded font-mono font-bold">cas</code>,{' '}
                <code className="bg-blue-100 px-1 py-0.5 rounded font-mono font-bold">ubicacion</code>,{' '}
                <code className="bg-blue-100 px-1 py-0.5 rounded font-mono font-bold">peligros</code>.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg"
          >
            Cancelar
          </button>

          <button
            id="btn-confirm-import-csv"
            disabled={parsedItems.length === 0 || isParsing}
            onClick={handleConfirmImport}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all"
          >
            <span>Cargar {parsedItems.length} Reactivos</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
