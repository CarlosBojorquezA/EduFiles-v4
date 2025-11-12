import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfChatEstudiantes } from './prof-chat-estudiantes';

describe('ProfChatEstudiantes', () => {
  let component: ProfChatEstudiantes;
  let fixture: ComponentFixture<ProfChatEstudiantes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfChatEstudiantes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfChatEstudiantes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
