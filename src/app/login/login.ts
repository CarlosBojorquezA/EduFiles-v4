import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})

export class LoginComponent {
  activeTab: 'login' | 'forgot' = 'login';
  
  // Login form
  loginEmail: string = '';
  loginPassword: string = '';
  
  // Recovery form
  recoveryEmail: string = '';
  showRecoveryError: boolean = false;

  constructor(private router: Router) {}

  setActiveTab(tab: 'login' | 'forgot'): void {
    this.activeTab = tab;
    this.showRecoveryError = false;
  }

  onLogin(): void {
    if (!this.loginEmail || !this.loginPassword) {
      console.log('Por favor completa todos los campos');
      return;
    }
    console.log('Iniciar sesión:', { email: this.loginEmail, password: this.loginPassword });
  }

  onRecoverPassword(): void {
    if (!this.recoveryEmail || !this.isValidEmailOrPhone(this.recoveryEmail)) {
      this.showRecoveryError = true;
      return;
    }
    this.showRecoveryError = false;
    console.log('Recuperar contraseña para:', this.recoveryEmail);
  }

  onQuickAccess(role: string): void {
    console.log('Acceso rápido como:', role);
    
    switch (role) {
      case 'Administrador':
        this.router.navigate(['/admin-dashboard']);
        break;
      case 'Estudiante':
        this.router.navigate(['/est-dashboard']);
        break;
      case 'Profesor':
        this.router.navigate(['/prof-dashboard']);
        break;
    }
  }
  private isValidEmailOrPhone(value: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{3,4}-?\d{3,4}-?\d{4}$/;
    return emailRegex.test(value) || phoneRegex.test(value);
  }
}