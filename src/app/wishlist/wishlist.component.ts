import { Component, HostListener, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { DataShareService } from '../services/data.share.service';
import { Location } from '@angular/common';
import { event } from 'jquery';
import { MatIconModule } from '@angular/material/icon';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { SvgRegistryService } from '../services/svg-registry.service';


@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],  // Add this line
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.css'
})
export class WishlistComponent implements OnInit {

  public loggedInUserId = localStorage.getItem('loggedInUserId');
  public wishlistedProducts : any[] = [];

  public showRemovePopup = false;
  public showAddToCartPopup = false;
  public selectedProduct: any;
  public selectedSize: string = '';
  public isLoading = true;

  offset: number = 0;
  limit: number = 20; // Adjust as per requirement
  allProductsLoaded: boolean = false;
  public isLoadingContent: boolean = false; 


  public constructor(private apiService: ApiService, private router: Router, private dataShareService: DataShareService,  private location: Location) {}

  async ngOnInit() {
    await this.loadCachedData();
  }

  async getWishlistedProducts(){
    if (this.allProductsLoaded || this.isLoadingContent) return;
    if(!this.isLoading){
      this.isLoadingContent = true;
    }

    let apiParams = {
      user_id: this.loggedInUserId,
      offset: this.offset,
      limit: this.limit
    }
  
    await this.apiService.getDataWithParams('/home/getWishlistedProducts', apiParams).subscribe(
      (response) => {
        let data = JSON.parse(JSON.stringify(response.result));
        if (data.length === 0) {
          this.allProductsLoaded = true;
        } else {
          this.wishlistedProducts = [...this.wishlistedProducts, ...data];
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

  showRemoveConfirmation(product: any, event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
    this.selectedProduct = JSON.parse(JSON.stringify(product));
    this.showRemovePopup = true;
  }

  async confirmRemoveFromWishlist() {
    if (this.selectedProduct) {
      await this.removeFromWishlist(this.selectedProduct);
      this.closePopups();
    }
  }

  async removeFromWishlist(product: any) {
    let apiParams = {
      user_id: this.loggedInUserId,
      product_id: product.product_id
    }
    this.isLoading = true;
    await this.apiService.getDataWithParams('/home/removeFromWishlist', apiParams)
      .subscribe((response: any) => {
        this.isLoading = false;
        if(response.code == 200 && response.message == 'sucess'){
          this.wishlistedProducts = this.wishlistedProducts.filter(p => p.product_id !== product.product_id);
          this.cacheData();
          this.resetSessionStorage('removeFromWishlist', product.product_id);
        }else{
          alert('Unable To remove from wishlist');
        }
    });
  }

  showAddToCartConfirmation(product: any, event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
    this.selectedProduct = product;
    this.showAddToCartPopup = true;
  }

  saveSelectedSize(size:any){
    this.selectedSize = size;
  }
  async confirmAddToCart() {
    if (this.selectedProduct && this.selectedSize) {
      await this.addToCart(this.selectedProduct, this.selectedSize);
      this.closePopups();
    }
    this.selectedSize = '';
  }

  async addToCart(product: any, size: string) {
  let apiParams = {
    user_id: this.loggedInUserId,
    product_id: product.product_id,
    size: size
  }
  this.isLoading = true;
  await this.apiService.getDataWithParams('/home/addToCart', apiParams)
    .subscribe((response: any) => {
      this.isLoading = false;
      if(response.code == 200 && response.message == 'sucess'){
        this.removeFromWishlist(product);
      }
    })
  }

  gotoShowProductPage(product:any){
    this.storeScrollPosition();
    this.dataShareService.setProductDetails(product);
    return this.router.navigate(['/product', product.product_id] );
  }
 
  goToBagPage(){
    this.storeScrollPosition();
    return this.router.navigate(['/cart']);
  }

  goBackToPreviousPage() {
    sessionStorage.removeItem('scrollPosition-wishlist');
    this.location.back();
  }

  closePopups() {
    this.showRemovePopup = false;
    this.showAddToCartPopup = false;
    this.selectedSize = '';
  }

  async loadCachedData() {
    // Load cached products and scroll position from session storage
    const cachedProducts = sessionStorage.getItem(`wishlistedProducts`);
    const cachedOffset = sessionStorage.getItem(`offset-wishlist`);
    const cachedScrollPosition = sessionStorage.getItem(`scrollPosition-wishlist`);
    
    if (cachedProducts) {
      this.wishlistedProducts = JSON.parse((cachedProducts));
      this.offset = cachedOffset ? parseInt(cachedOffset) : 0;
      this.allProductsLoaded = this.wishlistedProducts.length < this.offset;
      this.isLoading = false;
    }
    else{
      await this.getWishlistedProducts();
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

  cacheData(): void {
    // Save products and offset in session storage
    sessionStorage.setItem('wishlistedProducts', JSON.stringify(this.wishlistedProducts));
    sessionStorage.setItem('offset-wishlist', this.offset.toString());
  }

  storeScrollPosition() {
    const scrollContainer = document.querySelector('.content') as HTMLElement;
    if (scrollContainer) {
      sessionStorage.setItem('scrollPosition-wishlist', scrollContainer.scrollTop.toString());
    }
  }

  @HostListener('scroll', ['$event'])
  onScroll(event: Event): void {
    const target = event.target as HTMLElement;
    const scrollPosition = target.scrollTop + target.clientHeight;
    const pageHeight = target.scrollHeight;

    if (scrollPosition >= pageHeight - 40 && !this.isLoading && !this.isLoadingContent) {
      this.getWishlistedProducts();
    }
  }

  resetSessionStorage(mode: any, productId: number): void {
    const updateWishlistStatus = (items: any[], productId: number, status: number) => {
      const index = items.findIndex((item: any) => item.product_id == productId);
      if (index !== -1) {
        items[index].iswishlisted = status;
      }
      return items;
    };

    const wishlistStatus = mode === 'addToWishlist' ? 1 : 0;
    
    for (const key of Object.keys(sessionStorage)) {
      const products = JSON.parse(sessionStorage.getItem(key) || '[]');
      if(products.length > 0){
        updateWishlistStatus(products, productId, wishlistStatus);
        sessionStorage.setItem(key, JSON.stringify(products));
      }

    }
    
  }
}
