import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

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

interface Message {
  id: string;
  sender: 'student' | 'professor';
  text: string;
  time: string;
}

interface NavItem {
  icon: string;
  label: string;
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-est-profesores',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './est-profesores.html',
  styleUrls: ['./est-profesores.css']
})
export class EstProfesoresComponent implements OnInit {
  userRole: 'estudiante' = 'estudiante';
  userName: string = 'María García';
  userAccountNumber: string = '2024001234';
  userCareer: string = 'Ingeniería de Sistemas';
  userGradeGroup: string = '2°A';
  notificationCount: number = 3;
  currentRoute: string = '/est-profesores';

  // Chat
  showChatModal: boolean = false;
  selectedProfessor: Professor | null = null;
  newMessage: string = '';
  messages: Message[] = [];

  // Professors list
  professors: Professor[] = [
    {
      id: '1',
      name: 'Dr. Ana López',
      initials: 'DAL',
      subject: 'Matemáticas',
      department: 'Ciencias Exactas',
      email: 'ana.lopez@universidad.edu',
      phone: '+52 555 1234',
      status: 'online',
      unreadMessages: 1
    },
    {
      id: '2',
      name: 'Prof. Carlos Mendoza',
      initials: 'PCM',
      subject: 'Historia',
      department: 'Humanidades',
      email: 'carlos.mendoza@universidad.edu',
      phone: '+52 555 5678',
      status: 'offline',
      unreadMessages: 0
    },
    {
      id: '3',
      name: 'Dra. Elena Ramírez',
      initials: 'DER',
      subject: 'Química',
      department: 'Ciencias Naturales',
      email: 'elena.ramirez@universidad.edu',
      phone: '+52 555 9012',
      status: 'online',
      unreadMessages: 0
    }
  ];

  navigationItems: NavItem[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadNavigation();
    this.currentRoute = this.router.url;
  }

  loadNavigation(): void {
    this.navigationItems = [
      { icon: 'home', label: 'Inicio', route: '/est-dashboard', badge: 0 },
      { icon: 'file-text', label: 'Documentos', route: '/est-documentos', badge: 0 },
      { icon: 'users', label: 'Profesores', route: '/est-profesores', badge: 0 },
      { icon: 'user', label: 'Perfil', route: '/est-perfil', badge: 0 }
    ];
  }

  openProfessorProfile(professor: Professor, event: Event): void {
    // Verificar que no se hizo clic en el botón de chat
    const target = event.target as HTMLElement;
    if (target.closest('.btn-chat')) {
      return;
    }
    
    console.log('Abrir perfil del profesor:', professor);
    // Aquí navegarías a la vista de perfil del profesor
    // this.router.navigate(['/est-profesor-perfil', professor.id]);
  }

  openChat(professor: Professor, event: Event): void {
    event.stopPropagation();
    this.selectedProfessor = professor;
    this.loadMessages(professor.id);
    this.showChatModal = true;
    
    // Marcar mensajes como leídos
    professor.unreadMessages = 0;
  }

  closeChat(): void {
    this.showChatModal = false;
    this.selectedProfessor = null;
    this.messages = [];
    this.newMessage = '';
  }

  loadMessages(professorId: string): void {
    // Mensajes de ejemplo según el profesor
    if (professorId === '1') {
      this.messages = [
        {
          id: '1',
          sender: 'student',
          text: 'Profesor, tengo una duda sobre el documento de CURP que subí',
          time: '03:30'
        },
        {
          id: '2',
          sender: 'professor',
          text: 'Hola Juan, ¿cuál es tu duda específica sobre el CURP?',
          time: '03:35'
        },
        {
          id: '3',
          sender: 'student',
          text: 'El archivo se ve un poco borroso, ¿debería subirlo de nuevo?',
          time: '03:40'
        }
      ];
    } else {
      this.messages = [];
    }
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.selectedProfessor) {
      return;
    }

    const currentTime = new Date();
    const hours = currentTime.getHours().toString().padStart(2, '0');
    const minutes = currentTime.getMinutes().toString().padStart(2, '0');

    const message: Message = {
      id: Date.now().toString(),
      sender: 'student',
      text: this.newMessage,
      time: `${hours}:${minutes}`
    };

    this.messages.push(message);
    this.newMessage = '';

    // Simular respuesta del profesor después de 2 segundos
    setTimeout(() => {
      const responseMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'professor',
        text: 'Gracias por tu mensaje, te responderé pronto.',
        time: `${hours}:${parseInt(minutes) + 1}`
      };
      this.messages.push(responseMessage);
    }, 2000);
  }

  navigateTo(route: string): void {
    this.currentRoute = route;
    this.router.navigate([route]);
  }

  getIcon(iconName: string): string {
    const icons: { [key: string]: string } = {
      'home': 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
      'file-text': 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8',
      'search': 'M11 2a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM21 21l-4.35-4.35',
      'users': 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
      'user': 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z'
    };
    return icons[iconName] || icons['file-text'];
  }

  logout(): void {
    console.log('Cerrando sesión...');
    this.router.navigate(['']);
  }
}