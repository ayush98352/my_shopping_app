import { Component, HostListener, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { DataShareService } from '../services/data.share.service';
import { Location } from '@angular/common';
import { event } from 'jquery';


@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterModule],
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

  public constructor(private apiService: ApiService, private router: Router, private dataShareService: DataShareService,  private location: Location) {}

  async ngOnInit() {
    await this.getWishlistedProducts();
  }

  async getWishlistedProducts(){
    let apiParams = {
      user_id: this.loggedInUserId
    }
  
    await this.apiService.getDataWithParams('/home/getWishlistedProducts', apiParams).subscribe(
      (response) => {
        this.wishlistedProducts = JSON.parse(JSON.stringify(response.result));
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
  }

  showRemoveConfirmation(product: any, event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
    this.selectedProduct = product;
    this.showRemovePopup = true;
  }

  async confirmRemoveFromWishlist() {
    if (this.selectedProduct) {
      await this.removeFromWishlist(this.selectedProduct);
      this.closePopups();
    }
  }

  async removeFromWishlist(product: any) {
    // event.stopPropagation();  // Prevents the click from triggering the parent click event
    // event.preventDefault();   // Prevents the default action (like page refresh)


    let apiParams = {
      user_id: this.loggedInUserId,
      product_id: product.product_id
    }
    await this.apiService.getDataWithParams('/home/removeFromWishlist', apiParams)
      .subscribe((response: any) => {
        if(response.code == 200 && response.message == 'sucess'){
          this.wishlistedProducts = this.wishlistedProducts.filter(p => p.product_id !== product.product_id);
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
    // event.stopPropagation();  // Prevents the click from triggering the parent click event
    // event.preventDefault();   // Prevents the default action (like page refresh)
    // if(!this.selectedSize || this.selectedSize == ''){
    //   alert('Please select size');
    //   return;
    // }
    // else{
      let apiParams = {
        user_id: this.loggedInUserId,
        product_id: product.product_id,
        size: size
      }
      await this.apiService.getDataWithParams('/home/addToCart', apiParams)
        .subscribe((response: any) => {
          if(response.code == 200 && response.message == 'sucess'){
            // this.inCart = true;
            // this.removeFromWishlist(product);
            this.removeFromWishlist(product);
          }
        })
    // }
  }

  gotoShowProductPage(product:any){
    this.dataShareService.setProductDetails(product);
    return this.router.navigate(['/product', product.product_id] );
  }
 
  goToBagPage(){
    return this.router.navigate(['/cart']);
  }

  goBackToPreviousPage() {
    this.location.back();
  }

  closePopups() {
    this.showRemovePopup = false;
    this.showAddToCartPopup = false;
    this.selectedSize = '';
  }

}
