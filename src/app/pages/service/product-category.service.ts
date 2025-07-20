import { Observable } from "rxjs";
import { ProductCategory, ProductCategoryCreateRequest, ProductCategoryFilterParams, ProductCategoryPagedResponse, ProductCategoryUpdateRequest } from "../products/category/model/product-category.model";
import { ApiService } from "../../core/services/api.service";
import { Injectable } from "@angular/core";

/**
 * Servicio para gestión de categorías de productos
 */
@Injectable({
    providedIn: 'root'
  })
  export class ProductCategoriesService {
  
    private readonly endpoint = 'api/ProductCategories';
  
    constructor(private apiService: ApiService) {}
  
    /**
     * Obtiene todas las categorías de productos sin paginación
     * GET /api/ProductCategories/all
     */
    getAllProductCategories(): Observable<ProductCategory[]> {
      return this.apiService.get<ProductCategory[]>(`${this.endpoint}/all`);
    }
  
    /**
     * Obtiene categorías de productos con paginación y filtros
     * GET /api/ProductCategories
     */
    getProductCategories(params?: ProductCategoryFilterParams): Observable<ProductCategoryPagedResponse> {
      return this.apiService.getPaginated<ProductCategory>(`${this.endpoint}`, params);
    }
  
    /**
     * Obtiene una categoría de productos específica por código
     * GET /api/ProductCategories/{categoryCode}
     */
    getProductCategoryByCode(categoryCode: string): Observable<ProductCategory> {
      return this.apiService.get<ProductCategory>(`${this.endpoint}/${categoryCode}`);
    }
  
    /**
     * Obtiene categorías que pertenecen a un grupo específico
     * GET /api/ProductCategories/Groups/{groupCode}
     */
    getCategoriesByGroup(groupCode: string): Observable<ProductCategory[]> {
      return this.apiService.get<ProductCategory[]>(`${this.endpoint}/Groups/${groupCode}`);
    }
  
    /**
     * Crea una nueva categoría de productos
     * POST /api/ProductCategories
     */
    createProductCategory(categoryData: ProductCategoryCreateRequest): Observable<ProductCategory> {
      return this.apiService.post<ProductCategory>(`${this.endpoint}`, categoryData);
    }
  
    /**
     * Actualiza una categoría de productos existente
     * PUT /api/ProductCategories/{categoryCode}
     */
    updateProductCategory(categoryCode: string, categoryData: ProductCategoryUpdateRequest): Observable<void> {
      return this.apiService.put<void>(`${this.endpoint}/${categoryCode}`, categoryData);
    }
  
    /**
     * Elimina una categoría de productos existente
     * DELETE /api/ProductCategories/{categoryCode}
     */
    deleteProductCategory(categoryCode: string): Observable<void> {
      return this.apiService.delete<void>(`${this.endpoint}/${categoryCode}`);
    }
  
    // === MÉTODOS DE UTILIDAD ===
  
    /**
     * Valida si un estado es válido
     */
    isValidEnabledStatus(status: string): boolean {
      return ['Y', 'N'].includes(status.toUpperCase());
    }
  
    /**
     * Obtiene solo las categorías habilitadas
     */
    getEnabledProductCategories(): Observable<ProductCategory[]> {
      return this.apiService.get<ProductCategory[]>(`${this.endpoint}/all`);
      // Nota: El filtrado se puede hacer en el cliente o agregar endpoint específico en la API
    }
  
    /**
     * Busca categorías por término de búsqueda
     */
    searchProductCategories(searchTerm: string, pageNumber: number = 1, pageSize: number = 10): Observable<ProductCategoryPagedResponse> {
      const params: ProductCategoryFilterParams = {
        search: searchTerm,
        pageNumber,
        pageSize
      };
      return this.getProductCategories(params);
    }
  
    /**
     * Busca categorías por grupo y término de búsqueda
     */
    searchCategoriesByGroup(groupCode: string, searchTerm?: string, pageNumber: number = 1, pageSize: number = 10): Observable<ProductCategoryPagedResponse> {
      const params: ProductCategoryFilterParams = {
        groupItemCode: groupCode,
        search: searchTerm,
        pageNumber,
        pageSize
      };
      return this.getProductCategories(params);
    }
  
    /**
     * Valida los datos de la categoría antes de crear/actualizar
     */
    validateProductCategoryData(category: Partial<ProductCategoryCreateRequest>): { isValid: boolean; errors: string[] } {
      const errors: string[] = [];
  
      // Validar código de la categoría
      if (!category.categoryItemCode?.trim()) {
        errors.push('El código de la categoría es requerido');
      } else if (category.categoryItemCode.length > 50) {
        errors.push('El código de la categoría no puede exceder 50 caracteres');
      }
  
      // Validar nombre de la categoría
      if (!category.categoryItemName?.trim()) {
        errors.push('El nombre de la categoría es requerido');
      } else if (category.categoryItemName.length > 150) {
        errors.push('El nombre de la categoría no puede exceder 150 caracteres');
      }
  
      // Validar nombre extranjero (opcional)
      if (category.frgnName && category.frgnName.length > 150) {
        errors.push('El nombre extranjero no puede exceder 150 caracteres');
      }
  
      // Validar URL de imagen (opcional)
      if (category.imageUrl && category.imageUrl.length > 255) {
        errors.push('La URL de imagen no puede exceder 255 caracteres');
      }
  
      // Validar descripción (opcional)
      if (category.description && category.description.length > 255) {
        errors.push('La descripción no puede exceder 255 caracteres');
      }
  
      // Validar descripción extranjera (opcional)
      if (category.frgnDescription && category.frgnDescription.length > 255) {
        errors.push('La descripción extranjera no puede exceder 255 caracteres');
      }
  
      // Validar orden de visualización
      if (category.visOrder === undefined || category.visOrder === null) {
        errors.push('El orden de visualización es requerido');
      } else if (category.visOrder < 0) {
        errors.push('El orden de visualización debe ser un número positivo');
      }
  
      // Validar estado habilitado
      if (!category.enabled?.trim()) {
        errors.push('El estado habilitado es requerido');
      } else if (!this.isValidEnabledStatus(category.enabled)) {
        errors.push('El estado debe ser Y (habilitado) o N (deshabilitado)');
      }
  
      // Validar fuente de datos
      if (!category.dataSource?.trim()) {
        errors.push('La fuente de datos es requerida');
      } else if (category.dataSource.length > 1) {
        errors.push('La fuente de datos debe ser un solo carácter');
      }
  
      // Validar código del grupo (opcional)
      if (category.groupItemCode && category.groupItemCode.length > 50) {
        errors.push('El código del grupo no puede exceder 50 caracteres');
      }
  
      return {
        isValid: errors.length === 0,
        errors
      };
    }
  
    /**
     * Convierte el estado de texto a booleano para UI
     */
    isProductCategoryEnabled(category: ProductCategory): boolean {
      return category.enabled?.toUpperCase() === 'Y';
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
    getEnabledLabel(category: ProductCategory): string {
      return this.isProductCategoryEnabled(category) ? 'Habilitado' : 'Deshabilitado';
    }
  
    /**
     * Obtiene la severidad del estado para PrimeNG
     */
    getEnabledSeverity(category: ProductCategory): 'success' | 'danger' {
      return this.isProductCategoryEnabled(category) ? 'success' : 'danger';
    }
  
    /**
     * Crea un objeto ProductCategory por defecto para nuevos registros
     */
    createDefaultProductCategory(): ProductCategoryCreateRequest {
      return {
        categoryItemCode: '',
        categoryItemName: '',
        frgnName: '',
        imageUrl: '',
        description: '',
        frgnDescription: '',
        visOrder: 1,
        enabled: 'Y',
        dataSource: 'M', // Manual
        groupItemCode: ''
      };
    }
  
    /**
     * Obtiene el siguiente orden de visualización disponible para un grupo
     */
    getNextVisOrderForGroup(categories: ProductCategory[], groupCode?: string): number {
      const categoriesInGroup = groupCode 
        ? categories.filter(c => c.groupItemCode === groupCode)
        : categories;
      
      if (categoriesInGroup.length === 0) return 1;
      const maxOrder = Math.max(...categoriesInGroup.map(c => c.visOrder));
      return maxOrder + 1;
    }
  
    /**
     * Ordena categorías por orden de visualización
     */
    sortByVisOrder(categories: ProductCategory[]): ProductCategory[] {
      return [...categories].sort((a, b) => a.visOrder - b.visOrder);
    }
  
    /**
     * Agrupa categorías por grupo de productos
     */
    groupByProductGroup(categories: ProductCategory[]): { [groupCode: string]: ProductCategory[] } {
      return categories.reduce((groups, category) => {
        const groupCode = category.groupItemCode || 'sin_grupo';
        if (!groups[groupCode]) {
          groups[groupCode] = [];
        }
        groups[groupCode].push(category);
        return groups;
      }, {} as { [groupCode: string]: ProductCategory[] });
    }
  
    /**
     * Exporta categorías de productos a CSV
     */
    exportProductCategoriesToCSV(categories: ProductCategory[]): string {
      const headers = ['Código', 'Nombre', 'Nombre Extranjero', 'Descripción', 'Estado', 'Orden', 'Fuente', 'Grupo'];
      const csvData = categories.map(category => [
        category.categoryItemCode,
        category.categoryItemName,
        category.frgnName || '',
        category.description || '',
        this.getEnabledLabel(category),
        category.visOrder.toString(),
        category.dataSource,
        category.groupItemCode || ''
      ]);
  
      const csvContent = [headers, ...csvData]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');
  
      return csvContent;
    }
  
    /**
     * Obtiene estadísticas de categorías de productos
     */
    getProductCategoryStats(categories: ProductCategory[]): {
      total: number;
      enabled: number;
      disabled: number;
      enabledPercentage: number;
      averageVisOrder: number;
      categoriesPerGroup: { [groupCode: string]: number };
    } {
      const total = categories.length;
      const enabled = categories.filter(c => c.enabled === 'Y').length;
      const disabled = total - enabled;
      const enabledPercentage = total > 0 ? (enabled / total) * 100 : 0;
      const averageVisOrder = total > 0 ? categories.reduce((sum, c) => sum + c.visOrder, 0) / total : 0;
      
      const categoriesPerGroup = categories.reduce((groups, category) => {
        const groupCode = category.groupItemCode || 'sin_grupo';
        groups[groupCode] = (groups[groupCode] || 0) + 1;
        return groups;
      }, {} as { [groupCode: string]: number });
  
      return {
        total,
        enabled,
        disabled,
        enabledPercentage: Math.round(enabledPercentage),
        averageVisOrder: Math.round(averageVisOrder),
        categoriesPerGroup
      };
    }
  
    /**
     * Valida que una categoría pueda ser asignada a un grupo
     */
    canAssignCategoryToGroup(category: ProductCategory, groupCode: string): { canAssign: boolean; reason?: string } {
      if (!groupCode?.trim()) {
        return { canAssign: false, reason: 'El código del grupo es requerido' };
      }
  
      if (category.groupItemCode === groupCode) {
        return { canAssign: false, reason: 'La categoría ya pertenece a este grupo' };
      }
  
      return { canAssign: true };
    }
  }
  