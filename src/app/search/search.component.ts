import { Component, OnInit, NO_ERRORS_SCHEMA} from '@angular/core';
import { ApiService } from '../services/api.service';
import { RouterModule, Router } from '@angular/router';
import { DataShareService } from '../services/data.share.service';
import { CommonModule, Location } from '@angular/common';


@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css'
})
export class SearchComponent implements OnInit {

  public constructor(private apiService: ApiService, private router: Router, private dataShareService: DataShareService) {}
  public searchedList:any = [];
  public searchedText:any;

  async ngOnInit() {
    // do nothing
    let savedFilters = this.dataShareService.getFilters();
    if(savedFilters && Object.keys(savedFilters).length > 0){
      this.searchedText = savedFilters?.searchedText;
      // this.searchedList = JSON.parse(JSON.stringify(savedFilters?.searchedList));
      await this.getSearchedlist();    
    }
    console.log('searchedText', this.searchedText);
    console.log('searchedList', this.searchedList)
  }

  


  async onSearch(event: Event) {
    const target = event.target as HTMLInputElement;
    console.log(target.value);
    this.searchedText = target.value;
    await this.getSearchedlist();
    // do nothing
  }

  async getSearchedlist(){
    let apiParams = {
      searchedText: this.searchedText,
    }

    await this.apiService.getDataWithParams('/home/getSearchedList', apiParams).subscribe(
      (response) => {
        this.searchedList = JSON.parse(JSON.stringify(response.result));
        console.log('searchedList', this.searchedList)
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
  }

  gotoCategoryProductPage(searchCategory: any){
    console.log('searchCategory', searchCategory);
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

  goBackToPreviousPage(){
    window.history.back();
  }
}
