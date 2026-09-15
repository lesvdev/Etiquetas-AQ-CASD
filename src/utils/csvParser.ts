import Papa from 'papaparse';
import { ReagentItem } from '../types';

/**
 * Normaliza nombres de columnas para detección inteligente
 */
function normalizeHeader(h: string): string {
  return h
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar tildes
    .replace(/[^a-z0-9]/g, ''); // Solo alfanumérico
}

/**
 * Intenta mapear una fila CSV a un objeto ReagentItem
 */
export function mapCsvRowToReagent(row: Record<string, any>, index: number): ReagentItem | null {
  const keys = Object.keys(row);
  if (keys.length === 0) return null;

  let nombre = '';
  let categoria = 'General';
  let imageUrl = '';
  let formula = '';
  let cas = '';
  let ubicacion = '';
  let carpetaDrive = '';
  let peligroStr = '';
  let descripcion = '';
  let precauciones = '';
  let pureza = '';
  let temperatura = '';

  for (const key of keys) {
    const norm = normalizeHeader(key);
    const val = String(row[key] || '').trim();
    if (!val) continue;

    // Nombre
    if (norm === 'nombre' || norm === 'reactivo' || norm === 'nombrereactivo' || norm === 'producto' || norm === 'name' || norm === 'item') {
      nombre = val;
    }
    // Categoría
    else if (norm === 'categoria' || norm === 'category' || norm === 'tipo' || norm === 'clasificacion' || norm === 'grupo') {
      categoria = val;
    }
    // URL / Imagen
    else if (
      norm === 'url' ||
      norm === 'imagen' ||
      norm === 'image' ||
      norm === 'imageurl' ||
      norm === 'link' ||
      norm === 'enlace' ||
      norm === 'linkdrive' ||
      norm === 'drivelink' ||
      norm === 'urlimagen' ||
      norm === 'foto' ||
      norm === 'archivo' ||
      norm === 'fichatecnica' ||
      norm === 'linkimagen'
    ) {
      imageUrl = val;
    }
    // Fórmula química
    else if (norm === 'formula' || norm === 'formulaquimica' || norm === 'chemicalformula') {
      formula = val;
    }
    // CAS
    else if (norm === 'cas' || norm === 'casno' || norm === 'numerocas' || norm === 'codigocas') {
      cas = val;
    }
    // Ubicación
    else if (norm === 'ubicacion' || norm === 'location' || norm === 'estante' || norm === 'laboratorio' || norm === 'almacen') {
      ubicacion = val;
    }
    // Carpeta Drive
    else if (norm === 'carpetadrive' || norm === 'carpeta' || norm === 'folder' || norm === 'directorio') {
      carpetaDrive = val;
    }
    // Peligros / Riesgos
    else if (norm === 'peligro' || norm === 'peligros' || norm === 'riesgo' || norm === 'riesgos' || norm === 'ghs' || norm === 'pictogramas') {
      peligroStr = val;
    }
    // Descripción
    else if (norm === 'descripcion' || norm === 'description' || norm === 'detalles' || norm === 'observaciones') {
      descripcion = val;
    }
    // Precauciones
    else if (norm === 'precauciones' || norm === 'seguridad' || norm === 'precaucion' || norm === 'epp') {
      precauciones = val;
    }
    // Pureza
    else if (norm === 'pureza' || norm === 'concentracion' || norm === 'grado') {
      pureza = val;
    }
    // Temperatura
    else if (norm === 'temperatura' || norm === 'almacenamiento' || norm === 'temp') {
      temperatura = val;
    }
  }

  // Si no se encontró por nombre específico, tomar la primera columna con texto
  if (!nombre && keys[0] && row[keys[0]]) {
    nombre = String(row[keys[0]]).trim();
  }

  // Si no se encontró imagen, buscar cualquier valor que parezca una URL o ID de Drive
  if (!imageUrl) {
    for (const key of keys) {
      const v = String(row[key] || '').trim();
      if (v.startsWith('http://') || v.startsWith('https://') || v.includes('drive.google.com') || v.length > 25 && /^[a-zA-Z0-9_-]+$/.test(v)) {
        imageUrl = v;
        break;
      }
    }
  }

  if (!nombre && !imageUrl) {
    return null;
  }

  const peligrosArray = peligroStr
    ? peligroStr.split(/[,;|]/).map((p) => p.trim()).filter(Boolean)
    : undefined;

  return {
    id: `item-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 6)}`,
    nombre: nombre || `Reactivo ${index + 1}`,
    categoria: categoria || 'Sin categoría',
    imageUrl: imageUrl || '',
    formula: formula || undefined,
    cas: cas || undefined,
    ubicacion: ubicacion || undefined,
    carpetaDrive: carpetaDrive || undefined,
    peligro: peligrosArray && peligrosArray.length > 0 ? peligrosArray : undefined,
    descripcion: descripcion || undefined,
    precauciones: precauciones || undefined,
    pureza: pureza || undefined,
    temperaturaAlmacenamiento: temperatura || undefined,
    fechaRegistro: new Date().toISOString().split('T')[0],
  };
}

/**
 * Parsea un archivo CSV o string de texto
 */
export function parseReagentsCsv(csvContent: string): Promise<ReagentItem[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      complete: (results) => {
        if (!results.data || results.data.length === 0) {
          resolve([]);
          return;
        }

        const items: ReagentItem[] = [];
        results.data.forEach((row, idx) => {
          const item = mapCsvRowToReagent(row as Record<string, any>, idx);
          if (item) {
            items.push(item);
          }
        });

        resolve(items);
      },
      error: (err) => {
        reject(err);
      },
    });
  });
}

/**
 * Exporta el catálogo actual a un archivo CSV descargable
 */
export function exportToCsv(items: ReagentItem[], fileName = 'catalogo_reactivos.csv') {
  const rows = items.map((item) => ({
    nombre: item.nombre,
    categoria: item.categoria,
    formula: item.formula || '',
    cas: item.cas || '',
    ubicacion: item.ubicacion || '',
    carpeta_drive: item.carpetaDrive || '',
    url_imagen: item.imageUrl || '',
    peligros: (item.peligro || []).join('; '),
    pureza: item.pureza || '',
    almacenamiento: item.temperaturaAlmacenamiento || '',
    descripcion: item.descripcion || '',
    precauciones: item.precauciones || '',
  }));

  const csv = Papa.unparse(rows, {
    quotes: true,
  });

  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Genera el CSV de plantilla modelo para que el usuario lo llene
 */
export function generateSampleCsvContent(): string {
  const sampleData = [
    {
      nombre: 'Ácido Clorhídrico 37%',
      categoria: 'Ácidos',
      formula: 'HCl',
      cas: '7647-01-0',
      ubicacion: 'Armario A1 - Ácidos',
      carpeta_drive: 'Laboratorio_Quimica/Acidos',
      url_imagen: 'https://drive.google.com/file/d/1SAMPLE_DRIVE_ID_AQUI/view?usp=sharing',
      peligros: 'Corrosivo; Tóxico',
      pureza: '37% P.A.',
      almacenamiento: 'Ambiente (15-25°C)',
      descripcion: 'Solución acuosa incolora de cloruro de hidrógeno, altamente fumante y corrosiva.',
      precauciones: 'Manipular en campana de extracción. Usar guantes de nitrilo y gafas de seguridad.',
    },
    {
      nombre: 'Hidróxido de Sodio en Lentejas',
      categoria: 'Bases',
      formula: 'NaOH',
      cas: '1310-73-2',
      ubicacion: 'Armario B2 - Bases',
      carpeta_drive: 'Laboratorio_Quimica/Bases',
      url_imagen: 'https://drive.google.com/file/d/1SAMPLE_DRIVE_ID_BASE/view?usp=sharing',
      peligros: 'Corrosivo',
      pureza: '98.5%',
      almacenamiento: 'Lugar seco, cerrado herméticamente',
      descripcion: 'Base fuerte delicuescente en forma de lentejas blancas.',
      precauciones: 'Disolución exotérmica. Proteger ojos y piel obligatoriamente.',
    },
    {
      nombre: 'Etanol Absoluto 99.8%',
      categoria: 'Solventes Orgánicos',
      formula: 'C2H5OH',
      cas: '64-17-5',
      ubicacion: 'Gabinete Anti-Fuego F1',
      carpeta_drive: 'Laboratorio_Quimica/Solventes',
      url_imagen: 'https://drive.google.com/file/d/1SAMPLE_DRIVE_ID_ETANOL/view?usp=sharing',
      peligros: 'Inflamable; Irritante',
      pureza: '99.8% Grado Reactivo',
      almacenamiento: 'Lejos de fuentes de calor y chispas',
      descripcion: 'Líquido incoloro volátil con olor característico agradable.',
      precauciones: 'Mantener envase cerrado. No calentar a llama directa.',
    }
  ];

  return Papa.unparse(sampleData, { quotes: true });
}
