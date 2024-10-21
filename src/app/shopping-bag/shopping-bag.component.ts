import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Route, Router } from '@angular/router';
import { DataShareService } from '../services/data.share.service';
import { PaymentService } from '../services/payment.service';


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

declare var Razorpay: any;  // Declaring Razorpay to use the Razorpay SDK

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

  orderAmount: number = 0; // Example of the total amount to be paid
  paymentError: string | null = null; // To capture payment error, if any
  
  constructor(private apiService: ApiService, private router: Router, private dataShareService: DataShareService, private location: Location, private paymentService: PaymentService) { }

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

  
  // Handling successful payment
  handlePaymentSuccess(response: any) {
    console.log('Payment Success:', response);
    // You can call a backend API to validate the payment and proceed with the order confirmation
    alert('Payment successful. Order has been placed.');
  }





  // Function to place an order
  placeOrder() {
    // Example: orderAmount is calculated based on the products in the shopping bag
    this.orderAmount = 1;

    // Step 1: Call createOrder to get order details from backend
    this.paymentService.createOrder(this.orderAmount).subscribe(
      (response: any) => {
        const order = response;
        console.log('Order details:', order);

        // Step 2: Now pass the order to payment gateway (e.g., Razorpay)
        this.processPayment(order);
      },
      (error) => {
        console.error('Error creating order:', error);
        this.paymentError = 'Failed to create payment order';
      }
    );
  }
  // Function to process payment via the payment gateway
  processPayment(order: any) {
    const options = {
      key: 'rzp_test_O6NVokGEP2mmkE', // Use your payment gateway's key
      amount: order.amount, // Order amount from backend
      currency: 'INR',
      name: 'My-Store',
      description: 'Test Transaction',
      order_id: order.id, // Order ID returned from backend
      handler: (response: any) => {
        console.log('respne_before', response)
        // Step 3: On payment success, call verifyPayment
        this.verifyPayment(response);
      },
      prefill: {
        name: 'Customer Name',
        email: 'customer@example.com',
        contact: '8529736991',
      },
      method: ['card', 'upi', 'wallet'], // Add UPI here
      theme: {
        color: '#3399cc',
      },
    };

    const rzp1 = new (window as any).Razorpay(options); // Razorpay SDK or similar
    rzp1.open(); // Open the payment window

    // Handling payment failure
    rzp1.on('payment.failed', (response: any) => {
      console.error('Payment Failed:', response);
      this.paymentError = 'Payment failed. Please try again.';
    });
  }


  // Function to verify payment after processing
  verifyPayment(paymentData: any) {
    this.paymentService.verifyPayment(paymentData).subscribe(
      (response: any) => {
        console.log('response_verification', response);
        if (response.status == 'Payment verified successfully!') {
          alert('Payment successful!');
        } else {
          alert('Payment verification failed.');
        }
      },
      (error) => {
        console.error('Error verifying payment:', error);
        alert('Payment verification failed. Please contact support.');
      }
    );
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