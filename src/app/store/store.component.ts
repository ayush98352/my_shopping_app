import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common'; // Import CommonModule
import { DataShareService } from '../services/data.share.service';
import { ApiService } from '../services/api.service';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { SvgRegistryService } from '../services/svg-registry.service';

interface Category {
  title: string;
  image: string;
  route: string;
  label: string;
}

@Component({
  selector: 'app-store',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],  // Add this line
  templateUrl: './store.component.html',
  styleUrl: './store.component.css'
})
export class StoreComponent implements OnInit {

  public coordinates: any;
  public activeTab = 'stores';
  public storeDetails: any;
  public activeFashionTab :any;
  public recommendedProducts: any = [];
  public loggedInUserId = localStorage.getItem('loggedInUserId');
  public activeContentTab = 'Inventory';
  public isLoading = true;

  mainCategories: Category[] = [
    { title: 'Men Fashion', image: 'men-fashion-icon', route: '/men', label: 'Men' },
    { title: 'Women Fashion', image: 'women-fashion-icon', route: '/women', label: 'Women' },
    { title: 'Kids Fashion', image: 'kids-fashion-icon', route: '/kids', label: 'Kids' },
  ];
  productsfilters: any = {
    'Men' : ['Topwear', 'Bottomwear', 'Ethnic', 'Innerwear', 'Winterwear', 'Footwear', 'Fashion Accessories'],
    'Women' : ['Dresses', 'Tops', 'Bottoms', 'Co ords', 'Ethnic', 'Winterwear', 'Lingerie', 'Footwear', 'Fashion Accessories'],
    'Kids' : ['Boys Clothing', 'Girls Clothing', 'Footwear', 'Toys & Games', 'Infants', 'Accessories']
  }

  contentViewTab: any = ['Inventory', 'Offers', 'Reviews', 'About'];
  
  constructor(private apiService: ApiService, private router: Router, private dataShareService: DataShareService, private matIconRegistry: MatIconRegistry, private domSanitizer: DomSanitizer, private svgRegistryService: SvgRegistryService, private location: Location) {}

  async ngOnInit() {

    const svgNames = ['men-fashion-icon', 'men-fashion-icon-active', 'women-fashion-icon', 'women-fashion-icon-active', 'kids-fashion-icon', 'kids-fashion-icon-active']; // Your SVG names
    svgNames.forEach(name => this.svgRegistryService.registerSvgIcon(name));

    let location = JSON.parse(localStorage.getItem('location') || '{}');  
    this.coordinates = location['coordinate'];

    this.storeDetails = this.dataShareService.getStoreDetails();
    this.activeFashionTab = 'Women';

    await this.getRecommenedProducts();
  }

  async getRecommenedProducts(){
    let apiParams = {
      user_id: this.loggedInUserId,
    }
    await this.apiService.getDataWithParams('/home/getRecommenedProducts', apiParams).subscribe(
      (response) => {
        this.isLoading = false;
        this.recommendedProducts = JSON.parse(JSON.stringify(response.result));
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
  }

  changeFooterTab(tab: any){
    this.activeTab = tab;
  }

  changeFashionTab(tab: any){
    this.activeFashionTab = tab;
   
  }

  changeContentTab(tab: any){
    this.activeContentTab = tab;
  }

  gotoShowProductPage(product:any){
    this.dataShareService.setProductDetails(product);
    return this.router.navigate(['/product', product.product_id] );
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

  goToStorePage(store: any){
    console.log('goToStorePage', store);
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

  gotoProfilePage(){
    return this.router.navigate(['/profile']);
  }

  gotoExplorePage(){
    return this.router.navigate(['/explore']);
  }

  gotoHomePage(){
    return this.router.navigate(['/home']);
  }
  goBackToPreviousPage(){
    this.location.back();
  }
}
