import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Route, Router } from '@angular/router';
import { DataShareService } from '../services/data.share.service';


// interface Product {
//   name: string;
//   description: string;
//   size: string;
//   quantity: number;
//   price: number;
//   originalPrice: number;
//   discount: number;
//   image: string;
//   deliveryDate: string;
// }

@Component({
  selector: 'app-shopping-bag',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './shopping-bag.component.html',
  styleUrl: './shopping-bag.component.css'
})
export class ShoppingBagComponent implements OnInit{
  deliveryAddress = 'Ayush Kumar, Bhartiya City, Nikoo homes 2, Bengaluru';
  deliveryDate = '13 Oct - 18 Oct'

  public loggedInUserId = localStorage.getItem('loggedInUserId');
  public products = <any> [];
  
  constructor(private apiService: ApiService, private router: Router, private dataShareService: DataShareService, private location: Location) { }

  async ngOnInit() { 
    await this.getCartDetails();
  }

  async getCartDetails(){
    let apiParams = {
      user_id: this.loggedInUserId
    }
    await this.apiService.getDataWithParams('/home/getCartDetails', apiParams).subscribe(
      (response) => {
        this.products = JSON.parse(JSON.stringify(response.result));
        console.log('cartpro', this.products);
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
  }
  
  // products: Product[] = [
  //   {
  //     name: 'Adidas',
  //     description: 'Stella McCartney Ultraboost 5 s.',
  //     size: 'S',
  //     quantity: 1,
  //     price: 14400.00,
  //     originalPrice: 18800.00,
  //     discount: 18.75,
  //     image: '/assets/img/products/adidas_ultraboost_21.jpg',
  //     deliveryDate: '13 Oct - 18 Oct'
  //   },
  //   {
  //     name: 'Adidas',
  //     description: 'Tiro 21 Jacket',
  //     size: 'S',
  //     quantity: 1,
  //     price: 10400.00,
  //     originalPrice: 12800.00,
  //     discount: 18.75,
  //     image: '/assets/img/products/adidas_tiro_21_jacket.jpg',
  //     deliveryDate: '13 Oct - 18 Oct'
  //   },
  //   {
  //     name: 'Adidas',
  //     description: 'Stella McCartney Ultraboost 5 s.',
  //     size: 'S',
  //     quantity: 1,
  //     price: 14400.00,
  //     originalPrice: 18800.00,
  //     discount: 18.75,
  //     image: '/assets/img/products/adidas_tiro_21_jacket.jpg',
  //     deliveryDate: '13 Oct - 18 Oct'
  //   }
  // ];

  goToWishlistPage(){
    return this.router.navigate(['/wishlist', this.loggedInUserId] );
  }
  goBackToPreviousPage() {
    this.location.back();
  }
}
