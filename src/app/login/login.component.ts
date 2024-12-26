import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { ApiService } from '../services/api.service';
import { RouterModule } from '@angular/router';
import { CommonModule} from '@angular/common'; // Import CommonModule
import { FormBuilder, FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { Location } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { SvgRegistryService } from '../services/svg-registry.service';



@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, MatIconModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],  // Add this line
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  public phoneNumber: string = '';
  public otp: string = '';
  public otpSent: boolean = false;
  loginForm: FormGroup;
  otpForm: FormGroup;
  isResendEnabled = false;
  countdown = 30;
  timer: any;
  // public body :any;

  constructor(private http: HttpClient, private router: Router, private apiService: ApiService, private fb: FormBuilder, private location: Location) {
    this.loginForm = this.fb.group({
      phoneNumber: ['', [
        Validators.required,
        Validators.pattern('^[0-9]{10}$')
      ]],
      terms: [false, Validators.requiredTrue]
    });
    this.otpForm = new FormGroup({
      otp1: new FormControl('', [Validators.required]),
      otp2: new FormControl('', [Validators.required]),
      otp3: new FormControl('', [Validators.required]),
      otp4: new FormControl('', [Validators.required]),
      otp5: new FormControl('', [Validators.required]),
      otp6: new FormControl('', [Validators.required]),
    });
    // if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    //   this.body = document.body;
    //   this.body.style.overflowY = 'auto';  
    // }
    
  }

  clearNumber() {
    this.loginForm.get('phoneNumber')?.setValue('');
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.phoneNumber = this.loginForm.value.phoneNumber;
      this.sendOtp();
    }
  }

  async sendOtp() {
    if (this.loginForm.valid){
      let apiParams = {
        phone_number: this.loginForm.value.phoneNumber,
      }
      await this.apiService.getDataWithParams('/home/send-otp', apiParams)
        .subscribe(response => {
          this.otpSent = true;
          this.startResendOtpTimer();
          // this.body.style.overflowY = 'hidden';  
        }, error => {
          alert('Error sending OTP');
        });
    }
  }

  async verifyOtp() {
    if (this.otpForm.valid) {
      const otp = `${this.otpForm.value.otp1}${this.otpForm.value.otp2}${this.otpForm.value.otp3}${this.otpForm.value.otp4}${this.otpForm.value.otp5}${this.otpForm.value.otp6}`;

      let apiParams = {
        phone_number: this.phoneNumber,
        otp: otp
      }
      await this.apiService.getDataWithParams('/home/verify-otp', apiParams)
        .subscribe((response: any) => {
          if (response.statusCode === 401 && response.message === "Invalid OTP") {
            // alert('Invalid OTP');
            // need to check this in production
          } else {
            localStorage.setItem('auth_token', response.token); // Save token in local storage
            localStorage.setItem('phoneNumber', this.phoneNumber); // Save phone number in local storage
            localStorage.setItem('loggedInUserId', response.userDetails.result[0].user_id)
            
            this.router.navigate(['/home']); // Navigate to home page
          }
        }, error => {
          alert('Invalid OTP');
        });
    } else {
      console.error('OTP form is invalid');
    }

    
  }


  // Automatically switch focus to the next input
  onKeyUp(event: KeyboardEvent, nextInputId: string): void {
    
    const input = event.target as HTMLInputElement;
    if (input.value.length === 1 && nextInputId) {
      const nextInput = document.getElementById(nextInputId) as HTMLInputElement;
      nextInput?.focus();
    }
  }
  onKeyDown(event: KeyboardEvent, previousInputId: string): void {
    if (event.key === 'Backspace') {
      const input = event.target as HTMLInputElement;
      if (input.value.length === 0 && previousInputId) {
        const previousInput = document.getElementById(previousInputId) as HTMLInputElement;
        previousInput?.focus();
      }
    }
  }

  // Handle OTP paste event
  onOtpPaste(event: ClipboardEvent): void {
    const clipboardData = event.clipboardData?.getData('text') || '';
    if (clipboardData.length === 6) {
      clipboardData.split('').forEach((digit, index) => {
        this.otpForm.get(`otp${index + 1}`)?.setValue(digit);
      });
      this.verifyOtp(); // Auto-submit on paste
    }
  }


  // Resend OTP function with countdown timer
  startResendOtpTimer(): void {
    this.isResendEnabled = false;
    this.countdown = 30;
    this.timer = setInterval(() => {
      this.countdown -= 1;
      if (this.countdown <= 0) {
        clearInterval(this.timer);
        this.isResendEnabled = true;
      }
    }, 1000);
  }

  onResendOtp(event: MouseEvent): void {
    event.stopPropagation(); 
    event.preventDefault();
    if (this.isResendEnabled) {
      this.startResendOtpTimer();
      this.sendOtp();
      // Call the resend OTP API here
    }
  }

  goBackToLogin(){
    this.otpSent = false;
    // this.body.style.overflowY = 'auto';  
  }

  skipLogin(){

    let navId: any = this.location.getState()
    if(navId.navigationId === 1){
      this.router.navigate(['/home']);
    }
    else{
      this.location.back();
    }
    // this.body.style.overflowY = 'hidden';  
  }
}
