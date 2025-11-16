import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth.service';

export const requireAuthGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  console.log('[AUTH GUARD] Verificando autenticación...');
  
  const isLoggedIn = auth.isLoggedIn();
  console.log('[AUTH GUARD] Usuario autenticado:', isLoggedIn);

  if (!isLoggedIn) {
    console.log('[AUTH GUARD] No autenticado, redirigiendo a login');
    router.navigate(['']);
    return false;
  }

  console.log('[AUTH GUARD] Autenticación válida');
  return true;
};
