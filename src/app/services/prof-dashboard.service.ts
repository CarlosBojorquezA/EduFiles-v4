import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DashboardStats {
  mensajes_sin_leer: number;       
  total_estudiantes: number;        
  total_mensajes: number;           
  mensajes_respondidos_hoy: number; 
  estudiantes_activos?: number;     
}

export interface Estudiante {
  id_estudiante: number;
  nombre_completo: string;
  mensajes_no_leidos: number;
  ultimo_mensaje: string;
  fecha_ultimo_mensaje: string; 
}

@Injectable({
  providedIn: 'root'
})
export class ProfDashboardService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Obtener estadísticas del dashboard
  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/dashboard/profesor/stats`);
  }

  // Obtener estudiantes con mensajes 
  getEstudiantesConMensajes(): Observable<Estudiante[]> {
    return this.http.get<Estudiante[]>(`${this.apiUrl}/profesores/mis-estudiantes`);
  }
}