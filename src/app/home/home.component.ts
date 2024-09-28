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
    await this.apiService.getData('/home/getRecommenedProducts').subscribe(
      (response) => {
        this.recommendedProducts = response.result;
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
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
}