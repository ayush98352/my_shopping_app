import { Injectable, Output, EventEmitter } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError, tap } from 'rxjs/operators';
// import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';
import { DataShareService } from '../services/data.share.service';
// import { filter, tap } from 'rxjs/operators';
import { ActivatedRoute, Router, NavigationStart, NavigationEnd, NavigationExtras } from '@angular/router';
@Injectable({
  providedIn: 'root'
})
export class DataAccessService {

}