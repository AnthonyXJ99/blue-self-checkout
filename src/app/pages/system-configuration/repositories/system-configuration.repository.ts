import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { SystemConfigurationApiService } from '../../service/system-configuration-api.service';
import {
  SyncConfigurationDto,
  CreateSyncConfigurationDto,
  UpdateSyncConfigurationDto,
  ToggleActiveResponse,
  SyncConfigurationFilterParams,
  DEFAULT_SYNC_CONFIGURATION,
  SYNC_CONFIG_VALIDATION
} from '../models/sync-configuration.model';

@Injectable({ providedIn: 'root' })
export class SystemConfigurationRepository {
  constructor(private apiService: SystemConfigurationApiService) {}

  /**
   * Obtener todas las configuraciones
   */
  getAll(): Observable<SyncConfigurationDto[]> {
    return this.apiService.getAll().pipe(
      catchError(() => of([]))
    );
  }

  /**
   * Obtener configuración por ID
   */
  getById(id: number): Observable<SyncConfigurationDto | null> {
    return this.apiService.getById(id).pipe(
      catchError(() => of(null))
    );
  }

  /**
   * Obtener configuración por código POS
   */
  getByPosCode(posCode: string): Observable<SyncConfigurationDto | null> {
    return this.apiService.getByPosCode(posCode).pipe(
      catchError(() => of(null))
    );
  }

  /**
   * Obtener configuración global
   */
  getGlobal(): Observable<SyncConfigurationDto | null> {
    return this.apiService.getGlobal().pipe(
      catchError(() => of(null))
    );
  }

  /**
   * Crear nueva configuración
   */
  create(data: CreateSyncConfigurationDto): Observable<SyncConfigurationDto | null> {
    return this.apiService.create(data).pipe(
      catchError(() => of(null))
    );
  }

  /**
   * Actualizar configuración
   */
  update(id: number, data: UpdateSyncConfigurationDto): Observable<SyncConfigurationDto | null> {
    return this.apiService.update(id, data).pipe(
      catchError(() => of(null))
    );
  }

  /**
   * Eliminar configuración
   */
  delete(id: number): Observable<boolean> {
    return this.apiService.delete(id).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  /**
   * Toggle estado activo
   */
  toggleActive(id: number): Observable<ToggleActiveResponse | null> {
    return this.apiService.toggleActive(id).pipe(
      catchError(() => of(null))
    );
  }

  /**
   * Filtrar configuraciones
   */
  filterConfigurations(
    configurations: SyncConfigurationDto[],
    filters: SyncConfigurationFilterParams
  ): SyncConfigurationDto[] {
    let filtered = [...configurations];

    // Filtrar por tipo
    if (filters.configType && (filters.configType === 'GLOBAL' || filters.configType === 'SPECIFIC')) {
      filtered = filtered.filter(config => config.configType === filters.configType);
    }

    // Filtrar por estado activo
    if (filters.isActive !== null && filters.isActive !== undefined) {
      filtered = filtered.filter(config => config.isActive === filters.isActive);
    }

    // Filtrar por búsqueda de texto
    if (filters.search && filters.search.trim() !== '') {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(config =>
        config.configName.toLowerCase().includes(searchLower) ||
        config.description?.toLowerCase().includes(searchLower) ||
        config.posCode?.toLowerCase().includes(searchLower) ||
        config.posName?.toLowerCase().includes(searchLower)
      );
    }

    // Filtrar por POS específico
    if (filters.posCode) {
      filtered = filtered.filter(config => config.posCode === filters.posCode);
    }

    return filtered;
  }

  /**
   * Crear configuración por defecto
   */
  createDefaultConfiguration(isGlobal: boolean = false): Partial<CreateSyncConfigurationDto> {
    return {
      ...DEFAULT_SYNC_CONFIGURATION,
      posCode: isGlobal ? null : undefined,
      configName: isGlobal ? 'Configuración Global' : '',
      description: isGlobal ? 'Configuración predeterminada para todos los POS' : ''
    };
  }

  /**
   * Validar configuración antes de guardar
   */
  validateConfiguration(config: CreateSyncConfigurationDto | UpdateSyncConfigurationDto): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Validar configName
    if (!config.configName || config.configName.trim() === '') {
      errors.push('El nombre de configuración es requerido');
    } else if (config.configName.length > SYNC_CONFIG_VALIDATION.configName.maxLength) {
      errors.push(`El nombre no debe exceder ${SYNC_CONFIG_VALIDATION.configName.maxLength} caracteres`);
    }

    // Validar syncIntervalMinutes
    if (config.syncIntervalMinutes !== undefined) {
      const { min, max } = SYNC_CONFIG_VALIDATION.syncIntervalMinutes;
      if (config.syncIntervalMinutes < min || config.syncIntervalMinutes > max) {
        errors.push(`El intervalo de sincronización debe estar entre ${min} y ${max} minutos`);
      }
    }

    // Validar maxRetries
    if (config.maxRetries !== undefined) {
      const { min, max } = SYNC_CONFIG_VALIDATION.maxRetries;
      if (config.maxRetries < min || config.maxRetries > max) {
        errors.push(`Los reintentos máximos deben estar entre ${min} y ${max}`);
      }
    }

    // Validar retryDelayMinutes
    if (config.retryDelayMinutes !== undefined) {
      const { min, max } = SYNC_CONFIG_VALIDATION.retryDelayMinutes;
      if (config.retryDelayMinutes < min || config.retryDelayMinutes > max) {
        errors.push(`El delay de reintentos debe estar entre ${min} y ${max} minutos`);
      }
    }

    // Validar connectivityCheckSeconds
    if (config.connectivityCheckSeconds !== undefined) {
      const { min, max } = SYNC_CONFIG_VALIDATION.connectivityCheckSeconds;
      if (config.connectivityCheckSeconds < min || config.connectivityCheckSeconds > max) {
        errors.push(`El chequeo de conectividad debe estar entre ${min} y ${max} segundos`);
      }
    }

    // Validar serverPingTimeoutSeconds
    if (config.serverPingTimeoutSeconds !== undefined) {
      const { min, max } = SYNC_CONFIG_VALIDATION.serverPingTimeoutSeconds;
      if (config.serverPingTimeoutSeconds < min || config.serverPingTimeoutSeconds > max) {
        errors.push(`El timeout de ping debe estar entre ${min} y ${max} segundos`);
      }
    }

    // Validar batchSize
    if (config.batchSize !== undefined) {
      const { min, max } = SYNC_CONFIG_VALIDATION.batchSize;
      if (config.batchSize < min || config.batchSize > max) {
        errors.push(`El tamaño de lote debe estar entre ${min} y ${max}`);
      }
    }

    // Validar priority
    if (config.priority !== undefined) {
      const { min, max } = SYNC_CONFIG_VALIDATION.priority;
      if (config.priority < min || config.priority > max) {
        errors.push(`La prioridad debe estar entre ${min} y ${max}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Verificar si es configuración global
   */
  isGlobalConfiguration(config: SyncConfigurationDto): boolean {
    return this.apiService.isGlobalConfig(config);
  }

  /**
   * Ordenar configuraciones (global primero, luego por prioridad)
   */
  sortConfigurations(configurations: SyncConfigurationDto[]): SyncConfigurationDto[] {
    return [...configurations].sort((a, b) => {
      // Global siempre primero
      if (this.isGlobalConfiguration(a) && !this.isGlobalConfiguration(b)) return -1;
      if (!this.isGlobalConfiguration(a) && this.isGlobalConfiguration(b)) return 1;

      // Luego por prioridad (mayor primero)
      if (a.priority !== b.priority) return b.priority - a.priority;

      // Finalmente por nombre
      return a.configName.localeCompare(b.configName);
    });
  }

  /**
   * Obtener estadísticas de configuraciones
   */
  getStatistics(configurations: SyncConfigurationDto[]): {
    total: number;
    active: number;
    inactive: number;
    global: number;
    specific: number;
  } {
    return {
      total: configurations.length,
      active: configurations.filter(c => c.isActive).length,
      inactive: configurations.filter(c => !c.isActive).length,
      global: configurations.filter(c => this.isGlobalConfiguration(c)).length,
      specific: configurations.filter(c => !this.isGlobalConfiguration(c)).length
    };
  }
}