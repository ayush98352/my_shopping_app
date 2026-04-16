import { ApplicationConfig, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withInterceptorsFromDi, HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { provideTranslateService, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { CsrfInterceptor } from './interceptor/csrfInterceptor';
import { ApiService } from './services/api.service';
import { DataShareService } from './services/data.share.service';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

function initApp(apiService: ApiService, dataShareService: DataShareService): () => Promise<void> {
  return () => {
    if (typeof localStorage !== 'undefined') {
      // Restore auth token from localStorage into memory on every page load / new tab
      const token = localStorage.getItem('auth_token');
      if (token) dataShareService.setAuthToken(token);
    }
    return apiService.fetchCsrfToken();
  };
}

// Load translations before any component renders to avoid showing raw keys (e.g. "login.title")
function initTranslations(translate: TranslateService): () => Promise<void> {
  return () => new Promise(resolve => {
    const lang = (typeof localStorage !== 'undefined' && localStorage.getItem('app_language') === 'hi') ? 'hi' : 'en';
    translate.addLangs(['en', 'hi']);
    translate.setDefaultLang('en');
    translate.use(lang).subscribe({ complete: resolve, error: resolve });
  });
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(withInterceptorsFromDi()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CsrfInterceptor,
      multi: true,
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initApp,
      deps: [ApiService, DataShareService],
      multi: true,
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initTranslations,
      deps: [TranslateService],
      multi: true,
    },
    provideTranslateService({
      defaultLanguage: 'en',
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient],
      },
    }),
  ],
};
