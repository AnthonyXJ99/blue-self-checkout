import { ChangeDetectionStrategy, Component, signal, ViewChild, OnInit } from '@angular/core';
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
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ToastModule } from 'primeng/toast';
import { finalize } from 'rxjs/operators';

// Importar repository y modelos
import { ProductGroupRepository } from './repositories/product-group.repository';
import { ProductGroup, ProductGroupCreateRequest, ProductGroupUpdateRequest } from './model/product-group.model';
import { ImageSelectorComponent } from '../../../layout/component/app-image-selector.component';

// Interfaz para compatibilidad con el template existente
interface ProductGroupItem extends ProductGroup {
  // El template usa estas propiedades tal como están en ProductGroup
}

@Component({
  selector: 'app-product-group',
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
    TagModule,
    ConfirmDialogModule,
    InputIconModule,
    IconFieldModule,
    ToastModule,
    ImageSelectorComponent
  ],
  templateUrl: './product-group.component.html',
  styleUrl: './product-group.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ConfirmationService, MessageService]
})
export class ProductGroupComponent implements OnInit {
  
  productGroups = signal<ProductGroupItem[]>([]);
  selectedProductGroups = signal<ProductGroupItem[]>([]);
  productGroupDialog = false;
  productGroup = signal<ProductGroupItem | null>(null);
  submitted = signal(false);
  loading = signal(false);
  
  @ViewChild('dt') dt!: Table;

  // Estados disponibles (corregidos según API: Y/N)
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
    private productGroupRepository: ProductGroupRepository
  ) {}

  ngOnInit() {
    console.log('ProductGroupComponent initialized');
    this.loadProductGroups();
  }

  loadProductGroups() {
    console.log('Loading product groups...');
    this.loading.set(true);
    
    this.productGroupRepository.getAllProductGroups()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (groups) => {
          // Ordenar por visOrder
          const sortedGroups = this.productGroupRepository.sortByVisOrder(groups);
          this.productGroups.set(sortedGroups);
          console.log('Product groups loaded:', groups.length);
        },
        error: (error) => {
          console.error('Error loading product groups:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar los grupos de productos',
            life: 5000
          });
        }
      });
  }

  openNew() {
    const defaultGroup = this.productGroupRepository.createDefaultProductGroup();
    // Asignar el siguiente orden disponible
    const nextOrder = this.productGroupRepository.getNextVisOrder(this.productGroups());
    
    this.productGroup.set({
      ...defaultGroup,
      visOrder: nextOrder
    });
    this.submitted.set(false);
    this.productGroupDialog = true;
  }

  editProductGroup(group: ProductGroupItem) {
    this.productGroup.set({ ...group });
    this.productGroupDialog = true;
  }

  deleteProductGroup(group: ProductGroupItem) {
    this.confirmationService.confirm({
      message: '¿Está seguro de que desea eliminar ' + group.productGroupName + '?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.loading.set(true);
        
        this.productGroupRepository.deleteProductGroup(group.productGroupCode)
          .pipe(finalize(() => this.loading.set(false)))
          .subscribe({
            next: (success) => {
              if (success) {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Exitoso',
                  detail: 'Grupo de producto eliminado',
                  life: 3000
                });
                this.loadProductGroups(); // Recargar lista
              } else {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'No se pudo eliminar el grupo de producto',
                  life: 5000
                });
              }
            },
            error: (error) => {
              console.error('Error deleting product group:', error);
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al eliminar el grupo de producto',
                life: 5000
              });
            }
          });
      }
    });
  }

  deleteSelectedProductGroups() {
    const selected = this.selectedProductGroups();
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
          this.productGroupRepository.deleteProductGroup(group.productGroupCode).subscribe({
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

                // Recargar grupos y limpiar selección
                this.loadProductGroups();
                this.selectedProductGroups.set([]);
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
                this.loadProductGroups();
                this.selectedProductGroups.set([]);
              }
            }
          });
        });
      }
    });
  }

  exportCSV() {
    const csvContent = this.productGroupRepository.exportProductGroupsToCSV(this.productGroups());
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `product_groups_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  hideDialog() {
    this.productGroupDialog = false;
    this.submitted.set(false);
  }

  saveProductGroup() {
    this.submitted.set(true);
    const currentGroup = this.productGroup();

    if (!currentGroup?.productGroupCode?.trim() || !currentGroup?.productGroupName?.trim()) {
      return;
    }

    // Validar datos usando el repository
    const validation = this.productGroupRepository.validateProductGroupData(currentGroup);
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
    const isUpdate = this.isExistingProductGroup(currentGroup.productGroupCode);

    if (isUpdate) {
      // Actualizar grupo existente
      const updateData: ProductGroupUpdateRequest = {
        productGroupCode: currentGroup.productGroupCode,
        productGroupName: currentGroup.productGroupName,
        frgnName: currentGroup.frgnName,
        imageUrl: currentGroup.imageUrl,
        description: currentGroup.description,
        frgnDescription: currentGroup.frgnDescription,
        enabled: currentGroup.enabled,
        visOrder: currentGroup.visOrder,
        dataSource: currentGroup.dataSource,
        productGroupCodeERP: currentGroup.productGroupCodeERP,
        productGroupCodePOS: currentGroup.productGroupCodePOS
      };

      this.productGroupRepository.updateProductGroup(currentGroup.productGroupCode, updateData)
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: (success) => {
            if (success) {
              this.messageService.add({
                severity: 'success',
                summary: 'Exitoso',
                detail: 'Grupo de producto actualizado',
                life: 3000
              });
              this.productGroupDialog = false;
              this.productGroup.set(null);
              this.loadProductGroups();
            } else {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo actualizar el grupo de producto',
                life: 5000
              });
            }
          },
          error: (error) => {
            console.error('Error updating product group:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al actualizar el grupo de producto',
              life: 5000
            });
          }
        });
    } else {
      // Crear nuevo grupo
      const createData: ProductGroupCreateRequest = {
        productGroupCode: currentGroup.productGroupCode,
        productGroupName: currentGroup.productGroupName,
        frgnName: currentGroup.frgnName,
        imageUrl: currentGroup.imageUrl,
        description: currentGroup.description,
        frgnDescription: currentGroup.frgnDescription,
        enabled: currentGroup.enabled,
        visOrder: currentGroup.visOrder,
        dataSource: currentGroup.dataSource,
        productGroupCodeERP: currentGroup.productGroupCodeERP,
        productGroupCodePOS: currentGroup.productGroupCodePOS
      };

      this.productGroupRepository.createProductGroup(createData)
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: (createdGroup) => {
            if (createdGroup) {
              this.messageService.add({
                severity: 'success',
                summary: 'Exitoso',
                detail: 'Grupo de producto creado',
                life: 3000
              });
              this.productGroupDialog = false;
              this.productGroup.set(null);
              this.loadProductGroups();
            } else {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo crear el grupo de producto',
                life: 5000
              });
            }
          },
          error: (error) => {
            console.error('Error creating product group:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al crear el grupo de producto',
              life: 5000
            });
          }
        });
    }
  }

  isExistingProductGroup(groupCode: string): boolean {
    return this.productGroups().some(group => group.productGroupCode === groupCode);
  }

  // === MÉTODOS PARA IMAGE SELECTOR ===

  onImageSelected(imageData: { url: string; title: string; imageCode: string }) {
    const currentGroup = this.productGroup();
    if (currentGroup) {
      this.productGroup.set({
        ...currentGroup,
        imageUrl: imageData.url
      });
    }
  }

  onImageCleared() {
    const currentGroup = this.productGroup();
    if (currentGroup) {
      this.productGroup.set({
        ...currentGroup,
        imageUrl: ''
      });
    }
  }

  // === MÉTODOS DE UTILIDAD ===

  getEnabledLabel(enabled: string): string {
    return enabled === 'Y' ? 'Habilitado' : 'Deshabilitado';
  }

  getEnabledSeverity(enabled: string): 'success' | 'danger' {
    return enabled === 'Y' ? 'success' : 'danger';
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

  getProductGroupStats() {
    return this.productGroupRepository.getProductGroupStats(this.productGroups());
  }

  // Método privado para obtener grupo vacío
  private getEmptyProductGroup(): ProductGroupItem {
    const defaultGroup = this.productGroupRepository.createDefaultProductGroup();
    return {
      ...defaultGroup,
      visOrder: this.productGroupRepository.getNextVisOrder(this.productGroups())
    };
  }
}