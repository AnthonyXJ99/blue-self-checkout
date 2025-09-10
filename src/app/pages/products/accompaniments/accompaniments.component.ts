import { Component, OnInit, signal, computed, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { firstValueFrom } from 'rxjs';

// PrimeNG Imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { AutoCompleteModule, AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TabViewModule } from 'primeng/tabview';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TooltipModule } from 'primeng/tooltip';
import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';

// Models and Services
import { 
  CategoryWithAccompaniments,
  CategoryAccompaniment,
  CategoryAccompanimentForCreation,
  CategoryAccompanimentForUpdate,
  ProductAvailable,
  SelectOption,
  TagSeverity
} from './model/accompaniment.model';
import { AccompanimentApiService } from '../../service/accompaniment-api.service';
import { ProductCategoriesService } from '../../service/product-category.service';
import { ProductsService } from '../../service/product-api.service';
import { ProductCategory } from '../category/model/product-category.model';
import { Product } from '../product/model/product.model';

@Component({
  selector: 'app-accompaniments',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    AutoCompleteModule,
    TagModule,
    ToolbarModule,
    ConfirmDialogModule,
    ToastModule,
    TabViewModule,
    IconFieldModule,
    InputIconModule,
    TooltipModule,
    CardModule,
    ChipModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './accompaniments.component.html',
  styleUrl: './accompaniments.component.scss'
})
export class AccompanimentsComponent implements OnInit {

  // Signals
  categories = signal<CategoryWithAccompaniments[]>([]);
  availableCategories = signal<ProductCategory[]>([]);
  selectedCategory = signal<ProductCategory | null>(null);
  selectedAccompaniments = signal<CategoryAccompaniment[]>([]);
  availableProducts = signal<Product[]>([]);
  accompaniments = signal<CategoryAccompaniment[]>([]);
  accompanimentSlots = signal<Partial<CategoryAccompanimentForCreation>[]>([]);
  loading = signal(false);
  submitted = signal(false);
  expandedRowKeys = signal<{[key: string]: boolean}>({});

  // Método para toggle de expansión manual
  toggleRow(categoryItemCode: string) {
    const currentExpanded = this.expandedRowKeys();
    const newExpanded = { ...currentExpanded };
    
    if (newExpanded[categoryItemCode]) {
      delete newExpanded[categoryItemCode];
    } else {
      newExpanded[categoryItemCode] = true;
    }
    
    this.expandedRowKeys.set(newExpanded);
    console.log('🔄 Toggle row:', categoryItemCode, 'Expanded:', newExpanded[categoryItemCode] || false);
  }

  // Verificar si una fila está expandida
  isRowExpanded(categoryItemCode: string): boolean {
    return !!this.expandedRowKeys()[categoryItemCode];
  }

  // DEBUG: Propiedad normal para comparar
  debugSelectedCategory: ProductCategory | null = null;

  // Dialog states
  categorySelectionDialog = false;
  categoryDialog = false;
  accompanimentDialog = false;
  
  // Search and filters
  globalFilterValue = '';
  categorySearchTerm = signal<string>('');
  productSearchTerm = signal<string>('');
  selectedCategoryFilter = '';
  selectedPriceRangeFilter = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  
  // Autocomplete
  filteredAccompanimentOptions: SelectOption[] = [];

  constructor(
    private accompanimentApiService: AccompanimentApiService,
    private productCategoriesService: ProductCategoriesService,
    public productsService: ProductsService, // Público para usar en template
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef
  ) {}

  // Computed signals for filtered products  
  filteredAvailableCategories = computed(() => {
    const categories = this.availableCategories();
    const searchTerm = this.categorySearchTerm().toLowerCase();
    
    if (!searchTerm) {
      return categories;
    }
    
    return categories.filter(category => 
      category.categoryItemName.toLowerCase().includes(searchTerm) ||
      category.categoryItemCode.toLowerCase().includes(searchTerm)
    );
  });

  filteredAvailableProducts = computed(() => {
    const products = this.availableProducts();
    const searchTerm = this.productSearchTerm().toLowerCase();
    
    if (!searchTerm) {
      return products;
    }
    
    return products.filter(product => 
      product.itemName.toLowerCase().includes(searchTerm) ||
      product.itemCode.toLowerCase().includes(searchTerm)
    );
  });

  totalAccompaniments = computed(() => {
    const cats = this.categories();
    return cats ? cats.reduce((total, cat) => total + (cat.availableAccompaniments?.length || 0), 0) : 0;
  });

  categoriesWithAccompaniments = computed(() => {
    const cats = this.categories();
    return cats ? cats.filter(cat => cat.availableAccompaniments?.length > 0) : [];
  });

  ngOnInit() {
    this.loadCategoriesWithAccompaniments();
    this.loadAvailableCategories();
    this.loadAvailableProducts();
  }

  // ============================================
  // DATA LOADING
  // ============================================

  loadCategoriesWithAccompaniments() {
    this.loading.set(true);
    this.accompanimentApiService.getAllCategoriesWithAccompaniments().subscribe({
      next: (data) => {
        this.categories.set(data);
        this.loading.set(false);
      },
      error: (error) => {
        // Es normal que no haya categorías con acompañamientos al inicio
        this.categories.set([]);
        this.loading.set(false);
      }
    });
  }

  loadAvailableCategories() {
    this.productCategoriesService.getAllProductCategories().subscribe({
      next: (categories) => {
        // Filtrar solo categorías habilitadas
        const enabledCategories = categories.filter(cat => cat.enabled === 'Y');
        this.availableCategories.set(enabledCategories);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar categorías disponibles'
        });
      }
    });
  }

  loadAvailableProducts() {
    // Cargar productos vendibles (para usar como acompañamientos)
    this.productsService.getProductsBySellItem(true).subscribe({
      next: (products) => {
        // Filtrar productos habilitados y disponibles
        const availableProducts = products.filter(product => 
          product.enabled === 'Y' && product.available === 'Y'
        );
        this.availableProducts.set(availableProducts);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar productos disponibles'
        });
      }
    });
  }

  // ============================================  
  // CRUD OPERATIONS (siguiendo patrón de ingredients)
  // ============================================

  openNew() {
    // Validar que hay categorías disponibles
    if (this.availableCategories().length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Sin Categorías Disponibles',
        detail: 'Primero debe registrar categorías para poder crear acompañamientos. Vaya a la sección de Categorías.',
        life: 6000
      });
      return;
    }

    // Validar que hay productos vendibles para usar como acompañamientos
    if (this.availableProducts().length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Sin Productos Disponibles',
        detail: 'Primero debe registrar productos vendibles para usarlos como acompañamientos. Vaya a la sección de Productos y asegúrese de tener productos con "Se Vende = Sí".',
        life: 6000
      });
      return;
    }

    this.selectedCategory.set(null);
    this.accompaniments.set([]);
    this.submitted.set(false);
    this.categorySelectionDialog = true;
  }

  selectCategory(category: ProductCategory) {
    console.log('🎯 SELECCIONANDO CATEGORÍA:');
    console.log('📥 Categoría recibida:', category);
    
    // Establecer la categoría seleccionada
    this.selectedCategory.set(category);
    this.debugSelectedCategory = category;
    
    console.log('✅ Categoría establecida en signal:', this.selectedCategory());
    console.log('✅ Categoría establecida en debugVar:', this.debugSelectedCategory);
    
    this.categorySelectionDialog = false;
    
    // Inicializar slots vacíos
    this.accompanimentSlots.set([]);
    
    // Abrir diálogo inmediatamente
    this.accompanimentDialog = true;
    this.loading.set(false);
    
    // Forzar detección de cambios
    this.cdr.detectChanges();
    
    console.log('🔄 Después de detectChanges - selectedCategory:', this.selectedCategory());
  }

  selectExistingCategory(categoryWithAccompaniments: CategoryWithAccompaniments) {
    console.log('🎯 SELECCIONANDO CATEGORÍA EXISTENTE:', categoryWithAccompaniments);
    
    // Buscar la categoría completa en availableCategories
    const fullCategory = this.availableCategories().find(cat => 
      cat.categoryItemCode === categoryWithAccompaniments.categoryItemCode
    );
    
    if (fullCategory) {
      // Establecer la categoría seleccionada
      this.selectedCategory.set(fullCategory);
      this.debugSelectedCategory = fullCategory;
      console.log('✅ Categoría establecida:', fullCategory);
      
      // Cargar los acompañamientos existentes de la categoría
      this.accompaniments.set(categoryWithAccompaniments.availableAccompaniments || []);
      console.log('✅ Acompañamientos cargados:', categoryWithAccompaniments.availableAccompaniments);
      
      // Inicializar slots vacíos para agregar nuevos
      this.accompanimentSlots.set([]);
      
      // Abrir diálogo
      this.accompanimentDialog = true;
      this.loading.set(false);
      
      this.cdr.detectChanges();
    } else {
      // Si no la encontramos, crear una versión mínima y cargar igual
      const categoryForSelection: ProductCategory = {
        categoryItemCode: categoryWithAccompaniments.categoryItemCode,
        categoryItemName: categoryWithAccompaniments.categoryItemName,
        imageUrl: categoryWithAccompaniments.imageUrl,
        description: categoryWithAccompaniments.description,
        frgnName: '',
        frgnDescription: '',
        visOrder: 0,
        enabled: 'Y',
        dataSource: 'Internal',
        groupItemCode: ''
      };
      
      this.selectedCategory.set(categoryForSelection);
      this.debugSelectedCategory = categoryForSelection;
      
      // Cargar los acompañamientos existentes
      this.accompaniments.set(categoryWithAccompaniments.availableAccompaniments || []);
      this.accompanimentSlots.set([]);
      
      this.accompanimentDialog = true;
      this.loading.set(false);
      this.cdr.detectChanges();
    }
  }

  loadCategoryAccompaniments(categoryItemCode: string) {
    console.log('🔍 DEBUG loadCategoryAccompaniments para:', categoryItemCode);
    console.log('🔍 DEBUG selectedCategory DURANTE carga:', this.selectedCategory());
    
    this.accompanimentApiService.getCategoryAccompaniments(categoryItemCode).subscribe({
      next: (categoryData) => {
        console.log('✅ DEBUG datos cargados:', categoryData);
        this.accompaniments.set(categoryData.availableAccompaniments || []);
        this.loading.set(false);
        console.log('🔍 DEBUG selectedCategory DESPUÉS de cargar datos:', this.selectedCategory());
      },
      error: (error) => {
        console.log('❌ DEBUG error cargando:', error);
        // Si no existe, inicializar vacío
        this.accompaniments.set([]);
        this.loading.set(false);
        console.log('🔍 DEBUG selectedCategory DESPUÉS de error:', this.selectedCategory());
      }
    });
  }

  // ============================================
  // ACCOMPANIMENT MANAGEMENT (siguiendo patrón de ingredients)
  // ============================================

  addAccompaniment() {
    // Verificar si hay productos disponibles
    const availableCount = this.getAvailableProductsForAccompaniments().length;
    if (availableCount === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Sin Productos Disponibles',
        detail: 'No hay más productos vendibles disponibles o todos ya están siendo utilizados como acompañamientos.',
        life: 5000
      });
      return;
    }

    // Crear un nuevo slot vacío
    const newSlot: Partial<CategoryAccompanimentForCreation> = {
      accompanimentItemCode: '',
      discount: 0,
      enlargementItemCode: '',
      enlargementDiscount: 0
    };

    // Agregar el slot al array
    this.accompanimentSlots.set([...this.accompanimentSlots(), newSlot]);
  }

  // Remover slot de acompañamiento
  removeAccompanimentSlot(index: number) {
    const slots = this.accompanimentSlots();
    const updatedSlots = slots.filter((_, i) => i !== index);
    this.accompanimentSlots.set(updatedSlots);
  }

  // Obtener productos disponibles para acompañamientos (excluyendo los ya seleccionados)
  getAvailableProductsForAccompaniments(excludeIndex?: number): Product[] {
    const currentSlots = this.accompanimentSlots();
    const currentSlotItemCode = currentSlots[excludeIndex || 0]?.accompanimentItemCode;
    const usedProductCodes = currentSlots
      .map((slot, index) => index !== excludeIndex ? slot.accompanimentItemCode : null)
      .filter(code => code && code.trim() !== '') as string[];

    return this.availableProducts().filter(product => 
      product.itemCode === currentSlotItemCode || // Permitir el producto actual
      !usedProductCodes.includes(product.itemCode) // Excluir productos ya seleccionados
    );
  }

  // Filtrar productos para autocomplete
  filterAccompanimentProducts(event: any, slotIndex: number) {
    const query = event.query.toLowerCase();
    const options = this.getAccompanimentOptionsForSlot(slotIndex);
    
    this.filteredAccompanimentOptions = options.filter(option =>
      option.label.toLowerCase().includes(query)
    );
  }


  // Validar si hay slots válidos para guardar
  hasValidSlots(): boolean {
    const slots = this.accompanimentSlots();
    return slots.some(slot => 
      slot.accompanimentItemCode && slot.accompanimentItemCode.trim() !== ''
    );
  }

  // Guardar todos los acompañamientos
  saveAllAccompaniments() {
    
    
    // Usar debugSelectedCategory en lugar del signal
    const category = this.debugSelectedCategory || this.selectedCategory();
 
    if (!category) {
    
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No hay categoría seleccionada'
      });
      return;
    }

    // Filtrar solo los slots que tienen producto seleccionado
    const allSlots = this.accompanimentSlots();
    console.log('📋 Todos los slots antes del filtro:', allSlots);
    
    const validSlots = allSlots.filter(slot => 
      slot.accompanimentItemCode && slot.accompanimentItemCode.trim() !== ''
    );
    
    console.log('✅ Slots válidos después del filtro:', validSlots);
    console.log('📊 Cantidad de slots válidos:', validSlots.length);

    if (validSlots.length === 0) {
      console.warn('⚠️ WARNING: No hay slots válidos para guardar');
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'No hay acompañamientos válidos para guardar'
      });
      return;
    }

    this.loading.set(true);
    console.log('⏳ Loading activado');

    // Preparar datos para envío por lotes
    const createDataArray: CategoryAccompanimentForCreation[] = validSlots.map((slot, index) => {
      const createData: CategoryAccompanimentForCreation = {
        accompanimentItemCode: slot.accompanimentItemCode!,
        discount: slot.discount || 0,
        enlargementItemCode: slot.enlargementItemCode || '',
        enlargementDiscount: slot.enlargementDiscount || 0
      };
      
      console.log(`📤 SLOT ${index + 1} - Datos a enviar:`, createData);
      return createData;
    });

    console.log('📦 ENVIANDO POR LOTES - Array completo:', createDataArray);
    console.log('🏷️ CategoryItemCode:', category.categoryItemCode);
    console.log('🔗 URL será: /api/accompaniments/' + category.categoryItemCode);
    console.log('📝 Total de acompañamientos:', createDataArray.length);
    
    // Enviar todos los acompañamientos en una sola petición
    firstValueFrom(
      this.accompanimentApiService.createAccompaniments(category.categoryItemCode, createDataArray)
    )
      .then((responses) => {
        console.log('✅ TODAS LAS CREACIONES EXITOSAS!');
        console.log('📥 Respuestas recibidas:', responses);
        
        this.messageService.add({
          severity: 'success',
          summary: 'Exitoso',
          detail: `${validSlots.length} acompañamiento(s) guardado(s) correctamente`
        });
        
        // Limpiar slots y recargar datos
        console.log('🧹 Limpiando slots...');
        this.accompanimentSlots.set([]);
        console.log('♻️ Recargando datos de la categoría...');
        this.loadCategoryAccompaniments(category.categoryItemCode);
        this.loadCategoriesWithAccompaniments();
        
        // Cerrar el modal
        console.log('🚪 Cerrando modal...');
        this.accompanimentDialog = false;
        
        this.loading.set(false);
        console.log('✅ Proceso completado exitosamente');
      })
      .catch(error => {
        console.error('❌ ERROR AL GUARDAR ACOMPAÑAMIENTOS:');
        console.error('💥 Error completo:', error);
        console.error('📋 Error status:', error?.status);
        console.error('💬 Error message:', error?.message);
        console.error('📄 Error response body:', error?.error);
        
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `Error al guardar acompañamientos: ${error?.message || error}`
        });
        this.loading.set(false);
      });
  }

  selectAccompanimentProduct(product: Product) {
    const category = this.selectedCategory();
    if (!category) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No hay categoría seleccionada'
      });
      return;
    }

    // Crear acompañamiento con valores por defecto
    const createData: CategoryAccompanimentForCreation = {
      accompanimentItemCode: product.itemCode,
      discount: 0, // Sin descuento por defecto
      enlargementItemCode: '',
      enlargementDiscount: 0
    };

    this.loading.set(true);

    this.accompanimentApiService.createSingleAccompaniment(category.categoryItemCode, createData).subscribe({
      next: (newAccompaniment) => {
        // Agregar el nuevo acompañamiento a la lista actual
        this.accompaniments.set([...this.accompaniments(), newAccompaniment]);
        
        this.messageService.add({
          severity: 'success',
          summary: 'Exitoso',
          detail: `Acompañamiento "${product.itemName}" agregado`
        });
        
        // Recargar las categorías con acompañamientos para actualizar la vista principal
        this.loadCategoriesWithAccompaniments();
        this.loading.set(false);
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al crear acompañamiento'
        });
        this.loading.set(false);
      }
    });
  }

  removeAccompaniment(accompaniment: CategoryAccompaniment) {
    const category = this.debugSelectedCategory || this.selectedCategory();
    if (!category) return;
    
    console.log('🗑️ ELIMINANDO ACOMPAÑAMIENTO:', accompaniment);
    console.log('📁 Categoría:', category.categoryItemCode);

    this.confirmationService.confirm({
      message: `¿Está seguro de que desea eliminar el acompañamiento "${accompaniment.accompanimentItemName}"?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.accompanimentApiService.deleteAccompaniment(
          category.categoryItemCode,
          accompaniment.lineNumber
        ).subscribe({
          next: () => {
            // Remover de la lista actual
            const updatedAccompaniments = this.accompaniments().filter(acc => 
              acc.lineNumber !== accompaniment.lineNumber
            );
            this.accompaniments.set(updatedAccompaniments);
            
            this.messageService.add({
              severity: 'success',
              summary: 'Exitoso',
              detail: 'Acompañamiento eliminado'
            });
            
            // Recargar las categorías con acompañamientos
            this.loadCategoriesWithAccompaniments();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al eliminar acompañamiento'
            });
          }
        });
      }
    });
  }

  // Verificar si un producto ya está seleccionado como acompañamiento
  isProductAlreadySelected(productItemCode: string): boolean {
    return this.accompaniments().some(acc => acc.accompanimentItemCode === productItemCode);
  }

  // Obtener productos vendibles disponibles (excluyendo los ya seleccionados)
  getAvailableProductsForSelection(): Product[] {
    return this.filteredAvailableProducts().filter(product => 
      !this.isProductAlreadySelected(product.itemCode)
    );
  }



  deleteAccompaniment(category: CategoryWithAccompaniments, accompaniment: CategoryAccompaniment) {
    this.confirmationService.confirm({
      message: `¿Está seguro de que desea eliminar el acompañamiento ${accompaniment.accompanimentItemName}?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.accompanimentApiService.deleteAccompaniment(
          category.categoryItemCode,
          accompaniment.lineNumber
        ).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Exitoso',
              detail: 'Acompañamiento eliminado'
            });
            this.loadCategoriesWithAccompaniments();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al eliminar acompañamiento'
            });
          }
        });
      }
    });
  }

  deleteAllCategoryAccompaniments(category: CategoryWithAccompaniments) {
    this.confirmationService.confirm({
      message: `¿Está seguro de que desea eliminar todos los acompañamientos de la categoría ${category.categoryItemName}?`,
      header: 'Confirmar Eliminación Masiva',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.accompanimentApiService.deleteAllCategoryAccompaniments(category.categoryItemCode).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Exitoso',
              detail: 'Todos los acompañamientos eliminados'
            });
            this.loadCategoriesWithAccompaniments();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al eliminar acompañamientos'
            });
          }
        });
      }
    });
  }

  // ============================================
  // DIALOG MANAGEMENT
  // ============================================

  hideCategorySelectionDialog() {
    this.categorySelectionDialog = false;
    this.selectedCategory.set(null);
  }

  hideAccompanimentDialog() {
    this.accompanimentDialog = false;
    this.submitted.set(false);
    this.accompanimentSlots.set([]);
    this.accompaniments.set([]);
    this.loading.set(false);
    
    // Recargar categorías con acompañamientos después de cambios
    this.loadCategoriesWithAccompaniments();
  }

  hideCategoryDialog() {
    this.categoryDialog = false;
    this.selectedCategory.set(null);
  }

  // ============================================
  // FILTERING
  // ============================================

  onGlobalFilter(table: any, event: any) {
    this.globalFilterValue = (event.target as HTMLInputElement).value;
    table.filterGlobal(this.globalFilterValue, 'contains');
  }

  clearFilters() {
    this.globalFilterValue = '';
    this.selectedCategoryFilter = '';
    this.selectedPriceRangeFilter = '';
    this.minPrice = null;
    this.maxPrice = null;
    this.categorySearchTerm.set('');
    this.productSearchTerm.set('');
    this.loadCategoriesWithAccompaniments(); // Recargar categorías con acompañamientos
  }

  // ============================================
  // EXPORT
  // ============================================

  exportCSV() {
    const csvContent = this.accompanimentApiService.exportToCSV(this.categories());
    this.accompanimentApiService.downloadCSV(csvContent);
    this.messageService.add({
      severity: 'success',
      summary: 'Exitoso',
      detail: 'Datos exportados a CSV'
    });
  }

  // ============================================
  // AUTOCOMPLETE
  // ============================================


  // ============================================
  // UTILITY METHODS
  // ============================================


  getProductOptions(): SelectOption[] {
    return this.availableProducts().map(product => ({
      label: `${product.itemCode} - ${product.itemName}`,
      value: product.itemCode
    }));
  }

  getCategoryFilterOptions(): SelectOption[] {
    return [
      { label: 'Todas las categorías', value: '' },
      ...this.categories().map(cat => ({
        label: cat.categoryItemName,
        value: cat.categoryItemCode
      }))
    ];
  }

  // Formatting methods
  formatPrice(price: number): string {
    return this.accompanimentApiService.formatPrice(price);
  }

  calculateDiscountedPrice(accompaniment: CategoryAccompaniment): number {
    return this.accompanimentApiService.calculateDiscountedPrice(accompaniment);
  }

  hasDiscount(accompaniment: CategoryAccompaniment): boolean {
    return this.accompanimentApiService.hasDiscount(accompaniment);
  }

  hasEnlargement(accompaniment: CategoryAccompaniment): boolean {
    return this.accompanimentApiService.hasEnlargement(accompaniment);
  }

  getDiscountLabel(discount?: number): string {
    return this.accompanimentApiService.getDiscountLabel(discount);
  }

  getDiscountSeverity(discount?: number): TagSeverity {
    return this.accompanimentApiService.getDiscountSeverity(discount);
  }

  getProductByCode(itemCode: string): Product | undefined {
    return this.availableProducts().find(p => p.itemCode === itemCode);
  }

  getCategoryByCode(categoryItemCode: string): ProductCategory | undefined {
    return this.availableCategories().find(c => c.categoryItemCode === categoryItemCode);
  }

  // Métodos para obtener opciones de selects
  getCategoryOptions(): SelectOption[] {
    return this.availableCategories().map(category => ({
      label: `${category.categoryItemCode} - ${category.categoryItemName}`,
      value: category.categoryItemCode
    }));
  }

  // Obtener opciones de productos para un slot específico
  getAccompanimentOptionsForSlot(slotIndex: number): SelectOption[] {
    const availableProducts = this.getAvailableProductsForAccompaniments(slotIndex);
    return availableProducts.map(product => ({
      label: `${product.itemCode} - ${product.itemName}`,
      value: product.itemCode
    }));
  }

  getProductOptionsForAccompaniments(): SelectOption[] {
    return this.getAvailableProductsForSelection().map(product => ({
      label: `${product.itemCode} - ${product.itemName}`,
      value: product.itemCode
    }));
  }

  // Obtener opciones de productos para ampliación (todos los productos disponibles)
  getEnlargementProductOptions(): SelectOption[] {
    const products = this.availableProducts();
    
    return products.map(product => ({
      label: `${product.itemCode} - ${product.itemName}`,
      value: product.itemCode
    }));
  }

  // Método para encontrar categoría por código de acompañamientos cargados
  findCategoryWithAccompaniments(categoryItemCode: string): CategoryWithAccompaniments | undefined {
    return this.categories().find(cat => cat.categoryItemCode === categoryItemCode);
  }
}