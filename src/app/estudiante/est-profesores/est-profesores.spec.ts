import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstProfesoresComponent } from './est-profesores';

describe('EstProfesores', () => {
  let component: EstProfesoresComponent;
  let fixture: ComponentFixture<EstProfesoresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstProfesoresComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EstProfesoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
