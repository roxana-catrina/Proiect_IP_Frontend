import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Patient } from '../../models/patient';
import { LoginService } from '../../services/login/login.service';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';
import { StorageService } from '../../services/storage/storage.service';

@Component({
  selector: 'app-patient-login',
  standalone: false,
  templateUrl: './patient-login.component.html',
  styleUrl: './patient-login.component.css'
})
export class PatientLoginComponent {
  loginForm: FormGroup;
  isSpinning: boolean = false;
  searchTerm: string = '';
  patients: Patient[] = [];
  filteredPatients: Patient[] = [];

  constructor(
    private service: LoginService,
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadPatients();
  }

  loadPatients(): void {
    this.authService.getAllPatients().subscribe({
      next: (patients) => {
        this.patients = patients;
        this.filteredPatients = patients;
        console.log('Patients loaded:', patients);
      },
      error: (error) => console.error('Error loading patients:', error)
    });
  }

  searchPatients() {
    if (!this.searchTerm.trim()) {
      this.filteredPatients = [...this.patients];
      return;
    }

    this.filteredPatients = this.patients.filter(patient => 
      patient.email.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  login() {
    if (this.loginForm.valid) {
      this.isSpinning = true;
      this.authService.patientLogin(this.loginForm.value).subscribe({
        next: (res: any) => {
          if (res.email) {
            StorageService.saveUser({ email: res.email });
            StorageService.saveToken(res.jwt);
            this.router.navigate(['/patient']);
          }
        },
        error: (err) => {
          this.isSpinning = false;
          if (err.status === 401) {
            alert('Parolă incorectă. Verifică și încearcă din nou.');
          } else if (err.status === 404) {
            alert('Utilizatorul nu există. Verifică datele sau creează un cont.');
          } else {
            alert('A apărut o eroare. Încearcă din nou.');
          }
        },
        complete: () => {
          this.isSpinning = false;
        }
      });
    }
  }
}
