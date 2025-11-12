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
  templateUrl: './est-perfil.html',
  styleUrls: ['./est-perfil.css']
})
export class EstPerfilComponent implements OnInit {
  userRole: 'estudiante' = 'estudiante';
  userName: string = 'Maria Garcia';
  userAccountNumber: string = '2024001234';
  userCareer: string = 'Ingeniería de Sistemas';
  userGradeGroup: string = '2°A';
  notificationCount: number = 3;
  currentRoute: string = '/est-perfil';

  userProfile = {
    fullName: 'Carlos Rodríguez',
    email: 'estudiante@gmail.com',
    alternativeEmail: 'email.alternativo@ejemplo.com',
    phone: '555-1234-5678',
    userCareer: 'Ingeniería de Sistemas',
    userGradeGroup: '2°A',
    position: 'Coordinador de Documentos'
  };

  // apartados
  activeTab: 'contacto' | 'seguridad' = 'contacto';  

  isEditingContact: boolean = false;
  originalProfile: any = null;

  // apartado de seguridad
  lastPasswordUpdate: string = 'hace 30 días';
  twoFactorEnabled: boolean = false;
  activeSessions: number = 1;

  // modal de cambio de contraseña
  showChangePasswordModal: boolean = false;
  showVerificationModal: boolean = false;
  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
  verificationCode: string = '';
  generatedCode: string = '';

  navigationItems: NavItem[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadNavigation();
    this.currentRoute = this.router.url;
  }

  loadNavigation(): void {
    const navigationItems = {
      estudiante: [
        { icon: 'home', label: 'Inicio', route: '/est-dashboard', badge: 0 },
        { icon: 'file-text', label: 'Documentos', route: '/est-documentos', badge: 0 },
        { icon: 'material', label: 'Materiales', route: '/est-materiales', badge: 0 },
        { icon: 'users', label: 'Profesores', route: '/est-profesores', badge: 0 },
        { icon: 'user', label: 'Perfil', route: '/est-perfil', badge: 0 }
      ]
    };

    this.navigationItems = navigationItems[this.userRole];
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

    // Generar código de verificación (backend)
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

    // Verificar código (al menos eso haria el backend)
    if (this.verificationCode === this.generatedCode) {
      console.log('Código verificado correctamente');
      console.log('Cambiando contraseña...');
      
      alert('¡Contraseña cambiada exitosamente!');
      
      this.closeVerificationModal();
      this.lastPasswordUpdate = 'hace unos segundos';
    } else {
      alert('Código de verificación incorrecto');
    }
  }

  configureTwoFactor(): void {
    console.log('Configurar autenticación de dos factores');
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
    this.router.navigate(['']);
  }
}
