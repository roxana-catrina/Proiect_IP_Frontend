import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { PatientService } from '../../services/patient/patient.service';
import { StorageService } from '../../services/storage/storage.service';
import { Router } from '@angular/router';
import { Patient } from '../../models/patient';
import { AuthService } from '../../services/auth/auth.service';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { first, last } from 'rxjs';
@Component({
  selector: 'app-modificare-date-pacient',
  templateUrl: './modificare-date-pacient.component.html',
  styleUrls: ['./modificare-date-pacient.component.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,  // <- IMPORTANT
    FormsModule
  ]
})
export class ModificareDatePacientComponent implements OnInit {
  updateForm: FormGroup;
  currentPatient: Patient | null = null;
  newPatient: Patient | null = null; 

  constructor(
    private fb: FormBuilder,
    private patientService: AuthService,
    private router: Router,
    
  ) {
    this.updateForm = this.fb.group({
      phone: ['', [Validators.required]],
      address: ['', [Validators.required]],
      password: ['', [Validators.minLength(6)]],
      age: ['', [Validators.required, Validators.min(0), Validators.max(150)]],
      lastName: ['', [Validators.required]],
      firstName: ['', [Validators.required]],
    });
  }

  ngOnInit() {
    const patient = StorageService.getPatient();
    if (patient && patient.email) {
      this.loadPatientData(patient.email);
    }
  }

  private loadPatientData(email: string) {
    this.patientService.getPatientByEmail(email).subscribe({
      next: (patient: Patient) => {
        this.currentPatient = patient;
        this.updateForm.patchValue({
          phone: patient.phone,
          address: patient.address,
          medicalHistory: patient.medicalHistory,
          lastName: patient.lastName,
          firstName: patient.firstName,
          cnp: patient.cnp,
          age: patient.age,
          email: patient.email,

        });
      },
      error: (error) => console.error('Error loading patient:', error)
    });
  }

  onSubmit() {
    if (this.updateForm.valid && this.currentPatient?.id) {
      // Create update data object with only non-empty fields
      const formValues = this.updateForm.value;
       

      // Check each field and only include if it has a value
      if (formValues.phone?.trim()) {
        this.currentPatient.phone = formValues.phone.trim();
       
      }
      if (formValues.address?.trim()) {
        this.currentPatient.address = formValues.address.trim();
      }
      if (formValues.medicalHistory?.trim()) {
        this.currentPatient.medicalHistory = formValues.medicalHistory.trim();
      }
      if (formValues.password?.trim()) {
        this.currentPatient.password = formValues.password.trim();
      }
      if (formValues.age) {
        this.currentPatient.age = formValues.age;
        console.log('Age:', this.currentPatient.age);
        console.log('Age:',this.currentPatient.id);
        console.log(this.currentPatient);
      }

      // Only proceed with update if there are changes
      if (this.currentPatient) {
        this.patientService.updatePatient(this.currentPatient.email,  this.currentPatient).subscribe({
          next: () => {
            console.log('Patient updated successfully', this.currentPatient);
            this.router.navigate(['/patient']);
          },
          error: (error) => {
            console.error('Error updating patient:', error);
          }
        });
      } else {
        console.log('No changes to update');
        this.router.navigate(['/patient']);
      }
    }
  }
}
