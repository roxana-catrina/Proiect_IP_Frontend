import { Component } from '@angular/core';
import { Patient } from '../../models/patient';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-dashboard-doctor',
   templateUrl: './dashboard-doctor.component.html',
  styleUrl: './dashboard-doctor.component.css',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule]
 
})
export class DashboardDoctorComponent {
  searchTerm: string = '';
  allPatients: Patient[] = []; // Store all patients
  patients: Patient[] = []; // Filtered patients

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
