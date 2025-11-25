import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EstudiantesProfesorService, Estudiante, MensajeProfesor } from '../../services/estudiantes-profesor.service';
import { AuthService } from '../../auth.service';
import { NotificationsComponent } from '../../notificaciones/notificaciones';
import { interval } from 'rxjs';

interface NavItem {
  icon: string;
  label: string;
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-prof-chat-estudiantes',
  standalone: true,
  imports: [CommonModule, FormsModule, NotificationsComponent],
  templateUrl: './prof-chat-estudiantes.html',
  styleUrls: ['./prof-chat-estudiantes.css']
})
export class ProfChatEstudiantesComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  userName: string = '';
  userAccountNumber: string = '';
  userMateria: string = '';
  currentRoute: string = '/prof-chat-estudiantes';

  idEstudiante: number = 0;
  estudiante: Estudiante | null = null;
  mensajes: MensajeProfesor[] = [];
  newMessage: string = '';

  currentPage: number = 1;
  totalPages: number = 1;

  navigationItems: NavItem[] = [];
  isLoading: boolean = true;
  isSending: boolean = false;
  shouldScrollToBottom: boolean = false;

  // Para el header dinámico
  isHeaderScrolled: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private estudiantesService: EstudiantesProfesorService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.loadNavigation();
    
    this.route.params.subscribe(params => {
      this.idEstudiante = +params['id'];
      if (this.idEstudiante) {
        this.loadEstudianteData();
        this.loadMensajes();
        
        // Polling cada 5 segundos
        interval(5000).subscribe(() => {
          this.loadMensajes(false);
        });
      }
    });
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  // Detectar scroll para header dinámico
  @HostListener('window:scroll') 
    onWindowScroll() {
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    this.isHeaderScrolled = scrollPosition > 10;
}

  loadUserData(): void {
    const user = this.authService.getCurrentUser();
    if (user && user.detalles) {
      const detalles = user.detalles;
      this.userName = `${detalles.nombres} ${detalles.apellido_paterno} ${detalles.apellido_materno || ''}`.trim();
      this.userAccountNumber = user.num_usuario;
      this.userMateria = detalles.departamento || 'Profesor';
    }
  }

  loadNavigation(): void {
    this.navigationItems = [
      { icon: 'home', label: 'Inicio', route: '/prof-dashboard', badge: 0 },
      { icon: 'material', label: 'Materiales', route: '/prof-materiales', badge: 0 },
      { icon: 'users', label: 'Estudiantes', route: '/prof-estudiantes', badge: 0 },
      { icon: 'user', label: 'Perfil', route: '/prof-perfil', badge: 0 }
    ];
  }

  loadEstudianteData(): void {
    this.estudiantesService.getDetalleEstudiante(this.idEstudiante).subscribe({
      next: (estudiante) => {
        console.log('[PROF-CHAT] Datos del estudiante:', estudiante);
        this.estudiante = estudiante;
      },
      error: (error) => {
        console.error('[PROF-CHAT] Error cargando estudiante:', error);
        alert('Error al cargar datos del estudiante');
        this.backToList();
      }
    });
  }

  loadMensajes(showLoading: boolean = true): void {
    if (showLoading) {
      this.isLoading = true;
    }

    this.estudiantesService.getMensajesChat(this.idEstudiante).subscribe({
      next: (mensajes) => {
        console.log('[PROF-CHAT] Mensajes recibidos:', mensajes);
        
        const mensajesAntesCount = this.mensajes.length;
        this.mensajes = mensajes;
        
        if (mensajes.length > mensajesAntesCount) {
          this.shouldScrollToBottom = true;
        }
        
        this.totalPages = Math.ceil(mensajes.length / 20) || 1;
        this.currentPage = this.totalPages;
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('[PROF-CHAT] Error cargando mensajes:', error);
        this.isLoading = false;
      }
    });
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || this.isSending) {
      return;
    }

    const mensajeTexto = this.newMessage.trim();
    this.isSending = true;

    console.log('[PROF-CHAT] Enviando mensaje:', mensajeTexto);

    this.estudiantesService.enviarMensaje(this.idEstudiante, mensajeTexto).subscribe({
      next: (response) => {
        console.log('[PROF-CHAT] Mensaje enviado:', response);
        
        this.newMessage = '';
        this.loadMensajes(false);
        this.shouldScrollToBottom = true;
        this.isSending = false;
      },
      error: (error) => {
        console.error('[PROF-CHAT] Error enviando mensaje:', error);
        alert('Error al enviar el mensaje. Intenta de nuevo.');
        this.isSending = false;
      }
    });
  }

  // Formato de hora mejorado (HH:MM)
  formatTime(timestamp: string): string {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${hours}:${minutes}`;
  }

  // Formato de fecha para el indicador de página
  formatMessageDate(timestamp: string): string {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Si es hoy
    if (date.toDateString() === today.toDateString()) {
      return 'Hoy';
    }
    
    // Si es ayer
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Ayer';
    }
    
    // Si es otra fecha
    const day = date.getDate();
    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const currentYear = today.getFullYear();
    
    // Si es del mismo año, no mostrar el año
    if (year === currentYear) {
      return `${day} ${month}`;
    }
    
    return `${day} ${month} ${year}`;
  }

  // Obtener fecha del primer mensaje visible (para el indicador)
  getConversationDate(): string {
    if (this.mensajes.length === 0) return '';
    
    // Tomar el mensaje más reciente
    const ultimoMensaje = this.mensajes[this.mensajes.length - 1];
    return this.formatMessageDate(ultimoMensaje.fecha_envio);
  }

  // Determinar estado de conexión
  getEstadoConexion(): 'En línea' | 'Desconectado' {
    if (!this.estudiante || this.mensajes.length === 0) return 'Desconectado';
    
    const ultimoMensaje = this.mensajes[this.mensajes.length - 1];
    if (ultimoMensaje.tipo === 'enviado') return 'Desconectado';
    
    const fecha = new Date(ultimoMensaje.fecha_envio);
    const ahora = new Date();
    const diffMinutos = Math.floor((ahora.getTime() - fecha.getTime()) / 60000);
    
    return diffMinutos < 10 ? 'En línea' : 'Desconectado';
  }

  scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop = 
          this.messagesContainer.nativeElement.scrollHeight;
      }
    } catch(err) {
      console.error('Error scrolling to bottom:', err);
    }
  }

  backToList(): void {
    this.router.navigate(['/prof-estudiantes']);
  }

  navigateTo(route: string): void {
    this.currentRoute = route;
    this.router.navigate([route]);
  }

  getIcon(iconName: string): string {
    const icons: { [key: string]: string } = {
      'home': 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
      'material': 'M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25',
      'users': 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
      'user': 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z'
    };
    return icons[iconName] || icons['users'];
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['']);
  }
}