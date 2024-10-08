import { Component, HostListener, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { DataShareService } from '../services/data.share.service';
import { Location } from '@angular/common';


@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.css'
})
export class WishlistComponent implements OnInit {

  public loggedInUserId = localStorage.getItem('loggedInUserId');
  public wishlistedProducts : any[] = [];

  public constructor(private apiService: ApiService, private router: Router, private dataShareService: DataShareService,  private location: Location) {}

  async ngOnInit() {
    await this.getWishlistedProducts();
  }

  async getWishlistedProducts(){
    let apiParams = {
      user_id: this.loggedInUserId
    }
  
    await this.apiService.getDataWithParams('/home/getWishlistedProducts', apiParams).subscribe(
      (response) => {
        console.log('res', response);
        this.wishlistedProducts = JSON.parse(JSON.stringify(response.result));
        console.log('wishlistedProducts', this.wishlistedProducts);
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
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
        console.log('removeFromWishlist', response)
        if(response.code == 500 && response.message == 'sucess'){
          this.wishlistedProducts = this.wishlistedProducts.filter(p => p.product_id !== product.product_id);
        }else{
          alert('Unable To remove from wishlist');
        }

    });
  }

  gotoShowProductPage(product:any){
    this.dataShareService.setProductDetails(product);
    return this.router.navigate(['/product', product.product_id] );
  }
 
  goToBagPage(){
    return this.router.navigate(['/cart', this.loggedInUserId ]);
  }

  goBackToPreviousPage() {
    this.location.back();
  }
}
