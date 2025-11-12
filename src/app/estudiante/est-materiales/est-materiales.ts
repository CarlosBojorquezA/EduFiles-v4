import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface Material {
  id: string;
  title: string;
  category: 'Material de Apoyo' | 'Guía' | 'Aviso Oficial' | 'Examen' | 'Tarea' | 'Otro';
  description: string;
  course: string;
  semester: string;
  fileName: string;
  fileSize: string;
  author: string;
  date: string;
}

interface NavItem {
  icon: string;
  label: string;
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-est-materiales',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './est-materiales.html',
  styleUrls: ['./est-materiales.css']
})
export class EstMaterialesComponent implements OnInit {
  searchText: string = '';
  selectedCourse: string = 'all';
  selectedCategory: string = 'all';
  showCategoryDropdown: boolean = false;

  userRole: 'estudiante' = 'estudiante';
  userName: string = 'María García';
  userAccountNumber: string = '2024001234';
  userCareer: string = 'Ingeniería de Sistemas';
  userGradeGroup: string = '2°A';
  notificationCount: number = 3;
  currentRoute: string = '/est-materiales';

  categories = [
    { value: 'all', label: 'Todas las categorías' },
    { value: 'Material de Apoyo', label: 'Material de Apoyo' },
    { value: 'Guía', label: 'Guías' },
    { value: 'Aviso Oficial', label: 'Avisos Oficiales' },
    { value: 'Examen', label: 'Exámenes' },
    { value: 'Tarea', label: 'Tareas' },
    { value: 'Otro', label: 'Otros' }
  ];
  
  materials: Material[] = [
    {
      id: '1',
      title: 'Guía de Estudio - Unidad 1',
      category: 'Guía',
      description: 'Guía completa para el primer examen parcial',
      course: 'Matemáticas Avanzadas',
      semester: '3° Semestre',
      fileName: 'guia_unidad_1.pdf',
      fileSize: '2.3 MB',
      author: 'Dr. Roberto García',
      date: '2024-03-01',
    },
    {
      id: '2',
      title: 'Material de Apoyo - Cálculo Diferencial',
      category: 'Material de Apoyo',
      description: 'Ejercicios resueltos y ejemplos prácticos',
      course: 'Matemáticas Avanzadas',
      semester: '3° Semestre',
      fileName: 'calculo_diferencial.pdf',
      fileSize: '5.1 MB',
      author: 'Dr. Roberto García',
      date: '2024-02-28',
    },
    {
      id: '3',
      title: 'Aviso - Cambio de Fecha de Examen',
      category: 'Aviso Oficial',
      description: 'El examen del próximo viernes se pospondrá al lunes',
      course: 'Matemáticas Avanzadas',
      semester: '3° Semestre',
      fileName: 'aviso_cambio_fecha.pdf',
      fileSize: '156 KB',
      author: 'Dr. Roberto García',
      date: '2024-03-03',
    },
    {
      id: '4',
      title: 'Tarea - Problemas de Integración',
      category: 'Tarea',
      description: 'Ejercicios para entregar el viernes',
      course: 'Matemáticas Avanzadas',
      semester: '3° Semestre',
      fileName: 'tarea_integracion.pdf',
      fileSize: '1.8 MB',
      author: 'Dr. Roberto García',
      date: '2024-03-02',
    },
    {
      id: '5',
      title: 'Presentación - Estructuras de Datos',
      category: 'Material de Apoyo',
      description: 'Diapositivas de la clase del lunes',
      course: 'Programación II',
      semester: '3° Semestre',
      fileName: 'estructuras_datos.pdf',
      fileSize: '3.2 MB',
      author: 'Ing. Laura Martínez',
      date: '2024-03-04',
    },
    {
      id: '6',
      title: 'Guía - Algoritmos de Búsqueda',
      category: 'Guía',
      description: 'Guía práctica de algoritmos',
      course: 'Programación II',
      semester: '3° Semestre',
      fileName: 'guia_algoritmos.pdf',
      fileSize: '4.5 MB',
      author: 'Ing. Laura Martínez',
      date: '2024-02-25',
    },
    {
      id: '7',
      title: 'Examen Parcial - Unidad 2',
      category: 'Examen',
      description: 'Examen del segundo parcial',
      course: 'Matemáticas Avanzadas',
      semester: '3° Semestre',
      fileName: 'examen_parcial_2.pdf',
      fileSize: '892 KB',
      author: 'Dr. Roberto García',
      date: '2024-02-20',
    }
  ];

  filteredMaterials: Material[] = [];
  totalMaterials: number = 0;
  totalCourses: number = 0;
  newMaterials: number = 0;

  navigationItems: NavItem[] = [];
  
  constructor(private router: Router) {}

  calculateStats(): void {
    this.totalMaterials = this.materials.length;
    this.totalCourses = [...new Set(this.materials.map(m => m.course))].length;
    
    // Contar materiales nuevos (últimos 7 días)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    this.newMaterials = this.materials.filter(m => 
      new Date(m.date) > sevenDaysAgo
    ).length;
  }

  filterMaterials(): void {
    this.filteredMaterials = this.materials.filter(material => {
      const matchesSearch = !this.searchText || 
        material.title.toLowerCase().includes(this.searchText.toLowerCase()) ||
        material.description.toLowerCase().includes(this.searchText.toLowerCase()) ||
        material.course.toLowerCase().includes(this.searchText.toLowerCase());

      const matchesCategory = this.selectedCategory === 'all' || 
        material.category === this.selectedCategory;

      return matchesSearch && matchesCategory;
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

  toggleCategoryDropdown(): void {
    this.showCategoryDropdown = !this.showCategoryDropdown;
  }

  getCategoryLabel(): string {
    const category = this.categories.find(c => c.value === this.selectedCategory);
    return category ? category.label : 'Todas las categorías';
  }

  getCategoryClass(category: string): string {
    const classes: { [key: string]: string } = {
      'Guía': 'category-guia',
      'Material de Apoyo': 'category-apoyo',
      'Aviso Oficial': 'category-aviso',
      'Tarea': 'category-tarea',
      'Examen': 'category-examen',
      'Otro': 'category-otro'
    };
    return classes[category] || 'category-otro';
  }

  viewMaterial(material: Material): void {
    console.log('Ver material:', material);
    // Aquí implementarías la visualización del PDF
  }

  downloadMaterial(material: Material): void {
    console.log('Descargar material:', material);
    // Aquí implementarías la descarga del archivo
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    });
  }

  // Navegación
  navigateTo(route: string): void {
    this.currentRoute = route;
    this.router.navigate([route]);
  }

  ngOnInit(): void {
    this.calculateStats();
    this.filterMaterials();
    this.loadNavigation();
    this.currentRoute = this.router.url;
  }

  loadNavigation(): void {
    const navigationItems = {
      estudiante: [
        { icon: 'home', label: 'Inicio', route: '/est-dashboard', badge: 0 },
        { icon: 'file-text', label: 'Documentos', route: '/est-documentos', badge: 0 },
        { icon: 'material', label: 'Materiales', route: '/est-materiales', badge: 0 },
        { icon: 'users', label: 'Profesores', route: '/est-profesores', badge: 0 },
        { icon: 'user', label: 'Perfil', route: '/est-perfil', badge: 0 }
      ]
    };

    this.navigationItems = navigationItems[this.userRole];
  }

  getIcon(iconName: string): string {
    const icons: { [key: string]: string } = {
      'home': 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
      'file-text': 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8',
      'material': 'M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25',
      'users': 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
      'user': 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
      'chart-bar.square': 'M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z'
    };
    return icons[iconName] || icons['file-text'];
  }

  logout(): void {
    // Implementar lógica de cierre de sesión
    this.router.navigate(['']);
  }
}
