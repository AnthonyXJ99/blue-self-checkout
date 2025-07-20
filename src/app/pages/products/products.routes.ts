import { Routes } from '@angular/router';
import { ProductCategoryComponent } from './category/product-category.component';
import { ProductComponent } from './product/product.component';
import { ProductGroupComponent } from './product-group/product-group.component';

export default [
    { path: 'category', data: { breadcrumb: 'Category' }, component: ProductCategoryComponent },
    { path: 'product-group', data: { breadcrumb: 'Product Group' }, component: ProductGroupComponent },
    { path: 'product', data: { breadcrumb: 'Product' }, component: ProductComponent },
    { path: '**', redirectTo: '/notfound' }
] as Routes;
