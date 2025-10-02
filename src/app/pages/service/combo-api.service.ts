import { Injectable } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { API_CONFIG } from '../../core/config/api.config';
import {
  ComboResponseDto,
  ComboCreateDto,
  ComboUpdateDto,
  ComboOptionItemDto,
  ComboOptionUpdateDto,
  ComboOptionResponseDto
} from '../products/combos/model/combo.model';

/**
 * Servicio para gestión de combos usando la API /api/Combos
 * Basado en API_DOCUMENTATION.md y API_DOCUMENTATION.json
 */
@Injectable({
  providedIn: 'root'
})
export class ComboApiService {

  private readonly baseEndpoint = API_CONFIG.ENDPOINTS.COMBOS;

  constructor(private apiService: ApiService) {}

  // ===== COMBOS - CRUD OPERATIONS =====

  /**
   * Obtiene todos los combos
   * GET /api/Combos
   */
  getAllCombos(): Observable<ComboResponseDto[]> {
    return this.apiService.get<ComboResponseDto[]>(this.baseEndpoint).pipe(
      catchError(error => {
        console.error('Error getting all combos:', error);
        return of([]);
      })
    );
  }

  /**
   * Obtiene un combo específico con sus opciones
   * GET /api/Combos/{comboCode}
   */
  getComboById(comboCode: string): Observable<ComboResponseDto | null> {
    return this.apiService.get<ComboResponseDto>(`${this.baseEndpoint}/${comboCode}`).pipe(
      catchError(error => {
        console.error(`Error getting combo ${comboCode}:`, error);
        return of(null);
      })
    );
  }

  /**
   * Alias para mantener compatibilidad con código existente
   * GET /api/Combos/{comboCode}
   */
  getComboOptions(comboCode: string): Observable<ComboResponseDto | null> {
    return this.getComboById(comboCode);
  }

  /**
   * Crea un nuevo combo con sus opciones en una sola operación
   * POST /api/Combos
   * Body: { itemCode, itemName, description?, price, imageUrl?, enabled?, available?, options: [] }
   */
  createCombo(comboData: ComboCreateDto): Observable<ComboResponseDto | null> {
    console.log('🎯 ComboApiService.createCombo():');
    console.log('📍 Endpoint:', this.baseEndpoint);
    console.log('📦 Combo Data:', comboData);

    return this.apiService.post<ComboResponseDto>(this.baseEndpoint, comboData).pipe(
      catchError(error => {
        console.error('Error creating combo:', error);
        return of(null);
      })
    );
  }

  /**
   * Actualiza un combo existente (sin incluir opciones)
   * PUT /api/Combos/{comboCode}
   */
  updateCombo(comboCode: string, updateData: ComboUpdateDto): Observable<ComboResponseDto | null> {
    console.log('✏️ ComboApiService.updateCombo():');
    console.log('📍 Combo Code:', comboCode);
    console.log('📦 Update Data:', updateData);

    return this.apiService.put<ComboResponseDto>(`${this.baseEndpoint}/${comboCode}`, updateData).pipe(
      catchError(error => {
        console.error(`Error updating combo ${comboCode}:`, error);
        return of(null);
      })
    );
  }

  /**
   * Elimina un combo completo (esto eliminará las opciones por cascada)
   * DELETE /api/Combos/{comboCode}
   */
  deleteCombo(comboCode: string): Observable<boolean> {
    console.log('💥 ComboApiService.deleteCombo():');
    console.log('📍 Combo Code:', comboCode);

    return this.apiService.delete<any>(`${this.baseEndpoint}/${comboCode}`).pipe(
      map(() => true),
      catchError(error => {
        console.error(`Error deleting combo ${comboCode}:`, error);
        return of(false);
      })
    );
  }

  // ===== COMBO OPTIONS - OPERATIONS =====

  /**
   * Obtiene todas las opciones de un combo
   * GET /api/Combos/{comboCode}/options
   */
  getComboOptionsList(comboCode: string): Observable<ComboOptionResponseDto[]> {
    return this.apiService.get<ComboOptionResponseDto[]>(`${this.baseEndpoint}/${comboCode}/options`).pipe(
      catchError(error => {
        console.error(`Error getting options for combo ${comboCode}:`, error);
        return of([]);
      })
    );
  }

  /**
   * Agrega una nueva opción a un combo existente
   * POST /api/Combos/{comboCode}/options
   * Body: { groupCode, itemCode, isDefault, priceDiff, upLevel, upLabel? }
   */
  createComboOption(comboCode: string, optionData: ComboOptionItemDto): Observable<ComboOptionResponseDto | null> {
    console.log('🔧 ComboApiService.createComboOption():');
    console.log('📍 Combo Code:', comboCode);
    console.log('📦 Option Data:', optionData);

    return this.apiService.post<ComboOptionResponseDto>(`${this.baseEndpoint}/${comboCode}/options`, optionData).pipe(
      catchError(error => {
        console.error(`Error creating combo option for ${comboCode}:`, error);
        return of(null);
      })
    );
  }

  /**
   * Crea múltiples opciones de combo en batch
   * Utiliza createComboOption internamente para cada opción
   */
  createMultipleComboOptions(comboCode: string, options: ComboOptionItemDto[]): Observable<(ComboOptionResponseDto | null)[]> {
    console.log('🚀 ComboApiService.createMultipleComboOptions():');
    console.log('📍 Combo Code:', comboCode);
    console.log('📦 Options Count:', options.length);

    const requests = options.map(option => this.createComboOption(comboCode, option));

    // Ejecutar todas las peticiones en paralelo
    return new Observable(observer => {
      const results: (ComboOptionResponseDto | null)[] = [];
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

  /**
   * Actualiza una opción específica del combo
   * PUT /api/Combos/{comboCode}/options/{optionCode}
   * Body: { groupCode?, isDefault?, priceDiff?, upLevel?, upLabel? }
   * NOTE: groupCode NO va en la URL, solo optionCode
   */
  updateComboOption(comboCode: string, optionCode: string, updateData: ComboOptionUpdateDto): Observable<ComboOptionResponseDto | null> {
    console.log('✏️ ComboApiService.updateComboOption():');
    console.log('📍 Combo Code:', comboCode);
    console.log('📍 Option Code:', optionCode);
    console.log('📦 Update Data:', updateData);

    return this.apiService.put<ComboOptionResponseDto>(`${this.baseEndpoint}/${comboCode}/options/${optionCode}`, updateData).pipe(
      catchError(error => {
        console.error(`Error updating combo option ${comboCode}/options/${optionCode}:`, error);
        return of(null);
      })
    );
  }

  /**
   * Elimina una opción específica del combo
   * DELETE /api/Combos/{comboCode}/options/{optionCode}
   * NOTE: groupCode NO va en la URL, solo optionCode
   */
  deleteComboOption(comboCode: string, optionCode: string): Observable<boolean> {
    console.log('🗑️ ComboApiService.deleteComboOption():');
    console.log('📍 Combo Code:', comboCode);
    console.log('📍 Option Code:', optionCode);

    return this.apiService.delete<any>(`${this.baseEndpoint}/${comboCode}/options/${optionCode}`).pipe(
      map(() => true),
      catchError(error => {
        console.error(`Error deleting combo option ${comboCode}/options/${optionCode}:`, error);
        return of(false);
      })
    );
  }

  // ===== UTILIDADES =====

  /**
   * Valida si los datos del combo son correctos
   */
  validateComboData(comboData: ComboCreateDto): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!comboData.itemCode) {
      errors.push('El código del combo es requerido');
    }

    if (!comboData.itemName) {
      errors.push('El nombre del combo es requerido');
    }

    if (!comboData.price || comboData.price <= 0) {
      errors.push('El precio del combo debe ser mayor a 0');
    }

    // Las opciones son opcionales según la documentación de la API
    // if (!comboData.options || comboData.options.length === 0) {
    //   errors.push('Debe incluir al menos una opción en el combo');
    // }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Valida una opción de combo
   */
  validateComboOption(optionData: ComboOptionItemDto): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!optionData.groupCode) {
      errors.push('El código del grupo es requerido');
    }

    if (!optionData.itemCode) {
      errors.push('El código del producto opción es requerido');
    }

    if (!optionData.isDefault || (optionData.isDefault !== 'Y' && optionData.isDefault !== 'N')) {
      errors.push('isDefault debe ser Y o N');
    }

    if (optionData.priceDiff === undefined || optionData.priceDiff === null) {
      errors.push('priceDiff es requerido (puede ser 0)');
    }

    if (optionData.upLevel === undefined || optionData.upLevel < 0) {
      errors.push('upLevel debe ser >= 0');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Calcula el precio final de un combo con las opciones seleccionadas
   */
  calculateComboPrice(basePrice: number, selectedOptions: ComboOptionResponseDto[]): number {
    if (!selectedOptions || selectedOptions.length === 0) {
      return basePrice;
    }

    const totalDelta = selectedOptions.reduce((total, option) => {
      return total + (option.priceDiff || 0);
    }, 0);

    return basePrice + totalDelta;
  }

  /**
   * Obtiene los grupos únicos de opciones de un combo
   */
  getComboGroups(comboOptions: ComboOptionResponseDto[]): string[] {
    if (!comboOptions || comboOptions.length === 0) {
      return [];
    }

    const groups = new Set(comboOptions.map(option => option.groupCode));
    return Array.from(groups);
  }

  /**
   * Obtiene las opciones por defecto de un combo
   */
  getDefaultOptions(comboOptions: ComboOptionResponseDto[]): ComboOptionResponseDto[] {
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

  // ===== MÉTODOS DEPRECADOS (para compatibilidad temporal) =====

  /**
   * @deprecated Use createCombo() instead
   * Este método ya no se usa con la nueva API
   */
  createComboProduct(comboData: any): Observable<any> {
    console.warn('⚠️ createComboProduct() is DEPRECATED. Use createCombo() instead.');

    // Convertir al nuevo formato y crear combo con opciones vacías
    const newComboData: ComboCreateDto = {
      itemCode: comboData.itemCode,
      itemName: comboData.itemName,
      description: comboData.description,
      price: comboData.price,
      imageUrl: comboData.imageUrl,
      frgnName: comboData.frgnName,
      discount: comboData.discount,
      frgnDescription: comboData.frgnDescription,
      groupItemCode: comboData.groupItemCode, // Corregido: era groupCode
      categoryItemCode: comboData.categoryItemCode,
      waitingTime: comboData.waitingTime,
      rating: comboData.rating,
      eanCode: comboData.eanCode,
      options: [] // Sin opciones por ahora
    };

    return this.createCombo(newComboData);
  }

  /**
   * @deprecated Use deleteCombo() instead
   */
  deleteComboProduct(comboCode: string): Observable<boolean> {
    console.warn('⚠️ deleteComboProduct() is DEPRECATED. Use deleteCombo() instead.');
    return this.deleteCombo(comboCode);
  }
}
