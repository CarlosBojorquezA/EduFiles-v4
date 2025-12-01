import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NotificationsComponent } from '../../notificaciones/notificaciones';
import { AuthService } from '../../auth.service';

// --- Interfaces ---
interface NavItem {
  icon: string;
  label: string;
  route: string;
  badge?: number;
}

interface UserProfile {
  userName: string; 
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  email: string;
  phone: string;
  officeHours: string;
  departamento: string;
  puesto: string;
}

// --- Constantes
const ICONS_MAP: { [key: string]: string } = {
  'home': 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  'material': 'M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25',
  'users': 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  'user': 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z'
};

@Component({
  selector: 'app-prof-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NotificationsComponent],
  templateUrl: './prof-perfil.html',
  styleUrls: ['./prof-perfil.css']
})
export class ProfPerfilComponent implements OnInit {
  // Datos Usuario
  userRole: string = 'Profesor';
  userName: string = '';
  userAccountNumber: string = '';
  userMateria: string = '';
  notificationCount: number = 0;
  currentRoute: string = '/prof-perfil';

  // Tabs
  activeTab: 'contact' | 'security' = 'contact';

  // Perfil (Inicializado)
  userProfile: UserProfile = {
    userName: '', nombres: '', apellido_paterno: '', apellido_materno: '',
    email: '', phone: '', officeHours: '', departamento: '', puesto: ''
  };

  // Edición
  isEditingContact: boolean = false;
  editedprofile: UserProfile = { ...this.userProfile };
  
  // Seguridad
  securityConfig = {
    passwordLastUpdated: 'No registrado',
    activeSessions: 1
  };

  // Formularios
  showChangePasswordModal: boolean = false;
  showVerificationModal: boolean = false;
  
  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
  verificationCode: string = '';

  navigationItems: NavItem[] = [];

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    if (!this.checkAuth()) return;
    this.loadUserProfile();
    this.loadNavigation();
    this.currentRoute = this.router.url;
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
      next: (data) => {
        this.userRole = 'Profesor';
        const detalles = data.detalles || {};
        
        const nombreCompleto = `${detalles.nombres} ${detalles.apellido_paterno} ${detalles.apellido_materno || ''}`.trim();
        
        this.userName = nombreCompleto;
        this.userAccountNumber = data.num_usuario || '';
        this.userMateria = detalles.departamento || 'Profesor';

        // Mapeo de datos
        this.userProfile = {
          userName: nombreCompleto,
          nombres: detalles.nombres,
          apellido_paterno: detalles.apellido_paterno,
          apellido_materno: detalles.apellido_materno || '',
          email: data.correo,
          phone: detalles.telefono || '',
          officeHours: detalles.horario_oficina || 'No registrado',
          departamento: detalles.departamento || '',
          puesto: detalles.puesto || ''
        };

        this.editedprofile = { ...this.userProfile };
      },
      error: (err) => {
        console.error('[PROF-PERFIL] Error:', err);
        if (err.status === 401) {
          this.router.navigate(['']);
        }
      }
    });
  }

  loadNavigation(): void {
    this.navigationItems = [
      { icon: 'home', label: 'Inicio', route: '/prof-dashboard', badge: 0 },
      { icon: 'material', label: 'Materiales', route: '/prof-materiales', badge: 0 },
      { icon: 'users', label: 'Estudiantes', route: '/prof-estudiantes', badge: 0 },
      { icon: 'user', label: 'Perfil', route: '/prof-perfil', badge: 0 }
    ];
  }

  setActiveTab(tab: 'contact' | 'security'): void {
    this.activeTab = tab;
  }

  // --- Edición de Contacto
  startEditingContact(): void {
    this.isEditingContact = true;
    this.editedprofile = { ...this.userProfile };
  }

  cancelEditingContact(): void {
    this.isEditingContact = false;
    this.editedprofile = { ...this.userProfile };
  }

  saveContactChanges(): void {
    const nombreCompleto = this.editedprofile.userName.trim();
    const partes = nombreCompleto.split(' ');
    
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

    const payload = {
      email: this.editedprofile.email,
      nombres: nuevosNombres,
      apellido_paterno: nuevoPaterno,
      apellido_materno: nuevoMaterno,
      telefono: this.editedprofile.phone,
      horario_oficina: this.editedprofile.officeHours,
      departamento: this.editedprofile.departamento,
      puesto: this.editedprofile.puesto
    };

    this.authService.actualizarPerfil(payload).subscribe({
      next: () => {
        this.userProfile = { ...this.editedprofile };
        this.userProfile.nombres = nuevosNombres;
        this.userProfile.apellido_paterno = nuevoPaterno;
        this.userProfile.apellido_materno = nuevoMaterno;
        this.userName = this.editedprofile.userName;
        
        this.updateLocalStorage(payload);

        alert('Perfil actualizado exitosamente');
        this.isEditingContact = false;
      },
      error: (err) => {
        console.error('[PROF-PERFIL] Error update:', err);
        alert('Error al guardar los cambios');
      }
    });
  }

  private updateLocalStorage(data: any): void {
    try {
      const currentUser = JSON.parse(localStorage.getItem('userData') || '{}');
      if (currentUser && currentUser.detalles) {
        currentUser.detalles.nombres = data.nombres;
        currentUser.detalles.apellido_paterno = data.apellido_paterno;
        currentUser.detalles.apellido_materno = data.apellido_materno;
        currentUser.detalles.telefono = data.telefono;
        currentUser.detalles.horario_oficina = data.horario_oficina;
        currentUser.correo = data.email;
        localStorage.setItem('userData', JSON.stringify(currentUser));
      }
    } catch (e) {
      console.error('Error updating localStorage', e);
    }
  }

  // --- Contraseña 
  openChangePasswordModal(): void {
    this.showChangePasswordModal = true;
    this.passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
  }

  closeChangePasswordModal(): void {
    this.showChangePasswordModal = false;
  }

  changePassword(): void {
    const { currentPassword, newPassword, confirmPassword } = this.passwordForm;

    if (!currentPassword || !newPassword || !confirmPassword) return alert('Completa todos los campos');
    if (newPassword !== confirmPassword) return alert('Las contraseñas no coinciden');
    if (newPassword.length < 6) return alert('La contraseña debe tener al menos 6 caracteres');

    const btn = document.querySelector('.btn-modal-primary') as HTMLButtonElement;
    if (btn) { btn.innerText = 'Enviando...'; btn.disabled = true; }

    this.authService.solicitarCodigoCambio().subscribe({
      next: () => {
        this.showChangePasswordModal = false;
        this.showVerificationModal = true;
        if (btn) { btn.innerText = 'Cambiar Contraseña'; btn.disabled = false; }
      },
      error: (err) => {
        alert('Error: ' + (err.error?.error || 'Error servidor'));
        if (btn) { btn.innerText = 'Cambiar Contraseña'; btn.disabled = false; }
      }
    });
  }

  closeVerificationModal(): void {
    this.showVerificationModal = false;
    this.verificationCode = '';
  }

  verifyAndChangePassword(): void {
    if (!this.verificationCode) return alert('Ingresa el código');

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
        this.securityConfig.passwordLastUpdated = 'hace unos segundos';
      },
      error: (err) => alert(err.error?.error || 'Código incorrecto')
    });
  }

  viewActiveSessions(): void {
    console.log('Ver sesiones activas');
  }

  navigateTo(route: string): void {
    this.currentRoute = route;
    this.router.navigate([route]);
  }

  getIcon(iconName: string): string {
    return ICONS_MAP[iconName] || ICONS_MAP['user'];
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['']);
  }
}
