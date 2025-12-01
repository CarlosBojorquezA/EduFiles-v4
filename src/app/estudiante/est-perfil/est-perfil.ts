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
  fullName: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  email: string;
  phone: string;
  userCareer: string;
  userGradeGroup: string;
  tutorFullName: string;
  tutorEmail: string;
  tutorPhone: string;
}

// --- Constantes ---
const ICONS_MAP: { [key: string]: string } = {
  'home': 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  'file-text': 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8',
  'material': 'M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25',
  'users': 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  'user': 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z'
};

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
  userProfile: UserProfile = {
    fullName: '',
    nombres: '',
    apellido_paterno: '',
    apellido_materno: '',
    email: '',
    phone: '',
    userCareer: '',
    userGradeGroup: '',
    tutorFullName: '',
    tutorEmail: '',
    tutorPhone: ''
  };

  // Edit mode
  isEditingContact: boolean = false;
  isEditingTutor: boolean = false;
  originalProfile: UserProfile | null = null;
  originalTutor: UserProfile | null = null;

  // Security data
  lastPasswordUpdate: string = 'No registrado';
  activeSessions: number = 1;

  // Modals
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
        this.userRole = (data.rol || 'estudiante').toLowerCase() as 'estudiante';
        const detalles = data.detalles || {};
        
        const nombreCompleto = `${detalles.nombres} ${detalles.apellido_paterno} ${detalles.apellido_materno || ''}`.trim();
        
        this.userName = nombreCompleto;
        this.userAccountNumber = data.num_usuario || '';
        
        // Carrera y Grupo
        this.userCareer = detalles.nivel_educativo || 'Estudiante';
        
        // Construcción del string de grupo 
        const partesAcad = [];
        if (detalles.semestre) partesAcad.push(`${detalles.semestre}° Semestre`);
        else if (detalles.grado) partesAcad.push(`${detalles.grado}° Grado`);
        
        if (detalles.grupo_id) partesAcad.push(`Grupo ${detalles.grupo_id}`);
        
        if (detalles.grupo_turno) {
          const turnoFormato = detalles.grupo_turno.charAt(0).toUpperCase() + detalles.grupo_turno.slice(1).toLowerCase();
          partesAcad.push(turnoFormato);
        }
        this.userGradeGroup = partesAcad.length > 0 ? partesAcad.join(' • ') : 'Sin asignación';

        this.userProfile = {
          fullName: nombreCompleto,
          nombres: detalles.nombres || '',
          apellido_paterno: detalles.apellido_paterno || '',
          apellido_materno: detalles.apellido_materno || '',
          email: data.correo || '',
          phone: detalles.telefono || '',
          userCareer: this.userCareer,
          userGradeGroup: this.userGradeGroup,
          tutorFullName: detalles.nombre_tutor || '', 
          tutorEmail: detalles.correo_tutor || '',
          tutorPhone: detalles.telefono_tutor || ''
        };
      },
      error: (err) => {
        console.error('[EST-PERFIL] Error:', err);
        if (err.status === 401) {
          this.logout();
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

  // --- Edición de Contacto ---
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
    // Si se edita el nombre completo, intentamos separarlo
    const partes = this.userProfile.fullName.trim().split(' ');
    let nuevosNombres = this.userProfile.nombres;
    let nuevoPaterno = this.userProfile.apellido_paterno;
    let nuevoMaterno = this.userProfile.apellido_materno;

    if (partes.length > 0) {
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
        this.userProfile.nombres = nuevosNombres;
        this.userProfile.apellido_paterno = nuevoPaterno;
        this.userProfile.apellido_materno = nuevoMaterno;
        this.userName = this.userProfile.fullName;

        this.updateLocalStorage(payload);
        
        alert('Perfil actualizado exitosamente');
        this.isEditingContact = false;
        this.originalProfile = null;
      },
      error: (err) => {
        console.error('[EST-PERFIL] Error update:', err);
        alert('Error al guardar los cambios');
      }
    });
  }

  // --- Edición de Tutor ---
  enableEditTutor(): void {
    this.originalTutor = { ...this.userProfile };
    this.isEditingTutor = true;
  }

  cancelEditTutor(): void {
    if (this.originalTutor) {
      this.userProfile.tutorFullName = this.originalTutor.tutorFullName;
      this.userProfile.tutorEmail = this.originalTutor.tutorEmail;
      this.userProfile.tutorPhone = this.originalTutor.tutorPhone;
    }
    this.isEditingTutor = false;
    this.originalTutor = null;
  }

  saveTutorChanges(): void {
    const payload = {
      nombre_tutor: this.userProfile.tutorFullName,
      correo_tutor: this.userProfile.tutorEmail,
      telefono_tutor: this.userProfile.tutorPhone
    };

    this.authService.actualizarPerfil(payload).subscribe({
      next: () => {
        this.updateLocalStorage(payload, true);
        alert('Datos del tutor actualizados');
        this.isEditingTutor = false;
        this.originalTutor = null;
      },
      error: (err) => {
        console.error('[EST-PERFIL] Error update tutor:', err);
        alert('Error al guardar datos del tutor');
      }
    });
  }

  private updateLocalStorage(data: any, isTutor: boolean = false): void {
    try {
      const currentUser = JSON.parse(localStorage.getItem('userData') || '{}');
      if (currentUser && currentUser.detalles) {
        if (isTutor) {
          // Actualizar campos de tutor en localStorage
          currentUser.detalles.nombre_tutor = data.nombre_tutor;
          currentUser.detalles.correo_tutor = data.correo_tutor;
          currentUser.detalles.telefono_tutor = data.telefono_tutor;
        } else {
          currentUser.detalles.nombres = data.nombres;
          currentUser.detalles.apellido_paterno = data.apellido_paterno;
          currentUser.detalles.apellido_materno = data.apellido_materno;
          currentUser.detalles.telefono = data.telefono;
          currentUser.correo = data.email;
        }
        localStorage.setItem('userData', JSON.stringify(currentUser));
      }
    } catch (e) {
      console.error('Error updating localStorage', e);
    }
  }

  // --- Contraseña ---
  openChangePasswordModal(): void {
    this.showChangePasswordModal = true;
    this.passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
  }

  closeChangePasswordModal(): void {
    this.showChangePasswordModal = false;
  }

  requestPasswordChange(): void {
    const { currentPassword, newPassword, confirmPassword } = this.passwordForm;

    if (!currentPassword || !newPassword || !confirmPassword) return alert('Completa todos los campos');
    if (newPassword !== confirmPassword) return alert('Las contraseñas no coinciden');
    if (newPassword.length < 6) return alert('La contraseña debe tener al menos 6 caracteres');

    const btn = document.querySelector('.btn-modal-primary') as HTMLButtonElement;
    if(btn) { btn.innerText = 'Enviando...'; btn.disabled = true; }

    this.authService.solicitarCodigoCambio().subscribe({
      next: () => {
        this.showChangePasswordModal = false;
        this.showVerificationModal = true;
        if(btn) { btn.innerText = 'Cambiar Contraseña'; btn.disabled = false; }
      },
      error: (err) => {
        alert('Error: ' + (err.error?.error || 'Error servidor'));
        if(btn) { btn.innerText = 'Cambiar Contraseña'; btn.disabled = false; }
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
        alert('¡Contraseña cambiada!');
        this.closeVerificationModal();
        this.passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
        this.verificationCode = '';
        this.lastPasswordUpdate = 'hace unos segundos';
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
    return ICONS_MAP[iconName] || ICONS_MAP['file-text'];
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['']);
  }
}