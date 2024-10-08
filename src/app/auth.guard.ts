import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    // const token = localStorage.getItem('auth_token');  // Check if JWT exists in localStorage
    // if (token) {
    //   return true;  // Allow route access
    // } else {
    //   this.router.navigate(['/login']);  // Redirect to login if not authenticated
    //   return false;
    // }
    return true;
  }
}
