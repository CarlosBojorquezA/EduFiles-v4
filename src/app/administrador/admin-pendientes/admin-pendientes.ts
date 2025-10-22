import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface PendingDocument {
  id: string;
  studentName: string;
  studentInitials: string;
  studentEmail: string;
  documentType: string;
  uploadDate: string;
  description: string;
  status: 'expired' | 'pending';
}

interface NavItem {
  icon: string;
  label: string;
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-pendientes',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-pendientes.html',
  styleUrls: ['./admin-pendientes.css']
})
export class AdminPendientesComponent implements OnInit {
  userRole: 'administrador' | 'estudiante' | 'profesor' = 'administrador';
  userName: string = 'Carlos Rodríguez';
  notificationCount: number = 5;
  currentRoute: string = '/pendientes';

  // Modal states
  showApproveModal: boolean = false;
  showRejectModal: boolean = false;
  selectedDocument: PendingDocument | null = null;
  approvalComment: string = '';
  rejectionReason: string = '';

  pendingDocuments: PendingDocument[] = [
    {
      id: '1',
      studentName: 'María García',
      studentInitials: 'MG',
      studentEmail: 'maria.garcia@estudiante.edu',
      documentType: 'Certificado de Nacimiento',
      uploadDate: '2024-03-01',
      description: 'Certificado original solicitado para inscripción',
      status: 'expired'
    },
    {
      id: '2',
      studentName: 'Juan Pérez',
      studentInitials: 'JP',
      studentEmail: 'juan.perez@estudiante.edu',
      documentType: 'Constancia de Estudios',
      uploadDate: '2024-02-28',
      description: 'Constancia de estudios del semestre anterior',
      status: 'expired'
    },
    {
      id: '3',
      studentName: 'Ana López',
      studentInitials: 'AL',
      studentEmail: 'ana.lopez@estudiante.edu',
      documentType: 'Comprobante de Domicilio',
      uploadDate: '2024-03-05',
      description: 'Comprobante reciente no mayor a 3 meses',
      status: 'pending'
    },
    {
      id: '4',
      studentName: 'Carlos Mendoza',
      studentInitials: 'CM',
      studentEmail: 'carlos.mendoza@estudiante.edu',
      documentType: 'CURP',
      uploadDate: '2024-03-04',
      description: 'CURP actualizada',
      status: 'pending'
    }
  ];

  navigationItems: NavItem[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadNavigationByRole();
    this.currentRoute = this.router.url;
  }

  loadNavigationByRole(): void {
    const navigationConfig = {
      administrador: [
        { icon: 'home', label: 'Inicio', route: '/dashboard', badge: 0 },
        { icon: 'clock', label: 'Pendientes', route: '/pendientes', badge: 23 },
        { icon: 'search', label: 'Buscar', route: '/buscar', badge: 0 },
        { icon: 'folder', label: 'Gestión', route: '/gestion', badge: 0 },
        { icon: 'user', label: 'Perfil', route: '/perfil', badge: 0 }
      ],
      estudiante: [
        { icon: 'home', label: 'Inicio', route: '/dashboard', badge: 0 },
        { icon: 'upload', label: 'Mis Documentos', route: '/mis-documentos', badge: 0 },
        { icon: 'clock', label: 'Pendientes', route: '/pendientes', badge: 5 },
        { icon: 'user', label: 'Perfil', route: '/perfil', badge: 0 }
      ],
      profesor: [
        { icon: 'home', label: 'Inicio', route: '/dashboard', badge: 0 },
        { icon: 'users', label: 'Estudiantes', route: '/estudiantes', badge: 0 },
        { icon: 'clock', label: 'Pendientes', route: '/pendientes', badge: 12 },
        { icon: 'file-text', label: 'Documentos', route: '/documentos', badge: 0 },
        { icon: 'user', label: 'Perfil', route: '/perfil', badge: 0 }
      ]
    };

    this.navigationItems = navigationConfig[this.userRole];
  }

  navigateTo(route: string): void {
    this.currentRoute = route;
    this.router.navigate([route]);
  }

  onViewDocument(document: PendingDocument): void {
    console.log('Ver documento:', document);
    // Aquí abrirías un visor de documentos o navegarías a una página de detalle
  }

  openApproveModal(document: PendingDocument): void {
    this.selectedDocument = document;
    this.approvalComment = '';
    this.showApproveModal = true;
  }

  openRejectModal(document: PendingDocument): void {
    this.selectedDocument = document;
    this.rejectionReason = '';
    this.showRejectModal = true;
  }

  closeApproveModal(): void {
    this.showApproveModal = false;
    this.selectedDocument = null;
    this.approvalComment = '';
  }

  closeRejectModal(): void {
    this.showRejectModal = false;
    this.selectedDocument = null;
    this.rejectionReason = '';
  }

  confirmApproval(): void {
    if (this.selectedDocument) {
      console.log('Aprobar documento:', {
        document: this.selectedDocument,
        comment: this.approvalComment
      });
      // Aquí implementarías la lógica para aprobar el documento
      this.pendingDocuments = this.pendingDocuments.filter(
        doc => doc.id !== this.selectedDocument!.id
      );
      this.closeApproveModal();
    }
  }

  confirmRejection(): void {
    if (this.selectedDocument && this.rejectionReason.trim()) {
      console.log('Rechazar documento:', {
        document: this.selectedDocument,
        reason: this.rejectionReason
      });
      // Aquí implementarías la lógica para rechazar el documento
      this.pendingDocuments = this.pendingDocuments.filter(
        doc => doc.id !== this.selectedDocument!.id
      );
      this.closeRejectModal();
    }
  }

  getIcon(iconName: string): string {
    const icons: { [key: string]: string } = {
      'home': 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
      'clock': 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 6v6l4 2',
      'search': 'M11 2a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM21 21l-4.35-4.35',
      'folder': 'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z',
      'user': 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
      'users': 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
      'upload': 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12',
      'file-text': 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8'
    };
    return icons[iconName] || icons['file-text'];
  }

  logout(): void {
    console.log('Cerrando sesión...');
    this.router.navigate(['']);
  }

}
