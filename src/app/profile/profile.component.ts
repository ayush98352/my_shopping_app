import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ApiService } from '../services/api.service';
import { CommonModule, NgOptimizedImage, provideImgixLoader } from '@angular/common'; // Import CommonModule
import { RouterModule, Router } from '@angular/router';
import { DataShareService } from '../services/data.share.service';
import { MatIconModule } from '@angular/material/icon';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { SvgRegistryService } from '../services/svg-registry.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],  // Add this line
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})

export class ProfileComponent implements OnInit {
  public phoneNumber = localStorage.getItem('phoneNumber');
  public loggedInUserId = localStorage.getItem('loggedInUserId');
  public activeTab = 'profile';

  
  navigationItems = [
    { icon: 'wallet', label: 'Wallet' },
    { icon: 'headphones-alt', label: 'Support' },
    { icon: 'credit-card', label: 'Payments' }
  ];

  yourInfoItems = [
    { icon: 'my-order-icon', label: 'My orders', clicked: 'gotoYourOrdersPage' },
    // { icon: 'bookmark', label: 'Bookmarked Recipes', clicked: 'gotoBookmarkedRecipesPage' },
    { icon: 'address-book-icon', label: 'Address book', clicked: 'gotoAddressBookPage' },
    { icon: 'collected-coupon-icon', label: 'Collected coupons', clicked: 'gotoCollectedCouponsPage' },
  ];

  // otherInfoItems = [
  //   { icon: 'share', label: 'Share the app', clicked: 'shareAppLink' },
  //   { icon: 'info', label: 'About us', clicked: 'gotoAboutUsPage' },
  //   { icon: 'lock', label: 'Account privacy', clicked: 'gotoAccPrivacyPage' },
  //   // { icon: 'bell', label: 'Notification preferences', clicked: '' },
  //   { icon: 'sign-out', label: 'Log out', clicked: 'logout' }
  // ];

  otherInfoItems = [
    { icon: 'my-review-icon', label: 'My Review', clicked: 'goTomyReview' },
    { icon: 'my-wallet-icon', label: 'My Wallet', clicked: 'goTomyWallet' },
    { icon: 'customer-service-icon', label: 'Customer Service', clicked: 'goToCustomerService' },
    { icon: 'return-policy-icon', label: 'Return Policy', clicked: 'goToReturnPolicy' },
    { icon: 'about-us-icon', label: 'About Us', clicked: 'gotoAboutUsPage' },
    { icon: 'setting-icon', label: 'Settings', clicked: 'goToSettings' },
    { icon: 'logout-icon', label: 'Log out', clicked: 'logout' }
  ];

  constructor(private apiService: ApiService, private router: Router, private dataShareService: DataShareService, private matIconRegistry: MatIconRegistry, private domSanitizer: DomSanitizer, private svgRegistryService: SvgRegistryService){}

  ngOnInit(): void {
    const svgNames = ['my-order-icon', 'my-review-icon', 'my-wallet-icon', 'customer-service-icon', 'return-policy-icon', 'about-us-icon', 'setting-icon', 'logout-icon', 'address-book-icon', 'collected-coupon-icon']; // Your SVG names
    svgNames.forEach(name => this.svgRegistryService.registerSvgIcon(name));
  }

  changeFooterTab(tab: any){
    this.activeTab = tab;
  }

  gotoHomePage(){
    return this.router.navigate(['/home']);
  }

  logout(){
    localStorage.clear()
    this.router.navigate(['/login'])
  }

  gotoShopsPage(){
    return this.router.navigate(['/shops']);
  }

  scrollToTop() {
    const scrollContainer = document.querySelector('.profile-container') as HTMLElement;
    if (scrollContainer) {
      scrollContainer.scrollTop = 0;
    }
  }
  gotoExplorePage(){
    return this.router.navigate(['/explore']);
  }

  gotoAddressBookPage(){
    return this.router.navigate(['/address-book']);
  }

  gotoAboutUsPage(){
    console.log('gotoAboutUsPage')
    // this.router.navigate(['/about-us']);
  }

  gotoAccPrivacyPage(){
    this.router.navigate(['/account-privacy']);
  }
  shareAppLink(){
    console.log('shareAppLink')
  }

  gotoYourOrdersPage(){
    this.router.navigate(['/my-orders']);
  }

  gotoCollectedCouponsPage(){
    console.log('collected coupons')
  }

  gotoBookmarkedRecipesPage(){
    console.log('bookmarked recipes')
  }

  goBackToPreviousPage(){
    window.history.back();
  }

  handleClick(functionName: string) {
    console.log('handleClick called with functionName:', functionName);
    switch(functionName) {
      case 'shareAppLink':
          this.shareAppLink();
          break;
      case 'gotoAboutUsPage':
          this.gotoAboutUsPage();
          break;
      case 'gotoAccPrivacyPage':
          this.gotoAccPrivacyPage();
          break;
      case 'logout':
          this.logout();
          break;
    }
  }

}