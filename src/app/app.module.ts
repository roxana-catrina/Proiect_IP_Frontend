import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PatientComponent } from './components/patient/patient.component';
import { SensorComponent } from './components/sensor/sensor.component';
import { RecommendationComponent } from './components/recommendation/recommendation.component';
import { AlertComponent } from './components/alert/alert.component';
import { DoctorComponent } from './components/doctor/doctor.component';
import { HomeComponent } from './components/home/home.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { InregistrareComponent } from './components/inregistrare/inregistrare.component';
import { DoctorLoginComponent } from './components/doctor-login/doctor-login.component';
import { PatientLoginComponent } from './components/patient-login/patient-login.component';
import { DashboardDoctorComponent } from './components/dashboard-doctor/dashboard-doctor.component';
import { DashboardPatientComponent } from './components/dashboard-patient/dashboard-patient.component';
import { ModificareDatePacientComponent } from './components/modificare-date-pacient/modificare-date-pacient.component';

@NgModule({
  declarations: [
    AppComponent,
    PatientComponent,
    SensorComponent,
    RecommendationComponent,
    AlertComponent,
    DoctorComponent,
    HomeComponent,
    NavbarComponent,
    FooterComponent,
    DoctorLoginComponent,
    PatientLoginComponent
  ],
  imports: [
    BrowserModule,
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    DashboardDoctorComponent,
    DashboardPatientComponent,
    ReactiveFormsModule,
    ModificareDatePacientComponent,
  ],
  providers: [
  //  provideClientHydration(withEventReplay())
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
