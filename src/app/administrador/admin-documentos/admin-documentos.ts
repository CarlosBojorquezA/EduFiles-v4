import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface DocumentoRequerido {
  id: string;
  nombre: string;
  descripcion: string;
  tipo: 'fijo' | 'periodico';
  obligatorio: boolean;
  vencimiento?: string;
  fechaCreado: Date;
}

interface DocumentoPendiente {
  id: string;
    estudiante: {
    nombre: string;
    email: string;
  };
  tipoDocumento: string;
  descripcion: string;
  fechaSubido: Date;
  vencido: boolean;
}

interface FormData {
  nombre: string;
  descripcion: string;
  instrucciones: string;
  categoria: 'fijo' | 'periodico';
  aplicaA: string;
  obligatorio: boolean;
  vencimiento: string;
  formatos: {
    pdf: boolean;
    jpg: boolean;
    png: boolean;
    jpeg: boolean;
    doc: boolean;
    docx: boolean;
  };
  tamanoMaximo: string;
}

interface NavItem {
  icon: string;
  label: string;
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-admin-documentos',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-documentos.html',
  styleUrls: ['./admin-documentos.css']
})
export class AdminDocumentosComponent implements OnInit {
  // Usuario
  userRole: 'administrador' | 'estudiante' | 'profesor' = 'administrador';
  userName: string = 'Carlos Rodríguez';
  notificationCount: number = 3;
  currentRoute: string = '/admin-dashboard';

  // Tabs
  activeTab: 'requeridos' | 'pendientes' = 'requeridos';

  // Documentos Requeridos
  documentosRequeridos: DocumentoRequerido[] = [
    {
      id: 'DOC-001',
      nombre: 'Certificado de Nacimiento',
      descripcion: 'Certificado original solicitado para inscripción',
      tipo: 'fijo',
      obligatorio: true,
      fechaCreado: new Date('2024-01-15')
    },
    {
      id: 'DOC-002',
      nombre: 'Constancia de Estudios',
      descripcion: 'Constancia de estudios del semestre anterior',
      tipo: 'periodico',
      obligatorio: true,
      vencimiento: '6 meses',
      fechaCreado: new Date('2024-02-01')
    },
    {
      id: 'DOC-003',
      nombre: 'Comprobante de Domicilio',
      descripcion: 'Comprobante de domicilio reciente',
      tipo: 'fijo',
      obligatorio: false,
      fechaCreado: new Date('2024-01-20')
    },
    {
      id: 'DOC-004',
      nombre: 'Identificación Oficial',
      descripcion: 'INE o pasaporte vigente',
      tipo: 'fijo',
      obligatorio: true,
      fechaCreado: new Date('2024-01-10')
    }
  ];

  // Documentos Pendientes
  documentosPendientes: DocumentoPendiente[] = [
    {
      id: 'EST-001',
      estudiante: {
        nombre: 'María García',
        email: 'maria.garcia@estudiante.edu'
      },
      tipoDocumento: 'Certificado de Nacimiento',
      descripcion: 'Certificado original solicitado para inscripción',
      fechaSubido: new Date('2024-03-01'),
      vencido: false
    },
    {
      id: 'EST-002',
      estudiante: {
        nombre: 'Juan Pérez',
        email: 'juan.perez@estudiante.edu'
      },
      tipoDocumento: 'Constancia de Estudios',
      descripcion: 'Constancia de estudios del semestre anterior',
      fechaSubido: new Date('2024-02-28'),
      vencido: true
    },
    {
      id: 'EST-003',
      estudiante: {
        nombre: 'Ana Martínez',
        email: 'ana.martinez@estudiante.edu'
      },
      tipoDocumento: 'Comprobante de Domicilio',
      descripcion: 'Comprobante de domicilio reciente',
      fechaSubido: new Date('2024-03-05'),
      vencido: false
    },
    {
      id: 'EST-004',
      estudiante: {
        nombre: 'Carlos López',
        email: 'carlos.lopez@estudiante.edu'
      },
      tipoDocumento: 'Identificación Oficial',
      descripcion: 'INE o pasaporte vigente',
      fechaSubido: new Date('2024-03-02'),
      vencido: false
    },
    {
      id: 'EST-005',
      estudiante: {
        nombre: 'Laura Hernández',
        email: 'laura.hernandez@estudiante.edu'
      },
      tipoDocumento: 'Certificado de Nacimiento',
      descripcion: 'Certificado original solicitado para inscripción',
      fechaSubido: new Date('2024-02-25'),
      vencido: true
    }
  ];

  // Search and Filter
  searchTerm: string = '';
  searchTermPendientes: string = '';
  selectedCategory: string = '';

  // Modal
  showModal: boolean = false;
  isEditMode: boolean = false;
  editingDocumento: DocumentoRequerido | null = null;

  formData: FormData = {
    nombre: '',
    descripcion: '',
    instrucciones: '',
    categoria: 'fijo',
    aplicaA: 'todos',
    obligatorio: true,
    vencimiento: '6meses',
    formatos: {
      pdf: true,
      jpg: false,
      png: false,
      jpeg: false,
      doc: false,
      docx: false
    },
    tamanoMaximo: '5'
  };

  constructor(private router: Router) {}

  navigationItems: NavItem[] = [];
  // Filtered Lists
  get filteredDocumentos(): DocumentoRequerido[] {
    let filtered = this.documentosRequeridos;

    if (this.searchTerm) {
      filtered = filtered.filter(doc =>
        doc.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        doc.descripcion.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    if (this.selectedCategory) {
      filtered = filtered.filter(doc => doc.tipo === this.selectedCategory);
    }

    return filtered;
  }

  get filteredPendientes(): DocumentoPendiente[] {
    if (!this.searchTermPendientes) {
      return this.documentosPendientes;
    }

    return this.documentosPendientes.filter(pendiente =>
      pendiente.estudiante.nombre.toLowerCase().includes(this.searchTermPendientes.toLowerCase()) ||
      pendiente.estudiante.email.toLowerCase().includes(this.searchTermPendientes.toLowerCase()) ||
      pendiente.id.toLowerCase().includes(this.searchTermPendientes.toLowerCase()) ||
      pendiente.tipoDocumento.toLowerCase().includes(this.searchTermPendientes.toLowerCase())
    );
  }

  // Modal Methods
  openNuevoDocumento(): void {
    this.isEditMode = false;
    this.editingDocumento = null;
    this.resetFormData();
    this.showModal = true;
  }

  editarDocumento(documento: DocumentoRequerido): void {
    this.isEditMode = true;
    this.editingDocumento = documento;
    
    // Cargar datos del documento en el formulario
    this.formData = {
      nombre: documento.nombre,
      descripcion: documento.descripcion,
      instrucciones: '',
      categoria: documento.tipo,
      aplicaA: 'todos',
      obligatorio: documento.obligatorio,
      vencimiento: documento.vencimiento || '6meses',
      formatos: {
        pdf: true,
        jpg: false,
        png: false,
        jpeg: false,
        doc: false,
        docx: false
      },
      tamanoMaximo: '5'
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
      instrucciones: '',
      categoria: 'fijo',
      aplicaA: 'todos',
      obligatorio: true,
      vencimiento: '6meses',
      formatos: {
        pdf: true,
        jpg: false,
        png: false,
        jpeg: false,
        doc: false,
        docx: false
      },
      tamanoMaximo: '5'
    };
  }

  guardarDocumento(): void {
    if (!this.formData.nombre) {
      alert('Por favor ingresa el nombre del documento');
      return;
    }

    if (this.isEditMode && this.editingDocumento) {
      // Actualizar documento existente
      const index = this.documentosRequeridos.findIndex(
        doc => doc.id === this.editingDocumento!.id
      );
      
      if (index !== -1) {
        this.documentosRequeridos[index] = {
          ...this.editingDocumento,
          nombre: this.formData.nombre,
          descripcion: this.formData.descripcion,
          tipo: this.formData.categoria,
          obligatorio: this.formData.obligatorio,
          vencimiento: this.formData.categoria === 'periodico' ? this.formData.vencimiento : undefined
        };
      }
      
      alert('Documento actualizado exitosamente');
    } else {
      // Crear nuevo documento
      const nuevoDocumento: DocumentoRequerido = {
        id: `DOC-${String(this.documentosRequeridos.length + 1).padStart(3, '0')}`,
        nombre: this.formData.nombre,
        descripcion: this.formData.descripcion,
        tipo: this.formData.categoria,
        obligatorio: this.formData.obligatorio,
        vencimiento: this.formData.categoria === 'periodico' ? this.formData.vencimiento : undefined,
        fechaCreado: new Date()
      };

      this.documentosRequeridos.push(nuevoDocumento);
      alert('Documento creado exitosamente');
    }

    this.closeModal();
  }

  eliminarDocumento(documento: DocumentoRequerido): void {
    if (confirm(`¿Estás seguro de que deseas eliminar "${documento.nombre}"?`)) {
      this.documentosRequeridos = this.documentosRequeridos.filter(
        doc => doc.id !== documento.id
      );
      alert('Documento eliminado exitosamente');
    }
  }

  getFormatosSeleccionados(): string {
    const formatos: string[] = [];
    if (this.formData.formatos.pdf) formatos.push('PDF');
    if (this.formData.formatos.jpg) formatos.push('JPG');
    if (this.formData.formatos.png) formatos.push('PNG');
    if (this.formData.formatos.jpeg) formatos.push('JPEG');
    if (this.formData.formatos.doc) formatos.push('DOC');
    if (this.formData.formatos.docx) formatos.push('DOCX');
    
    return formatos.length > 0 ? formatos.join(', ') : 'Ninguno';
  }

  // Pendientes Actions
  verDocumento(pendiente: DocumentoPendiente): void {
    console.log('Ver documento:', pendiente);
    alert(`Abriendo documento de ${pendiente.estudiante.nombre}...`);
    // Aquí implementarías la lógica para abrir el documento
  }

  aprobarDocumento(pendiente: DocumentoPendiente): void {
    if (confirm(`¿Aprobar el documento de ${pendiente.estudiante.nombre}?`)) {
      this.documentosPendientes = this.documentosPendientes.filter(
        doc => doc.id !== pendiente.id
      );
      alert('Documento aprobado exitosamente');
      this.notificationCount = Math.max(0, this.notificationCount - 1);
    }
  }

  rechazarDocumento(pendiente: DocumentoPendiente): void {
    const motivo = prompt(`Ingresa el motivo del rechazo para ${pendiente.estudiante.nombre}:`);
    if (motivo) {
      this.documentosPendientes = this.documentosPendientes.filter(
        doc => doc.id !== pendiente.id
      );
      alert('Documento rechazado. El estudiante será notificado.');
      this.notificationCount = Math.max(0, this.notificationCount - 1);
    }
  }

  ngOnInit(): void {
    this.loadNavigation();
    this.currentRoute = this.router.url;
  }

  loadNavigation(): void {
    const navigationConfig = {
      administrador: [
        { icon: 'home', label: 'Inicio', route: '/admin-dashboard', badge: 0 },
        { icon: 'file-text', label: 'Documentos', route: '/admin-documentos', badge: 23 },
        { icon: 'folder', label: 'Gestión', route: '/admin-gestion', badge: 0 },
        { icon: 'user', label: 'Perfil', route: '/admin-perfil', badge: 0 }
      ],
      estudiante: [
        { icon: 'home', label: 'Inicio', route: '/est-dashboard', badge: 0 },
        { icon: 'upload', label: 'Documentos', route: '/est-documentos', badge: 0 },
        { icon: 'clock', label: 'Pendientes', route: '/est-pendientes', badge: 5 },
        { icon: 'user', label: 'Perfil', route: '/est-perfil', badge: 0 }
      ],
      profesor: [
        { icon: 'home', label: 'Inicio', route: '/prof-dashboard', badge: 0 },
        { icon: 'users', label: 'Estudiantes', route: '/prof-MensEstudiantes', badge: 0 },
        { icon: 'clock', label: 'Pendientes', route: '/prof-MensPendientes', badge: 12 },
        { icon: 'user', label: 'Perfil', route: '/est-perfil', badge: 0 }
      ]
    };

    this.navigationItems = navigationConfig[this.userRole];
  }

  // Navigation Methods
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
      'users': 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
      'upload': 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12',
    };
    return icons[iconName] || icons['file-text'];
  }

  logout(): void {
      this.router.navigate(['']);
    }
  }

