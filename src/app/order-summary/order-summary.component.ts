import { Component, OnInit, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { DataShareService } from '../services/data.share.service';
import { RouterModule, Router } from '@angular/router';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-order-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-summary.component.html',
  styleUrl: './order-summary.component.css'
})
export class OrderSummaryComponent implements OnInit  {
 
  public orderId: any;
  public orderItemsList: any;
  public orderDetails: any;

  constructor(private apiService: ApiService, private router: Router, private dataShareService: DataShareService) {}

  async ngOnInit() {
    this.orderId =this.dataShareService.getOrderId();
    this.orderDetails = this.dataShareService.getOrderDetails();
    await this.getOrderItemsList();
  }

  async getOrderItemsList(){
    let apiParams = {
      order_id: this.orderId,
    }
    await this.apiService.getDataWithParams('/home/getOrderItemsList', apiParams).subscribe(
      (response) => {
        this.orderItemsList = JSON.parse(JSON.stringify(response.result));
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
        
  }

  downloadInvoice(): void {
    // Implement invoice download logic
    console.log('Downloading invoice...');
  }

  rateOrder(): void {
    // Implement rating logic
    console.log('Rating order...');
  }

  chatSupport(): void {
    // Implement chat support logic
    console.log('Opening chat support...');
  }

  copyOrderId(orderId: string) {
    navigator.clipboard.writeText(orderId).then(() => {
        // Optional: Show a toast or notification that the ID was copied
        console.log('Order ID copied to clipboard');
    });
  }

  goTorReviewRatingPage() {
    this.dataShareService.setOrderId(this.orderId);
    this.router.navigate(['/review-rating']);
  }

  goBackToPreviousPage(){
    window.history.back();
  }
}
