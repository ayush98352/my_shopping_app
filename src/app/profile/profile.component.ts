import { Component, OnInit, NO_ERRORS_SCHEMA } from '@angular/core';
import { ApiService } from '../services/api.service';
import { CommonModule, NgOptimizedImage, provideImgixLoader } from '@angular/common'; // Import CommonModule
import { RouterModule, Router } from '@angular/router';
import { DataShareService } from '../services/data.share.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})

export class ProfileComponent implements OnInit {
  public phoneNumber = localStorage.getItem('phoneNumber');
  public loggedInUserId = localStorage.getItem('loggedInUserId');


  
  navigationItems = [
    { icon: 'wallet', label: 'Wallet' },
    { icon: 'headphones-alt', label: 'Support' },
    { icon: 'credit-card', label: 'Payments' }
  ];

  yourInfoItems = [
    { icon: 'receipt', label: 'Your orders', clicked: 'gotoYourOrdersPage' },
    // { icon: 'bookmark', label: 'Bookmarked Recipes', clicked: 'gotoBookmarkedRecipesPage' },
    { icon: 'book', label: 'Address book', clicked: 'gotoAddressBookPage' },
    { icon: 'ticket', label: 'Collected coupons', clicked: 'gotoCollectedCouponsPage' },
  ];

  otherInfoItems = [
    { icon: 'share', label: 'Share the app', clicked: 'shareAppLink' },
    { icon: 'info', label: 'About us', clicked: 'gotoAboutUsPage' },
    { icon: 'lock', label: 'Account privacy', clicked: 'gotoAccPrivacyPage' },
    // { icon: 'bell', label: 'Notification preferences', clicked: '' },
    { icon: 'sign-out', label: 'Log out', clicked: 'logout' }
  ];
  constructor(private apiService: ApiService, private router: Router, private dataShareService: DataShareService){}

  ngOnInit(): void {

  }

  logout(){
    localStorage.clear()
    this.router.navigate(['/login'])
  }

  gotoAddressBookPage(){
    return this.router.navigate(['/address-book']);
  }

  gotoAboutUsPage(){
    this.router.navigate(['/about-us']);
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
}