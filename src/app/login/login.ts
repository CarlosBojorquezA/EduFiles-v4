import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";


const firebaseConfig = {
  apiKey: "AIzaSyDkGxOnEE6z9xdegyZxfVzmpZ9BM7NsHIA",
  authDomain: "edufiles-autentificacion.firebaseapp.com",
  projectId: "edufiles-autentificacion",
  storageBucket: "edufiles-autentificacion.firebasestorage.app",
  messagingSenderId: "847578842387",
  appId: "1:847578842387:web:f83293a157f807fcb186e6"
};

const provider = new GoogleAuthProvider();
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

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

  login_google(){
  signInWithPopup(auth, provider)
    .then((result) => {
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential) {
        const token = credential.accessToken;
        // Puede usarse el token para mandarlo al backend
      }
      const user = result.user;
      alert(`Bienvenido ${user.displayName}`);
      // Redirigir al menú tras el login exitoso
      this.router.navigate(['/admin-dashboard']); // dependera del rol
  }).catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    const email = error.customData.email;
    const credential = GoogleAuthProvider.credentialFromError(error);
  });
  }

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