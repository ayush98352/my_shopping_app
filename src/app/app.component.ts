// import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterOutlet } from '@angular/router';
// import {HttpClientModule} from '@angular/common/http';

import { App } from '@capacitor/app';

import { Component,Renderer2,HostListener,OnInit,  Inject, PLATFORM_ID  } from '@angular/core';
import { Title }     from '@angular/platform-browser';
import { Router, NavigationStart, RouteConfigLoadEnd, RouteConfigLoadStart,ResolveEnd, NavigationError,ActivatedRoute } from '@angular/router';
import { DataShareService } from './services/data.share.service';
import { DataAccessService } from './services/data-access.service';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { SvgRegistryService } from './services/svg-registry.service';
import { ApiService } from './services/api.service';
import { isPlatformBrowser } from '@angular/common';
import { DeviceDetectorService } from 'ngx-device-detector';




import * as jQuery from 'jquery';
import * as $ from 'jquery';
import { LoginComponent } from './login/login.component';
interface WebAppInterface {
  setUserInfoFromApp(obj: string): any;
  generateFCMToken() : any;
}


declare var jdSalesAppFcmToken: WebAppInterface;
declare var jdSalesInterface: WebAppInterface;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  providers: [ApiService],  // Add your ApiService here if needed
})
export class AppComponent implements OnInit {
  title = 'my-app';

  previousUrl: string = '';
  currentUrlSlug: string = '';
  bodyClass: string = '';
  dwstarted = false;

  data: any;
  isNotch: boolean = false;
  padding: string = '20px';  // Default padding for iPhones without notch

  public constructor(private apiService: ApiService, dataShare: DataShareService, private titleService: Title,private renderer: Renderer2, private router: Router, private route: ActivatedRoute, private dataService: DataAccessService, @Inject(PLATFORM_ID) private platformId: Object, private deviceService: DeviceDetectorService, private svgRegistryService: SvgRegistryService, private location: Location ) { 
    this.apiService.fetchCsrfToken(); 
    this.setupBackButtonHandler();
    if(isPlatformBrowser(this.platformId)) {
      if(sessionStorage){
        sessionStorage.clear();
      }
    }
  }
 
  ngOnInit(): void {
    // this.checkScreenSize();
    this.detectDevice();

    const svgNames = ['ellipse', 'login-page-main', 'indian-flag', 'search-icon', 'notification-icon', 'cart-icon', 'big_sale_logo', 'ad', 'filter-icon', 'wishlist-icon', 'wishlisted-icon', 'home-icon', 'home-icon-active', 'stores-icon-active', 'stores-icon', 'group-icon-active', 'group-icon', 'trends-icon', 'trends-icon-active', 'profile-icon', 'profile-icon-active', 'delete-icon', 'cross', 'coupon-icon']; // Your SVG names
    svgNames.forEach(name => this.svgRegistryService.registerSvgIcon(name));
    
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('auth_token');
      const loggedInUserId = localStorage.getItem('loggedInUserId');
      const phoneNumber = localStorage.getItem('phoneNumber');
      if (token && loggedInUserId && phoneNumber) {
        this.router.navigate(['/home']);  // Navigate to home if token is present
      } else {
        this.router.navigate(['/login']);  // Otherwise, go to login
      }
    }
    else{
      this.router.navigate(['/login']);  // Otherwise, go to login
    };


    /* set android fcmtoken and sending users data to android app on every login*/
    // this.router.events.subscribe((event) => {
    //   if(event instanceof ResolveEnd ){
    //     if(event.url && event.url.indexOf('nativeLogin')>=0 && typeof(jdSalesAppFcmToken)!=='undefined' && jdSalesAppFcmToken != undefined ){
    //         jdSalesAppFcmToken.generateFCMToken();
    //         if (typeof (jdSalesInterface) !== 'undefined' && jdSalesInterface != undefined) {
    //           this.sendUserInfotoNativeApp("android");
    //         }
    //     }
    //   }
    // });


  }


  /** sending user info to store in android/ios app local storage */
  // sendUserInfotoNativeApp(deviceType: string) {
  //   let apiParams = {
  //     'mtd': 'getUserInfoforNativeApp'
  //   };    
  //   this.dataService.getData(apiParams).subscribe((response: any) => {
  //     if (response && response.api_status==true) {
  //       var userobj = { mobile: response.mobile, empcode: response.empcode, empname: response.empname, refresh_token: response.refresh_token };
  //       if(deviceType=='ios'){
  //         (window as any).webkit.messageHandlers.setUserInfoFromApp.postMessage(userobj);
  //       }else if(deviceType=='android'){
  //         if (typeof jdSalesInterface.setUserInfoFromApp === 'function') {
  //           jdSalesInterface.setUserInfoFromApp(JSON.stringify(userobj));
  //         }
  //       }
  //     }
  //   });
  // }

  
  

  @HostListener("window:resize")
  checkScreenSize() {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      const body = document.body;
      if (body.classList.length) {
        if (window.innerWidth > 1024) {
          body.classList.remove('mview');
          if (!body.classList.contains('webview')) {
            body.classList.add('webview');
          }
        } else {
          body.classList.add('mview');
          body.classList.remove('webview');
        }
      }
      this.detectDevice();
    }
  }

  setupBackButtonHandler() {
    App.addListener('backButton', ({ canGoBack }) => {
      // Check if you can go back to a previous page
      if (this.location.isCurrentPathEqualTo('/home')) {
        // If already on the home page, exit the app
        App.exitApp();
      } else {
        // Otherwise, navigate to the previous page
        this.location.back();
      }
    });
  }
  



  public setTitle( newTitle: string) {
    this.titleService.setTitle( newTitle );
  }


  detectDevice() {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {

      const body = document.body;
      body.classList.remove('status-bar-height-44', 'status-bar-height-20');
      const userAgent = navigator.userAgent;
      const isIphone = /iPhone/.test(userAgent);
      const isAndroid = /Android/.test(userAgent);
  
      // Detect Notch or Dynamic Island (iPhone X and newer)
      if (isIphone && this.isIphoneWithNotch()) {
        this.isNotch = true;
        this.padding = '44px';  // Apply padding for newer iPhones with notch or Dynamic Island
        body.classList.add('status-bar-height-44');
        
      } else if (isIphone) {
        this.padding = '20px';  // Apply padding for older iPhones
        body.classList.add('status-bar-height-20');
      } else if (isAndroid) {
        this.padding = '20px';  // Apply padding for Android (customize as needed)
        body.classList.add('status-bar-height-20');
      }
    }
  }

  // Check if iPhone has a notch (iPhone X and newer)
  isIphoneWithNotch(): boolean {
    const screenHeight = window.innerHeight;
    const screenWidth = window.innerWidth;
    const isNotch = screenHeight >= 812 && screenWidth >= 375;
    localStorage.setItem('isNotch', isNotch.toString());
    return isNotch;
  }

}