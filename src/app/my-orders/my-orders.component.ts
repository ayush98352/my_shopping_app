import { Component, OnInit, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { DataShareService } from '../services/data.share.service';
import { RouterModule, Router } from '@angular/router';
import { ApiService } from '../services/api.service';



interface Order {
  id: number;
  deliveryTime: number;
  total: number;
  shippingStatus: string;
  receiverName: string;
  receiverAddress: string;
  productImages: string[];
}

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-orders.component.html',
  styleUrl: './my-orders.component.css'
})


export class MyOrdersComponent implements OnInit {

  public loggedInUserId = localStorage.getItem('loggedInUserId');
  public ordersList = <any>[];
  orders: Order[] = [
    {
      id: 1234,
      deliveryTime: 6,
      total: 156,
      shippingStatus: 'Delivered',
      receiverName: 'John Doe',
      receiverAddress: '123 Main St, Anytown USA',
      productImages: [
        'https://via.placeholder.com/50',
        'https://via.placeholder.com/50',
        'https://via.placeholder.com/50'
      ]
    },
    {
      id: 5678,
      deliveryTime: 8,
      total: 638,
      shippingStatus: 'Shipped',
      receiverName: 'Jane Smith',
      receiverAddress: '456 Oak Rd, Somewhere City',
      productImages: [
        'https://via.placeholder.com/50',
        'https://via.placeholder.com/50',
        'https://via.placeholder.com/50',
        'https://via.placeholder.com/50'
      ]
    },
    {
      id: 9012,
      deliveryTime: 9,
      total: 351,
      shippingStatus: 'Delivered',
      receiverName: 'Bob Johnson',
      receiverAddress: '789 Elm St, Othertown',
      productImages: [
        'https://via.placeholder.com/50',
        'https://via.placeholder.com/50'
      ]
    }
  ];

  constructor(private apiService: ApiService, private router: Router, private dataShareService: DataShareService) { }

  async ngOnInit() {

    await this.getOrdersList();
  }

  async getOrdersList(){
    let apiParams = {
      user_id: this.loggedInUserId,
    }
    await this.apiService.getDataWithParams('/home/getOrdersList', apiParams).subscribe(
      (response) => {
        this.ordersList = JSON.parse(JSON.stringify(response.result));
        console.log('ordersList', this.ordersList)
        console.log('address', this.ordersList[0]?.shipping_address)
        // this.ordersList[0].shipping_address = JSON.parse(this.ordersList[0]?.shipping_address)
        console.log('address type:', typeof this.ordersList[0]?.shipping_address)
        console.log('address', this.ordersList[0]?.shipping_address?.location_info?.formatted_address)
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
        
  }

  reorderItem(order: Order) {
    // Implement reorder functionality
  }

  rateOrder(order: Order) {
    // Implement rate order functionality
  }

  copyOrderId(orderId: string) {
    navigator.clipboard.writeText(orderId).then(() => {
        // Optional: Show a toast or notification that the ID was copied
        console.log('Order ID copied to clipboard');
    });
  }

  goBackToPreviousPage(){
    window.history.back();
  }
}