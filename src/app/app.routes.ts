import { Routes } from '@angular/router';
// import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './auth.guard';  // Import the AuthGuard

export const routes: Routes = [
    // {
    //     path: '',
    //     redirectTo: '/login',
    //     pathMatch: 'full'  // Default route redirecting to login
    // },
    {
        path: '',
        loadComponent: () => import('./login/login.component').then(m => m.LoginComponent)
    },    
    {
        path: 'login',
        loadComponent: () => import('./login/login.component').then(m => m.LoginComponent)
    },
    
    // {
    //     path: '',
    //     loadComponent: () => import('./home/home.component').then(m => m.HomeComponent)
    // },
    {
        path: 'home',
        loadComponent: () => import('./home/home.component').then(m => m.HomeComponent)
    },
    // {   path: 'category',
    //     loadComponent: () => import('./category-products/category-products.component').then(m => m.CategoryProductsComponent)
    // },
    {   path: 'category',
        loadComponent: () => import('./category-products/category-products.component').then(m => m.CategoryProductsComponent)
    },
    {   path: 'category/:category_id',
        loadComponent: () => import('./category-products/category-products.component').then(m => m.CategoryProductsComponent)
    },
    {   path: 'brand/:brand_id',
        loadComponent: () => import('./category-products/category-products.component').then(m => m.CategoryProductsComponent)
    },
    {   path: 'product/:product_id',
        loadComponent: () => import('./product/product.component').then(m => m.ProductComponent)
    },
    {   path: 'wishlist',
        loadComponent: () => import('./wishlist/wishlist.component').then(m => m.WishlistComponent) 
    },
    // {   path: 'cart/:user_id',
    //     loadComponent: () => import('./bag/bag.component').then(m => m.BagComponent)
    // },
    {   path: 'cart',
        loadComponent: () => import('./shopping-bag/shopping-bag.component').then(m => m.ShoppingBagComponent)
    }, 
    {   path: 'search',
        loadComponent: () => import('./search/search.component').then(m => m.SearchComponent)
    }, 
    {   path: 'add-address',
        loadComponent: () => import('./add-address/add-address.component').then(m => m.AddAddressComponent)
    },
    {   path: 'profile',
        loadComponent: () => import('./profile/profile.component').then(m => m.ProfileComponent)
    }, 
    {   path: 'address-book',
        loadComponent: () => import('./address-book/address-book.component').then(m => m.AddressBookComponent)
    }, 
    {   path: 'explore',
        loadComponent: () => import('./explore/explore.component').then(m => m.ExploreComponent)
    },
    {   path: 'my-orders',
        loadComponent: () => import('./my-orders/my-orders.component').then(m => m.MyOrdersComponent)
    },
    {   path: 'order-summary',
        loadComponent: () => import('./order-summary/order-summary.component').then(m => m.OrderSummaryComponent)
    },
    {   path: 'review-rating',
        loadComponent: () => import('./review-rating/review-rating.component').then(m => m.ReviewRatingComponent)
    },

    

    // {   path: 'category/:id', 
    //     loadComponent: () => import('./category-products/category-products.component').then(m => m.CategoryProductsComponent),
    //     data: { categoryName: '' } 
    // },
    // ... other routes

];
