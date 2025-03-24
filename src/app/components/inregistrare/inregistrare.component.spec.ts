import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InregistrareComponent } from './inregistrare.component';

describe('InregistrareComponent', () => {
  let component: InregistrareComponent;
  let fixture: ComponentFixture<InregistrareComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InregistrareComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InregistrareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
