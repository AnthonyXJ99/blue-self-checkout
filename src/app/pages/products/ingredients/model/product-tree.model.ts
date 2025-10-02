import { RequestParams } from "../../../../core/config/api.config";
import { ApiResponse } from "../../../../core/model/api-response.model";

/**
 * Modelo para Material/Ingrediente dentro del ProductTree
 */
export interface ProductTreeItem {
  itemCode: string;
  lineNumber?: number;  // Optional - assigned by backend
  itemName: string;
  quantity: number;
  imageUrl?: string;
  isCustomizable?: string;
  productTreeItemCode: string;
  comboItemCode: string;  // NUEVO: Requerido por el backend
}

/**
 * Modelo principal de ProductTree (Ingredientes/Materiales)
 */
export interface ProductTree {
  itemCode: string;               // Código único del ingrediente (PK)
  itemName: string;               // Nombre del ingrediente
  quantity: number;               // Cantidad
  enabled: string;                // Habilitado (Y/N)
  dataSource: string;             // Fuente de datos
  items1: ProductTreeItem[];      // Lista de materiales/componentes
}

/**
 * DTO para crear ProductTree
 */
export interface ProductTreeCreateRequest {
  itemCode: string;
  itemName: string;
  quantity: number;
  enabled: string;                // Y/N
  dataSource: string;
  items1?: ProductTreeItemCreateRequest[];
}

/**
 * DTO para actualizar ProductTree
 */
export interface ProductTreeUpdateRequest {
  itemCode?: string;
  itemName?: string;
  quantity?: number;
  enabled?: string;               // Y/N
  dataSource?: string;
  items1?: ProductTreeItemUpdateRequest[];
}

/**
 * DTO para crear ProductTreeItem
 */
export interface ProductTreeItemCreateRequest {
  itemCode: string;
  itemName: string;
  quantity: number;
  imageUrl?: string;
  isCustomizable: string;  // Y/N
  productTreeItemCode: string;
  comboItemCode: string;  // NUEVO: Requerido por el backend
}

/**
 * DTO para actualizar ProductTreeItem
 */
export interface ProductTreeItemUpdateRequest {
  itemCode?: string;
  itemName?: string;
  quantity?: number;
  imageUrl?: string;
  isCustomizable: string;
  productTreeItemCode?: string;
  comboItemCode?: string;  // NUEVO: Opcional para actualización
}

/**
 * Respuesta paginada para ProductTrees
 */
export interface ProductTreePagedResponse extends ApiResponse<ProductTree> {}

/**
 * Parámetros de filtro para ProductTrees
 */
export interface ProductTreeFilterParams extends Omit<RequestParams, 'enabled'> {
  search?: string;
  enabled?: string;               // Y/N (sobrescribe el boolean de RequestParams)
  dataSource?: string;
  minQuantity?: number;
  maxQuantity?: number;
}

/**
 * Tipos de fuente de datos
 */
export type DataSource = 'Internal' | 'External' | 'Mixed';

/**
 * Estados de habilitado
 */
export enum EnabledStatus {
  YES = 'Y',
  NO = 'N'
}

/**
 * Opciones para selects de UI
 */
export interface SelectOption {
  label: string;
  value: string;
}