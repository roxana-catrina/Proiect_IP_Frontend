import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
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
  
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    InregistrareComponent
  ],
  providers: [
  //  provideClientHydration(withEventReplay())
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
