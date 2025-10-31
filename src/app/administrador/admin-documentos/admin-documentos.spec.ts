import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminDocumentosComponent } from './admin-documentos';

describe('AdminPendientes', () => {
  let component: AdminDocumentosComponent;
  let fixture: ComponentFixture<AdminDocumentosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminDocumentosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminDocumentosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
