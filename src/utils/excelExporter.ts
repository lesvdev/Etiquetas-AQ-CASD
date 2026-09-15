import * as XLSX from 'xlsx';
import { ReagentItem } from '../types';

/**
 * Exporta el catálogo completo de reactivos a un archivo Excel (.xlsx) profesional y formateado.
 */
export function exportToExcel(reagents: ReagentItem[], fileName = 'Catalogo_Reactivos_CASD.xlsx') {
  const data = reagents.map((r, index) => ({
    'N°': index + 1,
    'Nombre del Reactivo': r.nombre,
    'Fórmula Química': r.formula || '',
    'Número CAS': r.cas || '',
    'Categoría': r.categoria || 'General',
    'Ubicación en Laboratorio': r.ubicacion || '',
    'Nombre de Archivo / Fotografía': r.imageUrl?.startsWith('data:') ? 'Imagen cargada en memoria' : (r.imageUrl || ''),
    'Carpeta en Drive': r.carpetaDrive || '',
    'Peligros': Array.isArray(r.peligro) ? r.peligro.join(', ') : (r.peligro || ''),
    'Precauciones de Seguridad': r.precauciones || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);

  // Ajustar anchos de columnas automáticamente
  worksheet['!cols'] = [
    { wch: 5 },   // N°
    { wch: 38 },  // Nombre
    { wch: 18 },  // Fórmula
    { wch: 14 },  // CAS
    { wch: 24 },  // Categoría
    { wch: 28 },  // Ubicación
    { wch: 42 },  // Nombre de Archivo
    { wch: 25 },  // Carpeta Drive
    { wch: 22 },  // Peligros
    { wch: 35 },  // Precauciones
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Reactivos CASD');

  XLSX.writeFile(workbook, fileName);
}
