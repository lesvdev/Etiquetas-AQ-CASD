export interface ReagentItem {
  id: string;
  nombre: string;
  categoria: string;
  formula?: string;
  cas?: string;
  ubicacion?: string;
  imageUrl: string;
  carpetaDrive?: string;
  peligro?: string[];
  descripcion?: string;
  precauciones?: string;
  temperaturaAlmacenamiento?: string;
  pureza?: string;
  fechaRegistro?: string;
  // Campos del Estándar SGA / GHS
  palabraAdvertencia?: 'PELIGRO' | 'ATENCIÓN' | 'SIN_PALABRA' | string;
  pictogramasSga?: string[]; // ej. ['GHS02', 'GHS07']
  frasesH?: string[]; // ej. ['H225: Líquido...', 'H319: Irritación...']
  frasesP?: string[]; // ej. ['P210: Mantener alejado...', 'P280: Usar EPP...']
  proveedor?: string; // ej. Merck, PanReac, Sigma-Aldrich
  lote?: string;
}

export type ViewMode = 'grid' | 'table' | 'compact';

export interface CsvColumnMapping {
  nombre: string;
  categoria: string;
  imageUrl: string;
  formula?: string;
  cas?: string;
  ubicacion?: string;
  carpetaDrive?: string;
  peligro?: string;
  descripcion?: string;
  precauciones?: string;
}
