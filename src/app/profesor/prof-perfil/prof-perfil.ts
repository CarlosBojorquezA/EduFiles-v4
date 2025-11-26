
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NotificationsComponent } from '../../notificaciones/notificaciones';
import { AuthService } from '../../auth.service';

interface NavItem {
  icon: string;
  label: string;
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-prof-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, NotificationsComponent],
  templateUrl: './prof-perfil.html',
  styleUrls: ['./prof-perfil.css']
})
export class ProfPerfilComponent implements OnInit {
  activeTab: 'contact' | 'security' = 'contact';
  isEditingContact: boolean = false;
  showChangePasswordModal: boolean = false;
  showVerificationModal: boolean = false;
  currentRoute: string = '/prof-perfil';

  userRole: string = 'Profesor';
  userName: string = '';
  userAccountNumber: string = '';
  userMateria: string = '';
  notificationCount: number = 0;

  userProfile: any = {
    userName: '',
    nombres: '',
    apellido_paterno: '',
    apellido_materno: '',
    avatar: 'PR',
    email: '',
    phone: '',
    officeHours: '',
    departamento: '',
    puesto: ''
  };

  editedprofile: any = { ...this.userProfile };
  originalProfile: any = null;

  // Configuración de seguridad
  securityConfig = {
    passwordLastUpdated: 'No registrado',
    twoFactorEnabled: false,
    activeSessions: 1
  };

  // Cambio de contraseña
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
    this.loadUserProfile();
    this.loadNavigation();
    this.currentRoute = this.router.url;
  }

  loadUserProfile(): void {
    this.authService.getPerfil().subscribe({
      next: (data) => {
        console.log('[PROF-PERFIL] Datos recibidos:', data);
        
        this.userRole = 'Profesor';
        const detalles = data.detalles || {};
        
        // Construir nombre completo
        const nombreCompleto = `${detalles.nombres} ${detalles.apellido_paterno} ${detalles.apellido_materno || ''}`.trim();
        this.userName = nombreCompleto;
        this.userAccountNumber = data.num_usuario || '';
        this.userMateria = detalles.departamento || 'Profesor';
        
        // Generar avatar (iniciales)
        const iniciales = `${detalles.nombres?.charAt(0) || ''}${detalles.apellido_paterno?.charAt(0) || ''}`.toUpperCase();

        // Mapear datos del backend
        this.userProfile = {
          userName: nombreCompleto,
          nombres: detalles.nombres,
          apellido_paterno: detalles.apellido_paterno,
          apellido_materno: detalles.apellido_materno || '',
          avatar: iniciales || 'PR',
          email: data.correo,
          phone: detalles.telefono || '',
          officeHours: detalles.horario_oficina || 'No registrado',
          departamento: detalles.departamento || '',
          puesto: detalles.puesto || ''
        };

        this.editedprofile = { ...this.userProfile };
      },
      error: (err) => {
        console.error('[PROF-PERFIL] Error cargando perfil:', err);
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

  startEditingContact(): void {
    this.isEditingContact = true;
    this.editedprofile = { ...this.userProfile };
    this.originalProfile = { ...this.userProfile };
  }

  cancelEditingContact(): void {
    this.isEditingContact = false;
    if (this.originalProfile) {
      this.editedprofile = { ...this.originalProfile };
      this.userProfile = { ...this.originalProfile };
    }
    this.originalProfile = null;
  }

  saveContactChanges(): void {
    // Separar el nombre completo
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
        // Actualizar datos locales
        this.userProfile = { ...this.editedprofile };
        this.userProfile.nombres = nuevosNombres;
        this.userProfile.apellido_paterno = nuevoPaterno;
        this.userProfile.apellido_materno = nuevoMaterno;
        this.userName = this.editedprofile.userName;
        
        // Actualizar localStorage
        const currentUser = JSON.parse(localStorage.getItem('userData') || '{}');
        if (currentUser && currentUser.detalles) {
          currentUser.detalles.nombres = nuevosNombres;
          currentUser.detalles.apellido_paterno = nuevoPaterno;
          currentUser.detalles.apellido_materno = nuevoMaterno;
          currentUser.detalles.telefono = this.editedprofile.phone;
          currentUser.detalles.horario_oficina = this.editedprofile.officeHours;
          currentUser.correo = this.editedprofile.email;
          localStorage.setItem('userData', JSON.stringify(currentUser));
        }

        alert('Perfil actualizado exitosamente');
        this.isEditingContact = false;
        this.originalProfile = null;
      },
      error: (err) => {
        console.error('[PROF-PERFIL] Error al actualizar:', err);
        alert('Error al guardar los cambios');
      }
    });
  }

  openChangePasswordModal(): void {
    this.showChangePasswordModal = true;
    this.passwordForm = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
  }

  closeChangePasswordModal(): void {
    this.showChangePasswordModal = false;
    this.passwordForm = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
  }

  changePassword(): void {
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

    const btn = document.querySelector('.btn-modal-primary') as HTMLButtonElement;
    if (btn) btn.innerText = 'Enviando código...';
    if (btn) btn.disabled = true;

    this.authService.solicitarCodigoCambio().subscribe({
      next: (res) => {
        console.log('[PROF-PERFIL] Código enviado:', res);
        this.showChangePasswordModal = false;
        this.showVerificationModal = true;
        
        if (btn) btn.innerText = 'Cambiar Contraseña';
        if (btn) btn.disabled = false;
      },
      error: (err) => {
        console.error('[PROF-PERFIL] Error:', err);
        alert('Error al enviar el código: ' + (err.error?.error || 'Error de servidor'));
        if (btn) btn.innerText = 'Cambiar Contraseña';
        if (btn) btn.disabled = false;
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
      next: (res) => {
        alert('¡Contraseña cambiada exitosamente!');
        this.closeVerificationModal();
        this.closeChangePasswordModal();
        
        this.passwordForm = {
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        };
        this.verificationCode = '';
        this.securityConfig.passwordLastUpdated = 'hace unos segundos';
      },
      error: (err) => {
        console.error('[PROF-PERFIL] Error:', err);
        alert(err.error?.error || 'Código incorrecto o expirado');
      }
    });
  }

  configure2FA(): void {
    console.log('Configurar autenticación de dos factores');
  }

  viewActiveSessions(): void {
    console.log('Ver sesiones activas');
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
    return icons[iconName] || icons['user'];
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['']);
  }
}
