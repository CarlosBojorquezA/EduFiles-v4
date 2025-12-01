import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment'; // Asegúrate de tener esto

// --- Interfaces ---
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
  // Configuración
  private apiUrl = environment.apiUrl; // O 'http://localhost:5000/api'

  // Estado UI
  activeTab: 'login' | 'register' | 'forgot' = 'login';
  isLoading: boolean = false;
  recuperarStep: number = 1;

  // Mensajes
  showSuccessMessage: boolean = false;
  successMessage: string = '';
  showRecoveryError: boolean = false;
  recoveryErrorMessage: string = '';
  showRegistroError: boolean = false;
  registroErrorMessage: string = '';

  // Login Data
  loginNumUsuario: string = '';
  loginPassword: string = '';

  // Registro Data
  registroForm: RegistroForm = this.getInitialRegistroForm();
  grados = [
    { value: '1', label: '1° Semestre' }, { value: '2', label: '2° Semestre' },
    { value: '3', label: '3° Semestre' }, { value: '4', label: '4° Semestre' },
    { value: '5', label: '5° Semestre' }, { value: '6', label: '6° Semestre' }
  ];

  // Recuperación Data
  recoveryEmail: string = '';
  recoveryCode: string = '';
  recoveryNumUsuario: string = '';
  recoveryNewPassword: string = '';
  recoveryConfirmPassword: string = '';

  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

  // --- Tabs & UI ---
  setActiveTab(tab: 'login' | 'register' | 'forgot'): void {
    this.activeTab = tab;
    this.clearMessages();
    this.recuperarStep = 1;
  }

  private clearMessages(): void {
    this.showSuccessMessage = false;
    this.showRecoveryError = false;
    this.showRegistroError = false;
    this.successMessage = '';
    this.recoveryErrorMessage = '';
    this.registroErrorMessage = '';
  }

  private showSuccess(msg: string): void {
    this.showSuccessMessage = true;
    this.successMessage = msg;
    // Auto-ocultar después de 5s
    setTimeout(() => this.showSuccessMessage = false, 5000);
  }

  private showError(msg: string): void {
    if (this.activeTab === 'forgot') {
      this.showRecoveryError = true;
      this.recoveryErrorMessage = msg;
    } else {
      this.showRegistroError = true;
      this.registroErrorMessage = msg;
    }
  }

  // --- LOGIN ---
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

  // --- REGISTRO ---
  onRegister(): void {
    this.clearMessages();
    if (!this.validateRegistro()) return;

    this.isLoading = true;

    const payload = {
      nombres: this.registroForm.nombres,
      apellido_paterno: this.registroForm.apellidoPaterno,
      apellido_materno: this.registroForm.apellidoMaterno,
      curp: this.registroForm.curp.toUpperCase(),
      fecha_nacimiento: this.registroForm.fecha_nacimiento,
      telefono: this.registroForm.telefono,
      telefono_tutor: this.registroForm.telefonoTutor,
      nombre_tutor: this.registroForm.nombresTutor,
      correo_tutor: this.registroForm.correoTutor,
      grado: parseInt(this.registroForm.grado),
      tipo_estudiante: this.registroForm.tipo_estudiante,
      password: this.registroForm.password
    };

    this.http.post(`${this.apiUrl}/auth/registro-estudiante`, payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.showSuccess(`Registro exitoso. Tu usuario es: ${res.num_usuario}`);
        this.registroForm = this.getInitialRegistroForm();
        
        // Auto-fill login
        setTimeout(() => {
          this.loginNumUsuario = res.num_usuario;
          this.setActiveTab('login');
        }, 3000);
      },
      error: (err) => {
        this.isLoading = false;
        this.showError(err.error?.error || 'Error al registrar');
      }
    });
  }

  private validateRegistro(): boolean {
    const f = this.registroForm;
    if (!f.nombres || !f.apellidoPaterno || !f.curp || !f.grado || !f.password) {
      this.showError('Completa los campos obligatorios (*)');
      return false;
    }
    if (f.curp.length !== 18) {
      this.showError('CURP inválida (18 caracteres)');
      return false;
    }
    if (f.password.length < 6) {
      this.showError('Contraseña muy corta (mínimo 6)');
      return false;
    }
    if (!f.nombresTutor || !f.correoTutor || !f.telefonoTutor) {
      this.showError('Datos del tutor incompletos');
      return false;
    }
    return true;
  }

  private getInitialRegistroForm(): RegistroForm {
    return {
      nombres: '', apellidoPaterno: '', apellidoMaterno: '', curp: '',
      fecha_nacimiento: '', telefono: '', grado: '', tipo_estudiante: 'NUEVO_INGRESO',
      password: '', nombresTutor: '', correoTutor: '', telefonoTutor: ''
    };
  }

  // --- RECUPERACIÓN ---
  onRecoverPassword(): void {
    if (!this.recoveryEmail) return this.showError('Ingresa tu correo o teléfono');
    
    this.isLoading = true;
    this.clearMessages();

    this.http.post(`${this.apiUrl}/auth/solicitar-recuperacion`, { correo_o_telefono: this.recoveryEmail })
      .subscribe({
        next: (res: any) => {
          this.isLoading = false;
          this.recoveryNumUsuario = res.num_usuario;
          this.showSuccess(`Código enviado a tu correo/teléfono.`);
          this.recuperarStep = 2;
        },
        error: (err) => {
          this.isLoading = false;
          this.showError(err.error?.error || 'Usuario no encontrado');
        }
      });
  }

  onVerifyCode(): void {
    if (!this.recoveryCode || this.recoveryCode.length !== 6) return this.showError('Código inválido');
    
    this.isLoading = true;
    this.clearMessages();

    this.http.post(`${this.apiUrl}/auth/verificar-codigo`, {
      num_usuario: this.recoveryNumUsuario,
      codigo: this.recoveryCode
    }).subscribe({
      next: () => {
        this.isLoading = false;
        this.recuperarStep = 3;
      },
      error: (err) => {
        this.isLoading = false;
        this.showError(err.error?.error || 'Código incorrecto');
      }
    });
  }

  onResetPassword(): void {
    if (this.recoveryNewPassword.length < 6) return this.showError('Contraseña muy corta');
    if (this.recoveryNewPassword !== this.recoveryConfirmPassword) return this.showError('No coinciden');

    this.isLoading = true;
    this.clearMessages();

    this.http.post(`${this.apiUrl}/auth/restablecer-password`, {
      num_usuario: this.recoveryNumUsuario,
      new_password: this.recoveryNewPassword
    }).subscribe({
      next: () => {
        this.isLoading = false;
        this.showSuccess('Contraseña restablecida.');
        setTimeout(() => {
          this.loginNumUsuario = this.recoveryNumUsuario;
          this.setActiveTab('login');
          // Limpiar
          this.recoveryEmail = ''; this.recoveryCode = ''; 
          this.recoveryNewPassword = ''; this.recoveryConfirmPassword = '';
        }, 2000);
      },
      error: (err) => {
        this.isLoading = false;
        this.showError('Error al cambiar contraseña');
      }
    });
  }

  // --- ACCESO RÁPIDO
  onQuickAccess(role: string): void {
    const credentials: any = {
      'Estudiante': { num_usuario: '00000005', password: 'contra1326' },
      'Administrador': { num_usuario: '00000001', password: 'contra1326' },
      'Profesor': { num_usuario: '00000003', password: 'contra123' }
    };

    if (credentials[role]) {
      this.loginNumUsuario = credentials[role].num_usuario;
      this.loginPassword = credentials[role].password;
      this.onLogin();
    }
  }
}