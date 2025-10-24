import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstDashboardComponent } from './est-dashboard';

describe('EstDashboard', () => {
  let component: EstDashboardComponent;
  let fixture: ComponentFixture<EstDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EstDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
