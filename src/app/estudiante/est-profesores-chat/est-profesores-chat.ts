import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription, interval } from 'rxjs';
import { ProfesoresService, Profesor, Mensaje } from '../../services/profesores.service';
import { AuthService } from '../../auth.service';
import { NotificationsComponent } from '../../notificaciones/notificaciones';

interface NavItem {
  icon: string;
  label: string;
  route: string;
  badge?: number;
}

interface MessageGroup {
  date: string;
  messages: Mensaje[];
}

// --- Constantes
const ICONS_MAP: { [key: string]: string } = {
  'home': 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  'file-text': 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8',
  'material': 'M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25',
  'users': 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  'user': 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z'
};

@Component({
  selector: 'app-est-profesores-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, NotificationsComponent],
  providers: [DatePipe],
  templateUrl: './est-profesores-chat.html',
  styleUrls: ['./est-profesores-chat.css']
})
export class EstProfesoresChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  // Datos Usuario
  userRole: 'estudiante' = 'estudiante';
  userName: string = '';
  userAccountNumber: string = '';
  userCareer: string = '';
  userGradeGroup: string = '';
  
  // Navegación
  currentRoute: string = '/est-profesores-chat';
  navigationItems: NavItem[] = [];

  // Datos del Chat
  idProfesor: number = 0;
  profesor: Profesor | null = null;
  mensajes: Mensaje[] = [];     
  groupedMessages: MessageGroup[] = [];
  
  newMessage: string = '';

  // Estado
  isLoading: boolean = true;
  isSending: boolean = false;
  private shouldScrollToBottom: boolean = false;
  private pollingSubscription: Subscription | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private profesoresService: ProfesoresService,
    private authService: AuthService,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    if (!this.checkAuth()) return;

    this.loadUserData();
    this.loadNavigation();
    
    this.route.params.subscribe(params => {
      this.idProfesor = +params['id'];
      if (this.idProfesor) {
        this.loadProfesorData();
        this.loadMensajes();
        
        if (this.pollingSubscription) {
          this.pollingSubscription.unsubscribe();
        }
        this.pollingSubscription = interval(3000).subscribe(() => {
          this.loadMensajes(false);
        });
      }
    });
  }

  ngOnDestroy(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  private checkAuth(): boolean {
    if (!localStorage.getItem('token')) {
      this.router.navigate(['']);
      return false;
    }
    return true;
  }

  loadUserData(): void {
    const user = this.authService.getCurrentUser();
    if (user && user.detalles) {
      const d = user.detalles;
      this.userName = `${d.nombres} ${d.apellido_paterno} ${d.apellido_materno || ''}`.trim();
      this.userAccountNumber = user.num_usuario;
      this.userCareer = d.nivel_educativo || 'Estudiante';
      
      this.userGradeGroup = d.grado ? `${d.grado}°` : '';
      if (d.grupo_turno) {
        this.userGradeGroup += ` ${d.grupo_turno}`;
      }
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
    if (showLoading) this.isLoading = true;

    this.profesoresService.getMensajesChat(this.idProfesor).subscribe({
      next: (mensajes) => {
        const mensajesAntesCount = this.mensajes.length;
        this.mensajes = mensajes;
        
        // Agrupar por fecha para la vista
        this.groupMessagesByDate(mensajes);

        // Si hay mensajes nuevos, hacer scroll al final
        if (mensajes.length > mensajesAntesCount) {
          this.shouldScrollToBottom = true;
        }
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('[CHAT] Error cargando mensajes:', error);
        this.isLoading = false;
      }
    });
  }

  // --- Agrupación por Fecha
  private groupMessagesByDate(mensajes: Mensaje[]): void {
    this.groupedMessages = [];
    
    for (const msg of mensajes) {
      const dateKey = this.getDateLabel(msg.fecha_envio);
      
      // Revisar el último grupo creado
      const lastGroup = this.groupedMessages[this.groupedMessages.length - 1];

      if (lastGroup && lastGroup.date === dateKey) {
        // Si es la misma fecha, agregamos al grupo existente
        lastGroup.messages.push(msg);
      } else {
        // Si es fecha nueva, creamos nuevo grupo
        this.groupedMessages.push({
          date: dateKey,
          messages: [msg]
        });
      }
    }
  }
  private getDateLabel(dateStr: string): string {
    if (!dateStr) return 'Desconocido';
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isSameDay = (d1: Date, d2: Date) => 
      d1.getDate() === d2.getDate() && 
      d1.getMonth() === d2.getMonth() && 
      d1.getFullYear() === d2.getFullYear();

    if (isSameDay(date, today)) return 'Hoy';
    if (isSameDay(date, yesterday)) return 'Ayer';

    return this.datePipe.transform(date, 'd \'de\' MMMM yyyy', undefined, 'es-MX') || date.toDateString();
  }

  sendMessage(): void {
    const mensajeTexto = this.newMessage.trim();
    if (!mensajeTexto || this.isSending) return;

    this.isSending = true;
    console.log('[CHAT] Enviando:', mensajeTexto);

    const optimisticMsg: any = {
      id_mensaje: Date.now(),
      id_remitente: 0,
      id_destinatario: this.idProfesor,
      mensaje: mensajeTexto,
      fecha_envio: new Date().toISOString(),
      leido: 0,
      tipo: 'enviado',
      fecha_lectura: null,
      nombre_remitente: ''
    };

    // Actualizar vista inmediatamente
    this.mensajes.push(optimisticMsg);
    this.groupMessagesByDate(this.mensajes);
    this.newMessage = '';
    this.shouldScrollToBottom = true;

    this.profesoresService.enviarMensaje(this.idProfesor, mensajeTexto).subscribe({
      next: () => {
        this.loadMensajes(false); // Sincronizar ID real con backend
        this.isSending = false;
      },
      error: (error) => {
        console.error('[CHAT] Error enviando:', error);
        alert('Error al enviar el mensaje.');
        this.isSending = false;
        this.mensajes.pop();
        this.groupMessagesByDate(this.mensajes);
      }
    });
  }

  formatTime(timestamp: string): string {
    if (!timestamp) return '';
    return this.datePipe.transform(timestamp, 'HH:mm') || '';
  }

  scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
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

  getIcon(n: string): string { return ICONS_MAP[n] || ICONS_MAP['file-text']; }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['']);
  }
}