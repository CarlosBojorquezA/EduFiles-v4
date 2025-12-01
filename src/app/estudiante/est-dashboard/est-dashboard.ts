import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { EstudianteService } from '../../services/estudiante.service';
import { DocumentosService, DocumentoDetalle } from '../../services/documentos.service';
import { AuthService } from '../../auth.service';
import { NotificationsComponent } from '../../notificaciones/notificaciones';

// --- Interfaces ---
export interface Alert {
  type: 'error' | 'warning';
  icon: string;
  message: string;
  date?: string;
}

// Interfaz para la vista (ViewModel)
export interface DashboardDocument {
  id_documento?: number;
  id_plantilla: number;
  name: string;
  status: 'approved' | 'rejected' | 'pending' | 'missing';
  statusLabel: string;
  dueDate: string | null;
  uploadDate: string | null;
  comment: string;
  iconColor: string;
}

interface NavItem {
  icon: string;
  label: string;
  route: string;
  badge?: number;
}

// --- Constantes (Iconos) ---
const ICONS_MAP: { [key: string]: string } = {
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

@Component({
  selector: 'app-est-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, NotificationsComponent],
  providers: [DatePipe],
  templateUrl: './est-dashboard.html',
  styleUrls: ['./est-dashboard.css']
})
export class EstDashboardComponent implements OnInit {
  // Datos Usuario
  userRole: string = 'estudiante';
  userName: string = 'Estudiante';
  userAccountNumber: string = '';
  userCareer: string = '';
  userGradeGroup: string = '';
  
  // Navegación
  currentRoute: string = '/est-dashboard';
  navigationItems: NavItem[] = [];

  // Datos Dashboard
  documentsApproved: number = 0;
  documentsTotal: number = 0;
  alerts: Alert[] = [];
  documents: DashboardDocument[] = [];
  
  // Estado
  isLoading: boolean = true;

  constructor(
    private router: Router,
    private estudianteService: EstudianteService,
    private documentosService: DocumentosService,
    private authService: AuthService,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    if (!this.checkAuth()) return;

    this.currentRoute = this.router.url;
    this.loadUserData();
    this.loadNavigation();
    this.loadDashboardData();
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
        
        // Nombre y Datos básicos
        this.userName = `${d.nombres} ${d.apellido_paterno} ${d.apellido_materno || ''}`.trim();
        this.userAccountNumber = data.num_usuario || ''; 
        this.userCareer = d.nivel_educativo || 'Estudiante';
        
        // Construcción de Datos Académicos
        const partesAcad = [];
        
        // Semestre
        if (d.semestre) {
          partesAcad.push(`${d.semestre}° Semestre`);
        } else if (d.grado) {
          partesAcad.push(`${d.grado}° Grado`);
        }

        // Grupo
        if (d.grupo_id) {
          partesAcad.push(`Grupo ${d.grupo_id}`);
        }

        // Turno
        const turno = d.grupo_turno || d.turno; 
        if (turno) {
          const turnoFormato = turno.charAt(0).toUpperCase() + turno.slice(1).toLowerCase();
          partesAcad.push(turnoFormato);
        }

        this.userGradeGroup = partesAcad.length > 0 ? partesAcad.join(' • ') : 'Sin asignación';
      },
      error: (err) => {
        console.error('No se pudo cargar detalles del usuario', err);
        this.fallbackLoadUserData(); 
      }
    });
  }

  private fallbackLoadUserData(): void {
    const user = this.authService.getCurrentUser();
    if (user && user.detalles) {
      const d = user.detalles;
      this.userName = `${d.nombres} ${d.apellido_paterno}`.trim();
    }
  }

  loadDashboardData(): void {
    this.isLoading = true;

    forkJoin({
      stats: this.estudianteService.getEstadisticas().pipe(
        catchError(err => {
          console.error('Error stats:', err);
          return of({ total_requeridos: 0, documentos_aprobados: 0 } as any);
        })
      ),
      todosDocumentos: this.documentosService.getTodosDocumentos().pipe(
        catchError(err => {
          console.error('Error documentos:', err);
          return of([]);
        })
      )
    }).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (results) => {
        this.documentsTotal = results.stats.total_requeridos || 0;
        this.documentsApproved = results.stats.documentos_aprobados || 0;
        
        this.documents = results.todosDocumentos.map(doc => this.mapDocumentToViewModel(doc));
        
        const docsConAlerta = results.todosDocumentos.filter(d => 
          d.estado === 'RECHAZADO' || 
          (d.estado === 'APROBADO' && this.isExpiringSoon(d.fecha_vencimiento))
        );
        this.alerts = this.generateAlerts(docsConAlerta);
      },
      error: () => {
        this.alerts.push({
          type: 'error',
          icon: 'alert-triangle',
          message: 'Error de conexión. Intenta recargar.'
        });
      }
    });
  }

  private mapDocumentToViewModel(doc: DocumentoDetalle): DashboardDocument {
    if (doc.estado === 'FALTANTE' || doc.tipo_registro === 'FALTANTE') {
      return {
        id_plantilla: doc.id_plantilla,
        name: doc.plantilla_nombre,
        status: 'missing',
        statusLabel: 'Faltante',
        dueDate: null,
        uploadDate: null,
        comment: 'Documento pendiente de subir',
        iconColor: '#6b7280'
      };
    }

    let status: 'approved' | 'rejected' | 'pending';
    let statusLabel: string;
    let iconColor: string;

    switch (doc.estado) {
      case 'APROBADO':
        status = 'approved'; statusLabel = 'Aprobado'; iconColor = '#10b981'; break;
      case 'RECHAZADO':
        status = 'rejected'; statusLabel = 'Rechazado'; iconColor = '#ef4444'; break;
      default:
        status = 'pending'; statusLabel = 'Pendiente'; iconColor = '#f59e0b'; break;
    }

    const formattedDue = doc.fecha_vencimiento ? this.datePipe.transform(doc.fecha_vencimiento, 'dd/MM/yyyy') : null;
    const formattedUpload = doc.fecha_subida ? this.datePipe.transform(doc.fecha_subida, 'dd/MM/yyyy') : null;

    return {
      id_documento: doc.id_documento,
      id_plantilla: doc.id_plantilla,
      name: doc.plantilla_nombre,
      status: status,
      statusLabel: statusLabel,
      dueDate: formattedDue,
      uploadDate: formattedUpload,
      comment: doc.comentario || (
        status === 'approved' ? 'Aprobado correctamente' : 
        status === 'rejected' ? 'Revisa los comentarios' : 
        'En espera de revisión'
      ),
      iconColor: iconColor
    };
  }

  private isExpiringSoon(dateStr?: string): boolean {
    if (!dateStr) return false;
    const expiration = new Date(dateStr);
    const today = new Date();
    const diffDays = Math.ceil((expiration.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 7;
  }

  private generateAlerts(docs: DocumentoDetalle[]): Alert[] {
    const alerts: Alert[] = [];

    docs.forEach(doc => {
      if (doc.estado === 'RECHAZADO' && doc.comentario) {
        alerts.push({
          type: 'error',
          icon: 'alert-triangle',
          message: `${doc.plantilla_nombre}: ${doc.comentario}`
        });
      } else if (this.isExpiringSoon(doc.fecha_vencimiento)) {
        const days = Math.ceil((new Date(doc.fecha_vencimiento!).getTime() - new Date().getTime()) / (86400000));
        alerts.push({
          type: 'warning',
          icon: 'alert-circle',
          message: `${doc.plantilla_nombre} vence en ${days} día(s)`
        });
      }
    });

    return alerts;
  }

  get progressPercentage(): number {
    if (!this.documentsTotal) return 0;
    return Math.round((this.documentsApproved / this.documentsTotal) * 100);
  }

  viewDocumentDetails(document: DashboardDocument): void {
    if (document.id_documento) {
      this.router.navigate(['/est-documentos'], { queryParams: { documento: document.id_documento } });
    } else {
      this.router.navigate(['/est-documentos'], { queryParams: { plantilla: document.id_plantilla } });
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

  navigateTo(route: string): void {
    this.currentRoute = route;
    this.router.navigate([route]);
  }

  getIcon(iconName: string): string {
    return ICONS_MAP[iconName] || ICONS_MAP['file-text'];
  }

  getIconPath(iconName: string): string {
    return this.getIcon(iconName);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['']);
  }
}