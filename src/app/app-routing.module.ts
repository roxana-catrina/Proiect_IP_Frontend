import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { PatientComponent } from './components/patient/patient.component';
import { InregistrareComponent } from './components/inregistrare/inregistrare.component';
import { PatientLoginComponent } from './components/patient-login/patient-login.component';
import { DoctorLoginComponent } from './components/doctor-login/doctor-login.component';
import { DashboardDoctorComponent } from './components/dashboard-doctor/dashboard-doctor.component';
import { DashboardPatientComponent } from './components/dashboard-patient/dashboard-patient.component';


const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'patient', component: DashboardPatientComponent },
  { path: 'inregistrare', component: InregistrareComponent },
  { path: 'patient/login', component: PatientLoginComponent },
  { path: 'doctor/login', component: DoctorLoginComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  //{ path: '**', redirectTo: '/home' },
  {path: 'doctor', component: DashboardDoctorComponent},
  //{path: 'patient', component: DashboardPatientComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
