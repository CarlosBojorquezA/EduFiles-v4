import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

interface Alert {
  type: 'error' | 'warning';
  icon: string;
  message: string;
  date?: string;
}

interface Document {
  id: string;
  name: string;
  status: 'approved' | 'rejected' | 'pending';
  statusLabel: string;
  dueDate: string;
  uploadDate: string;
  comment: string;
  iconColor: string;
}

interface NavItem {
  icon: string;
  label: string;
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-est-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './est-dashboard.html',
  styleUrls: ['./est-dashboard.css']
})
export class EstDashboardComponent implements OnInit {
  userRole: 'estudiante' = 'estudiante';
  userName: string = 'María García';
  userAccountNumber: string = '2024001234';
  userCareer: string = 'Ingeniería de Sistemas';
  userGradeGroup: string = '2°A';
  notificationCount: number = 3;
  currentRoute: string = '/est-dashboard';

  // Progress
  documentsApproved: number = 1;
  documentsTotal: number = 4;

  // Alerts
  alerts: Alert[] = [
    {
      type: 'error',
      icon: 'alert-triangle',
      message: 'Constancia de Estudios fue rechazado: El documento está borroso, por favor sube una versión más clara',
      date: ''
    },
    {
      type: 'warning',
      icon: 'alert-circle',
      message: 'Comprobante de Domicilio vence pronto (2024-03-30)',
      date: ''
    }
  ];

  // Documents
  documents: Document[] = [
    {
      id: '1',
      name: 'Certificado de Nacimiento',
      status: 'approved',
      statusLabel: 'Aprobado',
      dueDate: '2024-03-15',
      uploadDate: '2024-02-20',
      comment: 'Documento aprobado correctamente',
      iconColor: '#10b981'
    },
    {
      id: '2',
      name: 'Constancia de Estudios',
      status: 'rejected',
      statusLabel: 'Rechazado',
      dueDate: '2024-03-20',
      uploadDate: '2024-02-25',
      comment: 'El documento está borroso, por favor sube una versión más clara',
      iconColor: '#ef4444'
    },
    {
      id: '3',
      name: 'Comprobante de Domicilio',
      status: 'pending',
      statusLabel: 'Pendiente',
      dueDate: '2024-03-30',
      uploadDate: '',
      comment: 'Documento pendiente de subir',
      iconColor: '#f59e0b'
    },
    {
      id: '4',
      name: 'CURP',
      status: 'pending',
      statusLabel: 'Pendiente',
      dueDate: '2024-04-05',
      uploadDate: '',
      comment: 'Documento pendiente de subir',
      iconColor: '#f59e0b'
    }
  ];

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
      { icon: 'users', label: 'Profesores', route: '/est-profesores', badge: 0 },
      { icon: 'user', label: 'Perfil', route: '/est-perfil', badge: 0 }
    ];
  }

  get progressPercentage(): number {
    return (this.documentsApproved / this.documentsTotal) * 100;
  }

  get pendingDocuments(): Document[] {
    return this.documents.filter(doc => doc.status === 'pending');
  }

  get rejectedDocuments(): Document[] {
    return this.documents.filter(doc => doc.status === 'rejected');
  }

  navigateTo(route: string): void {
    this.currentRoute = route;
    this.router.navigate([route]);
  }

  viewDocumentDetails(document: Document): void {
    console.log('Ver detalles del documento:', document);
    // Navegar a detalles del documento
  }

  uploadDocument(document: Document): void {
    console.log('Subir documento:', document);
    // Abrir modal o navegar a subir documento
  }

  getIcon(iconName: string): string {
    const icons: { [key: string]: string } = {
      'home': 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
      'file-text': 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8',
      'users': 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
      'user': 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
      'alert-triangle': 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01',
      'alert-circle': 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M12 8v4 M12 16h.01',
      'check-circle': 'M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4L12 14.01l-3-3',
      'x-circle': 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M15 9l-6 6 M9 9l6 6'
    };
    return icons[iconName] || icons['file-text'];
  }

  getIconPath(iconName: string): string {
    return this.getIcon(iconName);
  }

  logout(): void {
    console.log('Cerrando sesión...');
    this.router.navigate(['']);
  }
}