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
    this.authService.getDoctorAllPatients(email).subscribe({
      next:  (patients: Patient[]) => {
        this.allPatients = patients;
        this.patients = [...patients]; // Copy for filtering
        console.log('Loaded patients:', this.patients);
      },
      error: (error: any) => {
        console.error('Error loading patient data:', error);
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
  deletePatient(id: string): void {
   /*  if (confirm('Sunteți sigur că doriți să ștergeți acest pacient?')) {
      this.patientService.deletePatient(id).subscribe({
        next: () => {
          console.log('Patient deleted successfully');
          // Remove patient from the local array
          this.patients = this.patients.filter(p => p.id !== id);
        },
        error: (error) => {
          console.error('Error deleting patient:', error);
          // Show error message to user
          alert('A apărut o eroare la ștergerea pacientului.');
        }
      }); */
    }
    addPatient(): void {
   //   this.router.navigate(['/inregistrare']);
    }


    viewRecommendations(patientId: string): void {
      /* console.log('Viewing recommendations for patient:', patientId);
      this.router.navigate(['/recommendations', patientId]); */
    }
  
}
