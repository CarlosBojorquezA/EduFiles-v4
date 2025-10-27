import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstPerfil } from './est-perfil';

describe('EstPerfil', () => {
  let component: EstPerfil;
  let fixture: ComponentFixture<EstPerfil>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstPerfil]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EstPerfil);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
