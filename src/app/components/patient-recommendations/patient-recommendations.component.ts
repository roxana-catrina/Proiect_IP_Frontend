import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Patient } from '../../models/patient';
import { Recommendation } from '../../models/recommendation';
import { AuthService } from '../../services/auth/auth.service';
import { PatientService } from '../../services/patient/patient.service';
import { DoctorService } from '../../services/doctor/doctor.service';
import { StorageService } from '../../services/storage/storage.service';
import { AlertService } from '../../services/alert/alert.service';
import { Alert } from '../../models/alert';
import { CommonModule } from '@angular/common';
import { Doctor } from '../../models/doctor';

@Component({
  selector: 'app-patient-recommendations',
  templateUrl: './patient-recommendations.component.html',
  styleUrls: ['./patient-recommendations.component.css'],
  imports: [CommonModule, RouterModule,  ReactiveFormsModule,  // <- IMPORTANT
    FormsModule],
  standalone: true
})
export class PatientRecommendationsComponent implements OnInit {
  patient: Patient | null = null;
  recommendations: Recommendation[] = [];
  recommendationForm: FormGroup;
  doctorNames: Map<string, string> = new Map();
  alerts: Alert[] | undefined;
  idDoctor: String| undefined;
  idDoctor1: string | undefined;
  emailDoctor: string | undefined;
  doctor: Doctor  | undefined;
  doctors: Doctor[] = []
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private authService: AuthService,
    private servicePatient: PatientService,
    private doctorService: DoctorService,
    private StorageService: StorageService,
    private alertService: AlertService,
    private patientService: PatientService
  ) {
    this.recommendationForm = this.fb.group({
      activityType: ['', Validators.required],
      duration: ['', [Validators.required]]
      
    });
  }
    


  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const email = params['email'];

      this.idDoctor1 = params['idDoctor'];
      console.log('idDoctor1', this.idDoctor1)
      this.emailDoctor = params['emailDoctor'];
      if (this.emailDoctor) {
        this.authService.getDoctorByEmail(this.emailDoctor).subscribe({
          next: (doctor) => {
            this.doctor = doctor;
            this.idDoctor = doctor.id;
            console.log('idDoctor:', this.doctor.id);
          }
        });
      }
      if (email) {
        this.loadPatientData(email);
        this.loadPatientRecommendations(email);
        this.loadAllDoctors();
      }
    });
  }
  private loadAllDoctors() {
    this.doctorService.getAllDoctors().subscribe({
      next: (doctors: Doctor[]) => {
        this.doctors = doctors;
        // Create a map of doctor names for quick lookup
        doctors.forEach(doctor => {
          const fullName = doctor.name;
          this.doctorNames.set(doctor.id, fullName);
        });
        console.log('All doctors loaded:', this.doctors);
      },
      error: (error) => {
        console.error('Error loading doctors:', error);
      }
    });
  }

  private loadPatientData(email: string) {
    this.authService.getPatientByEmail(email).subscribe({
      next: (patient: Patient) => {
        this.patient = patient;
        if (patient.id) {
          this.loadPatientRecommendations(patient.id);
          console.log('Patient data loaded:', this.patient.id);
         // this.loadPatientSensors(patient.id);
          this.loadAlerts(); // Move loadAlerts here after patient data is loaded
        }
      },
      error: (error) => {
        console.error('Error loading patient data:', error);
      }
    });
  }
 private loadAlerts() {
    if (!this.patient?.id) {
      console.error('Cannot load alerts: Patient ID is missing');
      return;
    }

    this.alertService.getPacientAlerts(this.patient.id).subscribe({
      next: (alerts: Alert[]) => {
        this.alerts = alerts.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        console.log('Alerts loaded successfully:', this.alerts);
      },
      error: (error) => {
        console.error('Error loading alerts:', error);
        this.alerts = [];
      },
      complete: () => {
        console.log('Alerts loading completed');
      }
    });
  }

  private loadPatientRecommendations(patientId: string) {
    this.patientService.getPatientRecommendations(patientId)
      .subscribe({
        next: (recommendations) => {
          console.log('Recommendations loaded:', recommendations);
          this.recommendations = recommendations;
        },
        error: (error) => {
          console.error('Error loading patient recommendations:', error);
        }
      });
  }
  onSubmit() {
    if (this.recommendationForm.valid && this.patient) {
      const recommendation = {
        ...this.recommendationForm.value,
        patientId: this.patient.id,
      
        doctorId: this.idDoctor ,
        //status: 'NEW',
        createdAt: new Date()
      };
      console.log('Patient ID: onsub', this.patient.id)
      console.log('Recommendation:onsub', recommendation);
      if (this.patient.id) {
        console.log('Adding recommendation for patient ID:', this.patient.id);
        this.authService.addRecommendation(this.patient.id, recommendation).subscribe({
          next: () => {
            if (this.patient && this.patient.id) {
              this.loadPatientRecommendations(this.patient.id);
            }
            this.recommendationForm.reset();
          },
          error: (error) => console.error('Error adding recommendation:', error)
        });
      }
    }
  }
 
  getDoctorName(doctorId: string): void  {
    // First check if we already have the name cached
    if (this.doctorNames.has(doctorId)) {
      this.doctorNames.get(doctorId) || 'Doctor necunoscut';
    }

    // Find doctor in the loaded doctors array
    const doctor = this.doctors.find(d => d.id === doctorId);
    if (doctor) {
     // const fullName = `${doctor.name}`;
      this.doctorNames.set(doctorId, doctor.name);
      
    }

    console.log('Doctor not found in list, ID:', doctorId);
    ;
  }
 

  


  editRecommendation(recommendation: Recommendation) {
    this.recommendationForm.patchValue({
      activityType: recommendation.activityType,
      duration: recommendation.duration,
     // description: recommendation.description
    });
  }
}