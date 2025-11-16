import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

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

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboardComponent implements OnInit {
  private apiUrl = 'http://localhost:5000/api';
  
  userRole: string = 'administrador';
  userName: string = '';
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
    console.log('[DASHBOARD] Componente inicializado');
    this.loadUserData();
    this.loadNavigation();
    this.currentRoute = this.router.url;
    
    // Verificar token
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('[DASHBOARD] No hay token, redirigiendo a login');
      alert('Sesión expirada. Por favor inicia sesión nuevamente.');
      this.router.navigate(['']);
      return;
    }
    
    console.log('[DASHBOARD] Token verificado, cargando datos...');
    
    // Cargar datos después de un pequeño delay
    setTimeout(() => {
      this.loadDashboardData();
    }, 100);
  }

  loadUserData(): void {
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        
        if (user.detalles) {
          if (user.detalles.nombres) {
            this.userName = `${user.detalles.nombres} ${user.detalles.apellido_paterno || ''}`.trim();
          }
        }
        
        if (!this.userName) {
          this.userName = user.correo || user.num_usuario || 'Usuario';
        }
        
        this.userRole = (user.rol || 'ADMINISTRADOR').toLowerCase();
        console.log('[DASHBOARD] Usuario cargado:', this.userName, 'Rol:', this.userRole);
      } catch (e) {
        console.error('[DASHBOARD] Error parsing userData:', e);
        this.userName = 'Usuario';
      }
    } else {
      console.warn('[DASHBOARD] No hay userData en localStorage');
      this.userName = 'Usuario';
    }
  }

  loadDashboardData(): void {
    console.log('[DASHBOARD] Iniciando carga de datos...');
    this.isLoading = true;

    // ✅ Ya NO necesitas crear headers manualmente
    // El interceptor agrega automáticamente el Authorization header
    
    // Cargar estadísticas
    console.log('[DASHBOARD] Solicitando estadísticas...');
    this.http.get(`${this.apiUrl}/dashboard/admin/stats`).subscribe({
      next: (response: any) => {
        console.log('[DASHBOARD] Stats recibidas:', response);
        this.stats[0].value = response.total_estudiantes || 0;
        this.stats[1].value = response.documentos_pendientes || 0;
        this.stats[2].value = response.aprobados_hoy || 0;
        this.stats[3].value = response.rechazados_hoy || 0;
        console.log('[DASHBOARD] Stats actualizadas');
      },
      error: (error) => {
        console.error('[DASHBOARD] Error cargando stats:', error);
        console.error('[DASHBOARD] Status:', error.status);
        console.error('[DASHBOARD] Error completo:', error.error);
        
        if (error.status === 401 || error.status === 422) {
          alert('Token inválido o expirado. Por favor inicia sesión nuevamente.');
          localStorage.clear();
          this.router.navigate(['']);
        } else {
          alert('Error al cargar estadísticas. Por favor recarga la página.');
        }
      }
    });

    // Cargar alertas
    console.log('[DASHBOARD] Solicitando alertas...');
    this.http.get(`${this.apiUrl}/dashboard/admin/alerts`).subscribe({
      next: (response: any) => {
        console.log('[DASHBOARD] Alertas recibidas:', response);
        this.alerts = Array.isArray(response) ? response : [];
        console.log('[DASHBOARD] Total alertas:', this.alerts.length);
      },
      error: (error) => {
        console.error('[DASHBOARD] Error cargando alerts:', error);
        this.alerts = [];
      }
    });

    // Cargar actividad reciente
    console.log('[DASHBOARD] Solicitando actividad reciente...');
    this.http.get(`${this.apiUrl}/dashboard/admin/recent-activity?limit=10`).subscribe({
      next: (response: any) => {
        console.log('[DASHBOARD] Actividades recibidas:', response);
        this.recentActivities = Array.isArray(response) ? response : [];
        console.log('[DASHBOARD] Total actividades:', this.recentActivities.length);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('[DASHBOARD] Error cargando actividad:', error);
        this.recentActivities = [];
        this.isLoading = false;
      }
    });

    // Cargar notificaciones no leídas
    console.log('[DASHBOARD] Solicitando notificaciones...');
    this.http.get(`${this.apiUrl}/notificaciones/no-leidas/count`).subscribe({
      next: (response: any) => {
        console.log('[DASHBOARD] Notificaciones count:', response);
        this.notificationCount = response.count || 0;
      },
      error: (error) => {
        console.error('[DASHBOARD] Error cargando notificaciones:', error);
        this.notificationCount = 0;
      }
    });
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
    const icons: { [key: string]: string } = {
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
    return icons[iconName] || icons['file-text'];
  }

  logout(): void {
    console.log('[DASHBOARD] Cerrando sesión...');
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    this.router.navigate(['']);
  }
}