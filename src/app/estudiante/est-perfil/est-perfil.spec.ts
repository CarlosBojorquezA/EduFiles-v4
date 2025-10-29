import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstPerfilComponent } from './est-perfil';

describe('EstPerfil', () => {
  let component: EstPerfilComponent;
  let fixture: ComponentFixture<EstPerfilComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstPerfilComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EstPerfilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
