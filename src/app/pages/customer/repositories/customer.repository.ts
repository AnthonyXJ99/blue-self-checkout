import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CustomerApiService, Customer, CustomerGroup, CustomerPagedResponse } from '../../service/customer-api.service';
import { RequestParams } from '../../../core/config/api.config';
import { ApiResponse } from '../../../core/model/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class CustomerRepository {

  constructor(private customerApiService: CustomerApiService) {}

  // ===== CUSTOMER GROUPS =====

  /**
   * Obtiene todos los grupos de clientes
   */
  getAllCustomerGroups(): Observable<CustomerGroup[]> {
    return this.customerApiService.getAllCustomerGroups().pipe(
      catchError((error) => {
        console.error('Error loading customer groups:', error);
        return of([]);
      })
    );
  }

  /**
   * Obtiene grupos de clientes con paginación
   */
  getCustomerGroups(params?: RequestParams): Observable<ApiResponse<CustomerGroup> | null> {
    return this.customerApiService.getCustomerGroups(params).pipe(
      catchError((error) => {
        console.error('Error loading paginated customer groups:', error);
        return of(null);
      })
    );
  }

  /**
   * Obtiene un grupo por código
   */
  getCustomerGroupByCode(code: string): Observable<CustomerGroup | null> {
    return this.customerApiService.getCustomerGroupByCode(code).pipe(
      catchError((error) => {
        console.error(`Error getting customer group ${code}:`, error);
        return of(null);
      })
    );
  }

  /**
   * Crea un nuevo grupo
   */
  createCustomerGroup(customerGroup: CustomerGroup): Observable<CustomerGroup | null> {
    return this.customerApiService.createCustomerGroup(customerGroup).pipe(
      catchError((error) => {
        console.error('Error creating customer group:', error);
        return of(null);
      })
    );
  }

  /**
   * Actualiza un grupo
   */
  updateCustomerGroup(code: string, customerGroup: CustomerGroup): Observable<boolean> {
    return this.customerApiService.updateCustomerGroup(code, customerGroup).pipe(
      map(() => true),
      catchError((error) => {
        console.error('Error updating customer group:', error);
        return of(false);
      })
    );
  }

  /**
   * Elimina un grupo
   */
  deleteCustomerGroup(code: string): Observable<boolean> {
    return this.customerApiService.deleteCustomerGroup(code).pipe(
      map(() => true),
      catchError((error) => {
        console.error('Error deleting customer group:', error);
        return of(false);
      })
    );
  }

  /**
   * Busca grupos de clientes
   */
  searchCustomerGroups(searchTerm: string, pageNumber: number = 1, pageSize: number = 10): Observable<ApiResponse<CustomerGroup> | null> {
    return this.customerApiService.searchCustomerGroups(searchTerm, pageNumber, pageSize).pipe(
      catchError((error) => {
        console.error('Error searching customer groups:', error);
        return of(null);
      })
    );
  }

  // ===== CUSTOMERS =====

  /**
   * Obtiene todos los clientes
   */
  getAllCustomers(): Observable<Customer[]> {
    return this.customerApiService.getAllCustomers().pipe(
      catchError((error) => {
        console.error('Error loading customers:', error);
        return of([]);
      })
    );
  }

  /**
   * Obtiene clientes con paginación
   */
  getCustomers(params?: RequestParams): Observable<CustomerPagedResponse | null> {
    return this.customerApiService.getCustomers(params).pipe(
      catchError((error) => {
        console.error('Error loading paginated customers:', error);
        return of(null);
      })
    );
  }

  /**
   * Obtiene un cliente por código
   */
  getCustomerByCode(code: string): Observable<Customer | null> {
    return this.customerApiService.getCustomerByCode(code).pipe(
      catchError((error) => {
        console.error(`Error getting customer ${code}:`, error);
        return of(null);
      })
    );
  }

  /**
   * Crea un nuevo cliente
   */
  createCustomer(customer: Customer): Observable<Customer | null> {
    return this.customerApiService.createCustomer(customer).pipe(
      catchError((error) => {
        console.error('Error creating customer:', error);
        return of(null);
      })
    );
  }

  /**
   * Actualiza un cliente
   */
  updateCustomer(code: string, customer: Customer): Observable<boolean> {
    return this.customerApiService.updateCustomer(code, customer).pipe(
      map(() => true),
      catchError((error) => {
        console.error('Error updating customer:', error);
        return of(false);
      })
    );
  }

  /**
   * Elimina un cliente
   */
  deleteCustomer(code: string): Observable<boolean> {
    return this.customerApiService.deleteCustomer(code).pipe(
      map(() => true),
      catchError((error) => {
        console.error('Error deleting customer:', error);
        return of(false);
      })
    );
  }

  /**
   * Busca clientes
   */
  searchCustomers(searchTerm: string, pageNumber: number = 1, pageSize: number = 10): Observable<CustomerPagedResponse | null> {
    return this.customerApiService.searchCustomers(searchTerm, pageNumber, pageSize).pipe(
      catchError((error) => {
        console.error('Error searching customers:', error);
        return of(null);
      })
    );
  }

  // ===== MÉTODOS DE UTILIDAD DEL REPOSITORY =====

  /**
   * Valida datos de CustomerGroup
   */
  validateCustomerGroupData(group: Partial<CustomerGroup>): { isValid: boolean; errors: string[] } {
    return this.customerApiService.validateCustomerGroupData(group);
  }

  /**
   * Valida datos de Customer
   */
  validateCustomerData(customer: Partial<Customer>): { isValid: boolean; errors: string[] } {
    return this.customerApiService.validateCustomerData(customer);
  }

  /**
   * Convierte booleano a string para API
   */
  booleanToEnabledStatus(enabled: boolean): string {
    return this.customerApiService.booleanToEnabledStatus(enabled);
  }

  /**
   * Convierte string a booleano para UI
   */
  enabledStatusToBoolean(enabled: string): boolean {
    return this.customerApiService.enabledStatusToBoolean(enabled);
  }

  /**
   * Obtiene label del estado
   */
  getEnabledLabel(enabled: string): string {
    return this.customerApiService.getEnabledLabel(enabled);
  }

  /**
   * Obtiene severidad para PrimeNG tags
   */
  getEnabledSeverity(enabled: string): 'success' | 'danger' {
    return this.customerApiService.getEnabledSeverity(enabled);
  }

  /**
   * Crea CustomerGroup por defecto
   */
  createDefaultCustomerGroup(): CustomerGroup {
    return this.customerApiService.createDefaultCustomerGroup();
  }

  /**
   * Crea Customer por defecto
   */
  createDefaultCustomer(): Customer {
    return this.customerApiService.createDefaultCustomer();
  }

  /**
   * Valida formato de email
   */
  isValidEmail(email: string): boolean {
    return this.customerApiService.isValidEmail(email);
  }

  /**
   * Exporta grupos a CSV
   */
  exportCustomerGroupsToCSV(groups: CustomerGroup[]): void {
    this.customerApiService.exportToCsv(groups, 'customer-groups');
  }

  /**
   * Exporta clientes a CSV
   */
  exportCustomersToCSV(customers: Customer[]): void {
    this.customerApiService.exportToCsv(customers, 'customers');
  }

  /**
   * Obtiene nombre del grupo por código
   */
  getCustomerGroupName(groups: CustomerGroup[], groupCode: string): string {
    const group = groups.find(g => g.customerGroupCode === groupCode);
    return group ? group.customerGroupName : groupCode || 'Sin grupo';
  }

  /**
   * Obtiene opciones para dropdown de grupos
   */
  getCustomerGroupOptions(groups: CustomerGroup[]): { label: string; value: string }[] {
    return groups
      .filter(group => group.enabled === 'Y') // Solo grupos habilitados
      .map(group => ({
        label: group.customerGroupName,
        value: group.customerGroupCode
      }));
  }

  /**
   * Filtra grupos habilitados
   */
  getEnabledCustomerGroups(groups: CustomerGroup[]): CustomerGroup[] {
    return groups.filter(group => group.enabled === 'Y');
  }

  /**
   * Filtra clientes habilitados
   */
  getEnabledCustomers(customers: Customer[]): Customer[] {
    return customers.filter(customer => customer.enabled === 'Y');
  }

  /**
   * Genera código único para CustomerGroup
   */
  generateCustomerGroupCode(): string {
    const now = new Date();
    const timestamp = now.getFullYear().toString() +
                     (now.getMonth() + 1).toString().padStart(2, '0') +
                     now.getDate().toString().padStart(2, '0') +
                     now.getHours().toString().padStart(2, '0') +
                     now.getMinutes().toString().padStart(2, '0') +
                     now.getSeconds().toString().padStart(2, '0');
    
    const randomId = Math.random().toString(36).substring(2, 8);
    return `CG_${timestamp}_${randomId}`;
  }

  /**
   * Genera código único para Customer
   */
  generateCustomerCode(): string {
    const now = new Date();
    const timestamp = now.getFullYear().toString() +
                     (now.getMonth() + 1).toString().padStart(2, '0') +
                     now.getDate().toString().padStart(2, '0') +
                     now.getHours().toString().padStart(2, '0') +
                     now.getMinutes().toString().padStart(2, '0') +
                     now.getSeconds().toString().padStart(2, '0');
    
    const randomId = Math.random().toString(36).substring(2, 8);
    return `C_${timestamp}_${randomId}`;
  }

  /**
   * Verifica si un código de grupo ya existe
   */
  isCustomerGroupCodeExists(groups: CustomerGroup[], code: string): boolean {
    return groups.some(group => group.customerGroupCode === code);
  }

  /**
   * Verifica si un código de cliente ya existe
   */
  isCustomerCodeExists(customers: Customer[], code: string): boolean {
    return customers.some(customer => customer.customerCode === code);
  }
}