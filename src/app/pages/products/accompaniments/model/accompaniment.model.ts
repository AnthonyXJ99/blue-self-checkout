import { RequestParams } from "../../../../core/config/api.config";
import { ApiResponse } from "../../../../core/model/api-response.model";

/**
 * Modelo para un acompañamiento dentro de una categoría
 */
export interface CategoryAccompaniment {
  lineNumber: number;
  accompanimentItemCode: string;
  accompanimentItemName: string;
  accompanimentImageUrl?: string;
  accompanimentPrice: number;
  discount?: number;
  enlargementItemCode?: string;
  enlargementDiscount?: number;
}

/**
 * Modelo para categoría con sus acompañamientos
 */
export interface CategoryWithAccompaniments {
  categoryItemCode: string;
  categoryItemName: string;
  imageUrl?: string;
  description?: string;
  availableAccompaniments: CategoryAccompaniment[];
}

/**
 * DTO para crear un acompañamiento
 */
export interface CategoryAccompanimentForCreation {
  accompanimentItemCode: string;
  discount?: number;
  enlargementItemCode?: string;
  enlargementDiscount?: number;
}

/**
 * DTO para actualizar un acompañamiento
 */
export interface CategoryAccompanimentForUpdate {
  discount?: number;
  enlargementItemCode?: string;
  enlargementDiscount?: number;
}

/**
 * DTO para actualización en lote
 */
export interface CategoryAccompanimentUpdateBatch {
  lineNumber: number;
  updateData: CategoryAccompanimentForUpdate;
}

/**
 * Producto disponible para usar como acompañamiento
 */
export interface ProductAvailable {
  itemCode: string;
  itemName: string;
  price: number;
  imageUrl?: string;
}

/**
 * Respuesta paginada para acompañamientos (si se implementa paginación)
 */
export interface AccompanimentsPagedResponse extends ApiResponse<CategoryWithAccompaniments> {}

/**
 * Parámetros de filtro para acompañamientos
 */
export interface AccompanimentFilterParams extends RequestParams {
  categoryItemCode?: string;
  accompanimentItemCode?: string;
  minPrice?: number;
  maxPrice?: number;
  hasDiscount?: boolean;
  hasEnlargement?: boolean;
}

/**
 * Opciones para selects de UI
 */
export interface SelectOption {
  label: string;
  value: string;
}

/**
 * Tipos de severidad para tags de PrimeNG
 */
export type TagSeverity = 'success' | 'info' | 'warning' | 'danger' | 'secondary';

/**
 * Estadísticas de acompañamientos
 */
export interface AccompanimentStats {
  totalCategories: number;
  totalAccompaniments: number;
  accompanimeentsWithDiscount: number;
  accompanimeentsWithEnlargement: number;
  averagePrice: number;
  averageDiscount: number;
}