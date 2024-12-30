import { Component, OnInit, HostListener } from '@angular/core';
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
  public isLoading = true;
  public isLoadingMallsContent: boolean = false;
  public isLoadingShopsContent: boolean = false;

  mallsOffset: number = 0;
  mallsLimit: number = 5;
  allMallsLoaded: boolean = false;

  shopsOffset: number = 0;
  shopsLimit: number = 10; 
  allShopsLoaded: boolean = false;
  public searchedText: string = '';
  public shopsListDisplay: any[] = [];
  public mallsListDisplay: any[] = [];
  public isLoadingSearchResults: boolean = false;


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
    // await this.getMallsList();
    // this.getShopsList();
    await this.loadCachedData();
  }

  async loadCachedData() {
    // Load cached products and scroll position from session storage
    const cachedMallsList = sessionStorage.getItem('mallsList');
    const cachedMallsOffset = sessionStorage.getItem('mallsOffset');
    const cachedScrollPosition = sessionStorage.getItem('scrollPosition-shops');

    const cachedShopsList = sessionStorage.getItem('shopsList');
    const cachedShopsOffset = sessionStorage.getItem('shopsOffset');

    const cachedExploreTab =   sessionStorage.getItem('shopsExploreTab');

    if (cachedMallsList && cachedShopsList) {
      this.mallsList = JSON.parse((cachedMallsList));
      this.mallsOffset = cachedMallsOffset ? parseInt(cachedMallsOffset) : 0;
      this.allMallsLoaded = this.mallsList.length < this.mallsOffset;

      this.shopsList = JSON.parse((cachedShopsList));
      this.shopsOffset = cachedShopsOffset ? parseInt(cachedShopsOffset) : 0;
      this.allShopsLoaded = this.shopsList.length < this.shopsOffset;

      this.isLoading = false;
    }else{
      this.getMallsList();
      this.getShopsList();
    }

    if(cachedExploreTab){
      this.activeExploreTab = cachedExploreTab;
    }
  
    if (cachedScrollPosition) {
      setTimeout(() => {
        const scrollContainer = document.querySelector('.content') as HTMLElement;
        if (scrollContainer) {
          scrollContainer.scrollTop = parseInt(cachedScrollPosition, 10); // Restore scroll position
        }
      }, 0); // Restore after rendering
    }
  }

  toggleFavorite(shop: Shop): void {
    shop.isFavorite = !shop.isFavorite;
  }
  
  async getMallsList(){

    if (this.allMallsLoaded || this.isLoadingMallsContent) return;
    if(!this.isLoading){
      this.isLoadingMallsContent = true;
    };


    let apiParams = {
      latitude: this.coordinates['lat'],
      longitude: this.coordinates['lon'],
      offset: this.mallsOffset,
      limit: this.mallsLimit,
      searchText: this.searchedText
    };

    await this.apiService.getDataWithParams('/home/getMallsList', apiParams).subscribe(
      (response) => {
        let data = JSON.parse(JSON.stringify(response.result));
        if (data.length === 0 || data.length < this.mallsLimit) {
          this.allMallsLoaded = true;
        }
        if(this.searchedText.length > 1){
          this.mallsListDisplay = [...this.mallsListDisplay, ...data];
          this.mallsOffset += this.mallsLimit;
          this.isLoadingSearchResults = false;
        }  
        else {
          this.mallsList = [...this.mallsList, ...data];
          this.mallsOffset += this.mallsLimit;
          this.cacheData();
          this.mallsListDisplay = [];
        }
        console.log('mallsListDisplay', this.mallsListDisplay);
      },
      (error) => {
        console.error('Error fetching data:', error);
      },
      () => {
        if(this.activeExploreTab == 'Malls'){
          this.isLoading = false;
        }
        this.isLoadingMallsContent = false;
      }
    );
  }

  async getShopsList(){

    if (this.allShopsLoaded || this.isLoadingShopsContent) return;
    if(!this.isLoading){
      this.isLoadingShopsContent = true;
    };


    let apiParams = {
      latitude: this.coordinates['lat'],
      longitude: this.coordinates['lon'],
      offset: this.shopsOffset,
      limit: this.shopsLimit,
      searchText: this.searchedText
    };

    await this.apiService.getDataWithParams('/home/getShopsList', apiParams).subscribe(
      (response) => {
        let data = JSON.parse(JSON.stringify(response.result));
        if (data.length === 0 || data.length < this.shopsLimit) {
          this.allShopsLoaded = true;
        }
        if(this.searchedText.length > 1){
          this.shopsListDisplay = [...this.shopsListDisplay, ...data];
          this.shopsOffset += this.shopsLimit;
          this.isLoadingSearchResults = false;
        } 
        else {
          this.shopsList = [...this.shopsList, ...data];
          this.shopsOffset += this.shopsLimit;
          this.cacheData();
          this.shopsListDisplay = [];
        }
        console.log('shopsList', this.shopsList);
        console.log('shopsListDisplay', this.shopsListDisplay);
      },
      (error) => {
        console.error('Error fetching data:', error);
      },
      () => {
        if(this.activeExploreTab == 'Shops'){
          this.isLoading = false;
        }
        this.isLoadingShopsContent = false;
      }
    );
  }

  async goToMallsPage(item: any){
    this.dataShareService.setMallDetails(item);
    this.storeScrollPosition();
    return this.router.navigate(['/malls']);
  }

  async goToStorePage(store: any){
    this.storeScrollPosition();
    this.dataShareService.setStoreDetails(store);
    return this.router.navigate(['/store']);
  }

  async changeExploreTab(tab: any){
    sessionStorage.setItem('shopsExploreTab', tab);
    this.searchedText = '';
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
    this.storeScrollPosition();
    return this.router.navigate(['/wishlist']);
  }

  goToBagPage(){
    this.storeScrollPosition();
    return this.router.navigate(['/cart']);
  }

  goToSearchPage(){
    this.storeScrollPosition();
    return this.router.navigate(['/search'] );
  }

  gotoProfilePage(){
    this.storeScrollPosition();
    return this.router.navigate(['/profile']);
  }

  gotoExplorePage(){
    this.storeScrollPosition();
    return this.router.navigate(['/explore']);
  }

  gotoHomePage(){
    this.storeScrollPosition();
    return this.router.navigate(['/home']);
  }

  scrollToTop() {
    const scrollContainer = document.querySelector('.content') as HTMLElement;
    if (scrollContainer) {
      scrollContainer.scrollTop = 0;
    }
  }


  @HostListener('scroll', ['$event'])
  onScroll(event: Event): void {
    const target = event.target as HTMLElement;
    const scrollPosition = target.scrollTop + target.clientHeight;
    const pageHeight = target.scrollHeight;

    if (scrollPosition >= pageHeight - 40 && !this.isLoading && !this.isLoadingShopsContent && this.activeExploreTab == 'Shops' && !this.allShopsLoaded) {
      this.getShopsList();
    }

    if (scrollPosition >= pageHeight - 40 && !this.isLoading && !this.isLoadingMallsContent && this.activeExploreTab == 'Malls' && !this.allMallsLoaded) {
      this.getMallsList();
    }
  }

  storeScrollPosition() {
    const scrollContainer = document.querySelector('.content') as HTMLElement;
    if (scrollContainer) {
      sessionStorage.setItem('scrollPosition-shops', scrollContainer.scrollTop.toString());
    }
  }

  cacheData(): void {
    // Save products and offset in session storage
    sessionStorage.setItem('mallsList', JSON.stringify(this.mallsList));
    sessionStorage.setItem('mallsOffset', this.mallsOffset.toString());
    sessionStorage.setItem('shopsList', JSON.stringify(this.shopsList));
    sessionStorage.setItem('shopsOffset', this.shopsOffset.toString());
  }

  async searchShops(event: any){
    this.searchedText = event.target.value;
    this.mallsListDisplay = [];
    this.shopsListDisplay = [];
    this.isLoadingSearchResults = false;
    if(this.searchedText.length > 1 ){
      this.mallsOffset = 0;
      this.allMallsLoaded = false;
      this.shopsOffset = 0;
      this.allShopsLoaded = false;
      this.isLoadingSearchResults = true;
      if(this.activeExploreTab == 'Malls'){
        await this.getMallsList();
        this.getShopsList();
      }else if(this.activeExploreTab == 'Shops'){
        await this.getShopsList();
        this.getMallsList();
      }
    }
  }
}