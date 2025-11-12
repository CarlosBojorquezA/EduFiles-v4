import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfEstudiantesComponent } from './prof-estudiantes';

describe('ProfEstudiantes', () => {
  let component: ProfEstudiantesComponent;
  let fixture: ComponentFixture<ProfEstudiantesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfEstudiantesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfEstudiantesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
