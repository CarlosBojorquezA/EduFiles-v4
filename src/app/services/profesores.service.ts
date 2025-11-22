import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  private apiUrl = 'http://localhost:5000/api/profesores';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // ==================== PROFESORES ====================
  getMisProfesores(): Observable<Profesor[]> {
    const headers = this.getHeaders();
    return this.http.get<Profesor[]>(`${this.apiUrl}/mis-profesores`, { headers });
  }

  getDetalleProfesor(idProfesor: number): Observable<Profesor> {
    const headers = this.getHeaders();
    return this.http.get<Profesor>(`${this.apiUrl}/profesor/${idProfesor}`, { headers });
  }

  // ==================== CHAT ====================
  getMensajesChat(idProfesor: number): Observable<Mensaje[]> {
    const headers = this.getHeaders();
    return this.http.get<Mensaje[]>(`${this.apiUrl}/chat/${idProfesor}/mensajes`, { headers });
  }

  enviarMensaje(idProfesor: number, mensaje: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(
      `${this.apiUrl}/chat/${idProfesor}/enviar`,
      { mensaje },
      { headers }
    );
  }

  marcarMensajesLeidos(idProfesor: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.put(
      `${this.apiUrl}/chat/${idProfesor}/marcar-leidos`,
      {},
      { headers }
    );
  }
}