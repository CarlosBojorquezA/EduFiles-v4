import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth.service';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  console.log('[ADMIN GUARD] Verificando rol de administrador...');
  
  const role = auth.getUserRole();
  console.log('[ADMIN GUARD] Rol del usuario:', role);

  if (role !== 'ADMINISTRADOR') {
    console.log('[ADMIN GUARD] No es administrador, acceso denegado');
    alert('Acceso denegado. Solo administradores pueden acceder a esta página.');
    router.navigate(['']);
    return false;
  }

  console.log('[ADMIN GUARD] Acceso permitido');
  return true;
};
