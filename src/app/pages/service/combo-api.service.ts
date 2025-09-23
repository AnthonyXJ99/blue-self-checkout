import { Injectable } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { API_CONFIG } from '../../core/config/api.config';

/**
 * Servicio para gestión de combos usando la API de productos
 * Basado en combo_api_instructions.json
 */
@Injectable({
  providedIn: 'root'
})
export class ComboApiService {

  private readonly baseEndpoint = API_CONFIG.ENDPOINTS.PRODUCTS;

  constructor(private apiService: ApiService) {}

  // ===== OBTENER COMBOS =====

  /**
   * Obtiene todos los productos que son combos con sus opciones
   * GET /api/Products/combos
   */
  getAllCombos(): Observable<any[]> {
    return this.apiService.get<any[]>(`${this.baseEndpoint}/combos`).pipe(
      catchError(error => {
        console.error('Error getting all combos:', error);
        return of([]);
      })
    );
  }

  /**
   * Obtiene las opciones de combo de un producto específico
   * GET /api/Products/{productCode}/combo-options
   */
  getComboOptions(productCode: string): Observable<any> {
    return this.apiService.get<any>(`${this.baseEndpoint}/${productCode}/combo-options`).pipe(
      catchError(error => {
        console.error(`Error getting combo options for ${productCode}:`, error);
        return of(null);
      })
    );
  }

  // ===== CREAR COMBOS =====

  /**
   * Crea el producto combo principal
   * POST /api/Products
   * IMPORTANTE: Debe tener isCombo: 'Y'
   */
  createComboProduct(comboData: any): Observable<any> {
    console.log('🎯 ComboApiService.createComboProduct():');
    console.log('📍 Endpoint:', this.baseEndpoint);
    console.log('📦 Combo Data:', { ...comboData, isCombo: 'Y' });

    // Asegurar que isCombo esté en 'Y'
    const comboProductData = {
      ...comboData,
      isCombo: 'Y'
    };

    return this.apiService.post<any>(this.baseEndpoint, comboProductData).pipe(
      catchError(error => {
        console.error('Error creating combo product:', error);
        return of(null);
      })
    );
  }

  /**
   * Agregar una opción al combo (una por una)
   * POST /api/Products/{productCode}/combo-options
   */
  createComboOption(productCode: string, optionData: any): Observable<any> {
    console.log('🔧 ComboApiService.createComboOption():');
    console.log('📍 Product Code:', productCode);
    console.log('📦 Option Data:', optionData);

    return this.apiService.post<any>(`${this.baseEndpoint}/${productCode}/combo-options`, optionData).pipe(
      catchError(error => {
        console.error(`Error creating combo option for ${productCode}:`, error);
        return of(null);
      })
    );
  }

  /**
   * Crear múltiples opciones de combo en batch
   * Utiliza createComboOption internamente para cada opción
   */
  createMultipleComboOptions(productCode: string, options: any[]): Observable<any[]> {
    console.log('🚀 ComboApiService.createMultipleComboOptions():');
    console.log('📍 Product Code:', productCode);
    console.log('📦 Options Count:', options.length);

    const requests = options.map(option => this.createComboOption(productCode, option));

    // Ejecutar todas las peticiones en paralelo
    return new Observable(observer => {
      const results: any[] = [];
      let completed = 0;

      requests.forEach((request, index) => {
        request.subscribe({
          next: (result) => {
            results[index] = result;
            completed++;
            if (completed === requests.length) {
              observer.next(results);
              observer.complete();
            }
          },
          error: (error) => {
            console.error(`Error in option ${index}:`, error);
            results[index] = null;
            completed++;
            if (completed === requests.length) {
              observer.next(results);
              observer.complete();
            }
          }
        });
      });
    });
  }

  // ===== ACTUALIZAR COMBOS =====

  /**
   * Actualiza una opción específica del combo
   * PUT /api/Products/{productCode}/combo-options/{groupCode}/{optionCode}
   */
  updateComboOption(productCode: string, groupCode: string, optionCode: string, updateData: any): Observable<any> {
    console.log('✏️ ComboApiService.updateComboOption():');
    console.log('📍 Product Code:', productCode);
    console.log('📍 Group Code:', groupCode);
    console.log('📍 Option Code:', optionCode);
    console.log('📦 Update Data:', updateData);

    return this.apiService.put<any>(`${this.baseEndpoint}/${productCode}/combo-options/${groupCode}/${optionCode}`, updateData).pipe(
      catchError(error => {
        console.error(`Error updating combo option ${productCode}/${groupCode}/${optionCode}:`, error);
        return of(null);
      })
    );
  }

  // ===== ELIMINAR COMBOS =====

  /**
   * Elimina una opción específica del combo
   * DELETE /api/Products/{productCode}/combo-options/{groupCode}/{optionCode}
   */
  deleteComboOption(productCode: string, groupCode: string, optionCode: string): Observable<boolean> {
    console.log('🗑️ ComboApiService.deleteComboOption():');
    console.log('📍 Product Code:', productCode);
    console.log('📍 Group Code:', groupCode);
    console.log('📍 Option Code:', optionCode);

    return this.apiService.delete<any>(`${this.baseEndpoint}/${productCode}/combo-options/${groupCode}/${optionCode}`).pipe(
      map(() => true),
      catchError(error => {
        console.error(`Error deleting combo option ${productCode}/${groupCode}/${optionCode}:`, error);
        return of(false);
      })
    );
  }

  /**
   * Elimina el producto combo completo (esto eliminará las opciones por cascada)
   * DELETE /api/Products/{productCode}
   */
  deleteComboProduct(productCode: string): Observable<boolean> {
    console.log('💥 ComboApiService.deleteComboProduct():');
    console.log('📍 Product Code:', productCode);

    return this.apiService.delete<any>(`${this.baseEndpoint}/${productCode}`).pipe(
      map(() => true),
      catchError(error => {
        console.error(`Error deleting combo product ${productCode}:`, error);
        return of(false);
      })
    );
  }

  // ===== UTILIDADES =====

  /**
   * Valida si un producto puede ser convertido a combo
   */
  validateComboProduct(productData: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!productData.itemCode) {
      errors.push('El código del producto es requerido');
    }

    if (!productData.itemName) {
      errors.push('El nombre del producto es requerido');
    }

    if (!productData.price || productData.price <= 0) {
      errors.push('El precio del producto debe ser mayor a 0');
    }

    if (productData.isCombo !== 'Y') {
      errors.push('El producto debe estar marcado como combo (isCombo: Y)');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Valida una opción de combo
   */
  validateComboOption(optionData: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!optionData.groupItemCode) {
      errors.push('El código del grupo es requerido');
    }

    if (!optionData.optionItemCode) {
      errors.push('El código del producto opción es requerido');
    }

    if (!optionData.isDefault || (optionData.isDefault !== 'Y' && optionData.isDefault !== 'N')) {
      errors.push('isDefault debe ser Y o N');
    }

    if (optionData.priceDelta === undefined || optionData.priceDelta === null) {
      errors.push('priceDelta es requerido (puede ser 0)');
    }

    if (optionData.upgradeLevel === undefined || optionData.upgradeLevel < 0) {
      errors.push('upgradeLevel debe ser >= 0');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Calcula el precio final de un combo con las opciones seleccionadas
   */
  calculateComboPrice(basePrice: number, selectedOptions: any[]): number {
    if (!selectedOptions || selectedOptions.length === 0) {
      return basePrice;
    }

    const totalDelta = selectedOptions.reduce((total, option) => {
      return total + (option.priceDelta || 0);
    }, 0);

    return basePrice + totalDelta;
  }

  /**
   * Obtiene los grupos únicos de opciones de un combo
   */
  getComboGroups(comboOptions: any[]): string[] {
    if (!comboOptions || comboOptions.length === 0) {
      return [];
    }

    const groups = new Set(comboOptions.map(option => option.groupItemCode));
    return Array.from(groups);
  }

  /**
   * Obtiene las opciones por defecto de un combo
   */
  getDefaultOptions(comboOptions: any[]): any[] {
    if (!comboOptions || comboOptions.length === 0) {
      return [];
    }

    return comboOptions.filter(option => option.isDefault === 'Y');
  }

  /**
   * Formatea el precio para mostrar
   */
  formatPrice(price: number): string {
    return `$${price.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  }
}