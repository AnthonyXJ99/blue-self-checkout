import { Injectable } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { ComboApiService } from '../../../service/combo-api.service';
import { ProductRepository } from '../../product/repositories/product.repository';
import {
  ComboProduct,
  ComboOption,
  ComboOptionCreateRequest,
  ComboOptionUpdateRequest
} from '../model/combo.model';
import { Product } from '../../product/model/product.model';

/**
 * Repositorio para gestión de combos
 * Encapsula la lógica de negocio y operaciones complejas
 */
@Injectable({
  providedIn: 'root'
})
export class ComboRepository {

  constructor(
    private comboApiService: ComboApiService,
    private productRepository: ProductRepository
  ) {}

  // ===== OPERACIONES CRUD =====

  /**
   * Obtiene todos los combos con sus opciones
   */
  getAllCombos(): Observable<ComboProduct[]> {
    return this.comboApiService.getAllCombos().pipe(
      map(combos => combos || []),
      catchError(error => {
        console.error('Error in ComboRepository.getAllCombos:', error);
        return of([]);
      })
    );
  }

  /**
   * Obtiene un combo específico con sus opciones
   */
  getComboById(comboCode: string): Observable<ComboProduct | null> {
    return this.comboApiService.getComboOptions(comboCode).pipe(
      catchError(error => {
        console.error(`Error getting combo ${comboCode}:`, error);
        return of(null);
      })
    );
  }

  /**
   * Crea un nuevo combo completo (producto + opciones)
   */
  createCombo(comboData: any, options: ComboOptionCreateRequest[]): Observable<ComboProduct | null> {
    console.log('🏗️ ComboRepository.createCombo():');
    console.log('📦 Combo Data:', comboData);
    console.log('🔧 Options:', options);

    return this.comboApiService.createComboProduct(comboData).pipe(
      map(createdCombo => {
        if (!createdCombo) {
          throw new Error('Failed to create combo product');
        }

        // Si hay opciones, crearlas en lote
        if (options && options.length > 0) {
          this.comboApiService.createMultipleComboOptions(createdCombo.itemCode, options).subscribe({
            next: (results) => {
              console.log('✅ Combo options created:', results);
            },
            error: (error) => {
              console.error('❌ Error creating combo options:', error);
            }
          });
        }

        return createdCombo;
      }),
      catchError(error => {
        console.error('Error creating combo:', error);
        return of(null);
      })
    );
  }

  /**
   * Actualiza una opción específica de un combo
   */
  updateComboOption(comboCode: string, groupCode: string, optionCode: string, updateData: ComboOptionUpdateRequest): Observable<boolean> {
    return this.comboApiService.updateComboOption(comboCode, groupCode, optionCode, updateData).pipe(
      map(result => !!result),
      catchError(error => {
        console.error('Error updating combo option:', error);
        return of(false);
      })
    );
  }

  /**
   * Elimina una opción específica de un combo
   */
  deleteComboOption(comboCode: string, groupCode: string, optionCode: string): Observable<boolean> {
    return this.comboApiService.deleteComboOption(comboCode, groupCode, optionCode);
  }

  /**
   * Elimina un combo completo
   */
  deleteCombo(comboCode: string): Observable<boolean> {
    return this.comboApiService.deleteComboProduct(comboCode);
  }

  // ===== OPERACIONES DE NEGOCIO =====

  /**
   * Calcula el precio total de una selección de combo
   */
  calculateComboPrice(basePrice: number, selectedOptions: ComboOption[]): number {
    const optionsPrice = selectedOptions.reduce((total, option) => total + option.priceDelta, 0);
    return basePrice + optionsPrice;
  }

  /**
   * Obtiene productos disponibles para usar como opciones
   */
  getAvailableProductsForOptions(): Observable<Product[]> {
    return this.productRepository.getAllProducts().pipe(
      map(products =>
        products.filter(product =>
          product.sellItem === 'Y' &&
          product.available === 'Y' &&
          product.enabled === 'Y' &&
          product.isCombo !== 'Y' // No incluir otros combos como opciones
        )
      )
    );
  }

  /**
   * Obtiene productos combo disponibles
   */
  getAvailableComboProducts(): Observable<Product[]> {
    return this.productRepository.getAllProducts().pipe(
      map(products =>
        products.filter(product =>
          product.isCombo === 'Y' &&
          product.sellItem === 'Y' &&
          product.available === 'Y' &&
          product.enabled === 'Y'
        )
      )
    );
  }

  // ===== UTILIDADES =====

  /**
   * Formatea el precio
   */
  formatPrice(price: number): string {
    return this.comboApiService.formatPrice(price);
  }

  /**
   * Obtiene el label de un nivel de upgrade
   */
  getUpgradeLevelLabel(level: number): string {
    const labels = ['Básico', 'Premium', 'Deluxe', 'Super'];
    return labels[level] || `Nivel ${level}`;
  }

  /**
   * Obtiene la severidad de un tag según el nivel de upgrade
   */
  getUpgradeLevelSeverity(level: number): 'success' | 'info' | 'warning' | 'danger' {
    switch (level) {
      case 0: return 'success';
      case 1: return 'info';
      case 2: return 'warning';
      default: return 'danger';
    }
  }

  /**
   * Valida datos de combo antes de enviar a la API
   */
  validateComboData(comboData: any): { isValid: boolean; errors: string[] } {
    return this.comboApiService.validateComboProduct(comboData);
  }

  /**
   * Valida datos de opción antes de enviar a la API
   */
  validateOptionData(optionData: any): { isValid: boolean; errors: string[] } {
    return this.comboApiService.validateComboOption(optionData);
  }

  /**
   * Crea un combo por defecto para nuevos registros
   */
  createDefaultCombo(): ComboProduct {
    const baseProduct = this.productRepository.createDefaultProduct();

    return {
      ...baseProduct,
      isCombo: 'Y',
      itemCode: this.generateComboCode(),
      itemName: 'Nuevo Combo',
      comboOptions: []
    } as ComboProduct;
  }

  /**
   * Genera un código único para combos
   */
  generateComboCode(): string {
    const now = new Date();
    const timestamp = now.getFullYear().toString() +
                     (now.getMonth() + 1).toString().padStart(2, '0') +
                     now.getDate().toString().padStart(2, '0') +
                     now.getHours().toString().padStart(2, '0') +
                     now.getMinutes().toString().padStart(2, '0') +
                     now.getSeconds().toString().padStart(2, '0');

    const randomId = Math.random().toString(36).substring(2, 8);
    return `COMBO_${timestamp}_${randomId}`;
  }
}