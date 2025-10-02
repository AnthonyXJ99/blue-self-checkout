import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { TagModule } from 'primeng/tag';
import { ChipModule } from 'primeng/chip';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { DropdownModule } from 'primeng/dropdown';
import { ConfirmationService, MessageService } from 'primeng/api';
import { finalize } from 'rxjs';

import { Product } from '../product/model/product.model';
import { Variant, VariantCreateDto, VariantSlot } from './model/variant.model';
import { Size } from './model/size.model';
import { VariantApiService } from '../../service/variant-api.service';
import { SizeApiService } from '../../service/size-api.service';
import { ProductRepository } from '../product/repositories/product.repository';

@Component({
  selector: 'app-variants',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TableModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    CheckboxModule,
    TagModule,
    ChipModule,
    ToastModule,
    ToolbarModule,
    ConfirmDialogModule,
    IconFieldModule,
    InputIconModule,
    DropdownModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './variants.component.html',
  styleUrl: './variants.component.css'
})
export class VariantsComponent implements OnInit {

  // Lista de productos con variantes
  productsWithVariants = signal<Product[]>([]);
  selectedProduct = signal<Product | null>(null);

  // Variantes del producto seleccionado
  variants = signal<Variant[]>([]);

  // Tamaños disponibles (OSZC)
  availableSizes = signal<Size[]>([]);

  // Diálogos
  productSelectionDialog = signal(false);
  variantDialog = signal(false);

  // Slots para crear múltiples variantes
  variantSlots = signal<VariantSlot[]>([]);

  // Estado
  loading = signal(false);
  submitted = signal(false);

  constructor(
    private variantApiService: VariantApiService,
    private sizeApiService: SizeApiService,
    private productRepository: ProductRepository,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.loadProductsWithVariants();
    this.loadAvailableSizes();
  }

  // ============================================
  // CARGA DE DATOS
  // ============================================

  /**
   * Carga los tamaños disponibles desde OSZC
   */
  loadAvailableSizes() {
    this.sizeApiService.getAllSizes().subscribe({
      next: (sizes) => {
        this.availableSizes.set(sizes);
        console.log('Available sizes loaded:', sizes.length);
      },
      error: (error) => {
        console.error('Error loading sizes:', error);
        this.messageService.add({
          severity: 'warn',
          summary: 'Advertencia',
          detail: 'No se pudieron cargar los tamaños. Se usarán valores por defecto.',
          life: 3000
        });
      }
    });
  }

  /**
   * Carga productos que tienen variantes habilitadas
   */
  loadProductsWithVariants() {
    this.loading.set(true);
    this.productRepository.getAllProducts()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (products) => {
          // Filtrar solo productos con u_HasVariants = 'Y'
          const filtered = products.filter(p => p.u_HasVariants === 'Y');
          this.productsWithVariants.set(filtered);
          console.log('Products with variants loaded:', filtered.length);
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

  /**
   * Carga las variantes de un producto
   */
  loadVariants(productCode: string) {
    this.loading.set(true);
    this.variantApiService.getVariantsByProduct(productCode)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (variants) => {
          this.variants.set(variants);
          console.log('Variants loaded:', variants.length);
        },
        error: (error) => {
          console.error('Error loading variants:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar las variantes',
            life: 5000
          });
        }
      });
  }

  // ============================================
  // GESTIÓN DE PRODUCTOS
  // ============================================

  /**
   * Abre el diálogo para seleccionar producto
   */
  openProductSelection() {
    this.productSelectionDialog.set(true);
  }

  /**
   * Selecciona un producto y carga sus variantes
   */
  selectProduct(product: Product) {
    this.selectedProduct.set(product);
    this.productSelectionDialog.set(false);
    this.loadVariants(product.itemCode);
    this.variantDialog.set(true);
  }

  /**
   * Cierra el diálogo de selección de producto
   */
  hideProductSelectionDialog() {
    this.productSelectionDialog.set(false);
  }

  /**
   * Cierra el diálogo de variantes
   */
  hideVariantDialog() {
    this.variantDialog.set(false);
    this.variantSlots.set([]);
    this.selectedProduct.set(null);
    this.variants.set([]);
  }

  // ============================================
  // GESTIÓN DE VARIANTES
  // ============================================

  /**
   * Agrega un nuevo slot para crear variante
   */
  addVariantSlot() {
    const newSlot: VariantSlot = {
      variantName: '',
      brandName: '',
      sizeCode: undefined,
      colorCode: undefined,
      priceAdjustment: 0,
      available: 'Y',
      sizeName: undefined,
      colorName: undefined
    };

    const currentSlots = this.variantSlots();
    this.variantSlots.set([...currentSlots, newSlot]);
  }

  /**
   * Elimina un slot de variante
   */
  removeVariantSlot(index: number) {
    const currentSlots = this.variantSlots();
    currentSlots.splice(index, 1);
    this.variantSlots.set([...currentSlots]);
  }

  /**
   * Guarda todas las variantes (slots)
   */
  saveAllVariants() {
    this.submitted.set(true);
    const product = this.selectedProduct();

    if (!product) {
      return;
    }

    const slots = this.variantSlots();

    if (slots.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Debe agregar al menos una variante',
        life: 3000
      });
      return;
    }

    // Validar todos los slots
    const invalidSlots = slots.filter(slot => {
      const validation = this.variantApiService.validateVariantData(slot);
      return !validation.isValid;
    });

    if (invalidSlots.length > 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error de Validación',
        detail: 'Hay variantes con datos inválidos',
        life: 5000
      });
      return;
    }

    this.loading.set(true);

    // Convertir slots a VariantCreateDto
    const variants: VariantCreateDto[] = slots.map(slot => ({
      variantName: slot.variantName,
      brandName: slot.brandName,
      sizeCode: slot.sizeCode,
      colorCode: slot.colorCode,
      priceAdjustment: slot.priceAdjustment,
      available: slot.available
    }));

    // Crear variantes en bulk
    this.variantApiService.createVariantsBulk(product.itemCode, { variants })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          if (response) {
            const successCount = response.created.length;
            const errorCount = response.errors.length;

            if (successCount > 0) {
              this.messageService.add({
                severity: 'success',
                summary: 'Exitoso',
                detail: `${successCount} variante(s) creada(s)`,
                life: 3000
              });
            }

            if (errorCount > 0) {
              this.messageService.add({
                severity: 'warn',
                summary: 'Advertencia',
                detail: `${errorCount} variante(s) con error`,
                life: 5000
              });
            }

            // Limpiar slots y recargar variantes
            this.variantSlots.set([]);
            this.loadVariants(product.itemCode);
          }
        },
        error: (error) => {
          console.error('Error creating variants:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al crear las variantes',
            life: 5000
          });
        }
      });
  }

  /**
   * Elimina una variante
   */
  deleteVariant(variant: Variant) {
    const product = this.selectedProduct();
    if (!product) return;

    this.confirmationService.confirm({
      message: `¿Está seguro de que desea eliminar la variante "${variant.variantName}"?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.loading.set(true);
        this.variantApiService.deleteVariant(product.itemCode, variant.variantID)
          .pipe(finalize(() => this.loading.set(false)))
          .subscribe({
            next: (success) => {
              if (success) {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Exitoso',
                  detail: 'Variante eliminada',
                  life: 3000
                });
                this.loadVariants(product.itemCode);
              } else {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'No se pudo eliminar la variante',
                  life: 5000
                });
              }
            },
            error: (error) => {
              console.error('Error deleting variant:', error);
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al eliminar la variante',
                life: 5000
              });
            }
          });
      }
    });
  }

  // ============================================
  // MÉTODOS DE UTILIDAD
  // ============================================

  /**
   * Valida si todos los slots tienen datos válidos
   */
  hasValidSlots(): boolean {
    const slots = this.variantSlots();
    return slots.every(slot => {
      const validation = this.variantApiService.validateVariantData(slot);
      return validation.isValid;
    });
  }

  /**
   * Formatea el precio
   */
  formatPrice(price: number): string {
    return this.variantApiService.formatPrice(price);
  }

  /**
   * Formatea el ajuste de precio
   */
  formatPriceAdjustment(adjustment: number): string {
    return this.variantApiService.formatPriceAdjustment(adjustment);
  }

  /**
   * Obtiene la severidad del ajuste de precio
   */
  getPriceAdjustmentSeverity(adjustment: number): 'success' | 'danger' | 'secondary' {
    return this.variantApiService.getPriceAdjustmentSeverity(adjustment);
  }

  /**
   * Obtiene el label de disponibilidad
   */
  getAvailableLabel(available: string): string {
    return this.variantApiService.getAvailableLabel(available);
  }

  /**
   * Obtiene la severidad de disponibilidad
   */
  getAvailableSeverity(available: string): 'success' | 'danger' {
    return this.variantApiService.getAvailableSeverity(available);
  }

  /**
   * Obtiene el nombre de un tamaño por su código
   */
  getSizeName(sizeCode: string | undefined): string {
    if (!sizeCode) return '';
    return this.sizeApiService.getSizeName(sizeCode, this.availableSizes());
  }
}
