// ============================================
// orders-crud.component.ts
// ============================================

import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CalendarModule } from 'primeng/calendar';
import { TabViewModule } from 'primeng/tabview';
import { DividerModule } from 'primeng/divider';
import { ChipModule } from 'primeng/chip';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TextareaModule } from 'primeng/textarea';
import { CheckboxModule } from 'primeng/checkbox';
import { OrderService } from '../../service/order.service';
import { OrderResponseDto, OrderCreateDto, OrderUpdateDto, OrderFilterParams, DocumentLineCreateDto, DocumentLineUpdateDto, OrderApiResponse } from '../order/model/order.model';

interface Column {
    field: string;
    header: string;
}

@Component({
    selector: 'app-order',
    standalone: true,
    imports: [
        CommonModule,
        TableModule,
        FormsModule,
        ButtonModule,
        RippleModule,
        ToastModule,
        ToolbarModule,
        InputTextModule,
        SelectModule,
        InputNumberModule,
        DialogModule,
        TagModule,
        InputIconModule,
        IconFieldModule,
        ConfirmDialogModule,
        CalendarModule,
        TabViewModule,
        DividerModule,
        ChipModule,
        TooltipModule,
        ProgressSpinnerModule,
        TextareaModule,
        CheckboxModule
    ],
    templateUrl: './order.component.html',
    styleUrls: ['./order.component.css'],
    providers: [MessageService, OrderService, ConfirmationService]
})
export class OrderComponent implements OnInit {
    orderDialog = signal(false);
    viewDialog = signal(false);
    orders = signal<OrderResponseDto[]>([]);
    order = signal<OrderCreateDto | OrderUpdateDto | null>(null);
    selectedOrder = signal<OrderResponseDto | null>(null);
    selectedOrders = signal<OrderResponseDto[]>([]);
    orderLines = signal<any[]>([]);
    submitted = signal(false);
    loading = signal(false);
    saving = signal(false);
    isEditing = signal(false);
    
    // Paginación
    totalRecords = signal(0);
    pageSize = signal(10);
    currentPage = signal(1);
    
    // Filtros
    selectedStatus: string | null = null;
    selectedDocType: string | null = null;
    startDate: Date | null = null;
    endDate: Date | null = null;
    minTotal: number | null = null;
    maxTotal: number | null = null;

    @ViewChild('dt') dt!: Table;

    // Opciones para selects
    statusOptions = [
        { label: 'Pendiente', value: 'P' },
        { label: 'En Proceso', value: 'I' },
        { label: 'Completado', value: 'C' },
        { label: 'Cancelado', value: 'X' }
    ];

    docTypeOptions = [
        { label: 'Orden', value: 'O' },
        { label: 'Factura', value: 'F' },
        { label: 'Cotización', value: 'Q' }
    ];

    paidTypeOptions = [
        { label: 'Efectivo', value: 'C' },
        { label: 'Tarjeta', value: 'T' },
        { label: 'Transferencia', value: 'R' },
        { label: 'Mixto', value: 'M' }
    ];

    lineStatusOptions = [
        { label: 'Pendiente', value: 'P' },
        { label: 'Procesando', value: 'I' },
        { label: 'Completado', value: 'C' },
        { label: 'Cancelado', value: 'X' }
    ];

    yesNoOptions = [
        { label: 'Sí', value: 'Y' },
        { label: 'No', value: 'N' }
    ];

    constructor(
        private orderService: OrderService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() {
        this.loadOrders();
    }

    // ============================================
    // MÉTODOS DE CARGA DE DATOS
    // ============================================

    loadOrders() {
        this.loading.set(true);
        const params: OrderFilterParams = {
            page: this.currentPage(),
            pageSize: this.pageSize()
        };
    
        this.orderService.getOrders(params).subscribe({
            next: (response: OrderApiResponse<OrderResponseDto>) => {
                console.log('📋 Response completa:', response);
                console.log('📊 Total records:', response.totalRecords);
                console.log('📄 Current page:', response.pageNumber);
                console.log('📈 Total pages:', response.totalPages);
                
                this.orders.set(response.data);
                this.totalRecords.set(response.totalRecords); // ✅ Ahora existe!
                this.loading.set(false);
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cargar las órdenes: ' + error.message,
                    life: 5000
                });
                this.loading.set(false);
            }
        });
    }

    onLazyLoad(event: any) {
        this.currentPage.set(Math.floor(event.first / event.rows) + 1);
        this.pageSize.set(event.rows);
        this.loadOrders();
    }

    // ============================================
    // MÉTODOS DE FILTRADO
    // ============================================

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    clearFilters() {
        this.selectedStatus = null;
        this.selectedDocType = null;
        this.startDate = null;
        this.endDate = null;
        this.minTotal = null;
        this.maxTotal = null;
        this.dt.clear();
        this.loadOrders();
    }

    onStatusFilter() {
        this.applyFilters();
    }

    onDocTypeFilter() {
        this.applyFilters();
    }

    onDateRangeFilter() {
        this.applyFilters();
    }

    onTotalRangeFilter() {
        this.applyFilters();
    }

    applyFilters() {
        const params: OrderFilterParams = {
            page: 1,
            pageSize: this.pageSize(),
            status: this.selectedStatus || undefined,
            docType: this.selectedDocType || undefined,
            startDate: this.startDate || undefined,
            endDate: this.endDate || undefined
        };

        this.currentPage.set(1);
        this.loading.set(true);

        this.orderService.getOrders(params).subscribe({
            next: (response) => {
                this.orders.set(response.data);
                this.totalRecords.set(response.totalCount);
                this.loading.set(false);
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al filtrar las órdenes: ' + error.message,
                    life: 5000
                });
                this.loading.set(false);
            }
        });
    }

    // ============================================
    // MÉTODOS DE CRUD
    // ============================================

    openNew() {
        this.order.set({
            folioNum: '',
            docDate: new Date(),
            docStatus: 'P',
            docType: 'O',
            transferred: 'N',
            printed: 'N',
            orderLines: []
        });
        this.orderLines.set([]);
        this.submitted.set(false);
        this.isEditing.set(false);
        this.orderDialog.set(true);
    }

    editOrder(order: OrderResponseDto) {
        const orderLines = (order.orderLines || []).map(line => ({
            ...line,
            quantity: line.quantity ?? 0,
            price: line.price ?? 0,
            lineTotal: line.lineTotal ?? 0
        }));
        this.order.set({ ...order, orderLines });
        this.orderLines.set([...orderLines]);
        this.submitted.set(false);
        this.isEditing.set(true);
        this.orderDialog.set(true);
    }

    viewOrder(order: OrderResponseDto) {
        this.selectedOrder.set(order);
        this.viewDialog.set(true);
    }

    editFromView() {
        const order = this.selectedOrder();
        if (order) {
            this.hideViewDialog();
            this.editOrder(order);
        }
    }

    deleteOrder(order: OrderResponseDto) {
        this.confirmationService.confirm({
            message: `¿Está seguro de que desea eliminar la orden ${this.getFullFolioNumber(order)}?`,
            header: 'Confirmar Eliminación',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí',
            rejectLabel: 'No',
            accept: () => {
                this.orderService.deleteOrder(order.docEntry).subscribe({
                    next: () => {
                        this.loadOrders();
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Éxito',
                            detail: 'Orden eliminada correctamente',
                            life: 3000
                        });
                    },
                    error: (error) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Error al eliminar la orden: ' + error.message,
                            life: 5000
                        });
                    }
                });
            }
        });
    }

    deleteSelectedOrders() {
        const selected = this.selectedOrders();
        if (!selected || selected.length === 0) return;

        this.confirmationService.confirm({
            message: `¿Está seguro de que desea eliminar ${selected.length} orden(es) seleccionada(s)?`,
            header: 'Confirmar Eliminación',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí',
            rejectLabel: 'No',
            accept: () => {
                const deletePromises = selected.map(order => 
                    this.orderService.deleteOrder(order.docEntry)
                );

                Promise.all(deletePromises.map(p => p.toPromise())).then(() => {
                    this.selectedOrders.set([]);
                    this.loadOrders();
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: `${selected.length} orden(es) eliminada(s) correctamente`,
                        life: 3000
                    });
                }).catch((error) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Error al eliminar las órdenes: ' + error.message,
                        life: 5000
                    });
                });
            }
        });
    }

    saveOrder() {
        this.submitted.set(true);
        const orderData = this.order();
        
        if (!orderData || !orderData.folioNum?.trim()) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error de Validación',
                detail: 'El número de folio es requerido',
                life: 5000
            });
            return;
        }

        // Asignar líneas al objeto order
        (orderData as any).orderLines = this.orderLines();

        this.saving.set(true);

        if (this.isEditing()) {
            // Actualizar
            this.orderService.updateOrder((orderData as any).docEntry, orderData as OrderUpdateDto).subscribe({
                next: () => {
                    this.hideDialog();
                    this.loadOrders();
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'Orden actualizada correctamente',
                        life: 3000
                    });
                    this.saving.set(false);
                },
                error: (error) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Error al actualizar la orden: ' + error.message,
                        life: 5000
                    });
                    this.saving.set(false);
                }
            });
        } else {
            // Crear
            this.orderService.createOrder(orderData as OrderCreateDto).subscribe({
                next: () => {
                    this.hideDialog();
                    this.loadOrders();
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'Orden creada correctamente',
                        life: 3000
                    });
                    this.saving.set(false);
                },
                error: (error) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Error al crear la orden: ' + error.message,
                        life: 5000
                    });
                    this.saving.set(false);
                }
            });
        }
    }

    // ============================================
    // MÉTODOS DE LÍNEAS
    // ============================================

    addOrderLine() {
        const newLine = {
            itemCode: '',
            itemName: '',
            quantity: 1,
            price: 0,
            lineStatus: 'P',
            taxCode: '',
            lineTotal: 0
        };
        this.orderLines.set([...this.orderLines(), newLine]);
    }

    removeOrderLine(index: number) {
        const lines = this.orderLines();
        lines.splice(index, 1);
        this.orderLines.set([...lines]);
    }

    calculateLineTotal(line: any) {
        line.lineTotal = (line.quantity || 0) * (line.price || 0);
    }

    getTotalQuantity(): number {
        return this.orderLines().reduce((total, line) => total + (line.quantity || 0), 0);
    }

    getTotalAmount(): number {
        return this.orderLines().reduce((total, line) => total + (line.lineTotal || 0), 0);
    }

    // ============================================
    // MÉTODOS DE DIALOGS
    // ============================================

    hideDialog() {
        this.orderDialog.set(false);
        this.submitted.set(false);
        this.saving.set(false);
    }

    hideViewDialog() {
        this.viewDialog.set(false);
        this.selectedOrder.set(null);
    }

    // ============================================
    // MÉTODOS DE EXPORTACIÓN E IMPRESIÓN
    // ============================================

    exportCSV() {
        this.loading.set(true);
        const params: OrderFilterParams = {
            status: this.selectedStatus || undefined,
            docType: this.selectedDocType || undefined,
            startDate: this.startDate || undefined,
            endDate: this.endDate || undefined
        };

        this.orderService.exportOrdersToCSV(params).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Órdenes exportadas correctamente',
                    life: 3000
                });
                this.loading.set(false);
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al exportar las órdenes: ' + error.message,
                    life: 5000
                });
                this.loading.set(false);
            }
        });
    }

    printOrder(order: OrderResponseDto) {
        // Implementar lógica de impresión
        this.messageService.add({
            severity: 'info',
            summary: 'Información',
            detail: `Imprimiendo orden ${this.getFullFolioNumber(order)}`,
            life: 3000
        });
    }

    // ============================================
    // MÉTODOS DE UTILIDAD Y FORMATEO
    // ============================================

    getFullFolioNumber(order: OrderResponseDto): string {
        return this.orderService.getFullFolioNumber(order);
    }

    getStatusLabel(status?: string): string {
        return this.orderService.getStatusLabel(status);
    }

    getStatusSeverity(status?: string): string {
        const severityMap: { [key: string]: string } = {
            'P': 'warning',    // Pendiente
            'I': 'info',       // En Proceso  
            'C': 'success',    // Completado
            'X': 'danger'      // Cancelado
        };
        return severityMap[status || ''] || 'secondary';
    }

    getDocTypeLabel(docType?: string): string {
        const typeMap: { [key: string]: string } = {
            'O': 'Orden',
            'F': 'Factura',
            'Q': 'Cotización'
        };
        return typeMap[docType || ''] || 'Desconocido';
    }

    getPaidTypeLabel(paidType?: string): string {
        const paidMap: { [key: string]: string } = {
            'C': 'Efectivo',
            'T': 'Tarjeta',
            'R': 'Transferencia',
            'M': 'Mixto'
        };
        return paidMap[paidType || ''] || 'No especificado';
    }

    canEditOrder(order: OrderResponseDto): boolean {
        return this.orderService.canEditOrder(order);
    }

    canDeleteOrder(order: OrderResponseDto): boolean {
        return this.orderService.canDeleteOrder(order);
    }

    formatDate(date?: Date | string): string {
        if (!date) return 'N/A';
        const d = new Date(date);
        return d.toLocaleDateString('es-PE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    }

    formatCurrency(amount?: number): string {
        if (!amount) return '$0.00';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    // ============================================
    // MÉTODOS DE FILTROS (OPTIONS)
    // ============================================

    getStatusFilterOptions() {
        return [
            { label: 'Todos los Estados', value: null },
            ...this.statusOptions
        ];
    }

    getDocTypeFilterOptions() {
        return [
            { label: 'Todos los Tipos', value: null },
            ...this.docTypeOptions
        ];
    }
}