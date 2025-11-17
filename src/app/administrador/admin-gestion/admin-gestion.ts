import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface Student {
  id_estudiante: number;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  nombre_completo: string;
  num_usuario: string;
  correo: string;
  telefono?: string;
  correo_tutor: string;
  nombre_tutor: string;
  telefono_tutor: string;
  curp: string;
  grado: number;
  grupo_id?: number;
  grupo_turno?: string;
  tipo_estudiante: string;
  activo: number;
  fecha_creacion: string;
  documentos_subidos: number;
  documentos_requeridos: number;
  documentos_aprobados: number;
  documentos_subidos_lista?: any[];
  documentos_faltantes_lista?: any[];
}

interface Professor {
  id_profesor: number;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  nombre_completo: string;
  num_usuario: string;
  correo: string;
  telefono?: string;
  licenciatura?: string;
  activo: number;
  materias_asignadas?: string[];
  grupos_asignados?: any[];
}

interface NavItem {
  icon: string;
  label: string;
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-admin-gestion',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-gestion.html',
  styleUrls: ['./admin-gestion.css']
})
export class AdminGestionComponent implements OnInit {
  private apiUrl = 'http://localhost:5000/api';

  userRole: string = 'administrador';
  userName: string = '';
  notificationCount: number = 0;
  currentRoute: string = '/admin-gestion';
  
  // Tabs
  activeMainTab: 'resumen' | 'estudiantes' | 'profesores' | 'registrar' = 'resumen';
  activeRegisterTab: 'estudiante' | 'profesor' = 'estudiante';
  
  // Modals
  showStudentInfoModal: boolean = false;
  showEditStudentModal: boolean = false;
  showProfessorInfoModal: boolean = false;
  showBajaModal: boolean = false;
  selectedStudent: Student | null = null;
  selectedProfessor: Professor | null = null;
  
  // Search and filters
  searchQuery: string = '';
  selectedGrade: string = 'all';
  selectedGroup: string = 'all';
  selectedStatus: string = 'all';
  searchQueryProf: string = '';

  // Stats (ahora desde BD)
  totalStudents: number = 0;
  totalProfessors: number = 0;
  pendingRegistrations: number = 0;
  activeUsers: number = 0;

  // Data from API
  students: Student[] = [];
  professors: Professor[] = [];
  isLoading: boolean = true;

  // Dar de baja
  bajaNumUsuario: string = '';
  bajaConfirmacion: string = '';

  // Form data for new student
  newStudent = {
    nombres: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    fechaNacimiento: '',
    curp: '',
    telefono: '',
    grado: '',
    grupoId: null as number | null,
    tipoEstudiante: 'NUEVO_INGRESO',
    nombreTutor: '',
    correoTutor: '',
    telefonoTutor: '',
    estado: '',
    municipio: '',
    ciudad: '',
    codigoPostal: null as number | null
  };

  newProfessor = {
    nombres: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    correoInstitucional: '',
    correoPersonal: '',
    telefono: '',
    nivelEducativo: '',
    especializacion: '',
    departamento: '',
    puesto: '',
    tipoContrato: '',
    fechaInicio: '',
    salarioMensual: null as number | null
  };

  navigationItems: NavItem[] = [];

  constructor(
    private router: Router,
    private http: HttpClient
  ) {
    console.log('[GESTION] Componente inicializado');
  }

  ngOnInit(): void {
    this.loadUserData();
    this.loadNavigation();
    this.currentRoute = this.router.url;
    
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Sesión expirada');
      this.router.navigate(['']);
      return;
    }
    
    this.loadDashboardData();
  }

  loadUserData(): void {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const user = JSON.parse(userData);
      if (user.detalles && user.detalles.nombres) {
        this.userName = `${user.detalles.nombres} ${user.detalles.apellido_paterno || ''}`.trim();
      } else {
        this.userName = user.correo || 'Usuario';
      }
      this.userRole = (user.rol || 'ADMINISTRADOR').toLowerCase();
    }
  }

  loadDashboardData(): void {
    this.isLoading = true;

    // Cargar estadísticas
    this.http.get(`${this.apiUrl}/admin/stats`).subscribe({
      next: (response: any) => {
        this.totalStudents = response.total_estudiantes || 0;
        this.totalProfessors = response.total_profesores || 0;
        this.pendingRegistrations = response.pendientes || 0;
        this.activeUsers = response.activos || 0;
      },
      error: (error) => {
        console.error('Error cargando stats:', error);
      }
    });

    // Cargar estudiantes
    this.loadStudents();

    // Cargar profesores
    this.loadProfessors();

    // Cargar notificaciones
    this.http.get(`${this.apiUrl}/notificaciones/no-leidas/count`).subscribe({
      next: (response: any) => {
        this.notificationCount = response.count || 0;
      },
      error: (error) => console.error('Error notificaciones:', error)
    });
  }

  loadStudents(): void {
    const params = new URLSearchParams();
    if (this.selectedGrade !== 'all') params.append('grado', this.selectedGrade);
    if (this.selectedGroup !== 'all') params.append('grupo_id', this.selectedGroup);
    if (this.selectedStatus !== 'all') params.append('estado', this.selectedStatus);
    if (this.searchQuery) params.append('search', this.searchQuery);

    this.http.get(`${this.apiUrl}/admin/estudiantes?${params.toString()}`).subscribe({
      next: (response: any) => {
        this.students = Array.isArray(response) ? response : [];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error cargando estudiantes:', error);
        this.students = [];
        this.isLoading = false;
      }
    });
  }

  loadProfessors(): void {
    const params = new URLSearchParams();
    if (this.searchQueryProf) params.append('search', this.searchQueryProf);

    this.http.get(`${this.apiUrl}/admin/profesores?${params.toString()}`).subscribe({
      next: (response: any) => {
        this.professors = Array.isArray(response) ? response : [];
      },
      error: (error) => {
        console.error('Error cargando profesores:', error);
        this.professors = [];
      }
    });
  }

  get filteredStudents(): Student[] {
    return this.students;
  }

  get filteredProfessors(): Professor[] {
    return this.professors;
  }

  // Aplicar filtros
  applyFilters(): void {
    this.loadStudents();
  }

  applyProfessorSearch(): void {
    this.loadProfessors();
  }

  setMainTab(tab: 'resumen' | 'estudiantes' | 'profesores' | 'registrar'): void {
    this.activeMainTab = tab;
    
    if (tab === 'estudiantes') {
      this.loadStudents();
    } else if (tab === 'profesores') {
      this.loadProfessors();
    }
  }

  setRegisterTab(tab: 'estudiante' | 'profesor'): void {
    this.activeRegisterTab = tab;
  }

  openStudentInfo(student: Student): void {
    // Cargar detalles completos
    this.http.get(`${this.apiUrl}/admin/estudiantes/${student.id_estudiante}`).subscribe({
      next: (response: any) => {
        this.selectedStudent = response;
        this.showStudentInfoModal = true;
      },
      error: (error) => {
        console.error('Error cargando detalles:', error);
        alert('Error al cargar información del estudiante');
      }
    });
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
    if (!this.selectedStudent) return;

    this.http.put(
      `${this.apiUrl}/admin/estudiantes/${this.selectedStudent.id_estudiante}`,
      this.selectedStudent
    ).subscribe({
      next: () => {
        alert('Estudiante actualizado exitosamente');
        this.closeEditStudent();
        this.loadStudents();
      },
      error: (error) => {
        console.error('Error actualizando:', error);
        alert('Error al actualizar estudiante');
      }
    });
  }

  openProfessorInfo(professor: Professor): void {
    this.http.get(`${this.apiUrl}/admin/profesores/${professor.id_profesor}`).subscribe({
      next: (response: any) => {
        this.selectedProfessor = response;
        this.showProfessorInfoModal = true;
      },
      error: (error) => {
        console.error('Error cargando profesor:', error);
        alert('Error al cargar información');
      }
    });
  }

  closeProfessorInfo(): void {
    this.showProfessorInfoModal = false;
    this.selectedProfessor = null;
  }

  // Dar de baja
  openBajaModal(): void {
    this.bajaNumUsuario = '';
    this.bajaConfirmacion = '';
    this.showBajaModal = true;
  }

  closeBajaModal(): void {
    this.showBajaModal = false;
    this.bajaNumUsuario = '';
    this.bajaConfirmacion = '';
  }

  confirmarBaja(): void {
    if (!this.bajaNumUsuario) {
      alert('Ingresa el número de usuario');
      return;
    }

    if (this.bajaConfirmacion.toLowerCase() !== 'confirmar') {
      alert('Debes escribir "CONFIRMAR" para proceder');
      return;
    }

    this.http.post(`${this.apiUrl}/admin/dar-baja`, {
      num_usuario: this.bajaNumUsuario
    }).subscribe({
      next: (response: any) => {
        alert(`Usuario dado de baja. Se eliminará el ${response.fecha_eliminacion}\nSe ha notificado a: ${response.email_notificacion}`);
        this.closeBajaModal();
        this.loadDashboardData();
      },
      error: (error) => {
        console.error('Error dando de baja:', error);
        alert(error.error?.error || 'Error al dar de baja');
      }
    });
  }

  registerNewStudent(): void {
    if (!this.newStudent.nombres || !this.newStudent.apellidoPaterno || 
        !this.newStudent.curp || !this.newStudent.grado) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    this.http.post(`${this.apiUrl}/admin/registro-estudiante`, this.newStudent).subscribe({
      next: (response: any) => {
        alert(`Estudiante registrado exitosamente\nUsuario: ${response.num_usuario}\nContraseña temporal: ${response.password_temporal}`);
        this.clearForm();
        this.loadStudents();
        this.setMainTab('estudiantes');
      },
      error: (error) => {
        console.error('Error registrando:', error);
        alert(error.error?.error || 'Error al registrar');
      }
    });
  }

  registerNewProfessor(): void {
    if (!this.newProfessor.nombres || !this.newProfessor.apellidoPaterno ||
        !this.newProfessor.correoInstitucional) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    this.http.post(`${this.apiUrl}/admin/registro-profesor`, this.newProfessor).subscribe({
      next: (response: any) => {
        alert(`Profesor registrado exitosamente\nUsuario: ${response.num_usuario}\nContraseña temporal: ${response.password_temporal}`);
        this.clearForm();
        this.loadProfessors();
        this.setMainTab('profesores');
      },
      error: (error) => {
        console.error('Error registrando:', error);
        alert(error.error?.error || 'Error al registrar');
      }
    });
  }

  clearForm(): void {
    if (this.activeRegisterTab === 'estudiante') {
      this.newStudent = {
        nombres: '', apellidoPaterno: '', apellidoMaterno: '',
        fechaNacimiento: '', curp: '', telefono: '', grado: '',
        grupoId: null, tipoEstudiante: 'NUEVO_INGRESO',
        nombreTutor: '', correoTutor: '', telefonoTutor: '',
        estado: '', municipio: '', ciudad: '', codigoPostal: null
      };
    } else {
      this.newProfessor = {
        nombres: '', apellidoPaterno: '', apellidoMaterno: '',
        correoInstitucional: '', correoPersonal: '', telefono: '',
        nivelEducativo: '', especializacion: '', departamento: '',
        puesto: '', tipoContrato: '', fechaInicio: '', salarioMensual: null
      };
    }
  }

  getDocumentProgressPercentage(student: Student): number {
    if (student.documentos_requeridos === 0) return 0;
    return (student.documentos_aprobados / student.documentos_requeridos) * 100;
  }

  getStatusLabel(student: Student): string {
    if (!student.activo) return 'Inactivo';
    if (student.tipo_estudiante === 'NUEVO_INGRESO') return 'Nuevo Ingreso';
    if (student.tipo_estudiante === 'REINGRESO') return 'Reingreso';
    return 'Activo';
  }

  getInitials(name: string): string {
    const parts = name.split(' ');
    return parts.length >= 2 ? 
      (parts[0][0] + parts[1][0]).toUpperCase() : 
      name.substring(0, 2).toUpperCase();
  }

  loadNavigation(): void {
    this.navigationItems = [
      { icon: 'home', label: 'Inicio', route: '/admin-dashboard', badge: 0 },
      { icon: 'file-text', label: 'Documentos', route: '/admin-documentos', badge: 0 },
      { icon: 'folder', label: 'Gestión', route: '/admin-gestion', badge: 0 },
      { icon: 'user', label: 'Perfil', route: '/admin-perfil', badge: 0 }
    ];
  }

  navigateTo(route: string): void {
    this.currentRoute = route;
    this.router.navigate([route]);
  }

  getIcon(iconName: string): string {
    const icons: { [key: string]: string } = {
      'home': 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
      'file-text': 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8',
      'folder': 'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z',
      'user': 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z'
    };
    return icons[iconName] || icons['file-text'];
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['']);
  }
}

