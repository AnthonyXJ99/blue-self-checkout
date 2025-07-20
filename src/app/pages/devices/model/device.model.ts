import { RequestParams } from "../../../core/config/api.config";
import { ApiResponse } from "../../../core/model/api-response.model";

/**
 * Modelo de datos para Device
 */
export interface Device {
    deviceCode: string;           // Código único del dispositivo (PK)
    deviceName: string;           // Nombre descriptivo del dispositivo (requerido)
    enabled: string;              // Estado habilitado (Y/N) (requerido)
    ipAddress: string;            // Dirección IP del dispositivo (requerido)
    dataSource: string;           // Fuente de datos (requerido)
  }

/**
 * Modelo de respuesta paginada para dispositivos
 */
export interface DevicePagedResponse extends ApiResponse<Device> {}

/**
 * Parámetros para filtrar dispositivos
 */
export interface DeviceFilterParams extends RequestParams {
  search?: string;
}

/**
 * Parámetros para crear/actualizar dispositivo
 */
export interface DeviceCreateRequest {
  deviceCode: string;
  deviceName: string;
  enabled: string;              // 'Y' o 'N'
  ipAddress: string;
  dataSource: string;
}

export interface DeviceUpdateRequest extends DeviceCreateRequest {}