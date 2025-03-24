import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule } from '@angular/forms';
import { DoctorService } from '../../services/doctor/doctor.service';
import { Doctor } from '../../models/doctor';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-inregistrare',
  templateUrl: './inregistrare.component.html',
  styleUrls: ['./inregistrare.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class InregistrareComponent implements OnInit {
  doctors: Doctor[] = [];

  constructor(private doctorService: DoctorService) { }

  ngOnInit(): void {
    this.doctorService.getAllDoctors().subscribe({
      next: (doctors) => {
        this.doctors = doctors;
        console.log('Doctors loaded:', doctors);
      },
      error: (error) => console.error('Error loading doctors:', error)
    });
  }
}
