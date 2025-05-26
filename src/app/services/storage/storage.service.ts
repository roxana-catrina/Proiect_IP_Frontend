import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

const TOKEN = "token";
const PATIENT_KEY = "patient";
const DOCTOR_KEY = "doctor";
const USER_TYPE = "userType"; // "patient" or "doctor"

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  static saveUser(arg0: { email: any; }) {
    throw new Error('Method not implemented.');
  }
  static logout() {
    throw new Error('Method not implemented.');
  }
  constructor(
    private router: Router
  ) { }

  static saveToken(token: string): void {
    window.localStorage.removeItem(TOKEN);
    window.localStorage.setItem(TOKEN, token);
  }

  static savePatient(patientData: any): void {
    window.localStorage.removeItem(PATIENT_KEY);
    window.localStorage.setItem(PATIENT_KEY, JSON.stringify(patientData));
    window.localStorage.setItem(USER_TYPE, "patient");
  }

  static saveDoctor(doctorData: any): void {
    window.localStorage.removeItem(DOCTOR_KEY);
    window.localStorage.setItem(DOCTOR_KEY, JSON.stringify(doctorData));
    window.localStorage.setItem(USER_TYPE, "doctor");
  }

  static getToken() {
    return window.localStorage.getItem(TOKEN);
  }

  static getPatient() {
    const patient = localStorage.getItem(PATIENT_KEY);
    return patient ? JSON.parse(patient) : null;
  }

  static getDoctor() {
    const doctor = localStorage.getItem(DOCTOR_KEY);
    return doctor ? JSON.parse(doctor) : null;
  }

  static getUserType() {
    return localStorage.getItem(USER_TYPE);
  }

  static isUserLoggedIn(): boolean {
    return !!this.getToken();
  }

  // Non-static logout to allow router injection
  logout(): void {
    if (StorageService.isUserLoggedIn()) {
      localStorage.removeItem(PATIENT_KEY);
      localStorage.removeItem(DOCTOR_KEY);
      localStorage.removeItem(TOKEN);
      localStorage.removeItem(USER_TYPE);
      
      // Redirect to login page
      this.router.navigate(['/login']);
    }
  }

  // For static usage in other components
  static clearStorage(): void {
    localStorage.removeItem(PATIENT_KEY);
    localStorage.removeItem(DOCTOR_KEY);
    localStorage.removeItem(TOKEN);
    localStorage.removeItem(USER_TYPE);
  }
}