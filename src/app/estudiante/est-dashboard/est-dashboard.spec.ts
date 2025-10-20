import { ComponentFixture, TestBed } from '@angular/core/testing';

import { estDashboardComponent } from './est-dashboard';

describe('EstDashboard', () => {
  let component: estDashboardComponent;
  let fixture: ComponentFixture<estDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [estDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(estDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
