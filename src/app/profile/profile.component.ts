import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ApiService } from '../services/api.service';
import { CommonModule, NgOptimizedImage, provideImgixLoader } from '@angular/common'; // Import CommonModule
import { RouterModule, Router } from '@angular/router';
import { DataShareService } from '../services/data.share.service';
import { MatIconModule } from '@angular/material/icon';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { SvgRegistryService } from '../services/svg-registry.service';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageService, SupportedLang } from '../services/language.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, TranslatePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],  // Add this line
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})

export class ProfileComponent implements OnInit {
  public phoneNumber = localStorage.getItem('phoneNumber');
  public loggedInUserId = localStorage.getItem('loggedInUserId');
  public userName = localStorage.getItem('userName');
  public userEmail = localStorage.getItem('userEmail');
  public activeTab = 'profile';

  
  navigationItems = [
    { icon: 'wallet', labelKey: 'profile.my_wallet' },
    { icon: 'headphones-alt', labelKey: 'profile.customer_service' },
    { icon: 'credit-card', labelKey: 'profile.settings' }
  ];

  yourInfoItems = [
    { icon: 'my-order-icon', labelKey: 'profile.my_orders', clicked: 'gotoYourOrdersPage' },
    { icon: 'address-book-icon', labelKey: 'profile.address_book', clicked: 'gotoAddressBookPage' },
    { icon: 'collected-coupon-icon', labelKey: 'profile.collected_coupons', clicked: 'gotoCollectedCouponsPage' },
  ];

  otherInfoItems = [
    { icon: 'my-review-icon', labelKey: 'profile.my_review', clicked: 'goTomyReview' },
    { icon: 'my-wallet-icon', labelKey: 'profile.my_wallet', clicked: 'goTomyWallet' },
    { icon: 'customer-service-icon', labelKey: 'profile.customer_service', clicked: 'goToCustomerService' },
    { icon: 'return-policy-icon', labelKey: 'profile.return_policy', clicked: 'goToReturnPolicy' },
    { icon: 'about-us-icon', labelKey: 'profile.about_us', clicked: 'gotoAboutUsPage' },
    { icon: 'setting-icon', labelKey: 'profile.settings', clicked: 'goToSettings' },
    { icon: 'logout-icon', labelKey: 'profile.logout', clicked: 'logout' }
  ];

  constructor(private apiService: ApiService, private router: Router, private dataShareService: DataShareService, private matIconRegistry: MatIconRegistry, private domSanitizer: DomSanitizer, private svgRegistryService: SvgRegistryService, public languageService: LanguageService){}

  setLanguage(lang: SupportedLang): void {
    this.languageService.setLanguage(lang);
  }

  get currentLang(): SupportedLang {
    return this.languageService.getCurrentLang();
  }

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
      case 'goToSettings':
          this.router.navigate(['/settings']);
          break;
      case 'logout':
          this.logout();
          break;
    }
  }

}