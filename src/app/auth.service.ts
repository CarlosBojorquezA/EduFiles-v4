import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

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
  private apiUrl = 'http://localhost:5000/api';
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
    return this.http.post(`${this.apiUrl}/auth/login`, { 
      num_usuario, 
      password 
    }).pipe(
      tap((response: any) => {
        this.setSession(response);
      })
    );
  }

  // ========== REGISTRO ==========
  registrarEstudiante(data: RegistroData): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/registro-estudiante`, data);
  }

  // ========== RECUPERACIÓN DE CONTRASEÑA ==========
  solicitarRecuperacion(correo_o_telefono: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/solicitar-recuperacion`, { 
      correo_o_telefono 
    });
  }

  verificarCodigo(num_usuario: string, codigo: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/verificar-codigo`, { 
      num_usuario, 
      codigo 
    });
  }

  restablecerPassword(num_usuario: string, new_password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/restablecer-password`, { 
      num_usuario, 
      new_password 
    });
  }

  // ========== CAMBIAR CONTRASEÑA ==========
  cambiarPassword(old_password: string, new_password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/cambiar-password`, { 
      old_password, 
      new_password 
    }, { 
      headers: this.getAuthHeaders() 
    });
  }

  // ========== PERFIL ==========
  getPerfil(): Observable<any> {
    return this.http.get(`${this.apiUrl}/auth/perfil`, { 
      headers: this.getAuthHeaders() 
    });
  }

  actualizarPerfil(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/auth/actualizar-perfil`, data, { 
      headers: this.getAuthHeaders() 
    });
  }

  // ========== SESIÓN ==========
  private setSession(authResult: any): void {
    localStorage.setItem('token', authResult.token);
    localStorage.setItem('userData', JSON.stringify(authResult.user));
    this.currentUserSubject.next(authResult.user);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
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

  // ========== HEALTH CHECK ==========
  healthCheck(): Observable<any> {
    return this.http.get(`${this.apiUrl.replace('/api', '')}/health`);
  }
}