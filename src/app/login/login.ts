import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface RegistroForm {
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  curp: string;
  fecha_nacimiento: string;
  telefono: string;
  grado: string;
  tipo_estudiante: 'NUEVO_INGRESO' | 'REINGRESO';
  password: string;
  nombresTutor: string;
  correoTutor: string;
  telefonoTutor: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule], 
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  private apiUrl = 'http://localhost:5000/api';
  activeTab: 'login' | 'register' | 'forgot' = 'login';
  
  recuperarStep: number = 1;
  
  loginNumUsuario: string = '';
  loginPassword: string = '';
  
  recoveryEmail: string = '';
  recoveryCode: string = '';
  recoveryNumUsuario: string = '';
  recoveryNewPassword: string = '';
  recoveryConfirmPassword: string = '';
  showRecoveryError: boolean = false;
  recoveryErrorMessage: string = '';

  registroForm: RegistroForm = {
    nombres: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    curp: '',
    fecha_nacimiento: '',
    telefono: '',
    grado: '',
    tipo_estudiante: 'NUEVO_INGRESO',
    password: '',
    nombresTutor: '',
    correoTutor: '',
    telefonoTutor: ''
  };

  grados = [
    { value: '1', label: '1° Semestre' },
    { value: '2', label: '2° Semestre' },
    { value: '3', label: '3° Semestre' }
  ];

  showRegistroError: boolean = false;
  registroErrorMessage: string = '';
  showSuccessMessage: boolean = false;
  successMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private http: HttpClient
  ) {
    console.log('[LOGIN] Componente inicializado');
  }

  setActiveTab(tab: 'login' | 'register' | 'forgot'): void {
    this.activeTab = tab;
    this.showRecoveryError = false;
    this.showRegistroError = false;
    this.showSuccessMessage = false;
    this.recuperarStep = 1;
  }

  onLogin(): void {
    if (!this.loginNumUsuario || !this.loginPassword) {
      this.showError('Por favor completa todos los campos');
      return;
    }

    localStorage.clear();

    this.isLoading = true;
    this.clearMessages();

    console.log('[LOGIN] Intentando login...');

    this.http.post(`${this.apiUrl}/auth/login`, {
      num_usuario: this.loginNumUsuario,
      password: this.loginPassword
    }).subscribe({
      next: (response: any) => {
        console.log('[LOGIN] Login exitoso:', response);
        
        if (response.token) {
          localStorage.setItem('token', response.token);
          console.log('[LOGIN] Token guardado');
        }
        
        if (response.user) {
          localStorage.setItem('userData', JSON.stringify(response.user));
          console.log('[LOGIN] User data guardado');
        }
        
        this.showSuccess('¡Inicio de sesión exitoso!');
        
        setTimeout(() => {
          switch (response.user.rol) {
            case 'ESTUDIANTE':
              this.router.navigate(['/est-dashboard']);
              break;
            case 'PROFESOR':
              this.router.navigate(['/prof-dashboard']);
              break;
            case 'ADMINISTRADOR':
              this.router.navigate(['/admin-dashboard']);
              break;
            default:
              this.router.navigate(['/admin-dashboard']);
          }
        }, 1000);
      },
      error: (error) => {
        console.error('[LOGIN] Error:', error);
        this.showError(error.error?.error || 'Error al iniciar sesión');
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  onRegister(): void {
    this.clearMessages();

    if (!this.registroForm.nombres || !this.registroForm.apellidoPaterno || 
        !this.registroForm.apellidoMaterno || !this.registroForm.curp ||
        !this.registroForm.fecha_nacimiento || !this.registroForm.grado ||
        !this.registroForm.password) {
      this.showError('Por favor completa todos los campos del estudiante');
      return;
    }

    if (this.registroForm.curp.length !== 18) {
      this.showError('El CURP debe tener 18 caracteres');
      return;
    }

    if (this.registroForm.password.length < 6) {
      this.showError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (!this.registroForm.nombresTutor || !this.registroForm.correoTutor || 
        !this.registroForm.telefonoTutor) {
      this.showError('Por favor completa los datos del tutor');
      return;
    }

    if (!this.isValidEmail(this.registroForm.correoTutor)) {
      this.showError('Email del tutor inválido');
      return;
    }

    this.isLoading = true;

    const registroData = {
      nombres: this.registroForm.nombres,
      apellido_paterno: this.registroForm.apellidoPaterno,
      apellido_materno: this.registroForm.apellidoMaterno,
      curp: this.registroForm.curp.toUpperCase(),
      fecha_nacimiento: this.registroForm.fecha_nacimiento,
      telefono: this.registroForm.telefono || '',
      telefono_tutor: this.registroForm.telefonoTutor,
      nombre_tutor: this.registroForm.nombresTutor,
      correo_tutor: this.registroForm.correoTutor,
      grado: parseInt(this.registroForm.grado),
      tipo_estudiante: this.registroForm.tipo_estudiante,
      password: this.registroForm.password
    };

    this.http.post(`${this.apiUrl}/auth/registro-estudiante`, registroData).subscribe({
      next: (response: any) => {
        console.log('[LOGIN] Registro exitoso:', response);
        this.isLoading = false;
        
        this.showSuccess(`¡Registro exitoso! Tu número de usuario es: ${response.num_usuario}`);
        this.resetRegistroForm();
        
        setTimeout(() => {
          this.loginNumUsuario = response.num_usuario;
          this.setActiveTab('login');
        }, 3000);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('[LOGIN] Error en registro:', error);
        this.showError(error.error?.error || 'Error al registrar estudiante');
      }
    });
  }

  resetRegistroForm(): void {
    this.registroForm = {
      nombres: '',
      apellidoPaterno: '',
      apellidoMaterno: '',
      curp: '',
      fecha_nacimiento: '',
      telefono: '',
      grado: '',
      tipo_estudiante: 'NUEVO_INGRESO',
      password: '',
      nombresTutor: '',
      correoTutor: '',
      telefonoTutor: ''
    };
  }

  onRecoverPassword(): void {
    this.clearMessages();

    if (!this.recoveryEmail) {
      this.showRecoveryError = true;
      this.recoveryErrorMessage = 'Por favor ingresa tu correo o teléfono';
      return;
    }

    this.isLoading = true;

    this.http.post(`${this.apiUrl}/auth/solicitar-recuperacion`, {
      correo_o_telefono: this.recoveryEmail
    }).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.recoveryNumUsuario = response.num_usuario;
        this.showSuccess(`Código enviado. Tu número de usuario es: ${response.num_usuario}`);
        
        if (response.codigo) {
          this.showSuccess(`Código: ${response.codigo} (Guárdalo)`);
        }
        
        setTimeout(() => {
          this.recuperarStep = 2;
          this.clearMessages();
        }, 3000);
      },
      error: (error) => {
        this.isLoading = false;
        this.showRecoveryError = true;
        this.recoveryErrorMessage = error.error?.error || 'Error al enviar el código';
      }
    });
  }

  onVerifyCode(): void {
    this.clearMessages();

    if (!this.recoveryCode || this.recoveryCode.length !== 6) {
      this.showRecoveryError = true;
      this.recoveryErrorMessage = 'Por favor ingresa el código de 6 dígitos';
      return;
    }

    this.isLoading = true;

    this.http.post(`${this.apiUrl}/auth/verificar-codigo`, {
      num_usuario: this.recoveryNumUsuario,
      codigo: this.recoveryCode
    }).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.showSuccess('¡Código verificado correctamente!');
        
        setTimeout(() => {
          this.recuperarStep = 3;
          this.clearMessages();
        }, 1500);
      },
      error: (error) => {
        this.isLoading = false;
        this.showRecoveryError = true;
        this.recoveryErrorMessage = error.error?.error || 'Código inválido o expirado';
      }
    });
  }

  onResetPassword(): void {
    this.clearMessages();

    if (!this.recoveryNewPassword || this.recoveryNewPassword.length < 6) {
      this.showRecoveryError = true;
      this.recoveryErrorMessage = 'La contraseña debe tener al menos 6 caracteres';
      return;
    }

    if (this.recoveryNewPassword !== this.recoveryConfirmPassword) {
      this.showRecoveryError = true;
      this.recoveryErrorMessage = 'Las contraseñas no coinciden';
      return;
    }

    this.isLoading = true;

    this.http.post(`${this.apiUrl}/auth/restablecer-password`, {
      num_usuario: this.recoveryNumUsuario,
      new_password: this.recoveryNewPassword
    }).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.showSuccess('¡Contraseña actualizada exitosamente!');
        
        setTimeout(() => {
          this.recoveryEmail = '';
          this.recoveryCode = '';
          this.recoveryNewPassword = '';
          this.recoveryConfirmPassword = '';
          this.recuperarStep = 1;
          this.loginNumUsuario = this.recoveryNumUsuario;
          this.setActiveTab('login');
        }, 2000);
      },
      error: (error) => {
        this.isLoading = false;
        this.showRecoveryError = true;
        this.recoveryErrorMessage = error.error?.error || 'Error al actualizar la contraseña';
      }
    });
  }

  onQuickAccess(role: string): void {
    this.clearMessages();
    
    const credentials: any = {
      'Estudiante': { num_usuario: '00000005', password: 'contra123' },
      'Administrador': { num_usuario: '00000001', password: 'contra123' },
      'Profesor': { num_usuario: '00000003', password: 'contra123' }
    };

    if (credentials[role]) {
      this.loginNumUsuario = credentials[role].num_usuario;
      this.loginPassword = credentials[role].password;
      this.onLogin();
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private showError(message: string): void {
    if (this.activeTab === 'forgot') {
      this.showRecoveryError = true;
      this.recoveryErrorMessage = message;
    } else {
      this.showRegistroError = true;
      this.registroErrorMessage = message;
    }
  }

  private showSuccess(message: string): void {
    this.showSuccessMessage = true;
    this.successMessage = message;
  }

  private clearMessages(): void {
    this.showRecoveryError = false;
    this.recoveryErrorMessage = '';
    this.showRegistroError = false;
    this.registroErrorMessage = '';
    this.showSuccessMessage = false;
    this.successMessage = '';
  }
}