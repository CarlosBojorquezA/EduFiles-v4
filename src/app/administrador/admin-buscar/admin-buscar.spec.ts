import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminBuscarComponent } from './admin-buscar';

describe('AdminBuscar', () => {
  let component: AdminBuscarComponent;
  let fixture: ComponentFixture<AdminBuscarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminBuscarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminBuscarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
