import { Routes } from '@angular/router';
import { ProductCategoryComponent } from './category/product-category.component';
import { ProductComponent } from './product/product.component';
import { ProductGroupComponent } from './product-group/product-group.component';
import { IngredientsComponent } from './ingredients/ingredients.component';
import { AccompanimentsComponent } from './accompaniments/accompaniments.component';
import { CombosComponent } from './combos/combos.component';
import { VariantsComponent } from './variants/variants.component';

export default [
    { path: 'category', data: { breadcrumb: 'Category' }, component: ProductCategoryComponent },
    { path: 'product-group', data: { breadcrumb: 'Product Group' }, component: ProductGroupComponent },
    { path: 'product', data: { breadcrumb: 'Product' }, component: ProductComponent },
    { path: 'variants', data: { breadcrumb: 'Variants' }, component: VariantsComponent },
    { path: 'ingredients', data: { breadcrumb: 'Ingredients' }, component: IngredientsComponent },
    { path: 'accompaniments', data: { breadcrumb: 'Accompaniments' }, component: AccompanimentsComponent },
    { path: 'combos', data: { breadcrumb: 'Combos' }, component: CombosComponent },
    { path: '**', redirectTo: '/notfound' }
] as Routes;
