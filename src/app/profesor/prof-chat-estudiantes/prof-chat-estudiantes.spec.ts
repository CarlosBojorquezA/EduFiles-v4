import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfChatEstudiantesComponent } from './prof-chat-estudiantes';

describe('ProfChatEstudiantes', () => {
  let component: ProfChatEstudiantesComponent;
  let fixture: ComponentFixture<ProfChatEstudiantesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfChatEstudiantesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfChatEstudiantesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
