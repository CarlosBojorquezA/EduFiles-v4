import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfMaterialesComponent } from './prof-materiales';

describe('ProfMateriales', () => {
  let component: ProfMaterialesComponent;
  let fixture: ComponentFixture<ProfMaterialesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfMaterialesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfMaterialesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
