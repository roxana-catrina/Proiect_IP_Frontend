import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration, withEventReplay } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PatientComponent } from './components/patient/patient.component';
import { SensorComponent } from './components/sensor/sensor.component';
import { RecommendationComponent } from './components/recommendation/recommendation.component';
import { AlertComponent } from './components/alert/alert.component';
import { DoctorComponent } from './components/doctor/doctor.component';

@NgModule({
  declarations: [
    AppComponent,
    PatientComponent,
    SensorComponent,
    RecommendationComponent,
    AlertComponent,
    DoctorComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [
    provideClientHydration(withEventReplay())
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
