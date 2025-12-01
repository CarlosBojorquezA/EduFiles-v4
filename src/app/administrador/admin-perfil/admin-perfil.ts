import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NotificationsComponent } from '../../notificaciones/notificaciones';
import { AuthService } from '../../auth.service';

interface UserProfile {
  fullName: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  email: string;
  alternativeEmail: string;
  phone: string;
  department: string;
  position: string;
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
  'clock': 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 6v6l4 2',
  'users': 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  'folder': 'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z',
  'user': 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  'upload': 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12',
  'file-text': 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8'
};

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NotificationsComponent],
  templateUrl: './admin-perfil.html',
  styleUrls: ['./admin-perfil.css']
})
export class AdminPerfilComponent implements OnInit {
  userRole: string = 'administrador';
  userName: string = '';
  currentRoute: string = '/perfil';

  // Tabs
  activeTab: 'contacto' | 'seguridad' = 'contacto';

  // Datos del Perfil (Inicialización tipada)
  userProfile: UserProfile = {
    fullName: '',
    nombres: '',
    apellido_paterno: '',
    apellido_materno: '',
    email: '',
    alternativeEmail: '',
    phone: '',
    department: '',
    position: ''
  };

  // Estado de Edición
  isEditingContact: boolean = false;
  originalProfile: UserProfile | null = null;

  // Datos de Seguridad
  lastPasswordUpdate: string = 'No registrado';
  activeSessions: number = 1;

  // Modales
  showChangePasswordModal: boolean = false;
  showVerificationModal: boolean = false;

  // Formularios
  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
  verificationCode: string = '';

  navigationItems: NavItem[] = [];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.checkAuth()) return;
    this.currentRoute = this.router.url;
    this.loadUserProfile();
    this.loadNavigation();
  }

  private checkAuth(): boolean {
    if (!localStorage.getItem('token')) {
      this.router.navigate(['']);
      return false;
    }
    return true;
  }

  loadUserProfile(): void {
    this.authService.getPerfil().subscribe({
      next: (data: any) => {
        this.userRole = (data.rol || 'administrador').toLowerCase();
        
        const detalles = data.detalles || {};
        const nombreCompleto = `${detalles.nombres} ${detalles.apellido_paterno} ${detalles.apellido_materno || ''}`.trim();
        
        this.userName = nombreCompleto;

        // Mapeo seguro
        this.userProfile = {
          fullName: nombreCompleto,
          nombres: detalles.nombres || '',
          apellido_paterno: detalles.apellido_paterno || '',
          apellido_materno: detalles.apellido_materno || '',
          email: data.correo || '',
          alternativeEmail: detalles.correo_alternativo || '',
          phone: detalles.telefono || '',
          department: detalles.departamento || '',
          position: detalles.puesto || ''
        };
      },
      error: (err) => {
        console.error('[PERFIL] Error cargando datos:', err);
        if (err.status === 401) {
          alert('Sesión expirada');
          this.logout();
        }
      }
    });
  }

  // --- Lógica de Pestañas y Navegación ---
  setTab(tab: 'contacto' | 'seguridad'): void {
    this.activeTab = tab;
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

  // --- Edición de Contacto ---
  enableEditContact(): void {
    // Crear copia profunda para poder cancelar
    this.originalProfile = { ...this.userProfile };
    this.isEditingContact = true;
  }

  cancelEditContact(): void {
    if (this.originalProfile) {
      this.userProfile = { ...this.originalProfile };
    }
    this.isEditingContact = false;
    this.originalProfile = null;
  }

  saveContactChanges(): void {
    const nombreCompleto = this.userProfile.fullName.trim();
    const partes = nombreCompleto.split(' ').filter(p => p.trim().length > 0); // Eliminar espacios dobles
    
    let nuevosNombres = '';
    let nuevoPaterno = '';
    let nuevoMaterno = '';

    if (partes.length === 1) {
      nuevosNombres = partes[0];
    } else if (partes.length === 2) {
      nuevosNombres = partes[0];
      nuevoPaterno = partes[1];
    } else {
      nuevoMaterno = partes.pop() || '';
      nuevoPaterno = partes.pop() || '';
      nuevosNombres = partes.join(' ');
    }
    
    // Actualizamos el objeto local
    this.userProfile.nombres = nuevosNombres;
    this.userProfile.apellido_paterno = nuevoPaterno;
    this.userProfile.apellido_materno = nuevoMaterno;

    // Payload para enviar al backend
    const payload = {
      email: this.userProfile.email,
      nombres: this.userProfile.nombres,
      apellido_paterno: this.userProfile.apellido_paterno,
      apellido_materno: this.userProfile.apellido_materno,
      telefono: this.userProfile.phone,
      departamento: this.userProfile.department,
      puesto: this.userProfile.position,
      correo_alternativo: this.userProfile.alternativeEmail
    };

    this.authService.actualizarPerfil(payload).subscribe({
      next: () => {
        // Actualizar UI global
        this.userName = this.userProfile.fullName;
        this.updateLocalStorageUser();
        
        alert('Perfil actualizado exitosamente');
        this.isEditingContact = false;
        this.originalProfile = null;
      },
      error: (err) => {
        console.error('Error al actualizar:', err);
        alert('Error al guardar los cambios: ' + (err.error?.error || 'Error desconocido'));
      }
    });
  }

  private updateLocalStorageUser(): void {
    try {
      const userDataStr = localStorage.getItem('userData');
      if (userDataStr) {
        const currentUser = JSON.parse(userDataStr);
        if (currentUser.detalles) {
          currentUser.detalles.nombres = this.userProfile.nombres;
          currentUser.detalles.apellido_paterno = this.userProfile.apellido_paterno;
          currentUser.detalles.apellido_materno = this.userProfile.apellido_materno;
          localStorage.setItem('userData', JSON.stringify(currentUser));
        }
      }
    } catch (e) {
      console.error('Error actualizando localStorage', e);
    }
  }

  // --- Cambio de Contraseña ---
  openChangePasswordModal(): void { this.showChangePasswordModal = true; }
  closeChangePasswordModal(): void { this.showChangePasswordModal = false; }

  requestPasswordChange(): void {
    if (!this.passwordForm.currentPassword || !this.passwordForm.newPassword || !this.passwordForm.confirmPassword) {
      alert('Por favor completa todos los campos');
      return;
    }

    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      alert('Las contraseñas nuevas no coinciden');
      return;
    }

    if (this.passwordForm.newPassword.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    // Solicitar código
    const btn = document.querySelector('.btn-modal-primary') as HTMLButtonElement;
    if(btn) { btn.innerText = 'Enviando código...'; btn.disabled = true; }

    this.authService.solicitarCodigoCambio().subscribe({
      next: (res) => {
        console.log('Código enviado');
        this.showChangePasswordModal = false;
        this.showVerificationModal = true;
        
        if(btn) { btn.innerText = 'Cambiar Contraseña'; btn.disabled = false; }
      },
      error: (err) => {
        console.error(err);
        alert('Error al enviar el código: ' + (err.error?.error || 'Error de servidor'));
        if(btn) { btn.innerText = 'Cambiar Contraseña'; btn.disabled = false; }
      }
    });
  }

  closeVerificationModal(): void {
    this.showVerificationModal = false;
    this.verificationCode = '';
  }

  verifyAndChangePassword(): void {
    if (!this.verificationCode) {
      alert('Por favor introduce el código de verificación');
      return;
    }

    this.authService.confirmarCambioPassword(
      this.verificationCode,
      this.passwordForm.currentPassword,
      this.passwordForm.newPassword
    ).subscribe({
      next: () => {
        alert('¡Contraseña cambiada exitosamente!');
        this.closeVerificationModal();
        this.closeChangePasswordModal();
        
        this.passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
        this.verificationCode = '';
        this.lastPasswordUpdate = 'hace unos segundos';
      },
      error: (err) => {
        console.error(err);
        alert(err.error?.error || 'Código incorrecto o expirado');
      }
    });
  }

  viewActiveSessions(): void {
    alert('Esta funcionalidad estará disponible próximamente.');
  }

  getIcon(iconName: string): string {
    return ICONS_MAP[iconName] || ICONS_MAP['file-text'];
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['']);
  }
}
