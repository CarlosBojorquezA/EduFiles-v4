import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

interface DashboardStats {
  sin_leer: number;
  estudiantes: number;
  total_mensajes: number;
  respondidos_hoy: number;
}

interface Estudiante {
  id_estudiante: number;
  nombre_completo: string;
  mensajes_no_leidos: number;
  ultimo_mensaje: string;
  fecha_ultimo_mensaje: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ProfDashboardService {
  private apiUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Obtener estadísticas del dashboard
  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/profesores/dashboard/stats`, {
      headers: this.getAuthHeaders()
    });
  }

  // Obtener estudiantes con mensajes
  getEstudiantesConMensajes(): Observable<Estudiante[]> {
    return this.http.get<Estudiante[]>(`${this.apiUrl}/profesores/mis-estudiantes`, {
      headers: this.getAuthHeaders()
    });
  }
}