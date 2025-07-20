import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { API_CONFIG } from '../../core/config/api.config';
import { RequestParams } from '../../core/config/api.config';
import { ApiResponse } from '../../core/model/api-response.model';

// Interfaces corregidas según swagger.json
export interface CustomerGroup {
  customerGroupCode: string;        // required
  customerGroupName: string;        // required  
  enabled: string;                  // required (Y/N)
  datasource: string;               // required (corregido de 'datasource')
}

export interface Customer {
  customerCode: string;             // required
  customerName: string;             // required
  taxIdentNumber?: string;          // optional, maxLength: 20
  cellPhoneNumber?: string;         // optional, maxLength: 15 (corregido a string)
  email?: string;                   // optional, maxLength: 100
  enabled: string;                  // required (Y/N)
  datasource?: string;              // optional (corregido de 'datasource')
  customerGroupCode?: string;       // optional, maxLength: 50
}

// Respuesta paginada según swagger
export interface CustomerPagedResponse {
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  data: Customer[];
}

@Injectable({
  providedIn: 'root'
})
export class CustomerApiService {

  // Endpoints corregidos según swagger
  private readonly customerGroupsEndpoint = 'api/CustomerGroups';
  private readonly customersEndpoint = 'api/Customers';

  constructor(private apiService: ApiService) {}

  // ===== CUSTOMER GROUPS (corregido según swagger) =====

  /**
   * Obtiene todos los grupos de clientes sin paginación
   * GET /api/CustomerGroups/all
   */
  getAllCustomerGroups(): Observable<CustomerGroup[]> {
    return this.apiService.get<CustomerGroup[]>(`${this.customerGroupsEndpoint}/all`);
  }

  /**
   * Obtiene grupos de clientes con paginación
   * GET /api/CustomerGroups
   */
  getCustomerGroups(params?: RequestParams): Observable<ApiResponse<CustomerGroup>> {
    return this.apiService.getPaginated<CustomerGroup>(`${this.customerGroupsEndpoint}`, params);
  }

  /**
   * Obtiene un grupo de clientes por código
   * GET /api/CustomerGroups/{customerGroupCode}
   */
  getCustomerGroupByCode(code: string): Observable<CustomerGroup> {
    return this.apiService.get<CustomerGroup>(`${this.customerGroupsEndpoint}/${code}`);
  }

  /**
   * Crea un nuevo grupo de clientes
   * POST /api/CustomerGroups
   */
  createCustomerGroup(customerGroup: CustomerGroup): Observable<CustomerGroup> {
    return this.apiService.post<CustomerGroup>(this.customerGroupsEndpoint, customerGroup);
  }

  /**
   * Actualiza un grupo de clientes
   * PUT /api/CustomerGroups/{customerGroupCode}
   */
  updateCustomerGroup(code: string, customerGroup: CustomerGroup): Observable<void> {
    return this.apiService.put<void>(`${this.customerGroupsEndpoint}/${code}`, customerGroup);
  }

  /**
   * Elimina un grupo de clientes
   * DELETE /api/CustomerGroups/{customerGroupCode}
   */
  deleteCustomerGroup(code: string): Observable<void> {
    return this.apiService.delete<void>(`${this.customerGroupsEndpoint}/${code}`);
  }

  // ===== CUSTOMERS (corregido según swagger) =====

  /**
   * Obtiene todos los clientes sin paginación
   * GET /api/Customers/all
   */
  getAllCustomers(): Observable<Customer[]> {
    return this.apiService.get<Customer[]>(`${this.customersEndpoint}/all`);
  }

  /**
   * Obtiene clientes con paginación
   * GET /api/Customers
   */
  getCustomers(params?: RequestParams): Observable<CustomerPagedResponse> {
    return this.apiService.getPaginated<Customer>(`${this.customersEndpoint}`, params);
  }

  /**
   * Obtiene un cliente por código
   * GET /api/Customers/{customerCode}
   */
  getCustomerByCode(code: string): Observable<Customer> {
    return this.apiService.get<Customer>(`${this.customersEndpoint}/${code}`);
  }

  /**
   * Crea un nuevo cliente
   * POST /api/Customers
   */
  createCustomer(customer: Customer): Observable<Customer> {
    return this.apiService.post<Customer>(this.customersEndpoint, customer);
  }

  /**
   * Actualiza un cliente
   * PUT /api/Customers/{customerCode}
   */
  updateCustomer(code: string, customer: Customer): Observable<void> {
    return this.apiService.put<void>(`${this.customersEndpoint}/${code}`, customer);
  }

  /**
   * Elimina un cliente
   * DELETE /api/Customers/{customerCode}
   */
  deleteCustomer(code: string): Observable<void> {
    return this.apiService.delete<void>(`${this.customersEndpoint}/${code}`);
  }

  // ===== MÉTODOS DE UTILIDAD =====

  /**
   * Busca clientes por término
   */
  searchCustomers(searchTerm: string, pageNumber: number = 1, pageSize: number = 10): Observable<CustomerPagedResponse> {
    const params: RequestParams = {
      search: searchTerm,
      pageNumber,
      pageSize
    };
    return this.getCustomers(params);
  }

  /**
   * Busca grupos de clientes por término
   */
  searchCustomerGroups(searchTerm: string, pageNumber: number = 1, pageSize: number = 10): Observable<ApiResponse<CustomerGroup>> {
    const params: RequestParams = {
      search: searchTerm,
      pageNumber,
      pageSize
    };
    return this.getCustomerGroups(params);
  }

  /**
   * Valida datos de CustomerGroup
   */
  validateCustomerGroupData(group: Partial<CustomerGroup>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!group.customerGroupCode?.trim()) {
      errors.push('El código del grupo es requerido');
    } else if (group.customerGroupCode.length > 50) {
      errors.push('El código del grupo no puede exceder 50 caracteres');
    }

    if (!group.customerGroupName?.trim()) {
      errors.push('El nombre del grupo es requerido');
    } else if (group.customerGroupName.length > 100) {
      errors.push('El nombre del grupo no puede exceder 100 caracteres');
    }

    if (!group.enabled?.trim()) {
      errors.push('El estado habilitado es requerido');
    } else if (!['Y', 'N'].includes(group.enabled.toUpperCase())) {
      errors.push('El estado debe ser Y (habilitado) o N (deshabilitado)');
    }

    if (!group.datasource?.trim()) {
      errors.push('La fuente de datos es requerida');
    } else if (group.datasource.length > 1) {
      errors.push('La fuente de datos debe ser un solo carácter');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Valida datos de Customer
   */
  validateCustomerData(customer: Partial<Customer>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!customer.customerCode?.trim()) {
      errors.push('El código del cliente es requerido');
    } else if (customer.customerCode.length > 50) {
      errors.push('El código del cliente no puede exceder 50 caracteres');
    }

    if (!customer.customerName?.trim()) {
      errors.push('El nombre del cliente es requerido');
    } else if (customer.customerName.length > 100) {
      errors.push('El nombre del cliente no puede exceder 100 caracteres');
    }

    if (customer.taxIdentNumber && customer.taxIdentNumber.length > 20) {
      errors.push('El RUT no puede exceder 20 caracteres');
    }

    if (customer.cellPhoneNumber && customer.cellPhoneNumber.length > 15) {
      errors.push('El teléfono no puede exceder 15 caracteres');
    }

    if (customer.email && customer.email.length > 100) {
      errors.push('El email no puede exceder 100 caracteres');
    }

    if (!customer.enabled?.trim()) {
      errors.push('El estado habilitado es requerido');
    } else if (!['Y', 'N'].includes(customer.enabled.toUpperCase())) {
      errors.push('El estado debe ser Y (habilitado) o N (deshabilitado)');
    }

    if (customer.customerGroupCode && customer.customerGroupCode.length > 50) {
      errors.push('El código del grupo no puede exceder 50 caracteres');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Convierte booleano a string para API
   */
  booleanToEnabledStatus(enabled: boolean): string {
    return enabled ? 'Y' : 'N';
  }

  /**
   * Convierte string a booleano para UI
   */
  enabledStatusToBoolean(enabled: string): boolean {
    return enabled?.toUpperCase() === 'Y';
  }

  /**
   * Obtiene label del estado para mostrar en UI
   */
  getEnabledLabel(enabled: string): string {
    return this.enabledStatusToBoolean(enabled) ? 'Habilitado' : 'Deshabilitado';
  }

  /**
   * Obtiene severidad para PrimeNG tags
   */
  getEnabledSeverity(enabled: string): 'success' | 'danger' {
    return this.enabledStatusToBoolean(enabled) ? 'success' : 'danger';
  }

  /**
   * Crea CustomerGroup por defecto
   */
  createDefaultCustomerGroup(): CustomerGroup {
    return {
      customerGroupCode: '',
      customerGroupName: '',
      enabled: 'Y',
      datasource: 'M' // Manual
    };
  }

  /**
   * Crea Customer por defecto
   */
  createDefaultCustomer(): Customer {
    return {
      customerCode: '',
      customerName: '',
      taxIdentNumber: '',
      cellPhoneNumber: '',
      email: '',
      enabled: 'Y',
      datasource: 'M', // Manual
      customerGroupCode: ''
    };
  }

  /**
   * Valida formato de email
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Exporta a CSV (método simplificado)
   */
  exportToCsv(data: CustomerGroup[] | Customer[], filename: string): void {
    const csvContent = this.convertToCSV(data);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  private convertToCSV(data: any[]): string {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvData = data.map(row => 
      headers.map(header => `"${row[header] || ''}"`).join(',')
    );
    
    return [headers.join(','), ...csvData].join('\n');
  }
}