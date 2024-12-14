import { Injectable,Output,EventEmitter } from '@angular/core';
// import { environment } from '../../environments/environment';
import { Observable, Subject, BehaviorSubject } from 'rxjs';




@Injectable({ providedIn: 'root' })
export class DataShareService {

    private data: string | null = null;
    private productDetails = <any>{};
    private csrfToken = <any>{};
    private filters = <any>{};
    private orderId :any ;
    private orderDetails = <any>{};
    private mallDetails = <any>{};
    public storeDetails = <any>{};

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
    setOrderId(name: string) {
        this.orderId = name;
    }

    getOrderId(): string | null {
        return this.orderId;
    }

    setOrderDetails(orderDetails: any) {
        this.orderDetails = orderDetails;
    }
    getOrderDetails(): any {
        return this.orderDetails;
    }

    setMallDetails(mallDetails: any) {
        this.mallDetails = mallDetails;
    }
    getMallDetails(): any {
        return this.mallDetails;
    }

    setStoreDetails(storeDetails: any) {
        this.storeDetails = storeDetails;
    }
    getStoreDetails(): any {
        return this.storeDetails;
    }
}