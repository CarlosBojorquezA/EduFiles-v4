import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProfesoresService, Profesor } from '../../services/profesores.service';
import { AuthService } from '../../auth.service';
import { NotificationsComponent } from '../../notificaciones/notificaciones';

interface NavItem {
  icon: string;
  label: string;
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-est-profesores',
  standalone: true,
  imports: [CommonModule, FormsModule, NotificationsComponent],
  templateUrl: './est-profesores.html',
  styleUrls: ['./est-profesores.css']
})
export class EstProfesoresComponent implements OnInit {
  userName: string = '';
  userAccountNumber: string = '';
  userCareer: string = '';
  userRole: string = 'Estudiante';
  currentRoute: string = '/est-profesores';

  searchText: string = '';
  selectedSubject: string = 'todas';
  selectedDepartment: string = 'todos';

  profesores: Profesor[] = [];
  filteredProfesores: Profesor[] = [];
  subjects: { value: string; label: string }[] = [];
  departments: string[] = [];

  totalProfessors: number = 0;
  navigationItems: NavItem[] = [];
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
      const detalles = user.detalles;
      this.userName = `${detalles.nombres} ${detalles.apellido_paterno} ${detalles.apellido_materno || ''}`.trim();
      this.userAccountNumber = user.num_usuario;
      this.userCareer = `${detalles.grado}° - ${detalles.nivel_educativo || 'Estudiante'}`;
    }
  }

  loadNavigation(): void {
    this.navigationItems = [
      { icon: 'home', label: 'Inicio', route: '/est-dashboard', badge: 0 },
      { icon: 'folder', label: 'Documentos', route: '/est-documentos', badge: 0 },
      { icon: 'material', label: 'Material', route: '/est-materiales', badge: 0 },
      { icon: 'users', label: 'Profesores', route: '/est-profesores', badge: 0 },
      { icon: 'user', label: 'Perfil', route: '/est-perfil', badge: 0 }
    ];
  }

  loadProfesores(): void {
    this.isLoading = true;

    this.profesoresService.getMisProfesores().subscribe({
      next: (profesores) => {
        console.log('[EST-PROFESORES] Profesores recibidos:', profesores);
        this.profesores = profesores;
        this.extractFilters();
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('[EST-PROFESORES] Error cargando profesores:', error);
        this.isLoading = false;
        alert('Error al cargar los profesores');
      }
    });
  }

  extractFilters(): void {
    // Materias únicas
    const materiasSet = new Set<string>();
    this.profesores.forEach(prof => {
      if (prof.materia) {
        materiasSet.add(prof.materia);
      }
    });

    this.subjects = [
      { value: 'todas', label: 'Todas las materias' },
      ...Array.from(materiasSet).map(mat => ({ value: mat, label: mat }))
    ];

    // Departamentos únicos
    const deptoSet = new Set(
      this.profesores
        .filter(p => p.departamento)
        .map(p => p.departamento!)
    );
    this.departments = ['todos', ...Array.from(deptoSet).sort()];
  }

  applyFilters(): void {
    let filtered = [...this.profesores];

    // Filtro de búsqueda
    if (this.searchText) {
      const search = this.searchText.toLowerCase();
      filtered = filtered.filter(prof =>
        prof.nombre_completo.toLowerCase().includes(search) ||
        prof.correo.toLowerCase().includes(search) ||
        (prof.materia && prof.materia.toLowerCase().includes(search))
      );
    }

    // Filtro de materia
    if (this.selectedSubject !== 'todas') {
      filtered = filtered.filter(prof => prof.materia === this.selectedSubject);
    }

    // Filtro de departamento
    if (this.selectedDepartment !== 'todos') {
      filtered = filtered.filter(prof => prof.departamento === this.selectedDepartment);
    }

    this.filteredProfesores = filtered;
    this.totalProfessors = filtered.length;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  irAlChat(profesor: Profesor): void {
    console.log('[EST-PROFESORES] Navegando al chat con profesor:', profesor.id_profesor);
    event?.stopPropagation();

    this.router.navigate(['/est-profesores-chat', profesor.id_profesor])
      .then(success => {
        if (success) {
          console.log('[EST-PROFESORES] ✓ Navegación exitosa');
        } else {
          console.error('[EST-PROFESORES] ✗ Error en navegación');
        }
      })
      .catch(error => {
        console.error('[EST-PROFESORES] ✗ Error navegando:', error);
      });
  }

  // Determinar estado de conexión del profesor
  getEstadoConexion(profesor: Profesor): 'En línea' | 'Desconectado' {
    if (!profesor.fecha_ultimo_mensaje) return 'Desconectado';

    const fecha = new Date(profesor.fecha_ultimo_mensaje);
    const ahora = new Date();
    const diffMinutos = Math.floor((ahora.getTime() - fecha.getTime()) / 60000);

    // Si el último mensaje fue hace menos de 10 minutos, considerarlo "en línea"
    return diffMinutos < 10 ? 'En línea' : 'Desconectado';
  }

  getEstadoConexionClass(estado: string): string {
    return estado === 'En línea' ? 'status-online' : 'status-offline';
  }

  // Formato de tiempo relativo mejorado
  formatLastMessageTime(fecha: string | null): string {
    if (!fecha) return '';

    const date = new Date(fecha);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Hace unos segundos';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;

    // Formato de fecha específica
    const day = date.getDate();
    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    const month = months[date.getMonth()];

    return `${day} ${month}`;
  }

  navigateTo(route: string): void {
    this.currentRoute = route;
    this.router.navigate([route]);
  }

  getIcon(iconName: string): string {
    const icons: { [key: string]: string } = {
      'home': 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
      'folder': 'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z',
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