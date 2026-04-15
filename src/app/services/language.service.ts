import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

export type SupportedLang = 'en' | 'hi';
const LANG_KEY = 'app_language';
const DEFAULT_LANG: SupportedLang = 'en';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  constructor(
    private translate: TranslateService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  init(): void {
    this.translate.addLangs(['en', 'hi']);
    this.translate.setDefaultLang(DEFAULT_LANG);
    this.translate.use(this.getSavedLang());
  }

  setLanguage(lang: SupportedLang): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(LANG_KEY, lang);
      window.location.reload();
    } else {
      this.translate.use(lang);
    }
  }

  getCurrentLang(): SupportedLang {
    return (this.translate.currentLang as SupportedLang) ?? DEFAULT_LANG;
  }

  private getSavedLang(): SupportedLang {
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem(LANG_KEY) as SupportedLang | null;
      if (saved === 'en' || saved === 'hi') return saved;
    }
    return DEFAULT_LANG;
  }
}
