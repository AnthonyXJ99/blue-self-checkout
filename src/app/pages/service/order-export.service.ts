// ============================================
// order-export.service.ts - Servicio dedicado de exportación
// ============================================

import { Injectable } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../core/services/api.service';
import { OrderRepository } from '../orders/order/repositories/order.repository';
import { EXPORT_CONFIG } from '../../core/config/export.config';
import {
  OrderResponseDto,
  OrderFilterParams
} from '../orders/order/model/order.model';

/**
 * Servicio especializado en exportación de órdenes
 * Soporta múltiples modos: frontend, backend o híbrido
 */
@Injectable({
  providedIn: 'root'
})
export class OrderExportService {

  constructor(
    private apiService: ApiService,
    private orderRepository: OrderRepository
  ) {}

  // ============================================
  // MÉTODOS PÚBLICOS DE EXPORTACIÓN
  // ============================================

  /**
   * Exporta órdenes a CSV según la configuración
   */
  exportOrdersToCSV(params?: OrderFilterParams): Observable<void> {
    return new Observable(observer => {
      switch (EXPORT_CONFIG.MODE) {
        case 'backend':
          this.exportViaBackend(params).subscribe({
            next: () => { observer.next(); observer.complete(); },
            error: (err) => observer.error(err)
          });
          break;
          
        case 'frontend':
          this.exportViaFrontend(params).subscribe({
            next: () => { observer.next(); observer.complete(); },
            error: (err) => observer.error(err)
          });
          break;
          
        case 'hybrid':
          this.exportViaHybrid(params).subscribe({
            next: () => { observer.next(); observer.complete(); },
            error: (err) => observer.error(err)
          });
          break;
      }
    });
  }

  /**
   * Exporta órdenes específicas por IDs
   */
  exportSpecificOrdersToCSV(orderIds: number[]): Observable<void> {
    return new Observable(observer => {
      if (EXPORT_CONFIG.MODE === 'backend') {
        this.exportSpecificViaBackend(orderIds).subscribe({
          next: () => { observer.next(); observer.complete(); },
          error: () => this.fallbackToFrontend(orderIds, observer)
        });
      } else {
        this.exportSpecificViaFrontend(orderIds).subscribe({
          next: () => { observer.next(); observer.complete(); },
          error: (err) => observer.error(err)
        });
      }
    });
  }

  /**
   * Exporta órdenes del día actual
   */
  exportTodayOrdersToCSV(): Observable<void> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    return this.exportDateRangeOrdersToCSV(startOfDay, endOfDay, 'today');
  }

  /**
   * Exporta órdenes por rango de fechas
   */
  exportDateRangeOrdersToCSV(startDate: Date, endDate: Date, filePrefix: string = 'date-range'): Observable<void> {
    const params: OrderFilterParams = {
      startDate,
      endDate,
      pageSize: EXPORT_CONFIG.MAX_RECORDS_FRONTEND
    };

    return this.exportOrdersToCSV(params);
  }

  /**
   * Exporta órdenes por estado
   */
  exportOrdersByStatusToCSV(status: string): Observable<void> {
    const params: OrderFilterParams = {
      status,
      pageSize: EXPORT_CONFIG.MAX_RECORDS_FRONTEND
    };

    return this.exportOrdersToCSV(params);
  }

  // ============================================
  // MÉTODOS PRIVADOS - BACKEND MODE
  // ============================================

  private exportViaBackend(params?: OrderFilterParams): Observable<void> {
    return new Observable(observer => {
      const exportParams = {
        ...params,
        format: 'csv',
        pageSize: EXPORT_CONFIG.MAX_RECORDS_FRONTEND
      };

      this.apiService.download(EXPORT_CONFIG.ENDPOINTS.ORDERS_EXPORT, exportParams).subscribe({
        next: (blob) => {
          this.downloadBlob(blob, this.generateFileName('orders-export'));
          observer.next();
          observer.complete();
        },
        error: (err) => observer.error(err)
      });
    });
  }

  private exportSpecificViaBackend(orderIds: number[]): Observable<void> {
    return new Observable(observer => {
      this.apiService.post<Blob>(
        EXPORT_CONFIG.ENDPOINTS.ORDERS_EXPORT_CSV,
        { orderIds },
        { responseType: 'blob' } as any
      ).subscribe({
        next: (blob) => {
          this.downloadBlob(blob, this.generateFileName('selected-orders'));
          observer.next();
          observer.complete();
        },
        error: (err) => observer.error(err)
      });
    });
  }

  // ============================================
  // MÉTODOS PRIVADOS - FRONTEND MODE
  // ============================================

  private exportViaFrontend(params?: OrderFilterParams): Observable<void> {
    return new Observable(observer => {
      const allParams = { 
        ...params, 
        pageSize: EXPORT_CONFIG.MAX_RECORDS_FRONTEND 
      };

      this.orderRepository.findAll(allParams).subscribe({
        next: (response) => {
          const csvContent = this.convertOrdersToCSV(response.data);
          this.downloadCSVContent(csvContent, this.generateFileName('orders-export'));
          observer.next();
          observer.complete();
        },
        error: (err) => observer.error(err)
      });
    });
  }

  private exportSpecificViaFrontend(orderIds: number[]): Observable<void> {
    return new Observable(observer => {
      const orderRequests = orderIds.map(id => this.orderRepository.findById(id));

      forkJoin(orderRequests).subscribe({
        next: (orders) => {
          const csvContent = this.convertOrdersToCSV(orders);
          this.downloadCSVContent(csvContent, this.generateFileName('selected-orders'));
          observer.next();
          observer.complete();
        },
        error: (err) => observer.error(err)
      });
    });
  }

  // ============================================
  // MÉTODOS PRIVADOS - HYBRID MODE
  // ============================================

  private exportViaHybrid(params?: OrderFilterParams): Observable<void> {
    return new Observable(observer => {
      // Intenta backend primero, si falla usa frontend
      this.exportViaBackend(params).subscribe({
        next: () => {
          observer.next();
          observer.complete();
        },
        error: () => {
          console.warn('Backend export failed, falling back to frontend export');
          this.exportViaFrontend(params).subscribe({
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

  // ============================================
  // UTILIDADES DE CONVERSIÓN Y DESCARGA
  // ============================================

  /**
   * Convierte órdenes a formato CSV
   */
  private convertOrdersToCSV(orders: OrderResponseDto[]): string {
    const headers = [
      'ID',
      'Folio',
      'Prefijo',
      'Cliente',
      'Código Cliente',
      'Nickname',
      'Dispositivo',
      'Fecha Documento',
      'Fecha Vencimiento',
      'Estado',
      'Tipo Documento',
      'Tipo Pago',
      'Transferido',
      'Impreso',
      'Tasa Cambio',
      'Total',
      'Total Moneda Extranjera',
      'Comentarios'
    ];

    const csvData = orders.map(order => [
      order.docEntry || '',
      order.folioNum || '',
      order.folioPref || '',
      order.customerName || '',
      order.customerCode || '',
      order.nickName || '',
      order.deviceCode || '',
      order.docDate ? this.formatDate(new Date(order.docDate)) : '',
      order.docDueDate ? this.formatDate(new Date(order.docDueDate)) : '',
      this.orderRepository.getStatusLabel(order.docStatus),
      order.docType || '',
      order.paidType || '',
      order.transferred === 'Y' ? 'Sí' : 'No',
      order.printed === 'Y' ? 'Sí' : 'No',
      order.docRate || '',
      order.docTotal || 0,
      order.docTotalFC || '',
      (order.comments || '').replace(/"/g, '""') // Escapar comillas
    ]);

    // Agregar BOM para Excel en español si está configurado
    const bom = EXPORT_CONFIG.CSV.INCLUDE_BOM ? '\uFEFF' : '';
    
    const csvContent = bom + [
      headers.join(EXPORT_CONFIG.CSV.DELIMITER),
      ...csvData.map(row => 
        row.map(field => `"${field}"`).join(EXPORT_CONFIG.CSV.DELIMITER)
      )
    ].join('\n');

    return csvContent;
  }

  /**
   * Descarga contenido CSV como archivo
   */
  private downloadCSVContent(csvContent: string, filename: string): void {
    const blob = new Blob([csvContent], { 
      type: `text/csv;charset=${EXPORT_CONFIG.CSV.ENCODING}` 
    });
    this.downloadBlob(blob, filename);
  }

  /**
   * Descarga un blob como archivo
   */
  private downloadBlob(blob: Blob, filename: string): void {
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

  /**
   * Genera nombre de archivo con timestamp
   */
  private generateFileName(prefix: string): string {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
    return `${prefix}-${timestamp}.csv`;
  }

  /**
   * Formatea fecha para CSV
   */
  private formatDate(date: Date): string {
    return date.toLocaleDateString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  /**
   * Fallback para órdenes específicas
   */
  private fallbackToFrontend(orderIds: number[], observer: any): void {
    console.warn('Backend export failed, falling back to frontend export');
    this.exportSpecificViaFrontend(orderIds).subscribe({
      next: () => {
        observer.next();
        observer.complete();
      },
      error: (err) => observer.error(err)
    });
  }
}

