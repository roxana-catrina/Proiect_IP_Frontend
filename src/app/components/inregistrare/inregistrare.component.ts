import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
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
  submitted = false; // ✅ folosit pentru afișarea erorilor doar după submit

  constructor(
    private doctorService: DoctorService,
    private inregistrareService: InregistrareService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) {
    const today = new Date();
    this.maxDate = today.toISOString().split('T')[0];

    this.patientForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      cnp: ['', [Validators.required, cnpValidator]],
      address: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      email: ['', [Validators.required, Validators.email]],
      job: ['', Validators.required],
      medicalHistory: [''],
      doctorName: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
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
    this.submitted = true; // ✅ activăm validările

    if (this.patientForm.invalid) {
      this.patientForm.markAllAsTouched(); // ✅ forțăm afișarea erorilor
      return;
    }

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
  }
}

// ✅ VALIDATOR PENTRU CNP
export function cnpValidator(control: AbstractControl): ValidationErrors | null {
  const cnp = control.value;

  if (!cnp || !/^\d{13}$/.test(cnp)) {
    return { invalidCNP: true };
  }

  const s = parseInt(cnp[0]);
  const year = parseInt(cnp.substr(1, 2), 10);
  const month = parseInt(cnp.substr(3, 2), 10);
  const day = parseInt(cnp.substr(5, 2), 10);

  let fullYear = 0;
  if (s === 1 || s === 2) {
    fullYear = 1900 + year;
  } else if (s === 3 || s === 4) {
    fullYear = 1800 + year;
  } else if (s === 5 || s === 6) {
    fullYear = 2000 + year;
  } else {
    return { invalidCNP: true };
  }

  const birthDate = new Date(fullYear, month - 1, day);
  if (
    birthDate.getFullYear() !== fullYear ||
    birthDate.getMonth() !== month - 1 ||
    birthDate.getDate() !== day
  ) {
    return { invalidCNP: true };
  }

  const controlKey = '279146358279';
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cnp[i]) * parseInt(controlKey[i]);
  }
  const controlDigit = sum % 11 === 10 ? 1 : sum % 11;
  if (controlDigit !== parseInt(cnp[12])) {
    return { invalidCNP: true };
  }

  return null;
}
