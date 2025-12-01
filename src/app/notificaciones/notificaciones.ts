import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

export interface Notificacion {
  id_notificacion: number;
  tipo: string;
  titulo: string;
  mensaje: string;
  leida: number;
  fecha_creacion: string;
  id_documento?: number;
  nombre_archivo?: string;
}

const NOTIFICATION_CONFIG: { [key: string]: { icon: string, color: string, bg: string } } = {
  'DOCUMENTO_APROBADO': { icon: 'check-circle', color: '#10b981', bg: '#d1fae5' },
  'DOCUMENTO_RECHAZADO': { icon: 'x-circle', color: '#ef4444', bg: '#fee2e2' },
  'DOCUMENTO_PENDIENTE': { icon: 'clock', color: '#f59e0b', bg: '#fef3c7' },
  'MENSAJE_NUEVO': { icon: 'mail', color: '#3b82f6', bg: '#dbeafe' },
  'ALERTA': { icon: 'alert-triangle', color: '#f59e0b', bg: '#fef3c7' },
  'default': { icon: 'bell', color: '#6b7280', bg: '#f3f4f6' }
};

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notificaciones.html',
  styleUrls: ['./notificaciones.css']
})
export class NotificationsComponent implements OnInit, OnDestroy {
  private apiUrl = environment.apiUrl;
  
  showNotifications = false;
  notifications: Notificacion[] = [];
  unreadCount = 0;
  userRole = '';
  isLoading = false;

  private intervalId: any;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserRole();
    this.loadNotifications();
    
    // Actualizar contador cada 30s
    this.intervalId = setInterval(() => {
      this.loadUnreadCount();
    }, 30000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  loadUserRole(): void {
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        this.userRole = (user.rol || '').toUpperCase();
      } catch (e) {
        console.error('Error parsing user data');
      }
    }
  }

  loadNotifications(): void {
    this.isLoading = true;
    this.http.get<Notificacion[]>(`${this.apiUrl}/notificaciones?limit=10`).subscribe({
      next: (response) => {
        this.notifications = Array.isArray(response) ? response : [];
        this.unreadCount = this.notifications.filter(n => n.leida === 0).length;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading notifications:', err);
        this.isLoading = false;
      }
    });
  }

  loadUnreadCount(): void {
    this.http.get<{count: number}>(`${this.apiUrl}/notificaciones/no-leidas/count`).subscribe({
      next: (res) => {
        this.unreadCount = res.count || 0;
      },
      error: (err) => console.error('Error loading count:', err)
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
      notification.leida = 1;
      this.unreadCount = Math.max(0, this.unreadCount - 1);

      this.http.put(`${this.apiUrl}/notificaciones/${notification.id_notificacion}/marcar-leida`, {}).subscribe({
        error: () => {
          // Revertir si falla
          notification.leida = 0;
          this.unreadCount++;
        }
      });
    }
  }

  markAllAsRead(): void {
    const previousState = [...this.notifications]; 
    this.notifications.forEach(n => n.leida = 1);
    this.unreadCount = 0;

    this.http.put(`${this.apiUrl}/notificaciones/marcar-todas-leidas`, {}).subscribe({
      error: () => {
        this.notifications = previousState;
        this.unreadCount = this.notifications.filter(n => n.leida === 0).length;
      }
    });
  }

  deleteNotification(notification: Notificacion, event: Event): void {
    event.stopPropagation();
    
    if (confirm('¿Eliminar esta notificación?')) {
      this.http.delete(`${this.apiUrl}/notificaciones/${notification.id_notificacion}`).subscribe({
        next: () => {
          this.notifications = this.notifications.filter(n => n.id_notificacion !== notification.id_notificacion);
          if (notification.leida === 0) {
            this.unreadCount = Math.max(0, this.unreadCount - 1);
          }
        },
        error: (err) => console.error('Error deleting:', err)
      });
    }
  }

  handleNotificationClick(notification: Notificacion): void {
    this.markAsRead(notification);
    this.showNotifications = false;
    
    // Navegación inteligente basada en rol y tipo
    const tipo = notification.tipo;
    
    if (['DOCUMENTO_APROBADO', 'DOCUMENTO_RECHAZADO', 'DOCUMENTO_PENDIENTE'].includes(tipo)) {
      switch (this.userRole) {
        case 'ESTUDIANTE': this.router.navigate(['/est-documentos']); break;
        case 'ADMINISTRADOR': this.router.navigate(['/admin-documentos']); break;
      }
    } else if (tipo === 'MENSAJE_NUEVO') {
       // Si es mensaje, ir al chat correspondiente
       if (this.userRole === 'ESTUDIANTE') this.router.navigate(['/est-profesores']);
       else if (this.userRole === 'PROFESOR') this.router.navigate(['/prof-estudiantes']);
    }
  }

  getNotificationIcon(tipo: string): string {
    return (NOTIFICATION_CONFIG[tipo] || NOTIFICATION_CONFIG['default']).icon;
  }

  getNotificationColor(tipo: string): string {
    return (NOTIFICATION_CONFIG[tipo] || NOTIFICATION_CONFIG['default']).color;
  }

  getNotificationBgColor(tipo: string): string {
    return (NOTIFICATION_CONFIG[tipo] || NOTIFICATION_CONFIG['default']).bg;
  }

  getTimeAgo(fecha: string): string {
    const now = new Date();
    const notifDate = new Date(fecha);
    const diffMs = now.getTime() - notifDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Hace ${diffHours} h`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `Hace ${diffDays} d`;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const clickedInside = target.closest('.notifications-panel') || target.closest('.notification-btn');
    
    if (!clickedInside && this.showNotifications) {
      this.showNotifications = false;
    }
  }
}
