
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
const TOKEN = "token";
const EMAIL = "email";
//const NUME= "nume";
//const ID="id"
@Injectable({
  providedIn: 'root'
})
export class StorageService {
  constructor(
    private router: Router
  ) { }

  static saveToken(token: string): void {
    window.localStorage.removeItem(TOKEN);
    window.localStorage.setItem(TOKEN, token);
  }
  static saveUser(email: any): void {
    window.localStorage.removeItem(EMAIL);
    window.localStorage.setItem(EMAIL, JSON.stringify(email));
 
  }
  static getToken() {
    return window.localStorage.getItem(TOKEN);
  }
  /* static getUser() {
    const user = localStorage.getItem(EMAIL);
    return user ? JSON.parse(user) : null;

  } */
  static isUserLoggedIn(): boolean {
    if (this.getToken()) {
      return true;
    }
    return false;
  }

  static logout(): void {
    if(this.isUserLoggedIn()){
    localStorage.removeItem(EMAIL); // Ștergem datele de autentificare
    localStorage.removeItem(TOKEN);}

  }
}