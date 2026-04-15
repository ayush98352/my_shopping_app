import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageService, SupportedLang } from '../services/language.service';
import { SvgRegistryService } from '../services/svg-registry.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, MatIconModule, TranslatePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css',
})
export class SettingsComponent implements OnInit {

  get currentLang(): SupportedLang {
    return this.languageService.getCurrentLang();
  }

  constructor(
    private router: Router,
    private languageService: LanguageService,
    private svgRegistryService: SvgRegistryService,
  ) {}

  ngOnInit(): void {
    this.svgRegistryService.registerSvgIcon('setting-icon');
  }

  setLanguage(lang: SupportedLang): void {
    this.languageService.setLanguage(lang);
  }

  goBack(): void {
    window.history.back();
  }
}
