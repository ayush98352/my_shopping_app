import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule, Location } from '@angular/common'; // Import CommonModule
import { DataShareService } from '../services/data.share.service';
import { ApiService } from '../services/api.service';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { SvgRegistryService } from '../services/svg-registry.service';


@Component({
  selector: 'app-malls',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],  // Add this line
  templateUrl: './malls.component.html',
  styleUrl: './malls.component.css'
})
export class MallsComponent implements OnInit {

  public activeTab = 'stores';
  public activeExploreTab = 'Malls';
  public mallsList: any[] = [];
  public shopsList: any[] = [];
  public shopsListDisplay: any[] = [];
  public coordinates: any;
  public mallDetails: any;
  public isLoading = true;
  public searchedText = '';


  constructor(private apiService: ApiService, private router: Router, private dataShareService: DataShareService, private matIconRegistry: MatIconRegistry, private domSanitizer: DomSanitizer, private svgRegistryService: SvgRegistryService, private location: Location) {}



  async ngOnInit() {
    let location = JSON.parse(localStorage.getItem('location') || '{}');  
    this.coordinates = location['coordinate'];

    this.mallDetails = this.dataShareService.getMallDetails();
    // await this.getMallsStoresList();
    await this.loadCachedData();
  }

  async loadCachedData() {
    // Load cached products and scroll position from session storage
    const cachedProducts = sessionStorage.getItem(`shopsList-mallspage-${this.mallDetails['mall_id']}`);
    const cachedScrollPosition = sessionStorage.getItem(`scrollPosition-malls`);
    
    if (cachedProducts) {
      this.shopsList = JSON.parse((cachedProducts));
      this.isLoading = false;
    }
    else{
      await this.getMallsStoresList();
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

  async getMallsStoresList(){
    let apiParams = {
      mall_id: this.mallDetails['mall_id']
    }
    await this.apiService.getDataWithParams('/home/getMallsStoresList', apiParams).subscribe(
      (response) => {
        this.shopsList = JSON.parse(JSON.stringify(response.result));
        sessionStorage.setItem(`shopsList-mallspage-${this.mallDetails['mall_id']}`, JSON.stringify(this.shopsList));
        this.isLoading = false;
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
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

  changeFooterTab(tab: any){
    this.activeTab = tab;
  }

  goToStorePage(store: any){
    this.storeScrollPosition();
    this.dataShareService.setStoreDetails(store);
    return this.router.navigate(['/store']);
  }

  goToWishlistPage(){
    this.storeScrollPosition();
    return this.router.navigate(['/wishlist']);
  }

  goToBagPage(){
    this.storeScrollPosition();
    return this.router.navigate(['/cart']);
  }

  // goToSearchPage(){
  //   this.storeScrollPosition();
  //   return this.router.navigate(['/search'] );
  // }

  gotoProfilePage(){
    sessionStorage.removeItem('scrollPosition-malls');
    return this.router.navigate(['/profile']);
  }

  gotoExplorePage(){
    sessionStorage.removeItem('scrollPosition-malls');
    return this.router.navigate(['/explore']);
  }

  gotoHomePage(){
    sessionStorage.removeItem('scrollPosition-malls');
    return this.router.navigate(['/home']);
  }

  goBackToPreviousPage(){
    sessionStorage.removeItem('scrollPosition-malls')
    this.location.back();
  }

  storeScrollPosition() {
    const scrollContainer = document.querySelector('.content') as HTMLElement;
    if (scrollContainer) {
      sessionStorage.setItem('scrollPosition-malls', scrollContainer.scrollTop.toString());
    }
  }

  scrollToTop() {
    const scrollContainer = document.querySelector('.content') as HTMLElement;
    if (scrollContainer) {
      scrollContainer.scrollTop = 0;
    }
  }

  @HostListener('scroll', ['$event'])
  onScroll(event: Event): void {
    // const target = event.target as HTMLElement;
    // const scrollPosition = target.scrollTop + target.clientHeight;
    // const pageHeight = target.scrollHeight;

    // if (scrollPosition >= pageHeight - 40 && !this.isLoading && !this.isLoadingContent) {
    //   this.getRecommenedProducts();
    // }
  }

  async searchShops(event: any){
    this.searchedText = event.target.value;
    this.shopsListDisplay = this.shopsList.filter((shop: any) => {
      return shop?.name.toLowerCase().includes(this.searchedText.toLowerCase());
    }).sort((a, b) => {
      const aIndex = a.name.toLowerCase().indexOf(this.searchedText.toLowerCase());
      const bIndex = b.name.toLowerCase().indexOf(this.searchedText.toLowerCase());
      return aIndex - bIndex;
    });
  }

}
