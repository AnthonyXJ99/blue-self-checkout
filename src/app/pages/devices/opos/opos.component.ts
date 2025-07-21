import { ChangeDetectionStrategy, Component, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { TableModule, Table } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { TagModule } from 'primeng/tag';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { RippleModule } from 'primeng/ripple';
import { SelectModule } from 'primeng/select';
import { ChipModule } from 'primeng/chip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { finalize } from 'rxjs/operators';

// Importar repository y modelos ACTUALIZADOS
import { PointOfSale, PointOfSaleCreateRequest, PointOfSaleUpdateRequest, ConnectivityStatus } from './model/opos.model';
import { OposService } from '../../service/opos.service';

// Interfaz para compatibilidad
interface PointOfSaleItem extends PointOfSale {}

@Component({
  selector: 'app-opos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    TableModule,
    DialogModule,
    ConfirmDialogModule,
    ToastModule,
    ToolbarModule,
    TagModule,
    InputIconModule,
    IconFieldModule,
    RippleModule,
    SelectModule,
    ChipModule,
    ProgressSpinnerModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './opos.component.html',
  styleUrl: './opos.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OposComponent implements OnInit {
  
  pointOfSales = signal<PointOfSaleItem[]>([]);
  selectedPointOfSales = signal<PointOfSaleItem[]>([]);
  posDialog = false;
  pos = signal<PointOfSaleItem | null>(null);
  submitted = signal(false);
  loading = signal(false);
  connectivityTesting = signal(false);
  
  @ViewChild('dt') dt!: Table;

  // Estados disponibles (Y/N según swagger)
  statusOptions = [
    { label: 'Habilitado', value: 'Y' },
    { label: 'Deshabilitado', value: 'N' }
  ];

  // Fuentes de datos comunes
  dataSourceOptions = [
    { label: 'Manual', value: 'M' },
    { label: 'Automático', value: 'A' },
    { label: 'Sistema', value: 'S' },
    { label: 'ERP', value: 'E' },
    { label: 'POS', value: 'P' }
  ];

  // Filtros
  selectedStatusFilter = signal<string | null>(null);
  selectedDataSourceFilter = signal<string | null>(null);
  selectedConnectivityFilter = signal<string | null>(null);

  // Estados de conectividad para el componente
  connectivityStatuses = signal<Map<string, ConnectivityStatus>>(new Map());

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    public posRepository: OposService
  ) {}

  ngOnInit() {
    console.log('PointOfSalesComponent initialized');
    this.loadPointOfSales();
  }

  // === CARGA DE DATOS ===

  loadPointOfSales() {
    console.log('Loading Point of Sales...');
    this.loading.set(true);
    
    this.posRepository.getAllPointOfSales()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (posList) => {
          this.pointOfSales.set(posList);
          console.log('Point of Sales loaded:', posList.length);
          // Cargar estados de conectividad
          this.loadConnectivityStatuses();
        },
        error: (error) => {
          console.error('Error loading Point of Sales:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar los puntos de venta',
            life: 5000
          });
        }
      });
  }

  // === GESTIÓN DE CONECTIVIDAD ===

  async loadConnectivityStatuses() {
    const posWithIP = this.pointOfSales().filter(pos => pos.ipAddress);
    if (posWithIP.length === 0) return;

    this.connectivityTesting.set(true);
    
    try {
      const results = await this.posRepository.bulkPingPointOfSales(posWithIP);
      const statusMap = new Map<string, ConnectivityStatus>();
      results.forEach(result => {
        statusMap.set(result.posCode, result);
      });
      this.connectivityStatuses.set(statusMap);
    } catch (error) {
      console.error('Error testing connectivity:', error);
    } finally {
      this.connectivityTesting.set(false);
    }
  }

  async testPOSConnectivity(pos: PointOfSaleItem) {
    if (!pos.ipAddress) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'El POS no tiene dirección IP configurada',
        life: 3000
      });
      return;
    }

    this.messageService.add({
      severity: 'info',
      summary: 'Probando Conectividad',
      detail: `Haciendo ping a ${pos.ipAddress}...`,
      life: 2000
    });

    try {
      const result = await this.posRepository.pingPointOfSale(pos);
      const currentMap = this.connectivityStatuses();
      currentMap.set(pos.posCode, result);
      this.connectivityStatuses.set(new Map(currentMap));

      this.messageService.add({
        severity: result.isReachable ? 'success' : 'error',
        summary: result.isReachable ? 'Conectado' : 'Sin Respuesta',
        detail: result.isReachable 
          ? `Respuesta en ${result.responseTime}ms` 
          : result.error || 'Timeout de conexión',
        life: 4000
      });
    } catch (error) {
      console.error('Error testing connectivity:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al probar conectividad',
        life: 3000
      });
    }
  }

  // === CRUD OPERATIONS ===

  openNew() {
    const defaultPOS = this.posRepository.createDefaultPointOfSale();
    this.pos.set({
      ...defaultPOS,
      posCode: this.generatePOSCode()
    });
    this.submitted.set(false);
    this.posDialog = true;
  }

  editPOS(pos: PointOfSaleItem) {
    this.pos.set({ ...pos });
    this.posDialog = true;
  }

  deletePOS(pos: PointOfSaleItem) {
    this.confirmationService.confirm({
      message: '¿Está seguro de que desea eliminar ' + pos.posName + '?',
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.loading.set(true);
        
        this.posRepository.deletePointOfSale(pos.posCode)
          .pipe(finalize(() => this.loading.set(false)))
          .subscribe({
            next: (success) => {
              if (success !== undefined) {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Exitoso',
                  detail: 'Punto de venta eliminado',
                  life: 3000
                });
                this.loadPointOfSales();
              } else {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'No se pudo eliminar el punto de venta',
                  life: 5000
                });
              }
            },
            error: (error) => {
              console.error('Error deleting POS:', error);
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al eliminar el punto de venta',
                life: 5000
              });
            }
          });
      }
    });
  }

  deleteSelectedPOS() {
    const selected = this.selectedPointOfSales();
    if (!selected || selected.length === 0) return;

    this.confirmationService.confirm({
      message: `¿Está seguro de que desea eliminar ${selected.length} punto(s) de venta seleccionado(s)?`,
      header: 'Confirmar Eliminación Masiva',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.loading.set(true);
        const posCodes = selected.map(p => p.posCode);
        
        this.posRepository.deleteMultiplePointOfSales(posCodes)
          .pipe(finalize(() => this.loading.set(false)))
          .subscribe({
            next: (result) => {
              if (result.success > 0) {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Exitoso',
                  detail: `${result.success} punto(s) de venta eliminado(s)`,
                  life: 3000
                });
              }
              
              if (result.failed > 0) {
                this.messageService.add({
                  severity: 'warn',
                  summary: 'Advertencia',
                  detail: `${result.failed} punto(s) de venta no pudieron eliminarse`,
                  life: 5000
                });
              }

              this.loadPointOfSales();
              this.selectedPointOfSales.set([]);
            },
            error: (error) => {
              console.error('Error deleting POS:', error);
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al eliminar los puntos de venta seleccionados',
                life: 5000
              });
            }
          });
      }
    });
  }

  hideDialog() {
    this.posDialog = false;
    this.submitted.set(false);
  }

  savePOS() {
    this.submitted.set(true);
    const currentPOS = this.pos();

    if (!currentPOS?.posCode?.trim() || !currentPOS?.posName?.trim()) {
      return;
    }

    // Validar datos usando el repository
    const validation = this.posRepository.validatePointOfSaleData(currentPOS);
    if (!validation.isValid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error de Validación',
        detail: validation.errors.join(', '),
        life: 5000
      });
      return;
    }

    this.loading.set(true);

    // Verificar si es actualización o creación
    const isUpdate = this.isExistingPOS(currentPOS.posCode);

    if (isUpdate) {
      // Actualizar POS existente
      this.posRepository.updatePointOfSale(currentPOS.posCode, currentPOS as PointOfSaleUpdateRequest)
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: (success) => {
            if (success !== undefined) {
              this.messageService.add({
                severity: 'success',
                summary: 'Exitoso',
                detail: 'Punto de venta actualizado',
                life: 3000
              });
              this.posDialog = false;
              this.pos.set(null);
              this.loadPointOfSales();
            } else {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo actualizar el punto de venta',
                life: 5000
              });
            }
          },
          error: (error) => {
            console.error('Error updating POS:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al actualizar el punto de venta',
              life: 5000
            });
          }
        });
    } else {
      // Crear nuevo POS
      this.posRepository.createPointOfSale(currentPOS as PointOfSaleCreateRequest)
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: (createdPOS) => {
            if (createdPOS) {
              this.messageService.add({
                severity: 'success',
                summary: 'Exitoso',
                detail: 'Punto de venta creado',
                life: 3000
              });
              this.posDialog = false;
              this.pos.set(null);
              this.loadPointOfSales();
            } else {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo crear el punto de venta',
                life: 5000
              });
            }
          },
          error: (error) => {
            console.error('Error creating POS:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al crear el punto de venta',
              life: 5000
            });
          }
        });
    }
  }

  // === FILTROS ===

  onStatusFilter() {
    this.applyFilters();
  }

  onDataSourceFilter() {
    this.applyFilters();
  }

  onConnectivityFilter() {
    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.pointOfSales()];

    // Filtrar por estado
    const statusFilter = this.selectedStatusFilter();
    if (statusFilter) {
      filtered = filtered.filter(pos => pos.enabled === statusFilter);
    }

    // Filtrar por fuente de datos
    const dataSourceFilter = this.selectedDataSourceFilter();
    if (dataSourceFilter) {
      filtered = filtered.filter(pos => pos.datasource === dataSourceFilter);
    }

    // Filtrar por conectividad
    const connectivityFilter = this.selectedConnectivityFilter();
    if (connectivityFilter) {
      filtered = filtered.filter(pos => {
        const status = this.posRepository.getConnectivityStatus(pos);
        return status === connectivityFilter;
      });
    }

    // Aquí actualizarías la tabla filtrada
    // Por ahora solo recargamos todo si no hay filtros
    if (!statusFilter && !dataSourceFilter && !connectivityFilter) {
      this.loadPointOfSales();
    }
  }

  clearFilters() {
    this.selectedStatusFilter.set(null);
    this.selectedDataSourceFilter.set(null);
    this.selectedConnectivityFilter.set(null);
    this.loadPointOfSales();
  }

  // === UTILIDADES ===

  isExistingPOS(posCode: string): boolean {
    return this.pointOfSales().some(p => p.posCode === posCode);
  }

  getEnabledSeverity(enabled: string): 'success' | 'danger' {
    return this.posRepository.getEnabledSeverity({ enabled } as PointOfSale);
  }

  getEnabledLabel(enabled: string): string {
    return this.posRepository.getEnabledLabel({ enabled } as PointOfSale);
  }

  getConnectivityStatus(pos: PointOfSaleItem): 'connected' | 'disconnected' | 'unknown' {
    return this.posRepository.getConnectivityStatus(pos);
  }

  getConnectivityLabel(pos: PointOfSaleItem): string {
    return this.posRepository.getConnectivityLabel(pos);
  }

  getConnectivitySeverity(pos: PointOfSaleItem): 'success' | 'danger' | 'warning' {
    return this.posRepository.getConnectivitySeverity(pos);
  }

  getConnectivityIcon(pos: PointOfSaleItem): string {
    const status = this.getConnectivityStatus(pos);
    switch (status) {
      case 'connected': return 'pi pi-check-circle';
      case 'disconnected': return 'pi pi-times-circle';
      case 'unknown': return 'pi pi-question-circle';
      default: return 'pi pi-question-circle';
    }
  }

  getNetworkInfo(pos: PointOfSaleItem) {
    return this.posRepository.getNetworkInfo(pos);
  }

  getFilterOptions() {
    return {
      status: [
        { label: 'Todos los estados', value: '' },
        ...this.statusOptions
      ],
      dataSource: [
        { label: 'Todas las fuentes', value: '' },
        ...this.dataSourceOptions
      ],
      connectivity: [
        { label: 'Todas las conexiones', value: '' },
        { label: 'Conectados', value: 'connected' },
        { label: 'Desconectados', value: 'disconnected' },
        { label: 'Sin IP', value: 'unknown' }
      ]
    };
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  exportCSV() {
    const csvContent = this.posRepository.exportPointOfSalesToCSV(this.pointOfSales());
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `point_of_sales_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  generatePOSCode(): string {
    return this.posRepository.generatePOSCode();
  }

  getPOSStats() {
    return this.posRepository.getPointOfSaleStats(this.pointOfSales());
  }

  formatIPAddress(ipAddress?: string): string {
    return this.posRepository.formatIPAddress(ipAddress);
  }

  getConfigurationSuggestions(pos: PointOfSaleItem): string[] {
    return this.posRepository.getPOSConfigurationSuggestions(pos);
  }

  getConnectivityDetails(pos: PointOfSaleItem): ConnectivityStatus | null {
    return this.connectivityStatuses().get(pos.posCode) || null;
  }

  // === ACCIONES MASIVAS ===

  enableSelectedPOS() {
    const selected = this.selectedPointOfSales();
    if (!selected || selected.length === 0) return;

    this.confirmationService.confirm({
      message: `¿Habilitar ${selected.length} punto(s) de venta seleccionado(s)?`,
      header: 'Confirmar Habilitación',
      icon: 'pi pi-question-circle',
      accept: () => {
        this.loading.set(true);
        const posCodes = selected.map(p => p.posCode);
        
        this.posRepository.toggleMultiplePOSStatus(posCodes, true)
          .pipe(finalize(() => this.loading.set(false)))
          .subscribe({
            next: (result) => {
              this.messageService.add({
                severity: 'success',
                summary: 'Exitoso',
                detail: `${result.success} punto(s) de venta habilitado(s)`,
                life: 3000
              });
              this.loadPointOfSales();
              this.selectedPointOfSales.set([]);
            },
            error: (error) => {
              console.error('Error enabling POS:', error);
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al habilitar puntos de venta',
                life: 5000
              });
            }
          });
      }
    });
  }

  disableSelectedPOS() {
    const selected = this.selectedPointOfSales();
    if (!selected || selected.length === 0) return;

    this.confirmationService.confirm({
      message: `¿Deshabilitar ${selected.length} punto(s) de venta seleccionado(s)?`,
      header: 'Confirmar Deshabilitación',
      icon: 'pi pi-question-circle',
      accept: () => {
        this.loading.set(true);
        const posCodes = selected.map(p => p.posCode);
        
        this.posRepository.toggleMultiplePOSStatus(posCodes, false)
          .pipe(finalize(() => this.loading.set(false)))
          .subscribe({
            next: (result) => {
              this.messageService.add({
                severity: 'success',
                summary: 'Exitoso',
                detail: `${result.success} punto(s) de venta deshabilitado(s)`,
                life: 3000
              });
              this.loadPointOfSales();
              this.selectedPointOfSales.set([]);
            },
            error: (error) => {
              console.error('Error disabling POS:', error);
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al deshabilitar puntos de venta',
                life: 5000
              });
            }
          });
      }
    });
  }

  testConnectivityAll() {
    this.messageService.add({
      severity: 'info',
      summary: 'Probando Conectividad',
      detail: 'Probando conectividad de todos los puntos de venta...',
      life: 3000
    });
    this.loadConnectivityStatuses();
  }
}