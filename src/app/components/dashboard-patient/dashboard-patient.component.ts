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
import { Doctor } from '../../models/doctor';

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
doctors: Doctor[] = [];
sortColumn: string = '';
sortDirection: 'asc' | 'desc' = 'asc';
  constructor(private authService: AuthService, private patientService: PatientService,
    private doctorService: DoctorService, private storageService: StorageService,
    private alertService: AlertService,
    private router: Router
  ) {}

  ngOnInit() {
    const patient = StorageService.getPatient();
    if (patient && patient.email) {
      this.loadPatientData(patient.email);
      this.loadAllDoctors(); // Load all doctors when the component initializes
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

private loadAllDoctors() {
    this.doctorService.getAllDoctors().subscribe({
      next: (doctors: Doctor[]) => {
        this.doctors = doctors;
        // Create a map of doctor names for quick lookup
        doctors.forEach(doctor => {
          const fullName = doctor.name;
          this.doctorNames.set(doctor.id, fullName);
        });
        console.log('All doctors loaded:', this.doctors);
      },
      error: (error) => {
        console.error('Error loading doctors:', error);
      }
    });
  }

  getDoctorName(doctorId: string): void  {
    // First check if we already have the name cached
    if (this.doctorNames.has(doctorId)) {
      this.doctorNames.get(doctorId) || 'Doctor necunoscut';
    }

    // Find doctor in the loaded doctors array
    const doctor = this.doctors.find(d => d.id === doctorId);
    if (doctor) {
     // const fullName = `${doctor.name}`;
      this.doctorNames.set(doctorId, doctor.name);
      
    }

    console.log('Doctor not found in list, ID:', doctorId);
    ;
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

  sort(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.recommendations.sort((a, b) => {
      let comparison = 0;
      
      switch (column) {
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'doctorId':
          const doctorA = this.doctorNames.get(a.doctorId) || '';
          const doctorB = this.doctorNames.get(b.doctorId) || '';
          comparison = doctorA.localeCompare(doctorB);
          break;
        case 'activityType':
          comparison = a.activityType.localeCompare(b.activityType);
          break;
      }

      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
  }

  getSortIcon(column: string): string {
    if (this.sortColumn !== column) {
      return 'bi-arrow-down-up';
    }
    return this.sortDirection === 'asc' ? 'bi-arrow-up' : 'bi-arrow-down';
  }

  logout(): void {
    StorageService.logout();
    this.router.navigate(['/home']); // or wherever you want to redirect after logout
  }
}
