import { Component, OnInit, NgZone, Inject, PLATFORM_ID } from '@angular/core';
import { ApiService } from '../services/api.service';
import { Router } from '@angular/router';
import { DataShareService } from '../services/data.share.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageService } from '../services/language.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css'
})
export class SearchComponent implements OnInit {

  public constructor(
    private apiService: ApiService,
    private router: Router,
    private dataShareService: DataShareService,
    private ngZone: NgZone,
    private languageService: LanguageService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  public searchedList: any = [];
  public searchedText: any;
  public isListening = false;
  public voiceError: 'mic_denied' | 'no_speech' | 'error' | null = null;
  public isVoiceSupported = false;

  private recognition: any = null;

  async ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.isVoiceSupported = !!SR;
    }

    const savedFilters = this.dataShareService.getFilters();
    if (savedFilters && Object.keys(savedFilters).length > 0) {
      this.searchedText = savedFilters?.searchedText;
      await this.getSearchedlist();
    }
  }

  async onSearch(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchedText = target.value;
    this.voiceError = null;
    await this.getSearchedlist();
  }

  async getSearchedlist() {
    const apiParams = { searchedText: this.searchedText };
    await this.apiService.getDataWithParams('/home/getSearchedList', apiParams).subscribe(
      (response) => {
        this.searchedList = JSON.parse(JSON.stringify(response.result));
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
  }

  toggleVoiceSearch() {
    if (this.isListening) {
      this.stopListening();
    } else {
      this.startListening();
    }
  }

  startListening() {
    if (!isPlatformBrowser(this.platformId)) return;

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;

    this.voiceError = null;
    this.recognition = new SR();
    this.recognition.lang = this.languageService.getCurrentLang() === 'hi' ? 'hi-IN' : 'en-US';
    this.recognition.continuous = false;
    this.recognition.interimResults = true;

    this.recognition.onstart = () => {
      this.ngZone.run(() => { this.isListening = true; });
    };

    this.recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results as any[])
        .map((r: any) => r[0].transcript)
        .join('');
      const isFinal = event.results[event.results.length - 1].isFinal;

      this.ngZone.run(() => {
        this.searchedText = transcript;
        if (isFinal) {
          this.getSearchedlist();
        }
      });
    };

    this.recognition.onerror = (event: any) => {
      this.ngZone.run(() => {
        this.isListening = false;
        if (event.error === 'not-allowed') {
          this.voiceError = 'mic_denied';
        } else if (event.error === 'no-speech') {
          this.voiceError = 'no_speech';
        } else {
          this.voiceError = 'error';
        }
      });
    };

    this.recognition.onend = () => {
      this.ngZone.run(() => { this.isListening = false; });
    };

    this.recognition.start();
  }

  stopListening() {
    if (this.recognition) {
      this.recognition.stop();
      this.recognition = null;
    }
    this.isListening = false;
  }

  gotoCategoryProductPage(searchCategory: any) {
    return this.router.navigate(['/category'], {
      queryParams: {
        dressCategory: searchCategory?.category_name,
        fashionTab: searchCategory?.ideal_for,
        sidebarCategory: searchCategory?.top_category_name,
        searchedText: this.searchedText,
        searchedList: JSON.parse(JSON.stringify(this.searchedList)),
      }
    });
  }

  goBackToPreviousPage() {
    window.history.back();
  }
}
