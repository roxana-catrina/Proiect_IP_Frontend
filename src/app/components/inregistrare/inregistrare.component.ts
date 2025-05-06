import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DoctorService } from '../../services/doctor/doctor.service';
import { InregistrareService } from '../../services/inregistrare/inregistrare.service';
import { Doctor } from '../../models/doctor';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { Patient } from '../../models/patient';

@Component({
  selector: 'app-inregistrare',
  templateUrl: './inregistrare.component.html',
  styleUrls: ['./inregistrare.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule]
})
export class InregistrareComponent implements OnInit {
  doctors: Doctor[] = [];
  patientForm: FormGroup;
  maxDate: string;

  constructor(
    private doctorService: DoctorService,
    private inregistrareService: InregistrareService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Set max date to today
    const today = new Date();
    this.maxDate = today.toISOString().split('T')[0];

    this.patientForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      cnp: ['', [Validators.required, Validators.pattern(/^\d{13}$/)]],
     // age: ['', [Validators.required, Validators.min(0), Validators.max(150)]],
      address: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      email: ['', [Validators.required, Validators.email]],
      job: ['', Validators.required],
      medicalHistory: [''],
      doctorName: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(2)]],
      dateBirth: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadDoctors();
  }

  loadDoctors(): void {
    this.doctorService.getAllDoctors().subscribe({
      next: (doctors) => {
        this.doctors = doctors;
        console.log('Doctors loaded:', doctors);
      },
      error: (error) => console.error('Error loading doctors:', error)
    });
  }

  onSubmit(): void {
    if (this.patientForm.valid) {
      const formData = this.patientForm.value;

      this.route.queryParams.subscribe(params => {
        const returnUrl = params['returnUrl'] || '/home';
        const doctorId = params['doctorId'];

        const patientData: Patient = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          cnp: formData.cnp,
          age: formData.age,
          address: formData.address,
          phone: formData.phone,
          email: formData.email,
          medicalHistory: formData.medicalHistory,
          doctorId: doctorId || "1",
          password: formData.password,
          dateBirth: new Date(formData.dateBirth)
        };

        console.log('Registering patient with data:', patientData);

        this.inregistrareService.createPatient(patientData, formData.doctorName).subscribe({
          next: (response) => {
            console.log('Patient registered successfully:', response);
            this.router.navigate([returnUrl]);
          },
          error: (error) => {
            console.error('Error registering patient:', error);
          }
        });
      });
    } else {
      Object.keys(this.patientForm.controls).forEach(key => {
        const control = this.patientForm.get(key);
        control?.markAsTouched();
      });
    }
  }
}
