import { Injectable } from '@angular/core';
import { Recommendation } from '../../models/recommendation';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  
  private readonly API_URL = 'http://localhost:8083/api'; // adjust this to your backend URL
  

  constructor(private http: HttpClient) { }
  getPatientRecommendations(patientId: string): Observable<Recommendation[]> {
    return this.http.get<Recommendation[]>(`${this.API_URL}/recommendations/${patientId}`);
  }
}
