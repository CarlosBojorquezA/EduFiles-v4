import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface Student {
  id: string;
  name: string;
  accountNumber: string;
  email: string;
  phone: string;
  grade: string;
  group: string;
  subjects: string[];
  isOnline: boolean;
  unreadMessages: number;
  lastMessage?: string;
  lastMessageTime?: string;
  avatar: string;
}

interface Subject {
  value: string;
  label: string;
}

interface Grade {
  value: string;
  label: string;
}

interface Group {
  value: string;
  label: string;
}

interface NavItem {
  icon: string;
  label: string;
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-prof-estudiantes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './prof-estudiantes.html',
  styleUrls: ['./prof-estudiantes.css']
})
export class ProfEstudiantesComponent implements OnInit {
  searchText: string = '';
  selectedSubject: string = 'all';
  selectedGrade: string = 'all';
  selectedGroup: string = 'all';

  userRole: 'Profesor' = 'Profesor';
  userName: string = 'Jose Orozco';
  userAccountNumber: string = '2024001234';
  userMateria: string = 'Angular';
  notificationCount: number = 3;
  currentRoute: string = '/prof-estudiantes';

  subjects: Subject[] = [
    { value: 'all', label: 'Todas mis materias' },
    { value: 'Matemáticas', label: 'Matemáticas' },
    { value: 'Física', label: 'Física' },
    { value: 'Química', label: 'Química' }
  ];

  grades: Grade[] = [
    { value: 'all', label: 'Todos' },
    { value: '1°', label: '1°' },
    { value: '2°', label: '2°' },
    { value: '3°', label: '3°' },
    { value: '4°', label: '4°' },
    { value: '5°', label: '5°' },
    { value: '6°', label: '6°' }
  ];

  groups: Group[] = [
    {value: 'all', label: 'Todos'},
    {value: 'A', label: 'A'},
    {value: 'B', label: 'B'},
    {value: 'C', label: 'C'},
    {value: 'D', label: 'D'},
  ];

  students: Student[] = [
    {
      id: '1',
      name: 'María García',
      accountNumber: '2024001',
      email: 'maria.garcia@estudiante.edu',
      phone: '+52 555 1234',
      grade: '3°',
      group: 'A',
      subjects: ['Matemáticas', 'Física'],
      isOnline: true,
      unreadMessages: 2,
      lastMessage: 'El archivo se ve un poco borroso, ¿debería subirlo de nuevo?',
      lastMessageTime: '03:40',
      avatar: 'MG'
    },
    {
      id: '2',
      name: 'Juan Pérez',
      accountNumber: '2024002',
      email: 'juan.perez@estudiante.edu',
      phone: '+52 555 5678',
      grade: '3°',
      group: 'A',
      subjects: ['Matemáticas'],
      isOnline: false,
      unreadMessages: 0,
      lastMessage: 'Gracias profesor, entendido',
      lastMessageTime: 'Ayer',
      avatar: 'JP'
    },
    {
      id: '3',
      name: 'Ana Martínez',
      accountNumber: '2024003',
      email: 'ana.martinez@estudiante.edu',
      phone: '+52 555 9012',
      grade: '3°',
      group: 'B',
      subjects: ['Matemáticas', 'Química'],
      isOnline: true,
      unreadMessages: 1,
      lastMessage: '¿Podría revisar mi tarea?',
      lastMessageTime: '10:15',
      avatar: 'AM'
    },
    {
      id: '4',
      name: 'Carlos López',
      accountNumber: '2024004',
      email: 'carlos.lopez@estudiante.edu',
      phone: '+52 555 3456',
      grade: '2°',
      group: 'A',
      subjects: ['Física'],
      isOnline: false,
      unreadMessages: 0,
      avatar: 'CL'
    },
    {
      id: '5',
      name: 'Laura Sánchez',
      accountNumber: '2024005',
      email: 'laura.sanchez@estudiante.edu',
      phone: '+52 555 7890',
      grade: '3°',
      group: 'A',
      subjects: ['Matemáticas', 'Física'],
      isOnline: true,
      unreadMessages: 0,
      lastMessage: 'Perfecto, muchas gracias',
      lastMessageTime: '2 días',
      avatar: 'LS'
    },
    {
      id: '6',
      name: 'Pedro Ramírez',
      accountNumber: '2024006',
      email: 'pedro.ramirez@estudiante.edu',
      phone: '+52 555 2468',
      grade: '2°',
      group: 'B',
      subjects: ['Química'],
      isOnline: false,
      unreadMessages: 0,
      avatar: 'PR'
    }
  ];

  filteredStudents: Student[] = [];
  totalStudents: number = 0;

  constructor(private router: Router) {}

    irAlChat(): void {
    this.router.navigate(['/prof-chat-estudiantes']);
  }

  filterStudents(): void {
    this.filteredStudents = this.students.filter(student => {
      const matchesSearch = !this.searchText || 
        student.name.toLowerCase().includes(this.searchText.toLowerCase()) ||
        student.accountNumber.includes(this.searchText);

      const matchesSubject = this.selectedSubject === 'all' || 
        student.subjects.includes(this.selectedSubject);

      const matchesGrade = this.selectedGrade === 'all' || 
        student.grade === this.selectedGrade;

      const matchesGroup = this.selectedGroup === 'all' || 
        student.group === this.selectedGroup;


      return matchesSearch && matchesSubject && matchesGrade && matchesGroup;
    });

    this.totalStudents = this.filteredStudents.length;
  }

  onSearchChange(): void {
    this.filterStudents();
  }

  onFilterChange(): void {
    this.filterStudents();
  }

  openChat(student: Student): void {
    this.router.navigate(['/prof-estudiantes', student.id]);
  }

   ngOnInit(): void {
    this.filterStudents();
    this.loadNavigation();
    this.currentRoute = this.router.url;
  }

  // Navegación
  navigationItems: NavItem[] = [];

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
