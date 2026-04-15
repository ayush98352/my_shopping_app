// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-voice-search',
//   standalone: true,
//   imports: [],
//   templateUrl: './voice-search.component.html',
//   styleUrl: './voice-search.component.css'
// })
// export class VoiceSearchComponent {

// }


import { Component, NgZone, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ApiService } from '../services/api.service';


@Component({
  selector: 'app-voice-search',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button (click)="startListening()">🎙 Start Voice Search</button>
    <p *ngIf="recognizedText">You said: {{ recognizedText }}: {{translatedText}}</p>
  `,
})

export class VoiceSearchComponent implements OnInit {
  recognizedText: string = '';
  translatedText: string = '';

  constructor(private ngZone: NgZone, private apiService: ApiService) {}

  async ngOnInit() {

  }
  startListening() {
    const recognition = new (window as any).webkitSpeechRecognition(); // Works in Chrome
    // recognition.lang = 'hi-IN'; // Set Hindi as default (it also recognizes English)
    recognition.lang = 'en-US'; // Set Hindi as default (it also recognizes English)
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.start();

    recognition.onresult = async (event: any) => {
      const speechResult = event.results[0][0].transcript;
      console.log('Recognized:', speechResult);

      this.ngZone.run(async () => {
        this.recognizedText = speechResult;
        console.log('Recognized:', speechResult);
        await this.translateToEnglish(speechResult); // Translate if needed
        // this.translatedText = translate.translatedText;
        console.log('Translated:', this.translatedText);
        // this.searchProduct(translatedText); // Search in DB
      });
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
    };
  }

  async translateToEnglish(text: string) {
    
    let apiParams = {
      text: text,
    }

    await this.apiService.getDataWithParams('/home/translate', apiParams).subscribe(
      (response) => {
        // this.searchedList = JSON.parse(JSON.stringify(response.result));
        console.log('response', response);
        this.translatedText = response.result.translatedText;
        // return response.translatedText;
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
  }

  searchProduct(query: string) {
    fetch(`http://localhost:3000/api/products/search?query=${query}`)
      .then((res) => res.json())
      .then((data) => console.log('Search results:', data))
      .catch((err) => console.error('Error fetching search results:', err));
  }
}
