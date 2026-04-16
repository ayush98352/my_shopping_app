import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DataShareService } from '../services/data.share.service';

@Injectable()
export class CsrfInterceptor implements HttpInterceptor {
  constructor(private dataShareService: DataShareService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Always send credentials (cookies) so the backend _csrf cookie is included
    let cloned = req.clone({ withCredentials: true });

    // Skip attaching the token for the CSRF token fetch itself
    if (req.url.includes('/csrf-token')) {
      return next.handle(cloned);
    }

    const token = this.dataShareService.getcsrfToken();
    if (token) {
      cloned = cloned.clone({ setHeaders: { 'X-CSRF-Token': token } });
    }

    return next.handle(cloned);
  }
}
