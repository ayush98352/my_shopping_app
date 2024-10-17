import { Component, OnInit, NO_ERRORS_SCHEMA} from '@angular/core';
import { ApiService } from '../services/api.service';
import { RouterModule, Router } from '@angular/router';
import { DataShareService } from '../services/data.share.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css'
})
export class SearchComponent implements OnInit {

  public constructor(private apiService: ApiService, private router: Router, private dataShareService: DataShareService) {}
  public searchedList = [];

  async ngOnInit() {
    // do nothing
  }

  


  async getSearchedlist(event: Event) {
    const target = event.target as HTMLInputElement;
    console.log(target.value);
    let searchedText = target.value;

    let apiParams = {
      searchedText: searchedText,
    }

    await this.apiService.getDataWithParams('/home/getSearchedList', apiParams).subscribe(
      (response) => {
        this.searchedList = response.result;
        console.log('searchedList', this.searchedList)
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
    // do nothing
  }
  goBackToPreviousPage(){
    window.history.back();
  }
}
