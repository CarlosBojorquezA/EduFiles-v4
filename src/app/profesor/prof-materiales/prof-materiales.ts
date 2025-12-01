import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../auth.service';
import { NotificationsComponent } from '../../notificaciones/notificaciones';
import { environment } from '../../../environments/environment';

interface Material {
  id_material: number;
  titulo: string;
  categoria: string;
  descripcion: string;
  materia: string;
  semestre: string;
  nombre_archivo: string;
  tamaño_legible: string;
  descargas: number;
  fecha_formateada: string;
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
  imports: [CommonModule, FormsModule, NotificationsComponent],
  templateUrl: './prof-materiales.html',
  styleUrls: ['./prof-materiales.css']
})
export class ProfMaterialesComponent implements OnInit {
  private apiUrl = environment.apiUrl;
  
  searchText: string = '';
  selectedCategory: string = 'all';
  showUploadModal: boolean = false;
  showEditModal: boolean = false;
  selectedMaterial: Material | null = null;

  userRole: 'Profesor' = 'Profesor';
  userName: string = '';
  userAccountNumber: string = '';
  userMateria: string = 'Cargando...';
  notificationCount: number = 0;
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

  courses: string[] = [];
  semesters = [
    '1° Semestre',
    '2° Semestre',
    '3° Semestre',
    '4° Semestre',
    '5° Semestre',
    '6° Semestre'
  ];

  materials: Material[] = [];
  filteredMaterials: Material[] = [];
  
  totalMaterials: number = 0;
  totalDownloads: number = 0;
  totalNotices: number = 0;
  
  selectedFileName: string = '';
  editFileName: string = '';
  selectedFile: File | null = null;
  editFile: File | null = null;

  uploadForm = {
    title: '',
    description: '',
    category: 'Material de Apoyo',
    course: '',
    semester: '3° Semestre'
  };

  editForm = {
    title: '',
    description: '',
    category: '',
    course: '',
    semester: ''
  };

  navigationItems: NavItem[] = [];
  loading: boolean = true;

  constructor(
    private router: Router,
    private http: HttpClient,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadUserData();
    this.loadMisCursos();
    this.loadMateriales();
    this.loadStats();
    this.loadNavigation();
    this.currentRoute = this.router.url;
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  loadUserData(): void {
    const userData = this.authService.getCurrentUser();
    if (userData) {
      const detalles = userData.detalles || {};
      this.userName = `${detalles.nombres || ''} ${detalles.apellido_paterno || ''}`.trim() || 'Usuario';
      this.userAccountNumber = userData.num_usuario || '';
    }
  }

  loadMisCursos(): void {
    this.http.get<string[]>(`${this.apiUrl}/prof-materiales/mis-cursos`, {
      headers: this.getAuthHeaders()
    }).subscribe({
      next: (cursos) => {
        console.log('[MATERIALES] Cursos cargados:', cursos);
        this.courses = cursos;
        if (cursos.length > 0) {
          this.uploadForm.course = cursos[0];
          this.userMateria = cursos[0];
        } else {
          // Si no hay cursos, agregar uno por defecto
          this.courses = ['Sin asignación'];
          this.uploadForm.course = 'Sin asignación';
        }
      },
      error: (error) => {
        console.error('Error cargando cursos:', error);
        // En caso de error, usar valores por defecto
        this.courses = ['Matemáticas', 'Español', 'Inglés', 'Ciencias'];
        this.uploadForm.course = this.courses[0];
      }
    });
  }

  loadMateriales(): void {
    this.loading = true;
    
    let url = `${this.apiUrl}/prof-materiales/mis-materiales?categoria=${this.selectedCategory}`;
    if (this.searchText) {
      url += `&search=${encodeURIComponent(this.searchText)}`;
    }

    console.log('[MATERIALES] Cargando desde:', url);

    this.http.get<Material[]>(url, {
      headers: this.getAuthHeaders()
    }).subscribe({
      next: (materiales) => {
        console.log('[MATERIALES] Recibidos:', materiales);
        this.materials = materiales;
        this.filteredMaterials = materiales;
        this.loading = false;
      },
      error: (error) => {
        console.error('[MATERIALES] Error cargando materiales:', error);
        console.error('[MATERIALES] Error completo:', error.error);
        this.materials = [];
        this.filteredMaterials = [];
        this.loading = false;
        
        // Mostrar mensaje de error al usuario
        if (error.status === 401) {
          alert('Sesión expirada. Por favor inicia sesión nuevamente.');
        } else if (error.status === 403) {
          alert('No tienes permisos para ver estos materiales.');
        } else {
          alert('Error al cargar materiales. Verifica tu conexión.');
        }
      }
    });
  }

  loadStats(): void {
    this.http.get<any>(`${this.apiUrl}/prof-materiales/stats`, {
      headers: this.getAuthHeaders()
    }).subscribe({
      next: (stats) => {
        this.totalMaterials = stats.total_materiales || 0;
        this.totalDownloads = stats.total_descargas || 0;
        this.totalNotices = stats.avisos_activos || 0;
      },
      error: (error) => console.error('Error cargando stats:', error)
    });
  }

  onSearchChange(): void {
    this.loadMateriales();
  }

  onCategoryChange(): void {
    this.loadMateriales();
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
      course: this.courses[0] || '',
      semester: '3° Semestre'
    };
    this.selectedFileName = '';
    this.selectedFile = null;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.selectedFileName = file.name;
    }
  }

  uploadMaterial(): void {
    if (!this.uploadForm.title || !this.selectedFile) {
      alert('Por favor completa los campos requeridos');
      return;
    }

    console.log('[UPLOAD] Iniciando subida...');
    console.log('[UPLOAD] Datos:', this.uploadForm);
    console.log('[UPLOAD] Archivo:', this.selectedFile);

    const formData = new FormData();
    formData.append('archivo', this.selectedFile);
    formData.append('titulo', this.uploadForm.title);
    formData.append('descripcion', this.uploadForm.description);
    formData.append('categoria', this.uploadForm.category);
    formData.append('curso', this.uploadForm.course);
    formData.append('semestre', this.uploadForm.semester);

    // Headers sin Content-Type (se establece automáticamente para FormData)
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    });

    this.http.post(`${this.apiUrl}/prof-materiales/subir`, formData, { headers }).subscribe({
      next: (response) => {
        console.log('[UPLOAD] Material subido:', response);
        alert('Material subido exitosamente');
        this.closeUploadModal();
        this.loadMateriales();
        this.loadStats();
      },
      error: (error) => {
        console.error('[UPLOAD] Error subiendo material:', error);
        console.error('[UPLOAD] Error completo:', error.error);
        
        if (error.error && error.error.error) {
          alert(`Error: ${error.error.error}`);
        } else {
          alert('Error al subir el material. Verifica el tamaño y tipo de archivo.');
        }
      }
    });
  }

  // Modal de Editar Material
  openEditModal(material: Material): void {
    this.selectedMaterial = material;
    this.editForm = {
      title: material.titulo,
      description: material.descripcion,
      category: material.categoria,
      course: material.materia,
      semester: material.semestre
    };
    this.editFileName = '';
    this.editFile = null;
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedMaterial = null;
    this.editFileName = '';
    this.editFile = null;
  }

  onEditFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.editFile = file;
      this.editFileName = file.name;
    }
  }

  updateMaterial(): void {
    if (!this.selectedMaterial || !this.editForm.title) {
      alert('Por favor completa los campos requeridos');
      return;
    }

    console.log('[UPDATE] Actualizando material...');

    const formData = new FormData();
    if (this.editFile) {
      formData.append('archivo', this.editFile);
    }
    formData.append('titulo', this.editForm.title);
    formData.append('descripcion', this.editForm.description);
    formData.append('categoria', this.editForm.category);
    formData.append('curso', this.editForm.course);
    formData.append('semestre', this.editForm.semester);

    // Headers sin Content-Type (se establece automáticamente para FormData)
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    });

    this.http.put(`${this.apiUrl}/prof-materiales/actualizar/${this.selectedMaterial.id_material}`, formData, { headers }).subscribe({
      next: (response) => {
        console.log('[UPDATE] Material actualizado:', response);
        alert('Material actualizado exitosamente');
        this.closeEditModal();
        this.loadMateriales();
      },
      error: (error) => {
        console.error('[UPDATE] Error actualizando material:', error);
        alert('Error al actualizar el material');
      }
    });
  }

  deleteMaterial(material: Material): void {
    if (confirm(`¿Estás seguro de eliminar "${material.titulo}"?`)) {
      this.http.delete(`${this.apiUrl}/prof-materiales/eliminar/${material.id_material}`, {
        headers: this.getAuthHeaders()
      }).subscribe({
        next: () => {
          console.log('Material eliminado');
          this.loadMateriales();
          this.loadStats();
        },
        error: (error) => {
          console.error('Error eliminando material:', error);
          alert('Error al eliminar el material');
        }
      });
    }
  }

  viewMaterial(material: Material): void {
    const url = `${this.apiUrl}/prof-materiales/ver/${material.id_material}`;
    window.open(url, '_blank');
  }

  formatDate(dateString: string): string {
    return dateString || '';
  }

  loadNavigation(): void {
    this.navigationItems = [
      { icon: 'home', label: 'Inicio', route: '/prof-dashboard', badge: 0 },
      { icon: 'material', label: 'Materiales', route: '/prof-materiales', badge: 0 },
      { icon: 'users', label: 'Estudiantes', route: '/prof-estudiantes', badge: 0 },
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