import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { LoginService } from '../../services/login/login.service';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { StorageService } from '../../services/storage/storage.service';
import { Doctor } from '../../models/doctor';

@Component({
  selector: 'app-doctor-login',
  templateUrl: './doctor-login.component.html',
  styleUrls: ['./doctor-login.component.css'],
  standalone: false
})
export class DoctorLoginComponent implements OnInit {
  loginForm: FormGroup;
  isSpinning: boolean = false;
  searchTerm: string = '';
  doctors: Doctor[] = [];
  filteredDoctors: Doctor[] = [];

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
    this.loadDoctors();
  }

  loadDoctors(): void {
    this.authService.getAllDoctors().subscribe({
      next: (doctors) => {
        this.doctors = doctors;
        this.filteredDoctors = doctors;
        console.log('Doctors loaded:', doctors);
      },
      error: (error) => console.error('Error loading doctors:', error)
    });
  }

  searchDoctors() {
    if (!this.searchTerm.trim()) {
      this.filteredDoctors = [...this.doctors];
      return;
    }

    this.filteredDoctors = this.doctors.filter(doctor => 
      doctor.email.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  login() {
    if (this.loginForm.valid) {
      this.isSpinning = true;
      this.authService.doctorLogin(this.loginForm.value).subscribe({
        next: (res: any) => {
          if (res.email) {
            StorageService.saveDoctor({ email: res.email });
            StorageService.saveToken(res.jwt);
            this.router.navigate(['/doctor']);
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
