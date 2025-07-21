import { Injectable } from '@angular/core';
import { Observable, catchError, map, finalize, of } from 'rxjs';
import { ProductsService } from '../../../service/product-api.service';
import { 
  Product, 
  ProductCreateRequest, 
  ProductUpdateRequest, 
  ProductFilterParams, 
  ProductPagedResponse 
} from '../model/product.model';

/**
 * Repositorio para gestión de productos que envuelve el servicio API
 * con manejo de errores y métodos adicionales
 */
@Injectable({
  providedIn: 'root'
})
export class ProductRepository {

  constructor(private productsService: ProductsService) {}

  // === MÉTODOS CRUD BÁSICOS ===

  /**
   * Obtiene todos los productos
   */
  getAllProducts(): Observable<Product[]> {
    return this.productsService.getAllProducts().pipe(
      catchError(error => {
        console.error('Error getting all products:', error);
        return of([]);
      })
    );
  }

  /**
   * Obtiene productos con paginación y filtros
   */
  getProducts(params?: ProductFilterParams): Observable<ProductPagedResponse> {
    return this.productsService.getProducts(params).pipe(
      map(response => {
        // Convertir ApiResponse a ProductPagedResponse
        return {
          totalCount: response.totalCount || 0,
          pageNumber: response.pageNumber || 1,
          pageSize: response.pageSize || 10,
          totalPages: response.totalPages || 1,
          data: response.data || []
        };
      }),
      catchError(error => {
        console.error('Error getting products:', error);
        return of({
          totalCount: 0,
          pageNumber: 1,
          pageSize: 10,
          totalPages: 1,
          data: []
        });
      })
    );
  }

  /**
   * Obtiene un producto por código
   */
  getProductByCode(itemCode: string): Observable<Product | null> {
    return this.productsService.getProductByCode(itemCode).pipe(
      catchError(error => {
        console.error(`Error getting product ${itemCode}:`, error);
        return of(null);
      })
    );
  }

  /**
   * Crea un nuevo producto
   */
  createProduct(productData: ProductCreateRequest): Observable<Product | null> {
    return this.productsService.createProduct(productData).pipe(
      catchError(error => {
        console.error('Error creating product:', error);
        return of(null);
      })
    );
  }

  /**
   * Actualiza un producto existente
   */
  updateProduct(itemCode: string, productData: ProductUpdateRequest): Observable<boolean> {
    return this.productsService.updateProduct(itemCode, productData).pipe(
      map(() => true),
      catchError(error => {
        console.error(`Error updating product ${itemCode}:`, error);
        return of(false);
      })
    );
  }

  /**
   * Elimina un producto
   */
  deleteProduct(itemCode: string): Observable<boolean> {
    return this.productsService.deleteProduct(itemCode).pipe(
      map(() => true),
      catchError(error => {
        console.error(`Error deleting product ${itemCode}:`, error);
        return of(false);
      })
    );
  }

  // === MÉTODOS DE BÚSQUEDA Y FILTRADO ===

  /**
   * Busca productos por término
   */
  searchProducts(searchTerm: string, pageNumber: number = 1, pageSize: number = 10): Observable<ProductPagedResponse> {
    return this.productsService.searchProducts(searchTerm, pageNumber, pageSize).pipe(
      catchError(error => {
        console.error('Error searching products:', error);
        return of({
          totalCount: 0,
          pageNumber: 1,
          pageSize: 10,
          totalPages: 1,
          data: []
        });
      })
    );
  }

  /**
   * Obtiene productos por grupo
   */
  getProductsByGroup(groupCode: string): Observable<Product[]> {
    return this.productsService.getProductsByGroup(groupCode).pipe(
      catchError(error => {
        console.error(`Error getting products by group ${groupCode}:`, error);
        return of([]);
      })
    );
  }

  /**
   * Obtiene productos por categoría
   */
  getProductsByCategory(categoryCode: string): Observable<Product[]> {
    return this.productsService.getProductsByCategory(categoryCode).pipe(
      catchError(error => {
        console.error(`Error getting products by category ${categoryCode}:`, error);
        return of([]);
      })
    );
  }

  /**
   * Obtiene productos disponibles
   */
  getAvailableProducts(): Observable<Product[]> {
    return this.productsService.getAvailableProducts().pipe(
      catchError(error => {
        console.error('Error getting available products:', error);
        return of([]);
      })
    );
  }

  /**
   * Obtiene productos habilitados
   */
  getEnabledProducts(): Observable<Product[]> {
    return this.productsService.getEnabledProducts().pipe(
      catchError(error => {
        console.error('Error getting enabled products:', error);
        return of([]);
      })
    );
  }

  /**
   * Obtiene productos que se venden
   */
  getSellableProducts(): Observable<Product[]> {
    return this.productsService.getSellableProducts().pipe(
      catchError(error => {
        console.error('Error getting sellable products:', error);
        return of([]);
      })
    );
  }

  /**
   * Obtiene productos por rango de precios
   */
  getProductsByPriceRange(minPrice: number, maxPrice: number): Observable<ProductPagedResponse> {
    return this.productsService.getProductsByPriceRange(minPrice, maxPrice).pipe(
      catchError(error => {
        console.error('Error getting products by price range:', error);
        return of({
          totalCount: 0,
          pageNumber: 1,
          pageSize: 10,
          totalPages: 1,
          data: []
        });
      })
    );
  }

  // === MÉTODOS DE VALIDACIÓN ===

  /**
   * Valida los datos del producto
   */
  validateProductData(product: Partial<ProductCreateRequest>): { isValid: boolean; errors: string[] } {
    return this.productsService.validateProductData(product);
  }

  /**
   * Verifica si un código de producto existe
   */
  isProductCodeExists(itemCode: string): Observable<boolean> {
    return this.getProductByCode(itemCode).pipe(
      map(product => product !== null)
    );
  }

  // === MÉTODOS DE UTILIDAD ===

  /**
   * Convierte string Y/N a booleano
   */
  ynToBoolean(value: string): boolean {
    return this.productsService.ynToBoolean(value);
  }

  /**
   * Convierte booleano a string Y/N
   */
  booleanToYN(value: boolean): string {
    return this.productsService.booleanToYN(value);
  }

  /**
   * Obtiene el label del estado
   */
  getYNLabel(value: string, trueLabel: string = 'Sí', falseLabel: string = 'No'): string {
    return this.productsService.getYNLabel(value, trueLabel, falseLabel);
  }

  /**
   * Obtiene la severidad del estado
   */
  getYNSeverity(value: string): 'success' | 'danger' {
    return this.productsService.getYNSeverity(value);
  }

  /**
   * Obtiene labels específicos
   */
  getSellItemLabel(sellItem: string): string {
    return this.productsService.getSellItemLabel(sellItem);
  }

  getAvailableLabel(available: string): string {
    return this.productsService.getAvailableLabel(available);
  }

  getEnabledLabel(enabled: string): string {
    return this.productsService.getEnabledLabel(enabled);
  }

  /**
   * Calcula el precio con descuento
   */
  calculateDiscountedPrice(product: Product): number {
    return this.productsService.calculateDiscountedPrice(product);
  }

  /**
   * Calcula el ahorro por descuento
   */
  calculateSavings(product: Product): number {
    return this.productsService.calculateSavings(product);
  }

  /**
   * Verifica si el producto tiene descuento
   */
  hasDiscount(product: Product): boolean {
    return this.productsService.hasDiscount(product);
  }

  /**
   * Verifica si el producto está completamente activo
   */
  isFullyActive(product: Product): boolean {
    return this.productsService.isFullyActive(product);
  }

  /**
   * Obtiene el estado general del producto
   */
  getOverallStatus(product: Product): 'active' | 'partial' | 'inactive' {
    return this.productsService.getOverallStatus(product);
  }

  /**
   * Obtiene el label del estado general
   */
  getOverallStatusLabel(product: Product): string {
    return this.productsService.getOverallStatusLabel(product);
  }

  /**
   * Obtiene la severidad del estado general
   */
  getOverallStatusSeverity(product: Product): 'success' | 'warning' | 'danger' {
    return this.productsService.getOverallStatusSeverity(product);
  }

  /**
   * Crea un producto por defecto
   */
  createDefaultProduct(): ProductCreateRequest {
    return this.productsService.createDefaultProduct();
  }

  /**
   * Formatea el precio para mostrar
   */
  formatPrice(price: number, currency: string = '$'): string {
    return this.productsService.formatPrice(price, currency);
  }

  /**
   * Formatea la calificación con estrellas
   */
  formatRating(rating: number): string {
    return this.productsService.formatRating(rating);
  }

  // === MÉTODOS DE EXPORTACIÓN ===

  /**
   * Exporta productos a CSV
   */
  exportProductsToCSV(products: Product[]): string {
    return this.productsService.exportProductsToCSV(products);
  }

  // === MÉTODOS DE ESTADÍSTICAS ===

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
    return this.productsService.getProductStats(products);
  }

  // === MÉTODOS DE OPERACIONES EN LOTE ===

  /**
   * Elimina múltiples productos
   */
  deleteMultipleProducts(itemCodes: string[]): Observable<{ success: number; failed: number; errors: string[] }> {
    const results = { success: 0, failed: 0, errors: [] as string[] };
    
    if (itemCodes.length === 0) {
      return of(results);
    }

    const deleteObservables = itemCodes.map(itemCode => 
      this.deleteProduct(itemCode).pipe(
        map(success => ({ itemCode, success }))
      )
    );

    return new Observable(observer => {
      let completed = 0;
      const total = deleteObservables.length;

      deleteObservables.forEach(obs => {
        obs.subscribe({
          next: ({ itemCode, success }) => {
            if (success) {
              results.success++;
            } else {
              results.failed++;
              results.errors.push(`Error eliminando producto ${itemCode}`);
            }
            completed++;
            
            if (completed === total) {
              observer.next(results);
              observer.complete();
            }
          },
          error: (error) => {
            results.failed++;
            results.errors.push(`Error en operación: ${error.message}`);
            completed++;
            
            if (completed === total) {
              observer.next(results);
              observer.complete();
            }
          }
        });
      });
    });
  }

  /**
   * Actualiza el estado de múltiples productos
   */
  updateMultipleProductsStatus(
    itemCodes: string[], 
    updates: { sellItem?: string; available?: string; enabled?: string }
  ): Observable<{ success: number; failed: number; errors: string[] }> {
    const results = { success: 0, failed: 0, errors: [] as string[] };
    
    if (itemCodes.length === 0) {
      return of(results);
    }

    const updateObservables = itemCodes.map(itemCode => 
      this.getProductByCode(itemCode).pipe(
        map(product => {
          if (!product) {
            throw new Error(`Producto ${itemCode} no encontrado`);
          }
          return product;
        }),
        map(product => ({
          ...product,
          ...updates
        })),
        map(updatedProduct => ({ itemCode, product: updatedProduct }))
      )
    );

    return new Observable(observer => {
      let completed = 0;
      const total = updateObservables.length;

      updateObservables.forEach(obs => {
        obs.pipe(
          map(({ itemCode, product }) => ({ itemCode, product }))
        ).subscribe({
          next: ({ itemCode, product }) => {
            this.updateProduct(itemCode, product).subscribe({
              next: (success) => {
                if (success) {
                  results.success++;
                } else {
                  results.failed++;
                  results.errors.push(`Error actualizando producto ${itemCode}`);
                }
                completed++;
                
                if (completed === total) {
                  observer.next(results);
                  observer.complete();
                }
              },
              error: (error) => {
                results.failed++;
                results.errors.push(`Error actualizando producto ${itemCode}: ${error.message}`);
                completed++;
                
                if (completed === total) {
                  observer.next(results);
                  observer.complete();
                }
              }
            });
          },
          error: (error) => {
            results.failed++;
            results.errors.push(`Error obteniendo producto: ${error.message}`);
            completed++;
            
            if (completed === total) {
              observer.next(results);
              observer.complete();
            }
          }
        });
      });
    });
  }
}
