import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  // private apiLink = 'http://localhost:7399'; // URL of your Node.js API
  private apiLink = 'https://loud-crayfish-zendo-ca8afaac.koyeb.app'

  constructor(private http: HttpClient) {}

  private csrfToken: string | null = null;

  // Method to fetch CSRF token (if it's provided via a separate endpoint or cookie)
  

  // Method to fetch the CSRF token
  fetchCsrfToken() {
    let apiUrl = this.apiLink + '/auth/csrf-token';
    return this.http.get<{ csrfToken: string }>(apiUrl).subscribe(response => {
      this.csrfToken = response.csrfToken; // Store the CSRF token
      // localStorage.setItem('csrfToken', this.csrfToken)
    });
  }

  createOrder(amount: number) {
    console.log('service_amount', amount);
    if (!this.csrfToken) {
      this.fetchCsrfToken();  // Fetch the token if not available
    }
  
    const headers = new HttpHeaders({
      'X-CSRF-Token': this.csrfToken || '',
    });
    
    let apiUrl = this.apiLink + '/payment/create-order';
    return this.http.post(
      apiUrl,
      { amount },
      { headers }
    );

  }

  verifyPayment(paymentData: any) {
    
    console.log('service_data', paymentData);
    let apiUrl = this.apiLink + '/payment/verify-payment';

    if (!this.csrfToken) {
      this.fetchCsrfToken();  // Fetch the token if not available
    }
  
    const headers = new HttpHeaders({
      'X-CSRF-Token': this.csrfToken || '',
    });

    return this.http.post(
      apiUrl,
      paymentData,
      { headers }
    );
  }
}
