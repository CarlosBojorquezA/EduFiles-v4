import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminGestion } from './admin-gestion';

describe('AdminGestion', () => {
  let component: AdminGestion;
  let fixture: ComponentFixture<AdminGestion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminGestion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminGestion);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
