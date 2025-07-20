import { RequestParams } from "../../../../core/config/api.config";
import { ApiResponse } from "../../../../core/model/api-response.model";

/**
 * Modelo de datos para ProductGroup
 */
export interface ProductGroup {
    productGroupCode: string;         // Código único del grupo (PK)
    productGroupName: string;         // Nombre del grupo (requerido)
    frgnName?: string;                // Nombre en idioma extranjero
    imageUrl?: string;                // URL de imagen del grupo
    description?: string;             // Descripción del grupo
    frgnDescription?: string;         // Descripción en idioma extranjero
    enabled: string;                  // Estado habilitado (Y/N) (requerido)
    visOrder: number;                 // Orden de visualización (requerido)
    dataSource: string;               // Fuente de datos (requerido)
    productGroupCodeERP?: string;     // Código del grupo en ERP
    productGroupCodePOS?: string;     // Código del grupo en POS
  }
  
  /**
   * Modelo de respuesta paginada para grupos de productos
   */
  export interface ProductGroupPagedResponse extends ApiResponse<ProductGroup> {}
  
  /**
   * Parámetros para filtrar grupos de productos
   */
  export interface ProductGroupFilterParams extends RequestParams {
    search?: string;
  }
  
  /**
   * Parámetros para crear/actualizar grupo de productos
   */
  export interface ProductGroupCreateRequest {
    productGroupCode: string;
    productGroupName: string;
    frgnName?: string;
    imageUrl?: string;
    description?: string;
    frgnDescription?: string;
    enabled: string;                  // 'Y' o 'N'
    visOrder: number;
    dataSource: string;
    productGroupCodeERP?: string;
    productGroupCodePOS?: string;
  }
  
  export interface ProductGroupUpdateRequest extends ProductGroupCreateRequest {}
  