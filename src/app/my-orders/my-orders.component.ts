import { Component, OnInit, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { DataShareService } from '../services/data.share.service';
import { RouterModule, Router } from '@angular/router';
import { ApiService } from '../services/api.service';


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
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
        
  }


  copyOrderId(orderId: string) {
    navigator.clipboard.writeText(orderId).then(() => {
        // Optional: Show a toast or notification that the ID was copied
        console.log('Order ID copied to clipboard');
    });
  }

  goToOrderDetails(order: any) {
    this.dataShareService.setOrderId(order?.order_id);
    this.dataShareService.setOrderDetails(order);

    this.router.navigate(['/order-summary']);
  }
  goTorReviewRatingPage(order: any) {
    this.dataShareService.setOrderId(order);
    this.router.navigate(['/review-rating']);
  }

  goBackToPreviousPage(){
    window.history.back();
  }
}