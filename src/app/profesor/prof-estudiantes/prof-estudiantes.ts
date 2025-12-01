import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { EstudiantesProfesorService, Estudiante } from '../../services/estudiantes-profesor.service';
import { AuthService } from '../../auth.service';
import { NotificationsComponent } from '../../notificaciones/notificaciones';

interface NavItem {
  icon: string;
  label: string;
  route: string;
  badge?: number;
}

interface FilterOption {
  value: string;
  label: string;
}

// --- Constantes ---
const ICONS_MAP: { [key: string]: string } = {
  'home': 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  'material': 'M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25',
  'users': 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  'user': 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  'file-text': 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8'
};

@Component({
  selector: 'app-prof-estudiantes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NotificationsComponent],
  providers: [DatePipe],
  templateUrl: './prof-estudiantes.html',
  styleUrls: ['./prof-estudiantes.css']
})
export class ProfEstudiantesComponent implements OnInit {
  // Datos Usuario
  userRole: string = 'Profesor';
  userName: string = '';
  userAccountNumber: string = '';
  userMateria: string = '';
  
  // Navegación
  currentRoute: string = '/prof-estudiantes';
  navigationItems: NavItem[] = [];

  // Filtros
  searchText: string = '';
  selectedSubject: string = 'todas';
  selectedGrade: string = 'todos';
  selectedGroup: string = 'todos';

  // Datos Estudiantes
  estudiantes: Estudiante[] = [];
  filteredEstudiantes: Estudiante[] = [];
  
  // Opciones Filtros
  subjects: FilterOption[] = [];
  grades: string[] = [];
  groups: string[] = [];
  
  // Estado
  totalStudents: number = 0;
  isLoading: boolean = true;

  constructor(
    private router: Router,
    private estudiantesService: EstudiantesProfesorService,
    private authService: AuthService,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    if (!this.checkAuth()) return;

    this.currentRoute = this.router.url;
    this.loadUserData();
    this.loadNavigation();
    this.loadEstudiantes();
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
      const detalles = user.detalles;
      this.userName = `${detalles.nombres || ''} ${detalles.apellido_paterno || ''} ${detalles.apellido_materno || ''}`.trim();
      this.userAccountNumber = user.num_usuario;
      this.userMateria = detalles.departamento || 'Profesor';
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

  loadEstudiantes(): void {
    this.isLoading = true;

    this.estudiantesService.getMisEstudiantes().subscribe({
      next: (estudiantes) => {
        console.log('[PROF-ESTUDIANTES] Recibidos:', estudiantes.length);
        this.estudiantes = estudiantes;
        this.extractFilters();
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('[PROF-ESTUDIANTES] Error:', error);
        this.isLoading = false;
        // No alertamos para no interrumpir flujo visual si es error temporal
      }
    });
  }

  extractFilters(): void {
    const materiasSet = new Set<string>();
    const gruposSet = new Set<string>();
    const gradosSet = new Set<string>();

    this.estudiantes.forEach(est => {
      // Materias
      if (est.materias_comunes) {
        est.materias_comunes.forEach(mat => materiasSet.add(mat));
      }
      // Grupos
      if (est.grupo_nombre) {
        gruposSet.add(est.grupo_nombre);
      }
      // Grados
      if (est.grado) {
        gradosSet.add(est.grado.toString());
      }
    });
    
    this.subjects = [
      { value: 'todas', label: 'Todas mis materias' },
      ...Array.from(materiasSet).map(mat => ({ value: mat, label: mat }))
    ];

    this.grades = ['todos', ...Array.from(gradosSet).sort()];
    this.groups = ['todos', ...Array.from(gruposSet).sort()];
  }

  applyFilters(): void {
    let filtered = [...this.estudiantes];
    const search = this.searchText.toLowerCase().trim();

    // 1. Búsqueda
    if (search) {
      filtered = filtered.filter(est => 
        est.nombre_completo.toLowerCase().includes(search) ||
        est.num_usuario.includes(search) ||
        est.correo.toLowerCase().includes(search)
      );
    }

    // 2. Materia
    if (this.selectedSubject !== 'todas') {
      filtered = filtered.filter(est => 
        est.materias_comunes && est.materias_comunes.includes(this.selectedSubject)
      );
    }

    // 3. Grado
    if (this.selectedGrade !== 'todos') {
      filtered = filtered.filter(est => est.grado.toString() === this.selectedGrade);
    }

    // 4. Grupo
    if (this.selectedGroup !== 'todos') {
      filtered = filtered.filter(est => est.grupo_nombre === this.selectedGroup);
    }

    this.filteredEstudiantes = filtered;
    this.totalStudents = filtered.length;
  }

  // Event Handlers
  onSearchChange(): void { this.applyFilters(); }
  onFilterChange(): void { this.applyFilters(); }

  // Navegación a Chat
  irAlChat(estudiante: Estudiante): void {
    // Evitar propagación
    if (event) event.stopPropagation();
    
    console.log('[PROF-ESTUDIANTES] Chat con:', estudiante.id_estudiante);
    this.router.navigate(['/prof-chat-estudiantes', estudiante.id_estudiante]);
  }

  // Lógica Visual
  getGrupoCode(grado: number, grupo_nombre: string | null): string {
    if (!grupo_nombre) return `${grado}° - Sin grupo`;
    
    // Extraer turno del nombre del grupo si existe (ej: "1° Matutino")
    // Si no, usar lógica por defecto
    const turno = grupo_nombre.toLowerCase().includes('matutino') ? 'M' : 
                  grupo_nombre.toLowerCase().includes('vespertino') ? 'V' : '';
                  
    return `${grado}° - ${grupo_nombre.split(' ')[0]}${turno}`;
  }

  getEstadoConexion(estudiante: Estudiante): 'En línea' | 'Desconectado' {
    if (!estudiante.fecha_ultimo_mensaje) return 'Desconectado';
    
    const fecha = new Date(estudiante.fecha_ultimo_mensaje);
    const diffMinutos = Math.floor((new Date().getTime() - fecha.getTime()) / 60000);
    
    return diffMinutos < 10 ? 'En línea' : 'Desconectado';
  }

  getEstadoConexionClass(estado: string): string {
    return estado === 'En línea' ? 'status-online' : 'status-offline';
  }

  formatLastMessageTime(fecha: string | null): string {
    if (!fecha) return '';
    
    const date = new Date(fecha);
    const diffMs = new Date().getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} h`;
    if (diffDays < 7) return `Hace ${diffDays} días`;
    
    return this.datePipe.transform(date, 'dd MMM') || '';
  }

  navigateTo(route: string): void {
    this.currentRoute = route;
    this.router.navigate([route]);
  }

  getIcon(n: string): string { return ICONS_MAP[n] || ICONS_MAP['users']; }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['']);
  }
}
