import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstMaterialesComponent } from './est-materiales';

describe('EstMateriales', () => {
  let component: EstMaterialesComponent;
  let fixture: ComponentFixture<EstMaterialesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstMaterialesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EstMaterialesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
