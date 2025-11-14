import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

interface Message {
  id: string;
  sender: 'estudiante' | 'profesor';
  content: string;
  timestamp: Date;
  read: boolean;
}

interface Estudiante {
  id: string;
  name: string;
  initials: string;
  clase: string;
  group: string;
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
  selector: 'app-prof-chat-estudiantes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './prof-chat-estudiantes.html',
  styleUrls: ['./prof-chat-estudiantes.css']
})
export class ProfChatEstudiantesComponent implements OnInit, AfterViewChecked {
  userRole: 'Profesor' = 'Profesor';
  userName: string = 'Jose Orozco';
  userAccountNumber: string = '2024001234';
  userCarrera: string = 'Ingeniería de Sistemas';
  userMateria: string = 'Angular';
  notificationCount: number = 3;

  // Views
  currentView: 'list' | 'chat' | 'profile' = 'list';
  selectedProfessor: Estudiante | null = null;
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  currentRoute: string = '/prof-chat-estudiantes';

  Estudiante: Estudiante = {
    id: '1',
      name: 'Maria Garcia',
      initials: 'MG',
      clase: 'Matemáticas',
      group: '2°',
      email: 'ana.lopez@universidad.edu',
      phone: '+52 555 1234',
      status: 'online',
      unreadMessages: 1
  };

  messages: Message[] = [
    {
      id: '1',
      sender: 'profesor',
      content: 'Holanda, que me cuentas¿',
      timestamp: new Date(Date.now() - 3600000),
      read: true
    },
    {
      id: '2',
      sender: 'estudiante',
      content: 'tinguililingui',
      timestamp: new Date(Date.now() - 1800000),
      read: true
    },
    {
      id: '3',
      sender: 'estudiante',
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

  sendMessage(): void {
    if (this.newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        sender: 'profesor',
        content: this.newMessage.trim(),
        timestamp: new Date(),
        read: false
      };

      this.messages.push(message);
      this.newMessage = '';
      this.shouldScrollToBottom = true;

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
      { icon: 'home', label: 'Inicio', route: '/prof-dashboard', badge: 0 },
      { icon: 'material', label: 'Materiales', route: '/prof-materiales', badge: 0 },
      { icon: 'file-text', label: 'Chat-Estudiantes', route: '/prof-estudiantes', badge: 0 },
      { icon: 'user', label: 'Perfil', route: '/prof-perfil', badge: 0 }
    ];
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