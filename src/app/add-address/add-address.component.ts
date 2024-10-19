import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';

@Component({
  selector: 'app-add-address',
  standalone: true,
  imports: [],
  templateUrl: './add-address.component.html',
  styleUrl: './add-address.component.css'
})
export class AddAddressComponent implements OnInit {
  @ViewChild('mapContainer', { static: false }) mapContainer: ElementRef;
  map: google.maps.Map;
  currentPosition: { lat: number, lng: number };
  marker: google.maps.Marker;

  constructor() {}

  ngOnInit() {
    // Get the user's current position and initialize the map
    this.getCurrentLocation();
  }

  // Get the user's current location
  getCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.currentPosition = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        this.loadMap(this.currentPosition);
      });
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  }

  // Load the Google Map with current position
  loadMap(position) {
    const mapOptions: google.maps.MapOptions = {
      center: position,
      zoom: 15,
    };
    this.map = new google.maps.Map(this.mapContainer.nativeElement, mapOptions);
    this.marker = new google.maps.Marker({
      position: position,
      map: this.map,
      draggable: true,  // Allow dragging to move the pin
    });

    // Handle map marker drag event
    this.marker.addListener('dragend', () => {
      const newPosition = this.marker.getPosition();
      this.currentPosition = {
        lat: newPosition.lat(),
        lng: newPosition.lng()
      };
      this.updateLocationDetails(this.currentPosition);
    });
  }

  // Get the updated location details using Google Place Details API
  updateLocationDetails(position) {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: position }, (results, status) => {
      if (status === 'OK') {
        if (results[0]) {
          console.log('Location details:', results[0]);
          // Update the UI with the new address
          // You can display the address below the map as in the screenshot
        }
      }
    });
  }
}
