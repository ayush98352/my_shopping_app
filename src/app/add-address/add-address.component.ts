import { Component, ViewChild, ElementRef, OnInit, ChangeDetectorRef } from '@angular/core';
import { Location } from '@angular/common';
import { GoogleMap } from '@angular/google-maps';
import { ApiService } from '../services/api.service';
import { CommonModule, NgOptimizedImage, provideImgixLoader } from '@angular/common'; // Import CommonModule
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';



@Component({
  selector: 'app-add-address',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-address.component.html',
  styleUrls: ['./add-address.component.css'],
})
export class AddAddressComponent implements OnInit {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;
  map!: google.maps.Map;
  currentPosition!: { lat: number, lng: number };
  marker!: google.maps.Marker;
  selectedAddress: any;
  centerMarker!: google.maps.Marker;

  public userId = localStorage.getItem('loggedInUserId');
  public searchedText = '';
  public addressSuggestions: any[] = [];
  public userLocation: any = localStorage.getItem('location') ? JSON.parse(localStorage.getItem('location') || '{}') : {};
  public latitude : any;
  public longitude: any;
  public openAddMorePopup = false;
  addressForm: FormGroup = this.fb.group({
    // Add form controls here
  });
  selectedAddressType: string = 'Home';
  public phone = localStorage.getItem('phoneNumber');

  constructor(private cdr: ChangeDetectorRef, private location: Location, private apiService: ApiService,  private fb: FormBuilder, private router: Router) { this.initializeForm(); }

  ngOnInit() {
    // Get the user's current location when component is initialized
    this.latitude = this.userLocation?.coordinate?.lat;
    this.longitude = this.userLocation?.coordinate?.lng;
    this.getCurrentLocation();
  }

  // Get user's current location using the Geolocation API
  getCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.currentPosition = {
          lat: this.latitude ? parseFloat(this.latitude) : position.coords.latitude,
          lng: this.longitude ? parseFloat(this.longitude) : position.coords.longitude,
        };
        // Load map once position is fetched
        this.loadMap(this.currentPosition);
      });
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  }

  // Load Google Map centered on the user's current position
  loadMap(position: { lat: number, lng: number }) {
    
    const mapOptions: google.maps.MapOptions = {
      center: position,
      zoom: 15,
    };
    this.map = new google.maps.Map(this.mapContainer.nativeElement, mapOptions);
   

    this.centerMarker = new google.maps.Marker({
      position: this.map.getCenter()!,
      map: this.map,
      // draggable: true, // Allow marker dragging
      // icon: {
      //   url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png', // Custom marker if needed
      // },
    });


    // Listen for map dragging and recenter the marker
    this.map.addListener('center_changed', () => {
      this.centerMarker.setPosition(this.map.getCenter()!);
    });

    // Update location details when map dragging stops
    this.map.addListener('dragend', () => {
      const newCenter = this.map.getCenter();
      if (newCenter) {
        this.currentPosition = {
          lat: newCenter.lat(),
          lng: newCenter.lng(),
        };
        this.updateLocationDetails(this.currentPosition);
      }
    });

    
    this.updateLocationDetails(this.currentPosition);
  }

  // Use Geocoding API to get address details based on lat/lng

  updateLocationDetails(position: { lat: number, lng: number }) {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: position }, (results: google.maps.GeocoderResult[] | null, status: google.maps.GeocoderStatus) => {
      if (status === google.maps.GeocoderStatus.OK) {
        if (results && results.length > 0) {
          this.selectedAddress = results[0].formatted_address;
          // You can display the address below the map
          this.cdr.detectChanges();
        }
      } else {
        console.error('Geocode was not successful for the following reason: ' + status);
      }
    });
  }

  async onSearchChange(event: Event) {

    const target = event.target as HTMLInputElement;
    this.searchedText = target.value;

    let apiParams = {
      searchedText: this.searchedText,
    }
    if (this.searchedText.length > 2) {

      await this.apiService.getDataWithParams('/home/fetchPlaceSuggestions', apiParams).subscribe(
        (response) => {
          this.addressSuggestions = response.predictions;
        },
        (error) => {
          console.error('Error fetching location suggestions:', error);
        }
      );
    }
  }

  // Recenter the map to the current location on button click
  goToCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.currentPosition = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        this.map.setCenter(new google.maps.LatLng(this.currentPosition.lat, this.currentPosition.lng));
        this.updateLocationDetails(this.currentPosition)
        this.cdr.detectChanges();
      });
    } else {
      alert('Geolocation is not supported by this browser.');
    }
    // this.map.setCenter(new google.maps.LatLng(this.currentPosition.lat, this.currentPosition.lng));
  }

  async onSelectSuggestion(placeId: any){
    let apiParams = {
      placeId: placeId,
    }
    if (this.searchedText.length > 2) {

      await this.apiService.getDataWithParams('/home/fetchSelectedAddressDeatils', apiParams).subscribe(
        (response) => {
          this.searchedText = '';
          let locationDetails = JSON.parse(JSON.stringify(response));
          this.selectedAddress = locationDetails.display_address.address_line;
          this.currentPosition = {
            lat: parseFloat(locationDetails.coordinate.lat),
            lng: parseFloat(locationDetails.coordinate.lon),
          };
          
          this.loadMap(this.currentPosition)
          
        },
        (error) => {
          console.error('Error fetching location details:', error);
        }
      );
    }
  }

 

  private initializeForm() {
    this.addressForm = this.fb.group({
      addressType: ['Home', Validators.required],
      otherAddressType: [''],
      houseNumber: ['', Validators.required],
      floor: [''],
      towerBlock: [''],
      landmark: [''],
      name: ['', Validators.required],
      phone : ['', Validators.required]
    });
  }


  setAddressType(type: string) {
    this.selectedAddressType = type;
    this.addressForm.patchValue({
      addressType: type
    });
  }

  isAddressTypeSelected(type: string): boolean {
    return this.selectedAddressType === type;
  }

  async saveAddress() {
    if (this.addressForm.valid) {
      const formData = {
        userId: this.userId,
        ...this.addressForm.value,
        addressType: this.addressForm.value.addressType === 'Other' 
          ? this.addressForm.value.otherAddressType 
          : this.addressForm.value.addressType,
        latitude: this.currentPosition.lat,
        longitude: this.currentPosition.lng,
        fullAddress: this.selectedAddress, 
        is_default: 0
      };

      await this.apiService.getDataWithParams('/home/addNewAddress', formData).subscribe(
        (response) => {
          if (response.message === 'success' && response.code === 200) {

            this.fetchLocationDetails(this.currentPosition.lat, this.currentPosition.lng);
            this.router.navigate(['/home']);
          }
        },
        (error) => {
          console.error('Error fetching location suggestions:', error);
        }
      );
    } else {
      this.markFormFieldsAsTouched();
    }
  }

  private markFormFieldsAsTouched() {
    Object.keys(this.addressForm.controls).forEach(key => {
      const control = this.addressForm.get(key);
      control?.markAsTouched();
    });
  }

  async fetchLocationDetails(lat: number, lon: number) {
    let apiParams = {
      lat: lat,
      lon: lon,
    }
    await this.apiService.getDataWithParams('/home/getUserLocation', apiParams).subscribe(
      (response) => {
        localStorage.setItem('location', JSON.stringify(response));
        sessionStorage.removeItem('mallsList');
        sessionStorage.removeItem('mallsOffset');
        sessionStorage.removeItem('shopsList');
        sessionStorage.removeItem('shopsOffset');
        sessionStorage.removeItem('scrollPosition-shops');
      },
      (error) => {
        console.error('Error fetching location details:', error);
      }
    );
  }

  async openAddMore(){
    this.openAddMorePopup=true;
  }
  async closeAddMore(){
    this.openAddMorePopup=false;
  }
  
  goBackToPreviousPage(){
    // window.history.back();
    this.location.back();
  }
}
