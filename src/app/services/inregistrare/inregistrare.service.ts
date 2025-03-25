import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Patient } from '../../models/patient';

@Injectable({
  providedIn: 'root'
})
export class InregistrareService {
  private apiUrl = 'http://localhost:8083/api/patients';

  constructor(private http: HttpClient) { }

  createPatient(patientData: Patient, nameDoctor: string): Observable<Patient> {
    // Log the received values
    console.log('Creating patient with:', { patientData, nameDoctor });

    // Create query parameters with the correct parameter name
    const params = new HttpParams().set('nameDoctor', nameDoctor);

    // Log the final request details
    console.log('Request URL:', this.apiUrl);
    console.log('Request params:', params.toString());
    
    return this.http.post<Patient>(this.apiUrl, patientData, { params });
  }
}
