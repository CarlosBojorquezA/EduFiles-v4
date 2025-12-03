import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

interface RegistroForm {
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  email: string;
  telefono: string;
  semestre: string;
  tipo_estudiante: 'NUEVO_INGRESO' | 'REINGRESO';
  password: string;
  confirm_password: string;
  nombre_tutor: string;
  email_tutor: string;
  telefono_tutor: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  private apiUrl = environment.apiUrl;

  // Estado UI
  activeTab: 'login' | 'register' | 'forgot' = 'login';
  isLoading: boolean = false;
  recuperarStep: number = 1; // 1: solicitar código, 2: verificar código, 3: nueva contraseña

  // Mensajes
  showSuccessMessage: boolean = false;
  successMessage: string = '';
  showErrorMessage: boolean = false;
  errorMessage: string = '';

  // Login Data
  loginNumUsuario: string = '';
  loginPassword: string = '';

  // Registro Data
  registroForm: RegistroForm = this.getInitialRegistroForm();
  semestres = [
    { value: '1', label: '1° Semestre' },
    { value: '2', label: '2° Semestre' },
    { value: '3', label: '3° Semestre' },
    { value: '4', label: '4° Semestre' },
    { value: '5', label: '5° Semestre' },
    { value: '6', label: '6° Semestre' },
    { value: '7', label: '7° Semestre' },
    { value: '8', label: '8° Semestre' }
  ];

  // Recuperación Data
  recoveryNumUsuario: string = '';
  recoveryEmail: string = '';
  recoveryCode: string = '';
  recoveryNewPassword: string = '';
  recoveryConfirmPassword: string = '';

  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

  // ==================== TABS & UI ====================

  setActiveTab(tab: 'login' | 'register' | 'forgot'): void {
    this.activeTab = tab;
    this.clearMessages();
    this.recuperarStep = 1;
    
    // Limpiar campos al cambiar de tab
    if (tab === 'forgot') {
      this.recoveryNumUsuario = '';
      this.recoveryEmail = '';
      this.recoveryCode = '';
      this.recoveryNewPassword = '';
      this.recoveryConfirmPassword = '';
    }
  }

  private clearMessages(): void {
    this.showSuccessMessage = false;
    this.showErrorMessage = false;
    this.successMessage = '';
    this.errorMessage = '';
  }

  private showSuccess(msg: string): void {
    this.clearMessages();
    this.showSuccessMessage = true;
    this.successMessage = msg;
    setTimeout(() => this.showSuccessMessage = false, 5000);
  }

  private showError(msg: string): void {
    this.clearMessages();
    this.showErrorMessage = true;
    this.errorMessage = msg;
    setTimeout(() => this.showErrorMessage = false, 5000);
  }

  // ==================== LOGIN ====================

  onLogin(): void {
    if (!this.loginNumUsuario || !this.loginPassword) {
      return this.showError('Por favor completa todos los campos');
    }

    this.isLoading = true;
    this.clearMessages();
    localStorage.clear();

    this.http.post(`${this.apiUrl}/auth/login`, {
      num_usuario: this.loginNumUsuario,
      password: this.loginPassword
    }).subscribe({
      next: (response: any) => {
        if (response.token) localStorage.setItem('token', response.token);
        if (response.user) localStorage.setItem('userData', JSON.stringify(response.user));

        this.showSuccess('¡Bienvenido!');
        
        setTimeout(() => {
          const role = response.user?.rol || '';
          switch (role) {
            case 'ESTUDIANTE': this.router.navigate(['/est-dashboard']); break;
            case 'PROFESOR': this.router.navigate(['/prof-dashboard']); break;
            case 'ADMINISTRADOR': this.router.navigate(['/admin-dashboard']); break;
            default: this.router.navigate(['/']); 
          }
          this.isLoading = false;
        }, 800);
      },
      error: (err) => {
        console.error('Login error:', err);
        this.showError(err.error?.error || 'Credenciales incorrectas');
        this.isLoading = false;
      }
    });
  }

  // ==================== REGISTRO ====================

  onRegister(): void {
    this.clearMessages();
    
    if (!this.validateRegistro()) return;

    this.isLoading = true;

    const payload = {
      nombres: this.registroForm.nombres,
      apellido_paterno: this.registroForm.apellido_paterno,
      apellido_materno: this.registroForm.apellido_materno,
      email: this.registroForm.email,
      telefono: this.registroForm.telefono,
      semestre: this.registroForm.semestre,
      tipo_estudiante: this.registroForm.tipo_estudiante,
      password: this.registroForm.password,
      nombre_tutor: this.registroForm.nombre_tutor,
      email_tutor: this.registroForm.email_tutor,
      telefono_tutor: this.registroForm.telefono_tutor
    };

    this.http.post(`${this.apiUrl}/auth/registro-estudiante`, payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;

        // Guardar token y datos de usuario para auto-login
        if (res.token) {
          localStorage.setItem('token', res.token);
        }
        if (res.user) {
          localStorage.setItem('userData', JSON.stringify(res.user));
        }

        this.showSuccess(`¡Registro exitoso! Tu número de usuario es: ${res.num_usuario}`);
        this.registroForm = this.getInitialRegistroForm();
        

        // Redirigir automáticamente al dashboard del estudiante
        setTimeout(() => {
          this.router.navigate(['/est-dashboard']);
        }, 1500);
      },
      error: (err) => {
        this.isLoading = false;
        this.showError(err.error?.error || 'Error al registrar. Verifica los datos.');
      }
    });
  }

  private validateRegistro(): boolean {
    const f = this.registroForm;
    
    // Validar campos obligatorios
    if (!f.nombres || !f.apellido_paterno || !f.apellido_materno) {
      this.showError('Completa los campos de nombre');
      return false;
    }

    if (!f.email || !this.isValidEmail(f.email)) {
      this.showError('Email inválido');
      return false;
    }

    if (!f.telefono || f.telefono.length < 10) {
      this.showError('Teléfono inválido (10 dígitos)');
      return false;
    }

    if (!f.semestre) {
      this.showError('Selecciona un semestre');
      return false;
    }

    if (!f.password || f.password.length < 6) {
      this.showError('Contraseña muy corta (mínimo 6 caracteres)');
      return false;
    }

    if (f.password !== f.confirm_password) {
      this.showError('Las contraseñas no coinciden');
      return false;
    }

    // Validar datos del tutor
    if (!f.nombre_tutor || !f.email_tutor || !f.telefono_tutor) {
      this.showError('Completa los datos del tutor');
      return false;
    }

    if (!this.isValidEmail(f.email_tutor)) {
      this.showError('Email del tutor inválido');
      return false;
    }

    if (f.telefono_tutor.length < 10) {
      this.showError('Teléfono del tutor inválido');
      return false;
    }

    return true;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private getInitialRegistroForm(): RegistroForm {
    return {
      nombres: '',
      apellido_paterno: '',
      apellido_materno: '',
      email: '',
      telefono: '',
      semestre: '',
      tipo_estudiante: 'NUEVO_INGRESO',
      password: '',
      confirm_password: '',
      nombre_tutor: '',
      email_tutor: '',
      telefono_tutor: ''
    };
  }

  // ==================== RECUPERACIÓN ====================

  onRecoverPassword(): void {
    if (!this.recoveryNumUsuario || !this.recoveryEmail) {
      return this.showError('Ingresa tu número de usuario y correo electrónico');
    }

    if (!this.isValidEmail(this.recoveryEmail)) {
      return this.showError('Correo electrónico inválido');
    }
    
    this.isLoading = true;
    this.clearMessages();

    this.http.post(`${this.apiUrl}/auth/solicitar-recuperacion`, {
      num_usuario: this.recoveryNumUsuario,
      email: this.recoveryEmail
    }).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.showSuccess('Código de verificación enviado a tu correo');
        this.recuperarStep = 2;
      },
      error: (err) => {
        this.isLoading = false;
        this.showError(err.error?.error || 'Usuario no encontrado o correo incorrecto');
      }
    });
  }

  onVerifyCode(): void {
    if (!this.recoveryCode || this.recoveryCode.length !== 6) {
      return this.showError('Ingresa el código de 6 dígitos');
    }
    
    this.isLoading = true;
    this.clearMessages();

    this.http.post(`${this.apiUrl}/auth/verificar-codigo-recuperacion`, {
      num_usuario: this.recoveryNumUsuario,
      codigo: this.recoveryCode
    }).subscribe({
      next: () => {
        this.isLoading = false;
        this.showSuccess('Código verificado correctamente');
        this.recuperarStep = 3;
      },
      error: (err) => {
        this.isLoading = false;
        this.showError(err.error?.error || 'Código incorrecto o expirado');
      }
    });
  }

  onResetPassword(): void {
    if (!this.recoveryNewPassword || this.recoveryNewPassword.length < 6) {
      return this.showError('La contraseña debe tener al menos 6 caracteres');
    }

    if (this.recoveryNewPassword !== this.recoveryConfirmPassword) {
      return this.showError('Las contraseñas no coinciden');
    }

    this.isLoading = true;
    this.clearMessages();

    this.http.post(`${this.apiUrl}/auth/restablecer-password`, {
      num_usuario: this.recoveryNumUsuario,
      new_password: this.recoveryNewPassword
    }).subscribe({
      next: () => {
        this.isLoading = false;
        this.showSuccess('Contraseña restablecida exitosamente');
        
        setTimeout(() => {
          this.loginNumUsuario = this.recoveryNumUsuario;
          this.loginPassword = this.recoveryNewPassword;
          this.setActiveTab('login');
        }, 2000);
      },
      error: (err) => {
        this.isLoading = false;
        this.showError(err.error?.error || 'Error al restablecer contraseña');
      }
    });
  }

  // ==================== ACCESO RÁPIDO ====================

  onQuickAccess(role: string): void {
    const credentials: any = {
      'Estudiante': { num_usuario: '00000005', password: 'contra1326' },
      'Administrador': { num_usuario: '00000001', password: 'contra1326' },
      'Profesor': { num_usuario: '00000003', password: 'contra1326' }
    };

    if (credentials[role]) {
      this.loginNumUsuario = credentials[role].num_usuario;
      this.loginPassword = credentials[role].password;
      this.onLogin();
    }
  }
}