import { Routes } from '@angular/router';
// import { HomeComponent } from './home/home.component';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./home/home.component').then(m => m.HomeComponent)
    },
    {
        path: 'home',
        loadComponent: () => import('./home/home.component').then(m => m.HomeComponent)
    },
    // {   path: 'category',
    //     loadComponent: () => import('./category-products/category-products.component').then(m => m.CategoryProductsComponent)
    // },
    {   path: 'category/:category_id',
        loadComponent: () => import('./category-products/category-products.component').then(m => m.CategoryProductsComponent)
    },
    {   path: 'brand/:brand_id',
        loadComponent: () => import('./category-products/category-products.component').then(m => m.CategoryProductsComponent)
    },
    {   path: 'product/:product_id',
        loadComponent: () => import('./product/product.component').then(m => m.ProductComponent)
    },

    // {   path: 'category/:id', 
    //     loadComponent: () => import('./category-products/category-products.component').then(m => m.CategoryProductsComponent),
    //     data: { categoryName: '' } 
    // },
    // ... other routes

];
