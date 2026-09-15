import React from 'react';
import { SGA_PICTOGRAMS, SgaPictogram } from '../utils/sgaConstants';

type SgaIconSize = 'sm' | 'md' | 'lg' | 'xl';

interface SgaPictogramIconProps {
  code: string; // 'GHS01', 'GHS02', etc.
  size?: SgaIconSize;
  showLabel?: boolean;
}

export const SgaPictogramIcon: React.FC<SgaPictogramIconProps> = ({
  code,
  size,
  showLabel = false,
}) => {
  const currentSize: SgaIconSize = size || 'md';
  const item = SGA_PICTOGRAMS.find((p) => p.code === code || p.id === code);
  if (!item) return null;

  const sizeClasses: Record<SgaIconSize, string> = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-xl',
  };

  const diamondSizes: Record<SgaIconSize, string> = {
    sm: 'w-5 h-5 border-[2px]',
    md: 'w-7 h-7 border-[2.5px]',
    lg: 'w-10 h-10 border-[3.5px]',
    xl: 'w-14 h-14 border-[4px]',
  };

  return (
    <div className="inline-flex flex-col items-center gap-1 shrink-0 select-none">
      <div
        className={`${sizeClasses[currentSize]} relative flex items-center justify-center`}
        title={`${item.code}: ${item.nombre} - ${item.descripcion}`}
      >
        {/* Rombo Rojo GHS Oficial (GHS Red Diamond) */}
        <div
          className={`${diamondSizes[currentSize]} bg-white border-red-600 rounded-[2px] rotate-45 flex items-center justify-center shadow-xs`}
        >
          {/* Símbolo interior derecho */}
          <div className="-rotate-45 font-black flex items-center justify-center">
            {renderSvgSymbol(item.code, currentSize)}
          </div>
        </div>
      </div>
      {showLabel && (
        <span className="text-[10px] font-bold text-slate-700 text-center leading-tight max-w-[70px]">
          {item.nombre}
        </span>
      )}
    </div>
  );
};

function renderSvgSymbol(code: string, size: 'sm' | 'md' | 'lg' | 'xl') {
  const iconSize = size === 'sm' ? 12 : size === 'md' ? 16 : size === 'lg' ? 22 : 30;

  switch (code) {
    case 'GHS01': // Explosive
      return (
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-black">
          <circle cx="12" cy="12" r="3" fill="currentColor" />
          <path d="m4 4 3 3m13-3-3 3M4 20l3-3m13 3-3-3M12 2v4m0 12v4M2 12h4m12 0h4" />
        </svg>
      );
    case 'GHS02': // Flammable (Llama)
      return (
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="currentColor" className="text-black">
          <path d="M12 2c-.5 2.5-2 4-3.5 6-1.5 2-2.5 4.5-2.5 7a8 8 0 0 0 16 0c0-3.5-2-6-4-8-.5 2-2 3-3.5 3-1 0-2-.5-2.5-2C12 6.5 12.5 4 12 2z" />
        </svg>
      );
    case 'GHS03': // Oxidizer (Llama sobre círculo)
      return (
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-black">
          <circle cx="12" cy="15" r="5" strokeWidth="2.5" />
          <path d="M12 2c-.5 2-1.5 3.5-2.5 5 1.5 0 2.5 1 2.5 2.5.5-1.5 1.5-2 2.5-2.5-1-1.5-2-3-2.5-5z" fill="currentColor" />
        </svg>
      );
    case 'GHS04': // Gas Cylinder
      return (
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="currentColor" className="text-black">
          <path d="M9 3h6v2H9V3zm-2 5a5 5 0 0 1 10 0v11a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V8zm2 2v8h6v-8H9z" />
        </svg>
      );
    case 'GHS05': // Corrosive
      return (
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="currentColor" className="text-black">
          <path d="M4 3h4v2H4V3zm12 0h4v2h-4V3zM3 8l4 6h-2v5h2v2H3v-2h2v-5H3V8zm14 0l4 6h-2v5h2v2h-4v-2h2v-5h-2l-4-6zm-6 4a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
        </svg>
      );
    case 'GHS06': // Toxic / Skull
      return (
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="currentColor" className="text-black">
          <path d="M12 2a7 7 0 0 0-7 7c0 2.5 1.2 4.6 3 5.8V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.2c1.8-1.2 3-3.3 3-5.8a7 7 0 0 0-7-7zm-2.5 6a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm5 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zM12 14c-.6 0-1-.4-1-1h2c0 .6-.4 1-1 1zm-4 7h8v2H8v-2z" />
        </svg>
      );
    case 'GHS07': // Exclamation mark
      return (
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="currentColor" className="text-black font-black">
          <circle cx="12" cy="19" r="2.2" />
          <path d="M10.5 4h3l-.7 11h-1.6z" />
        </svg>
      );
    case 'GHS08': // Health hazard
      return (
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="currentColor" className="text-black">
          <circle cx="12" cy="6" r="3" />
          <path d="M12 10c-3.5 0-6 2-6 4v1h12v-1c0-2-2.5-4-6-4zm0 6l-2 3h4l-2-3zm-3 4l-1 2h8l-1-2H9z" />
        </svg>
      );
    case 'GHS09': // Environment
      return (
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="currentColor" className="text-black">
          <path d="M19 14c-1.5 0-3-1-4-2.5-1 1.5-2.5 2.5-4 2.5-2 0-3.5-1-4.5-2.5L7 13c1 1.5 2.5 2.5 4 2.5s3-1 4-2.5c1 1.5 2.5 2.5 4 2.5v2H2v2h20v-4h-3v-1.5zM12 3l-3 4h2v4h2V7h2l-3-4z" />
        </svg>
      );
    default:
      return <span>⚠️</span>;
  }
}
