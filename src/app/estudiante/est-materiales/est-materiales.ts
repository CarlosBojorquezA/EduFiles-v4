import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MaterialesService, Material, MaterialStats } from '../../services/materiales.service';
import { AuthService } from '../../auth.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { NotificationsComponent } from '../../notificaciones/notificaciones';

interface NavItem {
  icon: string;
  label: string;
  route: string;
  badge?: number;
}

interface MateriaOption {
  id: string | number; 
  label: string;       
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
  
  materiasDisponibles: MateriaOption[] = []; 
  
  totalMaterials: number = 0;
  totalCourses: number = 0;
  newMaterials: number = 0;

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
        this.totalMaterials = stats.total_materiales;
        this.totalCourses = stats.total_materias;
        this.newMaterials = stats.nuevos;
      },
      error: (error) => console.error('Error cargando stats:', error)
    });

    // Cargar materias disponibles
    this.materialesService.getMateriasDisponibles().subscribe({
      next: (data: any[]) => {
        // Adaptador: Detecta si vienen strings o objetos desde la nueva tabla
        this.materiasDisponibles = data.map(item => {
            if (typeof item === 'string') {
                return { id: item, label: item };
            } else {
                // Asume que vienen objetos con { id_materia, nombre } o similar
                return { 
                    id: item.id_materia || item.id || item.nombre, 
                    label: item.nombre || item.materia || 'Sin nombre' 
                };
            }
        });
      },
      error: (error) => console.error('Error cargando materias:', error)
    });

    // Cargar materiales
    this.materialesService.getMisMateriales().subscribe({
      next: (materiales) => {
        console.log('Materiales recibidos:', materiales); 
        this.allMaterials = materiales;
        this.materials = materiales;
        this.filterMaterials(); 
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error cargando materiales:', error);
        this.isLoading = false;
      }
    });
  }

  filterMaterials(): void {
    if (!this.allMaterials) return;

    this.filteredMaterials = this.allMaterials.filter(material => {
      // Maneja el caso donde material.materia sea null o undefined
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
      // Comparamos tanto con el nombre como con el ID si existe
      let matchesCourse = true;
      if (this.selectedCourse !== 'all') {
          // Si material tiene id_materia lo usa, Si no, usa el nombre
          const matId = (material as any).id_materia || material.materia;
          matchesCourse = matId == this.selectedCourse || material.materia == this.selectedCourse;
      }

      return matchesSearch && matchesCategory && matchesCourse;
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
    // Esto se dispara cuando cambia el <select> de materias
    console.log('Curso seleccionado:', this.selectedCourse);
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
    console.log('Ver material:', material);
    
    this.materialesService.verMaterial(material.id_material).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
      },
      error: (error) => {
        console.error('Error visualizando material:', error);
        alert('Error al cargar el material');
      }
    });
  }

  downloadMaterial(material: Material): void {
    console.log('Descargar material:', material);
    
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
      },
      error: (error) => {
        console.error('Error descargando material:', error);
        alert('Error al descargar el material');
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