import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProfesoresService, Profesor, Mensaje } from '../../services/profesores.service';
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
  selector: 'app-est-profesores-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, NotificationsComponent],
  templateUrl: './est-profesores-chat.html',
  styleUrls: ['./est-profesores-chat.css']
})
export class EstProfesoresChatComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  userRole: 'estudiante' = 'estudiante';
  userName: string = '';
  userAccountNumber: string = '';
  userCareer: string = '';
  userGradeGroup: string = '';
  currentRoute: string = '/est-profesores-chat';
  notificationCount: number = 0;

  idProfesor: number = 0;
  profesor: Profesor | null = null;
  mensajes: Mensaje[] = [];
  newMessage: string = '';

  currentPage: number = 1;
  totalPages: number = 1;

  navigationItems: NavItem[] = [];
  isLoading: boolean = true;
  isSending: boolean = false;
  shouldScrollToBottom: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private profesoresService: ProfesoresService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.loadNavigation();
    
    this.route.params.subscribe(params => {
      this.idProfesor = +params['id'];
      if (this.idProfesor) {
        this.loadProfesorData();
        this.loadMensajes();
        
        // Polling para actualizar mensajes cada 5 segundos
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

  loadUserData(): void {
    const user = this.authService.getCurrentUser();
    if (user && user.detalles) {
      const detalles = user.detalles;
      this.userName = `${detalles.nombres} ${detalles.apellido_paterno} ${detalles.apellido_materno || ''}`.trim();
      this.userAccountNumber = user.num_usuario;
      
      if (detalles.grado) {
        this.userGradeGroup = `${detalles.grado}°`;
        if (detalles.grupo_turno) {
          this.userGradeGroup += ` ${detalles.grupo_turno}`;
        }
      }
      
      this.userCareer = detalles.nivel_educativo || 'Estudiante';
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

  loadProfesorData(): void {
    this.profesoresService.getDetalleProfesor(this.idProfesor).subscribe({
      next: (profesor) => {
        console.log('[CHAT] Datos del profesor:', profesor);
        this.profesor = profesor;
      },
      error: (error) => {
        console.error('[CHAT] Error cargando profesor:', error);
        alert('Error al cargar datos del profesor');
        this.backToList();
      }
    });
  }

  loadMensajes(showLoading: boolean = true): void {
    if (showLoading) {
      this.isLoading = true;
    }

    this.profesoresService.getMensajesChat(this.idProfesor).subscribe({
      next: (mensajes) => {
        console.log('[CHAT] Mensajes recibidos:', mensajes);
        
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
        console.error('[CHAT] Error cargando mensajes:', error);
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

    console.log('[CHAT] Enviando mensaje:', mensajeTexto);

    this.profesoresService.enviarMensaje(this.idProfesor, mensajeTexto).subscribe({
      next: (response) => {
        console.log('[CHAT] Mensaje enviado:', response);
        
        this.newMessage = '';
        this.loadMensajes(false);
        this.shouldScrollToBottom = true;
        this.isSending = false;
      },
      error: (error) => {
        console.error('[CHAT] Error enviando mensaje:', error);
        alert('Error al enviar el mensaje. Intenta de nuevo.');
        this.isSending = false;
      }
    });
  }

  formatTime(timestamp: string): string {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${hours}:${minutes}`;
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
    this.router.navigate(['/est-profesores']);
  }

  navigateTo(route: string): void {
    this.currentRoute = route;
    this.router.navigate([route]);
  }

  getIcon(iconName: string): string {
    const icons: { [key: string]: string } = {
      'home': 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
      'file-text': 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8',
      'material': 'M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25',
      'users': 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
      'user': 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z'
    };
    return icons[iconName] || icons['file-text'];
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['']);
  }
}
