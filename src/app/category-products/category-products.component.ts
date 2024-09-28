import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { RouterModule , Router, ActivatedRoute} from '@angular/router';
import { CommonModule } from '@angular/common'; 
import { DataShareService } from '../services/data.share.service';


@Component({
  selector: 'app-category-products',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './category-products.component.html',
  styleUrl: './category-products.component.css'
})

export class CategoryProductsComponent implements OnInit{
  public categoryId:any;
  public brandId:any;
  public displayName: any;
  public category=<any>{};
  public products: any[] = [];

  public constructor(private apiService: ApiService, private router: Router, private route: ActivatedRoute, private dataShareService: DataShareService) {}


  async ngOnInit() {
    this.route.params.subscribe(params => {
      this.categoryId = params['category_id'];
      this.brandId = params['brand_id'];
    });
    this.displayName = this.dataShareService.getData();
    // this.categoryName = localStorage.getItem('categoryName');

    // Get query parameters
    // this.route.queryParamMap.subscribe(queryParams => {
    //   this.categoryName = queryParams.get('categoryName');
    // });
    
    if(this.categoryId){
      await this.getAllCategoryProducts(this.categoryId);
    }
    if(this.brandId){
      await this.getAllBrandProducts(this.brandId);
    }
    
  }

  async getAllCategoryProducts(categoryId:Number){
    let apiParams = {
      category_id: categoryId
    }
    await this.apiService.getDataWithParams('/home/getSelectedCategoryProduct', apiParams).subscribe(
      (response) => {
        this.products = JSON.parse(JSON.stringify(response.result));
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
  }

  async getAllBrandProducts(brandId:Number){
    let apiParams = {
      brand_id: brandId
    }
    await this.apiService.getDataWithParams('/home/getSelectedBrandProduct', apiParams).subscribe(
      (response) => {
        this.products = JSON.parse(JSON.stringify(response.result));
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
  }

  gotoShowProductPage(product:any){
    this.dataShareService.setProductDetails(product);
    return this.router.navigate(['/product', product.product_id] );
  }

}
