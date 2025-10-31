import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Student {
  id: string;
  name: string;
  initials: string;
  accountNumber: string;
  email: string;
  phone: string;
  career: string;
  grade: string;
  group: string;
  registrationDate: string;
  status: 'active' | 'inactive' | 'reentry' | 'new';
  statusLabel: string;
  documentsCompleted: number;
  documentsTotal: number;
  tutorName?: string;
  tutorPhone?: string;
}

interface Professor {
  id: string;
  name: string;
  title: string;
  department: string;
  subjects: string;
  email: string;
  startDate: string;
  status: 'active' | 'inactive';
}

interface NavItem {
  icon: string;
  label: string;
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-gestion',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-gestion.html',
  styleUrls: ['./admin-gestion.css']
})
export class AdminGestionComponent implements OnInit {
  userRole: 'administrador' | 'estudiante' | 'profesor' = 'administrador';
  userName: string = 'Carlos Rodríguez';
  notificationCount: number = 5;
  currentRoute: string = '/gestion';
  
  // Tabs
  activeMainTab: 'resumen' | 'estudiantes' | 'profesores' | 'registrar' = 'resumen';
  activeRegisterTab: 'estudiante' | 'profesor' = 'estudiante';
  
  // Modals
  showStudentInfoModal: boolean = false;
  showEditStudentModal: boolean = false;
  selectedStudent: Student | null = null;
  
  // Search and filters
  searchQuery: string = '';
  selectedGrade: string = 'all';
  selectedGroup: string = 'all';
  selectedStatus: string = 'all';

  // Stats
  totalStudents: number = 1247;
  totalProfessors: number = 68;
  pendingRegistrations: number = 12;
  activeUsers: number = 1289;

  // Form data for new student
  newStudent = {
    firstName: '',
    paternalLastName: '',
    maternalLastName: '',
    birthDate: '',
    curp: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    state: '',
    studentType: 'new',
    program: '',
    grade: '',
    group: '',
    tutorName: '',
    tutorPhone: '',
    tutorEmail: '',
    relationship: '',
    observations: ''
  };

  newProfessor = {
    firstName: '',
    paternalLastName: '',
    maternalLastName: '',
    birthDate: '',
    curp: '',
    institutionalEmail: '',
    personalEmail: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    state: '',
    department: '',
    position: '',
    contractType: '',
    startDate: '',
    monthlySalary: '',
    educationLevel: '',
    specialization: '',
    subjects: [] as string[],
    yearsExperience: '',
    certifications: '',
    preferredSchedule: '',
    availableDays: [] as string[],
    maxHoursPerWeek: '',
    observations: ''
  };

  // Available subjects for professors
  availableSubjects = [
    'Matemáticas',
    'Química',
    'Historia',
    'Filosofía',
    'Sociología',
    'Metodología',
    'Física',
    'Biología',
    'Literatura',
    'Psicología',
    'Economía',
    'Contabilidad'
  ];

  // Available days
  availableDays = [
    { value: 'lunes', label: 'Lunes' },
    { value: 'martes', label: 'Martes' },
    { value: 'miercoles', label: 'Miércoles' },
    { value: 'jueves', label: 'Jueves' },
    { value: 'viernes', label: 'Viernes' },
    { value: 'sabado', label: 'Sábado' },
    { value: 'domingo', label: 'Domingo' }
  ];

  // Mock data
  students: Student[] = [
    {
      id: '1',
      name: 'María García',
      initials: 'MG',
      accountNumber: '2024001234',
      email: 'maria.garcia@estudiante.edu',
      phone: '+52 555 1234',
      career: 'Ingeniería de Sistemas',
      grade: '2',
      group: 'A',
      registrationDate: '2024-01-15',
      status: 'reentry',
      statusLabel: 'Reingreso',
      documentsCompleted: 3,
      documentsTotal: 4,
      tutorName: 'Pedro García',
      tutorPhone: '+52 555 9999'
    },
    {
      id: '2',
      name: 'Juan Pérez',
      initials: 'JP',
      accountNumber: '2024001235',
      email: 'juan.perez@estudiante.edu',
      phone: '+52 555 5678',
      career: 'Administración',
      grade: '1',
      group: 'B',
      registrationDate: '2024-02-01',
      status: 'new',
      statusLabel: 'Nuevo Ingreso',
      documentsCompleted: 2,
      documentsTotal: 3,
      tutorName: 'Ana Pérez',
      tutorPhone: '+52 555 8888'
    },
    {
      id: '3',
      name: 'Ana López',
      initials: 'AL',
      accountNumber: '2024001236',
      email: 'ana.lopez@estudiante.edu',
      phone: '+52 555 9012',
      career: 'Arquitectura',
      grade: '3',
      group: 'A',
      registrationDate: '2023-08-20',
      status: 'active',
      statusLabel: 'Activo',
      documentsCompleted: 4,
      documentsTotal: 4
    },
    {
      id: '4',
      name: 'Carlos Mendoza',
      initials: 'CM',
      accountNumber: '2024001237',
      email: 'carlos.mendoza@estudiante.edu',
      phone: '+52 555 3456',
      career: 'Ingeniería Civil',
      grade: '4',
      group: 'C',
      registrationDate: '2022-09-01',
      status: 'active',
      statusLabel: 'Activo',
      documentsCompleted: 4,
      documentsTotal: 4
    },
    {
      id: '5',
      name: 'Laura Ramírez',
      initials: 'LR',
      accountNumber: '2024001238',
      email: 'laura.ramirez@estudiante.edu',
      phone: '+52 555 7890',
      career: 'Ingeniería de Sistemas',
      grade: '2',
      group: 'A',
      registrationDate: '2023-08-25',
      status: 'active',
      statusLabel: 'Activo',
      documentsCompleted: 4,
      documentsTotal: 4
    }
  ];

  professors: Professor[] = [
    {
      id: 'p1',
      name: 'Dr. Ana López',
      title: 'Profesor Titular',
      department: 'Ciencias Exactas',
      subjects: 'Matemáticas, Física',
      email: 'ana.lopez@universidad.edu',
      startDate: '2020-08-15',
      status: 'active'
    },
    {
      id: 'p2',
      name: 'Dr. Roberto Sánchez',
      title: 'Profesor Asociado',
      department: 'Ingeniería',
      subjects: 'Programación, Bases de Datos',
      email: 'roberto.sanchez@universidad.edu',
      startDate: '2019-02-01',
      status: 'active'
    }
  ];

  navigationItems: NavItem[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadNavigation();
    this.currentRoute = this.router.url;
  }

  loadNavigation(): void {
    const navigationConfig = {
      administrador: [
        { icon: 'home', label: 'Inicio', route: '/admin-dashboard', badge: 0 },
        { icon: 'file-text', label: 'Documentos', route: '/admin-documentos', badge: 23 },
        { icon: 'folder', label: 'Gestión', route: '/admin-gestion', badge: 0 },
        { icon: 'user', label: 'Perfil', route: '/admin-perfil', badge: 0 }
      ],
      estudiante: [
        { icon: 'home', label: 'Inicio', route: '/est-dashboard', badge: 0 },
        { icon: 'upload', label: 'Documentos', route: '/est-documentos', badge: 0 },
        { icon: 'clock', label: 'Pendientes', route: '/est-pendientes', badge: 5 },
        { icon: 'user', label: 'Perfil', route: '/est-perfil', badge: 0 }
      ],
      profesor: [
        { icon: 'home', label: 'Inicio', route: '/prof-dashboard', badge: 0 },
        { icon: 'users', label: 'Estudiantes', route: '/prof-MensEstudiantes', badge: 0 },
        { icon: 'clock', label: 'Pendientes', route: '/prof-MensPendientes', badge: 12 },
        { icon: 'user', label: 'Perfil', route: '/est-perfil', badge: 0 }
      ]
    };

    this.navigationItems = navigationConfig[this.userRole];
  }

  setMainTab(tab: 'resumen' | 'estudiantes' | 'profesores' | 'registrar'): void {
    this.activeMainTab = tab;
  }

  setRegisterTab(tab: 'estudiante' | 'profesor'): void {
    this.activeRegisterTab = tab;
  }

  get filteredStudents(): Student[] {
    return this.students.filter(student => {
      const matchesSearch = !this.searchQuery || 
        student.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        student.accountNumber.includes(this.searchQuery) ||
        student.email.toLowerCase().includes(this.searchQuery.toLowerCase());
      
      const matchesGrade = this.selectedGrade === 'all' || student.grade === this.selectedGrade;
      const matchesGroup = this.selectedGroup === 'all' || student.group === this.selectedGroup;
      const matchesStatus = this.selectedStatus === 'all' || student.status === this.selectedStatus;

      return matchesSearch && matchesGrade && matchesGroup && matchesStatus;
    });
  }

  openStudentInfo(student: Student): void {
    this.selectedStudent = student;
    this.showStudentInfoModal = true;
  }

  closeStudentInfo(): void {
    this.showStudentInfoModal = false;
    this.selectedStudent = null;
  }

  openEditStudent(student: Student): void {
    this.selectedStudent = student;
    this.showEditStudentModal = true;
    this.closeStudentInfo();
  }

  closeEditStudent(): void {
    this.showEditStudentModal = false;
    this.selectedStudent = null;
  }

  saveStudentChanges(): void {
    console.log('Guardar cambios de estudiante:', this.selectedStudent);
    this.closeEditStudent();
  }

  viewDocuments(student: Student): void {
    console.log('Ver documentos de:', student);
    // Navegar a documentos del estudiante
  }

  registerNewStudent(): void {
    console.log('Registrar nuevo estudiante:', this.newStudent);
    // Implementar lógica de registro
  }

  registerNewProfessor(): void {
    console.log('Registrar nuevo profesor:', this.newProfessor);
    // Implementar lógica de registro
  }

  clearForm(): void {
    if (this.activeRegisterTab === 'estudiante') {
      this.newStudent = {
        firstName: '',
        paternalLastName: '',
        maternalLastName: '',
        birthDate: '',
        curp: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        postalCode: '',
        state: '',
        studentType: 'new',
        program: '',
        grade: '',
        group: '',
        tutorName: '',
        tutorPhone: '',
        tutorEmail: '',
        relationship: '',
        observations: ''
      };
    } else {
      this.newProfessor = {
        firstName: '',
        paternalLastName: '',
        maternalLastName: '',
        birthDate: '',
        curp: '',
        institutionalEmail: '',
        personalEmail: '',
        phone: '',
        address: '',
        city: '',
        postalCode: '',
        state: '',
        department: '',
        position: '',
        contractType: '',
        startDate: '',
        monthlySalary: '',
        educationLevel: '',
        specialization: '',
        subjects: [],
        yearsExperience: '',
        certifications: '',
        preferredSchedule: '',
        availableDays: [],
        maxHoursPerWeek: '',
        observations: ''
      };
    }
  }

  toggleSubject(subject: string): void {
    const index = this.newProfessor.subjects.indexOf(subject);
    if (index > -1) {
      this.newProfessor.subjects.splice(index, 1);
    } else {
      this.newProfessor.subjects.push(subject);
    }
  }

  isSubjectSelected(subject: string): boolean {
    return this.newProfessor.subjects.includes(subject);
  }

  toggleDay(day: string): void {
    const index = this.newProfessor.availableDays.indexOf(day);
    if (index > -1) {
      this.newProfessor.availableDays.splice(index, 1);
    } else {
      this.newProfessor.availableDays.push(day);
    }
  }

  isDaySelected(day: string): boolean {
    return this.newProfessor.availableDays.includes(day);
  }

  getDocumentProgressPercentage(student: Student): number {
    return (student.documentsCompleted / student.documentsTotal) * 100;
  }

  navigateTo(route: string): void {
    this.currentRoute = route;
    this.router.navigate([route]);
  }

  getIcon(iconName: string): string {
    const icons: { [key: string]: string } = {
      'home': 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
      'clock': 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 6v6l4 2',
      'users': 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
      'folder': 'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z',
      'user': 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
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

