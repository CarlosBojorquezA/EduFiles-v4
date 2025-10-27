import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstProfesoresChat } from './est-profesores-chat';

describe('EstProfesoresChat', () => {
  let component: EstProfesoresChat;
  let fixture: ComponentFixture<EstProfesoresChat>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstProfesoresChat]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EstProfesoresChat);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
