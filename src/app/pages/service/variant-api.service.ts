import { Injectable } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { API_CONFIG } from '../../core/config/api.config';
import {
  Variant,
  VariantCreateDto,
  VariantUpdateDto,
  VariantBulkCreateDto,
  VariantBulkCreateResponse
} from '../products/variants/model/variant.model';

/**
 * Servicio API para gestión de Variantes de Productos
 * Basado en API_DOCUMENTATION.md - Endpoints /api/Products/{productCode}/Variants
 */
@Injectable({
  providedIn: 'root'
})
export class VariantApiService {

  constructor(private apiService: ApiService) {}

  // ============================================
  // OPERACIONES CRUD DE VARIANTES
  // ============================================

  /**
   * Obtiene todas las variantes de un producto
   * GET /api/Products/{productCode}/Variants
   */
  getVariantsByProduct(productCode: string): Observable<Variant[]> {
    const endpoint = `${API_CONFIG.ENDPOINTS.PRODUCTS}/${productCode}/Variants`;
    return this.apiService.get<Variant[]>(endpoint).pipe(
      catchError(error => {
        console.error(`Error getting variants for product ${productCode}:`, error);
        return of([]);
      })
    );
  }

  /**
   * Crea una nueva variante para un producto
   * POST /api/Products/{productCode}/Variants
   */
  createVariant(productCode: string, variantData: VariantCreateDto): Observable<Variant | null> {
    const endpoint = `${API_CONFIG.ENDPOINTS.PRODUCTS}/${productCode}/Variants`;

    console.log('🎨 Creating variant for product:', productCode);
    console.log('📦 Variant data:', variantData);

    return this.apiService.post<Variant>(endpoint, variantData).pipe(
      catchError(error => {
        console.error(`Error creating variant for product ${productCode}:`, error);
        return of(null);
      })
    );
  }

  /**
   * Crea múltiples variantes en una sola operación (bulk)
   * POST /api/Products/{productCode}/Variants/bulk
   */
  createVariantsBulk(productCode: string, bulkData: VariantBulkCreateDto): Observable<VariantBulkCreateResponse | null> {
    const endpoint = `${API_CONFIG.ENDPOINTS.PRODUCTS}/${productCode}/Variants/bulk`;

    console.log('🚀 Creating variants in bulk for product:', productCode);
    console.log('📦 Variants count:', bulkData.variants.length);

    return this.apiService.post<VariantBulkCreateResponse>(endpoint, bulkData).pipe(
      catchError(error => {
        console.error(`Error creating variants in bulk for product ${productCode}:`, error);
        return of(null);
      })
    );
  }

  /**
   * Actualiza una variante existente
   * PUT /api/Products/{productCode}/Variants/{variantId}
   */
  updateVariant(productCode: string, variantId: number, updateData: VariantUpdateDto): Observable<Variant | null> {
    const endpoint = `${API_CONFIG.ENDPOINTS.PRODUCTS}/${productCode}/Variants/${variantId}`;

    console.log('✏️ Updating variant:', variantId, 'for product:', productCode);
    console.log('📦 Update data:', updateData);

    return this.apiService.put<Variant>(endpoint, updateData).pipe(
      catchError(error => {
        console.error(`Error updating variant ${variantId} for product ${productCode}:`, error);
        return of(null);
      })
    );
  }

  /**
   * Elimina una variante
   * DELETE /api/Products/{productCode}/Variants/{variantId}
   */
  deleteVariant(productCode: string, variantId: number): Observable<boolean> {
    const endpoint = `${API_CONFIG.ENDPOINTS.PRODUCTS}/${productCode}/Variants/${variantId}`;

    console.log('🗑️ Deleting variant:', variantId, 'for product:', productCode);

    return this.apiService.delete<void>(endpoint).pipe(
      map(() => true),
      catchError(error => {
        console.error(`Error deleting variant ${variantId} for product ${productCode}:`, error);
        return of(false);
      })
    );
  }

  // ============================================
  // MÉTODOS DE VALIDACIÓN
  // ============================================

  /**
   * Valida los datos de una variante antes de crear/actualizar
   */
  validateVariantData(data: Partial<VariantCreateDto>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validar nombre de variante
    if (!data.variantName?.trim()) {
      errors.push('El nombre de la variante es requerido');
    } else if (data.variantName.length > 150) {
      errors.push('El nombre no puede exceder 150 caracteres');
    }

    // Validar nombre de marca
    if (!data.brandName?.trim()) {
      errors.push('El nombre de la marca es requerido');
    } else if (data.brandName.length > 100) {
      errors.push('El nombre de la marca no puede exceder 100 caracteres');
    }

    // Validar ajuste de precio
    if (data.priceAdjustment === undefined || data.priceAdjustment === null) {
      errors.push('El ajuste de precio es requerido (puede ser 0)');
    }

    // Validar estado disponible
    if (!data.available?.trim()) {
      errors.push('El estado disponible es requerido');
    } else if (!this.isValidYNStatus(data.available)) {
      errors.push('El estado disponible debe ser Y o N');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Valida si un estado Y/N es válido
   */
  isValidYNStatus(status: string): boolean {
    return ['Y', 'N'].includes(status.toUpperCase());
  }

  // ============================================
  // MÉTODOS DE UTILIDAD
  // ============================================

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
  getAvailableLabel(value: string): string {
    return this.ynToBoolean(value) ? 'Disponible' : 'No Disponible';
  }

  /**
   * Obtiene la severidad del estado para PrimeNG
   */
  getAvailableSeverity(value: string): 'success' | 'danger' {
    return this.ynToBoolean(value) ? 'success' : 'danger';
  }

  /**
   * Calcula el precio final de una variante
   */
  calculateFinalPrice(basePrice: number, priceAdjustment: number): number {
    return basePrice + priceAdjustment;
  }

  /**
   * Formatea el precio para mostrar
   */
  formatPrice(price: number): string {
    return `$${price.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  }

  /**
   * Formatea el ajuste de precio para mostrar (con + o -)
   */
  formatPriceAdjustment(adjustment: number): string {
    const sign = adjustment >= 0 ? '+' : '';
    return `${sign}${this.formatPrice(adjustment)}`;
  }

  /**
   * Obtiene la severidad del ajuste de precio para UI
   */
  getPriceAdjustmentSeverity(adjustment: number): 'success' | 'danger' | 'secondary' {
    if (adjustment > 0) return 'danger';  // Más caro = rojo
    if (adjustment < 0) return 'success'; // Más barato = verde
    return 'secondary';                    // Sin cambio = gris
  }

  /**
   * Crea un objeto VariantCreateDto por defecto
   */
  createDefaultVariant(): VariantCreateDto {
    return {
      variantName: '',
      brandName: '',
      sizeCode: undefined,
      colorCode: undefined,
      priceAdjustment: 0,
      available: 'Y'
    };
  }

  /**
   * Agrupa variantes por marca
   */
  groupVariantsByBrand(variants: Variant[]): { [brand: string]: Variant[] } {
    return variants.reduce((groups, variant) => {
      const brand = variant.brandName || 'Sin marca';
      if (!groups[brand]) {
        groups[brand] = [];
      }
      groups[brand].push(variant);
      return groups;
    }, {} as { [brand: string]: Variant[] });
  }

  /**
   * Obtiene estadísticas de variantes
   */
  getVariantStats(variants: Variant[]): {
    total: number;
    available: number;
    unavailable: number;
    averagePriceAdjustment: number;
    maxPriceAdjustment: number;
    minPriceAdjustment: number;
    brands: string[];
  } {
    const total = variants.length;
    const available = variants.filter(v => this.ynToBoolean(v.available)).length;
    const unavailable = total - available;

    const adjustments = variants.map(v => v.priceAdjustment);
    const averagePriceAdjustment = adjustments.length > 0
      ? adjustments.reduce((sum, adj) => sum + adj, 0) / adjustments.length
      : 0;
    const maxPriceAdjustment = adjustments.length > 0 ? Math.max(...adjustments) : 0;
    const minPriceAdjustment = adjustments.length > 0 ? Math.min(...adjustments) : 0;

    const brands = [...new Set(variants.map(v => v.brandName))];

    return {
      total,
      available,
      unavailable,
      averagePriceAdjustment,
      maxPriceAdjustment,
      minPriceAdjustment,
      brands
    };
  }
}
