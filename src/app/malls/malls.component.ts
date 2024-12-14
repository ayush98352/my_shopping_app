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
  public coordinates: any;
  public mallDetails: any;

  constructor(private apiService: ApiService, private router: Router, private dataShareService: DataShareService, private matIconRegistry: MatIconRegistry, private domSanitizer: DomSanitizer, private svgRegistryService: SvgRegistryService, private location: Location) {}



  async ngOnInit() {
    let location = JSON.parse(localStorage.getItem('location') || '{}');  
    this.coordinates = location['coordinate'];

    this.mallDetails = this.dataShareService.getMallDetails();
    await this.getMallsStoresList();
   
  }

  async getMallsStoresList(){
    let apiParams = {
      mall_id: this.mallDetails['mall_id']
    }
    await this.apiService.getDataWithParams('/home/getMallsStoresList', apiParams).subscribe(
      (response) => {
        this.shopsList = JSON.parse(JSON.stringify(response.result));
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
    this.dataShareService.setStoreDetails(store);
    return this.router.navigate(['/store']);
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
