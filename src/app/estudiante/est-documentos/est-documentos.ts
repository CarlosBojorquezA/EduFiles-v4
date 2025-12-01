import { Component, OnInit } from '@angular/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { DocumentosService, DocumentoDetalle } from '../../services/documentos.service';
import { AuthService } from '../../auth.service';
import { NotificationsComponent } from '../../notificaciones/notificaciones';

interface Alert {
  type: 'error' | 'warning';
  title: string;
  message: string;
}

interface NavItem {
  icon: string;
  label: string;
  route: string;
  badge?: number;
}

interface DocumentoUI {
  id_documento?: number;
  id_plantilla: number;
  name: string;
  category: 'fixed' | 'periodic';
  status: 'approved' | 'rejected' | 'pending' | 'missing';
  statusLabel: string;
  required: boolean;
  description: string;
  dueDate?: string | null;
  uploadDate?: string | null;
  rejectionReason?: string;
  badgeColor: string;
  periodicity?: string;
}

interface UploadForm {
  documentType: string;
  idPlantilla: number;
  file: File | null;
  fileName: string;
  description: string;
}

// --- Constantes ---
const ICONS_MAP: { [key: string]: string } = {
  'home': 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  'file-text': 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8',
  'material': 'M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25',
  'users': 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  'user': 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z'
};

@Component({
  selector: 'app-est-documentos',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NotificationsComponent],
  providers: [DatePipe],
  templateUrl: './est-documentos.html',
  styleUrls: ['./est-documentos.css']
})
export class EstDocumentosComponent implements OnInit {
  // Datos Usuario
  userRole: string = 'estudiante';
  userName: string = '';
  userAccountNumber: string = '';
  userCareer: string = '';
  userGradeGroup: string = '';
  notificationCount: number = 0;
  currentRoute: string = '/est-documentos';

  // Info Estudiante
  studentType: string = '';
  studentTypeLabel: string = '';
  tipoEstudiante: 'NUEVO_INGRESO' | 'REINGRESO' = 'NUEVO_INGRESO';

  // Stats 
  documentsApproved: number = 0;
  documentsTotal: number = 0;

  // UI State
  activeTab: 'todos' | 'fijos' | 'periodicos' = 'todos';
  alerts: Alert[] = [];
  additionalInfo: string = '';
  documents: DocumentoUI[] = [];
  isLoading: boolean = true;
  isMobile: boolean = false;

  // Modals
  showViewModal: boolean = false;
  showDeleteModal: boolean = false;
  showUploadModal: boolean = false;
  selectedDocument: DocumentoUI | null = null;
  
  // Preview
  documentPreviewUrl: SafeUrl | null = null;
  isLoadingPreview: boolean = false;

  // Upload Form
  uploadForm: UploadForm = {
    documentType: '',
    idPlantilla: 0,
    file: null,
    fileName: '',
    description: ''
  };

  navigationItems: NavItem[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private documentosService: DocumentosService,
    private authService: AuthService,
    private sanitizer: DomSanitizer,
    private datePipe: DatePipe
  ) {
    this.isMobile = /Android|webOS|iPhone|iPad|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  ngOnInit(): void {
    if (!this.checkAuth()) return;

    this.loadUserData();
    this.loadNavigation();
    this.loadDocuments();
    this.currentRoute = this.router.url;
    
    // Abrir modal desde URL si viene el parámetro
    this.route.queryParams.subscribe(params => {
      if (params['plantilla']) {
        const idPlantilla = parseInt(params['plantilla'], 10);
        // Esperar a que se carguen los documentos
        const checkDoc = setInterval(() => {
          if (!this.isLoading) {
            const doc = this.documents.find(d => d.id_plantilla === idPlantilla);
            if (doc) this.openUploadModal(doc);
            clearInterval(checkDoc);
          }
        }, 200);
      }
    });
  }

  private checkAuth(): boolean {
    if (!localStorage.getItem('token')) {
      this.router.navigate(['']);
      return false;
    }
    return true;
  }

  loadUserData(): void {
    this.authService.getPerfil().subscribe({
      next: (data) => {
        const d = data.detalles || {};

        // Nombre y Matrícula
        this.userName = `${d.nombres} ${d.apellido_paterno} ${d.apellido_materno || ''}`.trim();
        this.userAccountNumber = data.num_usuario || '';

        // Tipo de Estudiante
        this.tipoEstudiante = d.tipo_estudiante || 'NUEVO_INGRESO';
        this.studentType = d.tipo_estudiante === 'REINGRESO' ? 'Reinscripción' : 'Nuevo Ingreso';
        this.studentTypeLabel = d.tipo_estudiante === 'REINGRESO' ? 'Reingreso' : 'Nuevo Ingreso';
        
        // Carrera
        this.userCareer = d.nivel_educativo || 'Estudiante';
        
        // 4. Construcción del Grado, Grupo y Turno
        let parts = [];
        
        // Semestre/Grado
        if (d.semestre) parts.push(`${d.semestre}° Semestre`);
        else if (d.grado) parts.push(`${d.grado}° Grado`);
        
        // Grupo (Agregado)
        if (d.grupo_id) parts.push(`Grupo ${d.grupo_id}`);

        // Turno
        const turno = d.grupo_turno || d.turno;
        if (turno) {
          const turnoFormato = turno.charAt(0).toUpperCase() + turno.slice(1).toLowerCase();
          parts.push(turnoFormato);
        }

        this.userGradeGroup = parts.length > 0 ? parts.join(' • ') : '';
      },
      error: (err) => {
        console.error('Error al cargar datos del usuario en documentos', err);
      }
    });
  }

  loadNavigation(): void {
    this.navigationItems = [
      { icon: 'home', label: 'Inicio', route: '/est-dashboard', badge: 0 },
      { icon: 'file-text', label: 'Documentos', route: '/est-documentos', badge: 0 },
      { icon: 'material', label: 'Materiales', route: '/est-materiales', badge: 0 },
      { icon: 'users', label: 'Profesores', route: '/est-profesores', badge: 0 },
      { icon: 'user', label: 'Perfil', route: '/est-perfil', badge: 0 }
    ];
  }

  loadDocuments(): void {
    this.isLoading = true;
    this.documentosService.getTodosDocumentos().subscribe({
      next: (todosDocumentos) => {
        // Mapear documentos
        this.documents = todosDocumentos.map(doc => this.mapDocumentFromBackend(doc));
        
        // Estadísticas
        this.documentsTotal = this.documents.length;
        this.documentsApproved = this.documents.filter(d => d.status === 'approved').length;
        
        // Alertas
        const documentosSubidos = todosDocumentos.filter(d => d.tipo_registro === 'SUBIDO');
        this.generateAlerts(documentosSubidos);
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('[DOCUMENTOS] Error:', error);
        this.isLoading = false;
        this.alerts.push({
          type: 'error',
          title: 'Error de carga',
          message: 'No se pudieron cargar los documentos.'
        });
      }
    });
  }

  private mapDocumentFromBackend(doc: DocumentoDetalle): DocumentoUI {
    // 1. Documento Faltante
    if (doc.estado === 'FALTANTE' || doc.tipo_registro === 'FALTANTE') {
      return {
        id_plantilla: doc.id_plantilla,
        name: doc.plantilla_nombre,
        category: doc.es_fijo === 1 ? 'fixed' : 'periodic',
        status: 'missing',
        statusLabel: 'Faltante',
        required: doc.obligatorio === 1,
        description: doc.descripcion,
        badgeColor: '#6b7280', // Gris
        periodicity: (doc.requiere_actualizacion === 1 && doc.dias_vigencia) 
          ? `Cada ${Math.floor(doc.dias_vigencia / 30)} mes(es)` 
          : undefined
      };
    }

    // 2. Documento Subido
    let status: 'approved' | 'rejected' | 'pending' | 'missing';
    let statusLabel: string;
    let badgeColor: string;

    switch (doc.estado) {
      case 'APROBADO':
        status = 'approved'; statusLabel = 'Aprobado'; badgeColor = '#10b981'; break;
      case 'RECHAZADO':
        status = 'rejected'; statusLabel = 'Rechazado'; badgeColor = '#ef4444'; break;
      default:
        status = 'pending'; statusLabel = 'Pendiente'; badgeColor = '#f59e0b';
    }

    return {
      id_documento: doc.id_documento,
      id_plantilla: doc.id_plantilla,
      name: doc.plantilla_nombre,
      category: doc.es_fijo === 1 ? 'fixed' : 'periodic',
      status: status,
      statusLabel: statusLabel,
      required: doc.obligatorio === 1,
      description: doc.descripcion,
      uploadDate: doc.fecha_subida ? this.datePipe.transform(doc.fecha_subida, 'dd/MM/yyyy') : undefined,
      dueDate: doc.fecha_vencimiento ? this.datePipe.transform(doc.fecha_vencimiento, 'dd/MM/yyyy') : undefined,
      rejectionReason: doc.estado === 'RECHAZADO' ? doc.comentario : undefined,
      badgeColor: badgeColor,
      periodicity: (doc.requiere_actualizacion === 1 && doc.dias_vigencia)
        ? `Cada ${Math.floor(doc.dias_vigencia / 30)} mes(es)`
        : undefined
    };
  }

  // RESTAURADO: Lógica de additionalInfo
  generateAlerts(documentos: DocumentoDetalle[]): void {
    this.alerts = [];
    let additionalCount = 0;

    documentos.forEach(doc => {
      if (doc.estado === 'RECHAZADO' && doc.comentario) {
        if (this.alerts.length < 2) {
          this.alerts.push({
            type: 'error',
            title: `${doc.plantilla_nombre}:`,
            message: doc.comentario
          });
        } else {
          additionalCount++;
        }
      }
    });

    if (additionalCount > 0) {
      this.additionalInfo = `+${additionalCount} documento${additionalCount > 1 ? 's' : ''} más requieren atención`;
    } else {
      this.additionalInfo = '';
    }
  }

  get progressPercentage(): number {
    if (!this.documentsTotal) return 0;
    return Math.round((this.documentsApproved / this.documentsTotal) * 100);
  }

  get filteredDocuments(): DocumentoUI[] {
    if (this.activeTab === 'todos') return this.documents;
    return this.documents.filter(d => 
      this.activeTab === 'fijos' ? d.category === 'fixed' : d.category === 'periodic'
    );
  }

  get fixedDocumentsCount(): number {
    return this.documents.filter(d => d.category === 'fixed' && d.status === 'approved').length;
  }
  get fixedDocumentsTotal(): number {
    return this.documents.filter(d => d.category === 'fixed').length;
  }
  get periodicDocumentsCount(): number {
    return this.documents.filter(d => d.category === 'periodic' && d.status === 'approved').length;
  }
  get periodicDocumentsTotal(): number {
    return this.documents.filter(d => d.category === 'periodic').length;
  }

  setTab(tab: 'todos' | 'fijos' | 'periodicos'): void {
    this.activeTab = tab;
  }
  
  // Ver Documento
  openViewModal(document: DocumentoUI): void {
    if (!document.id_documento) return alert('Este documento aún no ha sido subido');
    
    this.selectedDocument = document;
    this.showViewModal = true;
    this.isLoadingPreview = true;
    
    this.documentosService.verDocumento(document.id_documento).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        this.documentPreviewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        this.isLoadingPreview = false;
      },
      error: () => {
        this.isLoadingPreview = false;
        alert('Error al cargar la vista previa');
      }
    });
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.selectedDocument = null;
    this.documentPreviewUrl = null; 
  }

  descargarDocumento(doc: DocumentoUI): void {
    if (!doc.id_documento) return;

    this.documentosService.descargarDocumento(doc.id_documento).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${doc.name}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => alert('Error al descargar')
    });
  }

  // Eliminar Documento
  openDeleteModal(document: DocumentoUI): void {
    if (!document.id_documento) return;
    this.selectedDocument = document;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.selectedDocument = null;
  }

  confirmDelete(): void {
    if (!this.selectedDocument?.id_documento) return;

    this.documentosService.eliminarDocumento(this.selectedDocument.id_documento).subscribe({
      next: () => {
        alert('Documento eliminado');
        this.closeDeleteModal();
        this.loadDocuments();
      },
      error: () => alert('Error al eliminar')
    });
  }

  // Subir Documento
  openUploadModal(document: DocumentoUI): void {
    this.selectedDocument = document;
    this.uploadForm = {
      documentType: document.name,
      idPlantilla: document.id_plantilla,
      file: null,
      fileName: '',
      description: ''
    };
    this.showUploadModal = true;
  }

  closeUploadModal(): void {
    this.showUploadModal = false;
    this.selectedDocument = null;
    this.uploadForm = { documentType: '', idPlantilla: 0, file: null, fileName: '', description: '' };
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) return alert('Máximo 10MB');
      const allowed = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowed.includes(file.type)) return alert('Solo PDF, JPG y PNG');
      
      this.uploadForm.file = file;
      this.uploadForm.fileName = file.name;
    }
  }

  triggerFileInput(): void {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) fileInput.click();
  }

  submitUpload(): void {
    if (!this.uploadForm.file || !this.uploadForm.idPlantilla) return alert('Selecciona un archivo');

    const formData = new FormData();
    formData.append('archivo', this.uploadForm.file);
    formData.append('id_plantilla', this.uploadForm.idPlantilla.toString());
    if (this.uploadForm.description) formData.append('descripcion', this.uploadForm.description);

    this.documentosService.subirDocumento(formData).subscribe({
      next: () => {
        alert('Documento subido exitosamente');
        this.closeUploadModal();
        this.loadDocuments();
      },
      error: (err) => alert(err.error?.error || 'Error al subir')
    });
  }

  // Navegación
  navigateTo(route: string): void {
    this.currentRoute = route;
    this.router.navigate([route]);
  }

  getIcon(iconName: string): string {
    return ICONS_MAP[iconName] || ICONS_MAP['file-text'];
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['']);
  }
}