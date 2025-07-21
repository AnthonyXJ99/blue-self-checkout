import { RequestParams } from "../../../../core/config/api.config";
import { ApiResponse } from "../../../../core/model/api-response.model";

/**
 * Modelo de datos para PointOfSale según swagger ACTUALIZADO
 */
export interface PointOfSale {
  posCode: string;                // Código único del POS (PK) (requerido, max 50)
  posName: string;                // Nombre del POS (requerido, max 150)
  ipAddress?: string;             // Dirección IP del POS (opcional, max 50)
  enabled: string;                // Estado habilitado Y/N (requerido, 1 char)
  datasource?: string;            // Fuente de datos (opcional, 1 char)
  sisCode?: string;               // Código en sistema SIS (opcional, max 20)
  taxIdentNumber?: string;        // Número de identificación fiscal/RUT (opcional, max 20)
  // ❌ deviceCode ELIMINADO del swagger
}

/**
 * Modelo de respuesta paginada para PointOfSales
 */
export interface PointOfSalePagedResponse extends ApiResponse<PointOfSale> {}

/**
 * Parámetros para filtrar PointOfSales
 */
export interface PointOfSaleFilterParams extends RequestParams {
  search?: string;                // Búsqueda general
  enabled?: boolean;               // Filtro por estado (Y/N)
  datasource?: string;            // Filtro por fuente de datos
  hasIpAddress?: boolean;         // Filtro por POS con IP configurada
}

/**
 * Parámetros para crear PointOfSale
 */
export interface PointOfSaleCreateRequest {
  posCode: string;
  posName: string;
  ipAddress?: string;
  enabled: string;                // 'Y' o 'N'
  datasource?: string;
  sisCode?: string;
  taxIdentNumber?: string;
}

/**
 * Parámetros para actualizar PointOfSale
 */
export interface PointOfSaleUpdateRequest extends PointOfSaleCreateRequest {}

/**
 * Modelo para validación de conectividad
 */
export interface ConnectivityStatus {
  posCode: string;
  ipAddress: string;
  isReachable: boolean;
  responseTime?: number;
  lastChecked: Date;
  error?: string;
}
