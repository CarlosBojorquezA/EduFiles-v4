import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminPerfilComponent } from './admin-perfil';

describe('AdminPerfil', () => {
  let component: AdminPerfilComponent;
  let fixture: ComponentFixture<AdminPerfilComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminPerfilComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminPerfilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
