import { Injectable, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root' // Ensure it's provided globally
})

export class ApiService implements OnInit {
  private apiLink = 'http://localhost:7399'; // URL of your Node.js API
  private csrfToken: string = '';

  constructor(private http: HttpClient) {
    
  }

  async ngOnInit() {
    const storedToken = localStorage.getItem('csrfToken');
    if (storedToken) {
      this.csrfToken = storedToken;
    } else {
      this.fetchCsrfToken();
    }
  }

  fetchCsrfToken() {
    let apiUrl = this.apiLink + '/csrf-token';
    return this.http.get<{ csrfToken: string }>(apiUrl, { withCredentials: true })
      .subscribe(response => {
        this.csrfToken = response.csrfToken;
        localStorage.setItem('csrfToken', this.csrfToken);
      });
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'X-CSRF-Token': localStorage.getItem('csrfToken') || this.csrfToken || ''
    });
  }

  
  getData(url:any): Observable<any> {
    let apiUrl = this.apiLink + url;
    console.log('url', apiUrl);
    // return this.http.get(apiUrl);
    return this.http.get(apiUrl, { 
      headers: this.getHeaders(),
      withCredentials: true,
    });
  }


  getDataWithParams(url: string, params: any): Observable<any> {


    let apiUrl = this.apiLink + url;
    console.log('url', apiUrl);
    console.log('params', params);
    // return this.http.post(apiUrl, params, { headers });

    // No need to manually add CSRF token, it will be handled by the interceptor
    // return this.http.post(apiUrl, params);

    return this.http.post(apiUrl, params, {
      headers: this.getHeaders(),
      withCredentials: true,
    });
  }
}



  // getDataWithParams(url:any,  params:any): Observable<any> {
  //   let apiUrl = this.apiLink + url;
  //   console.log('url', apiUrl);
  //   console.log('params', params);
  //   return this.http.get(apiUrl, { params: params });
  // }


  // Method to fetch the CSRF token
  // fetchCsrfToken() {
  //   let apiUrl = this.apiLink + '/csrf-token';
  //   return this.http.get<{ csrfToken: string }>(apiUrl).subscribe(response => {
  //     this.csrfToken = response.csrfToken; // Store the CSRF token
  //     localStorage.setItem('csrfToken', this.csrfToken);

  //   });
  // }

  // Method to send login request
  // login(userId: string) {
  //   const headers = new HttpHeaders({
  //     'X-CSRF-Token': this.csrfToken || '', // Include CSRF token in headers
  //   });

  //   return this.http.post('/auth/login', { userId }, { headers });
  // }