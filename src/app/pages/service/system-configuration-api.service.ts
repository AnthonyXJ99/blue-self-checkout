import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiService } from '../../core/services/api.service';
import { API_CONFIG } from '../../core/config/api.config';
import {
  SyncConfigurationDto,
  CreateSyncConfigurationDto,
  UpdateSyncConfigurationDto,
  ToggleActiveResponse
} from '../system-configuration/models/sync-configuration.model';

@Injectable({
  providedIn: 'root'
})
export class SystemConfigurationApiService {
  private readonly endpoint = API_CONFIG.ENDPOINTS.SYSTEM_CONFIGURATION;

  constructor(private apiService: ApiService) {}

  /**
   * Obtener todas las configuraciones
   * GET /api/systemconfiguration
   */
  getAll(): Observable<SyncConfigurationDto[]> {
    console.log('🔍 SystemConfigurationApiService.getAll()');
    return this.apiService.get<SyncConfigurationDto[]>(this.endpoint).pipe(
      catchError(error => {
        console.error('❌ Error getting all configurations:', error);
        throw error;
      })
    );
  }

  /**
   * Obtener configuración por ID
   * GET /api/systemconfiguration/{id}
   */
  getById(id: number): Observable<SyncConfigurationDto> {
    console.log('🔍 SystemConfigurationApiService.getById():', id);
    return this.apiService.get<SyncConfigurationDto>(`${this.endpoint}/${id}`).pipe(
      catchError(error => {
        console.error(`❌ Error getting configuration ${id}:`, error);
        throw error;
      })
    );
  }

  /**
   * Obtener configuración por código de POS
   * GET /api/systemconfiguration/pos/{posCode}
   * Hace fallback a configuración global si no existe específica
   */
  getByPosCode(posCode: string): Observable<SyncConfigurationDto> {
    console.log('🔍 SystemConfigurationApiService.getByPosCode():', posCode);
    return this.apiService.get<SyncConfigurationDto>(`${this.endpoint}/pos/${posCode}`).pipe(
      catchError(error => {
        console.error(`❌ Error getting configuration for POS ${posCode}:`, error);
        throw error;
      })
    );
  }

  /**
   * Obtener solo la configuración global
   * GET /api/systemconfiguration/global
   */
  getGlobal(): Observable<SyncConfigurationDto> {
    console.log('🔍 SystemConfigurationApiService.getGlobal()');
    return this.apiService.get<SyncConfigurationDto>(`${this.endpoint}/global`).pipe(
      catchError(error => {
        console.error('❌ Error getting global configuration:', error);
        throw error;
      })
    );
  }

  /**
   * Crear nueva configuración
   * POST /api/systemconfiguration
   */
  create(data: CreateSyncConfigurationDto): Observable<SyncConfigurationDto> {
    console.log('➕ SystemConfigurationApiService.create():', data);
    return this.apiService.post<SyncConfigurationDto>(this.endpoint, data).pipe(
      catchError(error => {
        console.error('❌ Error creating configuration:', error);
        throw error;
      })
    );
  }

  /**
   * Actualizar configuración existente
   * PUT /api/systemconfiguration/{id}
   */
  update(id: number, data: UpdateSyncConfigurationDto): Observable<SyncConfigurationDto> {
    console.log('✏️ SystemConfigurationApiService.update():', id, data);
    return this.apiService.put<SyncConfigurationDto>(`${this.endpoint}/${id}`, data).pipe(
      catchError(error => {
        console.error(`❌ Error updating configuration ${id}:`, error);
        throw error;
      })
    );
  }

  /**
   * Eliminar configuración
   * DELETE /api/systemconfiguration/{id}
   * No permite eliminar la configuración global
   */
  delete(id: number): Observable<void> {
    console.log('🗑️ SystemConfigurationApiService.delete():', id);
    return this.apiService.delete<void>(`${this.endpoint}/${id}`).pipe(
      catchError(error => {
        console.error(`❌ Error deleting configuration ${id}:`, error);
        throw error;
      })
    );
  }

  /**
   * Activar/Desactivar configuración
   * PATCH /api/systemconfiguration/{id}/toggle
   */
  toggleActive(id: number): Observable<ToggleActiveResponse> {
    console.log('🔄 SystemConfigurationApiService.toggleActive():', id);
    return this.apiService.patch<ToggleActiveResponse>(`${this.endpoint}/${id}/toggle`, {}).pipe(
      catchError(error => {
        console.error(`❌ Error toggling configuration ${id}:`, error);
        throw error;
      })
    );
  }

  /**
   * Validar si una configuración es global
   */
  isGlobalConfig(config: SyncConfigurationDto): boolean {
    return config.posCode === null || config.configType === 'GLOBAL';
  }

  /**
   * Validar si un POS ya tiene configuración
   */
  hasPosConfig(configurations: SyncConfigurationDto[], posCode: string): boolean {
    return configurations.some(config => config.posCode === posCode);
  }
}