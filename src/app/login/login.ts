import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common'; 

@Component({
  selector: 'app-login',
  standalone: true, 
  imports: [CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  constructor(private router: Router) { }

  onLogin(): void {
    console.log('Inicio de sesión desde formulario (Estudiante)...');
    this.router.navigate(['/est-dashboard']);
  }

  /**
   Metodo para manejar los inicios de sesión rápidos.
   @param role El rol con el que se desea iniciar sesión.
   */
  loginAsRole(role: 'estudiante' | 'administrador' | 'profesor'): void {
    console.log(`Iniciando sesión rápida como: ${role}`);

    switch (role) {
      case 'estudiante':
        this.router.navigate(['/est-dashboard']);
        break;
      case 'administrador':
        this.router.navigate(['/admin-dashboard']);
        break;
      case 'profesor':
        // Nota: Esta ruta es un ejemplo. Deberás crearla.
        console.log('Redirigiendo a la ruta de profesor (ejemplo: /prof-dashboard)');
        this.router.navigate(['/prof-dashboard']);
        break;
    }
  }
}