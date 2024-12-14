import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { DataShareService } from '../services/data.share.service';
import { ApiService } from '../services/api.service';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { SvgRegistryService } from '../services/svg-registry.service';


interface Shop {
  id: string;
  name: string;
  location: string;
  image: string;
  isFavorite: boolean;
}

interface Filter {
  label: string;
  value: string;
}

interface SortOption {
  label: string;
  value: string;
}

interface Category {
  title: string;
  image: string;
  route: string;
  label: string;
}

@Component({
  selector: 'app-shops',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],  // Add this line
  templateUrl: './shops.component.html',
  styleUrl: './shops.component.css'
})

export class ShopsComponent implements OnInit {
  public activeTab = 'stores';
  public activeExploreTab = 'Malls';
  public mallsList: any[] = [];
  public shopsList: any[] = [];
  public coordinates: any;

  shopsCategory: Shop[] = [
    { id: '1', name: 'Best Rated', location: 'Mall A', image: 'best-rated-shops', isFavorite: false },
    { id: '2', name: 'Open Now', location: 'Mall B', image: 'open-now-shops', isFavorite: false },
    { id: '3', name: 'New Launched', location: 'Mall C', image: 'new-launched-shops', isFavorite: false },
    { id: '2', name: 'Open Now', location: 'Mall B', image: 'open-now-shops', isFavorite: false },
    { id: '3', name: 'New Launched', location: 'Mall C', image: 'new-launched-shops', isFavorite: false }
  ];

  filters: Filter[] = [
    { label: 'Category', value: 'category' },
    { label: 'New', value: 'new' },
    { label: 'Trendy', value: 'trendy' },
    { label: 'Free Delivery', value: 'freeDelivery' }
  ];

  sortOptions: SortOption[] = [
    { label: 'Relevance', value: 'relevance' },
    { label: 'Price: Low to High', value: 'priceAsc' },
    { label: 'Price: High to Low', value: 'priceDesc' },
    { label: 'Rating: High to Low', value: 'ratingDesc' }
  ];

  mainCategories: Category[] = [
    { title: 'Explore Malls', image: 'explore-malls', route: '/malls', label: 'Malls' },
    { title: 'Explore Shops', image: 'explore-shops', route: '/shops', label: 'Shops' },
  ];

  sortBy: string = 'relevance';

  constructor(private apiService: ApiService, private router: Router, private dataShareService: DataShareService, private matIconRegistry: MatIconRegistry, private domSanitizer: DomSanitizer, private svgRegistryService: SvgRegistryService) {}

  async ngOnInit() {
    let location = JSON.parse(localStorage.getItem('location') || '{}');  
    this.coordinates = location['coordinate'];
    await this.getMallsList();
    this.getShopsList();
  }

  toggleFavorite(shop: Shop): void {
    shop.isFavorite = !shop.isFavorite;
  }
  
  async getMallsList(){
    let apiParams = {
      latitude: this.coordinates['lat'],
      longitude: this.coordinates['lon']
    }

    await this.apiService.getDataWithParams('/home/getMallsList', apiParams).subscribe(
      (response) => {
        this.mallsList = JSON.parse(JSON.stringify(response.result));
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
  }

  async getShopsList(){
    let apiParams = {
      latitude: this.coordinates['lat'],
      longitude: this.coordinates['lon']
    }

    await this.apiService.getDataWithParams('/home/getShopsList', apiParams).subscribe(
      (response) => {
        this.shopsList = JSON.parse(JSON.stringify(response.result));
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
  }

  async goToMallsPage(item: any){
    this.dataShareService.setMallDetails(item);
    return this.router.navigate(['/malls']);
  }

  async goToStorePage(item: any){
    console.log('goToStorePage', item);
  }

  changeExploreTab(tab: any){
    this.activeExploreTab = tab;
  }

  changeFooterTab(tab: any){
    this.activeTab = tab;
  }

  getNumberSuffix(value: number): string {
    if (value == null) return '';

    // Handle the exceptions for 11th, 12th, and 13th
    const lastDigit = value % 10;
    const lastTwoDigits = value % 100;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
      return `th`;
    }

    // Default cases for 1st, 2nd, 3rd, and others
    switch (lastDigit) {
      case 1:
        return `st`;
      case 2:
        return `nd`;
      case 3:
        return `rd`;
      default:
        return `th`;
    }
  }

  addToCart(shop: Shop): void {
    // Add shop to cart logic
  }

  applyFilter(filter: Filter): void {
    // Apply filter logic
  }

  sortShops(): void {
    // Sort shops based on the selected sortBy option
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


}