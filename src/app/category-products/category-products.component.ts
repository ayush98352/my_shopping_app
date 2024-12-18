import { Component, OnInit, HostListener } from '@angular/core';
import { ApiService } from '../services/api.service';
import { RouterModule , Router, ActivatedRoute} from '@angular/router';
import { CommonModule } from '@angular/common'; 
import { DataShareService } from '../services/data.share.service';
import { Location } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { SvgRegistryService } from '../services/svg-registry.service';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';



@Component({
  selector: 'app-category-products',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],  // Add this line
  templateUrl: './category-products.component.html',
  styleUrl: './category-products.component.css'
})

export class CategoryProductsComponent implements OnInit{
  public categoryId:any;
  public brandId:any;
  public displayName: any;
  public products: any = [];
  public loggedInUserId = localStorage.getItem('loggedInUserId');
  public category: any;
  public sub_catgeory: any;
  public gender: any;
  public searchedText: any;
  public searchedList: any;
  public isLoading = true;
  offset: number = 0;
  limit: number = 30; 
  allProductsLoaded: boolean = false;
  public isLoadingContent: boolean = false;

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
    //   // this.categoryName = queryParams.get('categoryName');
    // });
    
    this.route.queryParams.subscribe(queryParams => {
      // this.categoryName = queryParams.get('categoryName');
 
      this.category = queryParams['sidebarCategory'];
      this.sub_catgeory = queryParams['dressCategory'];
      this.gender = queryParams['fashionTab'];
      this.searchedText = queryParams['searchedText'];
      // this.searchedList = JSON.parse(JSON.stringify(queryParams['searchedList']));
    });

    if(this.category && this.sub_catgeory && this.gender){
        this.displayName = this.sub_catgeory;
        this.dataShareService.setData(this.displayName);
    }

    // if(this.categoryId){
    //   await this.getAllCategoryProducts(this.categoryId);
    // }
    // else if(this.brandId){
    //   await this.getAllBrandProducts(this.brandId);
    // }
    // else if(this.category && this.sub_catgeory && this.gender){
    //   this.displayName = this.sub_catgeory;
    //   await this.getAllExploreCategoryProducts();
    // }
    await this.loadCachedData();
    
  }

  async getAllCategoryProducts(categoryId:Number){
    if (this.allProductsLoaded || this.isLoadingContent) return;
    if(!this.isLoading){
      this.isLoadingContent = true;
    }

    let apiParams = {
      user_id: this.loggedInUserId,
      category_id: categoryId,
      offset: this.offset,
      limit: this.limit
    }
    await this.apiService.getDataWithParams('/home/getSelectedCategoryProduct', apiParams).subscribe(
      (response) => {
        let data = JSON.parse(JSON.stringify(response.result));
        if (data.length === 0) {
          this.allProductsLoaded = true;
        } else {
          this.products = [...this.products, ...data];
          this.offset += this.limit;
          this.cacheData();
        }
      },
      (error) => {
        console.error('Error fetching data:', error);
      },
      () => {
        this.isLoading = false;
        this.isLoadingContent = false;
      }
    );
  }

  async getAllBrandProducts(brandId:Number){
    if (this.allProductsLoaded || this.isLoadingContent) return;
    if(!this.isLoading){
      this.isLoadingContent = true;
    }
    let apiParams = {
      user_id: this.loggedInUserId,
      brand_id: brandId,
      offset: this.offset,
      limit: this.limit
    }
    await this.apiService.getDataWithParams('/home/getSelectedBrandProduct', apiParams).subscribe(
      (response) => {
        let data = JSON.parse(JSON.stringify(response.result));
        if (data.length === 0) {
          this.allProductsLoaded = true;
        } else {
          this.products = [...this.products, ...data];
          this.offset += this.limit;
          this.cacheData();
        }
      },
      (error) => {
        console.error('Error fetching data:', error);
      },
      () => {
        this.isLoading = false;
        this.isLoadingContent = false;
      }
    );
  }
  
  async getAllExploreCategoryProducts(){
    if (this.allProductsLoaded || this.isLoadingContent) return;
    if(!this.isLoading){
      this.isLoadingContent = true;
    }

    let apiParams = {
      user_id: this.loggedInUserId,
      category: this.category,
      sub_category: this.sub_catgeory,
      gender: this.gender,
      offset: this.offset,
      limit: this.limit
    }
    await this.apiService.getDataWithParams('/home/getExploreCategoryProduct', apiParams).subscribe(
      (response) => {
        let data = JSON.parse(JSON.stringify(response.result));
        if (data.length === 0) {
          this.allProductsLoaded = true;
        } else {
          this.products = [...this.products, ...data];
          this.offset += this.limit;
          this.cacheData();
        }
      },
      (error) => {
        console.error('Error fetching data:', error);
      },
      () => {
        this.isLoading = false;
        this.isLoadingContent = false;
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
    if(!this.loggedInUserId){
      this.router.navigate(['/login']);
      return;
    }
    await this.apiService.getDataWithParams('/home/addToWishlist', apiParams)
      .subscribe((response: any) => {
        if(response.code == 200 && response.message == 'sucess'){
          const productIndex = this.products.findIndex((prod: any) => prod.product_id === product.product_id);
          if (productIndex !== -1) {
              // Update the iswishlisted property for the specific product
              this.products[productIndex].iswishlisted = "1"; // Set iswishlisted to 1
              this.cacheData();
              const recommendedProducts = JSON.parse(sessionStorage.getItem('recommendedProducts') || '[]');

              if (recommendedProducts.some((product :any) => product.product_id == product.product_id)) {
                  sessionStorage.removeItem('recommendedProducts');
                  sessionStorage.removeItem('offset-home');
                  sessionStorage.removeItem('ScrollPosition-home');
              }
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
        if(response.code == 200 && response.message == 'sucess'){
          const productIndex = this.products.findIndex((prod: any) => prod.product_id === product.product_id);
          if (productIndex !== -1) {
              // Update the iswishlisted property for the specific product
              this.products[productIndex].iswishlisted = "0"; // Set iswishlisted to 1
              this.cacheData();
              const recommendedProducts = JSON.parse(sessionStorage.getItem('recommendedProducts') || '[]');

              if (recommendedProducts.some((product :any) => product.product_id == product.product_id)) {
                  sessionStorage.removeItem('recommendedProducts');
                  sessionStorage.removeItem('offset-home');
                  sessionStorage.removeItem('ScrollPosition-home');
              }
              
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
    const scrollContainer = document.querySelector('.content') as HTMLElement;
    if (scrollContainer) {
      sessionStorage.setItem(`scrollPosition-category-${this.displayName}`, scrollContainer.scrollTop.toString());
    }
    this.dataShareService.setProductDetails(product);
    return this.router.navigate(['/product', product.product_id] );
  }

  goToWishlistPage(){
    return this.router.navigate(['/wishlist']);
  }

  goToBagPage(){
    return this.router.navigate(['/cart']);
  }

  goBackToPreviousPage() {
    if(this.category && this.sub_catgeory && this.gender && !this.searchedText){
      this.location.back()
      this.dataShareService.setFilters({
        activeSidebarCategories: this.category,
        activeDressCategory: this.sub_catgeory,
        activeFashionTab: this.gender
      })
    }
    else if(this.searchedText ){
      this.location.back()
      this.dataShareService.setFilters({
        searchedText: this.searchedText,
      })
    }
    else{
      this.location.back()
    }
  }

  cacheData(): void {
    // Save products and offset in session storage
    sessionStorage.setItem(`products-${this.displayName}`, JSON.stringify(this.products));
    sessionStorage.setItem(`offset-category-${this.displayName}`, this.offset.toString());
  }

  @HostListener('scroll', ['$event'])
  async onScroll(event: Event) {
    const target = event.target as HTMLElement;
    const scrollPosition = target.scrollTop + target.clientHeight;
    const pageHeight = target.scrollHeight;
    
    if (scrollPosition >= pageHeight - 40 && !this.isLoading && !this.isLoadingContent) {
      if(this.categoryId){
        await this.getAllCategoryProducts(this.categoryId);
      }
      else if(this.brandId){
        await this.getAllBrandProducts(this.brandId);
      }
      else if(this.category && this.sub_catgeory && this.gender){
        this.displayName = this.sub_catgeory;
        await this.getAllExploreCategoryProducts();
      }
    }
  }


  async loadCachedData() {
    // Load cached products and scroll position from session storage
    const cachedProducts = sessionStorage.getItem(`products-${this.displayName}`);
    const cachedOffset = sessionStorage.getItem(`offset-category-${this.displayName}`);
    const cachedScrollPosition = sessionStorage.getItem(`scrollPosition-category-${this.displayName}`);
    
    if (cachedProducts && this.displayName != 'See all >') {
      this.products = JSON.parse((cachedProducts));
      this.offset = cachedOffset ? parseInt(cachedOffset) : 0;
      this.allProductsLoaded = this.products.length < this.offset;
      this.isLoading = false;

    }else{
      if(this.categoryId){
        await this.getAllCategoryProducts(this.categoryId);
      }
      else if(this.brandId){
        await this.getAllBrandProducts(this.brandId);
      }
      else if(this.category && this.sub_catgeory && this.gender){
        this.displayName = this.sub_catgeory;
        await this.getAllExploreCategoryProducts();
      }
    }
    

    if (cachedScrollPosition) {
      setTimeout(() => {
        const scrollContainer = document.querySelector('.content') as HTMLElement;
        if (scrollContainer) {
          scrollContainer.scrollTop = parseInt(cachedScrollPosition, 10); // Restore scroll position
        }
      }, 0); // Restore after rendering
    }
  }



}
