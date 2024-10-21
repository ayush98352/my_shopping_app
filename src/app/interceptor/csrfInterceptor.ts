import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class CsrfInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Fetch the CSRF token from localStorage (or any other storage)
    const csrfToken = localStorage.getItem('csrfToken');

    // Clone the request and set the CSRF token in the headers
    const clonedRequest = req.clone({
      setHeaders: {
        'X-CSRF-Token': csrfToken || ''
      },
      withCredentials: true // Ensure credentials (including cookies) are sent
    });

    // Pass the cloned request to the next handler
    return next.handle(clonedRequest);
  }
}
