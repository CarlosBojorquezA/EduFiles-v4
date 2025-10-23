import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

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
  userRole: 'administrador' | 'estudiante' | 'profesor' = 'administrador';
  userName: string = 'Carlos Rodríguez';
  notificationCount: number = 3;
   currentRoute: string = '/dashboard';

  stats: StatCard[] = [
    { icon: 'users', value: 156, label: 'Estudiantes', color: '#3b82f6' },
    { icon: 'clock', value: 23, label: 'Pendientes', color: '#f59e0b' },
    { icon: 'check', value: 12, label: 'Aprobados hoy', color: '#10b981' },
    { icon: 'x-circle', value: 3, label: 'Rechazados hoy', color: '#ef4444' }
  ];

  alerts: Alert[] = [
    { message: '5 documentos vencen en 24 horas', severity: 'urgent', bgColor: '#fef3c7' },
    { message: '2 estudiantes sin documentos requeridos', severity: 'critical', bgColor: '#fee2e2' }
  ];

  recentActivities: Activity[] = [
    { icon: 'file-text', message: 'María García subió Certificado de Nacimiento', time: 'hace 2 min', iconColor: '#3b82f6' },
    { icon: 'check-circle', message: 'Aprobaste Constancia de Estudios de Juan Pérez', time: 'hace 15 min', iconColor: '#10b981' },
    { icon: 'x-circle', message: 'Rechazaste Comprobante de Domicilio de Ana López', time: 'hace 1 hora', iconColor: '#ef4444' },
    { icon: 'user-plus', message: 'Carlos Mendoza se registró en el sistema', time: 'hace 2 horas', iconColor: '#8b5cf6' }
  ];

  // Navegación dinámica según el rol
  navigationItems: NavItem[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadNavigationByRole();
    this.currentRoute = this.router.url;
  }

  loadNavigationByRole(): void {
    const navigationConfig = {
      administrador: [
        { icon: 'home', label: 'Inicio', route: '/admin-dashboard', badge: 0 },
        { icon: 'clock', label: 'Pendientes', route: '/admin-pendientes', badge: 23 },
        { icon: 'folder', label: 'Gestión', route: '/admin-gestion', badge: 0 },
        { icon: 'user', label: 'Perfil', route: '/admin-perfil', badge: 0 }
      ],
      estudiante: [
        { icon: 'home', label: 'Inicio', route: '/est-dashboard', badge: 0 },
        { icon: 'upload', label: 'Documentos', route: '/est-documentos', badge: 0 },
        { icon: 'clock', label: 'Pendientes', route: '/est-pendientes', badge: 5 },
        { icon: 'user', label: 'Perfil', route: '/est-perfil', badge: 0 }
      ],
      profesor: [
        { icon: 'home', label: 'Inicio', route: '/prof-dashboard', badge: 0 },
        { icon: 'users', label: 'Estudiantes', route: '/prof-MensEstudiantes', badge: 0 },
        { icon: 'clock', label: 'Pendientes', route: '/prof-MensPendientes', badge: 12 },
        { icon: 'user', label: 'Perfil', route: '/est-perfil', badge: 0 }
      ]
    };

    this.navigationItems = navigationConfig[this.userRole];
  }

  navigateTo(route: string): void {
    this.currentRoute = route;
    this.router.navigate([route]);
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