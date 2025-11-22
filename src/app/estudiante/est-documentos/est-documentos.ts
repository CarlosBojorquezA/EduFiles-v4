import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DocumentosService, DocumentoDetalle, Plantilla } from '../../services/documentos.service';
import { AuthService } from '../../auth.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
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
  dueDate?: string;
  uploadDate?: string;
  rejectionReason?: string;
  badgeColor: string;
  periodicity?: string;
}

@Component({
  selector: 'app-est-documentos',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NotificationsComponent],
  templateUrl: './est-documentos.html',
  styleUrls: ['./est-documentos.css']
})
export class EstDocumentosComponent implements OnInit {
  userRole: 'estudiante' = 'estudiante';
  userName: string = '';
  userAccountNumber: string = '';
  userCareer: string = '';
  userGradeGroup: string = '';
  notificationCount: number = 3;
  currentRoute: string = '/est-documentos';

  // Student type
  studentType: string = '';
  studentTypeLabel: string = '';
  tipoEstudiante: 'NUEVO_INGRESO' | 'REINGRESO' = 'NUEVO_INGRESO';

  // Progress
  documentsApproved: number = 0;
  documentsTotal: number = 0;

  // Active tab
  activeTab: 'todos' | 'fijos' | 'periodicos' = 'todos';

  // Alerts
  alerts: Alert[] = [];
  additionalInfo: string = '';

  // Documents
  documents: DocumentoUI[] = [];

  // Modals
  showViewModal: boolean = false;
  showDeleteModal: boolean = false;
  showUploadModal: boolean = false;
  selectedDocument: DocumentoUI | null = null;
  
  // Document preview
  documentPreviewUrl: SafeUrl | null = null;
  isLoadingPreview: boolean = false;

  // Upload form
  uploadForm = {
    documentType: '',
    idPlantilla: 0,
    file: null as File | null,
    fileName: '',
    description: ''
  };

  navigationItems: NavItem[] = [];
  isLoading: boolean = true;
  isMobile: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private documentosService: DocumentosService,
    private authService: AuthService,
    private sanitizer: DomSanitizer
  ) {
    this.isMobile = this.detectMobile();
  }

  ngOnInit(): void {
    this.loadUserData();
    this.loadNavigation();
    this.loadDocuments();
    this.currentRoute = this.router.url;
    
    // Manejar query params (para abrir modal desde dashboard)
    this.route.queryParams.subscribe(params => {
      if (params['plantilla']) {
        const idPlantilla = parseInt(params['plantilla'], 10);
        const doc = this.documents.find(d => d.id_plantilla === idPlantilla);
        if (doc) {
          setTimeout(() => this.openUploadModal(doc), 500);
        }
      }
    });
  }

  detectMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  loadUserData(): void {
    const user = this.authService.getCurrentUser();
    if (user && user.detalles) {
      const detalles = user.detalles;
      this.userName = `${detalles.nombres} ${detalles.apellido_paterno} ${detalles.apellido_materno || ''}`.trim();
      this.userAccountNumber = user.num_usuario;
      this.tipoEstudiante = detalles.tipo_estudiante || 'NUEVO_INGRESO';
      this.studentType = detalles.tipo_estudiante === 'REINGRESO' ? 'Reinscripción' : 'Nuevo Ingreso';
      this.studentTypeLabel = detalles.tipo_estudiante === 'REINGRESO' ? 'Reingreso' : 'Nuevo Ingreso';
      
      if (detalles.grado) {
        this.userGradeGroup = `${detalles.grado}°`;
        if (detalles.grupo_turno) {
          this.userGradeGroup += ` ${detalles.grupo_turno}`;
        }
      }
      
      this.userCareer = detalles.nivel_educativo || 'Estudiante';
    }
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

    // Usar el nuevo método que combina documentos
    this.documentosService.getTodosDocumentos().subscribe({
      next: (todosDocumentos) => {
        console.log('[DOCUMENTOS] Documentos recibidos:', todosDocumentos);
        
        // Mapear documentos
        this.documents = todosDocumentos.map(doc => this.mapDocumentFromBackend(doc));
        
        // Calcular estadísticas
        this.documentsTotal = this.documents.length;
        this.documentsApproved = this.documents.filter(d => d.status === 'approved').length;
        
        // Generar alertas solo de documentos subidos
        const documentosSubidos = todosDocumentos.filter(d => d.tipo_registro === 'SUBIDO');
        this.generateAlerts(documentosSubidos);
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('[DOCUMENTOS] Error cargando documentos:', error);
        this.isLoading = false;
        
        // Mostrar alerta de error
        this.alerts.push({
          type: 'error',
          title: 'Error de carga',
          message: 'No se pudieron cargar los documentos. Por favor, recarga la página.'
        });
      }
    });
  }

  mapDocumentFromBackend(doc: any): DocumentoUI {
    // Si es un documento faltante
    if (doc.estado === 'FALTANTE') {
      return {
        id_plantilla: doc.id_plantilla,
        name: doc.plantilla_nombre,
        category: doc.es_fijo === 1 ? 'fixed' : 'periodic',
        status: 'missing',
        statusLabel: 'Faltante',
        required: doc.obligatorio === 1,
        description: doc.descripcion,
        badgeColor: '#6b7280',
        periodicity: doc.requiere_actualizacion === 1 && doc.dias_vigencia 
          ? `Cada ${Math.floor(doc.dias_vigencia / 30)} ${Math.floor(doc.dias_vigencia / 30) === 1 ? 'mes' : 'meses'}`
          : undefined
      };
    }

    // Si es un documento subido
    let status: 'approved' | 'rejected' | 'pending' | 'missing';
    let statusLabel: string;
    let badgeColor: string;
    
    switch (doc.estado) {
      case 'APROBADO':
        status = 'approved';
        statusLabel = 'Aprobado';
        badgeColor = '#10b981';
        break;
      case 'RECHAZADO':
        status = 'rejected';
        statusLabel = 'Rechazado';
        badgeColor = '#ef4444';
        break;
      default:
        status = 'pending';
        statusLabel = 'Pendiente';
        badgeColor = '#f59e0b';
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
      uploadDate: doc.fecha_subida ? this.formatDate(doc.fecha_subida) : '',
      dueDate: doc.fecha_vencimiento ? this.formatDate(doc.fecha_vencimiento) : '',
      rejectionReason: doc.estado === 'RECHAZADO' ? doc.comentario ?? undefined : undefined,
      badgeColor: badgeColor,
      periodicity: doc.requiere_actualizacion === 1 && doc.dias_vigencia 
        ? `Cada ${Math.floor(doc.dias_vigencia / 30)} ${Math.floor(doc.dias_vigencia / 30) === 1 ? 'mes' : 'meses'}`
        : undefined
    };
  }

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
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  }

  get progressPercentage(): number {
    if (this.documentsTotal === 0) return 0;
    return Math.round((this.documentsApproved / this.documentsTotal) * 100);
  }

  get filteredDocuments(): DocumentoUI[] {
    if (this.activeTab === 'todos') return this.documents;
    if (this.activeTab === 'fijos') return this.documents.filter(d => d.category === 'fixed');
    if (this.activeTab === 'periodicos') return this.documents.filter(d => d.category === 'periodic');
    return this.documents;
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

  // ============ MODAL: VER DOCUMENTO ============
  openViewModal(document: DocumentoUI): void {
    if (!document.id_documento) {
      alert('Este documento aún no ha sido subido');
      return;
    }
    
    this.selectedDocument = document;
    this.showViewModal = true;
    this.isLoadingPreview = true;
    
    this.documentosService.verDocumento(document.id_documento).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        this.documentPreviewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        this.isLoadingPreview = false;
      },
      error: (error) => {
        console.error('[VER DOCUMENTO] Error:', error);
        this.isLoadingPreview = false;
        alert('Error al cargar el documento');
      }
    });
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.selectedDocument = null;
    if (this.documentPreviewUrl) {
      const url = this.documentPreviewUrl.toString();
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
      this.documentPreviewUrl = null;
    }
  }

  descargarDocumento(doc: DocumentoUI): void {
    if (!doc.id_documento) {
      alert('Este documento aún no ha sido subido');
      return;
    }

    this.documentosService.descargarDocumento(doc.id_documento).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = window.document.createElement('a');
        link.href = url;
        link.download = `${doc.name}.pdf`;
        window.document.body.appendChild(link);
        link.click();
        window.URL.revokeObjectURL(url);
        window.document.body.removeChild(link);
      },
      error: (error) => {
        console.error('[DESCARGAR] Error:', error);
        alert('Error al descargar el documento');
      }
    });
  }

  // ============ MODAL: ELIMINAR DOCUMENTO ============
  openDeleteModal(document: DocumentoUI): void {
    if (!document.id_documento) {
      alert('No hay documento para eliminar');
      return;
    }
    
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
        console.log('[ELIMINAR] Documento eliminado');
        alert('Documento eliminado exitosamente');
        this.closeDeleteModal();
        this.loadDocuments(); // Recargar lista
      },
      error: (error) => {
        console.error('[ELIMINAR] Error:', error);
        alert('Error al eliminar el documento');
      }
    });
  }

  // ============ MODAL: SUBIR DOCUMENTO ============
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
    this.uploadForm = {
      documentType: '',
      idPlantilla: 0,
      file: null,
      fileName: '',
      description: ''
    };
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validar tamaño (máx 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('El archivo es demasiado grande. Máximo 10MB');
        return;
      }
      
      // Validar tipo
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        alert('Solo se permiten archivos PDF, JPG y PNG');
        return;
      }
      
      this.uploadForm.file = file;
      this.uploadForm.fileName = file.name;
    }
  }

  triggerFileInput(): void {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  submitUpload(): void {
    if (!this.uploadForm.file || !this.uploadForm.idPlantilla) {
      alert('Por favor selecciona un archivo');
      return;
    }

    const formData = new FormData();
    formData.append('archivo', this.uploadForm.file);
    formData.append('id_plantilla', this.uploadForm.idPlantilla.toString());
    
    if (this.uploadForm.description) {
      formData.append('descripcion', this.uploadForm.description);
    }

    this.documentosService.subirDocumento(formData).subscribe({
      next: (response) => {
        console.log('[SUBIR] Documento subido:', response);
        alert('Documento subido exitosamente');
        this.closeUploadModal();
        this.loadDocuments(); // Recargar lista
      },
      error: (error) => {
        console.error('[SUBIR] Error:', error);
        alert(error.error?.error || 'Error al subir el documento');
      }
    });
  }

  // Navegación
  navigateTo(route: string): void {
    this.currentRoute = route;
    this.router.navigate([route]);
  }

  getIcon(iconName: string): string {
    const icons: { [key: string]: string } = {
      'home': 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
      'file-text': 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8',
      'material': 'M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25',
      'users': 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
      'user': 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z'
    };
    return icons[iconName] || icons['file-text'];
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['']);
  }
}