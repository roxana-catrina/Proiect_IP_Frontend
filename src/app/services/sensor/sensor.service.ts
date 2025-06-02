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

  constructor(private http: HttpClient) {}

  // Obține cel mai recent set de date pentru un pacient
  getLatestSensorData(patientId: string): Observable<Sensor> {
    return this.http.get<Sensor>(
      `${this.apiUrl}/sensors/latest/${patientId}`,
      this.getAuthHeaders()
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Obține TOATE datele (istoricul complet) pentru un pacient
  getAllSensorData(patientId: string): Observable<Sensor[]> {
    return this.http.get<Sensor[]>(
      `${this.apiUrl}/sensors/patient/${patientId}`,
      this.getAuthHeaders()
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Generează 50 de semnale EKG false pentru testare
  generateTestData(patientId: string): Observable<any> {
    const testData = Array(50).fill(0).map((_, i) => ({
      patientId: patientId,
      ekgSignal: (Math.sin(i * 0.2) * 1.5).toString(),
      timestamp: new Date(Date.now() - (50 - i) * 1000)
    }));

    return this.http.post(
      `${this.apiUrl}/sensors/generate-test/${patientId}`,
      testData,
      this.getAuthHeaders()
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Construiește antetele cu token
  private getAuthHeaders() {
    const token = StorageService.getToken(); // Apel static
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      })
    };
  }

  // Tratamentul erorilor
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'A apărut o eroare';
    if (error.status === 200) {
      return throwError(() => 'Success');
    }
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Eroare client: ${error.error.message}`;
    } else {
      errorMessage = `Cod eroare: ${error.status}\nMesaj: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
