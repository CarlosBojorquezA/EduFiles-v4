import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { EstudianteService } from '../../services/estudiante.service';
import { DocumentosService } from '../../services/documentos.service';
import { AuthService } from '../../auth.service';
import { NotificationsComponent } from '../../notificaciones/notificaciones';
import { forkJoin } from 'rxjs';

interface Alert {
  type: 'error' | 'warning';
  icon: string;
  message: string;
  date?: string;
}

interface Document {
  id_documento?: number;
  id_plantilla: number;
  name: string;
  status: 'approved' | 'rejected' | 'pending' | 'missing';
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
  imports: [CommonModule, RouterModule, NotificationsComponent],
  templateUrl: './est-dashboard.html',
  styleUrls: ['./est-dashboard.css']
})
export class EstDashboardComponent implements OnInit {
  userRole: 'estudiante' = 'estudiante';
  userName: string = '';
  userAccountNumber: string = '';
  userCareer: string = '';
  userGradeGroup: string = '';
  notificationCount: number = 0;
  currentRoute: string = '/est-dashboard';

  // Progress
  documentsApproved: number = 0;
  documentsTotal: number = 0;

  // Alerts
  alerts: Alert[] = [];

  // Documents
  documents: Document[] = [];

  navigationItems: NavItem[] = [];
  isLoading: boolean = true;

  constructor(
    private router: Router,
    private estudianteService: EstudianteService,
    private documentosService: DocumentosService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.loadNavigation();
    this.loadDashboardData();
    this.currentRoute = this.router.url;
  }

  loadUserData(): void {
    const user = this.authService.getCurrentUser();
    if (user && user.detalles) {
      const detalles = user.detalles;
      this.userName = `${detalles.nombres} ${detalles.apellido_paterno} ${detalles.apellido_materno || ''}`.trim();
      this.userAccountNumber = user.num_usuario;
      
      if (detalles.grado) {
        this.userGradeGroup = `${detalles.grado}°`;
        if (detalles.grupo_turno) {
          this.userGradeGroup += ` ${detalles.grupo_turno}`;
        }
      }
      
      this.userCareer = detalles.nivel_educativo || 'Estudiante';
    }
  }

  loadDashboardData(): void {
    this.isLoading = true;

    // Usar el nuevo método getTodosDocumentos()
    forkJoin({
      stats: this.estudianteService.getEstadisticas(),
      todosDocumentos: this.documentosService.getTodosDocumentos()
    }).subscribe({
      next: ({ stats, todosDocumentos }) => {
        console.log('[DASHBOARD] Documentos recibidos:', todosDocumentos);
        
        // Actualizar estadísticas desde backend
        this.documentsTotal = stats.total_requeridos;
        this.documentsApproved = stats.documentos_aprobados;

        // Mapear todos los documentos
        this.documents = todosDocumentos.map(doc => this.mapDocumentFromBackend(doc));

        // Generar alertas solo de documentos subidos
        const documentosSubidos = todosDocumentos.filter((d: any) => d.tipo_registro === 'SUBIDO');
        this.alerts = this.generateAlerts(documentosSubidos);
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('[DASHBOARD] Error cargando datos:', error);
        this.isLoading = false;
        
        // Mostrar mensaje de error al usuario
        this.alerts.push({
          type: 'error',
          icon: 'alert-triangle',
          message: 'Error al cargar los datos. Por favor, recarga la página.'
        });
      }
    });
  }

  mapDocumentFromBackend(doc: any): Document {
    // Si es un documento faltante
    if (doc.estado === 'FALTANTE') {
      return {
        id_plantilla: doc.id_plantilla,
        name: doc.plantilla_nombre,
        status: 'missing',
        statusLabel: 'Faltante',
        dueDate: '',
        uploadDate: '',
        comment: 'Documento pendiente de subir',
        iconColor: '#6b7280'
      };
    }

    // Si es un documento subido
    let status: 'approved' | 'rejected' | 'pending' | 'missing';
    let statusLabel: string;
    let iconColor: string;
    
    switch (doc.estado) {
      case 'APROBADO':
        status = 'approved';
        statusLabel = 'Aprobado';
        iconColor = '#10b981';
        break;
      case 'RECHAZADO':
        status = 'rejected';
        statusLabel = 'Rechazado';
        iconColor = '#ef4444';
        break;
      case 'EN_REVISION':
      case 'PENDIENTE':
      default:
        status = 'pending';
        statusLabel = 'Pendiente';
        iconColor = '#f59e0b';
    }

    return {
      id_documento: doc.id_documento,
      id_plantilla: doc.id_plantilla,
      name: doc.plantilla_nombre,
      status: status,
      statusLabel: statusLabel,
      dueDate: doc.fecha_vencimiento ? this.formatDate(doc.fecha_vencimiento) : '',
      uploadDate: doc.fecha_subida ? this.formatDate(doc.fecha_subida) : '',
      comment: doc.comentario || (
        status === 'approved' ? 'Documento aprobado correctamente' : 
        status === 'rejected' ? 'Documento rechazado, revisa los comentarios' : 
        'En espera de revisión'
      ),
      iconColor: iconColor
    };
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  }

  generateAlerts(documentos: any[]): Alert[] {
    const alertas: Alert[] = [];
    
    documentos.forEach(doc => {
      // Alerta de documento rechazado
      if (doc.estado === 'RECHAZADO' && doc.comentario) {
        alertas.push({
          type: 'error',
          icon: 'alert-triangle',
          message: `${doc.plantilla_nombre}: ${doc.comentario}`
        });
      }
      
      // Alerta de documento próximo a vencer
      if (doc.fecha_vencimiento) {
        const fechaVencimiento = new Date(doc.fecha_vencimiento);
        const hoy = new Date();
        const diferenciaDias = Math.ceil((fechaVencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diferenciaDias <= 7 && diferenciaDias > 0 && doc.estado === 'APROBADO') {
          alertas.push({
            type: 'warning',
            icon: 'alert-circle',
            message: `${doc.plantilla_nombre} vence en ${diferenciaDias} día${diferenciaDias > 1 ? 's' : ''}`
          });
        }
      }
    });
    
    return alertas;
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

  get progressPercentage(): number {
    if (this.documentsTotal === 0) return 0;
    return Math.round((this.documentsApproved / this.documentsTotal) * 100);
  }

  navigateTo(route: string): void {
    this.currentRoute = route;
    this.router.navigate([route]);
  }

  viewDocumentDetails(document: Document): void {
    console.log('[DASHBOARD] Ver detalles del documento:', document);
    
    if (document.id_documento) {
      // Documento subido - navegar con ID
      this.router.navigate(['/est-documentos'], { 
        queryParams: { documento: document.id_documento } 
      });
    } else {
      // Documento faltante - navegar para subirlo
      this.router.navigate(['/est-documentos'], { 
        queryParams: { plantilla: document.id_plantilla } 
      });
    }
  }

  getIcon(iconName: string): string {
    const icons: { [key: string]: string } = {
      'home': 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
      'file-text': 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8',
      'material': 'M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25',
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
    this.authService.logout();
    this.router.navigate(['']);
  }
}