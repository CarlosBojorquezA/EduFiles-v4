import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { environment } from '../../../environments/environment.development';
import { NotificationsComponent } from '../../notificaciones/notificaciones';

// --- Interfaces ---
export interface DocumentoRequerido {
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

export interface DocumentoPendiente {
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
  fecha_vencimiento?: string;
}

interface FormData {
  nombre: string;
  descripcion: string;
  tipo: 'fijo' | 'periodico';
  aplicaA: string;
  obligatorio: boolean;
  dias_vigencia: number | null;
}

interface AnalisisIA {
  sugerencia: 'APROBAR' | 'RECHAZAR';
  confianza: 'ALTA' | 'MEDIA' | 'BAJA';
  razones: string[];
  comentario_sugerido: string;
  timestamp: string;
}

interface ResultadoAnalisisIA {
  documento: {
    id: number;
    nombre_archivo: string;
    tipo_esperado: string;
    descripcion: string;
    estado_actual: string;
  };
  estudiante: {
    id: number;
    nombre: string;
    num_usuario: string;
    email: string;
    curp: string;
  };
  analisis_ia: AnalisisIA;
}

interface NavItem {
  icon: string;
  label: string;
  route: string;
  badge?: number;
}

// --- Constantes ---
const ICONS_MAP: { [key: string]: string } = {
  'home': 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  'file-text': 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8',
  'search': 'M11 2a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM21 21l-4.35-4.35',
  'folder': 'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z',
  'user': 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  'upload': 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12',
};

@Component({
  selector: 'app-admin-documentos',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NotificationsComponent],
  templateUrl: './admin-documentos.html',
  styleUrls: ['./admin-documentos.css']
})
export class AdminDocumentosComponent implements OnInit {
  private apiUrl = environment.apiUrl;

  // Estados
  analizandoConIA: boolean = false;
  resultadoIA: ResultadoAnalisisIA | null = null;
  showModalIA: boolean = false;
  showModal: boolean = false;
  isEditMode: boolean = false;
  isLoading: boolean = true;
  
  // Datos Usuario
  userName: string = '';
  userRole: string = 'administrador';
  notificationCount: number = 0;
  currentRoute: string = '/admin-documentos';

  // Datos Documentos
  activeTab: 'requeridos' | 'pendientes' = 'requeridos';
  documentosRequeridos: DocumentoRequerido[] = [];
  documentosPendientes: DocumentoPendiente[] = [];
  editingDocumento: DocumentoRequerido | null = null;
  
  // Filtros
  searchTerm: string = '';
  searchTermPendientes: string = '';
  selectedCategory: string = '';

  // Forms
  formData: FormData = this.getInitialFormData();
  navigationItems: NavItem[] = [];

  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    if (!this.checkAuth()) return;
    
    this.currentRoute = this.router.url;
    this.loadUserData();
    this.loadNavigation();
    
    // Si viene desde dashboard con tab específico
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    if (tab === 'pendientes' || tab === 'requeridos') {
      this.activeTab = tab;
    }

    this.loadDocumentos();
  }

  // --- Auth & User Data ---
  private checkAuth(): boolean {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Sesión expirada. Por favor inicia sesión nuevamente.');
      this.router.navigate(['']);
      return false;
    }
    return true;
  }

  loadUserData(): void {
    const userDataStr = localStorage.getItem('userData');
    if (!userDataStr) return;
    
    try {
      const user = JSON.parse(userDataStr);
      this.userName = user.detalles?.nombres 
        ? `${user.detalles.nombres} ${user.detalles.apellido_paterno || ''}`.trim()
        : (user.correo || user.num_usuario || 'Usuario');
    } catch (e) {
      console.error('Error parsing user data', e);
    }
  }

  // --- Carga de Datos ---
  loadDocumentos(): void {
    this.isLoading = true;
    console.log('[ADMIN-DOCS] Cargando datos...');

    forkJoin({
      plantillas: this.http.get<DocumentoRequerido[]>(`${this.apiUrl}/documentos/plantillas`).pipe(
        catchError(err => { console.error('Error plantillas', err); return of([]); })
      ),
      pendientes: this.http.get<any[]>(`${this.apiUrl}/documentos/pendientes`).pipe(
        catchError(err => { console.error('Error pendientes', err); return of([]); })
      ),
      notificaciones: this.http.get<{count: number}>(`${this.apiUrl}/notificaciones/no-leidas/count`).pipe(
        catchError(() => of({ count: 0 }))
      )
    }).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (results) => {
        this.documentosRequeridos = results.plantillas;
        this.documentosPendientes = results.pendientes.map(doc => ({
          ...doc,
          estudiante_nombre: `${doc.nombres} ${doc.apellido_paterno} ${doc.apellido_materno}`,
          estudiante_email: doc.correo || doc.estudiante_email,
          vencido: doc.fecha_vencimiento && new Date(doc.fecha_vencimiento) < new Date()
        }));
        this.notificationCount = results.notificaciones.count;
      }
    });
  }

  // --- Getters & Filtros ---
  get filteredDocumentos(): DocumentoRequerido[] {
    let filtered = this.documentosRequeridos;
    const term = this.searchTerm.toLowerCase();

    if (term) {
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
    if (!this.searchTermPendientes) return this.documentosPendientes;

    const term = this.searchTermPendientes.toLowerCase();
    return this.documentosPendientes.filter(p =>
      p.estudiante_nombre.toLowerCase().includes(term) ||
      p.estudiante_email.toLowerCase().includes(term) ||
      p.num_usuario.toLowerCase().includes(term) ||
      p.plantilla_nombre.toLowerCase().includes(term) ||
      p.nombre_archivo.toLowerCase().includes(term)
    );
  }

  // --- Gestión de Documentos (CRUD) ---
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

  // ✅ FUNCION RESTAURADA
  resetFormData(): void {
    this.formData = this.getInitialFormData();
  }

  guardarDocumento(): void {
    if (!this.formData.nombre) {
      alert('Por favor ingresa el nombre del documento');
      return;
    }

    const payload = {
      nombre: this.formData.nombre.trim(),
      descripcion: this.formData.descripcion.trim(),
      tipo: this.formData.tipo,
      obligatorio: this.formData.obligatorio ? 1 : 0,
      tipo_estudiante: this.formData.aplicaA === 'todos' ? null : this.formData.aplicaA,
      dias_vigencia: this.formData.tipo === 'periodico' ? (this.formData.dias_vigencia || 180) : null
    };

    const request$ = (this.isEditMode && this.editingDocumento)
      ? this.http.put(`${this.apiUrl}/documentos/plantillas/${this.editingDocumento.id_plantilla}`, payload)
      : this.http.post(`${this.apiUrl}/documentos/plantillas`, payload);

    request$.subscribe({
      next: () => {
        alert(`Documento ${this.isEditMode ? 'actualizado' : 'creado'} exitosamente`);
        this.closeModal();
        this.loadDocumentos();
      },
      error: (err) => alert('Error al guardar: ' + (err.error?.error || err.message))
    });
  }

  eliminarDocumento(documento: DocumentoRequerido): void {
    if (!confirm(`¿Estás seguro de eliminar "${documento.nombre}"? No se puede deshacer.`)) return;

    this.http.delete(`${this.apiUrl}/documentos/plantillas/${documento.id_plantilla}`).subscribe({
      next: () => {
        alert('Documento eliminado');
        this.loadDocumentos();
      },
      error: (err) => alert(err.error?.error || 'Error al eliminar')
    });
  }

  // --- Acciones de Documentos Pendientes ---
  
  // ✅ FUNCION RESTAURADA: Requerida por el HTML (click)="verDocumento(pendiente)"
  verDocumento(pendiente: DocumentoPendiente): void {
    // Reutilizamos la lógica de descarga pero indicando que se abra en nueva pestaña
    this.descargarDocumento(pendiente, true);
  }

  // Modificada para soportar el parámetro opcional 'abrir'
  descargarDocumento(pendiente: DocumentoPendiente, abrir: boolean = false): void {
    this.http.get(`${this.apiUrl}/documentos/descargar/${pendiente.id_documento}`, {
      responseType: 'blob'
    }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        if (abrir) {
          window.open(url, '_blank');
          setTimeout(() => window.URL.revokeObjectURL(url), 1000);
        } else {
          const a = document.createElement('a');
          a.href = url;
          a.download = pendiente.nombre_archivo;
          a.click();
          window.URL.revokeObjectURL(url);
        }
      },
      error: () => alert('Error al procesar el documento')
    });
  }

  // ✅ FUNCION RESTAURADA: Requerida por el HTML
  aprobarDocumento(pendiente: DocumentoPendiente): void {
    if (!confirm(`¿Estás seguro de aprobar el documento "${pendiente.plantilla_nombre}" de ${pendiente.estudiante_nombre}?`)) return;
    this.enviarValidacion(pendiente.id_documento, 'APROBADO', '');
  }

  // ✅ FUNCION RESTAURADA: Requerida por el HTML
  rechazarDocumento(pendiente: DocumentoPendiente): void {
    const motivo = prompt(`Ingresa el motivo del rechazo para ${pendiente.estudiante_nombre}:`);
    if (!motivo) return;
    if (!confirm(`¿Estás seguro de rechazar el documento?`)) return;
    this.enviarValidacion(pendiente.id_documento, 'RECHAZADO', motivo);
  }

  // Nueva función interna para evitar repetir código
  private enviarValidacion(id: number, estado: 'APROBADO' | 'RECHAZADO', comentario: string): void {
    this.http.put(`${this.apiUrl}/documentos/validar/${id}`, {
      estado,
      comentario
    }).subscribe({
      next: () => {
        alert(`Documento ${estado === 'APROBADO' ? 'aprobado' : 'rechazado'} exitosamente`);
        this.loadDocumentos();
      },
      error: (err) => alert(err.error?.error || `Error al procesar documento`)
    });
  }

  // --- Inteligencia Artificial ---
  analizarConIA(pendiente: DocumentoPendiente): void {
    if (!confirm(`¿Analizar "${pendiente.plantilla_nombre}" con IA?`)) return;

    this.analizandoConIA = true;
    this.http.post<ResultadoAnalisisIA>(
      `${this.apiUrl}/documentos/analizar-con-ia/${pendiente.id_documento}`, {}
    ).pipe(
      finalize(() => this.analizandoConIA = false)
    ).subscribe({
      next: (res) => {
        this.resultadoIA = res;
        this.showModalIA = true;
      },
      error: (err) => alert('Error en análisis IA: ' + (err.error?.error || err.message))
    });
  }

  aplicarSugerenciaIA(accion: 'APROBAR' | 'RECHAZAR'): void {
  if (!this.resultadoIA) return;
  
  const docId = this.resultadoIA.documento.id;
  const comentario = accion === 'RECHAZAR' ? this.resultadoIA.analisis_ia.comentario_sugerido : '';

  // CORRECCIÓN: Transformamos la acción (verbo) al estado (participio)
  const estado = accion === 'APROBAR' ? 'APROBADO' : 'RECHAZADO';

  this.enviarValidacion(docId, estado, comentario);
  this.cerrarModalIA();
}

  cerrarModalIA(): void {
    this.showModalIA = false;
    this.resultadoIA = null;
  }

  revisarManualmente(): void {
    if (this.resultadoIA) {
      // Usamos la nueva URL directa si existe, o construimos una
      const url = `${this.apiUrl}/documentos/ver/${this.resultadoIA.documento.id}`;
      window.open(url, '_blank');
      this.cerrarModalIA();
    }
  }

  // ✅ FUNCION RESTAURADA: Requerida por el HTML [class]="getConfianzaBadgeClass(...)"
  getConfianzaBadgeClass(confianza: string): string {
    switch (confianza) {
      case 'ALTA': return 'badge-alta';
      case 'MEDIA': return 'badge-media';
      case 'BAJA': return 'badge-baja';
      default: return '';
    }
  }

  // --- Utilidades ---
  private getInitialFormData(): FormData {
    return {
      nombre: '',
      descripcion: '',
      tipo: 'fijo',
      aplicaA: 'todos',
      obligatorio: true,
      dias_vigencia: null
    };
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
    return ICONS_MAP[iconName] || ICONS_MAP['file-text'];
  }

  getConfianzaColor(confianza: string): string {
    const colors: {[key: string]: string} = { 'ALTA': '#10b981', 'MEDIA': '#f59e0b', 'BAJA': '#ef4444' };
    return colors[confianza] || '#6b7280';
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

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    this.router.navigate(['']);
  }
}