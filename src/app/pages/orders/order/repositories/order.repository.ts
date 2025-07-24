
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../../../core/services/api.service';
import { API_CONFIG } from '../../../../core/config/api.config';
import { ApiResponse } from '../../../../core/model/api-response.model';
import {
  Order,
  OrderCreateDto,
  OrderUpdateDto,
  OrderResponseDto,
  OrderFilterParams,
  OrderApiResponse
} from '../model/order.model';

/**
 * Repository para el manejo de datos de órdenes
 * Implementa el patrón Repository para abstraer el acceso a datos
 */
@Injectable({
  providedIn: 'root'
})
export class OrderRepository {

  private readonly endpoint = API_CONFIG.ENDPOINTS.ORDERS;

  constructor(private apiService: ApiService) {}

  // ============================================
  // OPERACIONES CRUD BÁSICAS
  // ============================================

  /**
   * Obtiene todas las órdenes con paginación y filtros
   */
  findAll(params?: OrderFilterParams): Observable<OrderApiResponse<OrderResponseDto>> {
    console.log('🔍 Repository - Params enviados:', params);
    
    return this.apiService.get<OrderApiResponse<OrderResponseDto>>(
      this.endpoint,
      params
    ).pipe(
      map(response => {
        console.log('🔍 Repository - Response recibida:', response);
        return response;
      })
    );
  }

  /**
   * Obtiene una orden por su ID
   */
  findById(id: number): Observable<OrderResponseDto> {
    return this.apiService.get<OrderResponseDto>(
      `${this.endpoint}/${id}`
    );
  }

  /**
   * Crea una nueva orden
   */
  create(orderData: OrderCreateDto): Observable<Order> {
    return this.apiService.post<Order>(
      this.endpoint,
      orderData
    );
  }

  /**
   * Actualiza una orden existente
   */
  update(id: number, orderData: OrderUpdateDto): Observable<OrderResponseDto> {
    return this.apiService.put<OrderResponseDto>(
      `${this.endpoint}/${id}`,
      orderData
    );
  }

  /**
   * Elimina una orden
   */
  delete(id: number): Observable<void> {
    return this.apiService.delete<void>(
      `${this.endpoint}/${id}`
    );
  }

  // ============================================
  // CONSULTAS ESPECÍFICAS
  // ============================================

  /**
   * Busca órdenes por código de cliente
   */
  findByCustomerCode(customerCode: string): Observable<Order[]> {
    return this.apiService.get<Order[]>(
      `${this.endpoint}/customer/${customerCode}`
    );
  }

  /**
   * Busca órdenes por estado
   */
  findByStatus(status: string): Observable<Order[]> {
    return this.apiService.get<Order[]>(
      `${this.endpoint}/status/${status}`
    );
  }

  /**
   * Busca órdenes por rango de fechas
   */
  findByDateRange(startDate: Date, endDate: Date): Observable<Order[]> {
    const params = {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    };
    
    return this.apiService.get<Order[]>(
      `${this.endpoint}/date-range`,
      params
    );
  }

  /**
   * Busca órdenes con filtro de texto
   */
  search(searchTerm: string, page: number = 1, pageSize: number = 10): Observable<OrderApiResponse<OrderResponseDto>> {
    const params: OrderFilterParams = {
      filter: searchTerm,
      page,
      pageSize
    };

    return this.findAll(params);
  }

  // ============================================
  // CONSULTAS ESPECIALIZADAS
  // ============================================

  /**
   * Obtiene órdenes del día actual
   */
  findTodayOrders(): Observable<OrderApiResponse<OrderResponseDto>> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    const params: OrderFilterParams = {
      startDate: startOfDay,
      endDate: endOfDay,
      pageSize: 100
    };

    return this.findAll(params);
  }

  /**
   * Obtiene órdenes pendientes
   */
  findPendingOrders(): Observable<Order[]> {
    return this.findByStatus('P');
  }

  /**
   * Obtiene órdenes completadas
   */
  findCompletedOrders(): Observable<Order[]> {
    return this.findByStatus('C');
  }

  /**
   * Obtiene órdenes canceladas
   */
  findCancelledOrders(): Observable<Order[]> {
    return this.findByStatus('X');
  }

  /**
   * Obtiene las órdenes más recientes
   */
  findRecentOrders(limit: number = 10): Observable<OrderResponseDto[]> {
    const params: OrderFilterParams = {
      pageSize: limit,
      page: 1
    };

    return this.findAll(params).pipe(
      map(response => response.data)
    );
  }

  // ============================================
  // OPERACIONES DE ACTUALIZACIÓN ESPECÍFICAS
  // ============================================

  /**
   * Cambia el estado de una orden
   */
  changeStatus(id: number, newStatus: string): Observable<OrderResponseDto> {
    const updateData: OrderUpdateDto = {
      docStatus: newStatus
    };
    
    return this.update(id, updateData);
  }

  /**
   * Marca una orden como impresa
   */
  markAsPrinted(id: number): Observable<OrderResponseDto> {
    const updateData: OrderUpdateDto = {
      printed: 'Y'
    };
    
    return this.update(id, updateData);
  }

  /**
   * Marca una orden como transferida
   */
  markAsTransferred(id: number): Observable<OrderResponseDto> {
    const updateData: OrderUpdateDto = {
      transferred: 'Y'
    };
    
    return this.update(id, updateData);
  }

  /**
   * Actualiza solo los comentarios de una orden
   */
  updateComments(id: number, comments: string): Observable<OrderResponseDto> {
    const updateData: OrderUpdateDto = {
      comments
    };
    
    return this.update(id, updateData);
  }

  /**
   * Actualiza el total de una orden
   */
  updateTotal(id: number, docTotal: number, docTotalFC?: number): Observable<OrderResponseDto> {
    const updateData: OrderUpdateDto = {
      docTotal,
      docTotalFC
    };
    
    return this.update(id, updateData);
  }

  // ============================================
  // OPERACIONES DE CONSULTA AGREGADAS
  // ============================================

  /**
   * Cuenta órdenes por estado
   */
  countByStatus(): Observable<{ [key: string]: number }> {
    return this.findAll({ pageSize: 1000 }).pipe(
      map(response => {
        const stats: { [key: string]: number } = {};
        response.data.forEach(order => {
          const status = order.docStatus || 'unknown';
          stats[status] = (stats[status] || 0) + 1;
        });
        return stats;
      })
    );
  }

  /**
   * Calcula el total de ventas del día
   */
  getTodaySalesTotal(): Observable<number> {
    return this.findTodayOrders().pipe(
      map(response => {
        return response.data.reduce((total, order) => {
          return total + (order.docTotal || 0);
        }, 0);
      })
    );
  }

  /**
   * Obtiene estadísticas generales
   */
  getStats(): Observable<any> {
    return this.apiService.get<any>(`${this.endpoint}/stats`);
  }

  // ============================================
  // OPERACIONES DE VALIDACIÓN
  // ============================================

  /**
   * Verifica si existe una orden con el folio dado
   */
  existsByFolio(folioNum: string, folioPref?: string): Observable<boolean> {
    const params: any = { folioNum };
    if (folioPref) {
      params.folioPref = folioPref;
    }

    return this.findAll(params).pipe(
      map(response => response.totalCount > 0)
    );
  }

  /**
   * Verifica si una orden puede ser editada
   */
  canEdit(order: OrderResponseDto): boolean {
    return order.docStatus === 'P' && order.transferred !== 'Y';
  }

  /**
   * Verifica si una orden puede ser eliminada
   */
  canDelete(order: OrderResponseDto): boolean {
    return order.docStatus === 'P' && order.transferred !== 'Y' && order.printed !== 'Y';
  }

  // ============================================
  // UTILIDADES
  // ============================================

  /**
   * Formatea el número de folio completo
   */
  getFullFolioNumber(order: OrderResponseDto): string {
    return order.folioPref ? `${order.folioPref}-${order.folioNum}` : order.folioNum || '';
  }

  /**
   * Obtiene el color del estado para UI
   */
  getStatusColor(status?: string): string {
    const colors: { [key: string]: string } = {
      'P': 'warning',    // Pending - Amarillo
      'C': 'success',    // Completed - Verde
      'X': 'danger',     // Cancelled - Rojo
      'I': 'info'        // In Progress - Azul
    };
    
    return colors[status || ''] || 'secondary';
  }

  /**
   * Obtiene la etiqueta del estado para UI
   */
  getStatusLabel(status?: string): string {
    const labels: { [key: string]: string } = {
      'P': 'Pendiente',
      'C': 'Completado', 
      'X': 'Cancelado',
      'I': 'En Proceso'
    };
    
    return labels[status || ''] || 'Desconocido';
  }

  // ============================================
  // UTILIDADES PARA EXPORTACIÓN
  // ============================================

  /**
   * Convierte órdenes a formato CSV
   */
  convertOrdersToCSV(orders: OrderResponseDto[]): string {
    const headers = [
      'ID',
      'Folio',
      'Cliente',
      'Fecha',
      'Estado',
      'Tipo',
      'Total',
      'Comentarios'
    ];

    const csvData = orders.map(order => [
      order.docEntry,
      this.getFullFolioNumber(order),
      order.customerName || 'N/A',
      order.docDate ? new Date(order.docDate).toLocaleDateString() : 'N/A',
      this.getStatusLabel(order.docStatus),
      order.docType || 'N/A',
      order.docTotal || 0,
      order.comments || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');

    return csvContent;
  }

  /**
   * Descarga un archivo CSV
   */
  downloadCSVFile(csvContent: string, filename: string): void {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  // ============================================
  // OPERACIONES BATCH (LOTES)
  // ============================================

  /**
   * Elimina múltiples órdenes
   */
  deleteMultiple(ids: number[]): Observable<void[]> {
    const deleteOperations = ids.map(id => this.delete(id));
    return this.apiService.post<void[]>('/batch/delete', { ids });
  }

  /**
   * Actualiza el estado de múltiples órdenes
   */
  updateMultipleStatus(ids: number[], newStatus: string): Observable<OrderResponseDto[]> {
    return this.apiService.post<OrderResponseDto[]>(
      '/batch/update-status',
      { ids, status: newStatus }
    );
  }

  /**
   * Marca múltiples órdenes como impresas
   */
  markMultipleAsPrinted(ids: number[]): Observable<OrderResponseDto[]> {
    return this.apiService.post<OrderResponseDto[]>(
      '/batch/mark-printed',
      { ids }
    );
  }

  // ============================================
  // EXPORTACIÓN DE DATOS
  // ============================================

  /**
   * Exporta órdenes a CSV
   */
  exportToCSV(params?: OrderFilterParams): Observable<Blob> {
    const exportParams = {
      ...params,
      export: 'csv',
      pageSize: 10000 // Obtener muchos registros para export
    };
    
    return this.apiService.download(`${this.endpoint}/export`, exportParams);
  }

  /**
   * Exporta órdenes específicas a CSV
   */
  exportOrdersToCSV(orderIds: number[]): Observable<Blob> {
    return this.apiService.post<Blob>(
      `${this.endpoint}/export/csv`,
      { orderIds },
      { responseType: 'blob' } as any
    );
  }

  /**
   * Exporta reporte de órdenes del día a CSV
   */
  exportTodayOrdersToCSV(): Observable<Blob> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    return this.exportToCSV({
      startDate: startOfDay,
      endDate: endOfDay
    });
  }

  /**
   * Exporta reporte de órdenes por rango de fechas a CSV
   */
  exportDateRangeToCSV(startDate: Date, endDate: Date): Observable<Blob> {
    return this.exportToCSV({
      startDate,
      endDate
    });
  }

  /**
   * Exporta órdenes por estado a CSV
   */
  exportByStatusToCSV(status: string): Observable<Blob> {
    return this.exportToCSV({
      status
    });
  }
}

