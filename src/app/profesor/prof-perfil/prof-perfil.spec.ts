import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfPerfil } from './prof-perfil';

describe('ProfPerfil', () => {
  let component: ProfPerfil;
  let fixture: ComponentFixture<ProfPerfil>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfPerfil]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfPerfil);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
