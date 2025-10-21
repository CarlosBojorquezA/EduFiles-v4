import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminPendientes } from './admin-pendientes';

describe('AdminPendientes', () => {
  let component: AdminPendientes;
  let fixture: ComponentFixture<AdminPendientes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminPendientes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminPendientes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
