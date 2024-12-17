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
        this.isLoading = false;
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
        // this.inCart = true;
        this.removeFromWishlist(product);
      }
    })
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
