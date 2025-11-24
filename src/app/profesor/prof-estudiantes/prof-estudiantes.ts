// src/app/profesor/prof-estudiantes/prof-estudiantes.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EstudiantesProfesorService, Estudiante } from '../../services/estudiantes-profesor.service';
import { AuthService } from '../../auth.service';
import { NotificationsComponent } from '../../notificaciones/notificaciones';

interface NavItem {
  icon: string;
  label: string;
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-prof-estudiantes',
  standalone: true,
  imports: [CommonModule, FormsModule, NotificationsComponent],
  templateUrl: './prof-estudiantes.html',
  styleUrls: ['./prof-estudiantes.css']
})
export class ProfEstudiantesComponent implements OnInit {
  // Datos del usuario
  userRole: string = 'Profesor';
  userName: string = '';
  userAccountNumber: string = '';
  userMateria: string = '';
  currentRoute: string = '/prof-estudiantes';

  // Filtros y búsqueda
  searchText: string = '';
  selectedSubject: string = 'todas';
  selectedGrade: string = 'todos';
  selectedGroup: string = 'todos';
  selectedDocStatus: string = 'todos';

  // Datos
  estudiantes: Estudiante[] = [];
  filteredEstudiantes: Estudiante[] = [];
  subjects: { value: string; label: string }[] = [];
  grades: string[] = [];
  groups: string[] = [];
  
  totalStudents: number = 0;
  navigationItems: NavItem[] = [];
  isLoading: boolean = true;

  constructor(
    private router: Router,
    private estudiantesService: EstudiantesProfesorService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.loadNavigation();
    this.loadEstudiantes();
    this.currentRoute = this.router.url;
  }

  loadUserData(): void {
    const user = this.authService.getCurrentUser();
    if (user && user.detalles) {
      const detalles = user.detalles;
      this.userName = `${detalles.nombres} ${detalles.apellido_paterno} ${detalles.apellido_materno || ''}`.trim();
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
        console.log('[PROF-ESTUDIANTES] Estudiantes recibidos:', estudiantes);
        this.estudiantes = estudiantes;
        
        // Extraer filtros únicos
        this.extractFilters();
        
        // Aplicar filtros iniciales
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('[PROF-ESTUDIANTES] Error cargando estudiantes:', error);
        this.isLoading = false;
        alert('Error al cargar los estudiantes');
      }
    });
  }

  extractFilters(): void {
    // Materias únicas
    const materiasSet = new Set<string>();
    this.estudiantes.forEach(est => {
      if (est.materias_comunes) {
        est.materias_comunes.forEach(mat => materiasSet.add(mat));
      }
    });
    
    this.subjects = [
      { value: 'todas', label: 'Todas mis materias' },
      ...Array.from(materiasSet).map(mat => ({ value: mat, label: mat }))
    ];

    // Grados únicos
    const gradosSet = new Set(this.estudiantes.map(e => e.grado.toString()));
    this.grades = ['todos', ...Array.from(gradosSet).sort()];

    // Grupos únicos
    const gruposSet = new Set(
      this.estudiantes
        .filter(e => e.grupo_nombre)
        .map(e => e.grupo_nombre)
    );
    this.groups = ['todos', ...Array.from(gruposSet).sort()];
  }

  applyFilters(): void {
    let filtered = [...this.estudiantes];

    // Filtro de búsqueda
    if (this.searchText) {
      const search = this.searchText.toLowerCase();
      filtered = filtered.filter(est => 
        est.nombre_completo.toLowerCase().includes(search) ||
        est.num_usuario.includes(search) ||
        est.correo.toLowerCase().includes(search)
      );
    }

    // Filtro de materia
    if (this.selectedSubject !== 'todas') {
      filtered = filtered.filter(est => 
        est.materias_comunes && est.materias_comunes.includes(this.selectedSubject)
      );
    }

    // Filtro de grado
    if (this.selectedGrade !== 'todos') {
      filtered = filtered.filter(est => est.grado.toString() === this.selectedGrade);
    }

    // Filtro de grupo
    if (this.selectedGroup !== 'todos') {
      filtered = filtered.filter(est => est.grupo_nombre === this.selectedGroup);
    }

    // Filtro de documentos
    if (this.selectedDocStatus !== 'todos') {
      filtered = filtered.filter(est => est.estado_documentos === this.selectedDocStatus);
    }

    this.filteredEstudiantes = filtered;
    this.totalStudents = filtered.length;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  irAlChat(estudiante: Estudiante): void {
  console.log('[PROF-ESTUDIANTES] Navegando al chat con estudiante:', estudiante.id_estudiante);
  
  // Prevenir la propagación del evento para evitar múltiples clicks
  event?.stopPropagation();
  
  // Navegar con el ID correcto
  this.router.navigate(['/prof-chat-estudiantes', estudiante.id_estudiante])
    .then(success => {
      if (success) {
        console.log('[PROF-ESTUDIANTES] ✓ Navegación exitosa');
      } else {
        console.error('[PROF-ESTUDIANTES] ✗ Error en navegación');
      }
    })
    .catch(error => {
      console.error('[PROF-ESTUDIANTES] ✗ Error navegando:', error);
    });
}

  getEstadoColor(estado: string): string {
    switch(estado) {
      case 'Completo': return 'status-complete';
      case 'Incompleto': return 'status-incomplete';
      case 'Pendiente': return 'status-pending';
      default: return '';
    }
  }

  formatLastMessageTime(fecha: string | null): string {
    if (!fecha) return '';
    
    const date = new Date(fecha);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Hace unos segundos';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    
    return date.toLocaleDateString();
  }

  navigateTo(route: string): void {
    this.currentRoute = route;
    this.router.navigate([route]);
  }

  getIcon(iconName: string): string {
    const icons: { [key: string]: string } = {
      'home': 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
      'material': 'M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25',
      'users': 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
      'user': 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z'
    };
    return icons[iconName] || icons['users'];
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['']);
  }
}
