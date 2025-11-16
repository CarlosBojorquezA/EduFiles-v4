import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth.service';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.getUserRole() !== 'ADMINISTRADOR') {
    router.navigate(['/unauthorized']);
    return false;
  }

  return true;
};
