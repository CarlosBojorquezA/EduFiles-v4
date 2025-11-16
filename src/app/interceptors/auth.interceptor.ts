import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  console.log('[INTERCEPTOR] Request a:', req.url);
  console.log('[INTERCEPTOR] Token disponible:', !!token);

  // Si no hay token, continuar sin modificar
  if (!token) {
    console.log('[INTERCEPTOR] No hay token, continuando sin Authorization header');
    return next(req);
  }

  // Clonar request y agregar Authorization header
  const cloned = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  console.log('[INTERCEPTOR] Header agregado:', cloned.headers.get('Authorization')?.substring(0, 30) + '...');

  // Manejar errores de autenticación
  return next(cloned).pipe(
    catchError((error) => {
      console.log('[INTERCEPTOR] Error capturado:', error.status);
      
      if (error.status === 401 || error.status === 422) {
        console.log('[INTERCEPTOR] Token inválido o expirado, limpiando sesión');
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        router.navigate(['']);
      }
      
      return throwError(() => error);
    })
  );
};
