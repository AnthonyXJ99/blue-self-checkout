/**
 * Modelo completo para la configuración de sincronización del sistema POS
 * Basado en sync_configurationService.json
 */

/**
 * DTO de respuesta con todos los datos de configuración
 */
export interface SyncConfigurationDto {
  id: number;
  posCode: string | null;
  posName: string | null;
  ipAddress: string | null;
  posEnabled: boolean | null;
  configName: string;
  description: string | null;
  workManagerEnabled: boolean;
  syncIntervalMinutes: number;
  maxRetries: number;
  retryDelayMinutes: number;
  exponentialBackoff: boolean;
  connectivityCheckSeconds: number;
  serverPingTimeoutSeconds: number;
  batchSize: number;
  syncOnWifiOnly: boolean;
  priority: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  configType: 'GLOBAL' | 'SPECIFIC';
}

/**
 * DTO para crear nueva configuración
 */
export interface CreateSyncConfigurationDto {
  posCode?: string | null;
  configName: string;
  description?: string | null;
  workManagerEnabled?: boolean;
  syncIntervalMinutes?: number;
  maxRetries?: number;
  retryDelayMinutes?: number;
  exponentialBackoff?: boolean;
  connectivityCheckSeconds?: number;
  serverPingTimeoutSeconds?: number;
  batchSize?: number;
  syncOnWifiOnly?: boolean;
  priority?: number;
  isActive?: boolean;
  createdBy?: string | null;
}

/**
 * DTO para actualizar configuración existente
 */
export interface UpdateSyncConfigurationDto extends CreateSyncConfigurationDto {
  id: number;
}

/**
 * Respuesta del toggle de estado activo
 */
export interface ToggleActiveResponse {
  id: number;
  isActive: boolean;
}

/**
 * Parámetros de filtro para búsqueda
 */
export interface SyncConfigurationFilterParams {
  configType?: 'GLOBAL' | 'SPECIFIC' | '';
  isActive?: boolean | null;
  search?: string;
  posCode?: string;
}

/**
 * Valores por defecto para crear nueva configuración
 */
export const DEFAULT_SYNC_CONFIGURATION: Partial<CreateSyncConfigurationDto> = {
  workManagerEnabled: true,
  syncIntervalMinutes: 15,
  maxRetries: 3,
  retryDelayMinutes: 5,
  exponentialBackoff: true,
  connectivityCheckSeconds: 120,
  serverPingTimeoutSeconds: 10,
  batchSize: 10,
  syncOnWifiOnly: false,
  priority: 0,
  isActive: true
};

/**
 * Validaciones de rangos
 */
export const SYNC_CONFIG_VALIDATION = {
  syncIntervalMinutes: { min: 1, max: 1440 },
  maxRetries: { min: 0, max: 10 },
  retryDelayMinutes: { min: 1, max: 60 },
  connectivityCheckSeconds: { min: 10, max: 3600 },
  serverPingTimeoutSeconds: { min: 1, max: 60 },
  batchSize: { min: 1, max: 100 },
  priority: { min: 0, max: 100 },
  configName: { maxLength: 100 },
  description: { maxLength: 500 },
  posCode: { maxLength: 50 },
  createdBy: { maxLength: 100 }
};