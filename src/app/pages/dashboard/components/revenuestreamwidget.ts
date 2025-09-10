import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { CommonModule } from '@angular/common';
import { debounceTime, Subscription } from 'rxjs';
import { LayoutService } from '../../../layout/service/layout.service';
import { DashboardService, RevenueData } from '../services/dashboard.service';

@Component({
    standalone: true,
    selector: 'app-revenue-stream-widget',
    imports: [ChartModule, CommonModule],
    template: `<div class="card !mb-8">
        <div class="flex justify-between items-center mb-4">
            <div class="font-semibold text-xl">Ingresos por Período</div>
            <div class="flex gap-2">
                <button 
                    *ngFor="let period of periods" 
                    [class]="'px-3 py-1 text-sm rounded transition-colors ' + (selectedPeriod === period.value ? 'bg-primary text-white' : 'bg-surface-100 text-surface-600 hover:bg-surface-200')"
                    (click)="changePeriod(period.value)">
                    {{ period.label }}
                </button>
            </div>
        </div>
        
        <div *ngIf="loading" class="flex justify-center items-center h-80">
            <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
        </div>
        
        <p-chart 
            *ngIf="!loading" 
            type="line" 
            [data]="chartData" 
            [options]="chartOptions" 
            class="h-80" />
    </div>`,
    providers: [DashboardService]
})
export class RevenueStreamWidget implements OnInit, OnDestroy {
    chartData: any;
    chartOptions: any;
    loading = true;
    selectedPeriod = 30;
    
    periods = [
        { label: '7D', value: 7 },
        { label: '30D', value: 30 },
        { label: '90D', value: 90 }
    ];

    subscription!: Subscription;

    constructor(
        public layoutService: LayoutService,
        private dashboardService: DashboardService
    ) {
        this.subscription = this.layoutService.configUpdate$.pipe(debounceTime(25)).subscribe(() => {
            this.initChart();
        });
    }

    ngOnInit() {
        this.loadRevenueData();
    }

    changePeriod(days: number) {
        this.selectedPeriod = days;
        this.loadRevenueData();
    }

    private loadRevenueData() {
        this.loading = true;
        this.dashboardService.getRevenueData(this.selectedPeriod).subscribe({
            next: (data) => {
                this.processChartData(data);
                this.loading = false;
            },
            error: (error) => {
                console.error('Error loading revenue data:', error);
                this.processChartData([]);
                this.loading = false;
            }
        });
    }

    private processChartData(revenueData: RevenueData[]) {
        const labels = revenueData.map(item => this.formatDateLabel(item.date));
        const revenues = revenueData.map(item => item.revenue);
        const orders = revenueData.map(item => item.orders);

        const documentStyle = getComputedStyle(document.documentElement);
        
        this.chartData = {
            labels,
            datasets: [
                {
                    label: 'Ingresos (€)',
                    data: revenues,
                    borderColor: documentStyle.getPropertyValue('--p-primary-500'),
                    backgroundColor: documentStyle.getPropertyValue('--p-primary-100'),
                    fill: true,
                    tension: 0.4,
                    yAxisID: 'y'
                },
                {
                    label: 'Número de Pedidos',
                    data: orders,
                    borderColor: documentStyle.getPropertyValue('--p-orange-500'),
                    backgroundColor: documentStyle.getPropertyValue('--p-orange-100'),
                    fill: false,
                    tension: 0.4,
                    yAxisID: 'y1'
                }
            ]
        };

        this.initChart();
    }

    private formatDateLabel(dateStr: string): string {
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-ES', {
            month: 'short',
            day: 'numeric'
        });
    }

    initChart() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const borderColor = documentStyle.getPropertyValue('--surface-border');
        const textMutedColor = documentStyle.getPropertyValue('--text-color-secondary');

        this.chartOptions = {
            maintainAspectRatio: false,
            aspectRatio: 0.8,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    labels: {
                        color: textColor
                    }
                },
                tooltip: {
                    callbacks: {
                        label: (context: any) => {
                            if (context.datasetIndex === 0) {
                                return `Ingresos: ${this.formatCurrency(context.parsed.y)}`;
                            } else {
                                return `Pedidos: ${context.parsed.y}`;
                            }
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: textMutedColor
                    },
                    grid: {
                        color: borderColor,
                        borderColor: 'transparent',
                        drawTicks: false
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    ticks: {
                        color: textMutedColor,
                        callback: (value: any) => this.formatCurrency(value)
                    },
                    grid: {
                        color: borderColor,
                        borderColor: 'transparent',
                        drawTicks: false
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    ticks: {
                        color: textMutedColor
                    },
                    grid: {
                        drawOnChartArea: false,
                    },
                }
            }
        };
    }

    private formatCurrency(amount: number): string {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}
