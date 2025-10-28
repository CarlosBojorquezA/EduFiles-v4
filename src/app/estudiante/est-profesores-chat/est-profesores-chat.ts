import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

interface Message {
  id: string;
  sender: 'student' | 'teacher';
  content: string;
  timestamp: Date;
  read: boolean;
}

interface Professor {
  id: string;
  name: string;
  initials: string;
  subject: string;
  department: string;
  email: string;
  phone: string;
  status: 'online' | 'offline';
  unreadMessages: number;
}

interface NavItem {
  icon: string;
  label: string;
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-chat-profesor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './est-profesores-chat.html',
  styleUrls: ['./est-profesores-chat.css']
})
export class ChatProfesorComponent implements OnInit, AfterViewChecked {
  userRole: 'estudiante' = 'estudiante';
  userName: string = 'María García';
  userAccountNumber: string = '2024001234';
  userCareer: string = 'Ingeniería de Sistemas';
  userGradeGroup: string = '2°A';
  notificationCount: number = 3;

  // Views
  currentView: 'list' | 'chat' | 'profile' = 'list';
  selectedProfessor: Professor | null = null;
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  currentRoute: string = '/est-profesores-chat';

  teacher: Professor = {
    id: '1',
      name: 'Dr. Ana López',
      initials: 'DAL',
      subject: 'Matemáticas',
      department: 'Ciencias Exactas',
      email: 'ana.lopez@universidad.edu',
      phone: '+52 555 1234',
      status: 'online',
      unreadMessages: 1
  };

  messages: Message[] = [
    {
      id: '1',
      sender: 'teacher',
      content: 'Holanda, que me cuentas¿',
      timestamp: new Date(Date.now() - 3600000),
      read: true
    },
    {
      id: '2',
      sender: 'student',
      content: 'tinguililingui',
      timestamp: new Date(Date.now() - 1800000),
      read: true
    },
    {
      id: '3',
      sender: 'student',
      content: 'hola papu',
      timestamp: new Date(Date.now() - 1740000),
      read: true
    }
  ];

  newMessage: string = '';
  currentPage: number = 20;
  totalPages: number = 3;
  private shouldScrollToBottom = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  navigationItems: NavItem[] = [];

  backToList(): void {
    this.currentView = 'list';
    this.selectedProfessor = null;
    this.messages = [];
    this.newMessage = '';
  }

  ngOnInit(): void {
    this.loadNavigation();
    this.currentRoute = this.router.url;
  }

  navigateTo(route: string): void {
    this.currentRoute = route;
    this.router.navigate([route]);
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  goBack(): void {
    this.router.navigate(['/estudiante/maestros']);
  }

  sendMessage(): void {
    if (this.newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        sender: 'student',
        content: this.newMessage.trim(),
        timestamp: new Date(),
        read: false
      };

      this.messages.push(message);
      this.newMessage = '';
      this.shouldScrollToBottom = true;

      // Aquí enviarías el mensaje al backend
      // this.chatService.sendMessage(this.teacher.id, message).subscribe();
    }
  }

  formatTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  private scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop = 
          this.messagesContainer.nativeElement.scrollHeight;
      }
    } catch(err) {
      console.error('Error scrolling to bottom:', err);
    }
  }

  loadNavigation(): void {
    this.navigationItems = [
      { icon: 'home', label: 'Inicio', route: '/est-dashboard', badge: 0 },
      { icon: 'file-text', label: 'Documentos', route: '/est-documentos', badge: 0 },
      { icon: 'users', label: 'Profesores', route: '/est-profesores', badge: 0 },
      { icon: 'user', label: 'Perfil', route: '/est-perfil', badge: 0 }
    ];
  }

  getIcon(iconName: string): string {
    const icons: { [key: string]: string } = {
      'home': 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
      'file-text': 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8',
      'users': 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
      'user': 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z'
    };
    return icons[iconName] || icons['users'];
  }

  logout(): void {
    console.log('Cerrando sesión...');
    this.router.navigate(['']);
  }

}
