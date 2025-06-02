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
import { Chart } from 'chart.js';
import { interval, Subscription } from 'rxjs';
import { Sensor } from '../../models/sensor';
import { SensorService } from '../../services/sensor/sensor.service';
@Component({
  selector: 'app-patient-recommendations',
  templateUrl: './patient-recommendations.component.html',
  styleUrls: ['./patient-recommendations.component.css'],
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
  standalone: true
})
export class PatientRecommendationsComponent implements OnInit {
  patient: Patient | null = null;
  recommendations: Recommendation[] = [];
  recommendationForm: FormGroup;
  doctorNames: Map<string, string> = new Map();
  alerts: Alert[] = [];
  idDoctor: String | undefined;
  idDoctor1: string | undefined;
  emailDoctor: string | undefined;
  doctor: Doctor | undefined;
  doctors: Doctor[] = [];
  sortColumn: string = 'createdAt';
  sortDirection: 'asc' | 'desc' = 'desc';

  // Add pagination properties
  currentPage: number = 1;
  pageSize: number = 5;
  totalPages: number = 1;
  pagedRecommendations: Recommendation[] = [];
  ekgData: number[] = Array(50).fill(0);

  // Add alert pagination properties
  alertCurrentPage: number = 1;
  alertPageSize: number = 5;
  alertTotalPages: number = 1;
  pagedAlerts: Alert[] = [];



    private ekgChart: Chart | undefined;
    private updateSubscription: Subscription | undefined;
  
    // Add new chart properties
    private heartRateChart: Chart | undefined;
    private temperatureChart: Chart | undefined;
    private humidityChart: Chart | undefined;
  
    // Add data arrays for each metric
    private heartRateData: number[] = Array(50).fill(0);
    private temperatureData: number[] = Array(50).fill(0);
    private humidityData: number[] = Array(50).fill(0);

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private authService: AuthService,
    private servicePatient: PatientService,
    private doctorService: DoctorService,
    private StorageService: StorageService,
    private alertService: AlertService,
    private patientService: PatientService,
    private sensorService: SensorService
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
      console.log('idDoctor1', this.idDoctor1);
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
    this.initializePagination();
    this.loadInitialData();
      this.initializeEKGChart();
      this.initializeHeartRateChart();
      this.initializeTemperatureChart();
      this.initializeHumidityChart();
  }

  private initializePagination() {
    this.updatePagedRecommendations();
    this.updatePagedAlerts();
  }

  private loadInitialData() {
    if (this.patient?.id) {
      this.loadPatientRecommendations(this.patient.id);
      this.loadPatientAlerts(this.patient.id);
    }
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
        this.loadAlerts();
        this.startRealtimeUpdates(); // 👈 Pornim update-urile în timp real
        console.log('Patient data loaded and real-time updates started:', this.patient.id);
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
        this.updatePagedAlerts();
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
    this.patientService.getPatientRecommendations(patientId).subscribe({
      next: (recommendations) => {
        this.recommendations = recommendations;
        this.sortRecommendationsDesc();
        this.updatePagedRecommendations();
      },
      error: (error) => console.error('Error loading recommendations:', error)
    });
  }

  private loadPatientAlerts(patientId: string) {
    this.alertService.getPacientAlerts(patientId).subscribe({
      next: (alerts) => {
        this.alerts = alerts;
        this.sortAlertsDesc();
        this.updatePagedAlerts();
      },
      error: (error) => console.error('Error loading alerts:', error)
    });
  }

  private sortRecommendationsDesc() {
    this.recommendations.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  private sortAlertsDesc() {
    this.alerts.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  onSubmit() {
    if (this.recommendationForm.valid && this.patient) {
      const recommendation = {
        ...this.recommendationForm.value,
        patientId: this.patient.id,
        doctorId: this.idDoctor,
        createdAt: new Date()
      };
      console.log('Patient ID: onsub', this.patient.id);
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

  getDoctorName(doctorId: string): void {
    // First check if we already have the name cached
    if (this.doctorNames.has(doctorId)) {
      this.doctorNames.get(doctorId) || 'Doctor necunoscut';
    }

    // Find doctor in the loaded doctors array
    const doctor = this.doctors.find(d => d.id === doctorId);
    if (doctor) {
      this.doctorNames.set(doctorId, doctor.name);
    }

    console.log('Doctor not found in list, ID:', doctorId);
  }

  sort(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'desc'; // Changed default to desc
    }

    this.recommendations.sort((a, b) => {
      let comparison = 0;

      switch (column) {
        case 'createdAt':
          comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          break;
        case 'doctorId':
          const doctorA = this.doctorNames.get(a.doctorId) || '';
          const doctorB = this.doctorNames.get(b.doctorId) || '';
          comparison = doctorA.localeCompare(doctorB);
          break;
        case 'activityType':
          comparison = a.activityType.localeCompare(b.activityType);
          break;
      }

      return this.sortDirection === 'desc' ? comparison : -comparison;
    });

    this.updatePagedRecommendations();
  }

  sortAlerts(column: string) {
    if (column === 'timestamp') {
      this.alerts.sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      this.updatePagedAlerts();
    }
  }

  getSortIcon(column: string): string {
    if (this.sortColumn !== column) {
      return 'bi-arrow-down-up';
    }
    return this.sortDirection === 'asc' ? 'bi-arrow-up' : 'bi-arrow-down';
  }

  editRecommendation(recommendation: Recommendation) {
    this.recommendationForm.patchValue({
      activityType: recommendation.activityType,
      duration: recommendation.duration
    });
  }

  private updatePagedRecommendations() {
    this.totalPages = Math.ceil(this.recommendations.length / this.pageSize);
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.pagedRecommendations = this.recommendations.slice(startIndex, endIndex);
  }

  private updatePagedAlerts() {
    this.alertTotalPages = Math.ceil(this.alerts.length / this.alertPageSize);
    const startIndex = (this.alertCurrentPage - 1) * this.alertPageSize;
    const endIndex = startIndex + this.alertPageSize;
    this.pagedAlerts = this.alerts.slice(startIndex, endIndex);
  }

  setPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagedRecommendations();
    }
  }

  setAlertPage(page: number) {
    if (page >= 1 && page <= this.alertTotalPages) {
      this.alertCurrentPage = page;
      this.updatePagedAlerts();
    }
  }

  onPageSizeChange() {
    this.currentPage = 1;
    this.updatePagedRecommendations();
  }

  onAlertPageSizeChange() {
    this.alertCurrentPage = 1;
    this.updatePagedAlerts();
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get alertPages(): number[] {
    return Array.from({ length: this.alertTotalPages }, (_, i) => i + 1);
  }



private initializeChartConfig(label: string, color: string) {
    return {
      type: 'line' as const,
      data: {
        labels: Array(50).fill(''),
        datasets: [{
          label: label,
          data: Array(50).fill(0),
          borderColor: color,
          borderWidth: 1.5,
          tension: 0.1,
          cubicInterpolationMode: 'monotone' as const,
          pointRadius: 1,
          fill: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 0
        },
        scales: {
          y: {
            type: 'linear' as const,
            display: true,
            beginAtZero: false,
            min: 0,
            max: 100
          },
          x: {
            type: 'category' as const,
            display: false
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    };
  }

  private initializeEKGChart() {
    const ctx = document.getElementById('ekg-chart') as HTMLCanvasElement;
    if (ctx) {
      const config = this.initializeChartConfig('EKG Signal', 'rgb(255, 99, 132)');
      config.options.scales.y.min = 0;
      config.options.scales.y.max = 5000;
      this.ekgChart = new Chart(ctx, config);
    }
  }

  private initializeHeartRateChart() {
    const ctx = document.getElementById('heart-rate-chart') as HTMLCanvasElement;
    if (ctx) {
      const config = this.initializeChartConfig('Heart Rate (BPM)', 'rgb(75, 192, 192)');
      config.options.scales.y.min = 0;
      config.options.scales.y.max = 220;
      this.heartRateChart = new Chart(ctx, config);
    }
  }

  private initializeTemperatureChart() {
    const ctx = document.getElementById('temperature-chart') as HTMLCanvasElement;
    if (ctx) {
      const config = this.initializeChartConfig('Temperature (°C)', 'rgb(255, 159, 64)');
      config.options.scales.y.min = 34;
      config.options.scales.y.max = 42;
      this.temperatureChart = new Chart(ctx, config);
    }
  }

  private initializeHumidityChart() {
    const ctx = document.getElementById('humidity-chart') as HTMLCanvasElement;
    if (ctx) {
      const config = this.initializeChartConfig('Humidity (%)', 'rgb(54, 162, 235)');
      config.options.scales.y.min = 0;
      config.options.scales.y.max = 100;
      this.humidityChart = new Chart(ctx, config);
    }
  }

  private startRealtimeUpdates() {
    this.updateSubscription = interval(100).subscribe(() => {
      if (this.patient?.id) {
        this.sensorService.getLatestSensorData(this.patient.id).subscribe({
          next: (sensorData: Sensor) => {
            if (this.ekgChart && this.heartRateChart && this.temperatureChart && this.humidityChart) {
              // Update EKG with new data
              this.ekgData = [...this.ekgData.slice(1), parseFloat(sensorData.ekgSignal)];
              this.ekgChart.data.datasets[0].data = [...this.ekgData];
              
              // Update Heart Rate with new data
              this.heartRateData = [...this.heartRateData.slice(1), parseFloat(sensorData.heartRate)];
              this.heartRateChart.data.datasets[0].data = [...this.heartRateData];
              
              // Update Temperature with new data
              this.temperatureData = [...this.temperatureData.slice(1),parseFloat(sensorData.temperature)];
              this.temperatureChart.data.datasets[0].data = [...this.temperatureData];
              
              // Update Humidity with new data
              this.humidityData = [...this.humidityData.slice(1), parseFloat(sensorData.humidity)];
              this.humidityChart.data.datasets[0].data = [...this.humidityData];
              
              // Create timestamps for x-axis
              const timestamp = new Date().toLocaleTimeString();
              [this.ekgChart, this.heartRateChart, this.temperatureChart, this.humidityChart].forEach(chart => {
                if (chart && chart.data) {
                  chart.data.labels = [...(chart.data.labels as string[]).slice(1), timestamp];
                  chart.update('none');
                }
              });
            }
          },
          error: (error) => console.error('Error fetching sensor data:', error)
        });
      }
    });
  }

  private updateCharts(sensors: Sensor[]) {
    if (!sensors.length) return;

    const timestamps = sensors.map(s => new Date(s.timestamp).toLocaleTimeString());
    const ekgValues = sensors.map(s => parseFloat(s.ekgSignal) || 0);
    const heartRates = sensors.map(s => parseFloat(s.heartRate) || 0);
    const temperatures = sensors.map(s => parseFloat(s.temperature) || 0);
    const humidities = sensors.map(s => parseFloat(s.humidity) || 0);

    const charts = [
      { chart: this.ekgChart, data: ekgValues },
      { chart: this.heartRateChart, data: heartRates },
      { chart: this.temperatureChart, data: temperatures },
      { chart: this.humidityChart, data: humidities }
    ];

    charts.forEach(({ chart, data }) => {
      if (chart && chart.data) {
        chart.data.labels = timestamps;
        chart.data.datasets[0].data = data;
        try {
          chart.update();
        } catch (error) {
          console.error('Error updating chart:', error);
        }
      }
    });
  }

 



}