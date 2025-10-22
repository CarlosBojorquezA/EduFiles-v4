import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface User {
  id: string;
  name: string;
  initials: string;
  accountNumber: string;
  email: string;
  phone: string;
  career: string;
  grade: string;
  group: string;
  status: 'active' | 'inactive';
  documentsCompleted: number;
  documentsTotal: number;
}

interface NavItem {
  icon: string;
  label: string;
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-buscar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-buscar.html',
  styleUrls: ['./admin-buscar.css']
})
export class AdminBuscarComponent implements OnInit {
  userRole: 'administrador' | 'estudiante' | 'profesor' = 'administrador';
  userName: string = 'Carlos Rodríguez';
  notificationCount: number = 5;
  currentRoute: string = '/buscar';

  // Search and filters
  searchQuery: string = '';
  selectedUserType: 'students' | 'professors' = 'students';
  selectedGrade: string = 'all';
  selectedGroup: string = 'all';
  selectedStatus: string = 'all';

  // Mock data
  students: User[] = [
    {
      id: '1',
      name: 'María García',
      initials: 'MG',
      accountNumber: '2024001',
      email: 'maria.garcia@estudiante.edu',
      phone: '+52 555 1234',
      career: 'Ingeniería de Sistemas',
      grade: '3',
      group: 'A',
      status: 'active',
      documentsCompleted: 3,
      documentsTotal: 4
    },
    {
      id: '2',
      name: 'Juan Pérez',
      initials: 'JP',
      accountNumber: '2024002',
      email: 'juan.perez@estudiante.edu',
      phone: '+52 555 5678',
      career: 'Ingeniería Industrial',
      grade: '2',
      group: 'B',
      status: 'active',
      documentsCompleted: 4,
      documentsTotal: 4
    },
    {
      id: '3',
      name: 'Ana López',
      initials: 'AL',
      accountNumber: '2024003',
      email: 'ana.lopez@estudiante.edu',
      phone: '+52 555 9012',
      career: 'Arquitectura',
      grade: '1',
      group: 'A',
      status: 'active',
      documentsCompleted: 2,
      documentsTotal: 4
    },
    {
      id: '4',
      name: 'Carlos Mendoza',
      initials: 'CM',
      accountNumber: '2024004',
      email: 'carlos.mendoza@estudiante.edu',
      phone: '+52 555 3456',
      career: 'Ingeniería Civil',
      grade: '4',
      group: 'C',
      status: 'inactive',
      documentsCompleted: 1,
      documentsTotal: 4
    },
    {
      id: '5',
      name: 'Laura Ramírez',
      initials: 'LR',
      accountNumber: '2024005',
      email: 'laura.ramirez@estudiante.edu',
      phone: '+52 555 7890',
      career: 'Ingeniería de Sistemas',
      grade: '3',
      group: 'A',
      status: 'active',
      documentsCompleted: 4,
      documentsTotal: 4
    }
  ];

  professors: User[] = [
    {
      id: 'p1',
      name: 'Dr. Roberto Sánchez',
      initials: 'RS',
      accountNumber: 'PROF001',
      email: 'roberto.sanchez@universidad.edu',
      phone: '+52 555 1111',
      career: 'Departamento de Sistemas',
      grade: '',
      group: '',
      status: 'active',
      documentsCompleted: 10,
      documentsTotal: 10
    },
    {
      id: 'p2',
      name: 'Dra. Patricia Torres',
      initials: 'PT',
      accountNumber: 'PROF002',
      email: 'patricia.torres@universidad.edu',
      phone: '+52 555 2222',
      career: 'Departamento de Industrial',
      grade: '',
      group: '',
      status: 'active',
      documentsCompleted: 8,
      documentsTotal: 10
    }
  ];

  navigationItems: NavItem[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadNavigationByRole();
    this.currentRoute = this.router.url;
  }

  loadNavigationByRole(): void {
    const navigationConfig = {
      administrador: [
        { icon: 'home', label: 'Inicio', route: '/dashboard', badge: 0 },
        { icon: 'clock', label: 'Pendientes', route: '/pendientes', badge: 23 },
        { icon: 'search', label: 'Buscar', route: '/buscar', badge: 0 },
        { icon: 'folder', label: 'Gestión', route: '/gestion', badge: 0 },
        { icon: 'user', label: 'Perfil', route: '/perfil', badge: 0 }
      ],
      estudiante: [
        { icon: 'home', label: 'Inicio', route: '/dashboard', badge: 0 },
        { icon: 'upload', label: 'Mis Documentos', route: '/mis-documentos', badge: 0 },
        { icon: 'clock', label: 'Pendientes', route: '/pendientes', badge: 5 },
        { icon: 'user', label: 'Perfil', route: '/perfil', badge: 0 }
      ],
      profesor: [
        { icon: 'home', label: 'Inicio', route: '/dashboard', badge: 0 },
        { icon: 'users', label: 'Estudiantes', route: '/estudiantes', badge: 0 },
        { icon: 'clock', label: 'Pendientes', route: '/pendientes', badge: 12 },
        { icon: 'file-text', label: 'Documentos', route: '/documentos', badge: 0 },
        { icon: 'user', label: 'Perfil', route: '/perfil', badge: 0 }
      ]
    };

    this.navigationItems = navigationConfig[this.userRole];
  }

  get filteredUsers(): User[] {
    const users = this.selectedUserType === 'students' ? this.students : this.professors;
    
    return users.filter(user => {
      const matchesSearch = !this.searchQuery || 
        user.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        user.accountNumber.includes(this.searchQuery);
      
      const matchesGrade = this.selectedGrade === 'all' || user.grade === this.selectedGrade;
      const matchesGroup = this.selectedGroup === 'all' || user.group === this.selectedGroup;
      const matchesStatus = this.selectedStatus === 'all' || user.status === this.selectedStatus;

      return matchesSearch && matchesGrade && matchesGroup && matchesStatus;
    });
  }

  get resultCount(): number {
    return this.filteredUsers.length;
  }

  selectUserType(type: 'students' | 'professors'): void {
    this.selectedUserType = type;
    this.resetFilters();
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedGrade = 'all';
    this.selectedGroup = 'all';
    this.selectedStatus = 'all';
  }

  onEditUser(user: User): void {
    console.log('Editar usuario:', user);
    // Aquí implementarías la navegación o modal de edición
  }

  onViewDocuments(user: User): void {
    console.log('Ver documentos de:', user);
    // Aquí implementarías la navegación a documentos del usuario
  }

  getDocumentProgressPercentage(user: User): number {
    return (user.documentsCompleted / user.documentsTotal) * 100;
  }

  navigateTo(route: string): void {
    this.currentRoute = route;
    this.router.navigate([route]);
  }

  getIcon(iconName: string): string {
    const icons: { [key: string]: string } = {
      'home': 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
      'clock': 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 6v6l4 2',
      'search': 'M11 2a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM21 21l-4.35-4.35',
      'folder': 'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z',
      'user': 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
      'users': 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
      'upload': 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12',
      'file-text': 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8'
    };
    return icons[iconName] || icons['file-text'];
  }

  logout(): void {
    console.log('Cerrando sesión...');
    this.router.navigate(['']);
  }
}