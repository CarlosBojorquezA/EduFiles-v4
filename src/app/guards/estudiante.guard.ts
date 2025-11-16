import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth.service';

export const estudianteGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.getUserRole() !== 'ESTUDIANTE') {
    alert('Acceso denegado. Solo estudiantes pueden acceder a esta página.');
    router.navigate(['']);
    return false;
  }

  return true;
};
