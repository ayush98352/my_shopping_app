import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { RouterModule , Router, ActivatedRoute} from '@angular/router';
import { CommonModule } from '@angular/common'; 
import { DataShareService } from '../services/data.share.service';
import { Location } from '@angular/common';


@Component({
  selector: 'app-category-products',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './category-products.component.html',
  styleUrl: './category-products.component.css'
})

export class CategoryProductsComponent implements OnInit{
  public categoryId:any;
  public brandId:any;
  public displayName: any;
  public category=<any>{};
  public products: any = [];
  public loggedInUserId = localStorage.getItem('loggedInUserId');

  public constructor(private apiService: ApiService, private router: Router, private route: ActivatedRoute, private dataShareService: DataShareService, private location: Location) {
    this.route.queryParams.subscribe(params => {
      this.categoryId = params['category_id'];
      this.brandId = params['brand_id'];
    });
  }


  async ngOnInit() {
    this.route.params.subscribe(params => {
      this.categoryId = params['category_id'];
      this.brandId = params['brand_id'];
    });
    this.displayName = this.dataShareService.getData();
    // this.categoryName = localStorage.getItem('categoryName');

    // Get query parameters
    // this.route.queryParamMap.subscribe(queryParams => {
    //   this.categoryName = queryParams.get('categoryName');
    // });
    
    if(this.categoryId){
      await this.getAllCategoryProducts(this.categoryId);
    }
    if(this.brandId){
      await this.getAllBrandProducts(this.brandId);
    }
    
  }

  async getAllCategoryProducts(categoryId:Number){
    let apiParams = {
      user_id: this.loggedInUserId,
      category_id: categoryId
    }
    await this.apiService.getDataWithParams('/home/getSelectedCategoryProduct', apiParams).subscribe(
      (response) => {
        this.products = JSON.parse(JSON.stringify(response.result));
        console.log('products', this.products)
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
  }

  async getAllBrandProducts(brandId:Number){
    let apiParams = {
      user_id: this.loggedInUserId,
      brand_id: brandId
    }
    await this.apiService.getDataWithParams('/home/getSelectedBrandProduct', apiParams).subscribe(
      (response) => {
        this.products = JSON.parse(JSON.stringify(response.result));
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
        if(response.code == 200 && response.message == 'sucess'){
          const productIndex = this.products.findIndex((prod: any) => prod.product_id === product.product_id);
          if (productIndex !== -1) {
              // Update the iswishlisted property for the specific product
              this.products[productIndex].iswishlisted = "1"; // Set iswishlisted to 1
          }
          else{
            alert('Unable to add to wishlist');
          }
        }else{
          // this.products.wishlist = 0;
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
        if(response.code == 200 && response.message == 'sucess'){
          const productIndex = this.products.findIndex((prod: any) => prod.product_id === product.product_id);
          if (productIndex !== -1) {
              // Update the iswishlisted property for the specific product
              this.products[productIndex].iswishlisted = "0"; // Set iswishlisted to 1
          }
          else{
            alert('Unable to remove to wishlist');
          }
        }else{
          // this.products.wishlist = 1;
          alert('Unable To remove from wishlist');
        }
    });
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

  goBackToPreviousPage() {
    this.location.back();
  }

}
