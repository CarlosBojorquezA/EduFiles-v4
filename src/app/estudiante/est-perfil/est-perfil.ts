import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NotificationsComponent } from '../../notificaciones/notificaciones';
import { AuthService } from '../../auth.service';

interface NavItem {
  icon: string;
  label: string;
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-est-perfil',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NotificationsComponent],
  templateUrl: './est-perfil.html',
  styleUrls: ['./est-perfil.css']
})
export class EstPerfilComponent implements OnInit {
  userRole: 'estudiante' = 'estudiante';
  userName: string = '';
  userAccountNumber: string = '';
  userCareer: string = '';
  userGradeGroup: string = '';
  notificationCount: number = 0;
  currentRoute: string = '/est-perfil';

  // Tabs
  activeTab: 'contacto' | 'seguridad' = 'contacto';

  // User profile data
  userProfile: any = {
    fullName: '',
    nombres: '',
    apellido_paterno: '',
    apellido_materno: '',
    email: '',
    phone: '',
    userCareer: '',
    userGradeGroup: '',
    // Datos del tutor
    tutorFullName: '',
    tutorNombres: '',
    tutorApellidoPaterno: '',
    tutorApellidoMaterno: '',
    tutorEmail: '',
    tutorPhone: ''
  };

  // Edit mode
  isEditingContact: boolean = false;
  isEditingTutor: boolean = false;
  originalProfile: any = null;
  originalTutor: any = null;

  // Security data
  lastPasswordUpdate: string = 'No registrado';
  activeSessions: number = 1;

  // Change password modals
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
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
    this.loadNavigation();
    this.currentRoute = this.router.url;
  }

  loadUserProfile(): void {
    this.authService.getPerfil().subscribe({
      next: (data) => {
        console.log('[EST-PERFIL] Datos recibidos:', data);
        
        this.userRole = data.rol.toLowerCase() as 'estudiante';
        const detalles = data.detalles || {};
        
        // Construir nombre completo
        const nombreCompleto = `${detalles.nombres} ${detalles.apellido_paterno} ${detalles.apellido_materno || ''}`.trim();
        this.userName = nombreCompleto;
        this.userAccountNumber = data.num_usuario || '';
        
        // Carrera y grupo
        this.userCareer = detalles.nivel_educativo || 'Estudiante';
        if (detalles.grado) {
          this.userGradeGroup = `${detalles.grado}°`;
          if (detalles.grupo_turno) {
            this.userGradeGroup += ` ${detalles.grupo_turno}`;
          }
        }

        // Construir nombre completo del tutor
        const tutorNombreCompleto = detalles.tutor_nombres && detalles.tutor_apellido_paterno
          ? `${detalles.tutor_nombres} ${detalles.tutor_apellido_paterno} ${detalles.tutor_apellido_materno || ''}`.trim()
          : 'No registrado';

        // Mapear datos del backend al objeto del frontend
        this.userProfile = {
          fullName: nombreCompleto,
          nombres: detalles.nombres,
          apellido_paterno: detalles.apellido_paterno,
          apellido_materno: detalles.apellido_materno || '',
          email: data.correo,
          phone: detalles.telefono || '',
          userCareer: this.userCareer,
          userGradeGroup: this.userGradeGroup,
          // Datos del tutor
          tutorFullName: tutorNombreCompleto,
          tutorNombres: detalles.tutor_nombres || '',
          tutorApellidoPaterno: detalles.tutor_apellido_paterno || '',
          tutorApellidoMaterno: detalles.tutor_apellido_materno || '',
          tutorEmail: detalles.tutor_correo || '',
          tutorPhone: detalles.tutor_telefono || ''
        };
      },
      error: (err) => {
        console.error('[EST-PERFIL] Error cargando perfil:', err);
        if (err.status === 401) {
          this.router.navigate(['']);
        }
      }
    });
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

  setTab(tab: 'contacto' | 'seguridad'): void {
    this.activeTab = tab;
  }

  enableEditContact(): void {
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
    // Separar el nombre completo en partes
    const nombreCompleto = this.userProfile.fullName.trim();
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
      email: this.userProfile.email,
      nombres: nuevosNombres,
      apellido_paterno: nuevoPaterno,
      apellido_materno: nuevoMaterno,
      telefono: this.userProfile.phone
    };

    this.authService.actualizarPerfil(payload).subscribe({
      next: () => {
        // Actualizar datos locales INMEDIATAMENTE
        this.userProfile.nombres = nuevosNombres;
        this.userProfile.apellido_paterno = nuevoPaterno;
        this.userProfile.apellido_materno = nuevoMaterno;
        this.userName = this.userProfile.fullName;
        
        // Actualizar localStorage
        const currentUser = JSON.parse(localStorage.getItem('userData') || '{}');
        if (currentUser && currentUser.detalles) {
          currentUser.detalles.nombres = nuevosNombres;
          currentUser.detalles.apellido_paterno = nuevoPaterno;
          currentUser.detalles.apellido_materno = nuevoMaterno;
          currentUser.detalles.telefono = this.userProfile.phone;
          currentUser.correo = this.userProfile.email;
          localStorage.setItem('userData', JSON.stringify(currentUser));
        }

        alert('Perfil actualizado exitosamente');
        this.isEditingContact = false;
        this.originalProfile = null;
      },
      error: (err) => {
        console.error('[EST-PERFIL] Error al actualizar:', err);
        alert('Error al guardar los cambios');
      }
    });
  }

  enableEditTutor(): void {
    this.originalTutor = {
      tutorFullName: this.userProfile.tutorFullName,
      tutorNombres: this.userProfile.tutorNombres,
      tutorApellidoPaterno: this.userProfile.tutorApellidoPaterno,
      tutorApellidoMaterno: this.userProfile.tutorApellidoMaterno,
      tutorEmail: this.userProfile.tutorEmail,
      tutorPhone: this.userProfile.tutorPhone
    };
    this.isEditingTutor = true;
  }

  cancelEditTutor(): void {
    if (this.originalTutor) {
      this.userProfile.tutorFullName = this.originalTutor.tutorFullName;
      this.userProfile.tutorNombres = this.originalTutor.tutorNombres;
      this.userProfile.tutorApellidoPaterno = this.originalTutor.tutorApellidoPaterno;
      this.userProfile.tutorApellidoMaterno = this.originalTutor.tutorApellidoMaterno;
      this.userProfile.tutorEmail = this.originalTutor.tutorEmail;
      this.userProfile.tutorPhone = this.originalTutor.tutorPhone;
    }
    this.isEditingTutor = false;
    this.originalTutor = null;
  }

  saveTutorChanges(): void {
    // Separar el nombre completo del tutor
    const nombreCompleto = this.userProfile.tutorFullName.trim();
    const partes = nombreCompleto.split(' ');
    
    let tutorNombres = '';
    let tutorPaterno = '';
    let tutorMaterno = '';

    if (partes.length === 1) {
      tutorNombres = partes[0];
    } else if (partes.length === 2) {
      tutorNombres = partes[0];
      tutorPaterno = partes[1];
    } else {
      tutorMaterno = partes.pop() || '';
      tutorPaterno = partes.pop() || '';
      tutorNombres = partes.join(' ');
    }
    
    const payload = {
      tutor_nombres: tutorNombres,
      tutor_apellido_paterno: tutorPaterno,
      tutor_apellido_materno: tutorMaterno,
      tutor_correo: this.userProfile.tutorEmail,
      tutor_telefono: this.userProfile.tutorPhone
    };

    this.authService.actualizarPerfil(payload).subscribe({
      next: () => {
        // Actualizar datos locales
        this.userProfile.tutorNombres = tutorNombres;
        this.userProfile.tutorApellidoPaterno = tutorPaterno;
        this.userProfile.tutorApellidoMaterno = tutorMaterno;
        
        // Actualizar localStorage
        const currentUser = JSON.parse(localStorage.getItem('userData') || '{}');
        if (currentUser && currentUser.detalles) {
          currentUser.detalles.tutor_nombres = tutorNombres;
          currentUser.detalles.tutor_apellido_paterno = tutorPaterno;
          currentUser.detalles.tutor_apellido_materno = tutorMaterno;
          currentUser.detalles.tutor_correo = this.userProfile.tutorEmail;
          currentUser.detalles.tutor_telefono = this.userProfile.tutorPhone;
          localStorage.setItem('userData', JSON.stringify(currentUser));
        }

        alert('Datos del tutor actualizados exitosamente');
        this.isEditingTutor = false;
        this.originalTutor = null;
      },
      error: (err) => {
        console.error('[EST-PERFIL] Error al actualizar tutor:', err);
        alert('Error al guardar los datos del tutor');
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

    const btn = document.querySelector('.btn-modal-primary') as HTMLButtonElement;
    if (btn) btn.innerText = 'Enviando código...';
    if (btn) btn.disabled = true;

    this.authService.solicitarCodigoCambio().subscribe({
      next: (res) => {
        console.log('[EST-PERFIL] Código enviado:', res);
        this.showChangePasswordModal = false;
        this.showVerificationModal = true;
        
        if (btn) btn.innerText = 'Cambiar Contraseña';
        if (btn) btn.disabled = false;
      },
      error: (err) => {
        console.error('[EST-PERFIL] Error:', err);
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
        this.lastPasswordUpdate = 'hace unos segundos';
      },
      error: (err) => {
        console.error('[EST-PERFIL] Error:', err);
        alert(err.error?.error || 'Código incorrecto o expirado');
      }
    });
  }

  viewActiveSessions(): void {
    console.log('Ver detalles de sesiones activas');
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