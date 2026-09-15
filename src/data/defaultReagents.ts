import { ReagentItem } from '../types';

/**
 * Genera una ficha informativa SVG en base64 de alta resolución para representar la etiqueta de laboratorio
 */
function createChemicalSafetyCardSvg(
  name: string,
  formula: string,
  cas: string,
  category: string,
  ghsList: string[],
  primaryColor: string,
  accentColor: string
): string {
  const ghsIconsSvg = ghsList
    .map((ghs, i) => {
      const x = 50 + i * 110;
      return `
      <g transform="translate(${x}, 320)">
        <polygon points="40,0 80,40 40,80 0,40" fill="#ffffff" stroke="#dc2626" stroke-width="4"/>
        <text x="40" y="47" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#1e293b" text-anchor="middle">${ghs}</text>
      </g>
    `;
    })
    .join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 480" width="100%" height="100%">
    <defs>
      <linearGradient id="headerGrad-${cas.replace(/[^a-z0-9]/gi, '')}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${primaryColor}"/>
        <stop offset="100%" stop-color="${accentColor}"/>
      </linearGradient>
      <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
        <feDropShadow dx="0" dy="4" stdDeviation="6" flood-opacity="0.1"/>
      </filter>
    </defs>
    
    <!-- Background Card -->
    <rect width="600" height="480" rx="16" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>
    
    <!-- Top Header Banner -->
    <path d="M 0 16 Q 0 0 16 0 L 584 0 Q 600 0 600 16 L 600 110 L 0 110 Z" fill="url(#headerGrad-${cas.replace(/[^a-z0-9]/gi, '')})"/>
    
    <!-- Header Content -->
    <text x="32" y="42" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="13" font-weight="bold" fill="#ffffff" opacity="0.85" letter-spacing="1.5">FICHA TÉCNICA DE SEGURIDAD (GHS/SGA)</text>
    <text x="32" y="78" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="24" font-weight="800" fill="#ffffff">${name}</text>
    <rect x="460" y="24" width="108" height="28" rx="14" fill="rgba(255,255,255,0.2)"/>
    <text x="514" y="43" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="12" font-weight="700" fill="#ffffff" text-anchor="middle">${category}</text>
    
    <!-- Chemical Specs Grid -->
    <g transform="translate(32, 130)">
      <!-- Formula Box -->
      <rect x="0" y="0" width="165" height="70" rx="10" fill="#f8fafc" stroke="#e2e8f0"/>
      <text x="16" y="24" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#64748b">FÓRMULA QUÍMICA</text>
      <text x="16" y="52" font-family="'JetBrains Mono', monospace" font-size="18" font-weight="bold" fill="#0f172a">${formula}</text>
      
      <!-- CAS Box -->
      <rect x="180" y="0" width="165" height="70" rx="10" fill="#f8fafc" stroke="#e2e8f0"/>
      <text x="196" y="24" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#64748b">NÚMERO CAS</text>
      <text x="196" y="52" font-family="'JetBrains Mono', monospace" font-size="16" font-weight="bold" fill="#0f172a">${cas}</text>
      
      <!-- Standard Stamp -->
      <rect x="360" y="0" width="176" height="70" rx="10" fill="#f1f5f9" stroke="#cbd5e1"/>
      <text x="376" y="24" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#475569">ESTADO FÍSICO</text>
      <text x="376" y="52" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#1e293b">P.A. Reactivo Lab</text>
    </g>
    
    <!-- GHS Section -->
    <rect x="32" y="225" width="536" height="185" rx="12" fill="#fff1f2" stroke="#fecdd3"/>
    <text x="48" y="255" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#9f1239">PICTOGRAMAS Y ADVERTENCIAS DE PELIGRO</text>
    
    <!-- Pictograms -->
    ${ghsIconsSvg}
    
    <!-- NFPA / Footer notes -->
    <g transform="translate(32, 435)">
      <line x1="0" y1="0" x2="536" y2="0" stroke="#f1f5f9" stroke-width="1.5"/>
      <text x="0" y="24" font-family="Arial, sans-serif" font-size="11" fill="#94a3b8">© Archivo Digital de Laboratorio • Imagen Informativa de Identificación Rápida</text>
      <text x="536" y="24" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="bold" fill="#64748b" text-anchor="end">REF: LAB-ID-${cas.replace(/-/g, '')}</text>
    </g>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const INITIAL_REAGENTS: ReagentItem[] = [
  {
    id: 'reag-001',
    nombre: 'Ácido Sulfúrico 98%',
    categoria: 'Ácidos',
    formula: 'H₂SO₄',
    cas: '7664-93-9',
    ubicacion: 'Armario A1 - Ácidos Minerales',
    carpetaDrive: 'Drive > Reactivos > 01_Acidos',
    imageUrl: createChemicalSafetyCardSvg(
      'Ácido Sulfúrico 98%',
      'H₂SO₄',
      '7664-93-9',
      'Ácido Fuerte',
      ['Corrosivo', 'Tóxico', 'Reactivo'],
      '#991b1b',
      '#dc2626'
    ),
    peligro: ['Corrosivo', 'Tóxico'],
    pureza: '95 - 98% P.A.',
    temperaturaAlmacenamiento: '15°C - 25°C',
    descripcion: 'Líquido aceitoso, incoloro e inodoro, sumamente corrosivo y reactivo con agua.',
    precauciones: 'Añadir SIEMPRE el ácido sobre el agua lentamente. Usar pantalla facial, guantes de nitrilo o neopreno y pechera de protección.',
    fechaRegistro: '2026-09-10',
  },
  {
    id: 'reag-002',
    nombre: 'Hidróxido de Sodio (Sosa Cáustica)',
    categoria: 'Bases',
    formula: 'NaOH',
    cas: '1310-73-2',
    ubicacion: 'Armario B1 - Álcalis y Bases',
    carpetaDrive: 'Drive > Reactivos > 02_Bases',
    imageUrl: createChemicalSafetyCardSvg(
      'Hidróxido de Sodio',
      'NaOH',
      '1310-73-2',
      'Base Fuerte',
      ['Corrosivo', 'Irritante'],
      '#1e40af',
      '#3b82f6'
    ),
    peligro: ['Corrosivo', 'Irritante'],
    pureza: '≥ 98.0% en Lentejas',
    temperaturaAlmacenamiento: 'Lugar seco, envase hermético',
    descripcion: 'Sólido blanco delicuescente. Causa quemaduras químicas severas en tejidos vivos.',
    precauciones: 'Altamente higroscópico. Al disolver en agua produce una fuerte reacción exotérmica.',
    fechaRegistro: '2026-09-10',
  },
  {
    id: 'reag-003',
    nombre: 'Etanol Absoluto 99.8%',
    categoria: 'Solventes Orgánicos',
    formula: 'C₂H₅OH',
    cas: '64-17-5',
    ubicacion: 'Gabinete Anti-Fuego F-02',
    carpetaDrive: 'Drive > Reactivos > 03_Solventes',
    imageUrl: createChemicalSafetyCardSvg(
      'Etanol Absoluto 99.8%',
      'C₂H₅OH',
      '64-17-5',
      'Solvente',
      ['Inflamable', 'Irritante'],
      '#c2410c',
      '#f97316'
    ),
    peligro: ['Inflamable', 'Irritante'],
    pureza: '99.8% Grado Analítico',
    temperaturaAlmacenamiento: 'Lugar fresco y ventilado',
    descripcion: 'Líquido transparente, volátil e inflamable con aroma característico.',
    precauciones: 'Mantener alejado de fuentes de ignición, calor y chispas. Utilizar recipientes con descarga a tierra.',
    fechaRegistro: '2026-09-11',
  },
  {
    id: 'reag-004',
    nombre: 'Permanganato de Potasio',
    categoria: 'Sales & Oxidantes',
    formula: 'KMnO₄',
    cas: '7722-64-7',
    ubicacion: 'Estante C-03 - Oxidantes',
    carpetaDrive: 'Drive > Reactivos > 04_Oxidantes',
    imageUrl: createChemicalSafetyCardSvg(
      'Permanganato de Potasio',
      'KMnO₄',
      '7722-64-7',
      'Oxidante',
      ['Comburente', 'Tóxico', 'Peligro Eco'],
      '#6b21a8',
      '#9333ea'
    ),
    peligro: ['Comburente', 'Tóxico', 'Peligro Ambiental'],
    pureza: '≥ 99.0% Cristalino',
    temperaturaAlmacenamiento: '15°C - 25°C',
    descripcion: 'Cristales de color violeta oscuro brillante. Potente agente oxidante.',
    precauciones: 'No mezclar con sustancias orgánicas ni ácidos concentrados por riesgo de combustión espontánea.',
    fechaRegistro: '2026-09-12',
  },
  {
    id: 'reag-005',
    nombre: 'Fenolftaleína en Polvo',
    categoria: 'Indicadores',
    formula: 'C₂₀H₁₄O₄',
    cas: '77-09-8',
    ubicacion: 'Cajón D-01 - Indicadores de pH',
    carpetaDrive: 'Drive > Reactivos > 05_Indicadores',
    imageUrl: createChemicalSafetyCardSvg(
      'Fenolftaleína',
      'C₂₀H₁₄O₄',
      '77-09-8',
      'Indicador pH',
      ['Salud', 'Irritante'],
      '#be185d',
      '#ec4899'
    ),
    peligro: ['Irritante'],
    pureza: 'Grado Indicador ACS',
    temperaturaAlmacenamiento: 'Temperatura ambiente',
    descripcion: 'Polvo blanco a ligeramente amarillento, indicador de pH con viraje incoloro a fucsia (pH 8.2 - 10.0).',
    precauciones: 'Evitar inhalar el polvo y contacto con piel o mucosas.',
    fechaRegistro: '2026-09-12',
  },
  {
    id: 'reag-006',
    nombre: 'Sulfato de Cobre (II) Pentahidratado',
    categoria: 'Sales & Oxidantes',
    formula: 'CuSO₄ · 5H₂O',
    cas: '7758-99-8',
    ubicacion: 'Estante C-01 - Sales Inorgánicas',
    carpetaDrive: 'Drive > Reactivos > 06_Sales',
    imageUrl: createChemicalSafetyCardSvg(
      'Sulfato de Cobre (II)',
      'CuSO₄ · 5H₂O',
      '7758-99-8',
      'Sal Inorgánica',
      ['Tóxico', 'Irritante', 'Peligro Eco'],
      '#0369a1',
      '#0ea5e9'
    ),
    peligro: ['Tóxico', 'Irritante', 'Peligro Ambiental'],
    pureza: '≥ 99.5% P.A.',
    temperaturaAlmacenamiento: '15°C - 25°C',
    descripcion: 'Cristales azules brillantes característicos. Nocivo por ingestión y muy tóxico para organismos acuáticos.',
    precauciones: 'Recolectar residuos en contenedor especial para metales pesados.',
    fechaRegistro: '2026-09-13',
  },
  {
    id: 'reag-007',
    nombre: 'Acetona P.A.',
    categoria: 'Solventes Orgánicos',
    formula: 'C₃H₆O',
    cas: '67-64-1',
    ubicacion: 'Gabinete Anti-Fuego F-01',
    carpetaDrive: 'Drive > Reactivos > 03_Solventes',
    imageUrl: createChemicalSafetyCardSvg(
      'Acetona Grado P.A.',
      'C₃H₆O',
      '67-64-1',
      'Solvente',
      ['Inflamable', 'Irritante'],
      '#b45309',
      '#f59e0b'
    ),
    peligro: ['Inflamable', 'Irritante'],
    pureza: '≥ 99.5%',
    temperaturaAlmacenamiento: 'Ventilado, < 25°C',
    descripcion: 'Líquido volátil incoloro muy inflamable con vapor irritante para ojos y vías respiratorias.',
    precauciones: 'La inhalación de vapores puede provocar somnolencia y vértigo. Trabajar bajo campana.',
    fechaRegistro: '2026-09-13',
  },
  {
    id: 'reag-008',
    nombre: 'Nitrato de Plata',
    categoria: 'Sales & Oxidantes',
    formula: 'AgNO₃',
    cas: '7761-88-8',
    ubicacion: 'Caja Fuerte / Estante Especial C-04',
    carpetaDrive: 'Drive > Reactivos > 06_Sales',
    imageUrl: createChemicalSafetyCardSvg(
      'Nitrato de Plata',
      'AgNO₃',
      '7761-88-8',
      'Sal Especial',
      ['Comburente', 'Corrosivo', 'Peligro Eco'],
      '#475569',
      '#64748b'
    ),
    peligro: ['Comburente', 'Corrosivo', 'Peligro Ambiental'],
    pureza: '≥ 99.8% Cristalino',
    temperaturaAlmacenamiento: 'Frasco ámbar, protegido de la luz',
    descripcion: 'Sal inorgánica fotosensible utilizada en titulaciones argentométricas y tinciones.',
    precauciones: 'Mancha permanentemente la piel de negro al reaccionar con la luz solar. Usar guantes.',
    fechaRegistro: '2026-09-14',
  }
];
