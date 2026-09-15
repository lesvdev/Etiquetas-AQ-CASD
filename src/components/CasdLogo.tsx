import React from 'react';

interface CasdLogoProps {
  className?: string;
  size?: number;
}

export const CasdLogo: React.FC<CasdLogoProps> = ({ className = '', size = 44 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 500 500"
      className={`shrink-0 drop-shadow-sm ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Path para el texto circular superior e inferior */}
        <path
          id="text-path-casd"
          d="M 60,250 A 190,190 0 1,1 440,250 A 190,190 0 1,1 60,250"
          fill="none"
        />
        {/* Sombra suave */}
        <filter id="casd-shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000000" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* Borde exterior blanco con sombra */}
      <circle cx="250" cy="250" r="240" fill="#ffffff" filter="url(#casd-shadow)" />

      {/* Anillo exterior Verde Institucional CASD */}
      <circle cx="250" cy="250" r="230" fill="#0e793c" />

      {/* Círculo interior Fondo Marfil / Crema */}
      <circle cx="250" cy="250" r="168" fill="#faf6e3" />

      {/* Texto Circular Alrededor del Anillo Verde */}
      <text
        fill="#ffffff"
        fontFamily="Arial, system-ui, sans-serif"
        fontSize="25.5"
        fontWeight="900"
        letterSpacing="2.8"
      >
        <textPath href="#text-path-casd" startOffset="50%" textAnchor="middle">
          INSTITUCIÓN EDUCATIVA CASD • JOSE PRUDENCIO PADILLA • BARRANCABERMEJA •
        </textPath>
      </text>

      {/* Flecha / Casa Verde Central CASD */}
      <g transform="translate(250, 250)">
        {/* Silueta central de la casa / flecha apuntando arriba */}
        <path
          d="M 0,-130 
             L 130,-15 
             L 90,-15 
             L 90,105 
             A 120,60 0 0,1 -90,105 
             L -90,-15 
             L -130,-15 
             Z"
          fill="#0e793c"
        />

        {/* Letras CASD Estilizadas Blancas en el Interior */}
        {/* C */}
        <path
          d="M -72,-35 
             C -72,-58 -52,-58 -44,-58 
             L -44,-36 
             C -52,-36 -54,-36 -54,-20 
             L -54,42 
             C -54,58 -52,58 -44,58 
             L -44,80 
             C -52,80 -72,80 -72,55 
             Z"
          fill="#faf6e3"
        />

        {/* A */}
        <path
          d="M -36,80 
             L -20,-58 
             L -6,-58 
             L 10,80 
             L -5,80 
             L -8,50 
             L -18,50 
             L -21,80 
             Z
             M -16,32 
             L -10,32 
             L -13,-18 
             Z"
          fill="#faf6e3"
        />

        {/* S */}
        <path
          d="M 18,55 
             L 34,55 
             C 34,64 36,66 43,66 
             C 49,66 52,62 52,55 
             C 52,38 20,32 20,4 
             C 20,-30 40,-58 64,-58 
             L 64,-36 
             C 56,-36 38,-36 38,-18 
             C 38,-6 68,-2 68,26 
             C 68,60 48,80 18,80 
             Z"
          fill="#faf6e3"
        />

        {/* D */}
        <path
          d="M 44,-58 
             L 65,-58 
             C 86,-58 92,-40 92,10 
             C 92,60 86,80 65,80 
             L 44,80 
             Z
             M 60,-36 
             L 60,58 
             C 68,58 74,50 74,10 
             C 74,-30 68,-36 60,-36 
             Z"
          fill="#faf6e3"
        />
      </g>
    </svg>
  );
};
