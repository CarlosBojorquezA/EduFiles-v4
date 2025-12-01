import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { AuthService } from '../../auth.service';
import { ProfDashboardService, DashboardStats } from '../../services/prof-dashboard.service';
import { environment } from '../../../environments/environment';
import { NotificationsComponent } from '../../notificaciones/notificaciones';

interface NavItem {
  icon: string;
  label: string;
  route: string;
  badge?: number;
}

// --- Constantes de Iconos ---
const ICONS_MAP: { [key: string]: string } = {
  'home': 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  'material': 'M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25',
  'file-text': 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8',
  'users': 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  'user': 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  'envelope': 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6',
  'paper-plane': 'M22 2L11 13 M22 2l-7 20-4-9-9-4 20-7z',
  'reply': 'M3 10h10a8 8 0 0 1 8 8v2M3 10l6 6M3 10l6-6'
};

@Component({
  selector: 'app-profesor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, NotificationsComponent],
  templateUrl: './prof-dashboard.html',
  styleUrls: ['./prof-dashboard.css']
})
export class ProfDashboardComponent implements OnInit {
  private apiUrl = environment.apiUrl;

  // Datos Usuario
  userRole: 'profesor' = 'profesor';
  userName: string = 'Profesor';
  userAccountNumber: string = '';
  userMateria: string = 'Cargando...';
  
  // Navegación
  notificationCount: number = 0;
  currentRoute: string = '/prof-dashboard';
  navigationItems: NavItem[] = [];

  // Estado
  loading: boolean = true;

  // Stats para la vista
  stats = [
    { value: 0, label: 'Sin leer', icon: 'envelope', colorClass: 'purple' },
    { value: 0, label: 'Estudiantes', icon: 'user', colorClass: 'green' },
    { value: 0, label: 'Total mensajes', icon: 'paper-plane', colorClass: 'blue' },
    { value: 0, label: 'Respondidos hoy', icon: 'reply', colorClass: 'orange' }
  ];

  quickActions = [
    'Responde a consultas de estudiantes',
    'Ayuda con documentos de apoyo',
    'Proporciona orientación académica'
  ];

  recentActivity = [
    { label: 'Mensajes respondidos hoy', value: '0' },
    { label: 'Estudiantes activos', value: '0' },
  ];

  constructor(
    private router: Router,
    private http: HttpClient,
    private authService: AuthService,
    private dashboardService: ProfDashboardService
  ) { }

  ngOnInit(): void {
    if (!this.checkAuth()) return;

    this.currentRoute = this.router.url;
    this.loadUserData();
    this.loadNavigation();
    this.loadAllData();
  }

  private checkAuth(): boolean {
    if (!localStorage.getItem('token')) {
      this.router.navigate(['']);
      return false;
    }
    return true;
  }

  loadUserData(): void {
    const userData = this.authService.getCurrentUser();
    if (userData) {
      const detalles = userData.detalles || {};
      this.userName = `${detalles.nombres || ''} ${detalles.apellido_paterno || ''}`.trim() || 'Profesor';
      this.userAccountNumber = userData.num_usuario || '';
    }
  }

  loadAllData(): void {
    this.loading = true;

    forkJoin({
      // Estadísticas del Servicio
      stats: this.dashboardService.getStats().pipe(
        catchError(err => {
          console.error('Error stats:', err);
          // Retornar objeto vacío en caso de error
          return of({ 
            mensajes_sin_leer: 0, 
            total_estudiantes: 0, 
            total_mensajes: 0, 
            mensajes_respondidos_hoy: 0,
            estudiantes_activos: 0,
            consultas_documentos: 0
          } as DashboardStats);
        })
      ),
      // Materias
      materias: this.http.get<string[]>(`${this.apiUrl}/profesores/mis-cursos`).pipe(
        catchError(() => of([]))
      ),
      //  Notificaciones
      notificaciones: this.http.get<{count: number}>(`${this.apiUrl}/notificaciones/no-leidas/count`).pipe(
        catchError(() => of({ count: 0 }))
      )
    }).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: (results) => {
        // --- Actualizar Materia
        this.userMateria = (results.materias && results.materias.length > 0) 
          ? results.materias[0] 
          : 'Sin materia asignada';

        // --- Actualizar Stats Cards 
        const s = results.stats;
        
        this.stats[0].value = s.mensajes_sin_leer || 0;        
        this.stats[1].value = s.total_estudiantes || 0;        
        this.stats[2].value = s.total_mensajes || 0;          
        this.stats[3].value = s.mensajes_respondidos_hoy || 0; 

        // --- Actualizar Actividad Reciente ---
        this.recentActivity[0].value = String(s.mensajes_respondidos_hoy || 0);
        this.recentActivity[1].value = String(s.estudiantes_activos || 0);

        // --- Notificaciones ---
        this.notificationCount = results.notificaciones.count || 0;
      }
    });
  }

  loadNavigation(): void {
    this.navigationItems = [
      { icon: 'home', label: 'Inicio', route: '/prof-dashboard', badge: 0 },
      { icon: 'material', label: 'Materiales', route: '/prof-materiales', badge: 0 },
      { icon: 'users', label: 'Estudiantes', route: '/prof-estudiantes', badge: 0 },
      { icon: 'user', label: 'Perfil', route: '/prof-perfil', badge: 0 }
    ];
  }

  irAlChat(): void {
    this.router.navigate(['/prof-estudiantes']);
  }

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