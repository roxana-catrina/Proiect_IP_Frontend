import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModificareDatePacientComponent } from './modificare-date-pacient.component';

describe('ModificareDatePacientComponent', () => {
  let component: ModificareDatePacientComponent;
  let fixture: ComponentFixture<ModificareDatePacientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModificareDatePacientComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModificareDatePacientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
