import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';

// PrimeNG Imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TabViewModule } from 'primeng/tabview';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TooltipModule } from 'primeng/tooltip';

// Models and Services
import { 
  ProductTree, 
  ProductTreeCreateRequest, 
  ProductTreeUpdateRequest,
  ProductTreeItem,
  SelectOption
} from './model/product-tree.model';
import { ProductTreeApiService } from '../../service/product-tree-api.service';
import { ProductsService } from '../../service/product-api.service';
import { Product } from '../product/model/product.model';

@Component({
  selector: 'app-ingredients',
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
    TagModule,
    ToolbarModule,
    ConfirmDialogModule,
    ToastModule,
    TabViewModule,
    IconFieldModule,
    InputIconModule,
    TooltipModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './ingredients.component.html',
  styleUrl: './ingredients.component.scss'
})
export class IngredientsComponent implements OnInit {

  // Signals
  ingredients = signal<ProductTree[]>([]);
  selectedIngredients = signal<ProductTree[]>([]);
  ingredient = signal<ProductTree | null>(null);
  components = signal<ProductTreeItem[]>([]);
  loading = signal(false);
  submitted = signal(false);

  // Products for selection
  sellableProducts = signal<Product[]>([]);
  nonSellableProducts = signal<Product[]>([]);
  allProducts = signal<Product[]>([]); // Todos los productos
  selectedMainProduct = signal<Product | null>(null);
  availableComponents = signal<Product[]>([]);

  // Dialog states
  ingredientDialog = false;
  productSelectionDialog = false;
  
  // Search terms
  productSearchTerm = signal<string>('');
  ingredientSearchTerm = signal<string>('');

  // Filter variables
  selectedEnabledFilter: string = '';
  selectedDataSourceFilter: string = '';
  minQuantity: number | null = null;

  constructor(
    private productTreeApiService: ProductTreeApiService,
    public productsService: ProductsService, // Público para usar en template
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  // Computed signals for filtered products
  filteredSellableProducts = computed(() => {
    const products = this.sellableProducts();
    const searchTerm = this.productSearchTerm().toLowerCase();
    
    if (!searchTerm) {
      return products;
    }
    
    return products.filter(product => 
      product.itemName.toLowerCase().includes(searchTerm) ||
      product.itemCode.toLowerCase().includes(searchTerm)
    );
  });

  filteredNonSellableProducts = computed(() => {
    const products = this.nonSellableProducts();
    const searchTerm = this.ingredientSearchTerm().toLowerCase();

    if (!searchTerm) {
      return products;
    }

    return products.filter(product =>
      product.itemName.toLowerCase().includes(searchTerm) ||
      product.itemCode.toLowerCase().includes(searchTerm)
    );
  });

  // Computed signal: Productos disponibles para componentes según si es Combo o no
  availableProductsForComponents = computed(() => {
    const mainProduct = this.selectedMainProduct();
    const searchTerm = this.ingredientSearchTerm().toLowerCase();

    // Si el producto principal es un Combo (isCombo = 'Y'), mostrar productos VENDIBLES
    // Si NO es un Combo, mostrar productos NO VENDIBLES (ingredientes normales)
    let products: Product[];

    if (mainProduct?.isCombo === 'Y') {
      products = this.sellableProducts();
    } else {
      products = this.nonSellableProducts();
    }

    // Aplicar filtro de búsqueda
    if (!searchTerm) {
      return products;
    }

    return products.filter(product =>
      product.itemName.toLowerCase().includes(searchTerm) ||
      product.itemCode.toLowerCase().includes(searchTerm)
    );
  });

  ngOnInit() {
    this.loadIngredients();
    this.loadProducts();
  }

  // ============================================
  // DATA LOADING
  // ============================================

  loadIngredients() {
    this.loading.set(true);
    this.productTreeApiService.getAll().subscribe({
      next: (data) => {
        this.ingredients.set(data);
        this.loading.set(false);
      },
      error: (error) => {
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Error', 
          detail: 'Error al cargar ingredientes' 
        });
        this.loading.set(false);
      }
    });
  }

  loadProducts() {
    // Cargar productos vendibles (para ProductTree principal)
    this.productsService.getProductsBySellItem(true).subscribe({
      next: (products) => {
        this.sellableProducts.set(products);
        this.updateAllProducts();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar productos vendibles'
        });
      }
    });

    // Cargar productos no vendibles (para ProductTreeItem - componentes)
    this.productsService.getProductsBySellItem(false).subscribe({
      next: (products) => {
        this.nonSellableProducts.set(products);
        this.updateAllProducts();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar productos componentes'
        });
      }
    });
  }

  // Actualizar lista combinada de todos los productos
  private updateAllProducts() {
    const combined = [...this.sellableProducts(), ...this.nonSellableProducts()];
    this.allProducts.set(combined);
  }

  // ============================================
  // CRUD OPERATIONS
  // ============================================

  openNew() {
    // Validar que hay productos no vendibles disponibles para usar como ingredientes
    // if (this.nonSellableProducts().length === 0) {
    //   this.messageService.add({ 
    //     severity: 'warn', 
    //     summary: 'Sin Productos Disponibles', 
    //     detail: 'Primero debe registrar productos no vendibles para poder crear ingredientes. Vaya a la sección de Productos y asegúrese de tener productos con "Se Vende = No".',
    //     life: 6000
    //   });
    //   return;
    // }

    // Validar que hay productos vendibles para crear el ingrediente base
    if (this.sellableProducts().length === 0) {
      this.messageService.add({ 
        severity: 'warn', 
        summary: 'Sin Productos Base', 
        detail: 'Primero debe registrar productos vendibles para usarlos como base de los ingredientes. Vaya a la sección de Productos y asegúrese de tener productos con "Se Vende = Sí".',
        life: 6000
      });
      return;
    }

    this.selectedMainProduct.set(null);
    this.components.set([]);
    this.submitted.set(false);
    this.productSelectionDialog = true;
  }

  selectMainProduct(product: Product) {
    this.selectedMainProduct.set(product); // Guardamos el producto completo con isCombo

    // Crear ProductTree basado en el producto seleccionado
    const newIngredient: ProductTree = {
      itemCode: product.itemCode,
      itemName: product.itemName,
      quantity: 1,
      enabled: 'Y',
      dataSource: 'N', // Default value
      items1: []
    };

    this.ingredient.set(newIngredient);
    this.productSelectionDialog = false;
    this.ingredientDialog = true;
  }

  editIngredient(ingredient: ProductTree) {
    this.ingredient.set({ ...ingredient });
    this.components.set([...ingredient.items1]);
    this.submitted.set(false);

    // Buscar el producto principal para determinar si es combo
    const mainProduct = this.allProducts().find(p => p.itemCode === ingredient.itemCode);
    if (mainProduct) {
      this.selectedMainProduct.set(mainProduct);
    }

    this.ingredientDialog = true;
  }

  viewIngredient(ingredient: ProductTree) {
    this.ingredient.set({ ...ingredient });
    this.components.set([...ingredient.items1]);
    this.submitted.set(false);

    // Buscar el producto principal para determinar si es combo
    const mainProduct = this.allProducts().find(p => p.itemCode === ingredient.itemCode);
    if (mainProduct) {
      this.selectedMainProduct.set(mainProduct);
    }

    this.ingredientDialog = true;
  }

  deleteIngredient(ingredient: ProductTree) {
    this.confirmationService.confirm({
      message: `¿Está seguro de que desea eliminar el ingrediente ${ingredient.itemName}?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.productTreeApiService.delete(ingredient.itemCode).subscribe({
          next: () => {
            const updatedIngredients = this.ingredients().filter(p => p.itemCode !== ingredient.itemCode);
            this.ingredients.set(updatedIngredients);
            this.messageService.add({ 
              severity: 'success', 
              summary: 'Exitoso', 
              detail: 'Ingrediente eliminado' 
            });
          },
          error: () => {
            this.messageService.add({ 
              severity: 'error', 
              summary: 'Error', 
              detail: 'Error al eliminar ingrediente' 
            });
          }
        });
      }
    });
  }

  deleteSelectedIngredients() {
    this.confirmationService.confirm({
      message: `¿Está seguro de que desea eliminar los ${this.selectedIngredients().length} ingredientes seleccionados?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const deleteRequests = this.selectedIngredients().map(ingredient => 
          this.productTreeApiService.delete(ingredient.itemCode)
        );
        
        // Usar forkJoin para eliminar todos en paralelo
        import('rxjs').then(({ forkJoin }) => {
          forkJoin(deleteRequests).subscribe({
            next: () => {
              const remainingIngredients = this.ingredients().filter(ingredient => 
                !this.selectedIngredients().some(selected => selected.itemCode === ingredient.itemCode)
              );
              this.ingredients.set(remainingIngredients);
              this.selectedIngredients.set([]);
              this.messageService.add({ 
                severity: 'success', 
                summary: 'Exitoso', 
                detail: 'Ingredientes eliminados' 
              });
            },
            error: () => {
              this.messageService.add({ 
                severity: 'error', 
                summary: 'Error', 
                detail: 'Error al eliminar ingredientes' 
              });
            }
          });
        });
      }
    });
  }

  saveIngredient() {
    this.submitted.set(true);
    
    const currentIngredient = this.ingredient();
    if (!currentIngredient) return;

    // Validar campos requeridos
    if (!currentIngredient.itemCode?.trim() || !currentIngredient.itemName?.trim()) {
      this.messageService.add({ 
        severity: 'warn', 
        summary: 'Advertencia', 
        detail: 'Por favor complete los campos obligatorios' 
      });
      return;
    }

    // Actualizar componentes y normalizar las URLs de imágenes
    const normalizedComponents = this.components().map(component => ({
      ...component,
      imageUrl: this.extractImagePath(component.imageUrl || '')
    }));
    currentIngredient.items1 = normalizedComponents;

    this.loading.set(true);

    if (this.isEditMode()) {
      // Actualizar ingrediente existente
      const updateData: ProductTreeUpdateRequest = {
        itemCode: currentIngredient.itemCode,
        itemName: currentIngredient.itemName,
        quantity: currentIngredient.quantity,
        enabled: currentIngredient.enabled,
        dataSource: currentIngredient.dataSource,
        items1: currentIngredient.items1.map(item => ({
          itemCode: item.itemCode,
          itemName: item.itemName,
          quantity: item.quantity,
          isCustomizable: item.isCustomizable || 'N',
          imageUrl: item.imageUrl,
          productTreeItemCode: item.productTreeItemCode,
          comboItemCode: item.comboItemCode || ''
        }))
      };

      this.productTreeApiService.update(currentIngredient.itemCode, updateData).subscribe({
        next: () => {
          const updatedIngredients = this.ingredients().map(p => 
            p.itemCode === currentIngredient.itemCode ? currentIngredient : p
          );
          this.ingredients.set(updatedIngredients);
          this.messageService.add({ 
            severity: 'success', 
            summary: 'Exitoso', 
            detail: 'Ingrediente actualizado' 
          });
          this.hideDialog();
          this.loading.set(false);
        },
        error: () => {
          this.messageService.add({ 
            severity: 'error', 
            summary: 'Error', 
            detail: 'Error al actualizar ingrediente' 
          });
          this.loading.set(false);
        }
      });
    } else {
      // Crear nuevo ingrediente
      const createData: ProductTreeCreateRequest = {
        itemCode: currentIngredient.itemCode,
        itemName: currentIngredient.itemName,
        quantity: currentIngredient.quantity,
        enabled: currentIngredient.enabled,
        dataSource: currentIngredient.dataSource,
        items1: currentIngredient.items1.map(item => ({
          itemCode: item.itemCode,
          itemName: item.itemName,
          quantity: item.quantity,
          imageUrl: item.imageUrl,
          isCustomizable: item.isCustomizable || 'N',
          productTreeItemCode: item.productTreeItemCode,
          comboItemCode: item.comboItemCode || ''
        }))
      };
      console.log(createData);
      

      this.productTreeApiService.create(createData).subscribe({
        next: (newIngredient) => {
          this.ingredients.set([...this.ingredients(), newIngredient]);
          this.messageService.add({ 
            severity: 'success', 
            summary: 'Exitoso', 
            detail: 'Ingrediente creado' 
          });
          this.hideDialog();
          this.loading.set(false);
        },
        error: () => {
          this.messageService.add({ 
            severity: 'error', 
            summary: 'Error', 
            detail: 'Error al crear ingrediente' 
          });
          this.loading.set(false);
        }
      });
    }
  }

  hideDialog() {
    this.ingredientDialog = false;
    this.submitted.set(false);
  }

  // ============================================
  // COMPONENT MANAGEMENT
  // ============================================

  addIngredient() {
    const mainProduct = this.selectedMainProduct();
    const isCombo = mainProduct?.isCombo === 'Y';

    // Validar que hay productos disponibles para agregar (vendibles si es Combo, no vendibles si no lo es)
    const availableProducts = this.availableProductsForComponents().filter(product =>
      !this.isProductAlreadySelected(product.itemCode)
    );

    if (availableProducts.length === 0) {
      if (isCombo) {
        if (this.sellableProducts().length === 0) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Sin Productos Disponibles',
            detail: 'No hay productos vendibles registrados para usar en el combo. Vaya a la sección de Productos y registre productos con "Se Vende = Sí".',
            life: 5000
          });
        } else {
          this.messageService.add({
            severity: 'info',
            summary: 'Todos los Productos Utilizados',
            detail: 'Ya ha agregado todos los productos vendibles disponibles en este combo.',
            life: 4000
          });
        }
      } else {
        if (this.nonSellableProducts().length === 0) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Sin Productos Disponibles',
            detail: 'No hay productos no vendibles registrados para usar como ingredientes. Vaya a la sección de Productos y registre productos con "Se Vende = No".',
            life: 5000
          });
        } else {
          this.messageService.add({
            severity: 'info',
            summary: 'Todos los Ingredientes Utilizados',
            detail: 'Ya ha agregado todos los productos no vendibles disponibles como ingredientes en esta receta.',
            life: 4000
          });
        }
      }
      return;
    }

    // Crear un nuevo slot para ingrediente/componente
    const newIngredient: ProductTreeItem = {
      itemCode: '',
      itemName: '',
      quantity: 1,
      imageUrl: '',
      isCustomizable: 'N', // Valor por defecto
      productTreeItemCode: this.ingredient()?.itemCode || '',
      comboItemCode: '' // Nuevo campo requerido
    };
    // Agregar el nuevo ingrediente al inicio del array para que aparezca arriba
    this.components.set([newIngredient, ...this.components()]);
  }

  selectIngredientProduct(ingredientIndex: number, product: Product) {
    const currentIngredients = [...this.components()];
    currentIngredients[ingredientIndex] = {
      ...currentIngredients[ingredientIndex],
      itemCode: product.itemCode,
      itemName: product.itemName,
      quantity: currentIngredients[ingredientIndex]?.quantity || 1,
      imageUrl: this.extractImagePath(product.imageUrl || ''),
      isCustomizable: currentIngredients[ingredientIndex]?.isCustomizable || 'N', // Mantener valor actual o usar 'N' por defecto
      productTreeItemCode: this.ingredient()?.itemCode || '',
      comboItemCode: currentIngredients[ingredientIndex]?.comboItemCode || '' // Mantener o inicializar
    };
    this.components.set(currentIngredients);
  }

  updateIngredientQuantity(ingredientIndex: number, newQuantity: number | string) {
    const currentIngredients = [...this.components()];
    if (currentIngredients[ingredientIndex]) {
      currentIngredients[ingredientIndex].quantity = typeof newQuantity === 'string' ? parseInt(newQuantity) || 0 : newQuantity;
      this.components.set(currentIngredients);
    }
  }

  updateIngredientCustomizable(ingredientIndex: number, isCustomizable: string) {
    const currentIngredients = [...this.components()];
    if (currentIngredients[ingredientIndex]) {
      currentIngredients[ingredientIndex].isCustomizable = isCustomizable;
      this.components.set(currentIngredients);
    }
  }

  removeIngredient(ingredientIndex: number) {
    const currentIngredients = this.components().filter((_, index) => index !== ingredientIndex);
    this.components.set(currentIngredients);
  }

  // Verificar si un producto ya está seleccionado como ingrediente
  isProductAlreadySelected(productItemCode: string): boolean {
    return this.components().some(ingredient => ingredient.itemCode === productItemCode);
  }

  // Obtener productos disponibles para ingredientes/componentes (según si es Combo o no)
  getAvailableIngredientsForSlot(currentSlotIndex: number): Product[] {
    const currentSlotItemCode = this.components()[currentSlotIndex]?.itemCode;

    // Usar el computed signal que ya determina si mostrar vendibles o no vendibles
    const availableProducts = this.availableProductsForComponents().filter(product =>
      product.itemCode === currentSlotItemCode || // Permitir el producto actual
      !this.isProductAlreadySelected(product.itemCode) // Excluir productos ya seleccionados
    );
    return availableProducts;
  }

  removeComponent(index: number) {
    const updatedComponents = this.components().filter((_, i) => i !== index);
    this.components.set(updatedComponents);
  }

  getTotalComponentsQuantity(): number {
    return this.components().reduce((total, component) => total + (component.quantity || 0), 0);
  }

  // ============================================
  // FILTERING
  // ============================================

  onGlobalFilter(table: any, event: any) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  onEnabledFilter() {
    // Implementar filtro por estado
    this.applyFilters();
  }

  onDataSourceFilter() {
    // Implementar filtro por fuente de datos
    this.applyFilters();
  }

  onQuantityRangeFilter() {
    // Implementar filtro por rango de cantidad
    this.applyFilters();
  }

  private applyFilters() {
    let filteredIngredients = [...this.ingredients()];

    if (this.selectedEnabledFilter) {
      filteredIngredients = filteredIngredients.filter(ingredient => 
        ingredient.enabled === this.selectedEnabledFilter
      );
    }

    if (this.selectedDataSourceFilter) {
      filteredIngredients = filteredIngredients.filter(ingredient => 
        ingredient.dataSource === this.selectedDataSourceFilter
      );
    }

    if (this.minQuantity !== null && this.minQuantity > 0) {
      filteredIngredients = filteredIngredients.filter(ingredient => 
        ingredient.quantity >= this.minQuantity!
      );
    }

    // Aquí podrías actualizar una señal de ingredientes filtrados
    // o usar el filtro nativo de PrimeNG table
  }

  clearFilters() {
    this.selectedEnabledFilter = '';
    this.selectedDataSourceFilter = '';
    this.minQuantity = null;
    this.loadIngredients(); // Recargar todos los ingredientes
  }

  // ============================================
  // EXPORT
  // ============================================

  exportCSV() {
    const csvContent = this.productTreeApiService.exportToCSV(this.ingredients());
    this.productTreeApiService.downloadCSV(csvContent);
    this.messageService.add({ 
      severity: 'success', 
      summary: 'Exitoso', 
      detail: 'Datos exportados a CSV' 
    });
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  private isEditMode(): boolean {
    const currentIngredient = this.ingredient();
    return !!(currentIngredient && this.ingredients().some(p => p.itemCode === currentIngredient.itemCode));
  }

  // Métodos para obtener opciones de selects
  getEnabledOptions(): SelectOption[] {
    return this.productTreeApiService.getEnabledOptions();
  }

  getDataSourceOptions(): SelectOption[] {
    return this.productTreeApiService.getDataSourceOptions();
  }

  getEnabledFilterOptions(): SelectOption[] {
    return [
      { label: 'Todos', value: '' },
      ...this.getEnabledOptions()
    ];
  }

  getDataSourceFilterOptions(): SelectOption[] {
    return [
      { label: 'Todas', value: '' },
      ...this.getDataSourceOptions()
    ];
  }

  // Métodos para formateo y display
  formatQuantity(quantity: number): string {
    return this.productTreeApiService.formatQuantity(quantity);
  }

  getEnabledLabel(enabled: string): string {
    return this.productTreeApiService.getEnabledLabel(enabled);
  }

  getEnabledSeverity(enabled: string): 'success' | 'danger' {
    return this.productTreeApiService.getEnabledSeverity(enabled);
  }

  getDataSourceLabel(dataSource: string): string {
    switch (dataSource) {
      case 'Internal': return 'Interno';
      case 'External': return 'Externo';
      case 'Mixed': return 'Mixto';
      default: return dataSource;
    }
  }

  getDataSourceSeverity(dataSource: string): 'success' | 'info' | 'warning' {
    switch (dataSource) {
      case 'Internal': return 'success';
      case 'External': return 'info';
      case 'Mixed': return 'warning';
      default: return 'info';
    }
  }

  // Métodos para el campo isCustomizable
  getCustomizableOptions(): SelectOption[] {
    return [
      { label: 'No personalizable', value: 'N' },
      { label: 'Personalizable', value: 'Y' }
    ];
  }

  getCustomizableLabel(isCustomizable: string): string {
    return isCustomizable === 'Y' ? 'Personalizable' : 'No personalizable';
  }

  getCustomizableSeverity(isCustomizable: string): 'success' | 'secondary' {
    return isCustomizable === 'Y' ? 'success' : 'secondary';
  }

  // ============================================
  // PRODUCT SELECTION METHODS
  // ============================================

  getSellableProductOptions(): SelectOption[] {
    return this.sellableProducts().map(product => ({
      label: `${product.itemCode} - ${product.itemName}`,
      value: product.itemCode
    }));
  }

  getNonSellableProductOptions(): SelectOption[] {
    return this.nonSellableProducts().map(product => ({
      label: `${product.itemCode} - ${product.itemName}`,
      value: product.itemCode
    }));
  }

  getProductByItemCode(itemCode: string): Product | undefined {
    return [...this.sellableProducts(), ...this.nonSellableProducts()]
      .find(product => product.itemCode === itemCode);
  }

  onMainProductSelect(itemCode: string) {
    const product = this.sellableProducts().find(p => p.itemCode === itemCode);
    if (product) {
      this.selectMainProduct(product);
    }
  }

  onIngredientProductSelect(ingredientIndex: number, itemCodeOrOption: string | any) {
    // Manejar tanto string como objeto SelectOption
    let itemCode: string;

    if (typeof itemCodeOrOption === 'string') {
      itemCode = itemCodeOrOption;
    } else if (itemCodeOrOption && typeof itemCodeOrOption === 'object' && 'value' in itemCodeOrOption) {
      // Es un objeto SelectOption del autocomplete
      itemCode = itemCodeOrOption.value;
    } else {
      // No es un formato válido
      return;
    }

    // Buscar en la lista de productos disponibles según si es Combo o no
    const product = this.availableProductsForComponents().find(p => p.itemCode === itemCode);
    if (product) {
      this.selectIngredientProduct(ingredientIndex, product);
    }
  }

  // Obtener opciones de ingredientes para un slot específico
  getIngredientOptionsForSlot(slotIndex: number): SelectOption[] {
    const availableProducts = this.getAvailableIngredientsForSlot(slotIndex);
    return availableProducts.map(product => ({
      label: `${product.itemCode} - ${product.itemName}`,
      value: product.itemCode
    }));
  }

  // Obtener información del producto por código
  getProductInfo(itemCode: string): Product | undefined {
    return this.allProducts().find(p => p.itemCode === itemCode);
  }

  // Calcular estadísticas de la receta
  getRecipeStats() {
    const totalIngredients = this.components().length;
    const totalQuantity = this.components().reduce((sum, ingredient) => sum + (ingredient.quantity || 0), 0);
    const selectedIngredients = this.components().filter(ingredient => ingredient.itemCode).length;
    
    return {
      totalSlots: totalIngredients,
      selectedIngredients,
      totalQuantity,
      isComplete: selectedIngredients === totalIngredients && totalIngredients > 0
    };
  }

  // Convertir dataSource a mayúsculas automáticamente
  onDataSourceChange(value: string) {
    const currentIngredient = this.ingredient();
    if (currentIngredient) {
      currentIngredient.dataSource = value.toUpperCase();
      this.ingredient.set({...currentIngredient});
    }
  }

  // ============================================
  // IMAGE URL NORMALIZATION
  // ============================================

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
}