import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface NavItem {
  icon: string;
  label: string;
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-perfil.html',
  styleUrls: ['./admin-perfil.css']
})
export class AdminPerfilComponent implements OnInit {
  userRole: 'administrador' | 'estudiante' | 'profesor' = 'administrador';
  userName: string = 'Carlos Rodríguez';
  notificationCount: number = 5;
  currentRoute: string = '/perfil';

  // Tabs
  activeTab: 'contacto' | 'seguridad' = 'contacto';

  // User profile data
  userProfile = {
    fullName: 'Carlos Rodríguez',
    email: 'admin@gmail.com',
    alternativeEmail: 'email.alternativo@ejemplo.com',
    phone: '555-1234-5678',
    department: 'Administración Académica',
    position: 'Coordinador de Documentos'
  };

  // Edit mode
  isEditingContact: boolean = false;
  originalProfile: any = null;

  // Security data
  lastPasswordUpdate: string = 'hace 30 días';
  twoFactorEnabled: boolean = false;
  activeSessions: number = 1;

  // Change password modal
  showChangePasswordModal: boolean = false;
  showVerificationModal: boolean = false;
  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
  verificationCode: string = '';
  generatedCode: string = ''; // En producción vendría del backend

  navigationItems: NavItem[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadNavigation();
    this.currentRoute = this.router.url;
  }

  loadNavigation(): void {
    const navigationConfig = {
      administrador: [
        { icon: 'home', label: 'Inicio', route: '/admin-dashboard', badge: 0 },
        { icon: 'clock', label: 'Pendientes', route: '/admin-pendientes', badge: 23 },
        { icon: 'folder', label: 'Gestión', route: '/admin-gestion', badge: 0 },
        { icon: 'user', label: 'Perfil', route: '/admin-perfil', badge: 0 }
      ],
      estudiante: [
        { icon: 'home', label: 'Inicio', route: '/est-dashboard', badge: 0 },
        { icon: 'upload', label: 'Mis Documentos', route: '/est-documentos', badge: 0 },
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
    console.log('Guardar cambios de contacto:', this.userProfile);
    // Aquí implementarías la lógica para guardar en el backend
    this.isEditingContact = false;
    this.originalProfile = null;
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
    // Validaciones básicas
    if (!this.passwordForm.currentPassword || !this.passwordForm.newPassword || !this.passwordForm.confirmPassword) {
      alert('Por favor completa todos los campos');
      return;
    }

    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    if (this.passwordForm.newPassword.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    // Generar código de verificación (en producción vendría del backend)
    this.generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('Código de verificación generado:', this.generatedCode);
    console.log('Enviando código al email:', this.userProfile.email);

    // Cerrar modal de contraseña y abrir modal de verificación
    this.showChangePasswordModal = false;
    this.showVerificationModal = true;
  }

  closeVerificationModal(): void {
    this.showVerificationModal = false;
    this.verificationCode = '';
    this.generatedCode = '';
  }

  verifyAndChangePassword(): void {
    if (!this.verificationCode) {
      alert('Por favor introduce el código de verificación');
      return;
    }

    // Verificar código (en producción se verificaría con el backend)
    if (this.verificationCode === this.generatedCode) {
      console.log('Código verificado correctamente');
      console.log('Cambiando contraseña...');
      
      // Aquí implementarías la lógica real para cambiar la contraseña
      alert('¡Contraseña cambiada exitosamente!');
      
      this.closeVerificationModal();
      this.lastPasswordUpdate = 'hace unos segundos';
    } else {
      alert('Código de verificación incorrecto');
    }
  }

  configureTwoFactor(): void {
    console.log('Configurar autenticación de dos factores');
    // Aquí implementarías la lógica para configurar 2FA
  }

  viewActiveSessions(): void {
    console.log('Ver detalles de sesiones activas');
    // Aquí implementarías la lógica para mostrar sesiones activas
  }

  navigateTo(route: string): void {
    this.currentRoute = route;
    this.router.navigate([route]);
  }

  getIcon(iconName: string): string {
    const icons: { [key: string]: string } = {
      'home': 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
      'clock': 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 6v6l4 2',
      'users': 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
      'folder': 'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z',
      'user': 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
      'upload': 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12',
      'file-text': 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8'
    };
    return icons[iconName] || icons['file-text'];
  }

  logout(): void {
    console.log('Cerrando sesión...');
    this.router.navigate(['']);
  }
}
