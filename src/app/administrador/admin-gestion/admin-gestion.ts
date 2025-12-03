import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { NotificationsComponent } from '../../notificaciones/notificaciones';
import { environment } from '../../../environments/environment.development';

export interface Student {
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
  semestre: number;
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
  fecha_nacimiento: string;
  estado?: string;      
  municipio?: string;
  ciudad?: string;  
  calle?: string;  
  codigo_postal?: number;
  observaciones: string;
}

export interface Professor {
  departamento: any;
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

// --- Constantes Estáticas ---
const AVAILABLE_SUBJECTS: string[] = [
  'Matemáticas', 'Física', 'Química', 'Biología',
  'Historia', 'Literatura', 'Filosofía', 'Psicología',
  'Sociología', 'Economía', 'Inglés', 'Educación Física',
  'Arte', 'Música', 'Computación', 'Geografía'
];

const AVAILABLE_DAYS = [
  { value: 'lunes', label: 'Lunes' },
  { value: 'martes', label: 'Martes' },
  { value: 'miercoles', label: 'Miércoles' },
  { value: 'jueves', label: 'Jueves' },
  { value: 'viernes', label: 'Viernes' },
  { value: 'sabado', label: 'Sábado' },
  { value: 'domingo', label: 'Domingo' }
];

const ICONS_MAP: { [key: string]: string } = {
  'home': 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  'file-text': 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8',
  'folder': 'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z',
  'user': 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z'
};

@Component({
  selector: 'app-admin-gestion',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NotificationsComponent],
  templateUrl: './admin-gestion.html',
  styleUrls: ['./admin-gestion.css']
})
export class AdminGestionComponent implements OnInit {
  private apiUrl = environment.apiUrl;

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
  showEditProfessorModal: boolean = false;
  showBajaModal: boolean = false;

  showModal: boolean = false;       
  isEditing: boolean = false;      
  selectedUsuario: any = null;
  
  // Selección
  selectedStudent: Student | null = null;
  selectedProfessor: Professor | null = null;
  
  // Filtros y Búsqueda
  searchQuery: string = '';
  selectedGrade: string = 'all';
  selectedGroup: string = 'all';
  selectedStatus: string = 'all';
  searchQueryProf: string = '';

  // Filtros Profesores 
  selectedProfDept: string = 'all';
  selectedProfContract: string = 'all';
  selectedProfStatus: string = 'all';

  // Stats
  totalStudents: number = 0;
  totalProfessors: number = 0;
  pendingRegistrations: number = 0;
  activeUsers: number = 0;

  // Data
  students: Student[] = [];
  professors: Professor[] = [];
  isLoading: boolean = true;

  // Baja
  bajaNumUsuario: string = '';
  bajaConfirmacion: string = '';

  // Datos Estáticos para la vista
  availableSubjects = AVAILABLE_SUBJECTS;
  availableDays = AVAILABLE_DAYS;

  // Forms
  newStudent = this.getInitialStudentForm();
  newProfessor = this.getInitialProfessorForm();

  navigationItems: NavItem[] = [];

  constructor(
    private router: Router,
    private http: HttpClient
  ) {
    console.log('[GESTION] Componente inicializado');
  }

  ngOnInit(): void {
    if (!this.checkAuth()) return;
    
    this.currentRoute = this.router.url;
    this.loadUserData();
    this.loadNavigation();
    this.loadDashboardData();
  }

  // --- Auth & User ---
  private checkAuth(): boolean {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Sesión expirada');
      this.router.navigate(['']);
      return false;
    }
    return true;
  }

  loadUserData(): void {
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        this.userName = user.detalles?.nombres 
          ? `${user.detalles.nombres} ${user.detalles.apellido_paterno || ''}`.trim() 
          : (user.correo || 'Usuario');
        this.userRole = (user.rol || 'ADMINISTRADOR').toLowerCase();
      } catch (e) {
        console.error('Error parsing user data', e);
      }
    }
  }

  loadDashboardData(): void {
    this.isLoading = true;

    // Ejecutamos todo en paralelo
    forkJoin({
      stats: this.http.get<any>(`${this.apiUrl}/admin/stats`).pipe(catchError(() => of({}))),
      students: this.getStudentsObservable(),
      professors: this.getProfessorsObservable(),
      notifications: this.http.get<any>(`${this.apiUrl}/notificaciones/no-leidas/count`).pipe(catchError(() => of({ count: 0 })))
    }).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (results) => {
        // Stats
        this.totalStudents = results.stats.total_estudiantes || 0;
        this.totalProfessors = results.stats.total_profesores || 0;
        this.pendingRegistrations = results.stats.pendientes || 0;
        this.activeUsers = results.stats.activos || 0;

        // Listas
        this.students = results.students;
        this.professors = results.professors;

        // Notificaciones
        this.notificationCount = results.notifications.count || 0;
      }
    });
  }

  // --- Lógica de Estudiantes ---
  private getStudentsObservable() {
    let params = new HttpParams();
    if (this.selectedGrade !== 'all') params = params.set('semestre', this.selectedGrade);
    if (this.selectedGroup !== 'all') params = params.set('grupo_id', this.selectedGroup);
    if (this.selectedStatus !== 'all') params = params.set('estado', this.selectedStatus);
    if (this.searchQuery) params = params.set('search', this.searchQuery);

    return this.http.get<Student[]>(`${this.apiUrl}/admin/estudiantes`, { params }).pipe(
      catchError(err => {
        console.error('Error loading students', err);
        return of([]);
      })
    );
  }

  loadStudents(): void {
    // Usado por los filtros para recargar solo estudiantes
    this.isLoading = true;
    this.getStudentsObservable().pipe(
      finalize(() => this.isLoading = false)
    ).subscribe(data => this.students = data);
  }

  // --- Lógica de Profesores ---
  private getProfessorsObservable() {
    let params = new HttpParams();
    if (this.searchQueryProf) params = params.set('search', this.searchQueryProf);
    
    if (this.selectedProfDept !== 'all') params = params.set('departamento', this.selectedProfDept);
    if (this.selectedProfContract !== 'all') params = params.set('tipo_contrato', this.selectedProfContract);
    if (this.selectedProfStatus !== 'all') params = params.set('activo', this.selectedProfStatus); 

    return this.http.get<any[]>(`${this.apiUrl}/admin/profesores`, { params }).pipe(
      catchError(err => {
        console.error('Error loading professors', err);
        return of([]);
      })
    );
  }

  loadProfessors(): void {
    this.getProfessorsObservable().subscribe(data => this.professors = data);
  }

  get filteredStudents(): Student[] {
    return this.students;
  }

  get filteredProfessors(): Professor[] {
    return this.professors;
  }

  applyFilters(): void {
    this.loadStudents();
  }

  applyProfessorSearch(): void {
    this.loadProfessors();
  }

  applyProfessorFilters(): void {
    this.loadProfessors();
  }

  setMainTab(tab: 'resumen' | 'estudiantes' | 'profesores' | 'registrar'): void {
    this.activeMainTab = tab;
    if (tab === 'estudiantes' && this.students.length === 0) this.loadStudents();
    if (tab === 'profesores' && this.professors.length === 0) this.loadProfessors();
  }

  setRegisterTab(tab: 'estudiante' | 'profesor'): void {
    this.activeRegisterTab = tab;
  }
  
  // Estudiantes
  openStudentInfo(student: Student): void {
    this.http.get<Student>(`${this.apiUrl}/admin/estudiantes/${student.id_estudiante}`).subscribe({
      next: (data) => {
        this.selectedStudent = data;
        this.showStudentInfoModal = true;
        this.showEditStudentModal = false;
      },
      error: () => alert('Error al cargar información del estudiante')
    });
  }

  closeStudentInfo(): void {
    this.showStudentInfoModal = false;
    this.selectedStudent = null;
  }

  openEditStudent(student: any): void {
    this.selectedStudent = JSON.parse(JSON.stringify(student)); 
    this.showStudentInfoModal = false; 
    this.showEditStudentModal = true;  
  }

  closeEditStudent(): void {
    this.showEditStudentModal = false;
    this.selectedStudent = null;
  }

  saveStudentChanges(): void {
    if (!this.selectedStudent) return;

    // 1. Preparar el objeto limpio (Payload)
    // Solo mandamos lo que el backend espera recibir en el PUT
    const payload = {
      nombres: this.selectedStudent.nombres,
      apellido_paterno: this.selectedStudent.apellido_paterno,
      apellido_materno: this.selectedStudent.apellido_materno || '',
      curp: this.selectedStudent.curp,
      // Formatear fecha a YYYY-MM-DD si existe
      fecha_nacimiento: this.formatDate(this.selectedStudent.fecha_nacimiento),
      telefono: this.selectedStudent.telefono || '',
      correo: this.selectedStudent.correo,
      
      // Datos del Tutor
      nombre_tutor: this.selectedStudent.nombre_tutor,
      correo_tutor: this.selectedStudent.correo_tutor,
      telefono_tutor: this.selectedStudent.telefono_tutor,
      
      // Datos Académicos
      semestre: this.selectedStudent.semestre,
      grupo_id: this.selectedStudent.grupo_id,
      tipo_estudiante: this.selectedStudent.tipo_estudiante,
      activo: this.selectedStudent.activo,
      observaciones: this.selectedStudent.observaciones || '', // Asegúrate de agregar este campo a la interfaz si falta

      // Dirección (Nuevos campos que querías agregar)
      estado: this.selectedStudent.estado || '',
      municipio: this.selectedStudent.municipio || '',
      ciudad: this.selectedStudent.ciudad || '',
      calle: this.selectedStudent.calle || '',
      codigo_postal: this.selectedStudent.codigo_postal || 0
    };

    this.http.put(`${this.apiUrl}/admin/estudiantes/${this.selectedStudent.id_estudiante}`, payload)
      .subscribe({
        next: () => {
          alert('Estudiante actualizado exitosamente');
          this.closeEditStudent();
          this.loadStudents();
        },
        error: (err) => {
          console.error('Error update student:', err);
          alert('Error al actualizar: ' + (err.error?.error || err.message));
        }
      });
  }

  // Profesores
  openProfessorInfo(professor: Professor): void {
    this.http.get<Professor>(`${this.apiUrl}/admin/profesores/${professor.id_profesor}`).subscribe({
      next: (data) => {
        this.selectedProfessor = data;
        this.showProfessorInfoModal = true;
        this.showEditProfessorModal = false;
      },
      error: () => alert('Error al cargar información')
    });
  }

  closeProfessorInfo(): void {
    this.showProfessorInfoModal = false;
    this.selectedProfessor = null;
  }

  openEditProfessor(professor: Professor): void {
    this.selectedProfessor = { ...professor };
    this.showEditProfessorModal = true;
    this.closeProfessorInfo();
  }

  closeEditProfessor(): void {
    this.showEditProfessorModal = false;
    this.selectedProfessor = null;
  }

  saveProfessorChanges(): void {
    if (!this.selectedProfessor) return;

    const payload = {
      nombres: this.selectedProfessor.nombres,
      apellido_paterno: this.selectedProfessor.apellido_paterno,
      apellido_materno: this.selectedProfessor.apellido_materno || '',
      correo: this.selectedProfessor.correo,
      telefono: this.selectedProfessor.telefono || '',
      
      // Datos Profesionales
      departamento: this.selectedProfessor.departamento,
      licenciatura: this.selectedProfessor.licenciatura || '',
      activo: this.selectedProfessor.activo,
      
      // Campos adicionales que podrías necesitar agregar a la interfaz si no existen
      // observaciones: this.selectedProfessor.observaciones || ''
    };

    this.http.put(`${this.apiUrl}/admin/profesores/${this.selectedProfessor.id_profesor}`, payload)
      .subscribe({
        next: () => {
          alert('Profesor actualizado exitosamente');
          this.closeEditProfessor();
          this.loadProfessors();
        },
        error: (err) => {
          console.error('Error update professor:', err);
          alert('Error al actualizar profesor: ' + (err.error?.error || err.message));
        }
      });
  }

  // Función auxiliar para formatear fechas (Ponla al final de tu clase)
  private formatDate(dateString: string): string {
    if (!dateString) return '';
    // Si ya viene como YYYY-MM-DD, la dejamos así
    if (dateString.includes('T')) {
      return dateString.split('T')[0];
    }
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString; // Si no es válida, devolver original
      return date.toISOString().split('T')[0];
    } catch (e) {
      return dateString;
    }
  }

  // Baja de Usuarios
  openBajaModal(): void {
    this.bajaNumUsuario = '';
    this.bajaConfirmacion = '';
    this.showBajaModal = true;
  }

  closeBajaModal(): void {
    this.showBajaModal = false;
  }

  confirmarBaja(): void {
    if (!this.bajaNumUsuario || this.bajaConfirmacion.toLowerCase() !== 'confirmar') {
      alert('Datos incorrectos');
      return;
    }

    this.http.post<any>(`${this.apiUrl}/admin/dar-baja`, { num_usuario: this.bajaNumUsuario })
      .subscribe({
        next: (res) => {
          alert(`Usuario dado de baja. Se eliminará el ${res.fecha_eliminacion}\nNotificado a: ${res.email_notificacion}`);
          this.closeBajaModal();
          this.loadDashboardData();
        },
        error: (err) => alert(err.error?.error || 'Error al dar de baja')
      });
  }

  // --- Registro (Create) ---
  registerNewStudent(): void {
    if (!this.isStudentFormValid()) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    this.http.post<any>(`${this.apiUrl}/admin/registro-estudiante`, this.newStudent).subscribe({
      next: (res) => {
        alert(`Estudiante registrado.\nUsuario: ${res.num_usuario}\nPass: ${res.password_temporal}`);
        this.clearForm();
        this.loadStudents();
        this.setMainTab('estudiantes');
      },
      error: (err) => alert(err.error?.error || 'Error al registrar')
    });
  }

  registerNewProfessor(): void {
    if (!this.isProfessorFormValid()) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    this.http.post<any>(`${this.apiUrl}/admin/registro-profesor`, this.newProfessor).subscribe({
      next: (res) => {
        alert(`Profesor registrado.\nUsuario: ${res.num_usuario}\nPass: ${res.password_temporal}`);
        this.clearForm();
        this.loadProfessors();
        this.setMainTab('profesores');
      },
      error: (err) => alert(err.error?.error || 'Error al registrar')
    });
  }

  // --- Helpers de Formulario ---
  private getInitialStudentForm() {
    return {
      nombres: '', apellidoPaterno: '', apellidoMaterno: '',
      fechaNacimiento: '', curp: '', telefono: '', correo: '', semestre: '',
      grupoId: null as number | null, tipoEstudiante: 'NUEVO_INGRESO',
      nombreTutor: '', correoTutor: '', telefonoTutor: '',
      estado: '', municipio: '', ciudad: '', codigoPostal: null as number | null,
      observaciones: ''
    };
  }

  private getInitialProfessorForm() {
    return {
      nombres: '', apellidoPaterno: '', apellidoMaterno: '',
      correo: '', telefono: '',
      nivelEducativo: '', especializacion: '', departamento: '',
      puesto: '', tipoContrato: '', fechaInicio: '', salarioMensual: null as number | null,
      subjects: [] as string[], availableDays: [] as string[], preferredSchedule: '',
      maxHoursPerWeek: '', yearsExperience: '', certifications: '',
      observaciones: ''
    };
  }

  clearForm(): void {
    if (this.activeRegisterTab === 'estudiante') {
      this.newStudent = this.getInitialStudentForm();
    } else {
      this.newProfessor = this.getInitialProfessorForm();
    }
  }

  private isStudentFormValid(): boolean {
    const s = this.newStudent;
    return !!(s.nombres && s.apellidoPaterno && s.curp && s.semestre && s.nombreTutor && s.correoTutor);
  }

  private isProfessorFormValid(): boolean {
    const p = this.newProfessor;
    return !!(p.nombres && p.apellidoPaterno && p.correo);
  }

  // --- Helpers UI ---
  isSubjectSelected(subject: string): boolean {
    return this.newProfessor.subjects.includes(subject);
  }

  toggleSubject(subject: string): void {
    const idx = this.newProfessor.subjects.indexOf(subject);
    idx > -1 ? this.newProfessor.subjects.splice(idx, 1) : this.newProfessor.subjects.push(subject);
  }

  isDaySelected(day: string): boolean {
    return this.newProfessor.availableDays.includes(day);
  }

  toggleDay(day: string): void {
    const idx = this.newProfessor.availableDays.indexOf(day);
    idx > -1 ? this.newProfessor.availableDays.splice(idx, 1) : this.newProfessor.availableDays.push(day);
  }

  getDocumentProgressPercentage(student: Student): number {
    if (!student.documentos_requeridos) return 0;
    return (student.documentos_aprobados / student.documentos_requeridos) * 100;
  }

  getStatusLabel(student: Student): string {
    if (!student.activo) return 'Inactivo';
    if (student.tipo_estudiante === 'NUEVO_INGRESO') return 'Nuevo Ingreso';
    if (student.tipo_estudiante === 'REINGRESO') return 'Reingreso';
    return 'Activo';
  }

  getInitials(name: string): string {
    if (!name) return '';
    const parts = name.split(' ');
    return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.substring(0, 2).toUpperCase();
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
    return ICONS_MAP[iconName] || ICONS_MAP['file-text'];
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    this.router.navigate(['']);
  }
}