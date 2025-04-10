import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Alert } from '../../models/alert';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private readonly apiUrl = 'http://localhost:8083/api';

  constructor(private http: HttpClient) { }

  getAlerts(): Observable<Alert[]> {
    return this.http.get<Alert[]>(`${this.apiUrl}/alerts`);
  }

  getPacientAlerts(patientId: string): Observable<Alert[]> {
    return this.http.get<Alert[]>(`${this.apiUrl}/alerts/${patientId}`);
  }
}
