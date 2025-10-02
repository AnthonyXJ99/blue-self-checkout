import { ChangeDetectionStrategy, Component, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule, Table } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ToastModule } from 'primeng/toast';
import { TabViewModule } from 'primeng/tabview';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';
import { finalize } from 'rxjs/operators';

// Repositorio y modelos
import { SystemConfigurationRepository } from './repositories/system-configuration.repository';
import {
  SyncConfigurationDto,
  CreateSyncConfigurationDto,
  UpdateSyncConfigurationDto,
  SyncConfigurationFilterParams
} from './models/sync-configuration.model';

// Servicio de dispositivos para cargar devices
import { DeviceApiService } from '../service/device-api.service';
import { Device } from '../devices/device/model/device.model';

@Component({
  selector: 'app-system-configuration',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ToolbarModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    InputNumberModule,
    CheckboxModule,
    TagModule,
    ConfirmDialogModule,
    InputIconModule,
    IconFieldModule,
    ToastModule,
    TabViewModule,
    DividerModule,
    TooltipModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './system-configuration.component.html',
  styleUrl: './system-configuration.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SystemConfigurationComponent implements OnInit {

  // ===== SIGNALS =====
  configurations = signal<SyncConfigurationDto[]>([]);
  filteredConfigurations = signal<SyncConfigurationDto[]>([]);
  selectedConfigurations = signal<SyncConfigurationDto[] | null>(null);
  configuration = signal<Partial<CreateSyncConfigurationDto | UpdateSyncConfigurationDto> | null>(null);
  submitted = signal(false);
  loading = signal(false);
  availableDevices = signal<Device[]>([]);

  // ===== DIALOG STATES =====
  configDialog: boolean = false;
  viewDialog: boolean = false;

  // ===== FILTERS =====
  filters = signal<SyncConfigurationFilterParams>({
    configType: '',
    isActive: null,
    search: ''
  });

  @ViewChild('dt') dt!: Table;

  // Opciones para dropdowns
  configTypeOptions = [
    { label: 'Todos', value: '' },
    { label: 'Global', value: 'GLOBAL' },
    { label: 'Específica', value: 'SPECIFIC' }
  ];

  activeOptions = [
    { label: 'Todos', value: null },
    { label: 'Activos', value: true },
    { label: 'Inactivos', value: false }
  ];

  constructor(
    private repository: SystemConfigurationRepository,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private deviceApiService: DeviceApiService
  ) {}

  ngOnInit() {
    console.log('SystemConfigurationComponent initialized');
    this.loadConfigurations();
    this.loadAvailableDevices();
  }

  // ===== LOAD DATA =====

  loadConfigurations() {
    console.log('Loading configurations...');
    this.loading.set(true);

    this.repository.getAll()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (configs) => {
          const sorted = this.repository.sortConfigurations(configs);
          this.configurations.set(sorted);
          this.applyFilters();
          console.log('✅ Configurations loaded:', configs.length);
        },
        error: (error) => {
          console.error('❌ Error loading configurations:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar las configuraciones',
            life: 5000
          });
        }
      });
  }

  loadAvailableDevices() {
    console.log('Loading available devices...');
    this.deviceApiService.getEnabledDevices().subscribe({
      next: (devices) => {
        // Filtrar solo los habilitados
        const enabledDevices = devices.filter(d => this.deviceApiService.isDeviceEnabled(d));
        this.availableDevices.set(enabledDevices);
        console.log('✅ Devices loaded:', enabledDevices.length);
      },
      error: (error) => {
        console.error('❌ Error loading devices:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los dispositivos',
          life: 5000
        });
      }
    });
  }

  // ===== CRUD OPERATIONS =====

  openNew() {
    this.configuration.set(this.repository.createDefaultConfiguration(false));
    this.submitted.set(false);
    this.configDialog = true;
  }

  openNewGlobal() {
    this.configuration.set(this.repository.createDefaultConfiguration(true));
    this.submitted.set(false);
    this.configDialog = true;
  }

  editConfiguration(config: SyncConfigurationDto) {
    this.configuration.set({ ...config });
    this.submitted.set(false);
    this.configDialog = true;
  }

  viewConfiguration(config: SyncConfigurationDto) {
    this.configuration.set({ ...config });
    this.viewDialog = true;
  }

  deleteConfiguration(config: SyncConfigurationDto) {
    if (this.repository.isGlobalConfiguration(config as SyncConfigurationDto)) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'No se puede eliminar la configuración global',
        life: 5000
      });
      return;
    }

    this.confirmationService.confirm({
      message: `¿Está seguro de que desea eliminar "${config.configName}"?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.loading.set(true);

        this.repository.delete(config.id)
          .pipe(finalize(() => this.loading.set(false)))
          .subscribe({
            next: (success) => {
              if (success) {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Exitoso',
                  detail: 'Configuración eliminada',
                  life: 3000
                });
                this.loadConfigurations();
              } else {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'No se pudo eliminar la configuración',
                  life: 5000
                });
              }
            },
            error: (error) => {
              console.error('Error deleting configuration:', error);
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al eliminar la configuración',
                life: 5000
              });
            }
          });
      }
    });
  }

  deleteSelectedConfigurations() {
    const selected = this.selectedConfigurations();
    if (!selected || selected.length === 0) return;

    // Verificar si hay configuración global en la selección
    const hasGlobal = selected.some(config => this.repository.isGlobalConfiguration(config));
    if (hasGlobal) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'No se puede eliminar la configuración global',
        life: 5000
      });
      return;
    }

    this.confirmationService.confirm({
      message: `¿Está seguro de que desea eliminar ${selected.length} configuración(es) seleccionada(s)?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.loading.set(true);
        let deletedCount = 0;
        let errorCount = 0;

        selected.forEach((config) => {
          this.repository.delete(config.id).subscribe({
            next: (success) => {
              if (success) {
                deletedCount++;
              } else {
                errorCount++;
              }

              if (deletedCount + errorCount === selected.length) {
                this.loading.set(false);

                if (deletedCount > 0) {
                  this.messageService.add({
                    severity: 'success',
                    summary: 'Exitoso',
                    detail: `${deletedCount} configuración(es) eliminada(s)`,
                    life: 3000
                  });
                }

                if (errorCount > 0) {
                  this.messageService.add({
                    severity: 'warn',
                    summary: 'Advertencia',
                    detail: `${errorCount} configuración(es) no pudieron eliminarse`,
                    life: 5000
                  });
                }

                this.loadConfigurations();
                this.selectedConfigurations.set(null);
              }
            },
            error: () => {
              errorCount++;
              if (deletedCount + errorCount === selected.length) {
                this.loading.set(false);
                this.messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error al eliminar las configuraciones seleccionadas',
                  life: 5000
                });
                this.loadConfigurations();
                this.selectedConfigurations.set(null);
              }
            }
          });
        });
      }
    });
  }

  hideDialog() {
    this.configDialog = false;
    this.submitted.set(false);
  }

  hideViewDialog() {
    this.viewDialog = false;
  }

  saveConfiguration() {
    this.submitted.set(true);
    const currentConfig = this.configuration();

    if (!currentConfig?.configName?.trim()) {
      return;
    }

    // Validar configuración
    const validation = this.repository.validateConfiguration(currentConfig as CreateSyncConfigurationDto);
    if (!validation.isValid) {
      validation.errors.forEach(error => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error de validación',
          detail: error,
          life: 5000
        });
      });
      return;
    }

    this.loading.set(true);

    const config = currentConfig as any;
    const isUpdate = config.id !== undefined;

    const operation = isUpdate
      ? this.repository.update(config.id, config as UpdateSyncConfigurationDto)
      : this.repository.create(config as CreateSyncConfigurationDto);

    operation
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (result) => {
          if (result) {
            this.messageService.add({
              severity: 'success',
              summary: 'Exitoso',
              detail: isUpdate ? 'Configuración actualizada' : 'Configuración creada',
              life: 3000
            });
            this.configDialog = false;
            this.configuration.set(null);
            this.loadConfigurations();
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: `No se pudo ${isUpdate ? 'actualizar' : 'crear'} la configuración`,
              life: 5000
            });
          }
        },
        error: (error) => {
          console.error(`Error ${isUpdate ? 'updating' : 'creating'} configuration:`, error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: `Error al ${isUpdate ? 'actualizar' : 'crear'} la configuración`,
            life: 5000
          });
        }
      });
  }

  toggleActive(config: SyncConfigurationDto) {
    this.loading.set(true);

    this.repository.toggleActive(config.id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (result) => {
          if (result) {
            this.messageService.add({
              severity: 'success',
              summary: 'Exitoso',
              detail: `Configuración ${result.isActive ? 'activada' : 'desactivada'}`,
              life: 3000
            });

            // Actualizar el estado localmente
            this.configurations.update(configs =>
              configs.map(c => c.id === config.id ? { ...c, isActive: result.isActive } : c)
            );
            this.applyFilters();
          }
        },
        error: (error) => {
          console.error('Error toggling configuration:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al cambiar el estado de la configuración',
            life: 5000
          });
        }
      });
  }

  // ===== FILTERS =====

  applyFilters() {
    const filtered = this.repository.filterConfigurations(
      this.configurations(),
      this.filters()
    );
    this.filteredConfigurations.set(filtered);
  }

  onTypeFilter(event: any) {
    this.filters.update(f => ({ ...f, configType: event.value }));
    this.applyFilters();
  }

  onActiveFilter(event: any) {
    this.filters.update(f => ({ ...f, isActive: event.value }));
    this.applyFilters();
  }

  onGlobalFilter(table: Table, event: Event) {
    const searchValue = (event.target as HTMLInputElement).value;
    this.filters.update(f => ({ ...f, search: searchValue }));
    this.applyFilters();
  }

  clearFilters() {
    this.filters.set({
      configType: '',
      isActive: null,
      search: ''
    });
    if (this.dt) {
      this.dt.clear();
    }
    this.applyFilters();
  }

  // ===== UI HELPERS =====

  getDeviceOptions(): { label: string; value: string }[] {
    return this.availableDevices()
      .map(device => ({
        label: `${device.deviceCode} - ${device.deviceName}`,
        value: device.deviceCode
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  getConfigTypeSeverity(type: string): 'success' | 'info' {
    return type === 'GLOBAL' ? 'success' : 'info';
  }

  getConfigTypeLabel(type: string): string {
    return type === 'GLOBAL' ? 'Global' : 'Específica';
  }

  getActiveSeverity(isActive: boolean): 'success' | 'danger' {
    return isActive ? 'success' : 'danger';
  }

  getActiveLabel(isActive: boolean): string {
    return isActive ? 'Activo' : 'Inactivo';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  isEditMode(): boolean {
    return (this.configuration() as any)?.id !== undefined;
  }

  getStatistics() {
    return this.repository.getStatistics(this.configurations());
  }

  get currentConfig(): any {
    return this.configuration();
  }
}