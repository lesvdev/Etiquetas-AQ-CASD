import React from 'react';
import {
  Search,
  X,
  SlidersHorizontal,
  LayoutGrid,
  List,
  FolderTree,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { ViewMode } from '../types';

interface SearchAndFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  categories: { name: string; count: number }[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  dangerTypes: string[];
  selectedDanger: string | null;
  onSelectDanger: (danger: string | null) => void;
  folders: string[];
  selectedFolder: string | null;
  onSelectFolder: (folder: string | null) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  totalFiltered: number;
  totalAll: number;
  onResetFilters: () => void;
}

export const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
  searchTerm,
  onSearchChange,
  categories,
  selectedCategory,
  onSelectCategory,
  dangerTypes,
  selectedDanger,
  onSelectDanger,
  folders,
  selectedFolder,
  onSelectFolder,
  viewMode,
  onViewModeChange,
  totalFiltered,
  totalAll,
  onResetFilters,
}) => {
  const hasActiveFilters = Boolean(
    searchTerm || selectedCategory || selectedDanger || selectedFolder
  );

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
      {/* Top row: Search input & View toggles */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search Bar */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            id="input-main-search"
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar reactivo por nombre, fórmula (H₂SO₄), CAS (7664-93-9), ubicación..."
            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-teal-500 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-3 focus:ring-teal-500/15 transition-all"
          />
          {searchTerm && (
            <button
              id="btn-clear-search"
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              title="Borrar búsqueda"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* View Mode & Reset Controls */}
        <div className="flex items-center gap-2 justify-between sm:justify-end">
          {/* Folders Dropdown */}
          {folders.length > 0 && (
            <div className="relative">
              <select
                id="select-folder-filter"
                value={selectedFolder || ''}
                onChange={(e) => onSelectFolder(e.target.value || null)}
                className="text-xs sm:text-sm font-medium py-2 pl-2.5 pr-8 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer max-w-[160px] sm:max-w-[200px] truncate"
              >
                <option value="">Todas las carpetas</option>
                {folders.map((f) => (
                  <option key={f} value={f}>
                    📁 {f}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* View Mode Toggle Buttons */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/60">
            <button
              id="btn-view-grid"
              onClick={() => onViewModeChange('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-teal-700 shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Vista de cuadrícula con imagen"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              id="btn-view-table"
              onClick={() => onViewModeChange('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-teal-700 shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Vista en tabla detallada"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              id="btn-reset-filters"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200/60 rounded-xl transition-colors"
              title="Restablecer todos los filtros"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Limpiar</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Pills Row */}
      <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-100">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">
          Categoría:
        </span>
        <button
          id="chip-category-all"
          onClick={() => onSelectCategory(null)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            selectedCategory === null
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
          }`}
        >
          Todas ({totalAll})
        </button>

        {categories.map((cat) => (
          <button
            key={cat.name}
            id={`chip-category-${cat.name.replace(/\s+/g, '-').toLowerCase()}`}
            onClick={() => onSelectCategory(selectedCategory === cat.name ? null : cat.name)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1.5 ${
              selectedCategory === cat.name
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            <span>{cat.name}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                selectedCategory === cat.name
                  ? 'bg-teal-700 text-teal-100'
                  : 'bg-slate-200/80 text-slate-600'
              }`}
            >
              {cat.count}
            </span>
          </button>
        ))}
      </div>

      {/* Danger (GHS) tag filters */}
      {dangerTypes.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap pt-1 text-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1 inline-flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-amber-500" />
            Riesgo:
          </span>
          {dangerTypes.map((danger) => {
            const isSelected = selectedDanger === danger;
            return (
              <button
                key={danger}
                id={`chip-danger-${danger.replace(/\s+/g, '-').toLowerCase()}`}
                onClick={() => onSelectDanger(isSelected ? null : danger)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/60'
                }`}
              >
                ⚠️ {danger}
              </button>
            );
          })}
        </div>
      )}

      {/* Filter status line */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
        <div>
          Mostrando <strong className="text-slate-800">{totalFiltered}</strong> de{' '}
          <strong className="text-slate-800">{totalAll}</strong> reactivos
          {hasActiveFilters && (
            <span className="text-teal-600 ml-1.5 font-medium">(filtrado)</span>
          )}
        </div>
      </div>
    </div>
  );
};
