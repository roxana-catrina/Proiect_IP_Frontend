import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Sensor } from '../../models/sensor';
import { Observable, catchError, throwError } from 'rxjs';
import { StorageService } from '../storage/storage.service';

@Injectable({
  providedIn: 'root'
})
export class SensorService {
  private apiUrl = 'http://localhost:8083/api';

  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) {}

  getLatestSensorData(patientId: string): Observable<Sensor> {
  return this.http.get<Sensor>(`${this.apiUrl}/sensors/${patientId}/latest`);
}

  

  getAllSensorData(patientId: string): Observable<Sensor[]> {
    return this.http.get<Sensor[]>(
      `${this.apiUrl}/sensors/patient/${patientId}`,
      this.getAuthHeaders()
    ).pipe(
      catchError(this.handleError)
    );
  }

  generateTestData(patientId: string): Observable<any> {
    const testData = Array(50).fill(0).map((_, i) => ({
      patientId: patientId,
      ekgSignal: (Math.sin(i * 0.2) * 1.5).toString(), // Simulate realistic EKG wave
     // heartRate: (70 + Math.floor(Math.random() * 30)).toString(),
     // temperature: 36.0 + (Math.random() * 1.5),
     // humidity: 40.0 + (Math.random() * 20),
      timestamp: new Date(Date.now() - (50 - i) * 1000) // One reading per second
    }));

    return this.http.post(
      `${this.apiUrl}/sensors/generate-test/${patientId}`, 
      testData,
      this.getAuthHeaders()
    ).pipe(
      catchError(this.handleError)
    );
  }

  private getAuthHeaders() {
    const token = StorageService.getToken();
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      })
    };
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    // Don't treat 200 status as an error
    if (error.status === 200) {
      return throwError(() => 'Success');
    }
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
