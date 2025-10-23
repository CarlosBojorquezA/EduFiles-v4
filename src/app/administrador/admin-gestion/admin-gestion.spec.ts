import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminGestionComponent } from './admin-gestion';

describe('AdminGestion', () => {
  let component: AdminGestionComponent;
  let fixture: ComponentFixture<AdminGestionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminGestionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminGestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
