import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ProductCategoriesService } from '../../../service/product-category.service';
import { ProductCategory, ProductCategoryCreateRequest, ProductCategoryFilterParams, ProductCategoryPagedResponse, ProductCategoryUpdateRequest } from '../model/product-category.model';

@Injectable({ providedIn: 'root' })
export class ProductCategoryRepository {
  constructor(private productCategoryService: ProductCategoriesService) {}

  getAllProductCategories(): Observable<ProductCategory[]> {
    return this.productCategoryService.getAllProductCategories().pipe(
      catchError(() => of([]))
    );
  }

  getProductCategories(params?: ProductCategoryFilterParams): Observable<ProductCategoryPagedResponse | null> {
    return this.productCategoryService.getProductCategories(params).pipe(
      catchError(() => of(null))
    );
  }

  getProductCategoryByCode(categoryCode: string): Observable<ProductCategory | null> {
    return this.productCategoryService.getProductCategoryByCode(categoryCode).pipe(
      catchError(() => of(null))
    );
  }

  getCategoriesByGroup(groupCode: string): Observable<ProductCategory[]> {
    return this.productCategoryService.getCategoriesByGroup(groupCode).pipe(
      catchError(() => of([]))
    );
  }

  createProductCategory(categoryData: ProductCategoryCreateRequest): Observable<ProductCategory | null> {
    return this.productCategoryService.createProductCategory(categoryData).pipe(
      catchError(() => of(null))
    );
  }

  updateProductCategory(categoryCode: string, categoryData: ProductCategoryUpdateRequest): Observable<boolean> {
    return this.productCategoryService.updateProductCategory(categoryCode, categoryData).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  deleteProductCategory(categoryCode: string): Observable<boolean> {
    return this.productCategoryService.deleteProductCategory(categoryCode).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  getEnabledProductCategories(): Observable<ProductCategory[]> {
    return this.productCategoryService.getEnabledProductCategories().pipe(
      catchError(() => of([]))
    );
  }

  searchProductCategories(searchTerm: string, pageNumber: number = 1, pageSize: number = 10): Observable<ProductCategoryPagedResponse | null> {
    return this.productCategoryService.searchProductCategories(searchTerm, pageNumber, pageSize).pipe(
      catchError(() => of(null))
    );
  }

  searchCategoriesByGroup(groupCode: string, searchTerm?: string, pageNumber: number = 1, pageSize: number = 10): Observable<ProductCategoryPagedResponse | null> {
    return this.productCategoryService.searchCategoriesByGroup(groupCode, searchTerm, pageNumber, pageSize).pipe(
      catchError(() => of(null))
    );
  }

  validateProductCategoryData(category: Partial<ProductCategoryCreateRequest>): { isValid: boolean; errors: string[] } {
    return this.productCategoryService.validateProductCategoryData(category);
  }

  isValidEnabledStatus(status: string): boolean {
    return this.productCategoryService.isValidEnabledStatus(status);
  }

  isProductCategoryEnabled(category: ProductCategory): boolean {
    return this.productCategoryService.isProductCategoryEnabled(category);
  }

  booleanToEnabledStatus(enabled: boolean): string {
    return this.productCategoryService.booleanToEnabledStatus(enabled);
  }

  getEnabledLabel(category: ProductCategory): string {
    return this.productCategoryService.getEnabledLabel(category);
  }

  getEnabledSeverity(category: ProductCategory): 'success' | 'danger' {
    return this.productCategoryService.getEnabledSeverity(category);
  }

  createDefaultProductCategory(): ProductCategoryCreateRequest {
    return this.productCategoryService.createDefaultProductCategory();
  }

  getNextVisOrderForGroup(categories: ProductCategory[], groupCode?: string): number {
    return this.productCategoryService.getNextVisOrderForGroup(categories, groupCode);
  }

  sortByVisOrder(categories: ProductCategory[]): ProductCategory[] {
    return this.productCategoryService.sortByVisOrder(categories);
  }

  groupByProductGroup(categories: ProductCategory[]): { [groupCode: string]: ProductCategory[] } {
    return this.productCategoryService.groupByProductGroup(categories);
  }

  exportProductCategoriesToCSV(categories: ProductCategory[]): string {
    return this.productCategoryService.exportProductCategoriesToCSV(categories);
  }

  getProductCategoryStats(categories: ProductCategory[]): {
    total: number;
    enabled: number;
    disabled: number;
    enabledPercentage: number;
    averageVisOrder: number;
    categoriesPerGroup: { [groupCode: string]: number };
  } {
    return this.productCategoryService.getProductCategoryStats(categories);
  }

  canAssignCategoryToGroup(category: ProductCategory, groupCode: string): { canAssign: boolean; reason?: string } {
    return this.productCategoryService.canAssignCategoryToGroup(category, groupCode);
  }
}
