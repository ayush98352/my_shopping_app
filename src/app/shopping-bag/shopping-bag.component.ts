import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Route, Router } from '@angular/router';
import { DataShareService } from '../services/data.share.service';


// interface Product {
//   name: string;
//   description: string;
//   size: string;
//   quantity: number;
//   price: number;
//   originalPrice: number;
//   discount: number;
//   image: string;
//   deliveryDate: string;
// }

@Component({
  selector: 'app-shopping-bag',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './shopping-bag.component.html',
  styleUrl: './shopping-bag.component.css'
})
export class ShoppingBagComponent implements OnInit{
  deliveryAddress = 'Ayush Kumar, Bhartiya City, Nikoo homes 2, Bengaluru';
  deliveryDate = '13 Oct - 18 Oct'

  public loggedInUserId = localStorage.getItem('loggedInUserId');
  public products = <any> [];
  public totalPrice = 0;
  public totalDiscount = 0;
  public totalMRP = 0;
  public totalProductsInBag: Number = 0;
  public showRemovePopup = false;
  public selectedProduct: any;
  
  constructor(private apiService: ApiService, private router: Router, private dataShareService: DataShareService, private location: Location) { }

  async ngOnInit() { 
    await this.getCartDetails();
    
  }

  async getCartDetails(){
    let apiParams = {
      user_id: this.loggedInUserId
    }
    await this.apiService.getDataWithParams('/home/getCartDetails', apiParams).subscribe(
      (response) => {
        this.products = JSON.parse(JSON.stringify(response.result));
        this.calcSummaryPrice();
        this.totalProductsInBag = this.products.length;
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );

    
  }

  async updateCartInfo(product: any) {
    
    let apiParams = {
      product: JSON.stringify(product)
    }

    await this.apiService.getDataWithParams('/home/updateCartInfo', apiParams).subscribe(
      (response) => {
        if (response.code == 200 && response.message == 'sucess' && response.result == 'Cart Updated Succesfully') {
          // this.products = this.products.filter((p: any) => p.cart_id !== product.cart_id);
          console.log('data updated');
          this.calcSummaryPrice();
        } else {
          alert('Unable to update cart info');
        }
      },
      (error) => {
        alert('Unable to update cart info');
        console.error('Error fetching data:', error);
      }
    );

  }

  // async removeFromCart(product:any, event: MouseEvent){
  //   event.stopPropagation();  // Prevents the click from triggering the parent click event
  //   event.preventDefault();   // Prevents the default action (like page refresh)
  async removeFromCart(product:any){
    let apiParams = {
      cart_id: product.cart_id
    }
    await this.apiService.getDataWithParams('/home/removeFromCart', apiParams).subscribe(
      (response) => {
        if (response.code == 200 && response.message == 'sucess' && response.result == 'Removed Succesfully') {
          this.products = this.products.filter((p: any) => p.cart_id !== product.cart_id);
          this.calcSummaryPrice();
        } else {
          alert('Unable to remove from cart');
        }
      },
      (error) => {
        alert('Unable to remove from cart');
        console.error('Error fetching data:', error);
      }
    );
  }

  async calcSummaryPrice(){
    this.totalPrice = 0;
    this.totalDiscount = 0;
    this.totalMRP = 0;
    this.products.forEach((product: any) => {
      this.totalPrice += Number(product.selling_price * product.quantity);
      this.totalMRP += Number(product.mrp * product.quantity);
    });
    this.totalDiscount = this.totalMRP - this.totalPrice;
  }

  async showRemoveConfirmation(product: any, event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
    this.selectedProduct = product;
    this.showRemovePopup = true;
  }

  async confirmRemoveFromWishlist() {
    if (this.selectedProduct) {
      await this.removeFromCart(this.selectedProduct);
      this.closePopups();
    }
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
          this.removeFromCart(product);
          console.log('added to wishlist')
        }else{
          // this.products.wishlist = 0;
          alert('Unable to add to wishlist');
        }
    });

    this.closePopups();
  }

  closePopups() {
    this.showRemovePopup = false;
    // this.selectedSize = '';
  }

  goToWishlistPage(){
    return this.router.navigate(['/wishlist', this.loggedInUserId] );
  }
  goBackToPreviousPage() {
    this.location.back();
  }

  gotoShowProductPage(product:any){
    this.dataShareService.setProductDetails(product);
    return this.router.navigate(['/product', product.product_id] );
  }
}