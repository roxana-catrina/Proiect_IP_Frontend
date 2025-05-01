import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientRecommendationsComponent } from './patient-recommendations.component';

describe('PatientRecommendationsComponent', () => {
  let component: PatientRecommendationsComponent;
  let fixture: ComponentFixture<PatientRecommendationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PatientRecommendationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientRecommendationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
