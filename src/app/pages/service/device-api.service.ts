import { Injectable } from "@angular/core";
import { ApiService } from "../../core/services/api.service";
import { API_CONFIG } from "../../core/config/api.config";
import { Device, DeviceCreateRequest, DeviceFilterParams, DevicePagedResponse, DeviceUpdateRequest } from "../devices/model/device.model";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class DeviceApiService {
    private readonly endpoint = API_CONFIG.ENDPOINTS.DEVICES;

    constructor(private apiService: ApiService) {}

    /**
   * Obtiene todos los dispositivos sin paginación
   * GET /api/Devices/all
   */
  getAllDevices(): Observable<Device[]> {
    return this.apiService.get<Device[]>(`${this.endpoint}/all`);
  }

  /**
   * Obtiene dispositivos con paginación y filtros
   * GET /api/Devices
   */
  getDevices(params?: DeviceFilterParams): Observable<DevicePagedResponse> {
    return this.apiService.getPaginated<Device>(`${this.endpoint}`, params);
  }

  /**
   * Obtiene un dispositivo específico por código
   * GET /api/Devices/{deviceCode}
   */
  getDeviceByCode(deviceCode: string): Observable<Device> {
    return this.apiService.get<Device>(`${this.endpoint}/${deviceCode}`);
  }

  /**
   * Crea un nuevo dispositivo
   * POST /api/Devices
   */
  createDevice(deviceData: DeviceCreateRequest): Observable<Device> {
    return this.apiService.post<Device>(`${this.endpoint}`, deviceData);
  }

  /**
   * Actualiza un dispositivo existente
   * PUT /api/Devices/{deviceCode}
   */
  updateDevice(deviceCode: string, deviceData: DeviceUpdateRequest): Observable<void> {
    return this.apiService.put<void>(`${this.endpoint}/${deviceCode}`, deviceData);
  }

  /**
   * Elimina un dispositivo existente
   * DELETE /api/Devices/{deviceCode}
   */
  deleteDevice(deviceCode: string): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${deviceCode}`);
  }

  // === MÉTODOS DE UTILIDAD ===

  /**
   * Valida si un estado es válido
   */
  isValidEnabledStatus(status: string): boolean {
    return ['Y', 'N'].includes(status.toUpperCase());
  }

  /**
   * Obtiene solo los dispositivos habilitados
   */
  getEnabledDevices(): Observable<Device[]> {
    return this.apiService.get<Device[]>(`${this.endpoint}/all`);
    // Nota: El filtrado se puede hacer en el cliente o agregar endpoint específico en la API
  }

  /**
   * Busca dispositivos por término de búsqueda
   */
  searchDevices(searchTerm: string, pageNumber: number = 1, pageSize: number = 10): Observable<DevicePagedResponse> {
    const params: DeviceFilterParams = {
      search: searchTerm,
      pageNumber,
      pageSize
    };
    return this.getDevices(params);
  }

  /**
   * Valida los datos del dispositivo antes de crear/actualizar
   */
  validateDeviceData(device: Partial<DeviceCreateRequest>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validar código del dispositivo
    if (!device.deviceCode?.trim()) {
      errors.push('El código del dispositivo es requerido');
    } else if (device.deviceCode.length > 50) {
      errors.push('El código del dispositivo no puede exceder 50 caracteres');
    }

    // Validar nombre del dispositivo
    if (!device.deviceName?.trim()) {
      errors.push('El nombre del dispositivo es requerido');
    } else if (device.deviceName.length > 150) {
      errors.push('El nombre del dispositivo no puede exceder 150 caracteres');
    }

    // Validar dirección IP
    if (!device.ipAddress?.trim()) {
      errors.push('La dirección IP es requerida');
    } else if (!this.isValidIPAddress(device.ipAddress)) {
      errors.push('La dirección IP no tiene un formato válido');
    }

    // Validar estado habilitado
    if (!device.enabled?.trim()) {
      errors.push('El estado habilitado es requerido');
    } else if (!this.isValidEnabledStatus(device.enabled)) {
      errors.push('El estado debe ser Y (habilitado) o N (deshabilitado)');
    }

    // Validar fuente de datos
    if (!device.dataSource?.trim()) {
      errors.push('La fuente de datos es requerida');
    } else if (device.dataSource.length > 1) {
      errors.push('La fuente de datos debe ser un solo carácter');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Valida formato de dirección IP
   */
  private isValidIPAddress(ip: string): boolean {
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ip);
  }

  /**
   * Convierte el estado de texto a booleano para UI
   */
  isDeviceEnabled(device: Device): boolean {
    return device.enabled?.toUpperCase() === 'Y';
  }

  /**
   * Convierte booleano a texto para API
   */
  booleanToEnabledStatus(enabled: boolean): string {
    return enabled ? 'Y' : 'N';
  }

  /**
   * Obtiene el label del estado para mostrar en UI
   */
  getEnabledLabel(device: Device): string {
    return this.isDeviceEnabled(device) ? 'Habilitado' : 'Deshabilitado';
  }

  /**
   * Obtiene la severidad del estado para PrimeNG
   */
  getEnabledSeverity(device: Device): 'success' | 'danger' {
    return this.isDeviceEnabled(device) ? 'success' : 'danger';
  }

  /**
   * Crea un objeto Device por defecto para nuevos registros
   */
  createDefaultDevice(): DeviceCreateRequest {
    return {
      deviceCode: '',
      deviceName: '',
      enabled: 'Y',
      ipAddress: '',
      dataSource: 'M' // Manual, ajustar según necesidades
    };
  }

  /**
   * Verifica conectividad con un dispositivo (simulado)
   * En una implementación real, esto podría hacer ping al dispositivo
   */
  checkDeviceConnectivity(device: Device): Observable<boolean> {
    // Simulación - en producción hacer ping real o endpoint específico
    return this.apiService.get<boolean>(`${this.endpoint}/${device.deviceCode}/ping`);
  }

  /**
   * Obtiene estadísticas de dispositivos
   */
  getDeviceStats(): { 
    total: number; 
    enabled: number; 
    disabled: number; 
    enabledPercentage: number 
  } {
    // Este método podría usar datos cacheados o hacer una llamada específica
    // Por ahora retorna estructura para uso futuro
    return {
      total: 0,
      enabled: 0,
      disabled: 0,
      enabledPercentage: 0
    };
  }

  /**
   * Exporta dispositivos a CSV (utilidad para el componente)
   */
  exportDevicesToCSV(devices: Device[]): string {
    const headers = ['Código', 'Nombre', 'IP', 'Estado', 'Fuente de Datos'];
    const csvData = devices.map(device => [
      device.deviceCode,
      device.deviceName,
      device.ipAddress,
      this.getEnabledLabel(device),
      device.dataSource
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    return csvContent;
  }

}
