import { Component, OnInit } from '@angular/core';
import { RippleModule } from 'primeng/ripple';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardService } from '../services/dashboard.service';
import { Order } from '../../orders/order/model/order.model';

@Component({
    standalone: true,
    selector: 'app-recent-sales-widget',
    imports: [CommonModule, TableModule, ButtonModule, RippleModule, RouterModule],
    template: `<div class="card !mb-8">
        <div class="font-semibold text-xl mb-4">Pedidos Recientes</div>
        <p-table [value]="orders" [paginator]="false" [rows]="5" responsiveLayout="scroll" [loading]="loading">
            <ng-template #header>
                <tr>
                    <th>Folio</th>
                    <th>Cliente</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th>Fecha</th>
                    <th>Acciones</th>
                </tr>
            </ng-template>
            <ng-template #body let-order>
                <tr>
                    <td style="width: 15%; min-width: 6rem;">
                        <span class="font-medium">{{ order.folioPref }}{{ order.folioNum }}</span>
                    </td>
                    <td style="width: 25%; min-width: 8rem;">
                        {{ order.customerName || order.nickName || 'Cliente Genérico' }}
                    </td>
                    <td style="width: 15%; min-width: 6rem;">
                        <span class="font-medium">{{ formatCurrency(order.docTotal || 0) }}</span>
                    </td>
                    <td style="width: 15%; min-width: 6rem;">
                        <span [class]="getStatusClass(order.docStatus)">
                            {{ getStatusLabel(order.docStatus) }}
                        </span>
                    </td>
                    <td style="width: 15%; min-width: 6rem;">
                        {{ formatDate(order.docDate) }}
                    </td>
                    <td style="width: 15%;">
                        <button 
                            pButton 
                            pRipple 
                            type="button" 
                            icon="pi pi-eye" 
                            class="p-button p-component p-button-text p-button-icon-only"
                            [routerLink]="['/order']"
                            [queryParams]="{docEntry: order.docEntry}"
                            title="Ver detalles">
                        </button>
                    </td>
                </tr>
            </ng-template>
            <ng-template #emptymessage>
                <tr>
                    <td colspan="6" class="text-center text-muted-color py-4">
                        No hay pedidos recientes para mostrar
                    </td>
                </tr>
            </ng-template>
        </p-table>
        <div class="flex justify-end mt-4">
            <button pButton pRipple type="button" label="Ver todos" class="p-button-outlined" [routerLink]="['/order']"></button>
        </div>
    </div>`,
    providers: [DashboardService]
})
export class RecentSalesWidget implements OnInit {
    orders: Order[] = [];
    loading = true;

    constructor(private dashboardService: DashboardService) {}

    ngOnInit() {
        this.loadRecentOrders();
    }

    private loadRecentOrders() {
        this.dashboardService.getRecentOrders().subscribe({
            next: (data) => {
                this.orders = data;
                this.loading = false;
            },
            error: (error) => {
                console.error('Error loading recent orders:', error);
                this.loading = false;
            }
        });
    }

    formatCurrency(amount: number): string {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }

    formatDate(date: Date | undefined): string {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    getStatusLabel(status: string | undefined): string {
        switch (status) {
            case 'P': return 'Pendiente';
            case 'C': return 'Completado';
            case 'X': return 'Cancelado';
            case 'I': return 'En Proceso';
            default: return 'Sin Estado';
        }
    }

    getStatusClass(status: string | undefined): string {
        const baseClass = 'px-2 py-1 rounded text-xs font-medium';
        switch (status) {
            case 'P': return `${baseClass} bg-orange-100 text-orange-800`;
            case 'C': return `${baseClass} bg-green-100 text-green-800`;
            case 'X': return `${baseClass} bg-red-100 text-red-800`;
            case 'I': return `${baseClass} bg-blue-100 text-blue-800`;
            default: return `${baseClass} bg-gray-100 text-gray-800`;
        }
    }
}
