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
  downloads: number;
  uploadDate: string;
}

interface MaterialForm {
  title: string;
  description: string;
  category: string;
  course: string;
  semester: string;
  file: File | null;
}

interface NavItem {
  icon: string;
  label: string;
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-prof-materiales',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './prof-materiales.html',
  styleUrls: ['./prof-materiales.css']
})
export class ProfMaterialesComponent implements OnInit {
  searchText: string = '';
  selectedCategory: string = 'all';
  showUploadModal: boolean = false;
  showEditModal: boolean = false;
  selectedMaterial: Material | null = null;

  userRole: 'Profesor' = 'Profesor';
  userName: string = 'Jose Orozco';
  userAccountNumber: string = '2024001234';
  userMateria: string = 'Angular';
  notificationCount: number = 3;
  currentRoute: string = '/prof-materiales';

  categories = [
    { value: 'all', label: 'Todas las categorías' },
    { value: 'Material de Apoyo', label: 'Material de Apoyo' },
    { value: 'Guía', label: 'Guía' },
    { value: 'Aviso Oficial', label: 'Aviso Oficial' },
    { value: 'Examen', label: 'Examen' },
    { value: 'Tarea', label: 'Tarea' },
    { value: 'Otro', label: 'Otro' }
  ];

  courses = [
    'Matemáticas Avanzadas',
    'Cálculo Diferencial',
    'Álgebra Lineal',
    'Estadística'
  ];

  semesters = [
    '1° Semestre',
    '2° Semestre',
    '3° Semestre',
    '4° Semestre',
    '5° Semestre',
    '6° Semestre'
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
      downloads: 45,
      uploadDate: '2024-03-01',
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
      downloads: 128,
      uploadDate: '2024-02-28',
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
      downloads: 32,
      uploadDate: '2024-03-03',
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
      downloads: 48,
      uploadDate: '2024-03-02',
    }
  ];

  uploadForm: MaterialForm = {
    title: '',
    description: '',
    category: 'Material de Apoyo',
    course: 'Matemáticas Avanzadas',
    semester: '3° Semestre',
    file: null
  };

  editForm: MaterialForm = {
    title: '',
    description: '',
    category: '',
    course: '',
    semester: '',
    file: null
  };

  filteredMaterials: Material[] = [];
  totalMaterials: number = 0;
  totalDownloads: number = 0;
  totalNotices: number = 0;
  selectedFileName: string = '';
  editFileName: string = '';

  ngOnInit(): void {
    this.calculateStats();
    this.filterMaterials();
    this.loadNavigation();
    this.currentRoute = this.router.url;
  }

  calculateStats(): void {
    this.totalMaterials = this.materials.length;
    this.totalDownloads = this.materials.reduce((sum, m) => sum + m.downloads, 0);
    this.totalNotices = this.materials.filter(m => m.category === 'Aviso Oficial').length;
  }

  filterMaterials(): void {
    this.filteredMaterials = this.materials.filter(material => {
      const matchesSearch = !this.searchText || 
        material.title.toLowerCase().includes(this.searchText.toLowerCase()) ||
        material.description.toLowerCase().includes(this.searchText.toLowerCase());

      const matchesCategory = this.selectedCategory === 'all' || 
        material.category === this.selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }

  onSearchChange(): void {
    this.filterMaterials();
  }

  onCategoryChange(): void {
    this.filterMaterials();
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

  // Modal de Subir Material
  openUploadModal(): void {
    this.showUploadModal = true;
    this.resetUploadForm();
  }

  closeUploadModal(): void {
    this.showUploadModal = false;
    this.resetUploadForm();
  }

  resetUploadForm(): void {
    this.uploadForm = {
      title: '',
      description: '',
      category: 'Material de Apoyo',
      course: 'Matemáticas Avanzadas',
      semester: '3° Semestre',
      file: null
    };
    this.selectedFileName = '';
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.uploadForm.file = file;
      this.selectedFileName = file.name;
    }
  }

  uploadMaterial(): void {
    if (!this.uploadForm.title || !this.uploadForm.file) {
      alert('Por favor completa los campos requeridos');
      return;
    }

    const newMaterial: Material = {
      id: Date.now().toString(),
      title: this.uploadForm.title,
      category: this.uploadForm.category as any,
      description: this.uploadForm.description,
      course: this.uploadForm.course,
      semester: this.uploadForm.semester,
      fileName: this.uploadForm.file.name,
      fileSize: this.formatFileSize(this.uploadForm.file.size),
      downloads: 0,
      uploadDate: new Date().toISOString().split('T')[0]
    };

    this.materials.unshift(newMaterial);
    this.calculateStats();
    this.filterMaterials();
    this.closeUploadModal();
    
    // Aquí implementarías la subida real del archivo
    console.log('Material subido:', newMaterial);
  }

  // Modal de Editar Material
  openEditModal(material: Material): void {
    this.selectedMaterial = material;
    this.editForm = {
      title: material.title,
      description: material.description,
      category: material.category,
      course: material.course,
      semester: material.semester,
      file: null
    };
    this.editFileName = '';
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedMaterial = null;
    this.editFileName = '';
  }

  onEditFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.editForm.file = file;
      this.editFileName = file.name;
    }
  }

  updateMaterial(): void {
    if (!this.selectedMaterial || !this.editForm.title) {
      alert('Por favor completa los campos requeridos');
      return;
    }

    const index = this.materials.findIndex(m => m.id === this.selectedMaterial!.id);
    if (index !== -1) {
      this.materials[index] = {
        ...this.materials[index],
        title: this.editForm.title,
        description: this.editForm.description,
        category: this.editForm.category as any,
        course: this.editForm.course,
        semester: this.editForm.semester,
        fileName: this.editForm.file ? this.editForm.file.name : this.materials[index].fileName,
        fileSize: this.editForm.file ? this.formatFileSize(this.editForm.file.size) : this.materials[index].fileSize
      };

      this.calculateStats();
      this.filterMaterials();
      this.closeEditModal();
      
      console.log('Material actualizado:', this.materials[index]);
    }
  }

  // Eliminar material
  deleteMaterial(material: Material): void {
    if (confirm(`¿Estás seguro de eliminar "${material.title}"?`)) {
      this.materials = this.materials.filter(m => m.id !== material.id);
      this.calculateStats();
      this.filterMaterials();
      console.log('Material eliminado:', material);
    }
  }

  // Ver material
  viewMaterial(material: Material): void {
    console.log('Ver material:', material);
    // Aquí implementarías la visualización del PDF
  }

  // Utilidades
  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  getIconForCategory(category: string): string {
    const icons: { [key: string]: string } = {
      'Guía': '📄',
      'Material de Apoyo': '📘',
      'Aviso Oficial': '⚠️',
      'Tarea': '📝',
      'Examen': '📋',
      'Otro': '📎'
    };
    return icons[category] || '📎';
  }

  getColorForCategory(category: string): string {
    const colors: { [key: string]: string } = {
      'Guía': '#dcfce7',
      'Material de Apoyo': '#dbeafe',
      'Aviso Oficial': '#fee2e2',
      'Tarea': '#fef3c7',
      'Examen': '#fce7f3',
      'Otro': '#e5e7eb'
    };
    return colors[category] || '#e5e7eb';
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
  navigationItems: NavItem[] = [];

  constructor(private router: Router) { }

  loadNavigation(): void {
    this.navigationItems = [
      { icon: 'home', label: 'Inicio', route: '/prof-dashboard', badge: 0 },
      { icon: 'material', label: 'Materiales', route: '/prof-materiales', badge: 0 },
      { icon: 'file-text', label: 'Chat-Estudiantes', route: '/prof-estudiantes', badge: 0 },
      { icon: 'user', label: 'Perfil', route: '/prof-perfil', badge: 0 }
    ];
  }

  navigateTo(route: string): void {
    this.currentRoute = route;
    this.router.navigate([route]);
  }

  getIcon(iconName: string): string {
    const icons: { [key: string]: string } = {
      'home': 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
      'material': 'M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25',
      'file-text': 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8',
      'users': 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
      'user': 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
      'alert-triangle': 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01',
      'alert-circle': 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M12 8v4 M12 16h.01',
      'check-circle': 'M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4L12 14.01l-3-3',
      'x-circle': 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M15 9l-6 6 M9 9l6 6'
    };
    return icons[iconName] || icons['file-text'];
  }

  logout(): void {
    this.router.navigate(['']);
  }
}