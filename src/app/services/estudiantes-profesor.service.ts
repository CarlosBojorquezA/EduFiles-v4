import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface Estudiante {
  id_estudiante: number;
  nombre_completo: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  num_usuario: string;
  correo: string;
  telefono: string | null;
  grado: number;
  grupo_id: number;
  grupo_nombre: string;
  curp: string;
  estado_documentos: 'Completo' | 'Incompleto' | 'Pendiente';
  mensajes_no_leidos: number;
  ultimo_mensaje: string | null;
  fecha_ultimo_mensaje: string | null;
  materias_comunes: string[];
  iniciales: string;
}

export interface MensajeProfesor {
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
export class EstudiantesProfesorService {
  private apiUrl = 'http://localhost:5000/api/profesores';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    console.log('[EST-PROF SERVICE] Token:', token ? 'Presente' : 'Ausente');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  private handleError(error: HttpErrorResponse) {
    console.error('[EST-PROF SERVICE] Error HTTP:', error);
    
    if (error.status === 401) {
      console.error('[EST-PROF SERVICE] Error 401 - No autorizado');
      // Limpiar token inválido
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

  // ==================== ESTUDIANTES ====================
  getMisEstudiantes(): Observable<Estudiante[]> {
    console.log('[EST-PROF SERVICE] Obteniendo estudiantes...');
    const headers = this.getHeaders();
    
    return this.http.get<Estudiante[]>(`${this.apiUrl}/mis-estudiantes`, { headers })
      .pipe(
        catchError(this.handleError.bind(this))
      );
  }

  getDetalleEstudiante(idEstudiante: number): Observable<Estudiante> {
    console.log('[EST-PROF SERVICE] Obteniendo detalle estudiante:', idEstudiante);
    const headers = this.getHeaders();
    
    return this.http.get<Estudiante>(`${this.apiUrl}/estudiante/${idEstudiante}`, { headers })
      .pipe(
        catchError(this.handleError.bind(this))
      );
  }

  // ==================== CHAT ====================
  getMensajesChat(idEstudiante: number): Observable<MensajeProfesor[]> {
    console.log('[EST-PROF SERVICE] Obteniendo mensajes chat con:', idEstudiante);
    const headers = this.getHeaders();
    
    return this.http.get<MensajeProfesor[]>(`${this.apiUrl}/chat/${idEstudiante}/mensajes`, { headers })
      .pipe(
        catchError(this.handleError.bind(this))
      );
  }

  enviarMensaje(idEstudiante: number, mensaje: string): Observable<any> {
    console.log('[EST-PROF SERVICE] Enviando mensaje a:', idEstudiante);
    const headers = this.getHeaders();
    
    return this.http.post(
      `${this.apiUrl}/chat/${idEstudiante}/enviar`,
      { mensaje },
      { headers }
    ).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  marcarMensajesLeidos(idEstudiante: number): Observable<any> {
    console.log('[EST-PROF SERVICE] Marcando mensajes como leídos de:', idEstudiante);
    const headers = this.getHeaders();
    
    return this.http.put(
      `${this.apiUrl}/chat/${idEstudiante}/marcar-leidos`,
      {},
      { headers }
    ).pipe(
      catchError(this.handleError.bind(this))
    );
  }
}