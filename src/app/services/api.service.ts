import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root' // Ensure it's provided globally
})

export class ApiService {
  private apiLink = 'http://localhost:7399'; // URL of your Node.js API

  constructor(private http: HttpClient) {}

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
