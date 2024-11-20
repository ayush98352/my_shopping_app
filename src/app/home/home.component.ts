import { Component, HostListener, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { CommonModule, NgOptimizedImage, provideImgixLoader } from '@angular/common'; // Import CommonModule
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { DataShareService } from '../services/data.share.service';



@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, NgOptimizedImage],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  public categories: any;
  public brands: any;
  public recommendedProducts: any = [];
  public loggedInUserId = localStorage.getItem('loggedInUserId');

  public userLocation: any = {
    latitude: null,
    longitude: null
  };
  public locationDetails: any;
  public displayAddress: any;

  public isAddressPopupOpen = false;

  public searchedText = '';
  public addressSuggestions: any[] = [];
  public savedAddresses: any= [];
  public location: any = localStorage.getItem('location') ? JSON.parse(localStorage.getItem('location') || '{}') : {};
  public activeTab = 'home';



  public constructor(private apiService: ApiService, private router: Router, private dataShareService: DataShareService) {}
  async ngOnInit() {
  
    
    if (Object.keys(this?.location).length === 0 ) {
      this.setUserLocation();
    }else{
      this.displayAddress = this.location.display_address.address_line;
    }
    

    await this.apiService.getData('/home/top-categories').subscribe(
      (response) => {
        this.categories = response.result;
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );

    await this.apiService.getData('/home/brands').subscribe(
      (response) => {
        this.brands = response.result;
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );

    await this.getRecommenedProducts();

    this.getSavedAddress();
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

      await this.fetchLocationDetails(this.userLocation.latitude, this.userLocation.longitude);
      
    } catch (error) {
      console.error('Error fetching location:', error);
    }
  }

  async getUserLocation() {
    if (!navigator.geolocation) {
      console.log('Geolocation is not supported by this browser.');
      return;
    }

    try {
      const position = await this.getCurrentPosition();
      this.userLocation.latitude = position.coords.latitude;
      this.userLocation.longitude = position.coords.longitude;

      const originalLat = this.userLocation.latitude;
      const originalLon = this.userLocation.longitude; 
      

      const currentLat = localStorage.getItem('latitude');
      const currentLon = localStorage.getItem('longitude');

      const distance = this.haversineDistance(originalLat, originalLon, currentLat, currentLon);
      const buffer = 100; // Buffer of 100 meters

      if (distance <= buffer && this.displayAddress) {
        
        console.log('You are still in the same building/society.');
      } else {
        localStorage.setItem('latitude', this.userLocation.latitude.toString());
        localStorage.setItem('longitude', this.userLocation.longitude.toString());
        await this.fetchLocationDetails(this.userLocation.latitude, this.userLocation.longitude);
        console.log('You are outside the building/society.');
      }
    } catch (error) {
      console.error('Error fetching location:', error);
    }
  }

  private getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
  }

  private haversineDistance(lat1: number, lon1: number, lat2: string | null, lon2: string | null): number {
    if (!lat2 || !lon2) return Infinity;

    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = parseFloat(lat2) * Math.PI / 180;
    const Δφ = (parseFloat(lat2) - lat1) * Math.PI / 180;
    const Δλ = (parseFloat(lon2) - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  async fetchLocationDetails(lat: number, lon: number) {
    let apiParams = {
      lat: lat,
      lon: lon,
    }
    await this.apiService.getDataWithParams('/home/getUserLocation', apiParams).subscribe(
      (response) => {
        this.location = JSON.parse(JSON.stringify(response));
        this.displayAddress = this.location.display_address.address_line;
        localStorage.setItem('location', JSON.stringify(response))
      },
      (error) => {
        console.error('Error fetching location details:', error);
      }
    );
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
          this.displayAddress = this.location.display_address.address_line;
          this.closeAddressPopup();
          localStorage.setItem('location', JSON.stringify(response))
        },
        (error) => {
          console.error('Error fetching location details:', error);
        }
      );
    }
  }

  async getSavedAddress(){
    let apiParams = {
      user_id: this.loggedInUserId,
    }
    this.apiService.getDataWithParams('/home/getSavedAddress', apiParams).subscribe(
      (response) => {
        this.savedAddresses = JSON.parse(JSON.stringify(response.result));
        localStorage.setItem('addresses', JSON.stringify(this.savedAddresses));
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
  }

  async getRecommenedProducts(){
    let apiParams = {
      user_id: this.loggedInUserId,
    }
    await this.apiService.getDataWithParams('/home/getRecommenedProducts', apiParams).subscribe(
      (response) => {
        this.recommendedProducts = JSON.parse(JSON.stringify(response.result));
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
  }

  async setSavedAddress(address : any){
    
    this.displayAddress = address.house_no + (address.floor_no ? ', ' + address.floor_no : '') + (address.tower_block ? ', ' + address.tower_block : '') + (address.landmark ? ', ' + address.landmark : '') + ', ' + address.full_address;
    await this.fetchLocationDetails(address.latitude.toString(), address.longitude.toString());

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
          const productIndex = this.recommendedProducts.findIndex((prod: any) => prod.product_id === product.product_id);
          if (productIndex !== -1) {
              // Update the iswishlisted property for the specific product
              this.recommendedProducts[productIndex].iswishlisted = "1"; // Set iswishlisted to 1
          }
          else{
            alert('Unable to add to wishlist');
          }
        }else{
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
          const productIndex = this.recommendedProducts.findIndex((prod: any) => prod.product_id === product.product_id);
          if (productIndex !== -1) {
              // Update the iswishlisted property for the specific product
              this.recommendedProducts[productIndex].iswishlisted = "0"; // Set iswishlisted to 1
          }
          else{
            alert('Unable to remove to wishlist');
          }
        
        }else{
          alert('Unable To remove from wishlist');
        }
    });
  }


  onImageError(category: any): void {
    // Set a flag to indicate that the SVG failed to load
    category.hasError = true;
  }

  changeFooterTab(tab: any){
    this.activeTab = tab;
  }

  gotoShowCategoryProductsPage(category: any) {
    this.dataShareService.setData(category.category_name);
    // localStorage.setItem('categoryName', category.name);
    // return this.router.navigate(['/category', category.category_id], { queryParams: { categoryName: category.category_name } });
    return this.router.navigate(['/category', category.category_id] );
  }

  gotoShowBrandProductsPage(brand: any) {
    this.dataShareService.setData(brand.brand_name);
    return this.router.navigate(['/brand', brand.brand_id] );
  }

  gotoShowProductPage(product:any){
    this.dataShareService.setProductDetails(product);
    return this.router.navigate(['/product', product.product_id] );
  }

  goToWishlistPage(){
    return this.router.navigate(['/wishlist']);
  }

  goToBagPage(){
    return this.router.navigate(['/cart']);
  }

  goToSearchPage(){
    return this.router.navigate(['/search'] );
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

  gotoProfilePage(){
    return this.router.navigate(['/profile']);
  }

  gotoExplorePage(){
    return this.router.navigate(['/explore']);
  }
}