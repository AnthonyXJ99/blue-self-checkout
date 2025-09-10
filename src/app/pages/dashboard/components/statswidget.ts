import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService, DashboardStats } from '../services/dashboard.service';

@Component({
    standalone: true,
    selector: 'app-stats-widget',
    imports: [CommonModule],
    template: `<div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Pedidos</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ stats?.totalOrders || 0 }}</div>
                    </div>
                    <div class="flex items-center justify-center bg-blue-100 dark:bg-blue-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-shopping-cart text-blue-500 !text-xl"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">{{ getNewOrdersCount() }} nuevos </span>
                <span class="text-muted-color">desde última visita</span>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Ingresos</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ formatCurrency(stats?.totalRevenue || 0) }}</div>
                    </div>
                    <div class="flex items-center justify-center bg-orange-100 dark:bg-orange-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-dollar text-orange-500 !text-xl"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">+{{ getRevenueGrowth() }}% </span>
                <span class="text-muted-color">desde la semana pasada</span>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Clientes</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ stats?.totalCustomers || 0 }}</div>
                    </div>
                    <div class="flex items-center justify-center bg-cyan-100 dark:bg-cyan-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-users text-cyan-500 !text-xl"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">{{ getNewCustomersCount() }} </span>
                <span class="text-muted-color">nuevos registros</span>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Dispositivos</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ stats?.totalDevices || 0 }}</div>
                    </div>
                    <div class="flex items-center justify-center bg-purple-100 dark:bg-purple-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-mobile text-purple-500 !text-xl"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">{{ getOnlineDevicesCount() }} </span>
                <span class="text-muted-color">en línea</span>
            </div>
        </div>`,
    providers: [DashboardService]
})
export class StatsWidget implements OnInit {
    stats: DashboardStats | null = null;
    loading = true;

    constructor(private dashboardService: DashboardService) {}

    ngOnInit() {
        this.loadStats();
    }

    private loadStats() {
        this.dashboardService.getDashboardStats().subscribe({
            next: (data) => {
                this.stats = data;
                this.loading = false;
            },
            error: (error) => {
                console.error('Error loading dashboard stats:', error);
                this.loading = false;
            }
        });
    }

    formatCurrency(amount: number): string {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    getNewOrdersCount(): number {
        if (!this.stats?.recentOrders) return 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return this.stats.recentOrders.filter(order => {
            if (!order.docDate) return false;
            const orderDate = new Date(order.docDate);
            orderDate.setHours(0, 0, 0, 0);
            return orderDate.getTime() === today.getTime();
        }).length;
    }

    getRevenueGrowth(): number {
        return Math.floor(Math.random() * 50) + 10;
    }

    getNewCustomersCount(): number {
        return Math.floor(Math.random() * 100) + 20;
    }

    getOnlineDevicesCount(): number {
        return this.stats?.deviceStatus?.online || 0;
    }
}
