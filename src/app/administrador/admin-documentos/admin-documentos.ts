import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NotificationsComponent } from '../../notificaciones/notificaciones';

interface DocumentoRequerido {
  id_plantilla: number;
  nombre: string;
  descripcion: string;
  es_fijo: number;
  requiere_actualizacion: number;
  dias_vigencia?: number;
  obligatorio: number;
  tipo_estudiante?: string;
  fecha_creacion: string;
}

interface DocumentoPendiente {
  id_documento: number;
  id_estudiante: number;
  estudiante_nombre: string;
  estudiante_email: string;
  num_usuario: string;
  plantilla_nombre: string;
  nombre_archivo: string;
  url_archivo: string;
  descripcion: string;
  fecha_subida: string;
  vencido: boolean;
  correo?: string;
  nombres?: string;
  apellido_paterno?: string;
  apellido_materno?: string;
}

interface FormData {
  nombre: string;
  descripcion: string;
  tipo: 'fijo' | 'periodico';
  aplicaA: string;
  obligatorio: boolean;
  dias_vigencia: number | null;
}

interface NavItem {
  icon: string;
  label: string;
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-admin-documentos',
  imports: [CommonModule, RouterModule, FormsModule, NotificationsComponent],
  templateUrl: './admin-documentos.html',
  styleUrls: ['./admin-documentos.css']
})
export class AdminDocumentosComponent implements OnInit {
  private apiUrl = 'http://localhost:5000/api';
  
  userName: string = '';
  userRole: string = 'administrador';
  notificationCount: number = 0;
  currentRoute: string = '/admin-documentos';

  activeTab: 'requeridos' | 'pendientes' = 'requeridos';
  
  documentosRequeridos: DocumentoRequerido[] = [];
  documentosPendientes: DocumentoPendiente[] = [];
  
  searchTerm: string = '';
  searchTermPendientes: string = '';
  selectedCategory: string = '';

  showModal: boolean = false;
  isEditMode: boolean = false;
  editingDocumento: DocumentoRequerido | null = null;
  isLoading: boolean = true;

  formData: FormData = {
    nombre: '',
    descripcion: '',
    tipo: 'fijo',
    aplicaA: 'todos',
    obligatorio: true,
    dias_vigencia: null
  };

  navigationItems: NavItem[] = [];

  constructor(
    private router: Router,
    private http: HttpClient
  ) {
    console.log('[ADMIN-DOCS] Componente inicializado');
  }

  ngOnInit(): void {
    console.log('[ADMIN-DOCS] ngOnInit llamado');
    this.loadUserData();
    this.loadNavigation();
    this.currentRoute = this.router.url;
    
    // Verificar token
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('[ADMIN-DOCS] No hay token, redirigiendo a login');
      alert('Sesión expirada. Por favor inicia sesión nuevamente.');
      this.router.navigate(['']);
      return;
    }
    
    console.log('[ADMIN-DOCS] Token verificado, cargando documentos...');
    
    // Cargar documentos
    setTimeout(() => {
      this.loadDocumentos();
    }, 200);
  }

  loadUserData(): void {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const user = JSON.parse(userData);
      if (user.detalles && user.detalles.nombres) {
        this.userName = `${user.detalles.nombres} ${user.detalles.apellido_paterno || ''}`.trim();
      } else {
        this.userName = user.correo || user.num_usuario || 'Usuario';
      }
      console.log('[ADMIN-DOCS] Usuario cargado:', this.userName);
    }
  }

  loadDocumentos(): void {
    console.log('[ADMIN-DOCS] Cargando documentos...');
    this.isLoading = true;

    // ✅ Ya NO necesitas crear headers manualmente
    // El interceptor agrega automáticamente el Authorization header
    
    // Cargar plantillas (documentos requeridos)
    console.log('[ADMIN-DOCS] Solicitando plantillas...');
    this.http.get(`${this.apiUrl}/documentos/plantillas`).subscribe({
      next: (response: any) => {
        console.log('[ADMIN-DOCS] Plantillas recibidas:', response);
        this.documentosRequeridos = Array.isArray(response) ? response : [];
        console.log('[ADMIN-DOCS] Total plantillas:', this.documentosRequeridos.length);
      },
      error: (error) => {
        console.error('[ADMIN-DOCS] Error cargando plantillas:', error);
        if (error.status === 401 || error.status === 422) {
          alert('Token inválido o expirado. Por favor inicia sesión nuevamente.');
          localStorage.clear();
          this.router.navigate(['']);
        } else {
          alert('Error al cargar documentos requeridos: ' + (error.error?.error || error.message));
        }
        this.documentosRequeridos = [];
      }
    });

    // Cargar documentos pendientes
    console.log('[ADMIN-DOCS] Solicitando pendientes...');
    this.http.get(`${this.apiUrl}/documentos/pendientes`).subscribe({
      next: (response: any) => {
        console.log('[ADMIN-DOCS] Pendientes recibidos:', response);
        this.documentosPendientes = Array.isArray(response) ? response.map((doc: any) => ({
          ...doc,
          estudiante_nombre: `${doc.nombres} ${doc.apellido_paterno} ${doc.apellido_materno}`,
          estudiante_email: doc.correo || doc.estudiante_email,
          vencido: doc.fecha_vencimiento && new Date(doc.fecha_vencimiento) < new Date()
        })) : [];
        console.log('[ADMIN-DOCS] Total pendientes:', this.documentosPendientes.length);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('[ADMIN-DOCS] Error cargando pendientes:', error);
        this.documentosPendientes = [];
        this.isLoading = false;
      }
    });

    // Cargar contador de notificaciones
    this.http.get(`${this.apiUrl}/notificaciones/no-leidas/count`).subscribe({
      next: (response: any) => {
        this.notificationCount = response.count || 0;
      },
      error: (error) => {
        console.error('[ADMIN-DOCS] Error cargando notificaciones:', error);
      }
    });
  }

  get filteredDocumentos(): DocumentoRequerido[] {
    let filtered = this.documentosRequeridos;

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(doc =>
        doc.nombre.toLowerCase().includes(term) ||
        (doc.descripcion && doc.descripcion.toLowerCase().includes(term))
      );
    }

    if (this.selectedCategory) {
      if (this.selectedCategory === 'fijo') {
        filtered = filtered.filter(doc => doc.es_fijo === 1);
      } else if (this.selectedCategory === 'periodico') {
        filtered = filtered.filter(doc => doc.requiere_actualizacion === 1);
      }
    }

    return filtered;
  }

  get filteredPendientes(): DocumentoPendiente[] {
    if (!this.searchTermPendientes) {
      return this.documentosPendientes;
    }

    const term = this.searchTermPendientes.toLowerCase();
    return this.documentosPendientes.filter(pendiente =>
      pendiente.estudiante_nombre.toLowerCase().includes(term) ||
      pendiente.estudiante_email.toLowerCase().includes(term) ||
      pendiente.num_usuario.toLowerCase().includes(term) ||
      pendiente.plantilla_nombre.toLowerCase().includes(term) ||
      pendiente.nombre_archivo.toLowerCase().includes(term)
    );
  }

  openNuevoDocumento(): void {
    this.isEditMode = false;
    this.editingDocumento = null;
    this.resetFormData();
    this.showModal = true;
  }

  editarDocumento(documento: DocumentoRequerido): void {
    this.isEditMode = true;
    this.editingDocumento = documento;
    
    this.formData = {
      nombre: documento.nombre,
      descripcion: documento.descripcion || '',
      tipo: documento.es_fijo === 1 ? 'fijo' : 'periodico',
      aplicaA: documento.tipo_estudiante || 'todos',
      obligatorio: documento.obligatorio === 1,
      dias_vigencia: documento.dias_vigencia || null
    };
    
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.resetFormData();
  }

  resetFormData(): void {
    this.formData = {
      nombre: '',
      descripcion: '',
      tipo: 'fijo',
      aplicaA: 'todos',
      obligatorio: true,
      dias_vigencia: null
    };
  }

  guardarDocumento(): void {
    if (!this.formData.nombre) {
      alert('Por favor ingresa el nombre del documento');
      return;
    }

    const dataToSend = {
      nombre: this.formData.nombre.trim(),
      descripcion: this.formData.descripcion.trim(),
      tipo: this.formData.tipo,
      obligatorio: this.formData.obligatorio ? 1 : 0,
      tipo_estudiante: this.formData.aplicaA === 'todos' ? null : this.formData.aplicaA,
      dias_vigencia: this.formData.tipo === 'periodico' ? (this.formData.dias_vigencia || 180) : null
    };

    console.log('[ADMIN-DOCS] Guardando documento:', dataToSend);

    if (this.isEditMode && this.editingDocumento) {
      // Actualizar
      this.http.put(
        `${this.apiUrl}/documentos/plantillas/${this.editingDocumento.id_plantilla}`, 
        dataToSend
      ).subscribe({
        next: (response) => {
          console.log('[ADMIN-DOCS] Actualizado:', response);
          alert('Documento actualizado exitosamente');
          this.closeModal();
          this.loadDocumentos();
        },
        error: (error) => {
          console.error('[ADMIN-DOCS] Error actualizando:', error);
          alert('Error al actualizar: ' + (error.error?.error || error.message));
        }
      });
    } else {
      // Crear nuevo
      this.http.post(
        `${this.apiUrl}/documentos/plantillas`, 
        dataToSend
      ).subscribe({
        next: (response) => {
          console.log('[ADMIN-DOCS] Creado:', response);
          alert('Documento creado exitosamente');
          this.closeModal();
          this.loadDocumentos();
        },
        error: (error) => {
          console.error('[ADMIN-DOCS] Error creando:', error);
          alert('Error al crear: ' + (error.error?.error || error.message));
        }
      });
    }
  }

  eliminarDocumento(documento: DocumentoRequerido): void {
    if (!confirm(`¿Estás seguro de que deseas eliminar "${documento.nombre}"?\n\nEsta acción no se puede deshacer.`)) {
      return;
    }

    this.http.delete(`${this.apiUrl}/documentos/plantillas/${documento.id_plantilla}`).subscribe({
      next: () => {
        alert('Documento eliminado exitosamente');
        this.loadDocumentos();
      },
      error: (error) => {
        console.error('[ADMIN-DOCS] Error eliminando:', error);
        alert(error.error?.error || 'Error al eliminar documento');
      }
    });
  }

  verDocumento(pendiente: DocumentoPendiente): void {
    console.log('[ADMIN-DOCS] Viendo documento:', pendiente.id_documento);
    
    // Usar la misma lógica que descargar pero abrir en nueva pestaña
    this.http.get(`${this.apiUrl}/documentos/descargar/${pendiente.id_documento}`, {
      responseType: 'blob'
    }).subscribe({
      next: (blob) => {
        // Crear URL del blob y abrir en nueva pestaña
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        
        // Limpiar URL después de un tiempo
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
        }, 100);
      },
      error: (error) => {
        console.error('[ADMIN-DOCS] Error viendo documento:', error);
        alert('Error al ver el documento');
      }
    });
  }

  descargarDocumento(pendiente: DocumentoPendiente): void {
    this.http.get(`${this.apiUrl}/documentos/descargar/${pendiente.id_documento}`, {
      responseType: 'blob'
    }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = pendiente.nombre_archivo;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('[ADMIN-DOCS] Error descargando:', error);
        alert('Error al descargar el documento');
      }
    });
  }

  aprobarDocumento(pendiente: DocumentoPendiente): void {
    if (!confirm(`¿Estás seguro de aprobar el documento "${pendiente.plantilla_nombre}" de ${pendiente.estudiante_nombre}?`)) {
      return;
    }

    this.http.put(`${this.apiUrl}/documentos/validar/${pendiente.id_documento}`, {
      estado: 'APROBADO',
      comentario: ''
    }).subscribe({
      next: () => {
        alert('Documento aprobado exitosamente');
        this.loadDocumentos();
      },
      error: (error) => {
        console.error('[ADMIN-DOCS] Error aprobando:', error);
        alert(error.error?.error || 'Error al aprobar documento');
      }
    });
  }

  rechazarDocumento(pendiente: DocumentoPendiente): void {
    const motivo = prompt(`Ingresa el motivo del rechazo para ${pendiente.estudiante_nombre}:`);
    
    if (!motivo) {
      return;
    }

    if (!confirm(`¿Estás seguro de rechazar el documento "${pendiente.plantilla_nombre}"?\n\nEl estudiante será notificado con el motivo.`)) {
      return;
    }

    this.http.put(`${this.apiUrl}/documentos/validar/${pendiente.id_documento}`, {
      estado: 'RECHAZADO',
      comentario: motivo
    }).subscribe({
      next: () => {
        alert('Documento rechazado. El estudiante será notificado.');
        this.loadDocumentos();
      },
      error: (error) => {
        console.error('[ADMIN-DOCS] Error rechazando:', error);
        alert(error.error?.error || 'Error al rechazar documento');
      }
    });
  }

  loadNavigation(): void {
    this.navigationItems = [
      { icon: 'home', label: 'Inicio', route: '/admin-dashboard', badge: 0 },
      { icon: 'file-text', label: 'Documentos', route: '/admin-documentos', badge: 0 },
      { icon: 'folder', label: 'Gestión', route: '/admin-gestion', badge: 0 },
      { icon: 'user', label: 'Perfil', route: '/admin-perfil', badge: 0 }
    ];
  }

  navigateTo(route: string): void {
    this.currentRoute = route;
    this.router.navigate([route]);
  }

  getIcon(iconName: string): string {
    const icons: { [key: string]: string } = {
      'home': 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
      'file-text': 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8',
      'search': 'M11 2a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM21 21l-4.35-4.35',
      'folder': 'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z',
      'user': 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
      'upload': 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12',
    };
    return icons[iconName] || icons['file-text'];
  }

  logout(): void {
    console.log('[ADMIN-DOCS] Cerrando sesión...');
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    this.router.navigate(['']);
  }

  getTipoLabel(doc: DocumentoRequerido): string {
    return doc.es_fijo === 1 ? 'Fijo' : 'Periódico';
  }

  getVencimientoText(dias: number | undefined): string {
    if (!dias) return '';
    if (dias < 30) return `${dias} días`;
    const meses = Math.floor(dias / 30);
    return `${meses} ${meses === 1 ? 'mes' : 'meses'}`;
  }
}