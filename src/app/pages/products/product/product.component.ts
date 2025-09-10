import { ChangeDetectionStrategy, Component, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
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
import { InputNumberModule } from 'primeng/inputnumber';
import { RatingModule } from 'primeng/rating';
import { TabViewModule } from 'primeng/tabview';
import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';
import { DividerModule } from 'primeng/divider';
import { SkeletonModule } from 'primeng/skeleton';
import { finalize } from 'rxjs/operators';

// Importar repository y modelos
import { ProductRepository } from './repositories/product.repository';
import { ProductGroupRepository } from '../product-group/repositories/product-group.repository';
import { ProductCategoryRepository } from '../category/repositories/product-category.repository';
import { ProductTreeApiService } from '../../service/product-tree-api.service';
import { Product, ProductCreateRequest, ProductUpdateRequest, ProductMaterial, ProductAccompaniment } from './model/product.model';
import { ProductGroup } from '../product-group/model/product-group.model';
import { ProductCategory } from '../category/model/product-category.model'; 
import { ImageSelectorComponent } from '../../../layout/component/app-image-selector.component';

// Interfaz para compatibilidad con el template
interface ProductItem extends Product {}

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
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
    InputNumberModule,
    RatingModule,
    TabViewModule,
    CardModule,
    ChipModule,
    DividerModule,
    SkeletonModule,
    ImageSelectorComponent
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './product.component.html',
  styleUrl: './product.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductComponent implements OnInit {
  
  products = signal<ProductItem[]>([]);
  selectedProducts = signal<ProductItem[]>([]);
  productDialog = false;
  product = signal<ProductItem | null>(null);
  submitted = signal(false);
  loading = signal(false);
  
  // Relaciones
  productGroups = signal<ProductGroup[]>([]);
  productCategories = signal<ProductCategory[]>([]);
  
  @ViewChild('dt') dt!: Table;

  // Estados disponibles (Y/N según API)
  statusOptions = [
    { label: 'Sí', value: 'Y' },
    { label: 'No', value: 'N' }
  ];

  // Filtros
  selectedCategory = signal<string | null>(null);
  selectedGroup = signal<string | null>(null);
  selectedStatus = signal<string | null>(null);
  minPrice = signal<number | null>(null);
  maxPrice = signal<number | null>(null);

  // Materiales y acompañamientos
  materials = signal<ProductMaterial[]>([]);
  accompaniments = signal<ProductAccompaniment[]>([]);
  
  // Ingredientes disponibles
  availableIngredients = signal<number>(0);

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private productRepository: ProductRepository,
    private productGroupRepository: ProductGroupRepository,
    private productCategoryRepository: ProductCategoryRepository,
    private productTreeApiService: ProductTreeApiService,
    private router: Router
  ) {}

  ngOnInit() {
    console.log('ProductComponent initialized');
    this.loadProductGroups();
    this.loadAvailableIngredients();
    this.loadProductCategories();
    this.loadProducts();
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

  loadProductCategories() {
    this.productCategoryRepository.getAllProductCategories()
      .subscribe({
        next: (categories) => {
          this.productCategories.set(categories.filter(c => c.enabled === 'Y'));
        },
        error: (error) => {
          console.error('Error loading product categories:', error);
        }
      });
  }

  loadProducts() {
    console.log('Loading products...');
    this.loading.set(true);
    
    this.productRepository.getAllProducts()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (products) => {
          this.products.set(products);
          console.log('Products loaded:', products.length);
        },
        error: (error) => {
          console.error('Error loading products:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar los productos',
            life: 5000
          });
        }
      });
  }

  // === CRUD OPERATIONS ===

  openNew() {
    const defaultProduct = this.productRepository.createDefaultProduct();
    this.product.set({
      ...defaultProduct,
      itemCode: this.generateProductCode(),
      material: [],
      accompaniment: []
    });
    this.materials.set([]);
    this.accompaniments.set([]);
    this.submitted.set(false);
    this.productDialog = true;
  }

  editProduct(product: ProductItem) {
    this.product.set({ ...product });
    this.materials.set([...product.material]);
    this.accompaniments.set([...product.accompaniment]);
    this.productDialog = true;
  }

  deleteProduct(product: ProductItem) {
    this.confirmationService.confirm({
      message: '¿Está seguro de que desea eliminar ' + product.itemName + '?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.loading.set(true);
        
        this.productRepository.deleteProduct(product.itemCode)
          .pipe(finalize(() => this.loading.set(false)))
          .subscribe({
            next: (success) => {
              if (success) {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Exitoso',
                  detail: 'Producto eliminado',
                  life: 3000
                });
                this.loadProducts();
              } else {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'No se pudo eliminar el producto',
                  life: 5000
                });
              }
            },
            error: (error) => {
              console.error('Error deleting product:', error);
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al eliminar el producto',
                life: 5000
              });
            }
          });
      }
    });
  }

  deleteSelectedProducts() {
    const selected = this.selectedProducts();
    if (!selected || selected.length === 0) return;

    this.confirmationService.confirm({
      message: `¿Está seguro de que desea eliminar ${selected.length} producto(s) seleccionado(s)?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.loading.set(true);
        const itemCodes = selected.map(p => p.itemCode);
        
        this.productRepository.deleteMultipleProducts(itemCodes)
          .pipe(finalize(() => this.loading.set(false)))
          .subscribe({
            next: (result) => {
              if (result.success > 0) {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Exitoso',
                  detail: `${result.success} producto(s) eliminado(s)`,
                  life: 3000
                });
              }
              
              if (result.failed > 0) {
                this.messageService.add({
                  severity: 'warn',
                  summary: 'Advertencia',
                  detail: `${result.failed} producto(s) no pudieron eliminarse`,
                  life: 5000
                });
              }

              this.loadProducts();
              this.selectedProducts.set([]);
            },
            error: (error) => {
              console.error('Error deleting products:', error);
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al eliminar los productos seleccionados',
                life: 5000
              });
            }
          });
      }
    });
  }

  hideDialog() {
    this.productDialog = false;
    this.submitted.set(false);
  }

  saveProduct() {
    this.submitted.set(true);
    const currentProduct = this.product();

    if (!currentProduct?.itemCode?.trim() || !currentProduct?.itemName?.trim()) {
      return;
    }

    // Validar datos usando el repository
    const validation = this.productRepository.validateProductData(currentProduct);
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

    // Agregar materiales y acompañamientos
    const productData = {
      ...currentProduct,
      material: this.materials(),
      accompaniment: this.accompaniments()
    };

    //recupeamos la ulr de la imagen
    const imagePath = this.extractImagePath(productData.imageUrl || '');
    productData.imageUrl=imagePath
  
    // Verificar si es actualización o creación
    const isUpdate = this.isExistingProduct(currentProduct.itemCode);

    if (isUpdate) {
      console.log('Updating existing product:', productData);
      // Actualizar producto existente
      this.productRepository.updateProduct(currentProduct.itemCode, productData as ProductUpdateRequest)
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: (success) => {
            if (success) {
              this.messageService.add({
                severity: 'success',
                summary: 'Exitoso',
                detail: 'Producto actualizado',
                life: 3000
              });
              this.productDialog = false;
              this.product.set(null);
              this.loadProducts();
            } else {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo actualizar el producto',
                life: 5000
              });
            }
          },
          error: (error) => {
            console.error('Error updating product:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al actualizar el producto',
              life: 5000
            });
          }
        });
    } else {
      // Crear nuevo producto
      console.log('Creating new product:', productData);
      this.productRepository.createProduct(productData as ProductCreateRequest)
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: (createdProduct) => {
            if (createdProduct) {
              this.messageService.add({
                severity: 'success',
                summary: 'Exitoso',
                detail: 'Producto creado',
                life: 3000
              });
              this.productDialog = false;
              this.product.set(null);
              this.loadProducts();
            } else {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo crear el producto',
                life: 5000
              });
            }
          },
          error: (error) => {
            console.error('Error creating product:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al crear el producto',
              life: 5000
            });
          }
        });
    }
  }


  private extractImagePath(imageUrl: string): string {
    if (!imageUrl || imageUrl.trim() === '') {
      return '';
    }
  
    try {
      // Si es una URL completa, extraer solo la parte de la ruta
      if (imageUrl.includes('http://') || imageUrl.includes('https://')) {
        const url = new URL(imageUrl);
        return url.pathname;
      }
      
      // Si ya es una ruta relativa, verificar que tenga el formato correcto
      if (imageUrl.startsWith('/images/')) {
        return imageUrl;
      }
      
      // Si solo es el nombre del archivo, agregar el prefijo
      if (!imageUrl.startsWith('/')) {
        return `/images/${imageUrl}`;
      }
      
      return imageUrl;
    } catch (error) {
      console.warn('Error parsing image URL:', error);
      // Si hay error, asumir que es solo el nombre del archivo
      const fileName = imageUrl.split('/').pop() || imageUrl;
      return `/images/${fileName}`;
    }
  }

  // === MÉTODOS PARA IMAGE SELECTOR ===

  onImageSelected(imageData: { url: string; title: string; imageCode: string }) {
    const currentProduct = this.product();
    if (currentProduct) {
      this.product.set({
        ...currentProduct,
        imageUrl: imageData.url
      });
    }
  }

  onImageCleared() {
    const currentProduct = this.product();
    if (currentProduct) {
      this.product.set({
        ...currentProduct,
        imageUrl: ''
      });
    }
  }

  // === GESTIÓN DE MATERIALES ===

  addMaterial() {
    const newMaterial: ProductMaterial = {
      itemCode: '',
      itemName: '',
      quantity: 1,
      imageUrl: '',
      isCustomizable: 'N',
      productItemCode: this.product()?.itemCode || ''
    };
    this.materials.set([...this.materials(), newMaterial]);
  }

  removeMaterial(index: number) {
    const materials = [...this.materials()];
    materials.splice(index, 1);
    this.materials.set(materials);
  }

  updateMaterial(index: number, material: ProductMaterial) {
    const materials = [...this.materials()];
    materials[index] = material;
    this.materials.set(materials);
  }

  // === GESTIÓN DE ACOMPAÑAMIENTOS ===

  addAccompaniment() {
    const newAccompaniment: ProductAccompaniment = {
      itemCode: '',
      itemName: '',
      priceOld: 0,
      price: 0,
      imageUrl: '',
      productItemCode: this.product()?.itemCode || ''
    };
    this.accompaniments.set([...this.accompaniments(), newAccompaniment]);
  }

  removeAccompaniment(index: number) {
    const accompaniments = [...this.accompaniments()];
    accompaniments.splice(index, 1);
    this.accompaniments.set(accompaniments);
  }

  updateAccompaniment(index: number, accompaniment: ProductAccompaniment) {
    const accompaniments = [...this.accompaniments()];
    accompaniments[index] = accompaniment;
    this.accompaniments.set(accompaniments);
  }

  // === FILTROS ===

  onCategoryFilter() {
    const categoryCode = this.selectedCategory();
    if (categoryCode) {
      this.loading.set(true);
      this.productRepository.getProductsByCategory(categoryCode)
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: (products) => {
            this.products.set(products);
          },
          error: (error) => {
            console.error('Error filtering by category:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al filtrar por categoría',
              life: 5000
            });
          }
        });
    } else {
      this.loadProducts();
    }
  }

  onGroupFilter() {
    const groupCode = this.selectedGroup();
    if (groupCode) {
      this.loading.set(true);
      this.productRepository.getProductsByGroup(groupCode)
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: (products) => {
            this.products.set(products);
          },
          error: (error) => {
            console.error('Error filtering by group:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al filtrar por grupo',
              life: 5000
            });
          }
        });
    } else {
      this.loadProducts();
    }
  }

  onStatusFilter() {
    const status = this.selectedStatus();
    if (status) {
      const filteredProducts = this.products().filter(p => {
        return this.productRepository.getOverallStatus(p) === status;
      });
      // Aquí podrías llamar a un método del repository si existiera
      // Por ahora filtro local
    } else {
      this.loadProducts();
    }
  }

  onPriceRangeFilter() {
    const min = this.minPrice();
    const max = this.maxPrice();
    
    if (min !== null && max !== null && min <= max) {
      this.loading.set(true);
      this.productRepository.getProductsByPriceRange(min, max)
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: (response) => {
            this.products.set(response.data);
          },
          error: (error) => {
            console.error('Error filtering by price range:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al filtrar por rango de precios',
              life: 5000
            });
          }
        });
    }
  }

  clearFilters() {
    this.selectedCategory.set(null);
    this.selectedGroup.set(null);
    this.selectedStatus.set(null);
    this.minPrice.set(null);
    this.maxPrice.set(null);
    this.loadProducts();
  }

  // === UTILIDADES ===

  isExistingProduct(itemCode: string): boolean {
    return this.products().some(p => p.itemCode === itemCode);
  }

  getSeverity(status: string): 'success' | 'danger' {
    return this.productRepository.getYNSeverity(status);
  }

  getStatusLabel(status: string): string {
    return this.productRepository.getYNLabel(status);
  }

  getSellItemLabel(sellItem: string): string {
    return this.productRepository.getSellItemLabel(sellItem);
  }

  getAvailableLabel(available: string): string {
    return this.productRepository.getAvailableLabel(available);
  }

  getEnabledLabel(enabled: string): string {
    return this.productRepository.getEnabledLabel(enabled);
  }

  getOverallStatusLabel(product: ProductItem): string {
    return this.productRepository.getOverallStatusLabel(product);
  }

  getOverallStatusSeverity(product: ProductItem): 'success' | 'warning' | 'danger' {
    return this.productRepository.getOverallStatusSeverity(product);
  }

  getCategoryLabel(categoryCode: string): string {
    const category = this.productCategories().find(c => c.categoryItemCode === categoryCode);
    return category ? category.categoryItemName : categoryCode || 'Sin categoría';
  }

  getGroupLabel(groupCode: string): string {
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

  getProductCategoryOptions(): { label: string; value: string }[] {
    return [
      { label: 'Sin categoría asignada', value: '' },
      ...this.productCategories().map(category => ({
        label: category.categoryItemName,
        value: category.categoryItemCode
      }))
    ];
  }

  getCategoryFilterOptions(): { label: string; value: string }[] {
    return [
      { label: 'Todas las categorías', value: '' },
      ...this.productCategories().map(category => ({
        label: category.categoryItemName,
        value: category.categoryItemCode
      }))
    ];
  }

  getGroupFilterOptions(): { label: string; value: string }[] {
    return [
      { label: 'Todos los grupos', value: '' },
      ...this.productGroups().map(group => ({
        label: group.productGroupName,
        value: group.productGroupCode
      }))
    ];
  }

  calculateDiscountedPrice(product: ProductItem): number {
    return this.productRepository.calculateDiscountedPrice(product);
  }

  hasDiscount(product: ProductItem): boolean {
    return this.productRepository.hasDiscount(product);
  }

  formatPrice(price: number): string {
    return this.productRepository.formatPrice(price, 'CLP$');
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  exportCSV() {
    const csvContent = this.productRepository.exportProductsToCSV(this.products());
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `products_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  generateProductCode(): string {
    const now = new Date();
    const timestamp = now.getFullYear().toString() +
                     (now.getMonth() + 1).toString().padStart(2, '0') +
                     now.getDate().toString().padStart(2, '0') +
                     now.getHours().toString().padStart(2, '0') +
                     now.getMinutes().toString().padStart(2, '0') +
                     now.getSeconds().toString().padStart(2, '0');
    
    const randomId = Math.random().toString(36).substring(2, 8);
    return `I_${timestamp}_${randomId}`;
  }

  getProductStats() {
    return this.productRepository.getProductStats(this.products());
  }

  // ============================================
  // INGREDIENTES MANAGEMENT
  // ============================================

  loadAvailableIngredients() {
    this.productTreeApiService.getAll().subscribe({
      next: (ingredients) => {
        this.availableIngredients.set(ingredients.length);
      },
      error: () => {
        this.availableIngredients.set(0);
      }
    });
  }

  navigateToIngredients() {
    this.router.navigate(['/products/ingredients']);
  }

  hasAvailableIngredients(): boolean {
    return this.availableIngredients() > 0;
  }
}