import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface MyUserProfile {
  userRole: 'Profesor';
  userName: string;
  userAccountNumber: string;
  userMateria: string;
  Department: string; 
  notificationCount: number;
  officeHours: string;
  avatar: string;
  notifications: number;
  email: string;
  alternativeEmail?: string;
  phone?: string;
}

interface NavItem {
  icon: string;
  label: string;
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-prof-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './prof-perfil.html',
  styleUrls: ['./prof-perfil.css']
})
export class ProfPerfilComponent implements OnInit {
  activeTab: 'contact' | 'security' = 'contact';
  isEditingContact: boolean = false;
  showChangePasswordModal: boolean = false;
  currentRoute: string = '/prof-perfil';

  userProfile: MyUserProfile = {
    userRole: 'Profesor',
    userName: 'Jose Orozco',
    userAccountNumber: '2024001234',
    userMateria: 'Angular',
    Department: 'Ingeniería de Sistemas', 
    notificationCount: 3,
    officeHours: 'Lunes a Viernes, 10:00 AM - 2:00 PM',
    avatar: 'AL',
    notifications: 4,
    email: 'jose.orozco@ejemplo.com',
    alternativeEmail: '',
    phone: '66 1234 5678'
  };

  // CORRECCIÓN: Se usa la interfaz local renombrada
  editedprofile: MyUserProfile = { ...this.userProfile };

  // Configuración de seguridad
  securityConfig = {
    passwordLastUpdated: 'hace 30 días',
    twoFactorEnabled: false,
    activeSessions: 1
  };

  // Preferencias de privacidad
  privacySettings = {
    showEmailToStudents: true,
    showPhoneToStudents: false,
    showOfficeHours: true
  };

  // Cambio de contraseña
  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadNavigation();
  }

  // Tabs
  setActiveTab(tab: 'contact' | 'security'): void {
    this.activeTab = tab;
  }

  // Edición de contacto
  startEditingContact(): void {
    this.isEditingContact = true;
    this.editedprofile = { ...this.userProfile };
  }

  cancelEditingContact(): void {
    this.isEditingContact = false;
    this.editedprofile = { ...this.userProfile };
  }

  saveContactChanges(): void {
    if (!this.validateContactData()) {
      return;
    }
    this.userProfile = { ...this.editedprofile };
    this.isEditingContact = false;
    console.log('Guardando cambios:', this.userProfile);
  }

  validateContactData(): boolean {
    if (!this.editedprofile.userName.trim()) {
      console.error('El nombre es requerido');
      return false;
    }

    if (!this.editedprofile.email.trim() || !this.isValidEmail(this.editedprofile.email)) {
      console.error('Email principal inválido');
      return false;
    }

    if (this.editedprofile.alternativeEmail && !this.isValidEmail(this.editedprofile.alternativeEmail)) {
      console.error('Email alternativo inválido');
      return false;
    }

    return true;
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Cambio de contraseña
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
    if (!this.passwordForm.currentPassword) {
      console.error('Ingresa tu contraseña actual');
      return;
    }
    if (this.passwordForm.newPassword.length < 8) {
      console.error('La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }
    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      console.error('Las contraseñas no coinciden');
      return;
    }

    console.log('Cambiando contraseña');
    
    this.closeChangePasswordModal();
    console.log('Contraseña actualizada correctamente');
    this.securityConfig.passwordLastUpdated = 'hoy';
  }

  // Autenticación de dos factores
  configure2FA(): void {
    console.log('Configurar autenticación de dos factores');
  }

  // Sesiones activas
  viewActiveSessions(): void {
    console.log('Ver sesiones activas');
    console.log('Sesión activa en este dispositivo');
  }

  // Preferencias de privacidad
  togglePrivacySetting(setting: keyof typeof this.privacySettings): void {
    this.privacySettings[setting] = !this.privacySettings[setting];
    console.log('Configuración de privacidad actualizada:', this.privacySettings);
  }

  // Navegación
  navigationItems: NavItem[] = [];

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
