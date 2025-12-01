import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { MaterialesService, Material, MaterialStats, MateriaDisponible } from '../../services/materiales.service';
import { AuthService } from '../../auth.service';
import { NotificationsComponent } from '../../notificaciones/notificaciones';

interface NavItem {
  icon: string;
  label: string;
  route: string;
  badge?: number;
}

// --- Constantes ---
const CATEGORIES = [
  { value: 'all', label: 'Todas las categorías' },
  { value: 'APOYO', label: 'Material de Apoyo' },
  { value: 'GUIA', label: 'Guías' },
  { value: 'AVISO', label: 'Avisos Oficiales' },
  { value: 'EXAMEN', label: 'Exámenes' },
  { value: 'TAREA', label: 'Tareas' },
  { value: 'OTRO', label: 'Otros' }
];

const ICONS_MAP: { [key: string]: string } = {
  'home': 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  'file-text': 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8',
  'material': 'M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25',
  'users': 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  'user': 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z'
};

@Component({
  selector: 'app-est-materiales',
  standalone: true,
  imports: [CommonModule, FormsModule, NotificationsComponent],
  templateUrl: './est-materiales.html',
  styleUrls: ['./est-materiales.css']
})
export class EstMaterialesComponent implements OnInit {
  // Filtros y Búsqueda
  searchText: string = '';
  selectedCourse: string | number = 'all'; 
  selectedCategory: string = 'all';
  showCategoryDropdown: boolean = false;
  categories = CATEGORIES;

  // Datos Usuario
  userRole: string = 'estudiante';
  userName: string = '';
  userAccountNumber: string = '';
  userCareer: string = '';
  userGradeGroup: string = '';
  
  // Navegación
  currentRoute: string = '/est-materiales';
  navigationItems: NavItem[] = [];

  // Datos Materiales
  materials: Material[] = [];
  allMaterials: Material[] = [];
  filteredMaterials: Material[] = [];
  materiasDisponibles: MateriaDisponible[] = []; 
  
  // Stats
  totalMaterials: number = 0;
  totalCourses: number = 0;
  newMaterials: number = 0;
  totalProfesores: number = 0;

  // Estado
  isLoading: boolean = true;

  constructor(
    private router: Router,
    private materialesService: MaterialesService,
    private authService: AuthService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    if (!this.checkAuth()) return;

    this.loadUserData();
    this.loadNavigation();
    this.currentRoute = this.router.url;
    
    // Cargar todos los datos en paralelo
    this.loadAllData();
  }

  private checkAuth(): boolean {
    if (!localStorage.getItem('token')) {
      this.router.navigate(['']);
      return false;
    }
    return true;
  }

  loadUserData(): void {
    // CORRECCIÓN: Usamos getPerfil() para obtener datos frescos y completos
    this.authService.getPerfil().subscribe({
      next: (data) => {
        const d = data.detalles || {};
        
        // Nombre y Matrícula
        this.userName = `${d.nombres} ${d.apellido_paterno} ${d.apellido_materno || ''}`.trim();
        this.userAccountNumber = data.num_usuario || '';
        
        // Carrera
        this.userCareer = d.nivel_educativo || 'Estudiante';
        
        // Construcción de Grado, Grupo y Turno
        const parts = [];

        // Semestre o Grado
        if (d.semestre) parts.push(`${d.semestre}° Semestre`);
        else if (d.grado) parts.push(`${d.grado}° Grado`);

        // Grupo
        if (d.grupo_id) parts.push(`Grupo ${d.grupo_id}`);

        // Turno
        const turno = d.grupo_turno || d.turno;
        if (turno) {
          const turnoFormato = turno.charAt(0).toUpperCase() + turno.slice(1).toLowerCase();
          parts.push(turnoFormato);
        }

        this.userGradeGroup = parts.length > 0 ? parts.join(' • ') : '';
      },
      error: (err) => {
        console.error('Error al cargar datos del usuario en materiales', err);
      }
    });
  }

  loadAllData(): void {
    this.isLoading = true;

    forkJoin({
      stats: this.materialesService.getStats().pipe(
        catchError(err => {
          console.error('Error stats:', err);
          return of({ total_materiales: 0, total_materias: 0, nuevos: 0 } as MaterialStats);
        })
      ),
      materias: this.materialesService.getMateriasDisponibles().pipe(
        catchError(err => {
          console.error('Error materias:', err);
          return of([] as MateriaDisponible[]);
        })
      ),
      materiales: this.materialesService.getMisMateriales().pipe(
        catchError(err => {
          console.error('Error materiales:', err);
          return of([] as Material[]);
        })
      )
    }).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (results) => {
        // Stats
        this.totalMaterials = results.stats.total_materiales;
        this.totalCourses = results.stats.total_materias;
        this.newMaterials = results.stats.nuevos;
        
        // Materias (para el dropdown)
        this.materiasDisponibles = results.materias;

        // Materiales (Lista principal)
        this.allMaterials = results.materiales;
        this.materials = results.materiales;
        
        // Contar profesores únicos
        const uniqueProfs = new Set(results.materiales.map(m => m.nombre_profesor));
        this.totalProfesores = uniqueProfs.size;

        this.filterMaterials();
      },
      error: (err) => console.error('Error cargando datos:', err)
    });
  }

  // --- Filtros y Búsqueda ---
  filterMaterials(): void {
    if (!this.allMaterials) return;

    const term = this.searchText.toLowerCase().trim();
    
    this.filteredMaterials = this.allMaterials.filter(material => {
      // Filtro de Texto
      const matchText = !term || 
        (material.titulo?.toLowerCase().includes(term)) ||
        (material.descripcion?.toLowerCase().includes(term)) ||
        (material.materia?.toLowerCase().includes(term)) ||
        (material.nombre_profesor?.toLowerCase().includes(term));

      // Filtro de Categoría
      const matchCategory = this.selectedCategory === 'all' || 
        material.categoria === this.selectedCategory;

      // Filtro de Materia (Curso)
      let matchCourse = true;
      if (this.selectedCourse !== 'all') {
        // Si tenemos ID, comparamos ID. Si no, comparamos nombre (fallback)
        if (material.id_materia) {
          matchCourse = material.id_materia == this.selectedCourse;
        } else {
          matchCourse = material.materia == this.selectedCourse;
        }
      }

      return matchText && matchCategory && matchCourse;
    });
  }

  onSearchChange(): void {
    this.filterMaterials();
  }

  onCategoryChange(category: string): void {
    this.selectedCategory = category;
    this.showCategoryDropdown = false;
    this.filterMaterials();
  }

  onCourseChange(): void {
    this.filterMaterials();
  }

  toggleCategoryDropdown(): void {
    this.showCategoryDropdown = !this.showCategoryDropdown;
  }

  // --- Acciones ---
  viewMaterial(material: Material): void {
    this.materialesService.verMaterial(material.id_material).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => URL.revokeObjectURL(url), 1000); // Liberar memoria
      },
      error: () => alert('Error al cargar el material.')
    });
  }

  downloadMaterial(material: Material): void {
    this.materialesService.descargarMaterial(material.id_material).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = material.nombre_archivo;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: () => alert('Error al descargar el material.')
    });
  }

  // --- Utilidades Visuales ---
  getCategoryLabel(): string {
    const cat = this.categories.find(c => c.value === this.selectedCategory);
    return cat ? cat.label : 'Todas las categorías';
  }

  getCategoryClass(categoria: string): string {
    const map: { [key: string]: string } = {
      'GUIA': 'category-guia', 'APOYO': 'category-apoyo', 
      'AVISO': 'category-aviso', 'TAREA': 'category-tarea', 
      'EXAMEN': 'category-examen', 'OTRO': 'category-otro'
    };
    return map[categoria] || 'category-otro';
  }

  getCategoryIcon(categoria: string): string {
    const map: { [key: string]: string } = {
      'GUIA': '📖', 'APOYO': '📚', 'AVISO': '📢', 
      'TAREA': '✏️', 'EXAMEN': '📝', 'OTRO': '📄'
    };
    return map[categoria] || '📄';
  }

  getCategoryColor(categoria: string): string {
    const map: { [key: string]: string } = {
      'GUIA': '#dcfce7', 'APOYO': '#dbeafe', 'AVISO': '#fee2e2', 
      'TAREA': '#fef3c7', 'EXAMEN': '#fce7f3', 'OTRO': '#e5e7eb'
    };
    return map[categoria] || '#e5e7eb';
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  // --- Navegación ---
  loadNavigation(): void {
    this.navigationItems = [
      { icon: 'home', label: 'Inicio', route: '/est-dashboard', badge: 0 },
      { icon: 'file-text', label: 'Documentos', route: '/est-documentos', badge: 0 },
      { icon: 'material', label: 'Materiales', route: '/est-materiales', badge: 0 },
      { icon: 'users', label: 'Profesores', route: '/est-profesores', badge: 0 },
      { icon: 'user', label: 'Perfil', route: '/est-perfil', badge: 0 }
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
    this.authService.logout();
    this.router.navigate(['']);
  }
}