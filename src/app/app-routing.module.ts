import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { PatientComponent } from './components/patient/patient.component';
import { InregistrareComponent } from './components/inregistrare/inregistrare.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'patient', component: PatientComponent },
  { path: 'inregistrare', component: InregistrareComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
