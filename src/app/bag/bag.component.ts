import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { CommonModule } from '@angular/common';
import { RouterModule, Route, Router } from '@angular/router';
import { DataShareService } from '../services/data.share.service';

interface BagItem {
  id: number;
  name: string;
  price: number;
  size: string;
  color: string;
  quantity: number;
  imageUrl: string;
}

@Component({
  selector: 'app-bag',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './bag.component.html',
  styleUrl: './bag.component.css'
})
export class BagComponent implements OnInit {
  public bagItems: BagItem[] = [
    {
      id: 1,
      name: 'Classic T-Shirt',
      price: 19.99,
      size: 'M',
      color: 'White',
      quantity: 2,
      imageUrl: '/api/placeholder/120/120'
    },
    {
      id: 2,
      name: 'Slim Fit Jeans',
      price: 49.99,
      size: '32',
      color: 'Blue',
      quantity: 1,
      imageUrl: '/api/placeholder/120/120'
    }
  ];
  public loggedInUserId = localStorage.getItem('loggedInUserId');
  
  constructor(private apiService: ApiService, private router: Router, private dataShareService: DataShareService) { }

  ngOnInit(): void { }

  // async ngOnInit() {
  //   await this.getBagProducts();
  // }
  
  // async getBagProducts(){
  //   let apiParams = {
  //     user_id: this.loggedInUserId
  //   }

  //   await this.apiService.getDataWithParams('/home/getBagProducts', apiParams).subscribe(
  //     (response) => {
  //       console.log('res', response);
  //       this.bagItems = JSON.parse(JSON.stringify(response.result));
  //       console.log('bagItems', this.bagItems);
  //     },
  //     (error) => {
  //       console.error('Error fetching data:', error);
  //     }
  //   );
  // }

  increaseQuantity(index: number): void {
    this.bagItems[index].quantity++;
  }

  decreaseQuantity(index: number): void {
    if (this.bagItems[index].quantity > 1) {
      this.bagItems[index].quantity--;
    }
  }

  removeItem(index: number): void {
    this.bagItems.splice(index, 1);
  }

  clearBag(): void {
    this.bagItems = [];
  }

  getTotalPrice(): number {
    return this.bagItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  checkout(): void {
    console.log('Proceeding to checkout...');
    // Implement checkout logic here
  }
}
