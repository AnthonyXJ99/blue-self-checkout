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
import { finalize } from 'rxjs/operators';

// Importar repository y modelos
import { DeviceRepository } from './repositories/device.repository';
import { Device, DeviceCreateRequest, DeviceUpdateRequest } from './model/device.model';

// Interfaz para compatibilidad con el template existente
export interface DeviceItem extends Device {
  // El template usa estas propiedades tal como están en Device
}

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
    CheckboxModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './devices.component.html',
  styleUrl: './devices.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DevicesComponent implements OnInit {
  
  devices = signal<DeviceItem[]>([]);
  allDevices = signal<DeviceItem[]>([]); // Copia de todos los dispositivos para filtros
  selectedDevices = signal<DeviceItem[] | null>(null);
  deviceDialog: boolean = false;
  submitted = signal(false);
  device = signal<DeviceItem | null>(null);
  loading = signal(false);
  
  @ViewChild('dt') dt!: Table;

  // Estados disponibles (corregidos según API: Y/N)
  enabledOptions = [
    { label: 'Todos', value: '' },
    { label: 'Habilitado', value: 'Y' },
    { label: 'Deshabilitado', value: 'N' }
  ];

  // Opciones de fuente de datos
  dataSourceOptions = [
    { label: 'Manual', value: 'M' },
    { label: 'Automático', value: 'A' },
    { label: 'Sistema', value: 'S' }
  ];

  // Filtros
  selectedEnabled = signal<string | null>(null);
  searchText = signal('');

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private deviceRepository: DeviceRepository
  ) {}

  ngOnInit() {
    console.log('DevicesComponent initialized');
    this.loadDevices();
  }

  loadDevices() {
    console.log('Loading devices...');
    this.loading.set(true);
    
    this.deviceRepository.getAllDevices()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (devices) => {
          this.allDevices.set(devices); // Guardar todos los dispositivos
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

  openNew() {
    const defaultDevice = this.deviceRepository.createDefaultDevice();
    this.device.set({
      ...defaultDevice
    });
    this.submitted.set(false);
    this.deviceDialog = true;
  }

  deleteSelectedDevices() {
    const selected = this.selectedDevices();
    if (!selected || selected.length === 0) return;

    this.confirmationService.confirm({
      message: `¿Está seguro de que desea eliminar ${selected.length} dispositivo(s) seleccionado(s)?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.loading.set(true);
        let deletedCount = 0;
        let errorCount = 0;

        selected.forEach((device) => {
          this.deviceRepository.deleteDevice(device.deviceCode).subscribe({
            next: (success) => {
              if (success) {
                deletedCount++;
              } else {
                errorCount++;
              }

              // Verificar si es la última operación
              if (deletedCount + errorCount === selected.length) {
                this.loading.set(false);
                
                if (deletedCount > 0) {
                  this.messageService.add({
                    severity: 'success',
                    summary: 'Exitoso',
                    detail: `${deletedCount} dispositivo(s) eliminado(s)`,
                    life: 3000
                  });
                }
                
                if (errorCount > 0) {
                  this.messageService.add({
                    severity: 'warn',
                    summary: 'Advertencia',
                    detail: `${errorCount} dispositivo(s) no pudieron eliminarse`,
                    life: 5000
                  });
                }

                // Recargar dispositivos y limpiar selección
                this.loadDevices();
                this.selectedDevices.set(null);
              }
            },
            error: () => {
              errorCount++;
              if (deletedCount + errorCount === selected.length) {
                this.loading.set(false);
                this.messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error al eliminar los dispositivos seleccionados',
                  life: 5000
                });
                this.loadDevices();
                this.selectedDevices.set(null);
              }
            }
          });
        });
      }
    });
  }

  editDevice(device: DeviceItem) {
    this.device.set({ ...device });
    this.deviceDialog = true;
  }

  deleteDevice(device: DeviceItem) {
    this.confirmationService.confirm({
      message: '¿Está seguro de que desea eliminar ' + device.deviceName + '?',
      header: 'Confirmar',
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
                this.loadDevices(); // Recargar lista
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

  hideDialog() {
    this.deviceDialog = false;
    this.submitted.set(false);
  }

  saveDevice() {
    this.submitted.set(true);
    const currentDevice = this.device();

    if (!currentDevice?.deviceName?.trim() || !currentDevice?.deviceCode?.trim() || !currentDevice?.ipAddress?.trim()) {
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
      const updateData: DeviceUpdateRequest = {
        deviceCode: currentDevice.deviceCode,
        deviceName: currentDevice.deviceName,
        enabled: currentDevice.enabled,
        ipAddress: currentDevice.ipAddress,
        dataSource: currentDevice.dataSource
      };

      this.deviceRepository.updateDevice(currentDevice.deviceCode, updateData)
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
      // Crear nuevo dispositivo
      const createData: DeviceCreateRequest = {
        deviceCode: currentDevice.deviceCode,
        deviceName: currentDevice.deviceName,
        enabled: currentDevice.enabled,
        ipAddress: currentDevice.ipAddress,
        dataSource: currentDevice.dataSource
      };

      this.deviceRepository.createDevice(createData)
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

  isExistingDevice(deviceCode: string): boolean {
    return this.devices().some(device => device.deviceCode === deviceCode);
  }

  findIndexById(deviceCode: string): number {
    return this.devices().findIndex(dev => dev.deviceCode === deviceCode);
  }

  createDeviceCode(): string {
    const now = new Date();
    const timestamp = now.getFullYear().toString() +
                     (now.getMonth() + 1).toString().padStart(2, '0') +
                     now.getDate().toString().padStart(2, '0') +
                     now.getHours().toString().padStart(2, '0') +
                     now.getMinutes().toString().padStart(2, '0') +
                     now.getSeconds().toString().padStart(2, '0');
    
    const randomId = Math.random().toString(36).substring(2, 8);
    return `DEV_${timestamp}_${randomId}`;
  }

  getSeverity(enabled: string): 'success' | 'danger' {
    return enabled === 'Y' ? 'success' : 'danger';
  }

  getEnabledLabel(enabled: string): string {
    return enabled === 'Y' ? 'Habilitado' : 'Deshabilitado';
  }

  getDataSourceLabel(dataSource: string): string {
    switch (dataSource) {
      case 'M': return 'Manual';
      case 'A': return 'Automático';
      case 'S': return 'Sistema';
      default: return dataSource;
    }
  }

  getDataSourceSeverity(dataSource: string): 'success' | 'info' | 'warning' {
    switch (dataSource) {
      case 'A': return 'success';
      case 'S': return 'info';
      case 'M': return 'warning';
      default: return 'info';
    }
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  onEnabledFilter() {
    const selectedStatus = this.selectedEnabled();
    console.log('Filtering by enabled status:', selectedStatus);
    
    if (selectedStatus) {
      // Filtrar dispositivos por estado desde todos los dispositivos originales
      const filtered = this.allDevices().filter(device => device.enabled === selectedStatus);
      this.devices.set(filtered);
    } else {
      // Si no hay filtro, mostrar todos los dispositivos originales
      this.devices.set(this.allDevices());
    }
  }

  // === MÉTODOS DE UTILIDAD ADICIONALES ===

  checkConnectivity(device: DeviceItem) {
    this.loading.set(true);
    this.deviceRepository.checkDeviceConnectivity(device)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (isConnected) => {
          this.messageService.add({
            severity: isConnected ? 'success' : 'error',
            summary: isConnected ? 'Conectado' : 'Sin conexión',
            detail: `Dispositivo ${device.deviceName} ${isConnected ? 'responde' : 'no responde'}`,
            life: 3000
          });
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo verificar la conectividad',
            life: 5000
          });
        }
      });
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
    const stats = this.deviceRepository.getDeviceStats();
    // Calcular estadísticas actuales desde los datos cargados
    const total = this.devices().length;
    const enabled = this.devices().filter(d => d.enabled === 'Y').length;
    const disabled = total - enabled;
    const enabledPercentage = total > 0 ? (enabled / total) * 100 : 0;

    return {
      total,
      enabled,
      disabled,
      enabledPercentage: Math.round(enabledPercentage)
    };
  }
}