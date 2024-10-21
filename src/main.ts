// import { bootstrapApplication } from '@angular/platform-browser';
// import { appConfig } from './app/app.config';
// import { AppComponent } from './app/app.component';

// bootstrapApplication(AppComponent, appConfig)
//   .catch((err) => console.error(err));


import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { CsrfInterceptor } from './app/interceptor/csrfInterceptor'; // Ensure correct path

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    ...appConfig.providers,
    { provide: CsrfInterceptor, useClass: CsrfInterceptor, multi: true } // Register the interceptor here
  ],
}).catch(err => console.error(err));
