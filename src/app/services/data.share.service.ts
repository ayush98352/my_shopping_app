import { Injectable,Output,EventEmitter } from '@angular/core';
// import { environment } from '../../environments/environment';
import { Observable, Subject, BehaviorSubject } from 'rxjs';




@Injectable({ providedIn: 'root' })
export class DataShareService {

    private data: string | null = null;
    private productDetails = <any>{};
    private csrfToken = <any>{};
    private filters = <any>{};

    setData(name: string) {
        this.data = name;
    }

    getData(): string | null {
        return this.data;
    }

    setProductDetails(productDetails: any) {
        this.productDetails = productDetails;
    }
    getProductDetails(): any {
        return this.productDetails;
    }

    setcsrfToken(csrf:any){
        this.csrfToken = csrf;
    }
    getcsrfToken(): any {
        return this.csrfToken;
    }

    setFilters(filters: any) {
        this.filters = filters;
    }
    getFilters(): any {
        return this.filters;
    }
}