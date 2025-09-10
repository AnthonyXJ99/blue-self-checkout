import { Injectable } from '@angular/core';
import { Observable, forkJoin, map, catchError, of } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { API_CONFIG } from '../../../core/config/api.config';
import { Order } from '../../orders/order/model/order.model';
import { Product } from '../../products/product/model/product.model';

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  totalDevices: number;
  recentOrders: Order[];
  topProducts: Product[];
  deviceStatus: DeviceStatusSummary;
}

export interface DeviceStatusSummary {
  online: number;
  offline: number;
  maintenance: number;
  total: number;
}

export interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(private apiService: ApiService) {}

  /**
   * Obtiene todas las estadísticas del dashboard
   */
  getDashboardStats(): Observable<DashboardStats> {
    return forkJoin({
      orders: this.getOrdersStats(),
      customers: this.getCustomersCount(),
      devices: this.getDevicesStats(),
      recentOrders: this.getRecentOrders(),
      topProducts: this.getTopProducts()
    }).pipe(
      map(data => ({
        totalOrders: data.orders.total,
        totalRevenue: data.orders.revenue,
        totalCustomers: data.customers,
        totalDevices: data.devices.total,
        recentOrders: data.recentOrders,
        topProducts: data.topProducts,
        deviceStatus: data.devices
      })),
      catchError(error => {
        console.error('Error fetching dashboard stats:', error);
        return of(this.getDefaultStats());
      })
    );
  }

  /**
   * Obtiene estadísticas de pedidos
   */
  private getOrdersStats(): Observable<{total: number, revenue: number}> {
    return this.apiService.getPaginated<Order>(API_CONFIG.ENDPOINTS.ORDERS, {
      pageSize: 1
    }).pipe(
      map(response => ({
        total: response.totalCount || 0,
        revenue: this.calculateTotalRevenue(response.data || [])
      })),
      catchError(() => of({total: 0, revenue: 0}))
    );
  }

  /**
   * Obtiene el total de clientes
   */
  private getCustomersCount(): Observable<number> {
    return this.apiService.getPaginated<any>(API_CONFIG.ENDPOINTS.CUSTOMERS, {
      pageSize: 1
    }).pipe(
      map(response => response.totalCount || 0),
      catchError(() => of(0))
    );
  }

  /**
   * Obtiene estadísticas de dispositivos
   */
  private getDevicesStats(): Observable<DeviceStatusSummary> {
    return this.apiService.getPaginated<any>(API_CONFIG.ENDPOINTS.DEVICES, {
      pageSize: 100
    }).pipe(
      map(response => {
        const devices = response.data || [];
        const total = devices.length;
        const online = devices.filter((d: any) => d.status === 'online').length;
        const offline = devices.filter((d: any) => d.status === 'offline').length;
        const maintenance = devices.filter((d: any) => d.status === 'maintenance').length;
        
        return { online, offline, maintenance, total };
      }),
      catchError(() => of({ online: 0, offline: 0, maintenance: 0, total: 0 }))
    );
  }

  /**
   * Obtiene los pedidos más recientes
   */
  getRecentOrders(): Observable<Order[]> {
    return this.apiService.getPaginated<Order>(API_CONFIG.ENDPOINTS.ORDERS, {
      pageSize: 5,
      sortBy: 'docDate',
      sortOrder: 'desc'
    }).pipe(
      map(response => response.data || []),
      catchError(() => of([]))
    );
  }

  /**
   * Obtiene los productos más vendidos
   */
  getTopProducts(): Observable<Product[]> {
    return this.apiService.getPaginated<Product>(API_CONFIG.ENDPOINTS.PRODUCTS, {
      pageSize: 10,
      sortBy: 'rating',
      sortOrder: 'desc'
    }).pipe(
      map(response => response.data || []),
      catchError(() => of([]))
    );
  }

  /**
   * Obtiene datos de ingresos por período
   */
  getRevenueData(days: number = 30): Observable<RevenueData[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    return this.apiService.getPaginated<Order>(API_CONFIG.ENDPOINTS.ORDERS, {
      startDate,
      endDate,
      pageSize: 1000
    }).pipe(
      map(response => this.processRevenueData(response.data || [])),
      catchError(() => of([]))
    );
  }

  /**
   * Procesa los datos de ingresos por fecha
   */
  private processRevenueData(orders: Order[]): RevenueData[] {
    const revenueByDate = new Map<string, {revenue: number, orders: number}>();

    orders.forEach(order => {
      if (order.docDate && order.docTotal) {
        const date = new Date(order.docDate).toISOString().split('T')[0];
        const current = revenueByDate.get(date) || {revenue: 0, orders: 0};
        
        revenueByDate.set(date, {
          revenue: current.revenue + order.docTotal,
          orders: current.orders + 1
        });
      }
    });

    return Array.from(revenueByDate.entries()).map(([date, data]) => ({
      date,
      revenue: data.revenue,
      orders: data.orders
    })).sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Calcula el total de ingresos
   */
  private calculateTotalRevenue(orders: Order[]): number {
    return orders.reduce((total, order) => total + (order.docTotal || 0), 0);
  }

  /**
   * Obtiene estadísticas por defecto en caso de error
   */
  private getDefaultStats(): DashboardStats {
    return {
      totalOrders: 0,
      totalRevenue: 0,
      totalCustomers: 0,
      totalDevices: 0,
      recentOrders: [],
      topProducts: [],
      deviceStatus: { online: 0, offline: 0, maintenance: 0, total: 0 }
    };
  }
}