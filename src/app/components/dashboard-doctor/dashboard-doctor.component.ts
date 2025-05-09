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
  currentPage: number = 1;
  pageSize: number = 5;
  totalPages: number = 1;
  pagedPatients: Patient[] = [];
  sortColumn: string = 'lastName';
  sortDirection: 'asc' | 'desc' = 'asc';

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

  calculateAge(birthDate: Date): number {
    if (!birthDate) {
      return 0;
    }
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }


  private loadDoctorData(email: string) {
    this.authService.getDoctorByEmail(email).subscribe({
      next: (doctor: Doctor) => {
        this.doctor = doctor;
        console.log('Doctor loaded:', this.doctor);
        
        this.authService.getDoctorAllPatients(email).subscribe({
          next: (patients: Patient[]) => {
            this.allPatients = patients;
            this.patients = [...patients];
            this.sortPatients();
            this.updatePagedPatients();
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

  private sortPatients() {
    this.patients.sort((a, b) => {
      let comparison = 0;
      switch (this.sortColumn) {
        case 'lastName':
          comparison = a.lastName.localeCompare(b.lastName);
          break;
        case 'firstName':
          comparison = a.firstName.localeCompare(b.firstName);
          break;
       
        
      }
      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
  }

  private updatePagedPatients() {
    this.totalPages = Math.ceil(this.patients.length / this.pageSize);
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.pagedPatients = this.patients.slice(startIndex, endIndex);
  }

  searchPatients() {
    if (!this.searchTerm) {
      this.patients = [...this.allPatients];
      this.updatePagedPatients();
      return;
    }
  }

  editPatient(id: string): void {
  }

  deletePatient(email: string): void {
    if (confirm('Ești sigur că vrei să ștergi acest pacient?')) {
      this.authService.deletePatient(email).subscribe({
        next: () => {
          console.log('Patient deleted successfully');
          this.allPatients = this.allPatients.filter(p => p.email !== email);
          this.patients = this.patients.filter(p => p.email !== email);
          this.updatePagedPatients();
        },
        error: (error) => {
          console.error('Error deleting patient:', error);
        }
      });
    }
  }

  addPatient(): void {
    this.router.navigate(['/inregistrare'], {
      queryParams: { 
        returnUrl: '/doctor',
        doctorId: this.doctor?.id
      }
    });
  }

  viewRecommendations(patientEmail: string) {
    this.router.navigate(['/recomendations'], {
      queryParams: { email: patientEmail, emailDoctor: this.doctor?.email, idDoctor: this.doctor?.id },
    });
    console.log("id", this.doctor?.id)
  }

  logout(): void {
    StorageService.logout();
    this.router.navigate(['/home']); // or wherever you want to redirect after logout
  }

  sort(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.sortPatients();
    this.updatePagedPatients();
  }

  setPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagedPatients();
    }
  }

  onPageSizeChange() {
    this.currentPage = 1;
    this.updatePagedPatients();
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  getSortIcon(column: string): string {
    if (this.sortColumn !== column) {
      return 'bi-arrow-down-up';
    }
    return this.sortDirection === 'asc' ? 'bi-arrow-up' : 'bi-arrow-down';
  }
}
