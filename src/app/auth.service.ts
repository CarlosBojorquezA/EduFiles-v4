import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../src/environments/environment'; 

interface RegistroData {
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  curp: string;
  fecha_nacimiento: string;
  telefono?: string;
  telefono_tutor: string;
  nombre_tutor: string;
  correo_tutor: string;
  grado: number;
  tipo_estudiante: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Cargar usuario del localStorage si existe
    const user = this.getUserFromStorage();
    if (user) {
      this.currentUserSubject.next(user);
    }
  }

  // ========== LOGIN ==========
  login(num_usuario: string, password: string): Observable<any> {
    console.log('>>> INTENTANDO LOGIN - VERSIÓN CON API FIXED <<<');
    
    return this.http.post(`${this.apiUrl}/auth/login`, { 
      num_usuario, 
      password 
    }).pipe(
      tap((response: any) => {
        console.log('[AUTH SERVICE] Respuesta del login:', response);
        
        if (response.token) {
          localStorage.setItem('token', response.token);
          console.log('[AUTH SERVICE] Token guardado:', response.token.substring(0, 20) + '...');
        } else {
          console.error('[AUTH SERVICE] No se recibió token en la respuesta');
        }
        
        if (response.user) {
          localStorage.setItem('userData', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
          console.log('[AUTH SERVICE] Usuario guardado:', response.user);
        } else {
          console.error('[AUTH SERVICE] No se recibió usuario en la respuesta');
        }
      })
    );
  }

  // ========== REGISTRO ==========
  registrarEstudiante(data: RegistroData): Observable<any> {
    // AGREGADO /api
    return this.http.post(`${this.apiUrl}/auth/registro-estudiante`, data);
  }

  // ========== RECUPERACIÓN DE CONTRASEÑA ==========
  solicitarRecuperacion(correo_o_telefono: string): Observable<any> {
    // AGREGADO /api
    return this.http.post(`${this.apiUrl}/auth/solicitar-recuperacion`, { 
      correo_o_telefono 
    });
  }

  verificarCodigo(num_usuario: string, codigo: string): Observable<any> {
    // AGREGADO /api
    return this.http.post(`${this.apiUrl}/auth/verificar-codigo`, { 
      num_usuario, 
      codigo 
    });
  }

  restablecerPassword(num_usuario: string, new_password: string): Observable<any> {
    // AGREGADO /api
    return this.http.post(`${this.apiUrl}/auth/restablecer-password`, { 
      num_usuario, 
      new_password 
    });
  }

  // ========== CAMBIAR CONTRASEÑA  ==========
  solicitarCodigoCambio(): Observable<any> {
    // AGREGADO /api
    return this.http.post(`${this.apiUrl}/auth/solicitar-codigo-cambio`, {}, {
      headers: this.getAuthHeaders()
    });
  }

  confirmarCambioPassword(codigo: string, currentPass: string, newPass: string): Observable<any> {
    // AGREGADO /api
    return this.http.post(`${this.apiUrl}/auth/confirmar-cambio-password`, {
      codigo: codigo,
      current_password: currentPass,
      new_password: newPass
    }, {
      headers: this.getAuthHeaders()
    });
  }

  // ========== PERFIL ==========
  getPerfil(): Observable<any> {
    // AGREGADO /api
    return this.http.get(`${this.apiUrl}/auth/perfil`, { 
      headers: this.getAuthHeaders() 
    });
  }

  actualizarPerfil(data: any): Observable<any> {
    // AGREGADO /api
    return this.http.put(`${this.apiUrl}/auth/actualizar-perfil`, data, { 
      headers: this.getAuthHeaders() 
    });
  }

  // ========== SESIÓN ==========
  logout(): void {
    console.log('[AUTH SERVICE] Cerrando sesión...');
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    return !!token;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getCurrentUser(): any {
    return this.getUserFromStorage();
  }

  private getUserFromStorage(): any {
    const user = localStorage.getItem('userData');
    return user ? JSON.parse(user) : null;
  }

  getUserRole(): string | null {
    const user = this.getCurrentUser();
    return user ? user.rol : null;
  }

  // ========== HEADERS ==========
  private getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // ========== VERIFICACIÓN DE ROLES ==========
  isEstudiante(): boolean {
    return this.getUserRole() === 'ESTUDIANTE';
  }

  isProfesor(): boolean {
    return this.getUserRole() === 'PROFESOR';
  }

  isAdministrador(): boolean {
    return this.getUserRole() === 'ADMINISTRADOR';
  }

  // ========== HEALTH CHECK  ==========
  healthCheck(): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/health`);
  }
}