import { Injectable } from "@angular/core";
import { Observable, map } from "rxjs";
import { ApiService } from "../../core/services/api.service";
import { API_CONFIG } from "../../core/config/api.config";
import { 
  CategoryWithAccompaniments,
  CategoryAccompaniment,
  CategoryAccompanimentForCreation,
  CategoryAccompanimentForUpdate,
  CategoryAccompanimentUpdateBatch,
  ProductAvailable,
  AccompanimentFilterParams,
  SelectOption,
  TagSeverity,
  AccompanimentStats
} from "../products/accompaniments/model/accompaniment.model";

/**
 * Servicio API para gestión de Acompañamientos de Categorías
 */
@Injectable({
  providedIn: 'root'
})
export class AccompanimentApiService {
  private readonly endpoint = API_CONFIG.ENDPOINTS.ACCOMPANIMENTS;

  constructor(private apiService: ApiService) {}

  // ============================================
  // OPERACIONES CRUD BÁSICAS
  // ============================================

  /**
   * Obtiene todas las categorías con sus acompañamientos
   * GET /api/accompaniments
   */
  getAllCategoriesWithAccompaniments(): Observable<CategoryWithAccompaniments[]> {
    return this.apiService.get<CategoryWithAccompaniments[]>(this.endpoint);
  }

  /**
   * Obtiene los acompañamientos de una categoría específica
   * GET /api/accompaniments/{categoryItemCode}
   */
  getCategoryAccompaniments(categoryItemCode: string): Observable<CategoryWithAccompaniments> {
    return this.apiService.get<CategoryWithAccompaniments>(`${this.endpoint}/${categoryItemCode}`);
  }

  /**
   * Obtiene un acompañamiento específico de una categoría
   * GET /api/accompaniments/{categoryItemCode}/{lineNumber}
   */
  getAccompaniment(categoryItemCode: string, lineNumber: number): Observable<CategoryAccompaniment> {
    return this.apiService.get<CategoryAccompaniment>(`${this.endpoint}/${categoryItemCode}/${lineNumber}`);
  }

  /**
   * Crea múltiples acompañamientos para una categoría
   * POST /api/accompaniments/{categoryItemCode}
   */
  createAccompaniments(categoryItemCode: string, accompaniments: CategoryAccompanimentForCreation[]): Observable<CategoryAccompaniment[]> {
    return this.apiService.post<CategoryAccompaniment[]>(`${this.endpoint}/${categoryItemCode}`, accompaniments);
  }

  /**
   * Crea un solo acompañamiento para una categoría
   * POST /api/accompaniments/{categoryItemCode}/single
   */
  createSingleAccompaniment(categoryItemCode: string, accompaniment: CategoryAccompanimentForCreation): Observable<CategoryAccompaniment> {
    const url = `${this.endpoint}/${categoryItemCode}/single`;
    console.log('🌐 AccompanimentApiService.createSingleAccompaniment():');
    console.log('📍 URL:', url);
    console.log('🏷️ CategoryItemCode:', categoryItemCode);
    console.log('📦 Payload:', accompaniment);
    console.log('⚙️ Endpoint base:', this.endpoint);
    
    return this.apiService.post<CategoryAccompaniment>(url, accompaniment);
  }

  /**
   * Actualiza múltiples acompañamientos de una categoría
   * PUT /api/accompaniments/{categoryItemCode}
   */
  updateAccompaniments(categoryItemCode: string, accompaniments: CategoryAccompanimentUpdateBatch[]): Observable<CategoryAccompaniment[]> {
    return this.apiService.put<CategoryAccompaniment[]>(`${this.endpoint}/${categoryItemCode}`, accompaniments);
  }

  /**
   * Actualiza un acompañamiento existente
   * PUT /api/accompaniments/{categoryItemCode}/{lineNumber}
   */
  updateSingleAccompaniment(categoryItemCode: string, lineNumber: number, updateData: CategoryAccompanimentForUpdate): Observable<CategoryAccompaniment> {
    return this.apiService.put<CategoryAccompaniment>(`${this.endpoint}/${categoryItemCode}/${lineNumber}`, updateData);
  }

  /**
   * Elimina un acompañamiento
   * DELETE /api/accompaniments/{categoryItemCode}/{lineNumber}
   */
  deleteAccompaniment(categoryItemCode: string, lineNumber: number): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${categoryItemCode}/${lineNumber}`);
  }

  /**
   * Elimina todos los acompañamientos de una categoría
   * DELETE /api/accompaniments/{categoryItemCode}
   */
  deleteAllCategoryAccompaniments(categoryItemCode: string): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${categoryItemCode}`);
  }

  /**
   * Obtiene productos disponibles para usar como acompañamientos
   * GET /api/accompaniments/available-products
   */
  getAvailableProducts(): Observable<ProductAvailable[]> {
    return this.apiService.get<ProductAvailable[]>(`${this.endpoint}/available-products`);
  }

  // ============================================
  // MÉTODOS DE BÚSQUEDA Y FILTRADO
  // ============================================

  /**
   * Busca acompañamientos por categoría
   */
  searchByCategory(categoryItemCode: string): Observable<CategoryWithAccompaniments> {
    return this.getCategoryAccompaniments(categoryItemCode);
  }

  /**
   * Filtra acompañamientos por rango de precio
   */
  filterByPriceRange(minPrice?: number, maxPrice?: number): Observable<CategoryWithAccompaniments[]> {
    return this.getAllCategoriesWithAccompaniments().pipe(
      map(categories => categories.map(category => ({
        ...category,
        availableAccompaniments: category.availableAccompaniments.filter(acc => {
          const price = acc.accompanimentPrice;
          const matchesMin = minPrice === undefined || price >= minPrice;
          const matchesMax = maxPrice === undefined || price <= maxPrice;
          return matchesMin && matchesMax;
        })
      })))
    );
  }

  /**
   * Filtra acompañamientos que tienen descuento
   */
  getAccompanimentsWithDiscount(): Observable<CategoryWithAccompaniments[]> {
    return this.getAllCategoriesWithAccompaniments().pipe(
      map(categories => categories.map(category => ({
        ...category,
        availableAccompaniments: category.availableAccompaniments.filter(acc => acc.discount && acc.discount > 0)
      })))
    );
  }

  /**
   * Filtra acompañamientos que tienen ampliación
   */
  getAccompanimentsWithEnlargement(): Observable<CategoryWithAccompaniments[]> {
    return this.getAllCategoriesWithAccompaniments().pipe(
      map(categories => categories.map(category => ({
        ...category,
        availableAccompaniments: category.availableAccompaniments.filter(acc => acc.enlargementItemCode)
      })))
    );
  }

  // ============================================
  // MÉTODOS DE UTILIDAD
  // ============================================

  /**
   * Calcula el precio con descuento
   */
  calculateDiscountedPrice(accompaniment: CategoryAccompaniment): number {
    if (!accompaniment.discount || accompaniment.discount === 0) {
      return accompaniment.accompanimentPrice;
    }
    return accompaniment.accompanimentPrice * (1 - accompaniment.discount / 100);
  }

  /**
   * Verifica si tiene descuento
   */
  hasDiscount(accompaniment: CategoryAccompaniment): boolean {
    return !!(accompaniment.discount && accompaniment.discount > 0);
  }

  /**
   * Verifica si tiene ampliación
   */
  hasEnlargement(accompaniment: CategoryAccompaniment): boolean {
    return !!(accompaniment.enlargementItemCode);
  }

  /**
   * Formatea precio para mostrar
   */
  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(price);
  }

  /**
   * Obtiene el label del descuento
   */
  getDiscountLabel(discount?: number): string {
    return discount ? `${discount}% OFF` : 'Sin descuento';
  }

  /**
   * Obtiene la severidad para tag de descuento
   */
  getDiscountSeverity(discount?: number): TagSeverity {
    if (!discount || discount === 0) return 'secondary';
    if (discount >= 50) return 'success';
    if (discount >= 25) return 'warning';
    return 'info';
  }

  /**
   * Obtiene opciones de categorías para select
   */
  getCategoryOptions(): Observable<SelectOption[]> {
    return this.getAllCategoriesWithAccompaniments().pipe(
      map(categories => categories.map(category => ({
        label: category.categoryItemName,
        value: category.categoryItemCode
      })))
    );
  }

  /**
   * Obtiene opciones de productos disponibles para select
   */
  getProductOptions(): Observable<SelectOption[]> {
    return this.getAvailableProducts().pipe(
      map(products => products.map(product => ({
        label: `${product.itemCode} - ${product.itemName}`,
        value: product.itemCode
      })))
    );
  }

  /**
   * Valida los datos del acompañamiento antes de crear/actualizar
   */
  validateAccompanimentData(data: Partial<CategoryAccompanimentForCreation>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validar código del acompañamiento
    if (!data.accompanimentItemCode?.trim()) {
      errors.push('El código del acompañamiento es requerido');
    }

    // Validar descuento
    if (data.discount !== undefined && (data.discount < 0 || data.discount > 100)) {
      errors.push('El descuento debe estar entre 0 y 100');
    }

    // Validar descuento de ampliación
    if (data.enlargementDiscount !== undefined && (data.enlargementDiscount < 0 || data.enlargementDiscount > 100)) {
      errors.push('El descuento de ampliación debe estar entre 0 y 100');
    }

    // Si hay descuento de ampliación, debe haber código de ampliación
    if (data.enlargementDiscount && !data.enlargementItemCode) {
      errors.push('Si hay descuento de ampliación, debe especificar el código de ampliación');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Obtiene estadísticas de acompañamientos
   */
  getAccompanimentStats(): Observable<AccompanimentStats> {
    return this.getAllCategoriesWithAccompaniments().pipe(
      map(categories => {
        const totalCategories = categories.length;
        const allAccompaniments = categories.flatMap(c => c.availableAccompaniments);
        const totalAccompaniments = allAccompaniments.length;
        const accompanimeentsWithDiscount = allAccompaniments.filter(a => this.hasDiscount(a)).length;
        const accompanimeentsWithEnlargement = allAccompaniments.filter(a => this.hasEnlargement(a)).length;
        
        const totalPrice = allAccompaniments.reduce((sum, a) => sum + a.accompanimentPrice, 0);
        const averagePrice = totalAccompaniments > 0 ? totalPrice / totalAccompaniments : 0;
        
        const totalDiscount = allAccompaniments
          .filter(a => a.discount)
          .reduce((sum, a) => sum + (a.discount || 0), 0);
        const averageDiscount = accompanimeentsWithDiscount > 0 ? totalDiscount / accompanimeentsWithDiscount : 0;

        return {
          totalCategories,
          totalAccompaniments,
          accompanimeentsWithDiscount,
          accompanimeentsWithEnlargement,
          averagePrice,
          averageDiscount
        };
      })
    );
  }

  /**
   * Exporta acompañamientos a CSV
   */
  exportToCSV(categories: CategoryWithAccompaniments[]): string {
    const headers = [
      'Categoría', 'Código Acompañamiento', 'Nombre Acompañamiento', 
      'Precio', 'Descuento (%)', 'Código Ampliación', 'Descuento Ampliación (%)'
    ];
    
    const csvData: string[][] = [];
    
    categories.forEach(category => {
      category.availableAccompaniments.forEach(acc => {
        csvData.push([
          category.categoryItemName,
          acc.accompanimentItemCode,
          acc.accompanimentItemName,
          acc.accompanimentPrice.toString(),
          (acc.discount || 0).toString(),
          acc.enlargementItemCode || '',
          (acc.enlargementDiscount || 0).toString()
        ]);
      });
    });

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    return csvContent;
  }

  /**
   * Descarga CSV
   */
  downloadCSV(content: string, filename: string = 'acompañamientos.csv'): void {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}