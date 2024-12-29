import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Route, Router } from '@angular/router';
import { DataShareService } from '../services/data.share.service';
import { PaymentService } from '../services/payment.service';
import { NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { SvgRegistryService } from '../services/svg-registry.service';

declare var Razorpay: any;  // Declaring Razorpay to use the Razorpay SDK

@Component({
  selector: 'app-shopping-bag',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatIconModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],  // Add this line
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
  public deliveryCharges = 0;
  public transaction_details = <any> {};
  public isLoading = true;


  orderAmount: number = 0; // Example of the total amount to be paid
  paymentError: string | null = null; // To capture payment error, if any


  public locationDetails: any;

  public isAddressPopupOpen = false;

  public searchedText = '';
  public addressSuggestions: any[] = [];
  public savedAddresses: any= [];

  public userLocation: any = {
    latitude: null,
    longitude: null
  };
  public couponDiscount = 0.00;
  public couponApplied = false;
  public couponCode = '';

  public location: any = localStorage.getItem('location') ? JSON.parse(localStorage.getItem('location') || '{}') : {};

  public addOrderParams = {
    user_id: this.loggedInUserId,
    order_date : this.formatLocalDateTime(),
    order_status: 'created',
    mrp : this.totalMRP,
    product_discount: this.totalDiscount,
    item_total: this.totalPrice,
    promo_discount: this.couponDiscount,
    coupon_code : this.couponCode,
    delivery_charge: this.deliveryCharges,
    extra_charges: 0,
    extra_charges_name: '',
    tax_amount: 0.00,
    total_amount: this.totalPrice,
    payment_status: 'pending',
    transaction_details: {},
    shipping_status: 'pending',
    shipping_address: this.deliveryAddress,
    receiver_name: 'Ayush',
    reciever_contact_no: localStorage.getItem('phoneNumber'),
    delivery_instructions: '',
    payment_method: 'online',
    delivery_date: '0000:00:00 00:00:00',
    product_images: {},
    order_details: JSON.parse(JSON.stringify(this.products)),
  }
  
  constructor(private apiService: ApiService, private router: Router, private dataShareService: DataShareService, private paymentService: PaymentService) { }

  async ngOnInit() { 
    await this.getCartDetails();
    this.savedAddresses = JSON.parse(localStorage.getItem('addresses') || '[]');
    this.deliveryAddress = this.location.display_address.address_line;
  }

  async getCartDetails(){
    let apiParams = {
      user_id: this.loggedInUserId
    }
    await this.apiService.getDataWithParams('/home/getCartDetails', apiParams).subscribe(
      (response) => {
        this.isLoading = false;
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
    if(!this.loggedInUserId){
      this.router.navigate(['/login']);
      return;
    }
    await this.apiService.getDataWithParams('/home/addToWishlist', apiParams)
      .subscribe((response: any) => {
        if(response.code == 200 && response.message == 'sucess'){
          this.removeFromCart(product);
          this.resetSessionStorage('addToWishlist', product.product_id);
          this.cacheWishlistedProducts('addToWishlist', product);
        }else{
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

  async addOrder(){

   
    this.addOrderParams['order_date'] = this.formatLocalDateTime();
    this.addOrderParams['mrp'] = this.totalMRP;
    this.addOrderParams['product_discount'] = this.totalDiscount;
    this.addOrderParams['item_total'] = this.totalPrice;
    this.addOrderParams['promo_discount'] = this.couponDiscount;
    this.addOrderParams['coupon_code'] = this.couponCode;
    this.addOrderParams['delivery_charge'] = this.deliveryCharges;
    this.addOrderParams['extra_charges'] = 0;
    this.addOrderParams['extra_charges_name'] = '';
    this.addOrderParams['tax_amount'] = 0.00;
    this.addOrderParams['total_amount'] = this.totalPrice;
    this.addOrderParams['receiver_name'] = 'Ayush';
    this.addOrderParams['reciever_contact_no'] = localStorage.getItem('phoneNumber');
    this.addOrderParams['delivery_instructions'] = '';
    let orderDetails = <any>[];
    this.products.forEach((product: any) => {
      let orderDetail = {
        product_id: product?.product_id,
        size: product?.size,
        quantity: product?.quantity,
        brand_name: product?.brand_name,
        product_short_name: product?.product_short_name,
        selling_price: product?.selling_price,
        mrp: product?.mrp,
        discount_percent: product?.discount_percent,
        images: product?.images.split('|')[0],
      }
      orderDetails.push(orderDetail);
    });
    this.addOrderParams['order_details'] = JSON.parse(JSON.stringify(orderDetails));

    this.addOrderParams['product_images'] = JSON.stringify(this.products.map((product: any) => product?.images.split('|')[0]));
    let shipping_address = JSON.stringify(localStorage.getItem('location') || '{}');

    this.addOrderParams['transaction_details'] =  JSON.stringify(this.transaction_details);
    this.addOrderParams['shipping_address'] = shipping_address;

    await this.apiService.getDataWithParams('/home/addOrder', this.addOrderParams).subscribe(
      (response) => {
        console.log('Order added successfully:', response);
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
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
        console.log('response', response);
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

    console.log('options', options);
    this.transaction_details = JSON.parse(JSON.stringify(options));

    const rzp1 = new (window as any).Razorpay(options); // Razorpay SDK or similar
    rzp1.open(); // Open the payment window

    // Handling payment failure
    rzp1.on('payment.failed', (response: any) => {
      console.error('Payment Failed:', response);
      this.addOrderParams['payment_status'] = 'failed';
      this.addOrderParams['order_status'] = 'failed';
      this.addOrderParams['payment_method'] = 'online';
      this.transaction_details = { ...this.transaction_details, ...JSON.parse(JSON.stringify(response)) }
      this.addOrder();
      // add order to database with payment status = failed and transaction_details = transaction_details and order_status = failed and payment_method = online
      // updateOrder -> payment status = failed and transaction_details = transaction_details and order_status = failed and payment_method = online
      this.paymentError = 'Payment failed. Please try again.';
    });
  }


  // Function to verify payment after processing
  verifyPayment(paymentData: any) {
    this.transaction_details = { ...this.transaction_details, ...JSON.parse(JSON.stringify(paymentData)) }    
    this.paymentService.verifyPayment(paymentData).subscribe(
      (response: any) => {
        console.log('Payment verification response:', response);
        if (response.status == 'Payment verified successfully!') {
         
          this.addOrderParams['payment_status'] = 'paid';
          this.addOrderParams['order_status'] = 'placed';
          this.addOrderParams['payment_method'] = 'online';

          this.addOrder();


          // alert('Payment successful!');
          this.router.navigate(['/my-orders']);

          // updateOrder -> payment status = paid and transaction_details = transaction_details and order_status = placed and payment_method = online
        } else {
          
          this.addOrderParams['payment_status'] = 'failed';
          this.addOrderParams['order_status'] = 'failed';
          this.addOrderParams['payment_method'] = 'online';

          this.addOrder();

          alert('Payment verification failed.');

          // updateOrder -> payment status = failed and transaction_details = transaction_details and order_status = failed and payment_method = online
        }
      },
      (error) => {
        console.error('Error verifying payment:', error);
        this.transaction_details = { ...this.transaction_details, ...JSON.parse(JSON.stringify(error)) }    
        this.addOrderParams['payment_status'] = 'failed';
        this.addOrderParams['order_status'] = 'failed';
        this.addOrderParams['payment_method'] = 'online';

        this.addOrder();

        alert('Payment verification failed. Please contact support.');
      }
    );
  }


  closePopups() {
    this.showRemovePopup = false;
    // this.selectedSize = '';
  }

  goToWishlistPage(){
    return this.router.navigate(['/wishlist']);
  }
  goBackToPreviousPage() {
    // this.location.back();
    window.history.back();
  }

  gotoShowProductPage(product:any){
    this.dataShareService.setProductDetails(product);
    return this.router.navigate(['/product', product.product_id] );
  }

  formatLocalDateTime() {
    const now = new Date();
  
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
  
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
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

  cacheWishlistedProducts(mode: any, product: any): void {
    const wishlistedProducts = JSON.parse(sessionStorage.getItem('wishlistedProducts') || '[]');
    if(wishlistedProducts.length > 0){
      if(mode == 'addToWishlist'){
        wishlistedProducts.unshfit(product);
      }
      sessionStorage.setItem('wishlistedProducts', JSON.stringify(wishlistedProducts));
    }
  }


  async setSavedAddress(address : any){
    await this.fetchLocationDetails(address, address.latitude.toString(), address.longitude.toString());
  }

  async setUserLocation(){
    if (!navigator.geolocation) {
      console.log('Geolocation is not supported by this browser.');
      return;
    }

    try {
      const position = await this.getCurrentPosition();
      this.userLocation.latitude = position.coords.latitude;
      this.userLocation.longitude = position.coords.longitude;

      await this.fetchLocationDetails('', this.userLocation.latitude, this.userLocation.longitude);
      
    } catch (error) {
      console.error('Error fetching location:', error);
    }
  }

  openAddressPopup() {
    // this.isAddressPopupOpen = !this.isAddressPopupOpen;
    this.isAddressPopupOpen = true;
    this.searchedText = '';
    this.addressSuggestions = [];
  }
  closeAddressPopup() {
    this.isAddressPopupOpen = false;
    this.searchedText = '';
    this.addressSuggestions = [];
  }

  gotoAddAddressPage(){
    return this.router.navigate(['/add-address']);
  }


  async onSearchChange(event: Event) {

    const target = event.target as HTMLInputElement;
    this.searchedText = target.value;

    let apiParams = {
      searchedText: this.searchedText,
    }
    if (this.searchedText.length > 2) {

      await this.apiService.getDataWithParams('/home/fetchPlaceSuggestions', apiParams).subscribe(
        (response) => {
          this.addressSuggestions = response.predictions;
        },
        (error) => {
          console.error('Error fetching location suggestions:', error);
        }
      );
    }
  }

  async onSelectSuggestion(placeId: any){
    let apiParams = {
      placeId: placeId,
    }
    if (this.searchedText.length > 2) {

      await this.apiService.getDataWithParams('/home/fetchSelectedAddressDeatils', apiParams).subscribe(
        (response) => {
          this.location = JSON.parse(JSON.stringify(response));
          this.deliveryAddress = this.location.display_address.address_line;
          this.closeAddressPopup();
          localStorage.setItem('location', JSON.stringify(response));
          sessionStorage.removeItem('mallsList');
          sessionStorage.removeItem('mallsOffset');
          sessionStorage.removeItem('shopsList');
          sessionStorage.removeItem('shopsOffset');
          sessionStorage.removeItem('scrollPosition-shops');
        },
        (error) => {
          console.error('Error fetching location details:', error);
        }
      );
    }
  }

  private getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
  }

  async fetchLocationDetails(address : any, lat: number, lon: number) {
    let apiParams = {
      lat: lat,
      lon: lon,
    }
    await this.apiService.getDataWithParams('/home/getUserLocation', apiParams).subscribe(
      (response) => {
        this.location = JSON.parse(JSON.stringify(response));
        this.deliveryAddress = this.location.display_address.address_line;
        if (address != ''){
          this.deliveryAddress = address?.house_no + (address?.floor_no ? ', ' + address?.floor_no : '') + (address?.tower_block ? ', ' + address?.tower_block : '') + (address?.landmark ? ', ' + address?.landmark : '') + ', ' + address?.full_address;
        }
        localStorage.setItem('location', JSON.stringify(response));
        sessionStorage.removeItem('mallsList');
        sessionStorage.removeItem('mallsOffset');
        sessionStorage.removeItem('shopsList');
        sessionStorage.removeItem('shopsOffset');
        sessionStorage.removeItem('scrollPosition-shops');
      },
      (error) => {
        console.error('Error fetching location details:', error);
      }
    );
  }

 async applyCoupon(){
  console.log('Coupon applied');
  let coupon_discount_percentage = 50;
  let billing_amount = this.totalMRP - this.totalDiscount;
  if(billing_amount < 5000){
    alert('Minimum order value should be 500');
    return;
  }
  else{
    let max_discount_amount = 500;
    let discount_amount = 0;
    discount_amount = (billing_amount * coupon_discount_percentage)/100;
    console.log('Discount amount: ', discount_amount);
    if(discount_amount > max_discount_amount){
      discount_amount = max_discount_amount;
    }else{
      discount_amount = discount_amount;
    }
    this.couponDiscount = discount_amount;
    console.log('coupoun amount: ', this.couponDiscount);
    this.totalPrice = this.totalPrice - this.couponDiscount;
    this.couponApplied = true;
    this.couponCode = 'COUPON50';
  }
 }

 async removeAppliedCoupon(){
  this.couponApplied = false;
  this.couponCode = '';
  this.totalPrice = this.totalPrice + this.couponDiscount;
  this.couponDiscount = 0;
 }

}