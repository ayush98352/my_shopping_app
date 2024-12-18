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
    // this.checkCartStatus();

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
        
        
        // this.currentImage = this.productDetails?.main_image;
        // Create a new array with the combination of main_image and additional_images
        // this.imagesArray = [this.productDetails?.main_image, ...this.productDetails?.additional_images];
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
          
          this.resetSessionStorage();

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
          this.resetSessionStorage();
        }else{
          this.inWishlist = true;
          alert('Unable To remove from wishlist');
        }
    });
  }

  // checkCartStatus() {
  //   this.http.get(`/cart/check?user_id=${this.userId}&product_id=${this.productId}`)
  //     .subscribe((response: any) => {
  //       this.inCart = response.inCart;
  //       this.cartQuantity = response.quantity || 0;
  //     });
  // }

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

  resetSessionStorage(){
    const recommendedProducts = JSON.parse(sessionStorage.getItem('recommendedProducts') || '[]');
    if (recommendedProducts.some((product :any) => product.product_id == this.productId)) {
      sessionStorage.removeItem('recommendedProducts');
      sessionStorage.removeItem('offset-home');
      sessionStorage.removeItem('ScrollPosition-home');
    }

    let displayName = this.dataShareService.getData();
    const products = JSON.parse(sessionStorage.getItem(`products-${displayName}`) || '[]');
    if (products.some((product :any) => product.product_id == this.productId)) {
      sessionStorage.removeItem(`products-${displayName}`);
      sessionStorage.removeItem(`offset-category-${displayName}`);
      sessionStorage.removeItem(`scrollPosition-category-${displayName}`);
    }
  }

}
