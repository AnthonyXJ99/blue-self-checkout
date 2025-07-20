import { Injectable } from "@angular/core";
import { ApiService } from "../../core/services/api.service";
import { ProductGroup, ProductGroupCreateRequest, ProductGroupFilterParams, ProductGroupPagedResponse, ProductGroupUpdateRequest } from "../products/product-group/model/product-group.model";
import { Observable } from "rxjs";

/**
 * Servicio para gestión de grupos de productos
 */
@Injectable({
    providedIn: 'root'
  })
  export class ProductGroupsService {
  
    private readonly endpoint = 'api/ProductGroups';
  
    constructor(private apiService: ApiService) {}
  
    /**
     * Obtiene todos los grupos de productos sin paginación
     * GET /api/ProductGroups/all
     */
    getAllProductGroups(): Observable<ProductGroup[]> {
      return this.apiService.get<ProductGroup[]>(`${this.endpoint}/all`);
    }
  
    /**
     * Obtiene grupos de productos con paginación y filtros
     * GET /api/ProductGroups
     */
    getProductGroups(params?: ProductGroupFilterParams): Observable<ProductGroupPagedResponse> {
      return this.apiService.getPaginated<ProductGroup>(`${this.endpoint}`, params);
    }
  
    /**
     * Obtiene un grupo de productos específico por código
     * GET /api/ProductGroups/{groupCode}
     */
    getProductGroupByCode(groupCode: string): Observable<ProductGroup> {
      return this.apiService.get<ProductGroup>(`${this.endpoint}/${groupCode}`);
    }
  
    /**
     * Crea un nuevo grupo de productos
     * POST /api/ProductGroups
     */
    createProductGroup(groupData: ProductGroupCreateRequest): Observable<ProductGroup> {
      return this.apiService.post<ProductGroup>(`${this.endpoint}`, groupData);
    }
  
    /**
     * Actualiza un grupo de productos existente
     * PUT /api/ProductGroups/{groupCode}
     */
    updateProductGroup(groupCode: string, groupData: ProductGroupUpdateRequest): Observable<void> {
      return this.apiService.put<void>(`${this.endpoint}/${groupCode}`, groupData);
    }
  
    /**
     * Elimina un grupo de productos existente
     * DELETE /api/ProductGroups/{groupCode}
     */
    deleteProductGroup(groupCode: string): Observable<void> {
      return this.apiService.delete<void>(`${this.endpoint}/${groupCode}`);
    }
  
    // === MÉTODOS DE UTILIDAD ===
  
    /**
     * Valida si un estado es válido
     */
    isValidEnabledStatus(status: string): boolean {
      return ['Y', 'N'].includes(status.toUpperCase());
    }
  
    /**
     * Obtiene solo los grupos habilitados
     */
    getEnabledProductGroups(): Observable<ProductGroup[]> {
      return this.apiService.get<ProductGroup[]>(`${this.endpoint}/all`);
      // Nota: El filtrado se puede hacer en el cliente o agregar endpoint específico en la API
    }
  
    /**
     * Busca grupos por término de búsqueda
     */
    searchProductGroups(searchTerm: string, pageNumber: number = 1, pageSize: number = 10): Observable<ProductGroupPagedResponse> {
      const params: ProductGroupFilterParams = {
        search: searchTerm,
        pageNumber,
        pageSize
      };
      return this.getProductGroups(params);
    }
  
    /**
     * Valida los datos del grupo antes de crear/actualizar
     */
    validateProductGroupData(group: Partial<ProductGroupCreateRequest>): { isValid: boolean; errors: string[] } {
      const errors: string[] = [];
  
      // Validar código del grupo
      if (!group.productGroupCode?.trim()) {
        errors.push('El código del grupo es requerido');
      } else if (group.productGroupCode.length > 50) {
        errors.push('El código del grupo no puede exceder 50 caracteres');
      }
  
      // Validar nombre del grupo
      if (!group.productGroupName?.trim()) {
        errors.push('El nombre del grupo es requerido');
      } else if (group.productGroupName.length > 150) {
        errors.push('El nombre del grupo no puede exceder 150 caracteres');
      }
  
      // Validar nombre extranjero (opcional)
      if (group.frgnName && group.frgnName.length > 150) {
        errors.push('El nombre extranjero no puede exceder 150 caracteres');
      }
  
      // Validar URL de imagen (opcional)
      if (group.imageUrl && group.imageUrl.length > 255) {
        errors.push('La URL de imagen no puede exceder 255 caracteres');
      }
  
      // Validar descripción (opcional)
      if (group.description && group.description.length > 255) {
        errors.push('La descripción no puede exceder 255 caracteres');
      }
  
      // Validar descripción extranjera (opcional)
      if (group.frgnDescription && group.frgnDescription.length > 255) {
        errors.push('La descripción extranjera no puede exceder 255 caracteres');
      }
  
      // Validar estado habilitado
      if (!group.enabled?.trim()) {
        errors.push('El estado habilitado es requerido');
      } else if (!this.isValidEnabledStatus(group.enabled)) {
        errors.push('El estado debe ser Y (habilitado) o N (deshabilitado)');
      }
  
      // Validar orden de visualización
      if (group.visOrder === undefined || group.visOrder === null) {
        errors.push('El orden de visualización es requerido');
      } else if (group.visOrder < 0) {
        errors.push('El orden de visualización debe ser un número positivo');
      }
  
      // Validar fuente de datos
      if (!group.dataSource?.trim()) {
        errors.push('La fuente de datos es requerida');
      } else if (group.dataSource.length > 1) {
        errors.push('La fuente de datos debe ser un solo carácter');
      }
  
      // Validar códigos ERP y POS (opcionales)
      if (group.productGroupCodeERP && group.productGroupCodeERP.length > 50) {
        errors.push('El código ERP no puede exceder 50 caracteres');
      }
  
      if (group.productGroupCodePOS && group.productGroupCodePOS.length > 50) {
        errors.push('El código POS no puede exceder 50 caracteres');
      }
  
      return {
        isValid: errors.length === 0,
        errors
      };
    }
  
    /**
     * Convierte el estado de texto a booleano para UI
     */
    isProductGroupEnabled(group: ProductGroup): boolean {
      return group.enabled?.toUpperCase() === 'Y';
    }
  
    /**
     * Convierte booleano a texto para API
     */
    booleanToEnabledStatus(enabled: boolean): string {
      return enabled ? 'Y' : 'N';
    }
  
    /**
     * Obtiene el label del estado para mostrar en UI
     */
    getEnabledLabel(group: ProductGroup): string {
      return this.isProductGroupEnabled(group) ? 'Habilitado' : 'Deshabilitado';
    }
  
    /**
     * Obtiene la severidad del estado para PrimeNG
     */
    getEnabledSeverity(group: ProductGroup): 'success' | 'danger' {
      return this.isProductGroupEnabled(group) ? 'success' : 'danger';
    }
  
    /**
     * Crea un objeto ProductGroup por defecto para nuevos registros
     */
    createDefaultProductGroup(): ProductGroupCreateRequest {
      return {
        productGroupCode: '',
        productGroupName: '',
        frgnName: '',
        imageUrl: '',
        description: '',
        frgnDescription: '',
        enabled: 'Y',
        visOrder: 1,
        dataSource: 'M', // Manual
        productGroupCodeERP: '',
        productGroupCodePOS: ''
      };
    }
  
    /**
     * Obtiene el siguiente orden de visualización disponible
     */
    getNextVisOrder(groups: ProductGroup[]): number {
      if (groups.length === 0) return 1;
      const maxOrder = Math.max(...groups.map(g => g.visOrder));
      return maxOrder + 1;
    }
  
    /**
     * Ordena grupos por orden de visualización
     */
    sortByVisOrder(groups: ProductGroup[]): ProductGroup[] {
      return [...groups].sort((a, b) => a.visOrder - b.visOrder);
    }
  
    /**
     * Exporta grupos de productos a CSV
     */
    exportProductGroupsToCSV(groups: ProductGroup[]): string {
      const headers = ['Código', 'Nombre', 'Nombre Extranjero', 'Descripción', 'Estado', 'Orden', 'Fuente', 'Código ERP', 'Código POS'];
      const csvData = groups.map(group => [
        group.productGroupCode,
        group.productGroupName,
        group.frgnName || '',
        group.description || '',
        this.getEnabledLabel(group),
        group.visOrder.toString(),
        group.dataSource,
        group.productGroupCodeERP || '',
        group.productGroupCodePOS || ''
      ]);
  
      const csvContent = [headers, ...csvData]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');
  
      return csvContent;
    }
  
    /**
     * Obtiene estadísticas de grupos de productos
     */
    getProductGroupStats(groups: ProductGroup[]): {
      total: number;
      enabled: number;
      disabled: number;
      enabledPercentage: number;
      averageVisOrder: number;
    } {
      const total = groups.length;
      const enabled = groups.filter(g => g.enabled === 'Y').length;
      const disabled = total - enabled;
      const enabledPercentage = total > 0 ? (enabled / total) * 100 : 0;
      const averageVisOrder = total > 0 ? groups.reduce((sum, g) => sum + g.visOrder, 0) / total : 0;
  
      return {
        total,
        enabled,
        disabled,
        enabledPercentage: Math.round(enabledPercentage),
        averageVisOrder: Math.round(averageVisOrder)
      };
    }
  }