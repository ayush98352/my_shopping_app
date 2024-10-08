import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root' // Ensure it's provided globally
})

export class ApiService {
  private apiLink = 'http://localhost:7399'; // URL of your Node.js API

  constructor(private http: HttpClient) {}

  private csrfToken: string | null = null;

  // Method to fetch the CSRF token
  fetchCsrfToken() {
    return this.http.get<{ csrfToken: string }>('/auth/csrf-token').subscribe(response => {
      this.csrfToken = response.csrfToken; // Store the CSRF token
    });
  }

  // Method to send login request
  login(userId: string) {
    const headers = new HttpHeaders({
      'X-CSRF-Token': this.csrfToken || '', // Include CSRF token in headers
    });

    return this.http.post('/auth/login', { userId }, { headers });
  }

  getData(url:any): Observable<any> {
    let apiUrl = this.apiLink + url;
    console.log('url', apiUrl);
    return this.http.get(apiUrl);
  }

  getDataWithParams(url:any,  params:any): Observable<any> {
    let apiUrl = this.apiLink + url;
    console.log('url', apiUrl);
    console.log('params', params);
    return this.http.get(apiUrl, { params: params });
  }
}
