import { RequestParams } from "../../../../core/config/api.config";
import { ApiResponse } from "../../../../core/model/api-response.model";

/**
 * Modelo de datos para ProductCategory
 */
export interface ProductCategory {
    categoryItemCode: string;         // Código único de la categoría (PK)
    categoryItemName: string;         // Nombre de la categoría (requerido)
    frgnName?: string;                // Nombre en idioma extranjero
    imageUrl?: string;                // URL de imagen de la categoría
    description?: string;             // Descripción de la categoría
    frgnDescription?: string;         // Descripción en idioma extranjero
    visOrder: number;                 // Orden de visualización (requerido)
    enabled: string;                  // Estado habilitado (Y/N) (requerido)
    dataSource: string;               // Fuente de datos (requerido)
    groupItemCode?: string;           // Código del grupo al que pertenece
  }
  
  /**
   * Modelo de respuesta paginada para categorías de productos
   */
  export interface ProductCategoryPagedResponse extends ApiResponse<ProductCategory> {}
  
  /**
   * Parámetros para filtrar categorías de productos
   */
  export interface ProductCategoryFilterParams extends RequestParams {
    search?: string;
    groupItemCode?: string;           // Filtrar por grupo específico
  }
  
  /**
   * Parámetros para crear/actualizar categoría de productos
   */
  export interface ProductCategoryCreateRequest {
    categoryItemCode: string;
    categoryItemName: string;
    frgnName?: string;
    imageUrl?: string;
    description?: string;
    frgnDescription?: string;
    visOrder: number;
    enabled: string;                  // 'Y' o 'N'
    dataSource: string;
    groupItemCode?: string;
  }
  
  export interface ProductCategoryUpdateRequest extends ProductCategoryCreateRequest {}
  