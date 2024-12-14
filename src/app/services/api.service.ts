import { Injectable, OnInit } from '@angular/core';
import { HttpClient, HttpEventType, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DataShareService } from './data.share.service';
import { map } from 'rxjs/operators';

export interface UploadResponse {
  url: string;
  message: string;
}

@Injectable({
  providedIn: 'root' // Ensure it's provided globally
})

export class ApiService implements OnInit {
  private apiLink = 'http://localhost:7399'; // URL of your Node.js API
  // private apiLink = 'https://my-shopping-app-node-production.up.railway.app'
  
  private csrfToken: string = '';

  constructor(private http: HttpClient, private dataShareService: DataShareService) {
    
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
        // localStorage.setItem('csrfToken', this.csrfToken);
        this.dataShareService.setcsrfToken(this.csrfToken);
      });
  }

  private getHeaders(): HttpHeaders {
    let csrf = this.dataShareService.getcsrfToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      // 'X-CSRF-Token': localStorage.getItem('csrfToken') || this.csrfToken || ''
      'X-CSRF-Token': csrf || this.csrfToken || ''
    });
  }

  
  getData(url:any): Observable<any> {
    let apiUrl = this.apiLink + url;
    // console.log('url', apiUrl);
    // return this.http.get(apiUrl);
    return this.http.get(apiUrl, { 
      headers: this.getHeaders(),
      withCredentials: true,
    });
  }


  getDataWithParams(url: string, params: any): Observable<any> {


    let apiUrl = this.apiLink + url;
    // console.log('url', apiUrl);
    // console.log('params', params);
    // return this.http.post(apiUrl, params, { headers });

    // No need to manually add CSRF token, it will be handled by the interceptor
    // return this.http.post(apiUrl, params);

    return this.http.post(apiUrl, params, {
      headers: this.getHeaders(),
      withCredentials: true,
    });
  }

  // New method for file upload
  uploadPhoto(file: File, additionalParams?: Record<string, any>): Observable<UploadResponse> {
    const formData = new FormData();

    // Check if file is valid
    if (file && file instanceof File) {
      console.log('Appending file to formData:', file); // Debugging log
      formData.append('photo', file);
    } else {
      console.error('No valid file found');
      return null as any;
    }
   

    // Add any additional parameters to formData if needed
    if (additionalParams) {
      Object.entries(additionalParams).forEach(([key, value]) => {
        formData.append(key, value as string);
      });
    }
    // Log FormData entries
    for (let [key, value] of (formData as any).entries()) {
      if (value instanceof File) {
        console.log(`${key}: File Name: ${value.name}, Size: ${value.size}, Type: ${value.type}`);
      } else {
        console.log(`${key}: ${value}`);
      }
    }
      return this.http.post<UploadResponse>(
      `${this.apiLink}/home/upload-photo`,
      formData,
      {
        reportProgress: true,
        observe: 'events'
      }
    ).pipe(
      map(event => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            const progress = event.total
              ? Math.round(100 * event.loaded / event.total)
              : 0;
            return { type: 'progress', progress } as any;
          
          case HttpEventType.Response:
            return event.body as UploadResponse;
          
          default:
            return null as any;
        }
      })
    );
  }

  // Method for multiple file upload
  uploadMultiplePhotos(
    files: File[], 
    additionalParams?: Record<string, any>
  ): Observable<UploadResponse>[] {
    return files.map(file => this.uploadPhoto(file, additionalParams));
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