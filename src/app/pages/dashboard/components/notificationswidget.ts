import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../services/dashboard.service';

interface SystemNotification {
    id: string;
    type: 'order' | 'device' | 'system' | 'alert';
    title: string;
    message: string;
    time: Date;
    icon: string;
    iconColor: string;
    bgColor: string;
    priority: 'high' | 'medium' | 'low';
}

@Component({
    standalone: true,
    selector: 'app-notifications-widget',
    imports: [ButtonModule, MenuModule, CommonModule],
    template: `<div class="card">
        <div class="flex items-center justify-between mb-6">
            <div class="font-semibold text-xl">Notificaciones del Sistema</div>
            <div>
                <button pButton type="button" icon="pi pi-ellipsis-v" class="p-button-rounded p-button-text p-button-plain" (click)="menu.toggle($event)"></button>
                <p-menu #menu [popup]="true" [model]="items"></p-menu>
            </div>
        </div>

        <div *ngIf="loading" class="text-center py-4">
            <i class="pi pi-spin pi-spinner" style="font-size: 1.5rem"></i>
        </div>

        <div *ngIf="!loading">
            <div *ngFor="let group of groupedNotifications" class="mb-6">
                <span class="block text-muted-color font-medium mb-4 uppercase">{{ group.label }}</span>
                <ul class="p-0 m-0 list-none" [class.mb-6]="!group.isLast">
                    <li *ngFor="let notification of group.notifications; let last = last" 
                        class="flex items-center py-3"
                        [class.border-b]="!last"
                        [class.border-surface]="!last">
                        <div [class]="'w-12 h-12 flex items-center justify-center rounded-full mr-4 shrink-0 ' + notification.bgColor">
                            <i [class]="'pi ' + notification.icon + ' !text-xl ' + notification.iconColor"></i>
                        </div>
                        <div class="flex-1">
                            <div class="text-surface-900 dark:text-surface-0 font-medium mb-1">
                                {{ notification.title }}
                            </div>
                            <div class="text-surface-700 dark:text-surface-100 text-sm leading-normal" 
                                 [innerHTML]="notification.message">
                            </div>
                            <div class="text-muted-color text-xs mt-1">
                                {{ formatTime(notification.time) }}
                            </div>
                        </div>
                        <div *ngIf="notification.priority === 'high'" 
                             class="w-2 h-2 bg-red-500 rounded-full ml-2"></div>
                    </li>
                </ul>
            </div>

            <div *ngIf="notifications.length === 0" class="text-center text-muted-color py-4">
                No hay notificaciones para mostrar
            </div>
        </div>
    </div>`,
    providers: [DashboardService]
})
export class NotificationsWidget implements OnInit {
    notifications: SystemNotification[] = [];
    groupedNotifications: any[] = [];
    loading = true;

    items = [
        { label: 'Actualizar', icon: 'pi pi-fw pi-refresh', command: () => this.loadNotifications() },
        { label: 'Marcar como leídas', icon: 'pi pi-fw pi-check' }
    ];

    constructor(private dashboardService: DashboardService) {}

    ngOnInit() {
        this.loadNotifications();
    }

    private loadNotifications() {
        this.loading = true;
        
        this.dashboardService.getDashboardStats().subscribe({
            next: (stats) => {
                this.generateNotifications(stats);
                this.groupNotificationsByTime();
                this.loading = false;
            },
            error: (error) => {
                console.error('Error loading notifications:', error);
                this.generateDemoNotifications();
                this.groupNotificationsByTime();
                this.loading = false;
            }
        });
    }

    private generateNotifications(stats: any) {
        this.notifications = [];
        const now = new Date();

        if (stats.deviceStatus.offline > 0) {
            this.notifications.push({
                id: '1',
                type: 'alert',
                title: 'Dispositivos Desconectados',
                message: `<span class="text-red-600 font-bold">${stats.deviceStatus.offline}</span> dispositivos están fuera de línea`,
                time: new Date(now.getTime() - Math.random() * 3600000),
                icon: 'pi-exclamation-triangle',
                iconColor: 'text-red-500',
                bgColor: 'bg-red-100 dark:bg-red-400/10',
                priority: 'high'
            });
        }

        if (stats.recentOrders.length > 0) {
            const latestOrder = stats.recentOrders[0];
            this.notifications.push({
                id: '2',
                type: 'order',
                title: 'Nuevo Pedido',
                message: `Pedido <span class="text-primary font-bold">${latestOrder.folioPref}${latestOrder.folioNum}</span> por <span class="text-primary font-bold">${this.formatCurrency(latestOrder.docTotal || 0)}</span>`,
                time: new Date(latestOrder.docDate || now),
                icon: 'pi-shopping-cart',
                iconColor: 'text-blue-500',
                bgColor: 'bg-blue-100 dark:bg-blue-400/10',
                priority: 'medium'
            });
        }

        if (stats.deviceStatus.online > 0) {
            this.notifications.push({
                id: '3',
                type: 'system',
                title: 'Sistema Operativo',
                message: `<span class="text-green-600 font-bold">${stats.deviceStatus.online}</span> dispositivos en línea funcionando correctamente`,
                time: new Date(now.getTime() - 1800000),
                icon: 'pi-check-circle',
                iconColor: 'text-green-500',
                bgColor: 'bg-green-100 dark:bg-green-400/10',
                priority: 'low'
            });
        }

        if (stats.totalRevenue > 0) {
            this.notifications.push({
                id: '4',
                type: 'system',
                title: 'Ingresos del Día',
                message: `Ingresos totales: <span class="text-primary font-bold">${this.formatCurrency(stats.totalRevenue)}</span>`,
                time: new Date(now.getTime() - 86400000),
                icon: 'pi-chart-line',
                iconColor: 'text-purple-500',
                bgColor: 'bg-purple-100 dark:bg-purple-400/10',
                priority: 'medium'
            });
        }
    }

    private generateDemoNotifications() {
        const now = new Date();
        this.notifications = [
            {
                id: 'demo1',
                type: 'alert',
                title: 'Sistema de Demostración',
                message: 'Conecte su API para ver notificaciones reales del sistema',
                time: now,
                icon: 'pi-info-circle',
                iconColor: 'text-blue-500',
                bgColor: 'bg-blue-100 dark:bg-blue-400/10',
                priority: 'medium'
            }
        ];
    }

    private groupNotificationsByTime() {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today.getTime() - 86400000);
        const weekAgo = new Date(today.getTime() - 7 * 86400000);

        const groups = [
            { label: 'Hoy', notifications: [] as SystemNotification[], isLast: false },
            { label: 'Ayer', notifications: [] as SystemNotification[], isLast: false },
            { label: 'Semana Pasada', notifications: [] as SystemNotification[], isLast: true }
        ];

        this.notifications.forEach(notification => {
            const notificationDate = new Date(notification.time);
            
            if (notificationDate >= today) {
                groups[0].notifications.push(notification);
            } else if (notificationDate >= yesterday) {
                groups[1].notifications.push(notification);
            } else if (notificationDate >= weekAgo) {
                groups[2].notifications.push(notification);
            }
        });

        this.groupedNotifications = groups.filter(group => group.notifications.length > 0);
        if (this.groupedNotifications.length > 0) {
            this.groupedNotifications[this.groupedNotifications.length - 1].isLast = true;
        }
    }

    formatTime(time: Date): string {
        const now = new Date();
        const diffMs = now.getTime() - time.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Ahora mismo';
        if (diffMins < 60) return `Hace ${diffMins} min`;
        if (diffHours < 24) return `Hace ${diffHours}h`;
        if (diffDays < 7) return `Hace ${diffDays}d`;
        
        return time.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short'
        });
    }

    private formatCurrency(amount: number): string {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }
}
