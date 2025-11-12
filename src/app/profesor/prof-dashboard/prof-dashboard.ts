import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

interface NavItem {
  icon: string;
  label: string;
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-profesor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './prof-dashboard.html',
  styleUrls: ['./prof-dashboard.css']
})
export class ProfDashboardComponent {
  userRole: 'Profesor' = 'Profesor';
  userName: string = 'Jose Orozco';
  userAccountNumber: string = '2024001234';
  userMateria: string = 'Angular';
  notificationCount: number = 3;
  currentRoute: string = '/prof-dashboard';

  // Datos para las tarjetas de estadísticas
  stats = [
    { value: 4, label: 'Sin leer', icon: 'fa-regular fa-envelope', colorClass: 'purple' },
    { value: 45, label: 'Estudiantes', icon: 'fa-regular fa-user', colorClass: 'green' },
    { value: 12, label: 'Total mensajes', icon: 'fa-regular fa-paper-plane', colorClass: 'blue' },
    { value: 8, label: 'Respondidos hoy', icon: 'fa-solid fa-reply', colorClass: 'orange' }
  ];

  // Datos para la lista de acciones rápidas
  quickActions = [
    'Responde a consultas de estudiantes',
    'Ayuda con documentos rechazados',
    'Proporciona orientación académica'
  ];

  // Datos para la actividad reciente
  recentActivity = [
    { label: 'Mensajes respondidos hoy', value: '8' },
    { label: 'Estudiantes activos', value: '23' },
    { label: 'Consultas sobre documentos', value: '15' },
  ];

  navigationItems: NavItem[] = [];

  constructor(private router: Router) { }

  irAlChat(): void {
    this.router.navigate(['/prof-chat-estudiantes']);
  }

  ngOnInit(): void {
    this.loadNavigation();
    this.currentRoute = this.router.url;
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
      'users': 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
      'user': 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
      'alert-triangle': 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01',
      'alert-circle': 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M12 8v4 M12 16h.01',
      'check-circle': 'M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4L12 14.01l-3-3',
      'x-circle': 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M15 9l-6 6 M9 9l6 6'
    };
    return icons[iconName] || icons['file-text'];
  }

  logout(): void {
    this.router.navigate(['']);
  }

}