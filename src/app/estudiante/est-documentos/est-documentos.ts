import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
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
  documentosOriginales: DocumentoDetalle[] = [];

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

  // Plantillas disponibles para subir
  plantillasDisponibles: Plantilla[] = [];

  navigationItems: NavItem[] = [];
  isLoading: boolean = true;
  isMobile: boolean = false;

  constructor(
    private router: Router,
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

    this.documentosService.getMisDocumentos().subscribe({
      next: (documentos) => {
        this.documentosOriginales = documentos;
        this.processDocuments(documentos);
        this.generateAlerts(documentos);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error cargando documentos:', error);
        this.isLoading = false;
      }
    });
  }

  processDocuments(documentos: DocumentoDetalle[]): void {
    // Mapear documentos subidos
    const documentosUI: DocumentoUI[] = documentos.map(doc => ({
      id_documento: doc.id_documento,
      id_plantilla: doc.id_plantilla,
      name: doc.plantilla_nombre,
      category: doc.es_fijo === 1 ? 'fixed' : 'periodic',
      status: this.mapStatus(doc.estado),
      statusLabel: this.getStatusLabel(doc.estado),
      required: doc.obligatorio === 1,
      description: doc.descripcion,
      uploadDate: doc.fecha_subida ? this.formatDate(doc.fecha_subida) : '',
      rejectionReason: doc.estado === 'RECHAZADO' ? (doc.comentario ?? undefined) : undefined,
      badgeColor: this.getStatusColor(doc.estado),
      periodicity: doc.requiere_actualizacion === 1 && doc.dias_vigencia 
        ? `Cada ${Math.floor(doc.dias_vigencia / 30)} ${Math.floor(doc.dias_vigencia / 30) === 1 ? 'mes' : 'meses'}`
        : undefined
    }));

    this.documents = documentosUI;
    
    // Calcular estadísticas
    this.documentsTotal = documentos.length;
    this.documentsApproved = documentos.filter(d => d.estado === 'APROBADO').length;
  }

  mapStatus(estado: string): 'approved' | 'rejected' | 'pending' | 'missing' {
    switch (estado) {
      case 'APROBADO': return 'approved';
      case 'RECHAZADO': return 'rejected';
      default: return 'pending';
    }
  }

  getStatusLabel(estado: string): string {
    switch (estado) {
      case 'APROBADO': return 'Aprobado';
      case 'RECHAZADO': return 'Rechazado';
      case 'PENDIENTE': return 'Pendiente';
      case 'EN_REVISION': return 'En Revisión';
      default: return 'Faltante';
    }
  }

  getStatusColor(estado: string): string {
    switch (estado) {
      case 'APROBADO': return '#1a1a1a';
      case 'RECHAZADO': return '#ef4444';
      default: return '#666';
    }
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
    if (!document.id_documento) return;
    
    this.selectedDocument = document;
    this.showViewModal = true;
    this.isLoadingPreview = true;
    
    this.documentosService.verDocumento(document.id_documento).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        this.documentPreviewUrl = this.sanitizer.bypassSecurityTrustUrl(url);
        this.isLoadingPreview = false;
      },
      error: (error) => {
        console.error('Error cargando preview:', error);
        this.isLoadingPreview = false;
        alert('Error al cargar el documento');
      }
    });
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.selectedDocument = null;
    if (this.documentPreviewUrl) {
      URL.revokeObjectURL(this.documentPreviewUrl as string);
      this.documentPreviewUrl = null;
    }
  }

  // ============ MODAL: ELIMINAR Y RESUBIR ============
  openDeleteModal(document: DocumentoUI): void {
    this.selectedDocument = document;
    
    // Si está rechazado, eliminar directamente sin confirmación
    if (document.status === 'rejected') {
      this.confirmDelete();
    } else {
      this.showDeleteModal = true;
    }
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.selectedDocument = null;
  }

  confirmDelete(): void {
    if (!this.selectedDocument?.id_documento) return;

    this.documentosService.eliminarDocumento(this.selectedDocument.id_documento).subscribe({
      next: () => {
        console.log('Documento eliminado');
        this.closeDeleteModal();
        
        // Abrir modal de subida con el mismo documento
        const plantillaInfo = {
          id_plantilla: this.selectedDocument!.id_plantilla,
          name: this.selectedDocument!.name,
          description: this.selectedDocument!.description
        };
        
        this.openUploadModalWithPlantilla(plantillaInfo);
        
        // Recargar documentos
        this.loadDocuments();
      },
      error: (error) => {
        console.error('Error eliminando documento:', error);
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
    
    // Cargar plantillas disponibles para el select
    this.loadPlantillasDisponibles();
    
    this.showUploadModal = true;
  }

  openUploadModalWithPlantilla(plantilla: any): void {
    this.selectedDocument = {
      id_plantilla: plantilla.id_plantilla,
      name: plantilla.name,
      description: plantilla.description,
      category: 'fixed',
      status: 'missing',
      statusLabel: 'Faltante',
      required: true,
      badgeColor: '#666'
    };
    
    this.uploadForm = {
      documentType: plantilla.name,
      idPlantilla: plantilla.id_plantilla,
      file: null,
      fileName: '',
      description: ''
    };
    
    this.loadPlantillasDisponibles();
    this.showUploadModal = true;
  }

  loadPlantillasDisponibles(): void {
    this.documentosService.getPlantillas(this.tipoEstudiante).subscribe({
      next: (plantillas) => {
        // Filtrar solo plantillas que no tienen documento subido
        const idsSubidos = this.documents
          .filter(d => d.id_documento)
          .map(d => d.id_plantilla);
        
        this.plantillasDisponibles = plantillas.filter(p => 
          !idsSubidos.includes(p.id_plantilla)
        );
      },
      error: (error) => {
        console.error('Error cargando plantillas:', error);
      }
    });
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

  onPlantillaChange(event: any): void {
    const idPlantilla = parseInt(event.target.value);
    const plantilla = this.plantillasDisponibles.find(p => p.id_plantilla === idPlantilla);
    
    if (plantilla) {
      this.uploadForm.documentType = plantilla.nombre;
      this.uploadForm.idPlantilla = plantilla.id_plantilla;
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
      alert('Por favor selecciona un archivo y tipo de documento');
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
        console.log('Documento subido:', response);
        alert('Documento subido exitosamente');
        this.closeUploadModal();
        this.loadDocuments();
      },
      error: (error) => {
        console.error('Error subiendo documento:', error);
        alert(error.error?.error || 'Error al subir el documento');
      }
    });
  }

  // Escanear (solo móvil)
  escanearDocumento(): void {
    if (!this.isMobile) {
      alert('Esta función solo está disponible en dispositivos móviles');
      return;
    }
    
    // Solicitar permiso de cámara
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment'; // Usar cámara trasera
    
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        this.uploadForm.file = file;
        this.uploadForm.fileName = file.name;
      }
    };
    
    input.click();
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