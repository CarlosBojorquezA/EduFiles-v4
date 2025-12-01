import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { NotificationsComponent } from '../../notificaciones/notificaciones';
import { environment } from '../../../environments/environment.development';

interface StatCard {
  icon: string;
  value: number;
  label: string;
  color: string;
}

interface Alert {
  message: string;
  severity: 'urgent' | 'critical';
  bgColor: string;
}

interface Activity {
  icon: string;
  message: string;
  time: string;
  iconColor: string;
}

interface NavItem {
  icon: string;
  label: string;
  route: string;
  badge?: number;
}

interface DashboardStatsResponse {
  total_estudiantes: number;
  documentos_pendientes: number;
  aprobados_hoy: number;
  rechazados_hoy: number;
}

interface NotificationCountResponse {
  count: number;
}

const ICONS_MAP: { [key: string]: string } = {
  'home': 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  'clock': 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 6v6l4 2',
  'check': 'M20 6L9 17l-5-5',
  'x-circle': 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM15 9l-6 6M9 9l6 6',
  'search': 'M11 2a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM21 21l-4.35-4.35',
  'folder': 'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z',
  'user': 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  'users': 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  'upload': 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12',
  'file-text': 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8',
  'check-circle': 'M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-3',
  'user-plus': 'M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M13 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM20 8v6M23 11h-6',
  'trash': 'M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2'
};

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, NotificationsComponent],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboardComponent implements OnInit {
  private apiUrl = environment.apiUrl;
  
  userRole: string = 'administrador';
  userName: string = 'Usuario';
  notificationCount: number = 0;
  currentRoute: string = '/admin-dashboard';
  isLoading: boolean = false;

  stats: StatCard[] = [
    { icon: 'users', value: 0, label: 'Estudiantes', color: '#3b82f6' },
    { icon: 'clock', value: 0, label: 'Pendientes', color: '#f59e0b' },
    { icon: 'check', value: 0, label: 'Aprobados hoy', color: '#10b981' },
    { icon: 'x-circle', value: 0, label: 'Rechazados hoy', color: '#ef4444' }
  ];

  alerts: Alert[] = [];
  recentActivities: Activity[] = [];
  navigationItems: NavItem[] = [];

  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    if (!this.checkAuth()) return;
    
    console.log('[DASHBOARD] Inicializando...');
    this.currentRoute = this.router.url;
    this.loadUserData();
    this.loadNavigation();
    this.loadDashboardData();
  }

  private checkAuth(): boolean {
    const token = localStorage.getItem('token');
    if (!token) {
      this.handleAuthError('Sesión expirada. Por favor inicia sesión nuevamente.');
      return false;
    }
    return true;
  }

  loadUserData(): void {
    const userDataStr = localStorage.getItem('userData');
    if (!userDataStr) {
      console.warn('[DASHBOARD] No hay userData en localStorage');
      return;
    }

    try {
      const user = JSON.parse(userDataStr);
      const nombre = user.detalles?.nombres;
      const apellido = user.detalles?.apellido_paterno || '';
      
      this.userName = nombre ? `${nombre} ${apellido}`.trim() : (user.correo || user.num_usuario || 'Usuario');
      this.userRole = (user.rol || 'ADMINISTRADOR').toLowerCase();
      
      console.log('[DASHBOARD] Usuario:', this.userName, '| Rol:', this.userRole);
    } catch (e) {
      console.error('[DASHBOARD] Error parsing userData:', e);
    }
  }

  loadDashboardData(): void {
    this.isLoading = true;
    console.log('[DASHBOARD] Cargando datos en paralelo...');

    // forkJoin ejecuta todas las peticiones simultáneamente
    forkJoin({
      stats: this.http.get<DashboardStatsResponse>(`${this.apiUrl}/dashboard/admin/stats`)
        .pipe(catchError(err => {
          this.handleApiError(err, 'stats');
          return of(null); // Devuelve null para que no falle todo el forkJoin
        })),
        
      alerts: this.http.get<Alert[]>(`${this.apiUrl}/dashboard/admin/alerts`)
        .pipe(catchError(err => {
          console.error('Error alerts:', err);
          return of([]); // Devuelve array vacío si falla
        })),

      activities: this.http.get<Activity[]>(`${this.apiUrl}/dashboard/admin/recent-activity?limit=10`)
        .pipe(catchError(err => {
          console.error('Error activities:', err);
          return of([]);
        })),

      notifications: this.http.get<NotificationCountResponse>(`${this.apiUrl}/notificaciones/no-leidas/count`)
        .pipe(catchError(err => {
          console.error('Error notificaciones:', err);
          return of({ count: 0 });
        }))
    }).pipe(
      finalize(() => this.isLoading = false) // Se ejecuta siempre al final, éxito o error
    ).subscribe({
      next: (results) => {
        // Actualizar Estadísticas
        if (results.stats) {
          this.stats[0].value = results.stats.total_estudiantes || 0;
          this.stats[1].value = results.stats.documentos_pendientes || 0;
          this.stats[2].value = results.stats.aprobados_hoy || 0;
          this.stats[3].value = results.stats.rechazados_hoy || 0;
        }

        // Actualizar Alertas
        this.alerts = Array.isArray(results.alerts) ? results.alerts : [];

        // Actualizar Actividad
        this.recentActivities = Array.isArray(results.activities) ? results.activities : [];

        // Actualizar Notificaciones
        this.notificationCount = results.notifications?.count || 0;
        
        console.log('[DASHBOARD] Datos actualizados correctamente');
      }
    });
  }

  verDetalleEstadistica(tipo: string): void {
    const tabMap: { [key: string]: string } = {
      'aprobados': 'aprobados',
      'pendientes': 'pendientes'
    };

    if (tabMap[tipo]) {
      this.router.navigate(['/admin-documentos'], { 
        queryParams: { tab: tabMap[tipo] } 
      });
    }
  }

  loadNavigation(): void {
    this.navigationItems = [
      { icon: 'home', label: 'Inicio', route: '/admin-dashboard', badge: 0 },
      { icon: 'file-text', label: 'Documentos', route: '/admin-documentos', badge: 0 },
      { icon: 'folder', label: 'Gestión', route: '/admin-gestion', badge: 0 },
      { icon: 'user', label: 'Perfil', route: '/admin-perfil', badge: 0 }
    ];
  }

  navigateTo(route: string): void {
    this.currentRoute = route;
    this.router.navigate([route]);
  }

  getIcon(iconName: string): string {
    return ICONS_MAP[iconName] || ICONS_MAP['file-text'];
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    this.router.navigate(['']);
  }

  private handleAuthError(msg: string): void {
    alert(msg);
    this.logout();
  }

  private handleApiError(error: any, context: string): void {
    console.error(`[DASHBOARD] Error en ${context}:`, error);
    if (error.status === 401 || error.status === 422) {
      this.handleAuthError('Sesión expirada.');
    }
  }
}