import { Injectable } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { OposService } from '../../../service/opos.service';
import { 
  PointOfSale, 
  PointOfSaleCreateRequest, 
  PointOfSaleUpdateRequest, 
  PointOfSaleFilterParams, 
  PointOfSalePagedResponse,
  ConnectivityStatus
} from '../model/opos.model';

/**
 * Repositorio para gestión de OPOS que envuelve el servicio API
 * con manejo de errores y métodos adicionales
 */
@Injectable({
  providedIn: 'root'
})
export class OposRepository {

  constructor(private oposService: OposService) {}

  // === MÉTODOS CRUD BÁSICOS ===

  /**
   * Obtiene todos los puntos de venta
   */
  getAllPointOfSales(): Observable<PointOfSale[]> {
    return this.oposService.getAllPointOfSales().pipe(
      catchError(error => {
        console.error('Error getting all point of sales:', error);
        return of([]);
      })
    );
  }

  /**
   * Obtiene puntos de venta con paginación y filtros
   */
  getPointOfSales(params?: PointOfSaleFilterParams): Observable<PointOfSalePagedResponse> {
    return this.oposService.getPointOfSales(params).pipe(
      catchError(error => {
        console.error('Error getting point of sales:', error);
        return of({
          totalCount: 0,
          pageNumber: 1,
          pageSize: 10,
          totalPages: 1,
          data: []
        });
      })
    );
  }

  /**
   * Obtiene un punto de venta por código
   */
  getPointOfSaleByCode(posCode: string): Observable<PointOfSale | null> {
    return this.oposService.getPointOfSaleByCode(posCode).pipe(
      catchError(error => {
        console.error(`Error getting point of sale ${posCode}:`, error);
        return of(null);
      })
    );
  }

  /**
   * Crea un nuevo punto de venta
   */
  createPointOfSale(posData: PointOfSaleCreateRequest): Observable<PointOfSale | null> {
    return this.oposService.createPointOfSale(posData).pipe(
      catchError(error => {
        console.error('Error creating point of sale:', error);
        return of(null);
      })
    );
  }

  /**
   * Actualiza un punto de venta existente
   */
  updatePointOfSale(posCode: string, posData: PointOfSaleUpdateRequest): Observable<boolean> {
    return this.oposService.updatePointOfSale(posCode, posData).pipe(
      map(() => true),
      catchError(error => {
        console.error(`Error updating point of sale ${posCode}:`, error);
        return of(false);
      })
    );
  }

  /**
   * Elimina un punto de venta
   */
  deletePointOfSale(posCode: string): Observable<boolean> {
    return this.oposService.deletePointOfSale(posCode).pipe(
      map(() => true),
      catchError(error => {
        console.error(`Error deleting point of sale ${posCode}:`, error);
        return of(false);
      })
    );
  }

  // === MÉTODOS DE BÚSQUEDA Y FILTRADO ===

  /**
   * Busca puntos de venta por término
   */
  searchPointOfSales(searchTerm: string, pageNumber: number = 1, pageSize: number = 10): Observable<PointOfSalePagedResponse> {
    return this.oposService.searchPointOfSales(searchTerm, pageNumber, pageSize).pipe(
      catchError(error => {
        console.error('Error searching point of sales:', error);
        return of({
          totalCount: 0,
          pageNumber: 1,
          pageSize: 10,
          totalPages: 1,
          data: []
        });
      })
    );
  }

  /**
   * Obtiene puntos de venta habilitados
   */
  getEnabledPointOfSales(): Observable<PointOfSale[]> {
    return this.oposService.getEnabledPointOfSales().pipe(
      catchError(error => {
        console.error('Error getting enabled point of sales:', error);
        return of([]);
      })
    );
  }

  /**
   * Obtiene puntos de venta con IP configurada
   */
  getPointOfSalesWithIP(): Observable<PointOfSale[]> {
    return this.oposService.getPointOfSalesWithIP().pipe(
      catchError(error => {
        console.error('Error getting point of sales with IP:', error);
        return of([]);
      })
    );
  }

  /**
   * Obtiene puntos de venta por fuente de datos
   */
  getPointOfSalesByDataSource(datasource: string): Observable<PointOfSale[]> {
    return this.oposService.getPointOfSalesByDataSource(datasource).pipe(
      catchError(error => {
        console.error(`Error getting point of sales by datasource ${datasource}:`, error);
        return of([]);
      })
    );
  }

  // === MÉTODOS DE VALIDACIÓN ===

  /**
   * Valida los datos del punto de venta
   */
  validatePointOfSaleData(pos: Partial<PointOfSaleCreateRequest>): { isValid: boolean; errors: string[] } {
    return this.oposService.validatePointOfSaleData(pos);
  }

  /**
   * Verifica si un código de POS existe
   */
  isPOSCodeExists(posCode: string): Observable<boolean> {
    return this.getPointOfSaleByCode(posCode).pipe(
      map(pos => pos !== null)
    );
  }

  /**
   * Verifica si un código de POS es único
   */
  isPOSCodeUnique(posCode: string, currentPOS?: PointOfSale): boolean {
    return this.oposService.isPOSCodeUnique(posCode, currentPOS);
  }

  /**
   * Valida si un estado Y/N es válido
   */
  isValidEnabledStatus(status: string): boolean {
    return this.oposService.isValidEnabledStatus(status);
  }

  // === MÉTODOS DE UTILIDAD ===

  /**
   * Convierte string Y/N a booleano
   */
  ynToBoolean(value: string): boolean {
    return this.oposService.ynToBoolean(value);
  }

  /**
   * Convierte booleano a string Y/N
   */
  booleanToYN(value: boolean): string {
    return this.oposService.booleanToYN(value);
  }

  /**
   * Obtiene el label del estado
   */
  getEnabledLabel(pos: PointOfSale): string {
    return this.oposService.getEnabledLabel(pos);
  }

  /**
   * Obtiene la severidad del estado
   */
  getEnabledSeverity(pos: PointOfSale): 'success' | 'danger' {
    return this.oposService.getEnabledSeverity(pos);
  }

  /**
   * Obtiene el estado de conectividad
   */
  getConnectivityStatus(pos: PointOfSale): 'connected' | 'disconnected' | 'unknown' {
    return this.oposService.getConnectivityStatus(pos);
  }

  /**
   * Obtiene el label del estado de conectividad
   */
  getConnectivityLabel(pos: PointOfSale): string {
    return this.oposService.getConnectivityLabel(pos);
  }

  /**
   * Obtiene la severidad del estado de conectividad
   */
  getConnectivitySeverity(pos: PointOfSale): 'success' | 'danger' | 'warning' {
    return this.oposService.getConnectivitySeverity(pos);
  }

  /**
   * Crea un punto de venta por defecto
   */
  createDefaultPointOfSale(): PointOfSaleCreateRequest {
    return this.oposService.createDefaultPointOfSale();
  }

  /**
   * Genera un código de POS único
   */
  generatePOSCode(): string {
    return this.oposService.generatePOSCode();
  }

  /**
   * Formatea la dirección IP para mostrar
   */
  formatIPAddress(ipAddress?: string): string {
    return this.oposService.formatIPAddress(ipAddress);
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
    return this.oposService.getNetworkInfo(pos);
  }

  /**
   * Valida formato de dirección IP
   */
  isValidIPAddress(ip: string): boolean {
    return this.oposService.isValidIPAddress(ip);
  }

  /**
   * Valida formato de código SIS
   */
  isValidSISCode(sisCode: string): boolean {
    return this.oposService.isValidSISCode(sisCode);
  }

  /**
   * Valida formato de número de identificación fiscal
   */
  isValidTaxIdentNumber(taxId: string): boolean {
    return this.oposService.isValidTaxIdentNumber(taxId);
  }

  // === MÉTODOS DE EXPORTACIÓN ===

  /**
   * Exporta puntos de venta a CSV
   */
  exportPointOfSalesToCSV(pointOfSales: PointOfSale[]): string {
    return this.oposService.exportPointOfSalesToCSV(pointOfSales);
  }

  // === MÉTODOS DE ESTADÍSTICAS ===

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
    return this.oposService.getPointOfSaleStats(pointOfSales);
  }

  // === MÉTODOS DE CONECTIVIDAD ===

  /**
   * Realiza ping a un punto de venta
   */
  async pingPointOfSale(pos: PointOfSale): Promise<ConnectivityStatus> {
    return this.oposService.pingPointOfSale(pos);
  }

  /**
   * Realiza ping masivo a múltiples POS
   */
  async bulkPingPointOfSales(pointOfSales: PointOfSale[]): Promise<ConnectivityStatus[]> {
    return this.oposService.bulkPingPointOfSales(pointOfSales);
  }

  // === MÉTODOS DE CONFIGURACIÓN ===

  /**
   * Obtiene sugerencias de configuración para un POS
   */
  getPOSConfigurationSuggestions(pos: Partial<PointOfSale>): string[] {
    return this.oposService.getPOSConfigurationSuggestions(pos);
  }

  // === MÉTODOS DE OPERACIONES EN LOTE ===

  /**
   * Elimina múltiples puntos de venta
   */
  deleteMultiplePointOfSales(posCodes: string[]): Observable<{ success: number; failed: number; errors: string[] }> {
    const results = { success: 0, failed: 0, errors: [] as string[] };
    
    if (posCodes.length === 0) {
      return of(results);
    }

    const deleteObservables = posCodes.map(posCode => 
      this.deletePointOfSale(posCode).pipe(
        map(success => ({ posCode, success }))
      )
    );

    return new Observable(observer => {
      let completed = 0;
      const total = deleteObservables.length;

      deleteObservables.forEach(obs => {
        obs.subscribe({
          next: ({ posCode, success }) => {
            if (success) {
              results.success++;
            } else {
              results.failed++;
              results.errors.push(`Error eliminando POS ${posCode}`);
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
      return of(results);
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
        map(updatedPos => ({ posCode, pos: updatedPos }))
      )
    );

    return new Observable(observer => {
      let completed = 0;
      const total = updateObservables.length;

      updateObservables.forEach(obs => {
        obs.pipe(
          map(({ posCode, pos }) => ({ posCode, pos }))
        ).subscribe({
          next: ({ posCode, pos }) => {
            this.updatePointOfSale(posCode, pos).subscribe({
              next: (success) => {
                if (success) {
                  results.success++;
                } else {
                  results.failed++;
                  results.errors.push(`Error actualizando POS ${posCode}`);
                }
                completed++;
                
                if (completed === total) {
                  observer.next(results);
                  observer.complete();
                }
              },
              error: (error) => {
                results.failed++;
                results.errors.push(`Error actualizando POS ${posCode}: ${error.message}`);
                completed++;
                
                if (completed === total) {
                  observer.next(results);
                  observer.complete();
                }
              }
            });
          },
          error: (error) => {
            results.failed++;
            results.errors.push(`Error obteniendo POS: ${error.message}`);
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
   * Configura dirección IP para múltiples POS
   */
  configureIPForMultiplePOS(
    posCodes: string[], 
    ipAddress: string
  ): Observable<{ success: number; failed: number; errors: string[] }> {
    if (!this.isValidIPAddress(ipAddress)) {
      return of({
        success: 0,
        failed: posCodes.length,
        errors: [`Dirección IP inválida: ${ipAddress}`]
      });
    }

    return this.updateMultiplePointOfSalesStatus(posCodes, {});
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
  
}
