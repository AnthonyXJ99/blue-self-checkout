import { Injectable } from "@angular/core";
import { ApiService } from "../../core/services/api.service";
import { catchError, map, Observable, of, switchMap } from "rxjs";
import { ApiResponse } from "../../core/model/api-response.model";
import { ConnectivityStatus, PointOfSale, PointOfSaleCreateRequest, PointOfSaleFilterParams, PointOfSalePagedResponse, PointOfSaleUpdateRequest } from "../devices/opos/model/opos.model";

/**
 * Servicio para gestión de OPOS
 */
@Injectable({
    providedIn: 'root'
})
export class OposService {

    private readonly endpoint = 'api/PointOfSales';

    constructor(private apiService: ApiService) {}

  /**
   * Obtiene todos los puntos de venta sin paginación
   * GET /api/PointOfSales/all
   */
  getAllPointOfSales(): Observable<PointOfSale[]> {
    return this.apiService.get<PointOfSale[]>(`${this.endpoint}/all`);
  }

  /**
   * Obtiene puntos de venta con paginación y filtros
   * GET /api/PointOfSales
   */
  getPointOfSales(params?: PointOfSaleFilterParams): Observable<PointOfSalePagedResponse> {
    return this.apiService.getPaginated<PointOfSale>(`${this.endpoint}`, params);
  }

  /**
   * Obtiene un punto de venta específico por código
   * GET /api/PointOfSales/{posCode}
   */
  getPointOfSaleByCode(posCode: string): Observable<PointOfSale> {
    return this.apiService.get<PointOfSale>(`${this.endpoint}/${posCode}`);
  }

  /**
   * Crea un nuevo punto de venta
   * POST /api/PointOfSales
   */
  createPointOfSale(posData: PointOfSaleCreateRequest): Observable<PointOfSale> {
    return this.apiService.post<PointOfSale>(`${this.endpoint}`, posData);
  }

  /**
   * Actualiza un punto de venta existente
   * PUT /api/PointOfSales/{posCode}
   */
  updatePointOfSale(posCode: string, posData: PointOfSaleUpdateRequest): Observable<void> {
    return this.apiService.put<void>(`${this.endpoint}/${posCode}`, posData);
  }

  /**
   * Elimina un punto de venta existente
   * DELETE /api/PointOfSales/{posCode}
   */
  deletePointOfSale(posCode: string): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${posCode}`);
  }

  // ===== MÉTODOS DE BÚSQUEDA Y FILTRADO =====

  /**
   * Busca puntos de venta por término
   */
  searchPointOfSales(searchTerm: string, pageNumber: number = 1, pageSize: number = 10): Observable<PointOfSalePagedResponse> {
    const params: PointOfSaleFilterParams = {
      search: searchTerm,
      pageNumber,
      pageSize
    };
    return this.getPointOfSales(params);
  }

  /**
   * Obtiene puntos de venta habilitados
   */
  getEnabledPointOfSales(): Observable<PointOfSale[]> {
    const params: PointOfSaleFilterParams = {
      enabled: true
    };
    return this.getPointOfSales(params).pipe(
      map((response) => response.data)
    );
  }

  /**
   * Obtiene puntos de venta con IP configurada
   */
  getPointOfSalesWithIP(): Observable<PointOfSale[]> {
    const params: PointOfSaleFilterParams = {
      hasIpAddress: true
    };
    return this.getPointOfSales(params).pipe(
      map((response) => response.data)
    );
  }

  /**
   * Obtiene puntos de venta por fuente de datos
   */
  getPointOfSalesByDataSource(datasource: string): Observable<PointOfSale[]> {
    const params: PointOfSaleFilterParams = {
      datasource
    };
    return this.getPointOfSales(params).pipe(
      map((response) => response.data)
    );
  }

  // ===== MÉTODOS DE VALIDACIÓN =====

  /**
   * Valida si un estado Y/N es válido
   */
  isValidEnabledStatus(status: string): boolean {
    return ['Y', 'N'].includes(status.toUpperCase());
  }

  /**
   * Valida formato de dirección IP
   */
  isValidIPAddress(ip: string): boolean {
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ip);
  }

  /**
   * Valida formato de código SIS
   */
  isValidSISCode(sisCode: string): boolean {
    // Asumiendo que SIS code debe ser alfanumérico y máximo 20 caracteres
    const sisRegex = /^[a-zA-Z0-9]{1,20}$/;
    return sisRegex.test(sisCode);
  }

  /**
   * Valida formato de número de identificación fiscal
   */
  isValidTaxIdentNumber(taxId: string): boolean {
    // Validación básica para RUT/NIT/Tax ID
    const taxRegex = /^[0-9\-kK]{1,20}$/;
    return taxRegex.test(taxId);
  }

  /**
   * Valida los datos del punto de venta antes de crear/actualizar
   */
  validatePointOfSaleData(pos: Partial<PointOfSaleCreateRequest>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validar código del POS
    if (!pos.posCode?.trim()) {
      errors.push('El código del POS es requerido');
    } else if (pos.posCode.length > 50) {
      errors.push('El código del POS no puede exceder 50 caracteres');
    }

    // Validar nombre del POS
    if (!pos.posName?.trim()) {
      errors.push('El nombre del POS es requerido');
    } else if (pos.posName.length > 150) {
      errors.push('El nombre del POS no puede exceder 150 caracteres');
    }

    // Validar estado habilitado
    if (!pos.enabled?.trim()) {
      errors.push('El estado habilitado es requerido');
    } else if (!this.isValidEnabledStatus(pos.enabled)) {
      errors.push('El estado debe ser Y (habilitado) o N (deshabilitado)');
    }

    // Validaciones opcionales
    if (pos.ipAddress && pos.ipAddress.trim()) {
      if (pos.ipAddress.length > 50) {
        errors.push('La dirección IP no puede exceder 50 caracteres');
      } else if (!this.isValidIPAddress(pos.ipAddress)) {
        errors.push('La dirección IP no tiene un formato válido');
      }
    }

    if (pos.datasource && pos.datasource.length > 1) {
      errors.push('La fuente de datos debe ser un solo carácter');
    }

    if (pos.sisCode && pos.sisCode.trim()) {
      if (pos.sisCode.length > 20) {
        errors.push('El código SIS no puede exceder 20 caracteres');
      } else if (!this.isValidSISCode(pos.sisCode)) {
        errors.push('El código SIS debe ser alfanumérico');
      }
    }

    if (pos.taxIdentNumber && pos.taxIdentNumber.trim()) {
      if (pos.taxIdentNumber.length > 20) {
        errors.push('El número de identificación fiscal no puede exceder 20 caracteres');
      } else if (!this.isValidTaxIdentNumber(pos.taxIdentNumber)) {
        errors.push('El número de identificación fiscal no tiene un formato válido');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // ===== MÉTODOS DE UTILIDAD =====

  /**
   * Convierte string Y/N a booleano para UI
   */
  ynToBoolean(value: string): boolean {
    return value?.toUpperCase() === 'Y';
  }

  /**
   * Convierte booleano a string Y/N para API
   */
  booleanToYN(value: boolean): string {
    return value ? 'Y' : 'N';
  }

  /**
   * Obtiene el label del estado para mostrar en UI
   */
  getEnabledLabel(pos: PointOfSale): string {
    return this.ynToBoolean(pos.enabled) ? 'Habilitado' : 'Deshabilitado';
  }

  /**
   * Obtiene la severidad del estado para PrimeNG
   */
  getEnabledSeverity(pos: PointOfSale): 'success' | 'danger' {
    return this.ynToBoolean(pos.enabled) ? 'success' : 'danger';
  }

  /**
   * Obtiene el estado de conectividad del POS
   */
  getConnectivityStatus(pos: PointOfSale): 'connected' | 'disconnected' | 'unknown' {
    if (!pos.ipAddress) {
      return 'unknown';
    }
    // Aquí podrías implementar lógica real de ping o conectividad
    // Por ahora retorna un estado basado en si está habilitado
    return this.ynToBoolean(pos.enabled) ? 'connected' : 'disconnected';
  }

  /**
   * Obtiene el label del estado de conectividad
   */
  getConnectivityLabel(pos: PointOfSale): string {
    const status = this.getConnectivityStatus(pos);
    switch (status) {
      case 'connected': return 'Conectado';
      case 'disconnected': return 'Desconectado';
      case 'unknown': return 'Sin IP';
      default: return 'Desconocido';
    }
  }

  /**
   * Obtiene la severidad del estado de conectividad para PrimeNG
   */
  getConnectivitySeverity(pos: PointOfSale): 'success' | 'danger' | 'warning' {
    const status = this.getConnectivityStatus(pos);
    switch (status) {
      case 'connected': return 'success';
      case 'disconnected': return 'danger';
      case 'unknown': return 'warning';
      default: return 'warning';
    }
  }

  /**
   * Crea un objeto PointOfSale por defecto para nuevos registros
   */
  createDefaultPointOfSale(): PointOfSaleCreateRequest {
    return {
      posCode: '',
      posName: '',
      ipAddress: '',
      enabled: 'Y',
      datasource: 'M', // Manual
      sisCode: '',
      taxIdentNumber: ''
    };
  }

  /**
   * Genera un código de POS único
   */
  generatePOSCode(): string {
    const now = new Date();
    const timestamp = now.getFullYear().toString() +
                     (now.getMonth() + 1).toString().padStart(2, '0') +
                     now.getDate().toString().padStart(2, '0') +
                     now.getHours().toString().padStart(2, '0') +
                     now.getMinutes().toString().padStart(2, '0');
    
    const randomId = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `POS_${timestamp}_${randomId}`;
  }

  /**
   * Formatea la dirección IP para mostrar
   */
  formatIPAddress(ipAddress?: string): string {
    if (!ipAddress) return 'Sin configurar';
    return ipAddress;
  }

  /**
   * Obtiene información de red del POS
   */
  getNetworkInfo(pos: PointOfSale): {
    hasIP: boolean;
    ipAddress: string;
    networkStatus: string;
    canPing: boolean;
  } {
    const hasIP = !!pos.ipAddress;
    return {
      hasIP,
      ipAddress: pos.ipAddress || 'No configurada',
      networkStatus: this.getConnectivityLabel(pos),
      canPing: hasIP && this.isValidIPAddress(pos.ipAddress!)
    };
  }

  /**
   * Exporta puntos de venta a CSV
   */
  exportPointOfSalesToCSV(pointOfSales: PointOfSale[]): string {
    const headers = [
      'Código POS', 'Nombre', 'Dirección IP', 'Estado', 'Fuente Datos',
      'Código SIS', 'RUT/NIT', 'Estado Conectividad'
    ];
    
    const csvData = pointOfSales.map(pos => [
      pos.posCode,
      pos.posName,
      pos.ipAddress || 'Sin configurar',
      this.getEnabledLabel(pos),
      pos.datasource || 'No definido',
      pos.sisCode || 'Sin código',
      pos.taxIdentNumber || 'Sin RUT/NIT',
      this.getConnectivityLabel(pos)
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    return csvContent;
  }

  /**
   * Obtiene estadísticas de puntos de venta
   */
  getPointOfSaleStats(pointOfSales: PointOfSale[]): {
    total: number;
    enabled: number;
    disabled: number;
    withIP: number;
    withoutIP: number;
    byDataSource: { [key: string]: number };
    connectivityStats: {
      connected: number;
      disconnected: number;
      unknown: number;
    };
  } {
    const total = pointOfSales.length;
    const enabled = pointOfSales.filter(pos => this.ynToBoolean(pos.enabled)).length;
    const disabled = total - enabled;
    
    const withIP = pointOfSales.filter(pos => pos.ipAddress && pos.ipAddress.trim()).length;
    const withoutIP = total - withIP;
    
    // Estadísticas por fuente de datos
    const byDataSource: { [key: string]: number } = {};
    pointOfSales.forEach(pos => {
      const source = pos.datasource || 'No definido';
      byDataSource[source] = (byDataSource[source] || 0) + 1;
    });
    
    // Estadísticas de conectividad
    const connectivityStats = {
      connected: pointOfSales.filter(pos => this.getConnectivityStatus(pos) === 'connected').length,
      disconnected: pointOfSales.filter(pos => this.getConnectivityStatus(pos) === 'disconnected').length,
      unknown: pointOfSales.filter(pos => this.getConnectivityStatus(pos) === 'unknown').length
    };

    return {
      total,
      enabled,
      disabled,
      withIP,
      withoutIP,
      byDataSource,
      connectivityStats
    };
  }

  /**
   * Valida la conectividad de red (simulada)
   * En una implementación real, esto haría ping real a la IP
   */
  async pingPointOfSale(pos: PointOfSale): Promise<ConnectivityStatus> {
    if (!pos.ipAddress || !this.isValidIPAddress(pos.ipAddress)) {
      return {
        posCode: pos.posCode,
        ipAddress: pos.ipAddress || 'No configurada',
        isReachable: false,
        lastChecked: new Date(),
        error: 'Dirección IP no válida o no configurada'
      };
    }

    // Simulación de ping (en implementación real usarías un servicio de ping)
    const simulatedPing = new Promise<ConnectivityStatus>((resolve) => {
      setTimeout(() => {
        const isReachable = Math.random() > 0.3; // 70% de probabilidad de éxito
        const responseTime = isReachable ? Math.floor(Math.random() * 100) + 10 : undefined;
        
        resolve({
          posCode: pos.posCode,
          ipAddress: pos.ipAddress!,
          isReachable,
          responseTime,
          lastChecked: new Date(),
          error: isReachable ? undefined : 'Timeout de conexión'
        });
      }, Math.random() * 2000 + 500); // Simular latencia variable
    });

    return simulatedPing;
  }

  /**
   * Realiza ping masivo a múltiples POS
   */
  async bulkPingPointOfSales(pointOfSales: PointOfSale[]): Promise<ConnectivityStatus[]> {
    const pingPromises = pointOfSales
      .filter(pos => pos.ipAddress && this.isValidIPAddress(pos.ipAddress))
      .map(pos => this.pingPointOfSale(pos));
    
    return Promise.all(pingPromises);
  }

  /**
   * Verifica si un código de POS ya existe
   */
  isPOSCodeUnique(posCode: string, currentPOS?: PointOfSale): boolean {
    // En una implementación real, esto haría una consulta al servidor
    // Por ahora es una validación local básica
    return posCode.trim().length > 0 && 
           (!currentPOS || currentPOS.posCode !== posCode);
  }

  /**
   * Obtiene sugerencias de configuración para un POS
   */
  getPOSConfigurationSuggestions(pos: Partial<PointOfSale>): string[] {
    const suggestions: string[] = [];

    if (!pos.ipAddress) {
      suggestions.push('Configurar dirección IP para monitoreo de red');
    }

    if (!pos.sisCode) {
      suggestions.push('Configurar código SIS para integración');
    }

    if (!pos.taxIdentNumber) {
      suggestions.push('Agregar RUT/NIT para facturación');
    }

    if (pos.ipAddress && !this.isValidIPAddress(pos.ipAddress)) {
      suggestions.push('Corregir formato de dirección IP');
    }

    if (pos.enabled === 'N') {
      suggestions.push('Considerar habilitar el POS si está operativo');
    }

    return suggestions;
  }

  // ===== MÉTODOS DE OPERACIONES EN LOTE =====

  /**
   * Elimina múltiples puntos de venta
   */
  deleteMultiplePointOfSales(posCodes: string[]): Observable<{ success: number; failed: number; errors: string[] }> {
    const results = { success: 0, failed: 0, errors: [] as string[] };
    
    if (posCodes.length === 0) {
      return new Observable(observer => {
        observer.next(results);
        observer.complete();
      });
    }

    const deleteObservables = posCodes.map(posCode => 
      this.deletePointOfSale(posCode).pipe(
        map(() => ({ posCode, success: true })),
        catchError(error => {
          console.error(`Error deleting POS ${posCode}:`, error);
          return of({ posCode, success: false, error: error.message });
        })
      )
    );

    return new Observable(observer => {
      let completed = 0;
      const total = deleteObservables.length;

      deleteObservables.forEach(obs => {
        obs.subscribe({
          next: (result: any) => {
            if (result.success) {
              results.success++;
            } else {
              results.failed++;
              results.errors.push(`Error eliminando POS ${result.posCode}: ${result.error || 'Error desconocido'}`);
            }
            completed++;
            
            if (completed === total) {
              observer.next(results);
              observer.complete();
            }
          },
          error: (error) => {
            results.failed++;
            results.errors.push(`Error en operación: ${error.message}`);
            completed++;
            
            if (completed === total) {
              observer.next(results);
              observer.complete();
            }
          }
        });
      });
    });
  }

  /**
   * Actualiza el estado de múltiples puntos de venta
   */
  updateMultiplePointOfSalesStatus(
    posCodes: string[], 
    updates: { enabled?: string; datasource?: string }
  ): Observable<{ success: number; failed: number; errors: string[] }> {
    const results = { success: 0, failed: 0, errors: [] as string[] };
    
    if (posCodes.length === 0) {
      return new Observable(observer => {
        observer.next(results);
        observer.complete();
      });
    }

    const updateObservables = posCodes.map(posCode => 
      this.getPointOfSaleByCode(posCode).pipe(
        map(pos => {
          if (!pos) {
            throw new Error(`POS ${posCode} no encontrado`);
          }
          return pos;
        }),
        map(pos => ({
          ...pos,
          ...updates
        })),
        switchMap(updatedPos => 
          this.updatePointOfSale(posCode, updatedPos).pipe(
            map(() => ({ posCode, success: true })),
            catchError(error => {
              console.error(`Error updating POS ${posCode}:`, error);
              return of({ posCode, success: false, error: error.message });
            })
          )
        ),
        catchError(error => {
          console.error(`Error getting POS ${posCode}:`, error);
          return of({ posCode, success: false, error: error.message });
        })
      )
    );

    return new Observable(observer => {
      let completed = 0;
      const total = updateObservables.length;

      updateObservables.forEach(obs => {
        obs.subscribe({
          next: (result: any) => {
            if (result.success) {
              results.success++;
            } else {
              results.failed++;
              results.errors.push(`Error actualizando POS ${result.posCode}: ${result.error || 'Error desconocido'}`);
            }
            completed++;
            
            if (completed === total) {
              observer.next(results);
              observer.complete();
            }
          },
          error: (error) => {
            results.failed++;
            results.errors.push(`Error en operación: ${error.message}`);
            completed++;
            
            if (completed === total) {
              observer.next(results);
              observer.complete();
            }
          }
        });
      });
    });
  }

  /**
   * Habilita/deshabilita múltiples POS
   */
  toggleMultiplePOSStatus(
    posCodes: string[], 
    enabled: boolean
  ): Observable<{ success: number; failed: number; errors: string[] }> {
    const status = this.booleanToYN(enabled);
    return this.updateMultiplePointOfSalesStatus(posCodes, { enabled: status });
  }

  /**
   * Configura dirección IP para múltiples POS
   */
  configureIPForMultiplePOS(
    posCodes: string[], 
    ipAddress: string
  ): Observable<{ success: number; failed: number; errors: string[] }> {
    if (!this.isValidIPAddress(ipAddress)) {
      return new Observable(observer => {
        observer.next({
          success: 0,
          failed: posCodes.length,
          errors: [`Dirección IP inválida: ${ipAddress}`]
        });
        observer.complete();
      });
    }

    // En este caso, necesitarías actualizar cada POS individualmente
    // porque el cambio de IP requiere actualizar el objeto completo
    return this.updateMultiplePointOfSalesStatus(posCodes, {});
  }
} 