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
    { icon: 'support', label: 'Support' },
    { icon: 'credit-card', label: 'Payments' }
  ];

  yourInfoItems = [
    { icon: 'receipt', label: 'Your orders' },
    { icon: 'bookmark', label: 'Bookmarked Recipes' },
    { icon: 'book', label: 'Address book' },
    { icon: 'ticket', label: 'Collected coupons' }
  ];

  otherInfoItems = [
    { icon: 'share', label: 'Share the app' },
    { icon: 'info', label: 'About us' },
    { icon: 'file-text', label: 'Get Feeding India receipt' },
    { icon: 'lock', label: 'Account privacy' },
    { icon: 'bell', label: 'Notification preferences' },
    { icon: 'log-out', label: 'Log out' }
  ];
  constructor(private apiService: ApiService, private router: Router, private dataShareService: DataShareService){}

  ngOnInit(): void {

  }

  goBackToPreviousPage(){
    window.history.back();
  }
}