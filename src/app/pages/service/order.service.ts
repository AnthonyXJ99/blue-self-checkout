
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { OrderRepository } from '../orders/order/repositories/order.repository';
import { ApiResponse } from '../../core/model/api-response.model';
import {
  Order,
  OrderCreateDto,
  OrderUpdateDto,
  OrderResponseDto,
  OrderFilterParams,
  OrderApiResponse
} from '../orders/order/model/order.model';

/**
 * Servicio de órdenes que utiliza el patrón Repository
 * Contiene la lógica de negocio y utiliza el repository para acceso a datos
 */
@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor(private orderRepository: OrderRepository) {}

  // ============================================
  // OPERACIONES CRUD BÁSICAS
  // ============================================

  /**
   * Obtiene todas las órdenes con paginación y filtros
   */
  getOrders(params?: OrderFilterParams): Observable<OrderApiResponse<OrderResponseDto>> {
    return this.orderRepository.findAll(params);
  }

  /**
   * Obtiene una orden específica por ID
   */
  getOrderById(id: number): Observable<OrderResponseDto> {
    return this.orderRepository.findById(id);
  }

  /**
   * Crea una nueva orden
   */
  createOrder(orderData: OrderCreateDto): Observable<Order> {
    // Aquí puedes agregar validaciones de negocio antes de crear
    this.validateOrderData(orderData);
    return this.orderRepository.create(orderData);
  }

  /**
   * Actualiza una orden existente
   */
  updateOrder(id: number, orderData: OrderUpdateDto): Observable<OrderResponseDto> {
    // Validaciones de negocio antes de actualizar
    return this.orderRepository.update(id, orderData);
  }

  /**
   * Elimina una orden
   */
  deleteOrder(id: number): Observable<void> {
    return this.orderRepository.delete(id);
  }

  // ============================================
  // CONSULTAS ESPECÍFICAS
  // ============================================

  /**
   * Obtiene órdenes por código de cliente
   */
  getOrdersByCustomer(customerCode: string): Observable<Order[]> {
    return this.orderRepository.findByCustomerCode(customerCode);
  }

  /**
   * Obtiene órdenes por estado
   */
  getOrdersByStatus(status: string): Observable<Order[]> {
    return this.orderRepository.findByStatus(status);
  }

  /**
   * Obtiene órdenes por rango de fechas
   */
  getOrdersByDateRange(startDate: Date, endDate: Date): Observable<Order[]> {
    return this.orderRepository.findByDateRange(startDate, endDate);
  }

  /**
   * Busca órdenes con filtro general
   */
  searchOrders(searchTerm: string, page: number = 1, pageSize: number = 10): Observable<OrderApiResponse<OrderResponseDto>> {
    return this.orderRepository.search(searchTerm, page, pageSize);
  }

  // ============================================
  // OPERACIONES DE NEGOCIO
  // ============================================

  /**
   * Procesa una orden (lógica de negocio)
   */
  processOrder(id: number): Observable<OrderResponseDto> {
    // Lógica de negocio para procesar una orden
    return this.orderRepository.changeStatus(id, 'I'); // I = In Progress
  }

  /**
   * Completa una orden
   */
  completeOrder(id: number): Observable<OrderResponseDto> {
    // Lógica de negocio para completar una orden
    return this.orderRepository.changeStatus(id, 'C'); // C = Completed
  }

  /**
   * Cancela una orden
   */
  cancelOrder(id: number, reason?: string): Observable<OrderResponseDto> {
    // Lógica de negocio para cancelar una orden
    // Podrías agregar el motivo en los comentarios
    return this.orderRepository.changeStatus(id, 'X'); // X = Cancelled
  }

  // ============================================
  // DASHBOARD Y ESTADÍSTICAS
  // ============================================

  /**
   * Obtiene estadísticas del dashboard
   */
  getDashboardStats(): Observable<any> {
    return this.orderRepository.getStats();
  }

  /**
   * Obtiene órdenes del día
   */
  getTodayOrders(): Observable<OrderApiResponse<OrderResponseDto>> {
    return this.orderRepository.findTodayOrders();
  }

  /**
   * Obtiene el total de ventas del día
   */
  getTodaySalesTotal(): Observable<number> {
    return this.orderRepository.getTodaySalesTotal();
  }

  /**
   * Obtiene órdenes recientes
   */
  getRecentOrders(limit: number = 10): Observable<OrderResponseDto[]> {
    return this.orderRepository.findRecentOrders(limit);
  }

  // ============================================
  // VALIDACIONES DE NEGOCIO
  // ============================================

  /**
   * Valida los datos de una orden antes de crear/actualizar
   */
  private validateOrderData(orderData: OrderCreateDto | OrderUpdateDto): void {
    if (!orderData.folioNum) {
      throw new Error('El número de folio es requerido');
    }

    if (orderData.orderLines && orderData.orderLines.length === 0) {
      throw new Error('La orden debe tener al menos una línea');
    }

    // Más validaciones de negocio...
  }

  /**
   * Valida si una orden puede ser editada
   */
  canEditOrder(order: OrderResponseDto): boolean {
    return this.orderRepository.canEdit(order);
  }

  /**
   * Valida si una orden puede ser eliminada
   */
  canDeleteOrder(order: OrderResponseDto): boolean {
    return this.orderRepository.canDelete(order);
  }

  // ============================================
  // UTILIDADES
  // ============================================

  /**
   * Formatea el número de folio completo
   */
  getFullFolioNumber(order: OrderResponseDto): string {
    return this.orderRepository.getFullFolioNumber(order);
  }

  /**
   * Obtiene el color del estado para UI
   */
  getStatusColor(status?: string): string {
    return this.orderRepository.getStatusColor(status);
  }

  /**
   * Obtiene la etiqueta del estado para UI
   */
  getStatusLabel(status?: string): string {
    return this.orderRepository.getStatusLabel(status);
  }

  // ============================================
  // EXPORTACIÓN DE DATOS
  // ============================================

  /**
   * Exporta todas las órdenes a CSV
   */
  exportOrdersToCSV(params?: OrderFilterParams): Observable<void> {
    return new Observable(observer => {
      // Opción 1: Si el backend soporta exportación directa
      this.orderRepository.exportToCSV(params).subscribe({
        next: (blob) => {
          this.downloadBlobAsCSV(blob, 'orders-export.csv');
          observer.next();
          observer.complete();
        },
        error: (error) => {
          // Opción 2: Fallback - exportar en el frontend
          this.exportOrdersClientSide(params).subscribe({
            next: () => {
              observer.next();
              observer.complete();
            },
            error: (err) => observer.error(err)
          });
        }
      });
    });
  }

  /**
   * Exporta órdenes específicas a CSV
   */
  exportSpecificOrdersToCSV(orderIds: number[]): Observable<void> {
    return new Observable(observer => {
      this.orderRepository.exportOrdersToCSV(orderIds).subscribe({
        next: (blob) => {
          this.downloadBlobAsCSV(blob, 'selected-orders.csv');
          observer.next();
          observer.complete();
        },
        error: () => {
          // Fallback: obtener las órdenes y exportar en frontend
          this.exportSelectedOrdersClientSide(orderIds).subscribe({
            next: () => {
              observer.next();
              observer.complete();
            },
            error: (err) => observer.error(err)
          });
        }
      });
    });
  }

  /**
   * Exporta órdenes del día a CSV
   */
  exportTodayOrdersToCSV(): Observable<void> {
    return new Observable(observer => {
      this.orderRepository.exportTodayOrdersToCSV().subscribe({
        next: (blob) => {
          const today = new Date().toISOString().split('T')[0];
          this.downloadBlobAsCSV(blob, `orders-${today}.csv`);
          observer.next();
          observer.complete();
        },
        error: () => {
          // Fallback
          this.exportTodayOrdersClientSide().subscribe({
            next: () => {
              observer.next();
              observer.complete();
            },
            error: (err) => observer.error(err)
          });
        }
      });
    });
  }

  /**
   * Exporta reporte de órdenes por rango de fechas
   */
  exportDateRangeOrdersToCSV(startDate: Date, endDate: Date): Observable<void> {
    return new Observable(observer => {
      this.orderRepository.exportDateRangeToCSV(startDate, endDate).subscribe({
        next: (blob) => {
          const start = startDate.toISOString().split('T')[0];
          const end = endDate.toISOString().split('T')[0];
          this.downloadBlobAsCSV(blob, `orders-${start}-to-${end}.csv`);
          observer.next();
          observer.complete();
        },
        error: () => {
          // Fallback
          this.getOrdersByDateRange(startDate, endDate).subscribe({
            next: (orders) => {
              const start = startDate.toISOString().split('T')[0];
              const end = endDate.toISOString().split('T')[0];
              const orderResponses = orders.map(order => order as OrderResponseDto);
              this.exportOrdersClientSideFromData(orderResponses, `orders-${start}-to-${end}.csv`);
              observer.next();
              observer.complete();
            },
            error: (err) => observer.error(err)
          });
        }
      });
    });
  }

  // ============================================
  // MÉTODOS PRIVADOS DE EXPORTACIÓN
  // ============================================

  /**
   * Exporta órdenes en el lado del cliente (fallback)
   */
  private exportOrdersClientSide(params?: OrderFilterParams): Observable<void> {
    return new Observable(observer => {
      // Obtener todas las órdenes
      const allParams = { ...params, pageSize: 10000 };
      
      this.getOrders(allParams).subscribe({
        next: (response) => {
          const csvContent = this.orderRepository.convertOrdersToCSV(response.data);
          this.orderRepository.downloadCSVFile(csvContent, 'orders-export.csv');
          observer.next();
          observer.complete();
        },
        error: (err) => observer.error(err)
      });
    });
  }

  /**
   * Exporta órdenes seleccionadas en el cliente
   */
  private exportSelectedOrdersClientSide(orderIds: number[]): Observable<void> {
    return new Observable(observer => {
      // Obtener las órdenes específicas
      const orderRequests = orderIds.map(id => this.getOrderById(id));
      
      // Usar forkJoin para obtener todas las órdenes en paralelo
      import('rxjs').then(({ forkJoin }) => {
        forkJoin(orderRequests).subscribe({
          next: (orders) => {
            this.exportOrdersClientSideFromData(orders, 'selected-orders.csv');
            observer.next();
            observer.complete();
          },
          error: (err) => observer.error(err)
        });
      });
    });
  }

  /**
   * Exporta órdenes del día en el cliente
   */
  private exportTodayOrdersClientSide(): Observable<void> {
    return new Observable(observer => {
      this.getTodayOrders().subscribe({
        next: (response) => {
          const today = new Date().toISOString().split('T')[0];
          this.exportOrdersClientSideFromData(response.data, `orders-${today}.csv`);
          observer.next();
          observer.complete();
        },
        error: (err) => observer.error(err)
      });
    });
  }

  /**
   * Exporta órdenes desde datos ya obtenidos
   */
  private exportOrdersClientSideFromData(orders: OrderResponseDto[], filename: string): void {
    const csvContent = this.orderRepository.convertOrdersToCSV(orders);
    this.orderRepository.downloadCSVFile(csvContent, filename);
  }

  /**
   * Descarga un blob como archivo CSV
   */
  private downloadBlobAsCSV(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }


 

}