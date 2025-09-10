import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { RouterModule } from '@angular/router';
import { DashboardService } from '../services/dashboard.service';
import { Product } from '../../products/product/model/product.model';

interface ProductWithRating {
    product: Product;
    percentage: number;
    color: string;
}

@Component({
    standalone: true,
    selector: 'app-best-selling-widget',
    imports: [CommonModule, ButtonModule, MenuModule, RouterModule],
    template: ` <div class="card">
        <div class="flex justify-between items-center mb-6">
            <div class="font-semibold text-xl">Productos Más Populares</div>
            <div>
                <button pButton type="button" icon="pi pi-ellipsis-v" class="p-button-rounded p-button-text p-button-plain" (click)="menu.toggle($event)"></button>
                <p-menu #menu [popup]="true" [model]="items"></p-menu>
            </div>
        </div>
        
        <div *ngIf="loading" class="text-center py-4">
            <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
        </div>

        <ul *ngIf="!loading" class="list-none p-0 m-0">
            <li *ngFor="let item of topProducts" class="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div class="flex items-center">
                    <img 
                        *ngIf="item.product.imageUrl" 
                        [src]="item.product.imageUrl" 
                        [alt]="item.product.itemName"
                        class="w-10 h-10 rounded mr-3 object-cover"
                        onerror="this.style.display='none'">
                    <div class="w-10 h-10 rounded mr-3 bg-gray-200 flex items-center justify-center" 
                         *ngIf="!item.product.imageUrl">
                        <i class="pi pi-image text-gray-400"></i>
                    </div>
                    <div>
                        <span class="text-surface-900 dark:text-surface-0 font-medium mr-2 mb-1 md:mb-0">
                            {{ item.product.itemName }}
                        </span>
                        <div class="mt-1 text-muted-color text-sm">
                            {{ formatCurrency(item.product.price) }}
                        </div>
                    </div>
                </div>
                <div class="mt-2 md:mt-0 flex items-center">
                    <div class="bg-surface-300 dark:bg-surface-500 rounded-border overflow-hidden w-40 lg:w-24" style="height: 8px">
                        <div [class]="'h-full ' + item.color" [style.width.%]="item.percentage"></div>
                    </div>
                    <span [class]="getTextColor(item.color) + ' ml-4 font-medium'">{{ item.percentage }}%</span>
                </div>
            </li>
        </ul>

        <div *ngIf="!loading && topProducts.length === 0" class="text-center text-muted-color py-4">
            No hay productos para mostrar
        </div>

        <div class="flex justify-end mt-4" *ngIf="!loading && topProducts.length > 0">
            <button pButton pRipple type="button" label="Ver todos" class="p-button-outlined" [routerLink]="['/products/product']"></button>
        </div>
    </div>`,
    providers: [DashboardService]
})
export class BestSellingWidget implements OnInit {
    topProducts: ProductWithRating[] = [];
    loading = true;
    menu = null;

    items = [
        { label: 'Actualizar', icon: 'pi pi-fw pi-refresh', command: () => this.loadTopProducts() },
        { label: 'Ver Productos', icon: 'pi pi-fw pi-external-link', routerLink: '/products/product' }
    ];

    private colors = [
        'bg-orange-500',
        'bg-cyan-500', 
        'bg-pink-500',
        'bg-green-500',
        'bg-purple-500',
        'bg-teal-500',
        'bg-blue-500',
        'bg-red-500'
    ];

    constructor(private dashboardService: DashboardService) {}

    ngOnInit() {
        this.loadTopProducts();
    }

    private loadTopProducts() {
        this.loading = true;
        this.dashboardService.getTopProducts().subscribe({
            next: (products) => {
                this.topProducts = this.processProducts(products);
                this.loading = false;
            },
            error: (error) => {
                console.error('Error loading top products:', error);
                this.loading = false;
            }
        });
    }

    private processProducts(products: Product[]): ProductWithRating[] {
        const maxRating = Math.max(...products.map(p => p.rating || 0));
        
        return products.slice(0, 6).map((product, index) => {
            const rating = product.rating || 0;
            const percentage = maxRating > 0 ? Math.round((rating / maxRating) * 100) : Math.random() * 100;
            
            return {
                product,
                percentage: Math.max(10, percentage),
                color: this.colors[index % this.colors.length]
            };
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

    getTextColor(bgColor: string): string {
        const colorMap: { [key: string]: string } = {
            'bg-orange-500': 'text-orange-500',
            'bg-cyan-500': 'text-cyan-500',
            'bg-pink-500': 'text-pink-500',
            'bg-green-500': 'text-green-500',
            'bg-purple-500': 'text-purple-500',
            'bg-teal-500': 'text-teal-500',
            'bg-blue-500': 'text-blue-500',
            'bg-red-500': 'text-red-500'
        };
        return colorMap[bgColor] || 'text-primary';
    }
}
