import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MaterialesService, Material, MaterialStats, MateriaDisponible } from '../../services/materiales.service';
import { AuthService } from '../../auth.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { NotificationsComponent } from '../../notificaciones/notificaciones';

interface NavItem {
  icon: string;
  label: string;
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-est-materiales',
  standalone: true,
  imports: [CommonModule, FormsModule, NotificationsComponent],
  templateUrl: './est-materiales.html',
  styleUrls: ['./est-materiales.css']
})
export class EstMaterialesComponent implements OnInit {
  searchText: string = '';
  
  selectedCourse: string | number = 'all'; 
  selectedCategory: string = 'all';
  showCategoryDropdown: boolean = false;

  userRole: 'estudiante' = 'estudiante';
  userName: string = '';
  userAccountNumber: string = '';
  userCareer: string = '';
  userGradeGroup: string = '';
  currentRoute: string = '/est-materiales';

  categories = [
    { value: 'all', label: 'Todas las categorías' },
    { value: 'APOYO', label: 'Material de Apoyo' },
    { value: 'GUIA', label: 'Guías' },
    { value: 'AVISO', label: 'Avisos Oficiales' },
    { value: 'EXAMEN', label: 'Exámenes' },
    { value: 'TAREA', label: 'Tareas' },
    { value: 'OTRO', label: 'Otros' }
  ];
  
  materials: Material[] = [];
  allMaterials: Material[] = [];
  filteredMaterials: Material[] = [];
  
  materiasDisponibles: MateriaDisponible[] = []; 
  
  totalMaterials: number = 0;
  totalCourses: number = 0;
  newMaterials: number = 0;
  totalProfesores: number = 0; // NUEVO

  navigationItems: NavItem[] = [];
  isLoading: boolean = true;

  constructor(
    private router: Router,
    private materialesService: MaterialesService,
    private authService: AuthService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.loadNavigation();
    this.loadMateriales();
    this.currentRoute = this.router.url;
  }

  loadUserData(): void {
    const user = this.authService.getCurrentUser();
    if (user && user.detalles) {
      const detalles = user.detalles;
      this.userName = `${detalles.nombres} ${detalles.apellido_paterno} ${detalles.apellido_materno || ''}`.trim();
      this.userAccountNumber = user.num_usuario;
      
      if (detalles.grado) {
        this.userGradeGroup = `${detalles.grado}°`;
        if (detalles.grupo_turno) {
          this.userGradeGroup += ` ${detalles.grupo_turno}`;
        }
      }
      
      this.userCareer = detalles.nivel_educativo || 'Estudiante';
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

  loadMateriales(): void {
    this.isLoading = true;

    // Cargar estadísticas
    this.materialesService.getStats().subscribe({
      next: (stats) => {
        console.log('[MATERIALES] Estadísticas:', stats);
        this.totalMaterials = stats.total_materiales;
        this.totalCourses = stats.total_materias;
        this.newMaterials = stats.nuevos;
      },
      error: (error) => {
        console.error('[MATERIALES] Error cargando stats:', error);
      }
    });

    // Cargar materias disponibles
    this.materialesService.getMateriasDisponibles().subscribe({
      next: (materias: MateriaDisponible[]) => {
        console.log('[MATERIALES] Materias disponibles:', materias);
        this.materiasDisponibles = materias;
      },
      error: (error) => {
        console.error('[MATERIALES] Error cargando materias:', error);
      }
    });

    // Cargar materiales
    this.materialesService.getMisMateriales().subscribe({
      next: (materiales) => {
        console.log('[MATERIALES] Materiales recibidos:', materiales); 
        this.allMaterials = materiales;
        this.materials = materiales;
        this.filterMaterials(); 
        this.isLoading = false;
      },
      error: (error) => {
        console.error('[MATERIALES] Error cargando materiales:', error);
        this.isLoading = false;
        alert('Error al cargar los materiales. Por favor, recarga la página.');
      }
    });
  }

  filterMaterials(): void {
    if (!this.allMaterials) return;

    this.filteredMaterials = this.allMaterials.filter(material => {
      // Texto de búsqueda
      const materiaNombre = material.materia || ''; 
      const profesorNombre = material.nombre_profesor || '';
      
      const matchesSearch = !this.searchText || 
        (material.titulo && material.titulo.toLowerCase().includes(this.searchText.toLowerCase())) ||
        (material.descripcion && material.descripcion.toLowerCase().includes(this.searchText.toLowerCase())) ||
        materiaNombre.toLowerCase().includes(this.searchText.toLowerCase()) ||
        profesorNombre.toLowerCase().includes(this.searchText.toLowerCase());

      // Filtro de Categoría
      const matchesCategory = this.selectedCategory === 'all' || 
        material.categoria === this.selectedCategory;

      // Filtro de Curso (Materia)
      // Comparar por id_materia si existe, sino por nombre
      let matchesCourse = true;
      if (this.selectedCourse !== 'all') {
        if (material.id_materia) {
          // Comparar por ID de materia
          matchesCourse = material.id_materia == this.selectedCourse;
        } else {
          // Comparar por nombre de materia
          matchesCourse = material.materia == this.selectedCourse;
        }
      }

      return matchesSearch && matchesCategory && matchesCourse;
    });

    console.log('[MATERIALES] Filtrados:', this.filteredMaterials.length);
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
    console.log('[MATERIALES] Curso seleccionado:', this.selectedCourse);
    this.filterMaterials();
  }

  toggleCategoryDropdown(): void {
    this.showCategoryDropdown = !this.showCategoryDropdown;
  }

  getCategoryLabel(): string {
    const category = this.categories.find(c => c.value === this.selectedCategory);
    return category ? category.label : 'Todas las categorías';
  }

  getCategoryClass(categoria: string): string {
    const classes: { [key: string]: string } = {
      'GUIA': 'category-guia',
      'APOYO': 'category-apoyo',
      'AVISO': 'category-aviso',
      'TAREA': 'category-tarea',
      'EXAMEN': 'category-examen',
      'OTRO': 'category-otro'
    };
    return classes[categoria] || 'category-otro';
  }

  getCategoryIcon(categoria: string): string {
    const icons: { [key: string]: string } = {
      'GUIA': '📖',
      'APOYO': '📚',
      'AVISO': '📢',
      'TAREA': '✏️',
      'EXAMEN': '📝',
      'OTRO': '📄'
    };
    return icons[categoria] || '📄';
  }

  getCategoryColor(categoria: string): string {
    const colors: { [key: string]: string } = {
      'GUIA': '#dcfce7',
      'APOYO': '#dbeafe',
      'AVISO': '#fee2e2',
      'TAREA': '#fef3c7',
      'EXAMEN': '#fce7f3',
      'OTRO': '#e5e7eb'
    };
    return colors[categoria] || '#e5e7eb';
  }

  viewMaterial(material: Material): void {
    console.log('[VER MATERIAL]', material);
    
    this.materialesService.verMaterial(material.id_material).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        
        // Liberar memoria después de un tiempo
        setTimeout(() => URL.revokeObjectURL(url), 100);
      },
      error: (error) => {
        console.error('[VER MATERIAL] Error:', error);
        alert('Error al cargar el material. Verifica que el archivo exista en el servidor.');
      }
    });
  }

  downloadMaterial(material: Material): void {
    console.log('[DESCARGAR MATERIAL]', material);
    
    this.materialesService.descargarMaterial(material.id_material).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = material.nombre_archivo;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('[DESCARGAR] ✓ Descarga iniciada');
      },
      error: (error) => {
        console.error('[DESCARGAR] Error:', error);
        alert('Error al descargar el material. Verifica que el archivo exista en el servidor.');
      }
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  }

  navigateTo(route: string): void {
    this.currentRoute = route;
    this.router.navigate([route]);
  }

  getIcon(iconName: string): string {
    const icons: { [key: string]: string } = {
      'home': 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
      'file-text': 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8',
      'material': 'M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25',
      'users': 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
      'user': 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z'
    };
    return icons[iconName] || icons['file-text'];
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['']);
  }
}