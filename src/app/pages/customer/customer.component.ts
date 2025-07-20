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
import { TabViewModule } from 'primeng/tabview';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { InputNumberModule } from 'primeng/inputnumber';
import { finalize } from 'rxjs/operators';

// Importar repository y modelos corregidos
import { CustomerRepository } from './repositories/customer.repository';
import { Customer, CustomerGroup } from '../service/customer-api.service';

@Component({
  selector: 'app-customer',
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
    TabViewModule,
    CardModule,
    DividerModule,
    InputNumberModule,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './customer.component.html',
  styleUrl: './customer.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerComponent implements OnInit {
  
  // Customer Groups
  customerGroups = signal<CustomerGroup[]>([]);
  selectedCustomerGroups = signal<CustomerGroup[]>([]);
  customerGroupDialog: boolean = false;
  customerGroupSubmitted = signal(false);
  customerGroup = signal<CustomerGroup | null>(null);
  
  // Customers
  customers = signal<Customer[]>([]);
  selectedCustomers = signal<Customer[]>([]);
  customerDialog: boolean = false;
  customerSubmitted = signal(false);
  customer = signal<Customer | null>(null);
  
  // Estados de carga y error
  loading = signal(false);
  
  @ViewChild('dtCustomerGroups') dtCustomerGroups!: Table;
  @ViewChild('dtCustomers') dtCustomers!: Table;

  // Estados disponibles (corregidos a Y/N)
  statusOptions = [
    { label: 'Habilitado', value: 'Y' },
    { label: 'Deshabilitado', value: 'N' }
  ];

  // Opciones de fuente de datos
  dataSourceOptions = [
    { label: 'Manual', value: 'M' },
    { label: 'Automático', value: 'A' },
    { label: 'Sistema', value: 'S' }
  ];

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private customerRepository: CustomerRepository
  ) {}

  ngOnInit() {
    console.log('CustomerComponent initialized');
    this.loadCustomerGroups();
    this.loadCustomers();
  }

  // ===== CARGA DE DATOS =====

  loadCustomerGroups() {
    console.log('Loading customer groups...');
    this.loading.set(true);
    
    this.customerRepository.getAllCustomerGroups()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (groups) => {
          this.customerGroups.set(groups);
          console.log('Customer groups loaded:', groups.length);
        },
        error: (error) => {
          console.error('Error loading customer groups:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar los grupos de clientes',
            life: 5000
          });
        }
      });
  }

  loadCustomers() {
    console.log('Loading customers...');
    this.loading.set(true);
    
    this.customerRepository.getAllCustomers()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (customers) => {
          this.customers.set(customers);
          console.log('Customers loaded:', customers.length);
        },
        error: (error) => {
          console.error('Error loading customers:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar los clientes',
            life: 5000
          });
        }
      });
  }

  // ===== CUSTOMER GROUPS CRUD =====

  openNewCustomerGroup() {
    const defaultGroup = this.customerRepository.createDefaultCustomerGroup();
    this.customerGroup.set({
      ...defaultGroup,
      customerGroupCode: this.customerRepository.generateCustomerGroupCode()
    });
    this.customerGroupSubmitted.set(false);
    this.customerGroupDialog = true;
  }

  editCustomerGroup(customerGroup: CustomerGroup) {
    this.customerGroup.set({ ...customerGroup });
    this.customerGroupDialog = true;
  }

  deleteCustomerGroup(customerGroup: CustomerGroup) {
    this.confirmationService.confirm({
      message: '¿Está seguro de que desea eliminar ' + customerGroup.customerGroupName + '?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.loading.set(true);
        
        this.customerRepository.deleteCustomerGroup(customerGroup.customerGroupCode)
          .pipe(finalize(() => this.loading.set(false)))
          .subscribe({
            next: (success) => {
              if (success) {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Exitoso',
                  detail: 'Grupo de clientes eliminado',
                  life: 3000
                });
                this.loadCustomerGroups();
              } else {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'No se pudo eliminar el grupo de clientes',
                  life: 5000
                });
              }
            },
            error: (error) => {
              console.error('Error deleting customer group:', error);
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al eliminar grupo de clientes',
                life: 5000
              });
            }
          });
      }
    });
  }

  deleteSelectedCustomerGroups() {
    const selected = this.selectedCustomerGroups();
    if (!selected || selected.length === 0) return;

    this.confirmationService.confirm({
      message: `¿Está seguro de que desea eliminar ${selected.length} grupo(s) seleccionado(s)?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.loading.set(true);
        let deletedCount = 0;
        let errorCount = 0;

        selected.forEach((group) => {
          this.customerRepository.deleteCustomerGroup(group.customerGroupCode).subscribe({
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
                    detail: `${deletedCount} grupo(s) eliminado(s)`,
                    life: 3000
                  });
                }
                
                if (errorCount > 0) {
                  this.messageService.add({
                    severity: 'warn',
                    summary: 'Advertencia',
                    detail: `${errorCount} grupo(s) no pudieron eliminarse`,
                    life: 5000
                  });
                }

                this.loadCustomerGroups();
                this.selectedCustomerGroups.set([]);
              }
            },
            error: () => {
              errorCount++;
              if (deletedCount + errorCount === selected.length) {
                this.loading.set(false);
                this.messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error al eliminar los grupos seleccionados',
                  life: 5000
                });
                this.loadCustomerGroups();
                this.selectedCustomerGroups.set([]);
              }
            }
          });
        });
      }
    });
  }

  hideCustomerGroupDialog() {
    this.customerGroupDialog = false;
    this.customerGroupSubmitted.set(false);
  }

  saveCustomerGroup() {
    this.customerGroupSubmitted.set(true);
    const currentGroup = this.customerGroup();

    if (!currentGroup?.customerGroupCode?.trim() || !currentGroup?.customerGroupName?.trim()) {
      return;
    }

    // Validar datos usando el repository
    const validation = this.customerRepository.validateCustomerGroupData(currentGroup);
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
    const isUpdate = this.customerRepository.isCustomerGroupCodeExists(this.customerGroups(), currentGroup.customerGroupCode);

    if (isUpdate) {
      // Actualizar grupo existente
      this.customerRepository.updateCustomerGroup(currentGroup.customerGroupCode, currentGroup)
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: (success) => {
            if (success) {
              this.messageService.add({
                severity: 'success',
                summary: 'Exitoso',
                detail: 'Grupo de clientes actualizado',
                life: 3000
              });
              this.customerGroupDialog = false;
              this.customerGroup.set(null);
              this.loadCustomerGroups();
            } else {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo actualizar el grupo de clientes',
                life: 5000
              });
            }
          },
          error: (error) => {
            console.error('Error updating customer group:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al actualizar el grupo de clientes',
              life: 5000
            });
          }
        });
    } else {
      // Crear nuevo grupo
      this.customerRepository.createCustomerGroup(currentGroup)
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: (createdGroup) => {
            if (createdGroup) {
              this.messageService.add({
                severity: 'success',
                summary: 'Exitoso',
                detail: 'Grupo de clientes creado',
                life: 3000
              });
              this.customerGroupDialog = false;
              this.customerGroup.set(null);
              this.loadCustomerGroups();
            } else {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo crear el grupo de clientes',
                life: 5000
              });
            }
          },
          error: (error) => {
            console.error('Error creating customer group:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al crear el grupo de clientes',
              life: 5000
            });
          }
        });
    }
  }

  // ===== CUSTOMERS CRUD =====

  openNewCustomer() {
    const defaultCustomer = this.customerRepository.createDefaultCustomer();
    this.customer.set({
      ...defaultCustomer,
      customerCode: this.customerRepository.generateCustomerCode()
    });
    this.customerSubmitted.set(false);
    this.customerDialog = true;
  }

  editCustomer(customer: Customer) {
    this.customer.set({ ...customer });
    this.customerDialog = true;
  }

  deleteCustomer(customer: Customer) {
    this.confirmationService.confirm({
      message: '¿Está seguro de que desea eliminar ' + customer.customerName + '?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.loading.set(true);
        
        this.customerRepository.deleteCustomer(customer.customerCode)
          .pipe(finalize(() => this.loading.set(false)))
          .subscribe({
            next: (success) => {
              if (success) {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Exitoso',
                  detail: 'Cliente eliminado',
                  life: 3000
                });
                this.loadCustomers();
              } else {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'No se pudo eliminar el cliente',
                  life: 5000
                });
              }
            },
            error: (error) => {
              console.error('Error deleting customer:', error);
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al eliminar cliente',
                life: 5000
              });
            }
          });
      }
    });
  }

  deleteSelectedCustomers() {
    const selected = this.selectedCustomers();
    if (!selected || selected.length === 0) return;

    this.confirmationService.confirm({
      message: `¿Está seguro de que desea eliminar ${selected.length} cliente(s) seleccionado(s)?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.loading.set(true);
        let deletedCount = 0;
        let errorCount = 0;

        selected.forEach((customer) => {
          this.customerRepository.deleteCustomer(customer.customerCode).subscribe({
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
                    detail: `${deletedCount} cliente(s) eliminado(s)`,
                    life: 3000
                  });
                }
                
                if (errorCount > 0) {
                  this.messageService.add({
                    severity: 'warn',
                    summary: 'Advertencia',
                    detail: `${errorCount} cliente(s) no pudieron eliminarse`,
                    life: 5000
                  });
                }

                this.loadCustomers();
                this.selectedCustomers.set([]);
              }
            },
            error: () => {
              errorCount++;
              if (deletedCount + errorCount === selected.length) {
                this.loading.set(false);
                this.messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error al eliminar los clientes seleccionados',
                  life: 5000
                });
                this.loadCustomers();
                this.selectedCustomers.set([]);
              }
            }
          });
        });
      }
    });
  }

  hideCustomerDialog() {
    this.customerDialog = false;
    this.customerSubmitted.set(false);
  }

  saveCustomer() {
    this.customerSubmitted.set(true);
    const currentCustomer = this.customer();

    if (!currentCustomer?.customerCode?.trim() || !currentCustomer?.customerName?.trim()) {
      return;
    }

    // Validar datos usando el repository
    const validation = this.customerRepository.validateCustomerData(currentCustomer);
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
    const isUpdate = this.customerRepository.isCustomerCodeExists(this.customers(), currentCustomer.customerCode);

    if (isUpdate) {
      // Actualizar cliente existente
      this.customerRepository.updateCustomer(currentCustomer.customerCode, currentCustomer)
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: (success) => {
            if (success) {
              this.messageService.add({
                severity: 'success',
                summary: 'Exitoso',
                detail: 'Cliente actualizado',
                life: 3000
              });
              this.customerDialog = false;
              this.customer.set(null);
              this.loadCustomers();
            } else {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo actualizar el cliente',
                life: 5000
              });
            }
          },
          error: (error) => {
            console.error('Error updating customer:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al actualizar el cliente',
              life: 5000
            });
          }
        });
    } else {
      // Crear nuevo cliente
      this.customerRepository.createCustomer(currentCustomer)
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: (createdCustomer) => {
            if (createdCustomer) {
              this.messageService.add({
                severity: 'success',
                summary: 'Exitoso',
                detail: 'Cliente creado',
                life: 3000
              });
              this.customerDialog = false;
              this.customer.set(null);
              this.loadCustomers();
            } else {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo crear el cliente',
                life: 5000
              });
            }
          },
          error: (error) => {
            console.error('Error creating customer:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al crear el cliente',
              life: 5000
            });
          }
        });
    }
  }

  // ===== MÉTODOS DE UTILIDAD =====

  getSeverity(status: string): 'success' | 'danger' {
    return this.customerRepository.getEnabledSeverity(status);
  }

  getStatusLabel(status: string): string {
    return this.customerRepository.getEnabledLabel(status);
  }

  getCustomerGroupName(groupCode: string): string {
    return this.customerRepository.getCustomerGroupName(this.customerGroups(), groupCode);
  }

  getCustomerGroupOptions() {
    return this.customerRepository.getCustomerGroupOptions(this.customerGroups());
  }

  isEditingCustomerGroup(): boolean {
    const group = this.customerGroup();
    if (!group) return false;
    return this.customerRepository.isCustomerGroupCodeExists(this.customerGroups(), group.customerGroupCode);
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  public isValidEmail(email: string | undefined): boolean {
    if (!email) return true; // Email es opcional
    return this.customerRepository.isValidEmail(email);
  }

  // ===== EXPORTAR DATOS =====

  exportCustomerGroups() {
    this.customerRepository.exportCustomerGroupsToCSV(this.customerGroups());
    this.messageService.add({
      severity: 'success',
      summary: 'Exitoso',
      detail: 'Grupos de clientes exportados',
      life: 3000
    });
  }

  exportCustomers() {
    this.customerRepository.exportCustomersToCSV(this.customers());
    this.messageService.add({
      severity: 'success',
      summary: 'Exitoso',
      detail: 'Clientes exportados',
      life: 3000
    });
  }

  // ===== VALIDACIONES ADICIONALES =====

  validateCustomerGroup(): boolean {
    const group = this.customerGroup();
    if (!group) return false;

    const validation = this.customerRepository.validateCustomerGroupData(group);
    if (!validation.isValid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error de Validación',
        detail: validation.errors.join(', '),
        life: 5000
      });
      return false;
    }

    return true;
  }

  validateCustomer(): boolean {
    const customer = this.customer();
    if (!customer) return false;

    const validation = this.customerRepository.validateCustomerData(customer);
    if (!validation.isValid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error de Validación',
        detail: validation.errors.join(', '),
        life: 5000
      });
      return false;
    }

    return true;
  }

  // ===== MÉTODOS PARA TEMPLATE =====

  getDataSourceLabel(dataSource: string): string {
    console.log('dataSource', dataSource);
    if (!dataSource) return 'No definido';
    return dataSource;
  }

  getDataSourceSeverity(dataSource: string): 'success' | 'info' | 'warning' {
    if (!dataSource) return 'info';
    // Asignar colores basados en el primer carácter o contenido
    const firstChar = dataSource.charAt(0).toUpperCase();
    switch (firstChar) {
      case 'S': return 'success'; // SAP
      case 'R': return 'info';    // Ratial Pro
      case 'O': return 'warning'; // Oracle
      default: return 'info';
    }
  }

  refreshData() {
    this.loadCustomerGroups();
    this.loadCustomers();
  }

  // ===== BÚSQUEDA Y FILTROS =====

  searchCustomers(searchTerm: string) {
    if (searchTerm.trim()) {
      this.customerRepository.searchCustomers(searchTerm).subscribe({
        next: (response) => {
          if (response) {
            this.customers.set(response.data || []);
          }
        },
        error: (error) => {
          console.error('Error searching customers:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al buscar clientes',
            life: 5000
          });
        }
      });
    } else {
      this.loadCustomers();
    }
  }

  searchCustomerGroups(searchTerm: string) {
    if (searchTerm.trim()) {
      this.customerRepository.searchCustomerGroups(searchTerm).subscribe({
        next: (response) => {
          if (response) {
            this.customerGroups.set(response.data || []);
          }
        },
        error: (error) => {
          console.error('Error searching customer groups:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al buscar grupos de clientes',
            life: 5000
          });
        }
      });
    } else {
      this.loadCustomerGroups();
    }
  }
}