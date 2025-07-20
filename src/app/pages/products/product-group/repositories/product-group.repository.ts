import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ProductGroupsService } from '../../../service/product-group.service';
import { ProductGroup, ProductGroupCreateRequest, ProductGroupFilterParams, ProductGroupPagedResponse, ProductGroupUpdateRequest } from '../model/product-group.model';

@Injectable({ providedIn: 'root' })
export class ProductGroupRepository {
  constructor(private productGroupService: ProductGroupsService) {}

  getAllProductGroups(): Observable<ProductGroup[]> {
    return this.productGroupService.getAllProductGroups().pipe(
      catchError(() => of([]))
    );
  }

  getProductGroups(params?: ProductGroupFilterParams): Observable<ProductGroupPagedResponse | null> {
    return this.productGroupService.getProductGroups(params).pipe(
      catchError(() => of(null))
    );
  }

  getProductGroupByCode(groupCode: string): Observable<ProductGroup | null> {
    return this.productGroupService.getProductGroupByCode(groupCode).pipe(
      catchError(() => of(null))
    );
  }

  createProductGroup(groupData: ProductGroupCreateRequest): Observable<ProductGroup | null> {
    return this.productGroupService.createProductGroup(groupData).pipe(
      catchError(() => of(null))
    );
  }

  updateProductGroup(groupCode: string, groupData: ProductGroupUpdateRequest): Observable<boolean> {
    return this.productGroupService.updateProductGroup(groupCode, groupData).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  deleteProductGroup(groupCode: string): Observable<boolean> {
    return this.productGroupService.deleteProductGroup(groupCode).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  getEnabledProductGroups(): Observable<ProductGroup[]> {
    return this.productGroupService.getEnabledProductGroups().pipe(
      catchError(() => of([]))
    );
  }

  searchProductGroups(searchTerm: string, pageNumber: number = 1, pageSize: number = 10): Observable<ProductGroupPagedResponse | null> {
    return this.productGroupService.searchProductGroups(searchTerm, pageNumber, pageSize).pipe(
      catchError(() => of(null))
    );
  }

  validateProductGroupData(group: Partial<ProductGroupCreateRequest>): { isValid: boolean; errors: string[] } {
    return this.productGroupService.validateProductGroupData(group);
  }

  isValidEnabledStatus(status: string): boolean {
    return this.productGroupService.isValidEnabledStatus(status);
  }

  isProductGroupEnabled(group: ProductGroup): boolean {
    return this.productGroupService.isProductGroupEnabled(group);
  }

  booleanToEnabledStatus(enabled: boolean): string {
    return this.productGroupService.booleanToEnabledStatus(enabled);
  }

  getEnabledLabel(group: ProductGroup): string {
    return this.productGroupService.getEnabledLabel(group);
  }

  getEnabledSeverity(group: ProductGroup): 'success' | 'danger' {
    return this.productGroupService.getEnabledSeverity(group);
  }

  createDefaultProductGroup(): ProductGroupCreateRequest {
    return this.productGroupService.createDefaultProductGroup();
  }

  getNextVisOrder(groups: ProductGroup[]): number {
    return this.productGroupService.getNextVisOrder(groups);
  }

  sortByVisOrder(groups: ProductGroup[]): ProductGroup[] {
    return this.productGroupService.sortByVisOrder(groups);
  }

  exportProductGroupsToCSV(groups: ProductGroup[]): string {
    return this.productGroupService.exportProductGroupsToCSV(groups);
  }

  getProductGroupStats(groups: ProductGroup[]): {
    total: number;
    enabled: number;
    disabled: number;
    enabledPercentage: number;
    averageVisOrder: number;
  } {
    return this.productGroupService.getProductGroupStats(groups);
  }
}
