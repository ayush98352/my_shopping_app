import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { ApiService } from '../services/api.service';
import { RouterModule } from '@angular/router';
import { CommonModule} from '@angular/common'; // Import CommonModule



@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  public phoneNumber: string = '';
  public otp: string = '';
  public otpSent: boolean = false;

  constructor(private http: HttpClient, private router: Router, private apiService: ApiService) {}

  async sendOtp() {
    let apiParams = {
      phone_number: this.phoneNumber
    }
    await this.apiService.getDataWithParams('/home/send-otp', apiParams)
      .subscribe(response => {
        this.otpSent = true;
      }, error => {
        alert('Error sending OTP');
      });
  }

  async verifyOtp() {
    let apiParams = {
      phone_number: this.phoneNumber,
      otp: this.otp
    }
    await this.apiService.getDataWithParams('/home/verify-otp', apiParams)
      .subscribe((response: any) => {
        if (response.statusCode === 401 && response.message === "Invalid OTP") {
          alert('Invalid OTP');
        } else {
          localStorage.setItem('auth_token', response.token); // Save token in local storage
          localStorage.setItem('phoneNumber', this.phoneNumber); // Save phone number in local storage
          localStorage.setItem('loggedInUserId', response.userDetails.result[0].user_id)
          this.router.navigate(['/home']); // Navigate to home page
        }
      }, error => {
        alert('Invalid OTP');
      });
  }
}
