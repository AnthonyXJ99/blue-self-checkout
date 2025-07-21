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
import { CheckboxModule } from 'primeng/checkbox';
import { ChipModule } from 'primeng/chip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { finalize } from 'rxjs/operators';

// Importar repositories y modelos
import { DeviceRepository } from './repositories/device.repository';
import { OposService } from '../../service/opos.service';
import { Device, DeviceCreateRequest, DeviceUpdateRequest } from './model/device.model';
import { PointOfSale } from '../opos/model/opos.model';

// Interfaz para compatibilidad con el template
export interface DeviceItem extends Device {}

@Component({
  selector: 'app-devices',
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
    CheckboxModule,
    ChipModule,
    ProgressSpinnerModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './devices.component.html',
  styleUrl: './devices.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DevicesComponent implements OnInit {
  
  devices = signal<DeviceItem[]>([]);
  allDevices = signal<DeviceItem[]>([]);
  selectedDevices = signal<DeviceItem[]>([]);
  deviceDialog = false;
  device = signal<DeviceItem | null>(null);
  submitted = signal(false);
  loading = signal(false);
  connectivityTesting = signal(false);
  
  // Datos de PointOfSales
  pointOfSales = signal<PointOfSale[]>([]);
  
  @ViewChild('dt') dt!: Table;

  // Estados disponibles (Y/N según swagger)
  statusOptions = [
    { label: 'Habilitado', value: 'Y' },
    { label: 'Deshabilitado', value: 'N' }
  ];

  // Filtros
  selectedStatusFilter = signal<string | null>(null);
  selectedPOSFilter = signal<string | null>(null);

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private deviceRepository: DeviceRepository,
    private posRepository: OposService
  ) {}

  ngOnInit() {
    console.log('DevicesComponent initialized');
    this.loadPointOfSales();
    this.loadDevices();
  }

  // === CARGA DE DATOS ===

  loadPointOfSales() {
    this.posRepository.getAllPointOfSales()
      .subscribe({
        next: (posList) => {
          this.pointOfSales.set(posList.filter(pos => pos.enabled === 'Y'));
        },
        error: (error) => {
          console.error('Error loading PointOfSales:', error);
        }
      });
  }

  loadDevices() {
    console.log('Loading devices...');
    this.loading.set(true);
    
    this.deviceRepository.getAllDevices()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (devices) => {
          this.allDevices.set(devices);
          this.devices.set(devices);
          console.log('Devices loaded:', devices.length);
        },
        error: (error) => {
          console.error('Error loading devices:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar los dispositivos',
            life: 5000
          });
        }
      });
  }

  // === CRUD OPERATIONS ===

  openNew() {
    const defaultDevice = this.deviceRepository.createDefaultDevice();
    this.device.set({
      ...defaultDevice,
      deviceCode: this.generateDeviceCode()
    });
    this.submitted.set(false);
    this.deviceDialog = true;
  }

  editDevice(device: DeviceItem) {
    this.device.set({ ...device });
    this.deviceDialog = true;
  }

  deleteDevice(device: DeviceItem) {
    this.confirmationService.confirm({
      message: '¿Está seguro de que desea eliminar ' + device.deviceName + '?',
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.loading.set(true);
        
        this.deviceRepository.deleteDevice(device.deviceCode)
          .pipe(finalize(() => this.loading.set(false)))
          .subscribe({
            next: (success) => {
              if (success) {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Exitoso',
                  detail: 'Dispositivo eliminado',
                  life: 3000
                });
                this.loadDevices();
              } else {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'No se pudo eliminar el dispositivo',
                  life: 5000
                });
              }
            },
            error: (error) => {
              console.error('Error deleting device:', error);
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al eliminar el dispositivo',
                life: 5000
              });
            }
          });
      }
    });
  }

  deleteSelectedDevices() {
    const selected = this.selectedDevices();
    if (!selected || selected.length === 0) return;

    this.confirmationService.confirm({
      message: `¿Está seguro de que desea eliminar ${selected.length} dispositivo(s) seleccionado(s)?`,
      header: 'Confirmar Eliminación Masiva',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.loading.set(true);
        const deviceCodes = selected.map(d => d.deviceCode);
        
        this.deviceRepository.deleteMultipleDevices(deviceCodes)
          .pipe(finalize(() => this.loading.set(false)))
          .subscribe({
            next: (result) => {
              if (result.success > 0) {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Exitoso',
                  detail: `${result.success} dispositivo(s) eliminado(s)`,
                  life: 3000
                });
              }
              
              if (result.failed > 0) {
                this.messageService.add({
                  severity: 'warn',
                  summary: 'Advertencia',
                  detail: `${result.failed} dispositivo(s) no pudieron eliminarse`,
                  life: 5000
                });
              }

              this.loadDevices();
              this.selectedDevices.set([]);
            },
            error: (error) => {
              console.error('Error deleting devices:', error);
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al eliminar los dispositivos seleccionados',
                life: 5000
              });
            }
          });
      }
    });
  }

  hideDialog() {
    this.deviceDialog = false;
    this.submitted.set(false);
  }

  saveDevice() {
    this.submitted.set(true);
    const currentDevice = this.device();

    if (!currentDevice?.deviceCode?.trim() || 
        !currentDevice?.deviceName?.trim() || 
        !currentDevice?.ipAddress?.trim() ||
        !currentDevice?.posCode?.trim()) {
      return;
    }

    // Validar datos usando el repository
    const validation = this.deviceRepository.validateDeviceData(currentDevice);
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
    const isUpdate = this.isExistingDevice(currentDevice.deviceCode);

    if (isUpdate) {
      // Actualizar dispositivo existente
      this.deviceRepository.updateDevice(currentDevice.deviceCode, currentDevice as DeviceUpdateRequest)
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: (success) => {
            if (success) {
              this.messageService.add({
                severity: 'success',
                summary: 'Exitoso',
                detail: 'Dispositivo actualizado',
                life: 3000
              });
              this.deviceDialog = false;
              this.device.set(null);
              this.loadDevices();
            } else {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo actualizar el dispositivo',
                life: 5000
              });
            }
          },
          error: (error) => {
            console.error('Error updating device:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al actualizar el dispositivo',
              life: 5000
            });
          }
        });
    } else {
      console.log('Creating new device:', currentDevice);
      // Crear nuevo dispositivo
      this.deviceRepository.createDevice(currentDevice as DeviceCreateRequest)
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: (createdDevice) => {
            if (createdDevice) {
              this.messageService.add({
                severity: 'success',
                summary: 'Exitoso',
                detail: 'Dispositivo creado',
                life: 3000
              });
              this.deviceDialog = false;
              this.device.set(null);
              this.loadDevices();
            } else {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo crear el dispositivo',
                life: 5000
              });
            }
          },
          error: (error) => {
            console.error('Error creating device:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al crear el dispositivo',
              life: 5000
            });
          }
        });
    }
  }

  // === GESTIÓN DE CONECTIVIDAD ===

  async testDeviceConnectivity(device: DeviceItem) {
    if (!device.ipAddress) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'El dispositivo no tiene dirección IP configurada',
        life: 3000
      });
      return;
    }

    this.messageService.add({
      severity: 'info',
      summary: 'Probando Conectividad',
      detail: `Haciendo ping a ${device.ipAddress}...`,
      life: 2000
    });

    try {
      this.deviceRepository.pingDevice(device).subscribe(result => {
        this.messageService.add({
          severity: result.isReachable ? 'success' : 'error',
          summary: result.isReachable ? 'Conectado' : 'Sin Respuesta',
          detail: result.isReachable 
            ? `Respuesta en ${result.responseTime}ms` 
            : result.error || 'Timeout de conexión',
          life: 4000
        });
      }, error => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al probar conectividad',
          life: 3000
        });
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

  // === FILTROS ===

  onStatusFilter() {
    this.applyFilters();
  }

  onPOSFilter() {
    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.allDevices()];

    // Filtrar por estado
    const statusFilter = this.selectedStatusFilter();
    if (statusFilter) {
      filtered = filtered.filter(device => device.enabled === statusFilter);
    }

    // Filtrar por POS
    const posFilter = this.selectedPOSFilter();
    if (posFilter) {
      filtered = filtered.filter(device => device.posCode === posFilter);
    }

    this.devices.set(filtered);
  }

  clearFilters() {
    this.selectedStatusFilter.set(null);
    this.selectedPOSFilter.set(null);
    this.devices.set(this.allDevices());
  }

  // === UTILIDADES ===

  isExistingDevice(deviceCode: string): boolean {
    return this.devices().some(device => device.deviceCode === deviceCode);
  }

  generateDeviceCode(): string {
    return this.deviceRepository.generateDeviceCode();
  }

  getSeverity(device: Device): 'success' | 'danger' {
    return this.deviceRepository.getEnabledSeverity(device);
  }

  getEnabledLabel(device: Device): string {
    return this.deviceRepository.getEnabledLabel(device);
  }

  getDataSourceLabel(dataSource: string): string {
    return dataSource || 'No definido';
  }

  getDataSourceSeverity(dataSource: string): 'success' | 'info' | 'warning' {
    switch (dataSource?.toUpperCase()) {
      case 'A': return 'success';
      case 'S': return 'info';
      case 'M': return 'warning';
      case 'E': return 'success';
      default: return 'info';
    }
  }

  getPOSName(posCode: string): string {
    const pos = this.pointOfSales().find(p => p.posCode === posCode);
    return pos ? pos.posName : posCode;
  }

  getPOSOptions(): { label: string; value: string }[] {
    return [
      { label: 'Seleccionar punto de venta', value: '' },
      ...this.pointOfSales().map(pos => ({
        label: `${pos.posName} (${pos.posCode})`,
        value: pos.posCode
      }))
    ];
  }

  getFilterOptions() {
    return {
      status: [
        { label: 'Todos los estados', value: '' },
        ...this.statusOptions
      ],
      pos: [
        { label: 'Todos los POS', value: '' },
        ...this.pointOfSales().map(pos => ({
          label: pos.posName,
          value: pos.posCode
        }))
      ]
    };
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  exportCSV() {
    const csvContent = this.deviceRepository.exportDevicesToCSV(this.devices());
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `devices_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  getDeviceStats() {
    const total = this.devices().length;
    const enabled = this.devices().filter(d => d.enabled === 'Y').length;
    const disabled = total - enabled;
    const enabledPercentage = total > 0 ? (enabled / total) * 100 : 0;
    const withPOS = this.devices().filter(d => d.posCode).length;
    const withoutPOS = total - withPOS;

    return {
      total,
      enabled,
      disabled,
      enabledPercentage: Math.round(enabledPercentage),
      withPOS,
      withoutPOS
    };
  }

  getConfigurationSuggestions(device: DeviceItem): string[] {
    const suggestions: string[] = [];

    if (!device.posCode) {
      suggestions.push('Asignar un punto de venta');
    }

    if (!device.ipAddress) {
      suggestions.push('Configurar dirección IP');
    }

    if (!device.dataSource) {
      suggestions.push('Definir fuente de datos');
    }

    if (device.enabled === 'N') {
      suggestions.push('Considerar habilitar el dispositivo');
    }

    return suggestions;
  }

  // === ACCIONES MASIVAS ===

  enableSelectedDevices() {
    const selected = this.selectedDevices();
    if (!selected || selected.length === 0) return;

    this.confirmationService.confirm({
      message: `¿Habilitar ${selected.length} dispositivo(s) seleccionado(s)?`,
      header: 'Confirmar Habilitación',
      icon: 'pi pi-question-circle',
      accept: () => {
        this.loading.set(true);
        const deviceCodes = selected.map(d => d.deviceCode);
        
        this.deviceRepository.toggleMultipleDevicesStatus(deviceCodes, true)
          .pipe(finalize(() => this.loading.set(false)))
          .subscribe({
            next: (result) => {
              this.messageService.add({
                severity: 'success',
                summary: 'Exitoso',
                detail: `${result.success} dispositivo(s) habilitado(s)`,
                life: 3000
              });
              this.loadDevices();
              this.selectedDevices.set([]);
            },
            error: (error) => {
              console.error('Error enabling devices:', error);
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al habilitar dispositivos',
                life: 5000
              });
            }
          });
      }
    });
  }

  disableSelectedDevices() {
    const selected = this.selectedDevices();
    if (!selected || selected.length === 0) return;

    this.confirmationService.confirm({
      message: `¿Deshabilitar ${selected.length} dispositivo(s) seleccionado(s)?`,
      header: 'Confirmar Deshabilitación',
      icon: 'pi pi-question-circle',
      accept: () => {
        this.loading.set(true);
        const deviceCodes = selected.map(d => d.deviceCode);
        
        this.deviceRepository.toggleMultipleDevicesStatus(deviceCodes, false)
          .pipe(finalize(() => this.loading.set(false)))
          .subscribe({
            next: (result) => {
              this.messageService.add({
                severity: 'success',
                summary: 'Exitoso',
                detail: `${result.success} dispositivo(s) deshabilitado(s)`,
                life: 3000
              });
              this.loadDevices();
              this.selectedDevices.set([]);
            },
            error: (error) => {
              console.error('Error disabling devices:', error);
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al deshabilitar dispositivos',
                life: 5000
              });
            }
          });
      }
    });
  }

  testConnectivityAll() {
    this.connectivityTesting.set(true);
    const devicesWithIP = this.devices().filter(d => d.ipAddress);
    
    if (devicesWithIP.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Sin dispositivos',
        detail: 'No hay dispositivos con IP configurada para probar',
        life: 3000
      });
      this.connectivityTesting.set(false);
      return;
    }

    this.messageService.add({
      severity: 'info',
      summary: 'Probando Conectividad',
      detail: `Probando conectividad de ${devicesWithIP.length} dispositivo(s)...`,
      life: 3000
    });

    // Simular test de conectividad masivo
    setTimeout(() => {
      this.connectivityTesting.set(false);
      this.messageService.add({
        severity: 'success',
        summary: 'Test Completado',
        detail: 'Prueba de conectividad finalizada',
        life: 3000
      });
    }, 2000);
  }
}