import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DataShareService } from './data.share.service';
import { LanguageService } from './language.service';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface UploadResponse {
  url: string;
  message: string;
}

@Injectable({
  providedIn: 'root' // Ensure it's provided globally
})

export class ApiService {
  readonly apiLink = environment.apiUrl;

  constructor(private http: HttpClient, public dataShareService: DataShareService, private languageService: LanguageService) {}

  fetchCsrfToken(): Promise<void> {
    const apiUrl = this.apiLink + '/csrf-token';
    return this.http.get<{ csrfToken: string }>(apiUrl, { withCredentials: true })
      .toPromise()
      .then(response => {
        if (response?.csrfToken) {
          this.dataShareService.setcsrfToken(response.csrfToken);
        }
      })
      .catch(() => {});
  }

  private getHeaders(): HttpHeaders {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept-Language': this.languageService.getCurrentLang(),
    };
    const token = this.dataShareService.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return new HttpHeaders(headers);
  }

  
  getData(url:any): Observable<any> {
    let apiUrl = this.apiLink + url;
    // return this.http.get(apiUrl);
    return this.http.get(apiUrl, { 
      headers: this.getHeaders(),
      withCredentials: true,
    });
  }


  getDataWithParams(url: string, params: any): Observable<any> {


    let apiUrl = this.apiLink + url;

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
        observe: 'events',
        withCredentials: true,
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
