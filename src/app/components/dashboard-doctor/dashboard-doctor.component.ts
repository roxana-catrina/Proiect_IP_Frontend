import { Component, OnInit } from '@angular/core';
import { Patient } from '../../models/patient';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { StorageService } from '../../services/storage/storage.service';
import { PatientService } from '../../services/patient/patient.service';
import { DoctorService } from '../../services/doctor/doctor.service';
import { AlertService } from '../../services/alert/alert.service';
import { Doctor } from '../../models/doctor';
@Component({
  selector: 'app-dashboard-doctor',
   templateUrl: './dashboard-doctor.component.html',
  styleUrl: './dashboard-doctor.component.css',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule]
 
})
export class DashboardDoctorComponent implements OnInit {
  searchTerm: string = '';
  allPatients: Patient[] = []; // Store all patients
  patients: Patient[] = []; // Filtered patients
  doctor: Doctor | null = null;
  constructor(private authService: AuthService, private patientService: PatientService,
    private doctorService: DoctorService, private storageService: StorageService,
    private alertService: AlertService,
    private router: Router
  ) {}
  ngOnInit() {
    const doctor = StorageService.getDoctor();
    if (doctor && doctor.email) {
      this.loadDoctorData(doctor.email);
    }
  }

  private loadDoctorData(email: string) {
    // First, load doctor details
    this.authService.getDoctorByEmail(email).subscribe({
      next: (doctor: Doctor) => {
        this.doctor = doctor;
        console.log('Doctor loaded:', this.doctor);
        
        // Then load doctor's patients
        this.authService.getDoctorAllPatients(email).subscribe({
          next: (patients: Patient[]) => {
            this.allPatients = patients;
            this.patients = [...patients];
            console.log('Loaded patients:', this.patients);
          },
          error: (error: any) => {
            console.error('Error loading patient data:', error);
          }
        });
      },
      error: (error) => {
        console.error('Error loading doctor data:', error);
      }
    });
  }
  searchPatients() {
    if (!this.searchTerm) {
      this.patients = [...this.allPatients];
      return;
    }

    /* this.patients = this.allPatients.filter(patient => 
      patient.firstName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      patient.lastName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      patient.cnp.includes(this.searchTerm)
    ); */
  }
  editPatient(id: string): void {
   /*  console.log('Editing patient with ID:', id);
    this.router.navigate(['/edit-patient', id]); */
  }
  deletePatient(email: string): void {
    if (confirm('Ești sigur că vrei să ștergi acest pacient?')) {
      this.authService.deletePatient(email).subscribe({
        next: () => {
          console.log('Patient deleted successfully');
          // Remove patient from local arrays
          this.allPatients = this.allPatients.filter(p => p.email !== email);
          this.patients = this.patients.filter(p => p.email !== email);
        },
        error: (error) => {
          console.error('Error deleting patient:', error);
        }
      });
    }
  }
  addPatient(): void {
   //   this.router.navigate(['/inregistrare']);
  }


  viewRecommendations(patientEmail: string) {
    this.router.navigate(['/recomendations'], {
    
      queryParams: { email: patientEmail, emailDoctor: this.doctor?.email, idDoctor: this.doctor?.id },
    });
    console.log("id", this.doctor?.id)

}}
