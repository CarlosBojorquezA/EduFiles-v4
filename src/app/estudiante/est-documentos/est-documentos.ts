import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Document {
  id: string;
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

@Component({
  selector: 'app-est-documentos',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './est-documentos.html',
  styleUrls: ['./est-documentos.css']
})
export class EstDocumentosComponent implements OnInit {
  userRole: 'estudiante' = 'estudiante';
  userName: string = 'María García';
  userAccountNumber: string = '2024001234';
  userCareer: string = 'Ingeniería de Sistemas';
  userGradeGroup: string = '2°A';
  notificationCount: number = 3;
  currentRoute: string = '/est-documentos';

  // Student type
  studentType: string = 'Reinscripción';
  studentTypeLabel: string = 'Reingreso';

  // Progress
  documentsApproved: number = 3;
  documentsTotal: number = 6;

  // Active tab
  activeTab: 'todos' | 'fijos' | 'periodicos' = 'todos';

  // Alerts
  alerts: Alert[] = [
    {
      type: 'error',
      title: 'Identificación Oficial:',
      message: 'Imagen borrosa, volver a subir'
    },
    {
      type: 'warning',
      title: 'Comprobante de Domicilio:',
      message: ''
    }
  ];

  // Additional info
  additionalInfo: string = '+1 documentos más requieren atención';

  // Documents
  documents: Document[] = [
    {
      id: '1',
      name: 'CURP',
      category: 'fixed',
      status: 'approved',
      statusLabel: 'Aprobado',
      required: true,
      description: 'Clave Única de Registro de Población',
      uploadDate: '14/02/2024',
      badgeColor: '#1a1a1a'
    },
    {
      id: '2',
      name: 'Identificación Oficial',
      category: 'fixed',
      status: 'rejected',
      statusLabel: 'Rechazado',
      required: true,
      description: 'INE, Pasaporte o Cédula Profesional',
      uploadDate: '15/02/2024',
      rejectionReason: 'Imagen borrosa, volver a subir',
      badgeColor: '#ef4444'
    },
    {
      id: '3',
      name: 'Certificado de Estudios',
      category: 'fixed',
      status: 'approved',
      statusLabel: 'Aprobado',
      required: true,
      description: 'Certificado de nivel anterior',
      uploadDate: '16/02/2024',
      badgeColor: '#1a1a1a'
    },
    {
      id: '4',
      name: 'Acta de Nacimiento',
      category: 'fixed',
      status: 'approved',
      statusLabel: 'Aprobado',
      required: true,
      description: 'Original y copia',
      uploadDate: '17/02/2024',
      badgeColor: '#1a1a1a'
    },
    {
      id: '5',
      name: 'Comprobante de Domicilio',
      category: 'periodic',
      status: 'missing',
      statusLabel: 'Faltante',
      required: true,
      description: 'No mayor a 3 meses',
      periodicity: 'Cada 6 meses',
      badgeColor: '#666'
    },
    {
      id: '6',
      name: 'Documento de Reinscripción',
      category: 'periodic',
      status: 'missing',
      statusLabel: 'Faltante',
      required: true,
      description: 'Documentos de reinscripción',
      periodicity: 'Anual',
      badgeColor: '#666'
    }
  ];

  // Modals
  showViewModal: boolean = false;
  showDeleteModal: boolean = false;
  showUploadModal: boolean = false;
  selectedDocument: Document | null = null;

  // Upload form
  uploadForm = {
    documentType: '',
    file: null as File | null,
    fileName: '',
    description: ''
  };

  navigationItems: NavItem[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadNavigation();
    this.currentRoute = this.router.url;
  }

  loadNavigation(): void {
    this.navigationItems = [
      { icon: 'home', label: 'Inicio', route: '/est-dashboard', badge: 0 },
      { icon: 'file-text', label: 'Documentos', route: '/est-documentos', badge: 0 },
      { icon: 'users', label: 'Maestros', route: '/est-maestros', badge: 0 },
      { icon: 'user', label: 'Perfil', route: '/est-perfil', badge: 0 }
    ];
  }

  get progressPercentage(): number {
    return (this.documentsApproved / this.documentsTotal) * 100;
  }

  get filteredDocuments(): Document[] {
    if (this.activeTab === 'todos') return this.documents;
    if (this.activeTab === 'fijos') return this.documents.filter(d => d.category === 'fixed');
    if (this.activeTab === 'periodicos') return this.documents.filter(d => d.category === 'periodic');
    return this.documents;
  }

  get fixedDocumentsCount(): number {
    const fixed = this.documents.filter(d => d.category === 'fixed');
    const approved = fixed.filter(d => d.status === 'approved').length;
    return approved;
  }

  get fixedDocumentsTotal(): number {
    return this.documents.filter(d => d.category === 'fixed').length;
  }

  get periodicDocumentsCount(): number {
    const periodic = this.documents.filter(d => d.category === 'periodic');
    const approved = periodic.filter(d => d.status === 'approved').length;
    return approved;
  }

  get periodicDocumentsTotal(): number {
    return this.documents.filter(d => d.category === 'periodic').length;
  }

  setTab(tab: 'todos' | 'fijos' | 'periodicos'): void {
    this.activeTab = tab;
  }

  openViewModal(document: Document): void {
    this.selectedDocument = document;
    this.showViewModal = true;
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.selectedDocument = null;
  }

  openDeleteModal(document: Document): void {
    this.selectedDocument = document;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.selectedDocument = null;
  }

  confirmDelete(): void {
    if (this.selectedDocument) {
      console.log('Eliminando documento:', this.selectedDocument);
      this.closeDeleteModal();
      this.openUploadModal(this.selectedDocument);
    }
  }

  openUploadModal(document: Document): void {
    this.selectedDocument = document;
    this.uploadForm = {
      documentType: document.name,
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
      file: null,
      fileName: '',
      description: ''
    };
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.uploadForm.file = file;
      this.uploadForm.fileName = file.name;
    }
  }

  submitUpload(): void {
    if (!this.uploadForm.file) {
      alert('Por favor selecciona un archivo');
      return;
    }

    console.log('Subiendo documento:', {
      document: this.selectedDocument,
      form: this.uploadForm
    });

    // Aquí implementarías la lógica para subir el archivo al backend

    alert('Documento subido exitosamente');
    this.closeUploadModal();
  }

  triggerFileInput(): void {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  navigateTo(route: string): void {
    this.currentRoute = route;
    this.router.navigate([route]);
  }

  getIcon(iconName: string): string {
    const icons: { [key: string]: string } = {
      'home': 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
      'file-text': 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8',
      'users': 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
      'user': 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z'
    };
    return icons[iconName] || icons['file-text'];
  }

  logout(): void {
    console.log('Cerrando sesión...');
    this.router.navigate(['']);
  }
}