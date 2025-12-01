import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription, interval } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { EstudiantesProfesorService, Estudiante, MensajeProfesor } from '../../services/estudiantes-profesor.service';
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
  messages: MensajeProfesor[];
}

// Constantes
const ICONS_MAP: { [key: string]: string } = {
  'home': 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  'material': 'M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25',
  'users': 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  'user': 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z'
};

@Component({
  selector: 'app-prof-chat-estudiantes',
  standalone: true,
  imports: [CommonModule, FormsModule, NotificationsComponent],
  providers: [DatePipe],
  templateUrl: './prof-chat-estudiantes.html',
  styleUrls: ['./prof-chat-estudiantes.css']
})
export class ProfChatEstudiantesComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  // Datos Usuario
  userRole: 'profesor' = 'profesor';
  userName: string = '';
  userAccountNumber: string = '';
  userMateria: string = '';
  
  // Navegación
  currentRoute: string = '/prof-chat-estudiantes';
  navigationItems: NavItem[] = [];

  // Datos Chat
  idEstudiante: number = 0;
  estudiante: Estudiante | null = null;
  mensajes: MensajeProfesor[] = [];
  groupedMessages: MessageGroup[] = []; // Mensajes agrupados por fecha
  
  newMessage: string = '';
  currentPage: number = 1;
  totalPages: number = 1;

  // Estado
  isLoading: boolean = true;
  isSending: boolean = false;
  private shouldScrollToBottom: boolean = false;
  private pollingSubscription: Subscription | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private estudiantesService: EstudiantesProfesorService,
    private authService: AuthService,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    if (!this.checkAuth()) return;
    
    this.loadUserData();
    this.loadNavigation();
    
    this.route.params.subscribe(params => {
      this.idEstudiante = +params['id'];
      if (this.idEstudiante) {
        this.loadEstudianteData();
        this.loadMensajes(true);
        
        // Iniciar polling (cada 3s)
        if (this.pollingSubscription) this.pollingSubscription.unsubscribe();
        this.pollingSubscription = interval(3000).subscribe(() => {
          this.loadMensajes(false);
        });
      }
    });
  }

  ngOnDestroy(): void {
    // Limpiar suscripción al salir
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
      this.userMateria = d.departamento || 'Profesor';
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
      next: (estudiante) => this.estudiante = estudiante,
      error: (error) => {
        console.error('[PROF-CHAT] Error estudiante:', error);
        alert('Error al cargar datos del estudiante');
        this.backToList();
      }
    });
  }

  loadMensajes(showLoading: boolean = true): void {
    if (showLoading) this.isLoading = true;

    this.estudiantesService.getMensajesChat(this.idEstudiante)
      .pipe(
        finalize(() => { if (showLoading) this.isLoading = false; })
      )
      .subscribe({
        next: (mensajes) => {
          const countAntes = this.mensajes.length;
          this.mensajes = mensajes;
          
          // Agrupar mensajes por fecha
          this.groupMessagesByDate(mensajes);

          if (mensajes.length > countAntes) {
            this.shouldScrollToBottom = true;
          }
          
          // Paginación simulada (opcional)
          this.totalPages = Math.ceil(mensajes.length / 20) || 1;
          this.currentPage = this.totalPages;
        },
        error: (err) => {
          console.error('[PROF-CHAT] Error mensajes:', err);
          this.isLoading = false;
        }
      });
  }

  // --- Agrupación de Mensajes por Fecha ---
  private groupMessagesByDate(mensajes: MensajeProfesor[]): void {
    this.groupedMessages = [];
    
    for (const msg of mensajes) {
      const dateKey = this.getDateLabel(msg.fecha_envio);
      const lastGroup = this.groupedMessages[this.groupedMessages.length - 1];

      if (lastGroup && lastGroup.date === dateKey) {
        lastGroup.messages.push(msg);
      } else {
        this.groupedMessages.push({ date: dateKey, messages: [msg] });
      }
    }
  }

  private getDateLabel(dateStr: string): string {
    if (!dateStr) return '';
    try {
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

      return this.datePipe.transform(date, 'd \'de\' MMMM yyyy', undefined, 'es-MX') || '';
    } catch {
      return '';
    }
  }

  sendMessage(): void {
    const txt = this.newMessage.trim();
    if (!txt || this.isSending) return;

    this.isSending = true;

    // Mensaje Optimista
    const optimisticMsg: MensajeProfesor = {
      id_mensaje: Date.now(),
      id_remitente: 0,
      id_destinatario: this.idEstudiante,
      mensaje: txt,
      fecha_envio: new Date().toISOString(),
      leido: 0,
      tipo: 'enviado',
      fecha_lectura: null,
      nombre_remitente: ''
    };

    this.mensajes.push(optimisticMsg);
    this.groupMessagesByDate(this.mensajes);
    
    this.newMessage = '';
    this.shouldScrollToBottom = true;

    this.estudiantesService.enviarMensaje(this.idEstudiante, txt).subscribe({
      next: () => {
        this.isSending = false;
        this.loadMensajes(false); // Sincronizar ID real
      },
      error: () => {
        alert('Error al enviar el mensaje');
        this.mensajes.pop(); // Revertir si falla
        this.groupMessagesByDate(this.mensajes);
        this.isSending = false;
      }
    });
  }

  formatTime(timestamp: string): string {
    return timestamp ? (this.datePipe.transform(timestamp, 'HH:mm') || '') : '';
  }
  
  // Estado de conexión (Simulado)
  getEstadoConexion(): 'En línea' | 'Desconectado' {
    if (!this.estudiante || this.mensajes.length === 0) return 'Desconectado';
    
    // Buscar último mensaje del estudiante
    const ultimoRecibido = [...this.mensajes].reverse().find(m => m.tipo === 'recibido');
    if (!ultimoRecibido) return 'Desconectado';

    const fecha = new Date(ultimoRecibido.fecha_envio);
    const diffMinutos = Math.floor((new Date().getTime() - fecha.getTime()) / 60000);
    
    return diffMinutos < 10 ? 'En línea' : 'Desconectado';
  }

  scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
      }
    } catch {}
  }

  backToList(): void { this.router.navigate(['/prof-estudiantes']); }
  navigateTo(r: string): void { this.currentRoute = r; this.router.navigate([r]); }
  getIcon(n: string): string { return ICONS_MAP[n] || ICONS_MAP['users']; }
  logout(): void { this.authService.logout(); this.router.navigate(['']); }
}