import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import {Patient} from '../../models/patient';
@Component({
  selector: 'app-patient',
  standalone: false,
  
  templateUrl: './patient.component.html',
  styleUrl: './patient.component.css'
})
export class PatientComponent implements OnInit {
  patientForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.patientForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      CNP: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      age: ['', [Validators.required, Validators.min(0)]],
      address: ['', Validators.required],
      phone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      medicalHistory: [''],
      doctorId: ['', Validators.required]
    });
  }
  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }
  onSubmit(): void {
    if (this.patientForm.valid) {
      const patientData: Patient = this.patientForm.value;
      console.log('Patient data:', patientData);
      // Here you would typically call your service to save the patient
      // this.patientService.registerPatient(patientData).subscribe(...);
    }
  }
}
