import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Doctor } from '../../models/doctor';
import { Patient } from '../../models/patient';

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

  doctorLogin(loginData: { email: string; password: string }): Observable<any> {
    return this.http.post('/api/doctor/login', loginData);
  }
  getAllDoctors(): Observable<Doctor[]> {
    return this.http.get<Doctor[]>(`${this.apiUrl}/api/doctors`);
  }
  patientLogin(loginData: { email: string; password: string }): Observable<any> {
    return this.http.post('/api/patient/login', loginData);
  }
  getAllPatients(): Observable<Patient[]> {
    return this.http.get<Patient[]>(`${this.apiUrl}/api/patients`);
  }

  getPatientByEmail(email: string): Observable<Patient> {
    return this.http.get<Patient>(`${this.apiUrl}/api/patients/email/${email}`);
  }
}
