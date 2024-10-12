import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { CommonModule } from '@angular/common'; 
import { DataShareService } from '../services/data.share.service';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule],
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
        this.productDetails = response.result[0];
        this.dataShareService.setProductDetails(this.productDetails);

        this.currentImage = this.productDetails?.main_image;
        // Create a new array with the combination of main_image and additional_images
        this.imagesArray = [this.productDetails?.main_image, ...this.productDetails?.additional_images];
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
    await this.apiService.getDataWithParams('/home/addToWishlist', apiParams)
      .subscribe((response: any) => {
        if(response.code == 500 && response.message == 'sucess'){
          this.inWishlist = true;
        }else{
          this.inWishlist = false;
          alert('Unable to add to wishlist');
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
        if(response.code == 500 && response.message == 'sucess'){
          this.inWishlist = false;
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
  }
  async addToCart(){
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
          if(response.code == 500 && response.message == 'sucess'){
            this.inCart = true;
          }
        })
    }
  }

  goToWishlistPage(){
    return this.router.navigate(['/wishlist', this.loggedInUserId] );
  }

  goBackToPreviousPage() {
    this.location.back();
  }
  
  goToBagPage(){
    return this.router.navigate(['/cart', this.loggedInUserId ]);
  }

}
