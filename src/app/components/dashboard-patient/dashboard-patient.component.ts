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
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-dashboard-patient',
  templateUrl: './dashboard-patient.component.html',
  styleUrls: ['./dashboard-patient.component.css'],
  imports: [CommonModule, RouterModule, FormsModule],
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
  currentPage: number = 1;
  pageSize: number = 5;
  totalPages: number = 1;
  pagedRecommendations: Recommendation[] = [];

  // Add these new properties for alerts pagination
  alertCurrentPage: number = 1;
  alertPageSize: number = 5;
  alertTotalPages: number = 1;
  pagedAlerts: Alert[] = [];

  constructor(private authService: AuthService, private patientService: PatientService,
    private doctorService: DoctorService, private storageService: StorageService,
    private alertService: AlertService,
    private router: Router
  ) {}

  ngOnInit() {
    const patient = StorageService.getPatient();
    if (patient && patient.email) {
      this.loadPatientData(patient.email);
      this.loadAllDoctors();
    }
  }

  private loadPatientData(email: string) {
    this.authService.getPatientByEmail(email).subscribe({
      next: (patient: Patient) => {
        this.patient = patient;
        if (patient.id) {
          this.loadPatientRecommendations(patient.id);
          this.loadPatientSensors(patient.id);
          this.loadPatientAlerts(patient.id);
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
          // Sort and initialize paging immediately after loading
          this.sortRecommendations();
          this.updatePagedRecommendations();
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

  getDoctorName(doctorId: string): void {
    // First check if we already have the name cached
    if (this.doctorNames.has(doctorId)) {
      this.doctorNames.get(doctorId) || 'Doctor necunoscut';
    }

    // Find doctor in the loaded doctors array
    const doctor = this.doctors.find(d => d.id === doctorId);
    if (doctor) {
      this.doctorNames.set(doctorId, doctor.name);
    }

    console.log('Doctor not found in list, ID:', doctorId);
  }

  private loadPatientAlerts(patientId: string) {
    this.alertService.getPacientAlerts(patientId).subscribe({
      next: (alerts) => {
        this.alerts = alerts;
        // Sort by timestamp descending and initialize paging
        this.alerts.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        this.updatePagedAlerts();
      },
      error: (error) => {
        console.error('Error loading alerts:', error);
      }
    });
  }

  get alertPages(): number[] {
    return Array.from({ length: this.alertTotalPages }, (_, i) => i + 1);
  }

  setAlertPage(page: number) {
    if (page >= 1 && page <= this.alertTotalPages) {
      this.alertCurrentPage = page;
      this.updatePagedAlerts();
    }
  }

  onAlertPageSizeChange() {
    this.alertCurrentPage = 1;
    this.updatePagedAlerts();
  }

  private updatePagedAlerts() {
    this.alertTotalPages = Math.ceil(this.alerts.length / this.alertPageSize);
    const startIndex = (this.alertCurrentPage - 1) * this.alertPageSize;
    const endIndex = startIndex + this.alertPageSize;
    this.pagedAlerts = this.alerts.slice(startIndex, endIndex);
  }

  sortAlerts(column: string) {
    if (column === 'timestamp') {
      this.alerts.reverse();
      this.updatePagedAlerts();
    }
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

  private sortRecommendations() {
    this.recommendations.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  setPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagedRecommendations();
    }
  }

  onPageSizeChange() {
    this.currentPage = 1;
    this.updatePagedRecommendations();
  }

  private updatePagedRecommendations() {
    this.totalPages = Math.ceil(this.recommendations.length / this.pageSize);
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.pagedRecommendations = this.recommendations.slice(startIndex, endIndex);
  }

  logout(): void {
    StorageService.logout();
    this.router.navigate(['/home']); // or wherever you want to redirect after logout
  }
}
