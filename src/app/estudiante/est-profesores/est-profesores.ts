import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NotificationsComponent } from '../../notificaciones/notificaciones';
import { ProfesoresService, Profesor } from '../../services/profesores.service';
import { AuthService } from '../../auth.service';

// --- Interfaces ---
interface NavItem {
  icon: string;
  label: string;
  route: string;
  badge?: number;
}

interface UserDetails {
  nombres: string;
  apellido_paterno: string;
  apellido_materno?: string;
  nivel_educativo?: string;
  semestre?: number;
  grado?: number;
  grupo_id?: number;
  grupo_turno?: string;
  turno?: string;
}

// --- Constantes ---
const ICONS_MAP: { [key: string]: string } = {
  'home': 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  'folder': 'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z',
  'material': 'M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25',
  'users': 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  'user': 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z'
};

@Component({
  selector: 'app-est-profesores',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NotificationsComponent],
  templateUrl: './est-profesores.html',
  styleUrls: ['./est-profesores.css']
})
export class EstProfesoresComponent implements OnInit {
  // Datos Usuario
  userName: string = '';
  userAccountNumber: string = '';
  userCareer: string = '';
  userRole: string = 'Estudiante';
  userGradeGroup: string = '';
  
  // Navegación
  currentRoute: string = '/est-profesores';
  navigationItems: NavItem[] = [];

  // Filtros
  searchText: string = '';
  selectedSubject: string = 'todas';
  selectedDepartment: string = 'todos';

  // Datos Profesores
  profesores: Profesor[] = [];
  filteredProfesores: Profesor[] = [];
  
  // Opciones de Filtros Dinámicos
  subjects: { value: string; label: string }[] = [];
  departments: string[] = [];

  // Estado
  totalProfessors: number = 0;
  isLoading: boolean = true;

  constructor(
    private router: Router,
    private profesoresService: ProfesoresService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.loadNavigation();
    this.loadProfesores();
    this.currentRoute = this.router.url;
  }

  loadUserData(): void {
    const user = this.authService.getCurrentUser();
    if (user && user.detalles) {
      const d = user.detalles;
      this.userRole = (user.rol || 'estudiante').toLowerCase();

      // Nombre
      this.userName = `${d.nombres} ${d.apellido_paterno} ${d.apellido_materno || ''}`.trim();
      this.userAccountNumber = user.num_usuario;
      this.userCareer = d.nivel_educativo || 'Estudiante';
      
      // Construcción de Datos Académicos
      const partesAcad = [];
      
      if (d.semestre) {
        partesAcad.push(`${d.semestre}° Semestre`);
      } else if (d.grado) {
        partesAcad.push(`${d.grado}° Grado`);
      }

      if (d.grupo_id) {
        partesAcad.push(`Grupo ${d.grupo_id}`);
      }

      const turno = d.grupo_turno || d.turno; 
      if (turno) {
        const turnoFormato = turno.charAt(0).toUpperCase() + turno.slice(1).toLowerCase();
        partesAcad.push(turnoFormato);
      }

      this.userGradeGroup = partesAcad.length > 0 ? partesAcad.join(' • ') : 'Sin asignación';
    }
  }

  loadNavigation(): void {
    this.navigationItems = [
      { icon: 'home', label: 'Inicio', route: '/est-dashboard', badge: 0 },
      { icon: 'file-text', label: 'Documentos', route: '/est-documentos', badge: 0 },
      { icon: 'material', label: 'Materiales', route: '/est-materiales', badge: 0 },
      { icon: 'users', label: 'Profesores', route: '/est-profesores', badge: 0 },
      { icon: 'user', label: 'Perfil', route: '/est-perfil', badge: 0 }
    ];
  }

  loadProfesores(): void {
    this.isLoading = true;

    this.profesoresService.getMisProfesores().subscribe({
      next: (profesores) => {
        console.log('[EST-PROFESORES] Recibidos:', profesores.length);
        this.profesores = profesores;
        this.extractFilters();
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('[EST-PROFESORES] Error:', error);
        this.isLoading = false;
      }
    });
  }

  extractFilters(): void {
    const materiasSet = new Set<string>();
    this.profesores.forEach(prof => {
      if (prof.materia) materiasSet.add(prof.materia);
    });

    this.subjects = [
      { value: 'todas', label: 'Todas las materias' },
      ...Array.from(materiasSet).map(mat => ({ value: mat, label: mat }))
    ];

    // Departamentos únicos
    const deptoSet = new Set(
      this.profesores.filter(p => p.departamento).map(p => p.departamento!)
    );
    this.departments = ['todos', ...Array.from(deptoSet).sort()];
  }

  applyFilters(): void {
    let filtered = [...this.profesores];
    const search = this.searchText.toLowerCase().trim();

    // Búsqueda
    if (search) {
      filtered = filtered.filter(prof =>
        prof.nombre_completo.toLowerCase().includes(search) ||
        prof.correo.toLowerCase().includes(search) ||
        (prof.materia && prof.materia.toLowerCase().includes(search))
      );
    }

    // Filtro Materia
    if (this.selectedSubject !== 'todas') {
      filtered = filtered.filter(prof => prof.materia === this.selectedSubject);
    }

    // Filtro Departamento
    if (this.selectedDepartment !== 'todos') {
      filtered = filtered.filter(prof => prof.departamento === this.selectedDepartment);
    }

    this.filteredProfesores = filtered;
    this.totalProfessors = filtered.length;
  }

  onSearchChange(): void { this.applyFilters(); }
  onFilterChange(): void { this.applyFilters(); }

  // Navegación a Chat
  irAlChat(profesor: Profesor): void {
    if (event) event.stopPropagation();
    
    console.log('[EST-PROFESORES] Chat con:', profesor.id_profesor);
    this.router.navigate(['/est-profesores-chat', profesor.id_profesor]);
  }

  // Lógica Visual
  getEstadoConexion(profesor: Profesor): 'En línea' | 'Desconectado' {
    if (!profesor.fecha_ultimo_mensaje) return 'Desconectado';
    
    const fecha = new Date(profesor.fecha_ultimo_mensaje);
    const diffMinutos = Math.floor((new Date().getTime() - fecha.getTime()) / 60000);
    
    return diffMinutos < 10 ? 'En línea' : 'Desconectado';
  }

  getEstadoConexionClass(estado: string): string {
    return estado === 'En línea' ? 'status-online' : 'status-offline';
  }

  formatLastMessageTime(fecha: string | null): string {
    if (!fecha) return '';
    const date = new Date(fecha);
    const diffMins = Math.floor((new Date().getTime() - date.getTime()) / 60000);
    
    if (diffMins < 1) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Hace ${diffHours} h`;
    
    return date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
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