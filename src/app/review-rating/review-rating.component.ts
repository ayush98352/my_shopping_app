import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { DataShareService } from '../services/data.share.service';
import { RouterModule, Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { HttpClient, HttpEventType } from '@angular/common/http';



// Interface for the photo data
interface PhotoData {
  file: File;
  previewUrl: string;
  uploadedUrl?: string;
  uploadProgress?: number;
  id: string;
  status: 'uploading' | 'uploaded' | 'error';
  errorMessage?: string;
}


@Component({
  selector: 'app-review-rating',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ReactiveFormsModule],
  templateUrl: './review-rating.component.html',
  styleUrl: './review-rating.component.css'
})
export class ReviewRatingComponent implements OnInit {
  reviewForm: FormGroup;
  deliveryRating: number = 0;
  deliveryPersonName: string = 'Santanu';
  public loggedInUserId = localStorage.getItem('loggedInUserId');
  public deliveryRatingDone: boolean = false;
  public itemRatingDone: boolean = false;
 
  public orderId : any;
  public orderItemsList: any;
  public showSubmitButton: boolean = false;

  public photos: Map<number, PhotoData[]> = new Map(); // Map review index to photos array
  public maxPhotos = 5; // Maximum photos per review


  constructor(private apiService: ApiService, private router: Router, private dataShareService: DataShareService, private fb: FormBuilder, private http: HttpClient) {
    this.reviewForm = this.fb.group({
      deliveryRating: [0],
      items: this.fb.array([])
    });
  }

  async ngOnInit() {
    this.orderId =this.dataShareService.getOrderId();
    await this.getOrderItemsList();
    
    
  }

  async getOrderItemsList(){
    let apiParams = {
      order_id: this.orderId,
    }
    await this.apiService.getDataWithParams('/home/getOrderItemsList', apiParams).subscribe(
      (response) => {
        this.orderItemsList = JSON.parse(JSON.stringify(response.result));
        this.deliveryRating = this.orderItemsList[0]?.delivery_man_rating;
        this.deliveryPersonName = this.orderItemsList[0]?.delivery_man_name;
        this.reviewForm.patchValue({ deliveryRating: this.deliveryRating });
        
        for (let i = 0; i < this.orderItemsList?.length; i++) {
          // this.photos.set(i, this.orderItemsList[i]?.review_image || []);
          this.photos.set(i, this.orderItemsList[i]?.review_image || []);
        }
        // for dev only
        // this.photos = new Map<number, PhotoData[]>(
        // Array.from(this.photos.entries()).map(([key, photoArray]) => [
        //   key,
        //   photoArray.map((photo: any) => photo.replace('http://localhost:7399', '/Users/ayush7399/my-nest-api'))
        // ]));
        
        
        this.initializeItemForms();
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
        
  }

  private initializeItemForms() {
    const itemsFormArray = this.reviewForm.get('items') as FormArray;
    if (this.orderItemsList) {
      

      this.orderItemsList.forEach((item: any) => {
        itemsFormArray.push(this.fb.group({
          id: [item?.order_item_id],
          product_id: [item?.product_id],
          rating: [item?.rating || 0],
          review: [item?.review_text || ''],
          photos: [item?.review_image || []]
        }));
      });


    } else {
      console.error('orderItemsList is undefined');
    }  }

  onDeliveryRatingChange(rating: number) {
    this.deliveryRating = rating;
    this.reviewForm.patchValue({ deliveryRating: rating });
    this.showSubmitButton = true;
    this.deliveryRatingDone = true;
  }

  onItemRatingChange(index: number, rating: number) {
    const itemsArray = this.reviewForm.get('items') as FormArray;
    itemsArray.at(index).patchValue({ rating });
    this.showSubmitButton = true;
    this.itemRatingDone = true;
  }


  openPhoto(url: string) {
    window.open(url, '_blank');
  }

  async onSubmit() {

    const itemsArray = this.reviewForm.get('items') as FormArray;


    for  (const [reviewIndex, photos] of this.photos.entries()) {
      for (const photo of photos) {
        if (photo.status === 'uploaded') {
          itemsArray.at(reviewIndex).patchValue({ photos: [...(itemsArray.at(reviewIndex).get('photos')?.value || []), photo.uploadedUrl] });          // this.reviewForm.patchValue({
          //   [`items.${reviewIndex}.photos`]: this.photos.get(reviewIndex)?.map(photo => photo.uploadedUrl) || []
          // });
        }
      }
    }
    if (this.reviewForm.valid) {
      if(this.deliveryRatingDone == true){
        await this.addDeliveryManRating();
      }
      if(this.itemRatingDone == true){
        await this.addReview();
      }
      this.goBackToPreviousPage();
      // Handle form submission logic here
    }
  }

  async addReview(){
    const itemsArray = this.reviewForm.get('items') as FormArray;
    let apiParams = {
      order_id: this.orderId,
      user_id: this.loggedInUserId,
      items: itemsArray.value.map((item: any) => ({
        order_item_id: item.id,
        product_id: item.product_id,
        rating: item.rating,
        review: item.review,
        photos: JSON.stringify(item.photos),
        review_date: this.formatLocalDateTime()
      }))
    }
    await this.apiService.getDataWithParams('/home/addProductReviewRating', apiParams).subscribe(
      (response) => {
        console.log('Review added successfully:', response);
      },
      (error) => {
        console.error('Error adding review:', error);
      }
    );
  }

  async addDeliveryManRating(){
    let apiParams = {
      order_id: this.orderId,
      delivery_man_rating: this.deliveryRating,
    }
    await this.apiService.getDataWithParams('/home/addDeliveryManRating', apiParams).subscribe(
      (response) => {
        console.log('Delivery man rating added successfully:', response);
      },
      (error) => {
        console.error('Error adding delivery man rating:', error);
      }
    );
  }

  // Helper method to get form array
  get itemForms() {
    return (this.reviewForm.get('items') as FormArray).controls;
  }

  goBackToPreviousPage(){
    window.history.back();
  }


  onPhotoAdded(reviewIndex: number, event: any) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Initialize photos array for this review if it doesn't exist
    if (!this.photos.has(reviewIndex)) {
      this.photos.set(reviewIndex, []);
    }

    const currentPhotos = this.photos.get(reviewIndex)!;
    
    // Process each file
    Array.from(files).forEach(file => {
      const photoData: PhotoData = {
        file: file as File,
        previewUrl: URL.createObjectURL(file as File),
        id: `${reviewIndex}-${Date.now()}-${Math.random()}`,
        status: 'uploading',
        uploadProgress: 0
      };

      currentPhotos.push(photoData);

      // Use the API service to upload
      this.apiService.uploadPhoto(file as File, { reviewIndex }).subscribe({
        next: (result: any) => {
          if (result?.type === 'progress') {
            this.updatePhotoStatus(reviewIndex, photoData.id, {
              uploadProgress: result.progress
            });
          } else if (result?.url) { // Final response
            this.updatePhotoStatus(reviewIndex, photoData.id, {
              status: 'uploaded',
              uploadedUrl: result.url,
              uploadProgress: 100
            });
          }
        },
        error: (error) => {
          this.updatePhotoStatus(reviewIndex, photoData.id, {
            status: 'error',
            errorMessage: 'Failed to upload photo'
          });
          console.error('Upload error:', error);
        }
      });
    });

    // Reset file input
    event.target.value = '';
  }

  // Retry upload method
  retryUpload(reviewIndex: number, photoId: string) {
    const photos = this.photos.get(reviewIndex);
    if (!photos) return;

    const photo = photos.find(p => p.id === photoId);
    if (!photo) return;

    this.updatePhotoStatus(reviewIndex, photoId, {
      status: 'uploading',
      uploadProgress: 0,
      errorMessage: undefined
    });

    this.apiService.uploadPhoto(photo.file, { reviewIndex }).subscribe({
      next: (result: any) => {
        if (result.type === 'progress') {
          this.updatePhotoStatus(reviewIndex, photoId, {
            uploadProgress: result.progress
          });
        } else if (result.url) {
          this.updatePhotoStatus(reviewIndex, photoId, {
            status: 'uploaded',
            uploadedUrl: result.url,
            uploadProgress: 100
          });
        }
      },
      error: (error) => {
        this.updatePhotoStatus(reviewIndex, photoId, {
          status: 'error',
          errorMessage: 'Failed to upload photo'
        });
      }
    });
  }


  private updatePhotoStatus(reviewIndex: number, photoId: string, updates: Partial<PhotoData>) {
    const photos = this.photos.get(reviewIndex);
    if (!photos) return;

    const photoIndex = photos.findIndex(p => p.id === photoId);
    if (photoIndex === -1) return;

    photos[photoIndex] = { ...photos[photoIndex], ...updates };
    this.photos.set(reviewIndex, [...photos]); // Trigger change detection
  }

  deletePhoto(reviewIndex: number, photoId: string) {
    const photos = this.photos.get(reviewIndex);
    if (!photos) return;

    const photoIndex = photos.findIndex(p => p.id === photoId);
    if (photoIndex === -1) return;

    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(photos[photoIndex].previewUrl);
    
    // Remove photo from array
    photos.splice(photoIndex, 1);
    this.photos.set(reviewIndex, [...photos]);
  }

  

  ngOnDestroy() {
    // Cleanup object URLs
    this.photos.forEach(photos => {
      photos.forEach(photo => {
        URL.revokeObjectURL(photo.previewUrl);
      });
    });
  }

  formatLocalDateTime() {
    const now = new Date();
  
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
  
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
}
