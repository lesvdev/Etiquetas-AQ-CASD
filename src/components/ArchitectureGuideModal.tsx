import React, { useState } from 'react';
import {
  X,
  BookOpen,
  FolderTree,
  HardDrive,
  Github,
  Globe,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';

interface ArchitectureGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureGuideModal: React.FC<ArchitectureGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'decision' | 'naming' | 'csv' | 'deploy'>('decision');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                Guía de Arquitectura, Despliegue y Nombramiento
              </h2>
              <p className="text-xs text-slate-300">
                Comparativa Drive vs GitHub, estructura de archivos y despliegue por enlace
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('decision')}
            className={`py-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'decision'
                ? 'border-teal-600 text-teal-700 bg-white shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            1. ¿Drive o GitHub?
          </button>
          <button
            onClick={() => setActiveTab('naming')}
            className={`py-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'naming'
                ? 'border-teal-600 text-teal-700 bg-white shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            2. Nomenclatura de Archivos
          </button>
          <button
            onClick={() => setActiveTab('csv')}
            className={`py-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'csv'
                ? 'border-teal-600 text-teal-700 bg-white shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            3. Estructura del CSV
          </button>
          <button
            onClick={() => setActiveTab('deploy')}
            className={`py-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'deploy'
                ? 'border-teal-600 text-teal-700 bg-white shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            4. Despliegue por Enlace
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-slate-700">
          {/* TAB 1: DRIVE VS GITHUB */}
          {activeTab === 'decision' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-emerald-950">
                    Resumen Ejecutivo: Esta aplicación admite ambos
                  </h3>
                  <p className="text-xs text-emerald-900 mt-1 leading-relaxed">
                    Puedes comenzar usando tus enlaces actuales de Google Drive sin necesidad de migrar nada.
                    Si más adelante deseas la máxima velocidad y fiabilidad sin depender de permisos de Drive,
                    subir las imágenes a GitHub es la mejor opción a largo plazo.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {/* Google Drive Card */}
                <div className="p-4 rounded-2xl border border-blue-200 bg-blue-50/30 space-y-3">
                  <div className="flex items-center gap-2 text-blue-900 font-bold">
                    <HardDrive className="w-5 h-5 text-blue-600" />
                    <span>Opción A: Mantener en Google Drive</span>
                  </div>
                  <ul className="text-xs space-y-2 text-slate-700">
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Ventaja:</strong> Ya tienes los archivos organizados en carpetas.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Ventaja:</strong> Fácil de subir desde celular o escanear en el laboratorio.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span><strong>Requisito obligatorio:</strong> La carpeta de Drive debe tener permiso público: <em>"Cualquier persona con el enlace puede ver"</em>.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span><strong>Limitación:</strong> Google puede aplicar límite de descargas concurrentes si muchas personas entran simultáneamente.</span>
                    </li>
                  </ul>
                </div>

                {/* GitHub Card */}
                <div className="p-4 rounded-2xl border border-slate-300 bg-slate-50 space-y-3">
                  <div className="flex items-center gap-2 text-slate-900 font-bold">
                    <Github className="w-5 h-5 text-slate-800" />
                    <span>Opción B: Subir a GitHub (Recomendada para Producción)</span>
                  </div>
                  <ul className="text-xs space-y-2 text-slate-700">
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Velocidad CDN inmediata:</strong> Carga 5x más rápido que Drive y nunca pide login.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Gratuito permanente:</strong> Sin límites de visualización ni problemas de CORS.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>URL estándar:</strong> <code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-[10px]">https://raw.githubusercontent.com/usuario/repo/main/imagenes/reactivo.jpg</code></span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: NOMENCLATURA */}
          {activeTab === 'naming' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Estructura Estándar Recomendada para Nombrar tus Archivos
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Una nomenclatura limpia evita duplicados, facilita la indexación en el CSV y permite buscar incluso si solo conoces el código CAS o el nombre común.
                </p>
              </div>

              {/* Formula box */}
              <div className="p-4 bg-slate-900 text-white rounded-2xl font-mono text-xs space-y-2">
                <div className="text-teal-400 font-bold uppercase tracking-wider text-[11px]">
                  Fórmula de Nombramiento:
                </div>
                <div className="text-sm font-bold bg-slate-800 p-3 rounded-xl border border-slate-700 text-amber-300">
                  [PREFIJO_CATEGORIA]_[NOMBRE_REACTIVO]_[NUMERO_CAS].[ext]
                </div>
              </div>

              {/* Table of examples */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 font-bold text-slate-700 border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Categoría</th>
                      <th className="p-2.5">Prefijo</th>
                      <th className="p-2.5">Ejemplo de Nombre de Archivo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    <tr className="hover:bg-slate-50">
                      <td className="p-2.5 font-sans font-semibold text-rose-700">Ácidos</td>
                      <td className="p-2.5 font-bold">AC_</td>
                      <td className="p-2.5 text-slate-800">AC_Sulfurico_7664-93-9.jpg</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-2.5 font-sans font-semibold text-blue-700">Bases / Álcalis</td>
                      <td className="p-2.5 font-bold">BA_</td>
                      <td className="p-2.5 text-slate-800">BA_HidroxidoSodio_1310-73-2.png</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-2.5 font-sans font-semibold text-amber-700">Solventes Orgánicos</td>
                      <td className="p-2.5 font-bold">SO_</td>
                      <td className="p-2.5 text-slate-800">SO_EtanolAbsoluto_64-17-5.jpg</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-2.5 font-sans font-semibold text-purple-700">Sales &amp; Oxidantes</td>
                      <td className="p-2.5 font-bold">OX_ / SA_</td>
                      <td className="p-2.5 text-slate-800">OX_PermanganatoPotasio_7722-64-7.png</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-2.5 font-sans font-semibold text-pink-700">Indicadores pH</td>
                      <td className="p-2.5 font-bold">IN_</td>
                      <td className="p-2.5 text-slate-800">IN_Fenolftaleina_77-09-8.jpg</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Rules list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <span className="font-bold text-emerald-900 block mb-1">Buenas prácticas ✔️</span>
                  <ul className="space-y-1 text-emerald-800 list-disc list-inside">
                    <li>Usar guiones bajos (_) o medios (-) en lugar de espacios.</li>
                    <li>Omitir tildes y caracteres como ñ o signos especiales.</li>
                    <li>Guardar fotos en formato .jpg o .png comprimido (100-500 KB).</li>
                  </ul>
                </div>
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
                  <span className="font-bold text-rose-900 block mb-1">Evitar ❌</span>
                  <ul className="space-y-1 text-rose-800 list-disc list-inside">
                    <li>Nombres genéricos de cámara como <code>IMG_20260914_142011.jpg</code>.</li>
                    <li>Nombres con espacios: <code>acido sulfurico (1) copia.jpg</code>.</li>
                    <li>Archivos excesivamente pesados (+10 MB por foto).</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ESTRUCTURA CSV */}
          {activeTab === 'csv' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Encabezados y Estructura Óptima para tu Archivo CSV
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Puedes crear o editar tu archivo en Excel / Google Sheets y guardarlo como .CSV (delimitado por comas).
                  </p>
                </div>
              </div>

              {/* Code snippet */}
              <div className="relative">
                <pre className="p-4 bg-slate-900 text-slate-100 rounded-2xl font-mono text-[11px] overflow-x-auto border border-slate-800 leading-relaxed">
{`"nombre","categoria","formula","cas","ubicacion","carpeta_drive","url_imagen","peligros","pureza","precauciones"
"Ácido Clorhídrico 37%","Ácidos","HCl","7647-01-0","Armario A1","Laboratorio/Acidos","https://drive.google.com/file/d/1SAMPLE_ID/view","Corrosivo; Tóxico","37% P.A.","Usar campana de extracción y guantes"
"Hidróxido de Sodio","Bases","NaOH","1310-73-2","Armario B2","Laboratorio/Bases","https://drive.google.com/file/d/1SAMPLE_ID_2/view","Corrosivo","98.5% Lentejas","Disolución exotérmica fuerte"
"Etanol 99.8%","Solventes","C2H5OH","64-17-5","Gabinete Fuego","Laboratorio/Solventes","https://drive.google.com/file/d/1SAMPLE_ID_3/view","Inflamable","99.8%","Alejar de llamas y chispas"`}
                </pre>
                <button
                  onClick={() =>
                    handleCopy(
                      `"nombre","categoria","formula","cas","ubicacion","carpeta_drive","url_imagen","peligros","pureza","precauciones"\n"Ácido Clorhídrico 37%","Ácidos","HCl","7647-01-0","Armario A1","Laboratorio/Acidos","https://drive.google.com/file/d/1SAMPLE_ID/view","Corrosivo; Tóxico","37% P.A.","Usar campana"`,
                      'csv-example'
                    )
                  }
                  className="absolute top-3 right-3 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium inline-flex items-center gap-1 border border-slate-700"
                >
                  {copiedCode === 'csv-example' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>Copiar encabezados</span>
                </button>
              </div>

              {/* Explanation of columns */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                <span className="font-bold text-slate-800 block">Columnas clave:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div><strong className="text-teal-700">nombre:</strong> Nombre comercial o químico (Obligatorio)</div>
                  <div><strong className="text-teal-700">url_imagen:</strong> Enlace de Drive o GitHub (Obligatorio)</div>
                  <div><strong className="text-teal-700">categoria:</strong> Para agrupar en filtros</div>
                  <div><strong className="text-teal-700">formula / cas:</strong> Búsqueda instantánea</div>
                  <div><strong className="text-teal-700">ubicacion:</strong> Estante, armario o laboratorio</div>
                  <div><strong className="text-teal-700">peligros:</strong> Separados por punto y coma (;)</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DESPLIEGUE */}
          {activeTab === 'deploy' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Opciones de Despliegue Rápido por Enlace Web Único
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Para que cualquier docente, estudiante o laboratorista acceda desde su navegador o teléfono sin instalar nada.
                </p>
              </div>

              <div className="space-y-3">
                {/* 1. Google AI Studio */}
                <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-teal-800">
                      Opción 1: Enlace Compartido de Google AI Studio (Activo Ahora Mismo)
                    </span>
                    <span className="text-[10px] font-bold bg-teal-200 text-teal-900 px-2 py-0.5 rounded-full">
                      Listo en 0 segundos
                    </span>
                  </div>
                  <p className="text-xs text-teal-950 leading-relaxed">
                    Esta misma aplicación ya cuenta con un enlace público de previsualización y compartición generado por Google AI Studio. Puedes compartir el link en el menú superior o desplegarlo a Cloud Run con un solo clic.
                  </p>
                </div>

                {/* 2. Vercel / Netlify + GitHub */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">
                      Opción 2: Vercel / Netlify (100% Gratis y Permanente)
                    </span>
                    <span className="text-[10px] font-bold bg-slate-200 text-slate-800 px-2 py-0.5 rounded-full">
                      Recomendado para producción
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    1. Exporta el código del proyecto a un repositorio de GitHub.<br />
                    2. En <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-teal-600 font-bold underline">vercel.com</a> haz clic en <em>"Add New Project"</em> y selecciona el repositorio.<br />
                    3. Obtendrás un enlace permanente instantáneo: <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px] font-mono">https://catalogo-reactivos.vercel.app</code>.
                  </p>
                </div>

                {/* 3. GitHub Pages */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">
                      Opción 3: GitHub Pages
                    </span>
                    <span className="text-[10px] font-bold bg-slate-200 text-slate-800 px-2 py-0.5 rounded-full">
                      Alojamiento estático gratuito
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Ideal para alojar tanto la página web del buscador como la carpeta de imágenes en un mismo lugar.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
          <span className="text-xs text-slate-400">
            Laboratorio Químico • Documentación de Proyecto
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Cerrar Guía
          </button>
        </div>
      </div>
    </div>
  );
};
