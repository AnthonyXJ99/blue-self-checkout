import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// PrimeNG imports
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { TagModule } from 'primeng/tag';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';
import { SkeletonModule } from 'primeng/skeleton';
import { DividerModule } from 'primeng/divider';
import { CheckboxModule } from 'primeng/checkbox';

// Services and repositories
import { ComboApiService } from '../../service/combo-api.service';
import { ComboRepository } from './repositories/combo.repository';
import { ProductRepository } from '../product/repositories/product.repository';

// Models
import { ComboProduct, ComboOption, ComboOptionSlot, ComboOptionCreateRequest } from './model/combo.model';
import { Product } from '../product/model/product.model';

// Utilities
import { finalize, firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-combos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ButtonModule,
    InputTextModule,
    TableModule,
    DialogModule,
    ConfirmDialogModule,
    ToastModule,
    ToolbarModule,
    TagModule,
    InputIconModule,
    IconFieldModule,
    SelectModule,
    InputNumberModule,
    CardModule,
    ChipModule,
    SkeletonModule,
    DividerModule,
    CheckboxModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './combos.component.html',
  styleUrl: './combos.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CombosComponent implements OnInit {

  // ===== SIGNALS =====
  combos = signal<ComboProduct[]>([]);
  availableComboProducts = signal<Product[]>([]);
  availableProducts = signal<Product[]>([]);
  selectedCombo = signal<ComboProduct | null>(null);
  comboOptions = signal<ComboOption[]>([]);
  comboOptionSlots = signal<ComboOptionSlot[]>([]);
  loading = signal(false);

  // ===== DIALOG STATES =====
  comboSelectionDialog = false;
  comboDialog = false;
  comboOptionsDialog = false;

  // ===== SEARCH AND FILTERS =====
  comboSearchTerm = signal('');
  expandedRows = signal<Set<string>>(new Set());

  constructor(
    private comboApiService: ComboApiService,
    private comboRepository: ComboRepository,
    private productRepository: ProductRepository,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    console.log('CombosComponent initialized');
    this.loadCombos();
    this.loadAvailableProducts();
    this.loadAvailableComboProducts();
  }

  // ===== LOAD DATA =====

  loadCombos() {
    console.log('Loading combos...');
    this.loading.set(true);

    this.comboRepository.getAllCombos()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (combos) => {
          this.combos.set(combos);
          console.log('✅ Combos loaded:', combos.length);
        },
        error: (error) => {
          console.error('❌ Error loading combos:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar los combos',
            life: 5000
          });
        }
      });
  }

  loadAvailableComboProducts() {
    this.comboRepository.getAvailableComboProducts().subscribe({
      next: (products) => {
        this.availableComboProducts.set(products);
        console.log('✅ Available combo products loaded:', products.length);
      },
      error: (error) => {
        console.error('❌ Error loading combo products:', error);
      }
    });
  }

  loadAvailableProducts() {
    this.comboRepository.getAvailableProductsForOptions().subscribe({
      next: (products) => {
        this.availableProducts.set(products);
        console.log('✅ Available products loaded:', products.length);
      },
      error: (error) => {
        console.error('❌ Error loading available products:', error);
      }
    });
  }

  // ===== COMBO SELECTION =====

  openNew() {
    this.comboSelectionDialog = true;
  }

  selectCombo(combo: Product) {
    console.log('🎯 Selected combo product:', combo.itemCode);

    // Cargar opciones del combo seleccionado
    this.loading.set(true);
    this.comboApiService.getComboOptions(combo.itemCode)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (comboData) => {
          if (comboData) {
            this.selectedCombo.set(comboData as ComboProduct);
            this.comboOptions.set(comboData.comboOptions || []);
            this.comboSelectionDialog = false;
            this.comboOptionsDialog = true;
            console.log('✅ Combo options loaded:', comboData.comboOptions?.length || 0);
          } else {
            // Si no tiene opciones, crear estructura básica
            this.selectedCombo.set({
              ...combo,
              isCombo: 'Y',
              comboOptions: []
            } as ComboProduct);
            this.comboOptions.set([]);
            this.comboSelectionDialog = false;
            this.comboOptionsDialog = true;
          }
        },
        error: (error) => {
          console.error('❌ Error loading combo options:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al cargar las opciones del combo',
            life: 5000
          });
        }
      });
  }

  // ===== COMBO OPTIONS MANAGEMENT =====

  addComboOption() {
    console.log('➕ Adding new combo option slot');
    const newSlot: ComboOptionSlot = {
      groupItemCode: '',
      optionItemCode: '',
      isDefault: 'N',
      priceDelta: 0,
      upgradeLevel: 0,
      upgradeLabel: ''
    };

    // Agregar al inicio del array para que aparezca arriba
    this.comboOptionSlots.update(slots => [newSlot, ...slots]);
  }

  removeComboOptionSlot(index: number) {
    console.log('🗑️ Removing combo option slot:', index);
    this.comboOptionSlots.update(slots => slots.filter((_, i) => i !== index));
  }

  removeComboOption(option: ComboOption) {
    this.confirmationService.confirm({
      message: `¿Está seguro de que desea eliminar la opción ${option.optionItemName}?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteComboOptionFromAPI(option);
      }
    });
  }

  async deleteComboOptionFromAPI(option: ComboOption) {
    try {
      const success = await firstValueFrom(
        this.comboApiService.deleteComboOption(option.itemCode, option.groupItemCode, option.optionItemCode)
      );

      if (success) {
        this.comboOptions.update(options =>
          options.filter(opt =>
            !(opt.groupItemCode === option.groupItemCode && opt.optionItemCode === option.optionItemCode)
          )
        );

        this.messageService.add({
          severity: 'success',
          summary: 'Exitoso',
          detail: 'Opción eliminada correctamente',
          life: 3000
        });
      } else {
        throw new Error('Failed to delete option');
      }
    } catch (error) {
      console.error('❌ Error deleting combo option:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al eliminar la opción',
        life: 5000
      });
    }
  }

  // ===== SAVE OPERATIONS =====

  async saveAllComboOptions() {
    const selectedCombo = this.selectedCombo();
    const slots = this.comboOptionSlots();

    if (!selectedCombo || slots.length === 0) {
      return;
    }

    console.log('💾 Saving combo options for:', selectedCombo.itemCode);
    console.log('📦 Options to save:', slots.length);

    this.loading.set(true);

    try {
      const createRequests: ComboOptionCreateRequest[] = slots.map(slot => ({
        groupItemCode: slot.groupItemCode,
        optionItemCode: slot.optionItemCode,
        isDefault: slot.isDefault,
        priceDelta: slot.priceDelta,
        upgradeLevel: slot.upgradeLevel,
        upgradeLabel: slot.upgradeLabel || ''
      }));

      console.log('🚀 Creating combo options:', createRequests);

      const results = await firstValueFrom(
        this.comboApiService.createMultipleComboOptions(selectedCombo.itemCode, createRequests)
      );

      const successCount = results.filter(result => result !== null).length;
      const errorCount = results.filter(result => result === null).length;

      if (successCount > 0) {
        this.messageService.add({
          severity: 'success',
          summary: 'Exitoso',
          detail: `${successCount} opción(es) de combo guardada(s)`,
          life: 3000
        });

        // Limpiar slots y recargar opciones
        this.comboOptionSlots.set([]);
        this.reloadComboOptions();
      }

      if (errorCount > 0) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Advertencia',
          detail: `${errorCount} opción(es) no pudieron guardarse`,
          life: 5000
        });
      }

    } catch (error) {
      console.error('❌ Error saving combo options:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al guardar las opciones del combo',
        life: 5000
      });
    } finally {
      this.loading.set(false);
    }
  }

  reloadComboOptions() {
    const selectedCombo = this.selectedCombo();
    if (!selectedCombo) return;

    this.comboApiService.getComboOptions(selectedCombo.itemCode).subscribe({
      next: (comboData) => {
        if (comboData && comboData.comboOptions) {
          this.comboOptions.set(comboData.comboOptions);
          console.log('🔄 Combo options reloaded:', comboData.comboOptions.length);
        }
      },
      error: (error) => {
        console.error('❌ Error reloading combo options:', error);
      }
    });
  }

  // ===== UI HELPERS =====

  getProductOptionsForSlot(slotIndex: number): { label: string; value: string }[] {
    const usedProducts = this.comboOptionSlots()
      .filter((_, index) => index !== slotIndex)
      .map(slot => slot.optionItemCode)
      .filter(code => code);

    const existingOptions = this.comboOptions().map(option => option.optionItemCode);
    const allUsed = [...usedProducts, ...existingOptions];

    return this.availableProducts()
      .filter(product => !allUsed.includes(product.itemCode))
      .map(product => ({
        label: `${product.itemName} - ${this.formatPrice(product.price)}`,
        value: product.itemCode
      }));
  }

  getGroupOptions(): { label: string; value: string }[] {
    return [
      { label: 'DRINKS - Bebidas', value: 'DRINKS' },
      { label: 'FRIES - Papas', value: 'FRIES' },
      { label: 'SIDES - Acompañamientos', value: 'SIDES' },
      { label: 'DESSERTS - Postres', value: 'DESSERTS' },
      { label: 'SAUCES - Salsas', value: 'SAUCES' }
    ];
  }

  getProductByCode(itemCode: string): Product | undefined {
    return this.availableProducts().find(product => product.itemCode === itemCode);
  }

  getFilteredComboProducts(): Product[] {
    const searchTerm = this.comboSearchTerm().toLowerCase();
    if (!searchTerm) {
      return this.availableComboProducts();
    }

    return this.availableComboProducts().filter(combo =>
      combo.itemCode.toLowerCase().includes(searchTerm) ||
      combo.itemName.toLowerCase().includes(searchTerm)
    );
  }

  hasValidSlots(): boolean {
    return this.comboOptionSlots().every(slot =>
      slot.groupItemCode &&
      slot.optionItemCode &&
      slot.upgradeLevel >= 0
    );
  }

  // ===== DIALOG MANAGEMENT =====

  hideComboSelectionDialog() {
    this.comboSelectionDialog = false;
    this.comboSearchTerm.set('');
  }

  hideComboDialog() {
    this.comboDialog = false;
    this.selectedCombo.set(null);
  }

  hideComboOptionsDialog() {
    this.comboOptionsDialog = false;
    this.selectedCombo.set(null);
    this.comboOptions.set([]);
    this.comboOptionSlots.set([]);
  }

  // ===== TABLE HELPERS =====

  toggleRow(comboCode: string) {
    this.expandedRows.update(expanded => {
      const newExpanded = new Set(expanded);
      if (newExpanded.has(comboCode)) {
        newExpanded.delete(comboCode);
      } else {
        newExpanded.add(comboCode);
      }
      return newExpanded;
    });
  }

  isRowExpanded(comboCode: string): boolean {
    return this.expandedRows().has(comboCode);
  }

  // ===== UTILITIES =====

  getGroupedOptions(options: ComboOption[]): { name: string; options: ComboOption[] }[] {
    const groupMap = new Map<string, ComboOption[]>();

    // Group options by groupItemCode
    options.forEach(option => {
      if (!groupMap.has(option.groupItemCode)) {
        groupMap.set(option.groupItemCode, []);
      }
      groupMap.get(option.groupItemCode)!.push(option);
    });

    // Convert to array and sort
    return Array.from(groupMap.entries()).map(([groupCode, groupOptions]) => ({
      name: groupCode,
      options: groupOptions.sort((a, b) => a.upgradeLevel - b.upgradeLevel)
    })).sort((a, b) => a.name.localeCompare(b.name));
  }

  formatPrice(price: number): string {
    return this.comboRepository.formatPrice(price);
  }

  getUpgradeLevelLabel(level: number): string {
    return this.comboRepository.getUpgradeLevelLabel(level);
  }

  getUpgradeLevelSeverity(level: number): 'success' | 'info' | 'warning' | 'danger' {
    return this.comboRepository.getUpgradeLevelSeverity(level);
  }

  exportCSV() {
    console.log('📊 Exporting combos to CSV');
    // TODO: Implementar exportación CSV
    this.messageService.add({
      severity: 'info',
      summary: 'Info',
      detail: 'Exportación CSV - Por implementar',
      life: 3000
    });
  }

  clearFilters() {
    this.comboSearchTerm.set('');
    this.loadCombos();
  }
}