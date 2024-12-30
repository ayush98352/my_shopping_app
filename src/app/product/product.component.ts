import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { CommonModule } from '@angular/common'; 
import { DataShareService } from '../services/data.share.service';
import { MatIconModule } from '@angular/material/icon';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { SvgRegistryService } from '../services/svg-registry.service';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';


@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],  // Add this line
  templateUrl: './product.component.html',
  styleUrl: './product.component.css'
})
export class ProductComponent implements OnInit{

  public productId:any;
  public productDetails: any;
  public imagesArray: any[] = [];
  public currentIndex: number = 0;
  public currentImage:string = '';
  public inWishlist: boolean = false;
  public inCart: boolean = false;
  public loggedInUserId = localStorage.getItem('loggedInUserId');
  public selectedSize = '';
  public inCartSize = '';
  public isLoading = true;

  isFullscreen = false;
  selectedImage: string | null = null;
  zoomedImage: string | null = null;


  public constructor(private apiService: ApiService, private router: Router, private route: ActivatedRoute, private dataShareService: DataShareService, private location: Location) {}
  
  async ngOnInit() {
    this.route.params.subscribe(params => {
      this.productId = params['product_id'];
    });
    this.productDetails = this.dataShareService.getProductDetails();
    // if(Object.keys(this.productDetails).length === 0 && this.productId){
    //   await this.getProductDetails(this.productId);
    // }
    
    await this.getProductDetails(this.productId);
    this.currentImage = this.productDetails?.main_image;
    if(this.productDetails?.images){
      this.currentImage = this.productDetails?.images.split('|')[0];
    }
     // Create a new array with the combination of main_image and additional_images
    // this.imagesArray = [this.productDetails?.main_image, ...this.productDetails?.additional_images];
    // await this.getScrollImages();
  
  }
  async getScrollImages(){
    const showImage = () => {
      this.currentImage = this.imagesArray[this.currentIndex];
    }


    // // Function to handle navigation button clicks
    const navigate = (direction: string) => {
      if (direction === 'prev') {
        this.currentIndex = (this.currentIndex - 1 + this.imagesArray.length) % this.imagesArray.length;
      } else if (direction === 'next') {
        this.currentIndex = (this.currentIndex + 1) % this.imagesArray.length;
      }
      showImage();
    }
    // // Add event listeners to the navigation buttons
    if(document.querySelector(".carousel-prev")){
      document.querySelector(".carousel-prev")?.addEventListener("click", () => navigate('prev'));
    }
    if(document.querySelector(".carousel-next")){
      document.querySelector(".carousel-next")?.addEventListener("click", () => navigate('next'));
    }
   
    // // Show the main image initially
    showImage();

    this.checkWishlistStatus();

  }

  async getProductDetails(productId: any) {
    let apiParams = {
      product_id: productId
    }
    await this.apiService.getDataWithParams('/home/getProductDetails', apiParams).subscribe(
      (response) => {
        this.isLoading = false;
        this.productDetails = response.result[0];
        this.dataShareService.setProductDetails(this.productDetails);
        if(this.productDetails?.images){
          this.currentImage = this.productDetails?.images.split('|')[0]
          this.imagesArray = this.productDetails?.images.split('|').map((img: string) => img.trim()).filter(Boolean)  
        }else{
          this.currentImage = this.productDetails?.main_image;
          this.imagesArray = [this.productDetails?.main_image, ...this.productDetails?.additional_images];
        }
        this.getScrollImages();
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
  }

  onImageError(event: any) {
    if (this.currentIndex < this.imagesArray.length - 1) {
      this.currentIndex = (this.currentIndex + 1) % this.imagesArray.length;
      this.currentImage = this.imagesArray[this.currentIndex];
    } else {
      this.currentIndex = 0;
      this.currentImage = this.imagesArray[this.currentIndex];
    }
  }

  async checkWishlistStatus() {
    let apiParams = {
      user_id: this.loggedInUserId,
      product_id: this.productId
    }
    await this.apiService.getDataWithParams('/home/checkWishlistStatus', apiParams)
      .subscribe((response: any) => {
        if(response.code == 200 && response.message == 'sucess'){
          if(response.result[0] && response.result[0].inWishlist === 0){
            this.inWishlist = false;
          }
          else if (response.result[0].inWishlist > 0){
            this.inWishlist = true;
          }
          else{
            this.inWishlist = false;
          }
        }
        else{
          this.inWishlist = false;
        }
    });
  }

  async addToWishlist() {
    let apiParams = {
      user_id: this.loggedInUserId,
      product_id: this.productId
    }
    if(!this.loggedInUserId){
      this.router.navigate(['/login']);
      return;
    }
    await this.apiService.getDataWithParams('/home/addToWishlist', apiParams)
      .subscribe((response: any) => {
        if(response.code == 200 && response.message == 'sucess'){
          this.inWishlist = true;
          this.resetSessionStorage('addToWishlist');
          this.cacheWishlistedProducts('addToWishlist', this.productDetails);
        }else{
          this.inWishlist = false;
          if(!this.loggedInUserId){
            this.router.navigate(['/login']);
          }
          else{
            alert('Unable to add to wishlist');
          }
        }
    });
  }

  async removeFromWishlist() {
    let apiParams = {
      user_id: this.loggedInUserId,
      product_id: this.productId
    }
    await this.apiService.getDataWithParams('/home/removeFromWishlist', apiParams)
      .subscribe((response: any) => {
        if(response.code == 200 && response.message == 'sucess'){
          this.inWishlist = false;
          this.resetSessionStorage('removeFromWishlist');
          this.cacheWishlistedProducts('removeFromWishlist', this.productDetails);
        }else{
          this.inWishlist = true;
          alert('Unable To remove from wishlist');
        }
    });
  }

  async setSelectedSize(size: any){
    this.selectedSize = size;
    if(this.inCartSize == size){
      this.inCart = true;
    }
    else{
      this.inCart = false;
    }
  }

  async addToCart(){
    if(!this.loggedInUserId){
      this.router.navigate(['/login']);
      return;
    }
    if(!this.selectedSize || this.selectedSize == ''){
      alert('Please select size');
      return;
    }
    
    else{
      let apiParams = {
        user_id: this.loggedInUserId,
        product_id: this.productId,
        size: this.selectedSize
      }
      await this.apiService.getDataWithParams('/home/addToCart', apiParams)
        .subscribe((response: any) => {
          if(response.code == 200 && response.message == 'sucess'){
            this.inCart = true;
            this.inCartSize = this.selectedSize;
          }
        })
    }
  }

  goToWishlistPage(){
    return this.router.navigate(['/wishlist']);
  }

  goBackToPreviousPage() {
    this.location.back();
  }
  
  goToBagPage(){
    return this.router.navigate(['/cart']);
  }

  resetSessionStorage(mode: any) {
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
        updateWishlistStatus(products, this.productId, wishlistStatus);
        sessionStorage.setItem(key, JSON.stringify(products));
      }
    }
  }

  cacheWishlistedProducts(mode: any, product: any): void {
    const wishlistedProducts = JSON.parse(sessionStorage.getItem('wishlistedProducts') || '[]');
    if(wishlistedProducts.length > 0){
      if(mode == 'addToWishlist'){
        wishlistedProducts.unshift(product);
      }
      else if(mode == 'removeFromWishlist'){
        let index = wishlistedProducts.findIndex((prod :any) => prod.product_id == product.product_id);
        if (index !== -1) {
          wishlistedProducts.splice(index, 1);
        }
      }
      sessionStorage.setItem('wishlistedProducts', JSON.stringify(wishlistedProducts));
    }
  }

  openFullscreen(image: string) {
    this.isFullscreen = true;
    this.selectedImage = image;
    this.zoomedImage = null; // Reset zoom
  }

  closeFullscreen() {
    this.isFullscreen = false;
    this.selectedImage = null;
    this.zoomedImage = null;
  }

  toggleZoom(event: Event) {
    const image = (event.target as HTMLImageElement).getAttribute('src');
    this.zoomedImage = this.zoomedImage === image ? null : image;
  }
}
