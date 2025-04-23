import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { Patient } from '../../models/patient';
import { StorageService } from '../../services/storage/storage.service';
import { PatientService } from '../../services/patient/patient.service';
import { Recommendation } from '../../models/recommendation';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DoctorService } from '../../services/doctor/doctor.service';
import { AlertService } from '../../services/alert/alert.service';
import { Alert } from '../../models/alert';
import { Router } from '@angular/router';
import { Sensor } from '../../models/sensor';

@Component({
  selector: 'app-dashboard-patient',
  templateUrl: './dashboard-patient.component.html',
  styleUrls: ['./dashboard-patient.component.css'],
  imports: [CommonModule, RouterModule],
  standalone: true
})

export class DashboardPatientComponent implements OnInit {
  patient: Patient | null = null;
  recommendations: Recommendation[] = [];
  doctorNames: Map<string, string> = new Map();
  alerts: Alert[] = [];
  sensors: Sensor[] = [];


  constructor(private authService: AuthService, private patientService: PatientService,
    private doctorService: DoctorService, private storageService: StorageService,
    private alertService: AlertService,
    private router: Router
  ) {}

  ngOnInit() {
    const patient = StorageService.getPatient();
    if (patient && patient.email) {
      this.loadPatientData(patient.email);
    }
  }

  private loadPatientData(email: string) {
    this.authService.getPatientByEmail(email).subscribe({
      next: (patient: Patient) => {
        this.patient = patient;
        if (patient.id) {
          this.loadPatientRecommendations(patient.id);
          this.loadPatientSensors(patient.id);
          this.loadAlerts(); // Move loadAlerts here after patient data is loaded
        }
      },
      error: (error) => {
        console.error('Error loading patient data:', error);
      }
    });
  }

  private loadPatientRecommendations(patientId: string) {
    this.patientService.getPatientRecommendations(patientId)
      .subscribe({
        next: (recommendations) => {
          this.recommendations = recommendations;
        },
        error: (error) => {
          console.error('Error loading patient recommendations:', error);
        }
      });
  }


  private loadPatientSensors(patientId: string) {
    this.patientService.getPatientSensors(patientId)
      .subscribe({
        next: (sensors) => {
          this.sensors = sensors;
        },
        error: (error) => {
          console.error('Error loading patient sensors:', error);
        }
      });
  }


  getDoctorName(doctorId: string): void {
    if (!this.doctorNames.has(doctorId)) {
      this.doctorService.getDoctorById(doctorId).subscribe({
        next: (doctor) => {
          this.doctorNames.set(doctorId, `${doctor.name}`);
        },
        error: (error) => {
          console.error('Error loading doctor:', error);
          this.doctorNames.set(doctorId, 'Unknown Doctor');
        }
      });
    }
  }

  private loadAlerts() {
    if (!this.patient?.id) {
      console.error('Cannot load alerts: Patient ID is missing');
      return;
    }

    this.alertService.getPacientAlerts(this.patient.id).subscribe({
      next: (alerts: Alert[]) => {
        this.alerts = alerts.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        console.log('Alerts loaded successfully:', this.alerts);
      },
      error: (error) => {
        console.error('Error loading alerts:', error);
        this.alerts = [];
      },
      complete: () => {
        console.log('Alerts loading completed');
      }
    });
  }
  logout(): void {
    StorageService.logout();
    this.router.navigate(['/home']); // or wherever you want to redirect after logout
  }
}
