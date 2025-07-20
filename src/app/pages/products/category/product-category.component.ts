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
import { InputNumberModule } from 'primeng/inputnumber';
import { finalize } from 'rxjs/operators';

// Importar repository y modelos corregidos
import { ProductCategoryRepository } from './repositories/product-category.repository';
import { ProductGroupRepository } from '../product-group/repositories/product-group.repository';
import { ProductCategory, ProductCategoryCreateRequest, ProductCategoryUpdateRequest } from './model/product-category.model';
import { ProductGroup } from '../product-group/model/product-group.model';
import { ImageSelectorComponent } from '../../../layout/component/app-image-selector.component';

// Interfaz corregida según swagger
interface ProductCategoryItem extends ProductCategory {
  // Usar la estructura real del swagger
}

@Component({
  selector: 'app-product-category',
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
    InputNumberModule,
    ImageSelectorComponent
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './product-category.component.html',
  styleUrl: './product-category.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCategoryComponent implements OnInit {
  
  categories = signal<ProductCategoryItem[]>([]);
  selectedCategories = signal<ProductCategoryItem[]>([]);
  categoryDialog = false;
  category = signal<ProductCategoryItem | null>(null);
  submitted = signal(false);
  loading = signal(false);
  
  // ProductGroups para el dropdown
  productGroups = signal<ProductGroup[]>([]);
  
  @ViewChild('dt') dt!: Table;

  // Estados disponibles (corregidos según API: Y/N)
  statusOptions = [
    { label: 'Habilitado', value: 'Y' },
    { label: 'Deshabilitado', value: 'N' }
  ];

  // Filtros
  selectedGroupFilter = signal<string | null>(null);
  selectedStatusFilter = signal<string | null>(null);

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private categoryRepository: ProductCategoryRepository,
    private productGroupRepository: ProductGroupRepository
  ) {}

  ngOnInit() {
    console.log('ProductCategoryComponent initialized');
    this.loadProductGroups();
    this.loadCategories();
  }

  // === CARGA DE DATOS ===

  loadProductGroups() {
    this.productGroupRepository.getAllProductGroups()
      .subscribe({
        next: (groups) => {
          this.productGroups.set(groups.filter(g => g.enabled === 'Y'));
        },
        error: (error) => {
          console.error('Error loading product groups:', error);
        }
      });
  }

  loadCategories() {
    console.log('Loading categories...');
    this.loading.set(true);
    
    this.categoryRepository.getAllProductCategories()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (categories) => {
          // Ordenar por visOrder
          const sortedCategories = this.categoryRepository.sortByVisOrder(categories);
          this.categories.set(sortedCategories);
          console.log('Categories loaded:', categories.length);
        },
        error: (error) => {
          console.error('Error loading categories:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar las categorías',
            life: 5000
          });
        }
      });
  }

  // === CRUD OPERATIONS ===

  openNew() {
    const defaultCategory = this.categoryRepository.createDefaultProductCategory();
    // Asignar el siguiente orden disponible
    const nextOrder = this.categoryRepository.getNextVisOrderForGroup(this.categories());
    
    this.category.set({
      ...defaultCategory,
      visOrder: nextOrder
    });
    this.submitted.set(false);
    this.categoryDialog = true;
  }

  editCategory(category: ProductCategoryItem) {
    this.category.set({ ...category });
    this.categoryDialog = true;
  }

  deleteCategory(category: ProductCategoryItem) {
    this.confirmationService.confirm({
      message: '¿Está seguro de que desea eliminar ' + category.categoryItemName + '?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.loading.set(true);
        
        this.categoryRepository.deleteProductCategory(category.categoryItemCode)
          .pipe(finalize(() => this.loading.set(false)))
          .subscribe({
            next: (success) => {
              if (success) {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Exitoso',
                  detail: 'Categoría eliminada',
                  life: 3000
                });
                this.loadCategories();
              } else {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'No se pudo eliminar la categoría',
                  life: 5000
                });
              }
            },
            error: (error) => {
              console.error('Error deleting category:', error);
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al eliminar la categoría',
                life: 5000
              });
            }
          });
      }
    });
  }

  deleteSelectedCategories() {
    const selected = this.selectedCategories();
    if (!selected || selected.length === 0) return;

    this.confirmationService.confirm({
      message: `¿Está seguro de que desea eliminar ${selected.length} categoría(s) seleccionada(s)?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.loading.set(true);
        let deletedCount = 0;
        let errorCount = 0;

        selected.forEach((category) => {
          this.categoryRepository.deleteProductCategory(category.categoryItemCode).subscribe({
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
                    detail: `${deletedCount} categoría(s) eliminada(s)`,
                    life: 3000
                  });
                }
                
                if (errorCount > 0) {
                  this.messageService.add({
                    severity: 'warn',
                    summary: 'Advertencia',
                    detail: `${errorCount} categoría(s) no pudieron eliminarse`,
                    life: 5000
                  });
                }

                this.loadCategories();
                this.selectedCategories.set([]);
              }
            },
            error: () => {
              errorCount++;
              if (deletedCount + errorCount === selected.length) {
                this.loading.set(false);
                this.messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error al eliminar las categorías seleccionadas',
                  life: 5000
                });
                this.loadCategories();
                this.selectedCategories.set([]);
              }
            }
          });
        });
      }
    });
  }

  hideDialog() {
    this.categoryDialog = false;
    this.submitted.set(false);
  }

  saveCategory() {
    this.submitted.set(true);
    const currentCategory = this.category();

    if (!currentCategory?.categoryItemCode?.trim() || !currentCategory?.categoryItemName?.trim()) {
      return;
    }

    // Validar datos usando el repository
    const validation = this.categoryRepository.validateProductCategoryData(currentCategory);
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
    const isUpdate = this.isExistingCategory(currentCategory.categoryItemCode);

    if (isUpdate) {
      // Actualizar categoría existente
      const updateData: ProductCategoryUpdateRequest = {
        categoryItemCode: currentCategory.categoryItemCode,
        categoryItemName: currentCategory.categoryItemName,
        frgnName: currentCategory.frgnName,
        imageUrl: currentCategory.imageUrl,
        description: currentCategory.description,
        frgnDescription: currentCategory.frgnDescription,
        visOrder: currentCategory.visOrder,
        enabled: currentCategory.enabled,
        dataSource: currentCategory.dataSource,
        groupItemCode: currentCategory.groupItemCode
      };

      this.categoryRepository.updateProductCategory(currentCategory.categoryItemCode, updateData)
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: (success) => {
            if (success) {
              this.messageService.add({
                severity: 'success',
                summary: 'Exitoso',
                detail: 'Categoría actualizada',
                life: 3000
              });
              this.categoryDialog = false;
              this.category.set(null);
              this.loadCategories();
            } else {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo actualizar la categoría',
                life: 5000
              });
            }
          },
          error: (error) => {
            console.error('Error updating category:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al actualizar la categoría',
              life: 5000
            });
          }
        });
    } else {
      // Crear nueva categoría
      const createData: ProductCategoryCreateRequest = {
        categoryItemCode: currentCategory.categoryItemCode,
        categoryItemName: currentCategory.categoryItemName,
        frgnName: currentCategory.frgnName,
        imageUrl: currentCategory.imageUrl,
        description: currentCategory.description,
        frgnDescription: currentCategory.frgnDescription,
        visOrder: currentCategory.visOrder,
        enabled: currentCategory.enabled,
        dataSource: currentCategory.dataSource,
        groupItemCode: currentCategory.groupItemCode
      };

      this.categoryRepository.createProductCategory(createData)
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: (createdCategory) => {
            if (createdCategory) {
              this.messageService.add({
                severity: 'success',
                summary: 'Exitoso',
                detail: 'Categoría creada',
                life: 3000
              });
              this.categoryDialog = false;
              this.category.set(null);
              this.loadCategories();
            } else {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo crear la categoría',
                life: 5000
              });
            }
          },
          error: (error) => {
            console.error('Error creating category:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al crear la categoría',
              life: 5000
            });
          }
        });
    }
  }

  // === MÉTODOS PARA IMAGE SELECTOR ===

  onImageSelected(imageData: { url: string; title: string; imageCode: string }) {
    const currentCategory = this.category();
    if (currentCategory) {
      this.category.set({
        ...currentCategory,
        imageUrl: imageData.url
      });
    }
  }

  onImageCleared() {
    const currentCategory = this.category();
    if (currentCategory) {
      this.category.set({
        ...currentCategory,
        imageUrl: ''
      });
    }
  }

  // === FILTROS ===

  onGroupFilter() {
    const selectedGroup = this.selectedGroupFilter();
    if (selectedGroup) {
      this.loading.set(true);
      this.categoryRepository.getCategoriesByGroup(selectedGroup)
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: (categories) => {
            const sortedCategories = this.categoryRepository.sortByVisOrder(categories);
            this.categories.set(sortedCategories);
          },
          error: (error) => {
            console.error('Error filtering categories by group:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al filtrar categorías por grupo',
              life: 5000
            });
          }
        });
    } else {
      this.loadCategories();
    }
  }

  onStatusFilter() {
    // Implementar filtro por estado si es necesario
    this.loadCategories();
  }

  // === UTILIDADES ===

  isExistingCategory(categoryCode: string): boolean {
    return this.categories().some(cat => cat.categoryItemCode === categoryCode);
  }

  getEnabledLabel(enabled: string): string {
    return enabled === 'Y' ? 'Habilitado' : 'Deshabilitado';
  }

  getEnabledSeverity(enabled: string): 'success' | 'danger' {
    return enabled === 'Y' ? 'success' : 'danger';
  }

  getProductGroupName(groupCode: string): string {
    const group = this.productGroups().find(g => g.productGroupCode === groupCode);
    return group ? group.productGroupName : groupCode || 'Sin grupo';
  }

  getProductGroupOptions(): { label: string; value: string }[] {
    return [
      { label: 'Sin grupo asignado', value: '' },
      ...this.productGroups().map(group => ({
        label: group.productGroupName,
        value: group.productGroupCode
      }))
    ];
  }

  getGroupFilterOptions(): { label: string; value: string }[] {
    return [
      { label: 'Todos los grupos', value: '' },
      { label: 'Sin grupo', value: 'sin_grupo' },
      ...this.productGroups().map(group => ({
        label: group.productGroupName,
        value: group.productGroupCode
      }))
    ];
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  exportCSV() {
    const csvContent = this.categoryRepository.exportProductCategoriesToCSV(this.categories());
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `product_categories_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  getCategoryStats() {
    return this.categoryRepository.getProductCategoryStats(this.categories());
  }

  generateCategoryCode(): string {
    const now = new Date();
    const timestamp = now.getFullYear().toString() +
                     (now.getMonth() + 1).toString().padStart(2, '0') +
                     now.getDate().toString().padStart(2, '0') +
                     now.getHours().toString().padStart(2, '0') +
                     now.getMinutes().toString().padStart(2, '0') +
                     now.getSeconds().toString().padStart(2, '0');
    
    const randomId = Math.random().toString(36).substring(2, 8);
    return `CAT_${timestamp}_${randomId}`;
  }
}