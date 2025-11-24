import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../auth.service';

export const profesorGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('[PROFESOR GUARD] Verificando acceso...');
  
  const isLoggedIn = authService.isLoggedIn();
  const user = authService.getCurrentUser();
  const isProfesor = user && user.rol === 'PROFESOR';

  console.log('[PROFESOR GUARD] Logged in:', isLoggedIn);
  console.log('[PROFESOR GUARD] Usuario:', user);
  console.log('[PROFESOR GUARD] Es profesor:', isProfesor);

  if (!isLoggedIn) {
    console.log('[PROFESOR GUARD] ✗ No autenticado, redirigiendo a login');
    router.navigate(['']);
    return false;
  }

  if (!isProfesor) {
    console.log('[PROFESOR GUARD] ✗ No es profesor, redirigiendo');
    router.navigate(['']);
    return false;
  }

  console.log('[PROFESOR GUARD] ✓ Acceso permitido');
  return true;
};