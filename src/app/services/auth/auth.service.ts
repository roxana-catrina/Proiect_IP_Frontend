import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Doctor } from '../../models/doctor';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8083';
  private doctors: Doctor[] = [];

  constructor(private http: HttpClient) {
    this.loadDoctors();
  }

  private loadDoctors() {
    this.http.get<Doctor[]>(`${this.apiUrl}/api/doctors`).subscribe({
      next: (doctors) => this.doctors = doctors,
      error: (error) => console.error('Error loading doctors:', error)
    });
  }

  isDoctorEmail(email: string): boolean {
    return this.doctors.some(doctor => doctor.email === email);
  }

  doctorLogin(loginData: { email: string; password: string }): Observable<any> {
    return this.http.post('/api/doctor/login', loginData);
  }
  getAllDoctors(): Observable<Doctor[]> {
    return this.http.get<Doctor[]>(`${this.apiUrl}/api/doctors`);
  }
}
