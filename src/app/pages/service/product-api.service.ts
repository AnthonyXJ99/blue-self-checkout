import { Injectable } from "@angular/core";
import { ApiService } from "../../core/services/api.service";
import { Product, ProductCreateRequest, ProductFilterParams, ProductPagedResponse, ProductUpdateRequest } from "../products/product/model/product.model";
import { map, Observable } from "rxjs";
import { ApiResponse } from "../../core/model/api-response.model";

/**
 * Servicio para gestión de productos según tu API real
 */
@Injectable({
    providedIn: 'root'
  })
  export class ProductsService {
  
    private readonly endpoint = 'api/Products'; // Ajustar según tu endpoint real
  
    constructor(private apiService: ApiService) {}
  
    /**
     * Obtiene todos los productos sin paginación
     * GET /api/Products/all
     */
    getAllProducts(): Observable<Product[]> {
      return this.apiService.get<Product[]>(`${this.endpoint}/all`);
    }
  
    /**
     * Obtiene productos con paginación y filtros
     * GET /api/Products
     */
    getProducts(params?: ProductFilterParams): Observable<ApiResponse<Product>> {
      return this.apiService.getPaginated<Product>(`${this.endpoint}`, params);
    }
  
    /**
     * Obtiene un producto específico por código
     * GET /api/Products/{itemCode}
     */
    getProductByCode(itemCode: string): Observable<Product> {
      return this.apiService.get<Product>(`${this.endpoint}/${itemCode}`);
    }
  
    /**
     * Obtiene productos por grupo
     * GET /api/Products/Groups/{groupCode}
     */
    getProductsByGroup(groupCode: string): Observable<Product[]> {
      return this.apiService.get<Product[]>(`${this.endpoint}/Groups/${groupCode}`);
    }
  
    /**
     * Obtiene productos por categoría
     * GET /api/Products/Categories/{categoryCode}
     */
    getProductsByCategory(categoryCode: string): Observable<Product[]> {
      return this.apiService.get<Product[]>(`${this.endpoint}/Categories/${categoryCode}`);
    }
  
    /**
     * Crea un nuevo producto
     * POST /api/Products
     */
    createProduct(productData: ProductCreateRequest): Observable<Product> {
      return this.apiService.post<Product>(`${this.endpoint}`, productData);
    }
  
    /**
     * Actualiza un producto existente
     * PUT /api/Products/{itemCode}
     */
    updateProduct(itemCode: string, productData: ProductUpdateRequest): Observable<void> {
      return this.apiService.put<void>(`${this.endpoint}/${itemCode}`, productData);
    }
  
    /**
     * Elimina un producto existente
     * DELETE /api/Products/{itemCode}
     */
    deleteProduct(itemCode: string): Observable<void> {
      return this.apiService.delete<void>(`${this.endpoint}/${itemCode}`);
    }
  
    // ===== MÉTODOS DE BÚSQUEDA Y FILTRADO =====
  
    /**
     * Busca productos por término
     */
    searchProducts(searchTerm: string, pageNumber: number = 1, pageSize: number = 10): Observable<ProductPagedResponse> {
      const params: ProductFilterParams = {
        search: searchTerm,
        pageNumber,
        pageSize
      };
      return this.getProducts(params);
    }
  
    /**
     * Obtiene productos disponibles
     */
    getAvailableProducts(): Observable<Product[]> {
      const params: ProductFilterParams = {
        available: 'Y'
      };
      return this.getProducts(params).pipe( 
        // Aquí extraes solo los datos del response paginado si necesario
        map((response) => response.data)
      );
    }
  
    /**
     * Obtiene productos habilitados
     */
    getEnabledProducts(): Observable<Product[]> {
      const params: ProductFilterParams = {
        enabled: true
      };
      return this.getProducts(params).pipe(
        // Aquí extraes solo los datos del response paginado si necesario
        map((response) => response.data)
      );
    }
  
    /**
     * Obtiene productos que se venden
     */
    getSellableProducts(): Observable<Product[]> {
      const params: ProductFilterParams = {
        sellItem: 'Y'
      };
      return this.getProducts(params).pipe(
        // Aquí extraes solo los datos del response paginado si necesario
        map((response) => response.data)
      );
    }
  
    /**
     * Obtiene productos por rango de precios
     */
    getProductsByPriceRange(minPrice: number, maxPrice: number): Observable<ProductPagedResponse> {
      const params: ProductFilterParams = {
        minPrice,
        maxPrice
      };
      return this.getProducts(params);
    }
  
    // ===== MÉTODOS DE UTILIDAD =====
  
    /**
     * Valida si un estado Y/N es válido
     */
    isValidYNStatus(status: string): boolean {
      return ['Y', 'N'].includes(status.toUpperCase());
    }
  
    /**
     * Valida los datos del producto antes de crear/actualizar
     */
    validateProductData(product: Partial<ProductCreateRequest>): { isValid: boolean; errors: string[] } {
      const errors: string[] = [];
  
      // Validar código del producto
      if (!product.itemCode?.trim()) {
        errors.push('El código del producto es requerido');
      } else if (product.itemCode.length > 50) {
        errors.push('El código del producto no puede exceder 50 caracteres');
      }
  
      // Validar nombre del producto
      if (!product.itemName?.trim()) {
        errors.push('El nombre del producto es requerido');
      } else if (product.itemName.length > 150) {
        errors.push('El nombre del producto no puede exceder 150 caracteres');
      }
  
      // Validar precio
      if (product.price === undefined || product.price === null) {
        errors.push('El precio es requerido');
      } else if (product.price < 0) {
        errors.push('El precio debe ser mayor o igual a 0');
      }
  
      // Validar descuento
      if (product.discount !== undefined && (product.discount < 0 || product.discount > 100)) {
        errors.push('El descuento debe estar entre 0 y 100');
      }
  
      // Validar sellItem
      if (!product.sellItem?.trim()) {
        errors.push('El estado de venta es requerido');
      } else if (!this.isValidYNStatus(product.sellItem)) {
        errors.push('El estado de venta debe ser Y o N');
      }
  
      // Validar available
      if (!product.available?.trim()) {
        errors.push('El estado de disponibilidad es requerido');
      } else if (!this.isValidYNStatus(product.available)) {
        errors.push('El estado de disponibilidad debe ser Y o N');
      }
  
      // Validar enabled
      if (!product.enabled?.trim()) {
        errors.push('El estado habilitado es requerido');
      } else if (!this.isValidYNStatus(product.enabled)) {
        errors.push('El estado habilitado debe ser Y o N');
      }
  
      // Validar rating
      if (product.rating !== undefined && (product.rating < 0 || product.rating > 5)) {
        errors.push('La calificación debe estar entre 0 y 5');
      }
  
      // Validar códigos EAN
      if (product.eanCode && product.eanCode.length > 20) {
        errors.push('El código EAN no puede exceder 20 caracteres');
      }
  
      return {
        isValid: errors.length === 0,
        errors
      };
    }
  
    /**
     * Convierte string Y/N a booleano para UI
     */
    ynToBoolean(value: string): boolean {
      return value?.toUpperCase() === 'Y';
    }
  
    /**
     * Convierte booleano a string Y/N para API
     */
    booleanToYN(value: boolean): string {
      return value ? 'Y' : 'N';
    }
  
    /**
     * Obtiene el label del estado para mostrar en UI
     */
    getYNLabel(value: string, trueLabel: string = 'Sí', falseLabel: string = 'No'): string {
      return this.ynToBoolean(value) ? trueLabel : falseLabel;
    }
  
    /**
     * Obtiene la severidad del estado para PrimeNG
     */
    getYNSeverity(value: string): 'success' | 'danger' {
      return this.ynToBoolean(value) ? 'success' : 'danger';
    }
  
    /**
     * Obtiene labels específicos para cada estado
     */
    getSellItemLabel(sellItem: string): string {
      return this.getYNLabel(sellItem, 'Se Vende', 'No se Vende');
    }
  
    getAvailableLabel(available: string): string {
      return this.getYNLabel(available, 'Disponible', 'No Disponible');
    }
  
    getEnabledLabel(enabled: string): string {
      return this.getYNLabel(enabled, 'Habilitado', 'Deshabilitado');
    }
  
    /**
     * Calcula el precio con descuento
     */
    calculateDiscountedPrice(product: Product): number {
      const discount = product.discount || 0;
      return product.price - (product.price * discount / 100);
    }
  
    /**
     * Calcula el ahorro por descuento
     */
    calculateSavings(product: Product): number {
      const discount = product.discount || 0;
      return product.price * discount / 100;
    }
  
    /**
     * Verifica si el producto tiene descuento
     */
    hasDiscount(product: Product): boolean {
      return (product.discount || 0) > 0;
    }
  
    /**
     * Verifica si el producto está completamente activo
     */
    isFullyActive(product: Product): boolean {
      return this.ynToBoolean(product.sellItem) && 
             this.ynToBoolean(product.available) && 
             this.ynToBoolean(product.enabled);
    }
  
    /**
     * Obtiene el estado general del producto
     */
    getOverallStatus(product: Product): 'active' | 'partial' | 'inactive' {
      const sellItem = this.ynToBoolean(product.sellItem);
      const available = this.ynToBoolean(product.available);
      const enabled = this.ynToBoolean(product.enabled);
  
      if (sellItem && available && enabled) {
        return 'active';
      } else if (!sellItem && !available && !enabled) {
        return 'inactive';
      } else {
        return 'partial';
      }
    }
  
    /**
     * Obtiene el label del estado general
     */
    getOverallStatusLabel(product: Product): string {
      const status = this.getOverallStatus(product);
      switch (status) {
        case 'active': return 'Activo';
        case 'partial': return 'Parcial';
        case 'inactive': return 'Inactivo';
        default: return 'Desconocido';
      }
    }
  
    /**
     * Obtiene la severidad del estado general
     */
    getOverallStatusSeverity(product: Product): 'success' | 'warning' | 'danger' {
      const status = this.getOverallStatus(product);
      switch (status) {
        case 'active': return 'success';
        case 'partial': return 'warning';
        case 'inactive': return 'danger';
        default: return 'warning';
      }
    }
  
    /**
     * Crea un objeto Product por defecto para nuevos registros
     */
    createDefaultProduct(): ProductCreateRequest {
      return {
        itemCode: '',
        eanCode: '',
        itemName: '',
        frgnName: '',
        price: 0,
        discount: 0,
        imageUrl: '',
        description: '',
        frgnDescription: '',
        sellItem: 'Y',
        available: 'Y',
        enabled: 'Y',
        groupItemCode: '',
        categoryItemCode: '',
        waitingTime: '',
        rating: 0,
        material: [],
        accompaniment: []
      };
    }
  
    /**
     * Formatea el precio para mostrar
     */
    formatPrice(price: number, currency: string = '$'): string {
      return `${currency}${price.toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    }
  
    /**
     * Formatea la calificación con estrellas
     */
    formatRating(rating: number): string {
      const stars = '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
      return `${stars} (${rating.toFixed(1)})`;
    }
  
    /**
     * Exporta productos a CSV
     */
    exportProductsToCSV(products: Product[]): string {
      const headers = [
        'Código', 'Código EAN', 'Nombre', 'Nombre Extranjero', 'Precio', 'Descuento',
        'Descripción', 'Se Vende', 'Disponible', 'Habilitado', 'Grupo', 'Categoría',
        'Tiempo Espera', 'Calificación', 'Materiales', 'Acompañamientos'
      ];
      
      const csvData = products.map(product => [
        product.itemCode,
        product.eanCode || '',
        product.itemName,
        product.frgnName || '',
        product.price.toString(),
        (product.discount || 0).toString(),
        product.description || '',
        this.getSellItemLabel(product.sellItem),
        this.getAvailableLabel(product.available),
        this.getEnabledLabel(product.enabled),
        product.groupItemCode || '',
        product.categoryItemCode || '',
        product.waitingTime || '',
        (product.rating || 0).toString(),
        product.material.length.toString(),
        product.accompaniment.length.toString()
      ]);
  
      const csvContent = [headers, ...csvData]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');
  
      return csvContent;
    }
  
    /**
     * Obtiene estadísticas de productos
     */
    getProductStats(products: Product[]): {
      total: number;
      sellable: number;
      available: number;
      enabled: number;
      fullyActive: number;
      withDiscount: number;
      averagePrice: number;
      averageRating: number;
      totalDiscountValue: number;
      topCategories: { category: string; count: number }[];
    } {
      const total = products.length;
      const sellable = products.filter(p => this.ynToBoolean(p.sellItem)).length;
      const available = products.filter(p => this.ynToBoolean(p.available)).length;
      const enabled = products.filter(p => this.ynToBoolean(p.enabled)).length;
      const fullyActive = products.filter(p => this.isFullyActive(p)).length;
      const withDiscount = products.filter(p => this.hasDiscount(p)).length;
      
      const averagePrice = total > 0 ? products.reduce((sum, p) => sum + p.price, 0) / total : 0;
      const averageRating = total > 0 ? products.reduce((sum, p) => sum + (p.rating || 0), 0) / total : 0;
      const totalDiscountValue = products.reduce((sum, p) => sum + this.calculateSavings(p), 0);
      
      // Top categorías
      const categoryCounts: { [key: string]: number } = {};
      products.forEach(p => {
        if (p.categoryItemCode) {
          categoryCounts[p.categoryItemCode] = (categoryCounts[p.categoryItemCode] || 0) + 1;
        }
      });
      
      const topCategories = Object.entries(categoryCounts)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
  
      return {
        total,
        sellable,
        available,
        enabled,
        fullyActive,
        withDiscount,
        averagePrice,
        averageRating,
        totalDiscountValue,
        topCategories
      };
    }
  }