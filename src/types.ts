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
