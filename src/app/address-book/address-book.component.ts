import { Component, OnInit, NO_ERRORS_SCHEMA } from '@angular/core';
import { ApiService } from '../services/api.service';
import { CommonModule, NgOptimizedImage, provideImgixLoader } from '@angular/common'; // Import CommonModule
import { RouterModule, Router } from '@angular/router';
import { DataShareService } from '../services/data.share.service';

@Component({
  selector: 'app-address-book',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './address-book.component.html',
  styleUrl: './address-book.component.css'
})
export class AddressBookComponent implements OnInit {

  public savedAddresses: any= [];
  public loggedInUserId = localStorage.getItem('loggedInUserId');

  constructor(private apiService: ApiService, private router: Router, private dataShareService: DataShareService){}

  ngOnInit(): void {
    this.savedAddresses = JSON.parse(localStorage.getItem('addresses') || '[]');
    
    if(this.savedAddresses.length === 0){
      this.getSavedAddress();
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

  goBackToPreviousPage(){
    window.history.back();
  }

  gotoAddAddressPage(){
    return this.router.navigate(['/add-address']);
  }


}
