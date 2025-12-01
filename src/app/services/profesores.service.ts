import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Profesor {
  id_profesor: number;
  nombre_completo: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  telefono: string | null;
  departamento: string | null;
  licenciatura: string | null;
  años_experiencia?: number;
  correo: string;
  url_foto_perfil: string | null;
  materia: string;
  materias?: string;
  mensajes_no_leidos: number;
  ultimo_mensaje: string | null;
  fecha_ultimo_mensaje: string | null;
  estado: 'En línea' | 'Desconectado';
  iniciales: string;
}

export interface Mensaje {
  id_mensaje: number;
  id_remitente: number;
  id_destinatario: number;
  mensaje: string;
  fecha_envio: string;
  leido: number;
  fecha_lectura: string | null;
  tipo: 'enviado' | 'recibido';
  nombre_remitente?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfesoresService {
  // Este servicio usa el endpoint de PROFESORES pero desde la perspectiva del ESTUDIANTE
  private apiUrl = `${environment.apiUrl}/profesores`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    console.log('[PROFESORES SERVICE - EST] Token:', token ? 'Presente' : 'Ausente');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  private handleError(error: HttpErrorResponse) {
    console.error('[PROFESORES SERVICE - EST] Error HTTP:', error);
    
    if (error.status === 401) {
      console.error('[PROFESORES SERVICE - EST] Error 401 - No autorizado');
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      window.location.href = '/';
    }
    
    let errorMessage = 'Ocurrió un error en el servidor';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Código: ${error.status}\nMensaje: ${error.error?.error || error.message}`;
    }
    
    return throwError(() => new Error(errorMessage));
  }

  // ==================== PROFESORES (ESTUDIANTE USA ESTO) ====================
  getMisProfesores(): Observable<Profesor[]> {
    console.log('[PROFESORES SERVICE - EST] Obteniendo mis profesores...');
    const headers = this.getHeaders();
    
    return this.http.get<Profesor[]>(`${this.apiUrl}/mis-profesores`, { headers })
      .pipe(
        catchError(this.handleError.bind(this))
      );
  }

  getDetalleProfesor(idProfesor: number): Observable<Profesor> {
    console.log('[PROFESORES SERVICE - EST] Obteniendo detalle profesor:', idProfesor);
    const headers = this.getHeaders();
    
    return this.http.get<Profesor>(`${this.apiUrl}/profesor/${idProfesor}`, { headers })
      .pipe(
        catchError(this.handleError.bind(this))
      );
  }

  // ==================== CHAT (ESTUDIANTE → PROFESOR) ====================
  getMensajesChat(idProfesor: number): Observable<Mensaje[]> {
    console.log('[PROFESORES SERVICE - EST] Obteniendo mensajes con profesor:', idProfesor);
    const headers = this.getHeaders();
    
    // El estudiante llama al endpoint correcto
    return this.http.get<Mensaje[]>(`${this.apiUrl}/chat/${idProfesor}/mensajes`, { headers })
      .pipe(
        catchError(this.handleError.bind(this))
      );
  }

  enviarMensaje(idProfesor: number, mensaje: string): Observable<any> {
    console.log('[PROFESORES SERVICE - EST] Enviando mensaje a profesor:', idProfesor);
    const headers = this.getHeaders();
    
    return this.http.post(
      `${this.apiUrl}/chat/${idProfesor}/enviar`,
      { mensaje },
      { headers }
    ).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  marcarMensajesLeidos(idProfesor: number): Observable<any> {
    console.log('[PROFESORES SERVICE - EST] Marcando mensajes como leídos de profesor:', idProfesor);
    const headers = this.getHeaders();
    
    return this.http.put(
      `${this.apiUrl}/chat/${idProfesor}/marcar-leidos`,
      {},
      { headers }
    ).pipe(
      catchError(this.handleError.bind(this))
    );
  }
}