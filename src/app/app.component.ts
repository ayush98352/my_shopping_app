// import { Component } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { Component,Renderer2,HostListener,OnInit,  Inject, PLATFORM_ID  } from '@angular/core';
import { Title }     from '@angular/platform-browser';
import { Router, NavigationStart, RouteConfigLoadEnd, RouteConfigLoadStart,ResolveEnd, NavigationError,ActivatedRoute } from '@angular/router';
import { DataShareService } from './services/data.share.service';
import { DataAccessService } from './services/data-access.service';
import { FormsModule } from '@angular/forms'; // Import FormsModule

import { ApiService } from './services/api.service';
import { isPlatformBrowser } from '@angular/common';



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
  imports: [CommonModule, RouterOutlet, HttpClientModule, NgOptimizedImage, FormsModule],
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

  public constructor(private apiService: ApiService, dataShare: DataShareService, private titleService: Title,private renderer: Renderer2, private router: Router, private route: ActivatedRoute, private dataService: DataAccessService, @Inject(PLATFORM_ID) private platformId: Object ) {}
 
  ngOnInit(): void {
    this.checkScreenSize()
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('auth_token');
      if (token) {
        this.router.navigate(['/home']);  // Navigate to home if token is present
      } else {
        this.router.navigate(['/login']);  // Otherwise, go to login
      }
    }
    else{
      this.router.navigate(['/login']);  // Otherwise, go to login
    };

    // this.apiService.getData().subscribe(
    //   (response) => {
    //     this.data = response;
    //     console.log('Data from Node.js:', this.data);
    //   },
    //   (error) => {
    //     console.error('Error fetching data:', error);
    //   }
    // );

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

  

  autoAdjustiPhoneScreen() {
    const body = document.body;
    body.classList.remove('notchtop', 'nonnotchtop');

    const userAgent = navigator.userAgent;
    const isIphone = /iPhone/.test(userAgent);
    if (isIphone) {
      if (screen.height >= 812 && screen.width >= 375) {
        body.classList.add('notchtop');
      } else if (screen.height >= 560 && screen.height < 812) {
        body.classList.add('nonnotchtop');
      }
    }
  }

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
      //this.autoAdjustiPhoneScreen()
    }
  }



  public setTitle( newTitle: string) {
    this.titleService.setTitle( newTitle );
  }
}