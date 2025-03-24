import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { PatientComponent } from './components/patient/patient.component';
import { InregistrareComponent } from './components/inregistrare/inregistrare.component';
import { PatientLoginComponent } from './components/patient-login/patient-login.component';
import { DoctorLoginComponent } from './components/doctor-login/doctor-login.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'patient', component: PatientComponent },
  { path: 'inregistrare', component: InregistrareComponent },
  { path: 'patient-login', component: PatientLoginComponent },
  { path: 'doctor-login', component: DoctorLoginComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
