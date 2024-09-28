import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { RouterModule , Router, ActivatedRoute} from '@angular/router';
import { CommonModule } from '@angular/common'; 
import { DataShareService } from '../services/data.share.service';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product.component.html',
  styleUrl: './product.component.css'
})
export class ProductComponent implements OnInit{

  public productId:any;
  public productDetails: any;
  public imagesArray: any[] = [];
  public currentIndex: number = 0;
  public currentImage:string = '';

  public constructor(private apiService: ApiService, private router: Router, private route: ActivatedRoute, private dataShareService: DataShareService) {}
  
  async ngOnInit() {
    this.route.params.subscribe(params => {
      this.productId = params['product_id'];
    });

    this.productDetails = this.dataShareService.getProductDetails();
    if(Object.keys(this.productDetails).length === 0 && this.productId){
      await this.getProductDetails(this.productId);
    }
    this.currentImage = this.productDetails.main_image;
    // Create a new array with the combination of main_image and additional_images
    this.imagesArray = [this.productDetails.main_image, ...this.productDetails.additional_images];
    await this.getScrollImages();
  
  }
  async getScrollImages(){
    const showImage = () => {
      this.currentImage = this.imagesArray[this.currentIndex];
    }


    // // Function to handle navigation button clicks
    const navigate = (direction: string) => {
      if (direction === 'prev') {
        this.currentIndex = (this.currentIndex - 1 + this.imagesArray.length) % this.imagesArray.length;
      } else if (direction === 'next') {
        this.currentIndex = (this.currentIndex + 1) % this.imagesArray.length;
      }
      showImage();
    }
    // // Add event listeners to the navigation buttons
    if(document.querySelector(".carousel-prev")){
      document.querySelector(".carousel-prev")?.addEventListener("click", () => navigate('prev'));
    }
    if(document.querySelector(".carousel-next")){
      document.querySelector(".carousel-next")?.addEventListener("click", () => navigate('next'));
    }
   
    // // Show the main image initially
    showImage();

  }

  async getProductDetails(productId: any) {
    let apiParams = {
      product_id: productId
    }
    await this.apiService.getDataWithParams('/home/getProductDetails', apiParams).subscribe(
      (response) => {
        this.productDetails = response.result[0];
        this.dataShareService.setProductDetails(this.productDetails);
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
  }

  onImageError(event: any) {
    if (this.currentIndex < this.imagesArray.length - 1) {
      this.currentIndex = (this.currentIndex + 1) % this.imagesArray.length;
      this.currentImage = this.imagesArray[this.currentIndex];
    } else {
      this.currentIndex = 0;
      this.currentImage = this.imagesArray[this.currentIndex];
    }
  }
  

  
}
