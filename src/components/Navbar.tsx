import React from 'react';
import {
  FlaskConical,
  Upload,
  Download,
  Plus,
  BookOpen,
  Link2,
  RefreshCw,
} from 'lucide-react';

interface NavbarProps {
  reagentsCount: number;
  onOpenCsvModal: () => void;
  onOpenAddModal: () => void;
  onOpenGuideModal: () => void;
  onOpenDriveTool: () => void;
  onExportCsv: () => void;
  onResetToDefaults: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  reagentsCount,
  onOpenCsvModal,
  onOpenAddModal,
  onOpenGuideModal,
  onOpenDriveTool,
  onExportCsv,
  onResetToDefaults,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-sm ring-2 ring-teal-100">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight leading-tight">
                  Visor de Reactivos
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200/60">
                  {reagentsCount} {reagentsCount === 1 ? 'reactivo' : 'reactivos'}
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Catálogo e imágenes informativas • Soporte Drive &amp; CSV
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Guide & Architecture Button */}
            <button
              id="btn-nav-guide"
              onClick={onOpenGuideModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 rounded-lg transition-colors"
              title="Guía: Drive vs GitHub, Nomenclatura y Despliegue"
            >
              <BookOpen className="w-4 h-4 text-teal-600" />
              <span className="hidden md:inline">Guía &amp; Arquitectura</span>
            </button>

            {/* Drive Link Tool */}
            <button
              id="btn-nav-drive-tool"
              onClick={onOpenDriveTool}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 rounded-lg transition-colors"
              title="Convertidor de enlaces de Google Drive"
            >
              <Link2 className="w-4 h-4 text-blue-600" />
              <span className="hidden lg:inline">Convertidor Drive</span>
            </button>

            {/* Import CSV */}
            <button
              id="btn-nav-import-csv"
              onClick={onOpenCsvModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors shadow-2xs"
            >
              <Upload className="w-4 h-4 text-emerald-600" />
              <span>Cargar CSV</span>
            </button>

            {/* Export CSV */}
            <button
              id="btn-nav-export-csv"
              onClick={onExportCsv}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors hidden sm:inline-flex"
              title="Descargar catálogo actual en formato CSV"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Add Reagent */}
            <button
              id="btn-nav-add-reagent"
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 rounded-lg shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nuevo Reactivo</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
