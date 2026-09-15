import React, { useRef } from 'react';
import { Download, Printer, ShieldAlert, Sparkles, Building2, MapPin, Tag } from 'lucide-react';
import { ReagentItem } from '../types';
import { SgaPictogramIcon } from './SgaPictogramIcon';
import { SGA_PICTOGRAMS } from '../utils/sgaConstants';

interface SgaLabelCardProps {
  reagent: ReagentItem;
  className?: string;
  showActions?: boolean;
}

export const SgaLabelCard: React.FC<SgaLabelCardProps> = ({
  reagent,
  className = '',
  showActions = true,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  // Fallbacks de pictogramas si vienen en reagent.peligro o en reagent.pictogramasSga
  const pictos: string[] = React.useMemo(() => {
    if (reagent.pictogramasSga && reagent.pictogramasSga.length > 0) {
      return reagent.pictogramasSga;
    }
    // Mapeo inteligente desde peligro[]
    if (reagent.peligro && reagent.peligro.length > 0) {
      const detected: string[] = [];
      reagent.peligro.forEach((p) => {
        const lower = p.toLowerCase();
        if (lower.includes('inflam')) detected.push('GHS02');
        else if (lower.includes('corros')) detected.push('GHS05');
        else if (lower.includes('tóxic') || lower.includes('toxic')) detected.push('GHS06');
        else if (lower.includes('irrit') || lower.includes('nociv')) detected.push('GHS07');
        else if (lower.includes('combur') || lower.includes('oxidan')) detected.push('GHS03');
        else if (lower.includes('ambient') || lower.includes('ecotox')) detected.push('GHS09');
        else if (lower.includes('salud') || lower.includes('cancer')) detected.push('GHS08');
        else if (lower.includes('explos')) detected.push('GHS01');
        else if (lower.includes('gas')) detected.push('GHS04');
      });
      return Array.from(new Set(detected));
    }
    return ['GHS07']; // fallback
  }, [reagent.pictogramasSga, reagent.peligro]);

  const palabra = reagent.palabraAdvertencia || (pictos.some(p => ['GHS01', 'GHS02', 'GHS05', 'GHS06', 'GHS08'].includes(p)) ? 'PELIGRO' : 'ATENCIÓN');

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCardSvg = () => {
    if (!cardRef.current) return;
    
    // Generar un canvas para renderizar la etiqueta y descargarla como imagen PNG
    const svgData = `
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="400">
        <foreignObject width="100%" height="100%">
          <div xmlns="http://www.w3.org/1999/xhtml">
            ${cardRef.current.outerHTML}
          </div>
        </foreignObject>
      </svg>
    `;
    
    // Crear enlace de descarga
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ETIQUETA_SGA_${reagent.nombre.replace(/[^a-z0-9]/gi, '_')}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`flex flex-col gap-2.5 ${className}`}>
      {/* TARJETA ETIQUETA SGA ESTÁNDAR (UN GHS Official Layout) */}
      <div
        ref={cardRef}
        className="bg-white text-slate-900 border-4 border-slate-900 rounded-2xl p-4 sm:p-5 shadow-md flex flex-col justify-between select-none relative overflow-hidden font-sans"
        style={{ minHeight: '340px' }}
      >
        {/* Cabecera: Identificación del Producto */}
        <div className="border-b-2 border-slate-900 pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">
                SISTEMA GLOBALMENTE ARMONIZADO (SGA / GHS)
              </span>
              <h3 className="text-lg sm:text-xl font-black text-slate-950 uppercase leading-tight tracking-tight mt-0.5">
                {reagent.nombre}
              </h3>
            </div>
            {reagent.pureza && (
              <span className="px-2 py-1 bg-slate-100 border border-slate-300 rounded text-xs font-bold text-slate-800 shrink-0">
                {reagent.pureza}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs font-semibold text-slate-700">
            {reagent.formula && (
              <span>
                Fórmula: <strong className="font-mono text-slate-950 font-bold">{reagent.formula}</strong>
              </span>
            )}
            {reagent.cas && (
              <span>
                CAS: <strong className="font-mono text-slate-950 font-bold">{reagent.cas}</strong>
              </span>
            )}
            {reagent.categoria && (
              <span>
                Familia: <strong className="text-slate-950">{reagent.categoria}</strong>
              </span>
            )}
          </div>
        </div>

        {/* Cuerpo Central: Pictogramas + Palabra de advertencia + Frases H & P */}
        <div className="py-3.5 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* Pictogramas SGA Oficiales (Rombo Rojo) */}
          <div className="sm:col-span-4 flex sm:flex-col items-center justify-center gap-2 p-2 bg-slate-50/80 rounded-xl border border-slate-200">
            <div className="flex flex-wrap items-center justify-center gap-2">
              {pictos.map((pCode) => (
                <SgaPictogramIcon key={pCode} code={pCode} size="lg" />
              ))}
            </div>

            {/* Palabra de Advertencia */}
            {palabra && palabra !== 'SIN_PALABRA' && (
              <div
                className={`w-full text-center px-2 py-1 rounded-md text-xs font-black uppercase tracking-wider text-white mt-1 shadow-2xs ${
                  palabra === 'PELIGRO' ? 'bg-red-700' : 'bg-amber-600'
                }`}
              >
                ⚠️ {palabra}
              </div>
            )}
          </div>

          {/* Frases H y P */}
          <div className="sm:col-span-8 space-y-2 text-xs">
            {/* Indicaciones de peligro Frases H */}
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-red-700 block">
                INDICACIONES DE PELIGRO (FRASES H):
              </span>
              {reagent.frasesH && reagent.frasesH.length > 0 ? (
                <ul className="list-disc list-inside space-y-0.5 text-slate-800 font-medium text-[11px] leading-tight mt-0.5">
                  {reagent.frasesH.map((fh, idx) => (
                    <li key={idx}>{fh}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-[11px] text-slate-700 font-medium leading-relaxed">
                  {reagent.precauciones || 'Manipular conforme a las buenas prácticas de laboratorio y utilizar equipo de protección personal adecuado.'}
                </p>
              )}
            </div>

            {/* Consejos de prudencia Frases P */}
            {reagent.frasesP && reagent.frasesP.length > 0 && (
              <div className="pt-1 border-t border-slate-200">
                <span className="text-[10px] font-black uppercase tracking-wider text-teal-800 block">
                  CONSEJOS DE PRUDENCIA (FRASES P):
                </span>
                <ul className="list-disc list-inside space-y-0.5 text-slate-700 text-[11px] leading-tight mt-0.5 font-medium">
                  {reagent.frasesP.map((fp, idx) => (
                    <li key={idx}>{fp}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Pie: Proveedor / Ubicación / Almacenamiento */}
        <div className="border-t-2 border-slate-900 pt-2.5 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-600 font-semibold bg-slate-50 -mx-4 -mb-4 sm:-mx-5 sm:-mb-5 p-3">
          <div className="flex items-center gap-3">
            {reagent.proveedor && (
              <span className="flex items-center gap-1">
                <Building2 className="w-3 h-3 text-slate-400" />
                {reagent.proveedor}
              </span>
            )}
            {reagent.ubicacion && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                {reagent.ubicacion}
              </span>
            )}
            {reagent.temperaturaAlmacenamiento && (
              <span>Temp: {reagent.temperaturaAlmacenamiento}</span>
            )}
          </div>
          <div className="text-[9px] text-slate-400 uppercase tracking-wider">
            Norma NCh382 / SGA ONU Rev. 9
          </div>
        </div>
      </div>

      {/* Acciones de la etiqueta SGA */}
      {showActions && (
        <div className="flex items-center justify-end gap-2 text-xs">
          <button
            type="button"
            onClick={handleDownloadCardSvg}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 font-bold text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors border border-slate-200"
            title="Descargar etiqueta SGA en formato vectorial SVG"
          >
            <Download className="w-3.5 h-3.5 text-teal-600" />
            <span>Descargar Etiqueta SGA</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-2xs"
            title="Imprimir esta etiqueta SGA"
          >
            <Printer className="w-3.5 h-3.5 text-teal-400" />
            <span>Imprimir Etiqueta</span>
          </button>
        </div>
      )}
    </div>
  );
};
