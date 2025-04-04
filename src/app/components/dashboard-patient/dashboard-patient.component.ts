import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { Patient } from '../../models/patient';
import { StorageService } from '../../services/storage/storage.service';
import { PatientService } from '../../services/patient/patient.service';
import { Recommendation } from '../../models/recommendation';
import { CommonModule } from '@angular/common';
import { DoctorService } from '../../services/doctor/doctor.service';
@Component({
  selector: 'app-dashboard-patient',
  templateUrl: './dashboard-patient.component.html',
  styleUrls: ['./dashboard-patient.component.css'],
  imports: [CommonModule]
})

export class DashboardPatientComponent implements OnInit {
  patient: Patient | null = null;
  recommendations: Recommendation[] = [];
  doctorNames: Map<string, string> = new Map();

  constructor(private authService: AuthService, private patientService: PatientService,
    private doctorService: DoctorService, private storageService: StorageService
  ) {}

  ngOnInit() {
    const patient = StorageService.getPatient();
    if (patient && patient.email) {
      this.loadPatientData(patient.email);
      console.log('Patient data loaded:', patient);
    }
    if (this.patient?.id) {
      this.loadPatientRecommendations(this.patient.id);
    }
  }

  private loadPatientData(email: string) {
    this.authService.getPatientByEmail(email).subscribe({
      next: (patient: Patient) => {
        this.patient = patient;
        if (patient.id) {
          this.loadPatientRecommendations(patient.id);
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
}
