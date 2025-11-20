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

  // User profile data
  userProfile: any = {
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

  // Edit mode
  isEditingContact: boolean = false;
  originalProfile: any = null;

  // Security data
  lastPasswordUpdate: string = 'No registrado';
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
  generatedCode: string = ''; // vendría del backend

  navigationItems: NavItem[] = [];

  constructor(
    private authService: AuthService,
    private router: Router) {}

  ngOnInit(): void {
    this.loadUserProfile();
    this.loadNavigation();
    this.currentRoute = this.router.url;
  }

  loadUserProfile(): void {
    this.authService.getPerfil().subscribe({
      next: (data) => {
        // data contiene: id, rol, correo, detalles, etc
        this.userRole = data.rol.toLowerCase();
        this.loadNavigation();

        const detalles = data.detalles || {};
        
        // Construir nombre completo
        const nombreCompleto = `${detalles.nombres} ${detalles.apellido_paterno} ${detalles.apellido_materno || ''}`.trim();
        this.userName = nombreCompleto;

        // Mapear datos del backend al objeto del frontend
        this.userProfile = {
          fullName: nombreCompleto,
          nombres: detalles.nombres,
          apellido_paterno: detalles.apellido_paterno,
          apellido_materno: detalles.apellido_materno || '',
          email: data.correo,
          alternativeEmail: detalles.correo_alternativo || '',
          phone: detalles.telefono || '', 
          department: detalles.departamento || '',
          position: detalles.puesto || ''
        };
      },
      error: (err) => {
        console.error('Error cargando perfil', err);
        if (err.status === 401) this.router.navigate(['']);
      }
    });
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

    this.navigationItems = navigationConfig['administrador'];
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
    // 1. Separar el nombre completo en partes
    const nombreCompleto = this.userProfile.fullName.trim();
    const partes = nombreCompleto.split(' ');
    
    let nuevosNombres = '';
    let nuevoPaterno = '';
    let nuevoMaterno = '';

    // Lógica simple para separar Nombres y Apellidos
    if (partes.length === 1) {
      nuevosNombres = partes[0];
    } else if (partes.length === 2) {
      nuevosNombres = partes[0];
      nuevoPaterno = partes[1];
    } else {
      // Si hay 3 o más palabras, asumimos que las dos últimas son apellidos
      // Ejemplo: "Juan Carlos Perez Lopez"
      nuevoMaterno = partes.pop() || ''; // Lopez
      nuevoPaterno = partes.pop() || ''; // Perez
      nuevosNombres = partes.join(' ');  // Juan Carlos
    }
    
    // 2. Actualizar el objeto local ANTES de enviar
    // Esto es crucial para que la UI se refresque y para futuras ediciones
    this.userProfile.nombres = nuevosNombres;
    this.userProfile.apellido_paterno = nuevoPaterno;
    this.userProfile.apellido_materno = nuevoMaterno;

    const payload = {
      email: this.userProfile.email,
      
      // USAR LAS VARIABLES YA ACTUALIZADAS
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
        // Actualizar el nombre en el encabezado inmediatamente
        this.userName = this.userProfile.fullName;
        
        // Forzar actualización del localStorage para que otras ventanas (header global) lo vean
        const currentUser = JSON.parse(localStorage.getItem('userData') || '{}');
        if (currentUser && currentUser.detalles) {
            currentUser.detalles.nombres = this.userProfile.nombres;
            currentUser.detalles.apellido_paterno = this.userProfile.apellido_paterno;
            currentUser.detalles.apellido_materno = this.userProfile.apellido_materno;
            localStorage.setItem('userData', JSON.stringify(currentUser));
        }

        alert('Perfil actualizado exitosamente');
        this.isEditingContact = false;
        this.originalProfile = null;
        this.loadUserProfile();
      },
      error: (err) => {
        console.error('Error al actualizar', err);
        alert('Error al guardar los cambios');
      }
    });
  }

  openChangePasswordModal(): void { this.showChangePasswordModal = true; }
  closeChangePasswordModal(): void { this.showChangePasswordModal = false; }

  requestPasswordChange(): void {
  // Validaciones básicas del formulario
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
    
    // 2. Solicitar código al Backend
  // Mostramos un indicador de carga o mensaje
  const btn = document.querySelector('.btn-modal-primary') as HTMLButtonElement;
  if(btn) btn.innerText = 'Enviando código...';
  if(btn) btn.disabled = true;

  this.authService.solicitarCodigoCambio().subscribe({
    next: (res) => {
      console.log('Código enviado:', res);
      
      // Ocultar modal de contraseña y mostrar el de verificación
      this.showChangePasswordModal = false;
      this.showVerificationModal = true;
      
      // Restaurar botón por si acaso
      if(btn) btn.innerText = 'Cambiar Contraseña';
      if(btn) btn.disabled = false;
    },
    error: (err) => {
      console.error(err);
      alert('Error al enviar el código: ' + (err.error?.error || 'Error de servidor'));
      if(btn) btn.innerText = 'Cambiar Contraseña';
      if(btn) btn.disabled = false;
    }
  });
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

  // Llamar al endpoint de confirmación
  this.authService.confirmarCambioPassword(
    this.verificationCode,
    this.passwordForm.currentPassword,
    this.passwordForm.newPassword
  ).subscribe({
    next: (res) => {
      alert('¡Contraseña cambiada exitosamente!');
      this.closeVerificationModal();
      this.closeChangePasswordModal(); // Asegurar que ambos se cierren
      
      // Limpiar formulario
      this.passwordForm = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      };
      this.verificationCode = '';
      this.lastPasswordUpdate = 'hace unos segundos';
    },
    error: (err) => {
      console.error(err);
      alert(err.error?.error || 'Código incorrecto o expirado');
    }
  });
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
    localStorage.clear();
    this.router.navigate(['']);
  }
}
