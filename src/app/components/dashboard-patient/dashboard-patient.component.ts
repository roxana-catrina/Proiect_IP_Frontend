import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { Patient } from '../../models/patient';
import { StorageService } from '../../services/storage/storage.service';
import { PatientService } from '../../services/patient/patient.service';
import { Recommendation } from '../../models/recommendation';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DoctorService } from '../../services/doctor/doctor.service';
import { AlertService } from '../../services/alert/alert.service';
import { Alert } from '../../models/alert';
import { Router } from '@angular/router';
import { Sensor } from '../../models/sensor';
import { Doctor } from '../../models/doctor';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { interval, Subscription } from 'rxjs';
import { SensorService } from '../../services/sensor/sensor.service';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard-patient',
  templateUrl: './dashboard-patient.component.html',
  styleUrls: ['./dashboard-patient.component.css'],
  imports: [CommonModule, RouterModule, FormsModule],
  standalone: true
})

export class DashboardPatientComponent implements OnInit, AfterViewInit, OnDestroy {
  patient: Patient | null = null;
  recommendations: Recommendation[] = [];
  doctorNames: Map<string, string> = new Map();
  alerts: Alert[] = [];
  sensors: Sensor[] = [];
  doctors: Doctor[] = [];
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  currentPage: number = 1;
  pageSize: number = 5;
  totalPages: number = 1;
  pagedRecommendations: Recommendation[] = [];
  ekgData: number[] = Array(50).fill(0);

  // Add these new properties for alerts pagination
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

  constructor(private authService: AuthService, private patientService: PatientService,
    private doctorService: DoctorService,
    private alertService: AlertService,
    private router: Router,
    private sensorService: SensorService,
    private storageService: StorageService
  ) {}

  ngOnInit() {
    console.log('ngOnInit called');
    const patient = StorageService.getPatient();
    console.log('Patient from storage:', patient);

    
    if (patient) {
      this.loadPatientData(patient.email);
       // Wait for DOM to be ready
    setTimeout(() => {
      // Initialize charts first

      this.initializeEKGChart();
      this.initializeHeartRateChart();
      this.initializeTemperatureChart();
      this.initializeHumidityChart();
      
      // Load initial data
      this.loadSensorData();
      
      // Then start real-time updates
      this.startRealtimeUpdates();
    }, 500);
    }
  }

  ngAfterViewInit() {


   // this.loadSensorData(); // Load initial sensor data
  }

  ngOnDestroy() {
    if (this.updateSubscription) {
      this.updateSubscription.unsubscribe();
    }
    // Destroy all charts
    [this.ekgChart, this.heartRateChart, this.temperatureChart, this.humidityChart].forEach(chart => {
      if (chart) chart.destroy();
    });
  }

  private loadPatientData(email: string) {
    console.log('Loading patient data for email:', email);
    this.authService.getPatientByEmail(email).subscribe({
      next: (patient: Patient) => {
        console.log('Patient data loaded:', patient);
        this.patient = patient;
        if (patient.id) {
          console.log('Loading data for patient ID:', patient.id);
          this.loadPatientRecommendations(patient.id);
          this.loadPatientSensors(patient.id);
          this.loadPatientAlerts(patient.id);
          // Add this line to load sensor data after patient is loaded
          this.loadSensorData();
        }
      },
      error: (error) => {
        console.error('Error loading patient data:', error);
      }
    });
  }

  private loadPatientRecommendations(patientId: string) {
    this.patientService.getPatientRecommendations(patientId)
      .subscribe({
        next: (recommendations) => {
          this.recommendations = recommendations;
          // Sort and initialize paging immediately after loading
          this.sortRecommendations();
          this.updatePagedRecommendations();
        },
        error: (error) => {
          console.error('Error loading patient recommendations:', error);
        }
      });
  }

  private loadPatientSensors(patientId: string) {
    this.patientService.getPatientSensors(patientId)
      .subscribe({
        next: (sensors) => {
          this.sensors = sensors;
          console.log('Patient sensors loaded:', this.sensors);
        },
        error: (error) => {
          console.error('Error loading patient sensors:', error);
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

  private loadPatientAlerts(patientId: string) {
    this.alertService.getPacientAlerts(patientId).subscribe({
      next: (alerts) => {
        this.alerts = alerts;
        // Sort by timestamp descending and initialize paging
        this.alerts.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        this.updatePagedAlerts();
      },
      error: (error) => {
        console.error('Error loading alerts:', error);
      }
    });
  }

  get alertPages(): number[] {
    return Array.from({ length: this.alertTotalPages }, (_, i) => i + 1);
  }

  setAlertPage(page: number) {
    if (page >= 1 && page <= this.alertTotalPages) {
      this.alertCurrentPage = page;
      this.updatePagedAlerts();
    }
  }

  onAlertPageSizeChange() {
    this.alertCurrentPage = 1;
    this.updatePagedAlerts();
  }

  private updatePagedAlerts() {
    this.alertTotalPages = Math.ceil(this.alerts.length / this.alertPageSize);
    const startIndex = (this.alertCurrentPage - 1) * this.alertPageSize;
    const endIndex = startIndex + this.alertPageSize;
    this.pagedAlerts = this.alerts.slice(startIndex, endIndex);
  }

  sortAlerts(column: string) {
    if (column === 'timestamp') {
      this.alerts.reverse();
      this.updatePagedAlerts();
    }
  }

  sort(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.recommendations.sort((a, b) => {
      let comparison = 0;

      switch (column) {
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
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

      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
  }

  getSortIcon(column: string): string {
    if (this.sortColumn !== column) {
      return 'bi-arrow-down-up';
    }
    return this.sortDirection === 'asc' ? 'bi-arrow-up' : 'bi-arrow-down';
  }

  private sortRecommendations() {
    this.recommendations.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  setPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagedRecommendations();
    }
  }

  onPageSizeChange() {
    this.currentPage = 1;
    this.updatePagedRecommendations();
  }

  private updatePagedRecommendations() {
    this.totalPages = Math.ceil(this.recommendations.length / this.pageSize);
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.pagedRecommendations = this.recommendations.slice(startIndex, endIndex);
  }

  logout(): void {
      this.storageService.logout(); // Use the non-static instance method
    this.router.navigate(['/home']); // or wherever you want to redirect after logout
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
      config.options.scales.y.min = 40;
      config.options.scales.y.max = 120;
      this.heartRateChart = new Chart(ctx, config);
    }
  }

  private initializeTemperatureChart() {
    const ctx = document.getElementById('temperature-chart') as HTMLCanvasElement;
    if (ctx) {
      const config = this.initializeChartConfig('Temperature (°C)', 'rgb(255, 159, 64)');
      config.options.scales.y.min = 35;
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
  // Poll every 1 second instead of every 100ms
  this.updateSubscription = interval(1000).subscribe(() => {
    if (this.patient?.id) {
      // Use the endpoint
      this.sensorService.getLatestSensorData(this.patient.id).subscribe({
        next: (sensorData: Sensor) => {
          console.log('New sensor data received:', sensorData);
          
          if (this.ekgChart && this.heartRateChart && this.temperatureChart && this.humidityChart) {
            // Update EKG with new data
            this.ekgData = [...this.ekgData.slice(1), parseFloat(sensorData.ekg_signal)];
            this.ekgChart.data.datasets[0].data = [...this.ekgData];
            
            // Update Heart Rate with new data
            this.heartRateData = [...this.heartRateData.slice(1), parseFloat(sensorData.heartRate)];
            this.heartRateChart.data.datasets[0].data = [...this.heartRateData];
            
            // Update Temperature with new data
            this.temperatureData = [...this.temperatureData.slice(1), sensorData.temperature];
            this.temperatureChart.data.datasets[0].data = [...this.temperatureData];
            
            // Update Humidity with new data
            this.humidityData = [...this.humidityData.slice(1), sensorData.humidity];
            this.humidityChart.data.datasets[0].data = [...this.humidityData];
            
            // Create timestamp for x-axis
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
    const ekgValues = sensors.map(s => parseFloat(s.ekg_signal) || 0);
    const heartRates = sensors.map(s => parseFloat(s.heartRate) || 0);
    const temperatures = sensors.map(s => s.temperature || 0);
    const humidities = sensors.map(s => s.humidity || 0);

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

  generateTestData() {
    if (this.patient?.id) {
      this.sensorService.generateTestData(this.patient.id).subscribe({
        next: () => {
          console.log('Test data generated successfully');
          // Fetch and display the new data immediately
          this.loadSensorData();
        },
        error: (error) => console.error('Error generating test data:', error)
      });
    }
  }

  private loadSensorData() {
    console.log('loadSensorData called, patient:', this.patient);
    if (this.patient?.id) {
      console.log('Fetching sensor data for patient ID:', this.patient.id);
      this.sensorService.getAllSensorData(this.patient.id).subscribe({
        next: (sensors: Sensor[]) => {
          console.log('Raw sensor data received:', sensors);
          if (sensors.length > 0) {
            // Sort sensors by timestamp ascending
            sensors.sort((a, b) => 
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            );
            
            // Get the most recent 50 readings
            const recentSensors = sensors.slice(-50);
            console.log('Processing recent sensors:', recentSensors);
            
            // Update all charts
            this.updateCharts(recentSensors);
          } else {
            console.log('No sensor data available');
          }
        },
        error: (error) => console.error('Error loading sensor data:', error)
      });
    } else {
      console.warn('No patient ID available for loading sensor data');
    }
  }
}
