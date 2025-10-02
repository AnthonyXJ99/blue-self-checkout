import { Injectable } from "@angular/core";
import { Observable, map } from "rxjs";
import { ApiService } from "../../core/services/api.service";
import { API_CONFIG } from "../../core/config/api.config";
import { ApiResponse } from "../../core/model/api-response.model";
import { 
  ProductTree, 
  ProductTreeCreateRequest, 
  ProductTreeUpdateRequest,
  ProductTreePagedResponse,
  ProductTreeFilterParams,
  ProductTreeItem,
  SelectOption,
  EnabledStatus
} from "../products/ingredients/model/product-tree.model";

/**
 * Servicio API para gestión de ProductTrees (Ingredientes/Materiales)
 */
@Injectable({
  providedIn: 'root'
})
export class ProductTreeApiService {
  private readonly endpoint = API_CONFIG.ENDPOINTS.PRODUCT_TREES;

  constructor(private apiService: ApiService) {}

  // ============================================
  // OPERACIONES CRUD BÁSICAS
  // ============================================

  /**
   * Obtiene todos los ProductTrees sin paginación
   * GET /api/producttrees/all
   */
  getAll(): Observable<ProductTree[]> {
    return this.apiService.get<ProductTree[]>(`${this.endpoint}`);
  }

  /**
   * Obtiene ProductTrees con paginación y filtros
   * GET /api/producttrees
   */
  get(params?: ProductTreeFilterParams): Observable<ProductTreePagedResponse> {
    // Convertir params a RequestParams compatible
    const requestParams: any = params ? { ...params } : {};
    
    // Si hay filtro enabled como string, convertirlo apropiadamente para el backend
    if (params?.enabled) {
      // Mantener como string si el backend espera Y/N, o convertir si espera boolean
      requestParams.enabled = params.enabled;
    }
    
    return this.apiService.getPaginated<ProductTree>(this.endpoint, requestParams);
  }

  /**
   * Obtiene un ProductTree específico por código
   * GET /api/producttrees/{itemCode}
   */
  getByItemCode(itemCode: string): Observable<ProductTree> {
    return this.apiService.get<ProductTree>(`${this.endpoint}/${itemCode}`);
  }

  /**
   * Crea un nuevo ProductTree
   * POST /api/producttrees
   */
  create(data: ProductTreeCreateRequest): Observable<ProductTree> {
    return this.apiService.post<ProductTree>(this.endpoint, data);
  }

  /**
   * Actualiza un ProductTree existente
   * PUT /api/producttrees/{itemCode}
   */
  update(itemCode: string, data: ProductTreeUpdateRequest): Observable<void> {
    return this.apiService.put<void>(`${this.endpoint}/${itemCode}`, data);
  }

  /**
   * Elimina un ProductTree
   * DELETE /api/producttrees/{itemCode}
   */
  delete(itemCode: string): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${itemCode}`);
  }

  // ============================================
  // MÉTODOS DE BÚSQUEDA Y FILTRADO
  // ============================================

  /**
   * Busca ProductTrees por término
   */
  search(searchTerm: string, pageNumber: number = 1, pageSize: number = 10): Observable<ProductTreePagedResponse> {
    const params: ProductTreeFilterParams = {
      search: searchTerm,
      pageNumber,
      pageSize
    };
    return this.get(params);
  }

  /**
   * Obtiene ProductTrees habilitados
   */
  getEnabled(): Observable<ProductTree[]> {
    const params: ProductTreeFilterParams = {
      enabled: EnabledStatus.YES
    };
    return this.get(params).pipe(
      map((response) => response.data)
    );
  }

  /**
   * Obtiene ProductTrees por fuente de datos
   */
  getByDataSource(dataSource: string): Observable<ProductTree[]> {
    const params: ProductTreeFilterParams = {
      dataSource
    };
    return this.get(params).pipe(
      map((response) => response.data)
    );
  }

  /**
   * Obtiene ProductTrees por rango de cantidad
   */
  getByQuantityRange(minQuantity: number, maxQuantity: number): Observable<ProductTreePagedResponse> {
    const params: ProductTreeFilterParams = {
      minQuantity,
      maxQuantity
    };
    return this.get(params);
  }

  // ============================================
  // MÉTODOS DE UTILIDAD
  // ============================================

  /**
   * Valida si un estado Y/N es válido
   */
  isValidYNStatus(status: string): boolean {
    return ['Y', 'N'].includes(status.toUpperCase());
  }

  /**
   * Valida los datos del ProductTree antes de crear/actualizar
   */
  validateProductTreeData(data: Partial<ProductTreeCreateRequest>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validar código
    if (!data.itemCode?.trim()) {
      errors.push('El código del ingrediente es requerido');
    } else if (data.itemCode.length > 50) {
      errors.push('El código no puede exceder 50 caracteres');
    }

    // Validar nombre
    if (!data.itemName?.trim()) {
      errors.push('El nombre del ingrediente es requerido');
    } else if (data.itemName.length > 150) {
      errors.push('El nombre no puede exceder 150 caracteres');
    }

    // Validar cantidad
    if (data.quantity === undefined || data.quantity === null) {
      errors.push('La cantidad es requerida');
    } else if (data.quantity < 0) {
      errors.push('La cantidad debe ser mayor o igual a 0');
    }

    // Validar estado habilitado
    if (!data.enabled?.trim()) {
      errors.push('El estado habilitado es requerido');
    } else if (!this.isValidYNStatus(data.enabled)) {
      errors.push('El estado habilitado debe ser Y o N');
    }

    // Validar fuente de datos
    if (!data.dataSource?.trim()) {
      errors.push('La fuente de datos es requerida');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

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
  getEnabledLabel(value: string): string {
    return this.ynToBoolean(value) ? 'Habilitado' : 'Deshabilitado';
  }

  /**
   * Obtiene la severidad del estado para PrimeNG
   */
  getEnabledSeverity(value: string): 'success' | 'danger' {
    return this.ynToBoolean(value) ? 'success' : 'danger';
  }

  /**
   * Obtiene opciones para select de estados Y/N
   */
  getEnabledOptions(): SelectOption[] {
    return [
      { label: 'Habilitado', value: 'Y' },
      { label: 'Deshabilitado', value: 'N' }
    ];
  }

  /**
   * Obtiene opciones para select de fuentes de datos
   */
  getDataSourceOptions(): SelectOption[] {
    return [
      { label: 'Interno', value: 'Internal' },
      { label: 'Externo', value: 'External' },
      { label: 'Mixto', value: 'Mixed' }
    ];
  }

  /**
   * Calcula el total de cantidad de componentes
   */
  getTotalComponentsQuantity(productTree: ProductTree): number {
    return productTree.items1.reduce((total, item) => total + item.quantity, 0);
  }

  /**
   * Verifica si tiene componentes
   */
  hasComponents(productTree: ProductTree): boolean {
    return productTree.items1.length > 0;
  }

  /**
   * Crea un objeto ProductTree por defecto para nuevos registros
   */
  createDefaultProductTree(): ProductTreeCreateRequest {
    return {
      itemCode: '',
      itemName: '',
      quantity: 1,
      enabled: EnabledStatus.YES,
      dataSource: 'Internal',
      items1: []
    };
  }

  /**
   * Crea un ProductTreeItem por defecto
   */
  createDefaultProductTreeItem(): ProductTreeItem {
    return {
      itemCode: '',
      itemName: '',
      quantity: 1,
      imageUrl: '',
      productTreeItemCode: '',
      comboItemCode: ''  // NUEVO: Campo requerido
    };
  }

  /**
   * Formatea la cantidad para mostrar
   */
  formatQuantity(quantity: number): string {
    return quantity.toLocaleString('es-CO');
  }

  /**
   * Obtiene estadísticas de ProductTrees
   */
  getProductTreeStats(productTrees: ProductTree[]): {
    total: number;
    enabled: number;
    disabled: number;
    totalComponents: number;
    averageComponentsPerTree: number;
    byDataSource: { [key: string]: number };
  } {
    const total = productTrees.length;
    const enabled = productTrees.filter(pt => this.ynToBoolean(pt.enabled)).length;
    const disabled = total - enabled;
    const totalComponents = productTrees.reduce((sum, pt) => sum + pt.items1.length, 0);
    const averageComponentsPerTree = total > 0 ? totalComponents / total : 0;

    // Estadísticas por fuente de datos
    const byDataSource: { [key: string]: number } = {};
    productTrees.forEach(pt => {
      byDataSource[pt.dataSource] = (byDataSource[pt.dataSource] || 0) + 1;
    });

    return {
      total,
      enabled,
      disabled,
      totalComponents,
      averageComponentsPerTree,
      byDataSource
    };
  }

  /**
   * Exporta ProductTrees a CSV
   */
  exportToCSV(productTrees: ProductTree[]): string {
    const headers = [
      'Código', 'Nombre', 'Cantidad', 'Estado', 'Fuente de Datos', 'Componentes'
    ];
    
    const csvData = productTrees.map(pt => [
      pt.itemCode,
      pt.itemName,
      pt.quantity.toString(),
      this.getEnabledLabel(pt.enabled),
      pt.dataSource,
      pt.items1.length.toString()
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    return csvContent;
  }

  /**
   * Descarga CSV
   */
  downloadCSV(content: string, filename: string = 'ingredientes-materiales.csv'): void {
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