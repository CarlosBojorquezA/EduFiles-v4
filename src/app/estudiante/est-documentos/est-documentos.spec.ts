import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EstDocumentosComponent } from './est-documentos';

describe('EstDocumentos', () => {
  let component: EstDocumentosComponent;
  let fixture: ComponentFixture<EstDocumentosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstDocumentosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EstDocumentosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
