import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

interface Notificacion {
  id_notificacion: number;
  tipo: string;
  titulo: string;
  mensaje: string;
  leida: number;
  fecha_creacion: string;
  id_documento?: number;
  nombre_archivo?: string;
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notificaciones.html',
  styleUrls: ['./notificaciones.css']
})
export class NotificationsComponent implements OnInit {
  private apiUrl = 'http://localhost:5000/api';
  
  showNotifications = false;
  notifications: Notificacion[] = [];
  unreadCount = 0;
  userRole = '';
  isLoading = false;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserRole();
    this.loadNotifications();
    
    // Actualizar notificaciones cada 30 segundos
    setInterval(() => {
      this.loadUnreadCount();
    }, 30000);
  }

  loadUserRole(): void {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const user = JSON.parse(userData);
      this.userRole = user.rol || '';
    }
  }

  loadNotifications(): void {
    this.isLoading = true;
    
    this.http.get(`${this.apiUrl}/notificaciones?limit=10`).subscribe({
      next: (response: any) => {
        this.notifications = Array.isArray(response) ? response : [];
        this.unreadCount = this.notifications.filter(n => n.leida === 0).length;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error cargando notificaciones:', error);
        this.isLoading = false;
      }
    });
  }

  loadUnreadCount(): void {
    this.http.get(`${this.apiUrl}/notificaciones/no-leidas/count`).subscribe({
      next: (response: any) => {
        this.unreadCount = response.count || 0;
      },
      error: (error) => console.error('Error cargando contador:', error)
    });
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
    
    if (this.showNotifications) {
      this.loadNotifications();
    }
  }

  markAsRead(notification: Notificacion): void {
    if (notification.leida === 0) {
      this.http.put(
        `${this.apiUrl}/notificaciones/${notification.id_notificacion}/marcar-leida`,
        {}
      ).subscribe({
        next: () => {
          notification.leida = 1;
          this.unreadCount = Math.max(0, this.unreadCount - 1);
        },
        error: (error) => console.error('Error marcando como leída:', error)
      });
    }
  }

  markAllAsRead(): void {
    this.http.put(`${this.apiUrl}/notificaciones/marcar-todas-leidas`, {}).subscribe({
      next: () => {
        this.notifications.forEach(n => n.leida = 1);
        this.unreadCount = 0;
      },
      error: (error) => console.error('Error:', error)
    });
  }

  deleteNotification(notification: Notificacion, event: Event): void {
    event.stopPropagation();
    
    if (confirm('¿Eliminar esta notificación?')) {
      this.http.delete(`${this.apiUrl}/notificaciones/${notification.id_notificacion}`).subscribe({
        next: () => {
          this.notifications = this.notifications.filter(
            n => n.id_notificacion !== notification.id_notificacion
          );
          if (notification.leida === 0) {
            this.unreadCount = Math.max(0, this.unreadCount - 1);
          }
        },
        error: (error) => console.error('Error eliminando:', error)
      });
    }
  }

  handleNotificationClick(notification: Notificacion): void {
    this.markAsRead(notification);
    
    // Navegar según el tipo de notificación
    if (notification.tipo === 'DOCUMENTO_APROBADO' || 
        notification.tipo === 'DOCUMENTO_RECHAZADO' ||
        notification.tipo === 'DOCUMENTO_PENDIENTE') {
      
      if (this.userRole === 'ESTUDIANTE') {
        this.router.navigate(['/estudiante-documentos']);
      } else if (this.userRole === 'ADMINISTRADOR') {
        this.router.navigate(['/admin-documentos']);
      } else if (this.userRole === 'PROFESOR') {
        this.router.navigate(['/profesor-documentos']);
      }
    }
    
    this.showNotifications = false;
  }

  getNotificationIcon(tipo: string): string {
    const icons: { [key: string]: string } = {
      'DOCUMENTO_APROBADO': 'check-circle',
      'DOCUMENTO_RECHAZADO': 'x-circle',
      'DOCUMENTO_PENDIENTE': 'clock',
      'MENSAJE_NUEVO': 'mail',
      'ALERTA': 'alert-triangle'
    };
    return icons[tipo] || 'bell';
  }

  getNotificationColor(tipo: string): string {
    const colors: { [key: string]: string } = {
      'DOCUMENTO_APROBADO': '#10b981',
      'DOCUMENTO_RECHAZADO': '#ef4444',
      'DOCUMENTO_PENDIENTE': '#f59e0b',
      'MENSAJE_NUEVO': '#3b82f6',
      'ALERTA': '#f59e0b'
    };
    return colors[tipo] || '#6b7280';
  }

  getNotificationBgColor(tipo: string): string {
    const colors: { [key: string]: string } = {
      'DOCUMENTO_APROBADO': '#d1fae5',
      'DOCUMENTO_RECHAZADO': '#fee2e2',
      'DOCUMENTO_PENDIENTE': '#fef3c7',
      'MENSAJE_NUEVO': '#dbeafe',
      'ALERTA': '#fef3c7'
    };
    return colors[tipo] || '#f3f4f6';
  }

  getTimeAgo(fecha: string): string {
    const now = new Date();
    const notifDate = new Date(fecha);
    const diffMs = now.getTime() - notifDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Hace unos segundos';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const notificationBtn = target.closest('.notification-btn');
    const notificationPanel = target.closest('.notifications-panel');
    
    if (!notificationBtn && !notificationPanel && this.showNotifications) {
      this.showNotifications = false;
    }
  }
}
