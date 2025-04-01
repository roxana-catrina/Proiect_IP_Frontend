import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  constructor(private http: HttpClient) { }

  // Metodă pentru autentificare
  patientLogin(credentials: { email: string; password: string }) {
    return this.http.post('http://localhost:8083/api/patient-login', credentials, { withCredentials: true });
  }
  doctorLogin(credentials: { email: string; password: string }) {
    return this.http.post('/api/doctor/login', credentials, { withCredentials: true });
  }
}

