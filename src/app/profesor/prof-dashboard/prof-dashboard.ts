import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../auth.service';
import { NotificationsComponent } from '../../notificaciones/notificaciones';

interface NavItem {
  icon: string;
  label: string;
  route: string;
  badge?: number;
}

interface DashboardStats {
  sin_leer: number;
  estudiantes: number;
  total_mensajes: number;
  respondidos_hoy: number;
}

@Component({
  selector: 'app-profesor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, NotificationsComponent],
  templateUrl: './prof-dashboard.html',
  styleUrls: ['./prof-dashboard.css']
})
export class ProfDashboardComponent implements OnInit {
  private apiUrl = 'http://localhost:5000/api';
  
  userRole: 'Profesor' = 'Profesor';
  userName: string = '';
  userAccountNumber: string = '';
  userMateria: string = 'Angular';
  notificationCount: number = 0;
  currentRoute: string = '/prof-dashboard';

  // Stats dinámicas
  stats = [
    { value: 0, label: 'Sin leer', icon: 'fa-regular fa-envelope', colorClass: 'purple' },
    { value: 0, label: 'Estudiantes', icon: 'fa-regular fa-user', colorClass: 'green' },
    { value: 0, label: 'Total mensajes', icon: 'fa-regular fa-paper-plane', colorClass: 'blue' },
    { value: 0, label: 'Respondidos hoy', icon: 'fa-solid fa-reply', colorClass: 'orange' }
  ];

  quickActions = [
    'Responde a consultas de estudiantes',
    'Ayuda con documentos rechazados',
    'Proporciona orientación académica'
  ];

  recentActivity = [
    { label: 'Mensajes respondidos hoy', value: '0' },
    { label: 'Estudiantes activos', value: '0' },
    { label: 'Consultas sobre documentos', value: '0' },
  ];

  navigationItems: NavItem[] = [];
  loading: boolean = true;

  constructor(
    private router: Router,
    private http: HttpClient,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadUserData();
    this.loadDashboardStats();
    this.loadNavigation();
    this.currentRoute = this.router.url;
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  loadUserData(): void {
    const userData = this.authService.getCurrentUser();
    if (userData) {
      const detalles = userData.detalles || {};
      this.userName = `${detalles.nombres || ''} ${detalles.apellido_paterno || ''}`.trim() || 'Usuario';
      this.userAccountNumber = userData.num_usuario || '';
      
      // Obtener materia principal del profesor
      this.getMateriaProfesor();
    }
  }

  getMateriaProfesor(): void {
    this.http.get<any>(`${this.apiUrl}/profesores/mis-cursos`, {
      headers: this.getAuthHeaders()
    }).subscribe({
      next: (cursos: string[]) => {
        if (cursos && cursos.length > 0) {
          this.userMateria = cursos[0]; // Primera materia
        }
      },
      error: (error) => console.error('Error cargando materias:', error)
    });
  }

  loadDashboardStats(): void {
    this.loading = true;
    
    // Stats del profesor
    this.http.get<any>(`${this.apiUrl}/dashboard/profesor/stats`, {
      headers: this.getAuthHeaders()
    }).subscribe({
      next: (data) => {
        console.log('[DASHBOARD] Stats recibidas:', data);
        
        // Actualizar stats - Usar datos reales de mensajes
        this.stats[0].value = data.mensajes_sin_leer || 0; // Mensajes sin leer
        this.stats[1].value = data.total_estudiantes || 0; // Total estudiantes
        this.stats[2].value = data.total_mensajes || 0; // Total mensajes
        this.stats[3].value = data.mensajes_respondidos_hoy || 0; // Respondidos hoy
        
        // Actualizar actividad reciente
        this.recentActivity[0].value = String(data.mensajes_respondidos_hoy || 0);
        this.recentActivity[1].value = String(data.estudiantes_activos || 0);
        this.recentActivity[2].value = String(data.consultas_documentos || 0);
        
        this.loading = false;
      },
      error: (error) => {
        console.error('[DASHBOARD] Error cargando stats:', error);
        this.loading = false;
      }
    });
    
    // Notificaciones no leídas
    this.http.get<any>(`${this.apiUrl}/notifications/no-leidas/count`, {
      headers: this.getAuthHeaders()
    }).subscribe({
      next: (data) => {
        this.notificationCount = data.count || 0;
      },
      error: (error) => console.error('Error cargando notificaciones:', error)
    });
  }

  irAlChat(): void {
    this.router.navigate(['/prof-estudiantes']);
  }

  loadNavigation(): void {
    this.navigationItems = [
      { icon: 'home', label: 'Inicio', route: '/prof-dashboard', badge: 0 },
      { icon: 'material', label: 'Materiales', route: '/prof-materiales', badge: 0 },
      { icon: 'file-text', label: 'Chat-Estudiantes', route: '/prof-estudiantes', badge: 0 },
      { icon: 'user', label: 'Perfil', route: '/prof-perfil', badge: 0 }
    ];
  }

  navigateTo(route: string): void {
    this.currentRoute = route;
    this.router.navigate([route]);
  }

  getIcon(iconName: string): string {
    const icons: { [key: string]: string } = {
      'home': 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
      'material': 'M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25',
      'file-text': 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8',
      'user': 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z'
    };
    return icons[iconName] || icons['file-text'];
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['']);
  }
}