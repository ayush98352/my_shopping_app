import { Component, HostListener, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { CommonModule, NgOptimizedImage, provideImgixLoader } from '@angular/common'; // Import CommonModule
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { DataShareService } from '../services/data.share.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, NgOptimizedImage],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  public categories: any;
  public brands: any;
  public recommendedProducts: any = [];
  public loggedInUserId = localStorage.getItem('loggedInUserId');


  public constructor(private apiService: ApiService, private router: Router, private dataShareService: DataShareService) {}
  async ngOnInit() {
    await this.apiService.getData('/home/top-categories').subscribe(
      (response) => {
        this.categories = response.result;
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );

    await this.apiService.getData('/home/brands').subscribe(
      (response) => {
        this.brands = response.result;
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );

    await this.getRecommenedProducts();
  }

  async getRecommenedProducts(){
    let apiParams = {
      user_id: this.loggedInUserId,
    }
    await this.apiService.getDataWithParams('/home/getRecommenedProducts', apiParams).subscribe(
      (response) => {
        this.recommendedProducts = response.result;
        console.log('recommendedProducts', this.recommendedProducts)
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
  }

  async addToWishlist(product: any, event: MouseEvent) {
    event.stopPropagation();  // Prevents the click from triggering the parent click event
    event.preventDefault();   // Prevents the default action (like page refresh)
    
    let apiParams = {
      user_id: this.loggedInUserId,
      product_id: product.product_id
    }
    await this.apiService.getDataWithParams('/home/addToWishlist', apiParams)
      .subscribe((response: any) => {
        if(response.code == 500 && response.message == 'sucess'){
          const productIndex = this.recommendedProducts.findIndex((prod: any) => prod.product_id === product.product_id);
          if (productIndex !== -1) {
              // Update the iswishlisted property for the specific product
              this.recommendedProducts[productIndex].iswishlisted = "1"; // Set iswishlisted to 1
          }
          else{
            alert('Unable to add to wishlist');
          }
        }else{
          alert('Unable to add to wishlist');
        }
    });
  }

  async removeFromWishlist(product: any, event: MouseEvent) {
    event.stopPropagation();  // Prevents the click from triggering the parent click event
    event.preventDefault();   // Prevents the default action (like page refresh)

    let apiParams = {
      user_id: this.loggedInUserId,
      product_id: product.product_id
    }
    await this.apiService.getDataWithParams('/home/removeFromWishlist', apiParams)
      .subscribe((response: any) => {
        console.log('removeFromWishlist', response)
        if(response.code == 500 && response.message == 'sucess'){
          const productIndex = this.recommendedProducts.findIndex((prod: any) => prod.product_id === product.product_id);
          if (productIndex !== -1) {
              // Update the iswishlisted property for the specific product
              this.recommendedProducts[productIndex].iswishlisted = "0"; // Set iswishlisted to 1
          }
          else{
            alert('Unable to remove to wishlist');
          }
        
        }else{
          alert('Unable To remove from wishlist');
        }
    });
  }


  onImageError(category: any): void {
    // Set a flag to indicate that the SVG failed to load
    category.hasError = true;
  }

  gotoShowCategoryProductsPage(category: any) {
    this.dataShareService.setData(category.category_name);
    // localStorage.setItem('categoryName', category.name);
    // return this.router.navigate(['/category', category.category_id], { queryParams: { categoryName: category.category_name } });
    return this.router.navigate(['/category', category.category_id] );
  }

  gotoShowBrandProductsPage(brand: any) {
    this.dataShareService.setData(brand.brand_name);
    return this.router.navigate(['/brand', brand.brand_id] );
  }

  gotoShowProductPage(product:any){
    this.dataShareService.setProductDetails(product);
    return this.router.navigate(['/product', product.product_id] );
  }

  goToWishlistPage(){
    return this.router.navigate(['/wishlist', this.loggedInUserId] );
  }

  goToBagPage(){
    return this.router.navigate(['/cart', this.loggedInUserId ]);
  }
}