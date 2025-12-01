import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Material {
  id_material: number;
  titulo: string;
  descripcion: string;
  categoria: 'GUIA' | 'APOYO' | 'AVISO' | 'EXAMEN' | 'TAREA' | 'OTRO';
  materia: string;
  id_materia?: number;
  semestre?: number;
  grupo_id?: number;
  nombre_archivo: string;
  url_archivo: string;
  tamaño_archivo: number;
  tipo_mime: string;
  fecha_subida: string;
  nombre_profesor: string;
  nombre_materia_tabla?: string;
  es_nuevo: number;
  tamaño_legible?: string;
  fecha_formateada?: string;
}

export interface MaterialStats {
  total_materiales: number;
  total_materias: number;
  nuevos: number;
  total_profesores: number; 
}

export interface MateriaDisponible {
  id_materia: number;
  nombre: string;
}

@Injectable({
  providedIn: 'root'
})
export class MaterialesService {
  private apiUrl =  `${environment.apiUrl}/materiales`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // ==================== OBTENER MATERIALES ====================
  getMisMateriales(): Observable<Material[]> {
    const headers = this.getHeaders();
    return this.http.get<Material[]>(`${this.apiUrl}/mis-materiales`, { headers });
  }

  // ==================== OBTENER MATERIAS DISPONIBLES ====================
  getMateriasDisponibles(): Observable<MateriaDisponible[]> {
    const headers = this.getHeaders();
    return this.http.get<MateriaDisponible[]>(`${this.apiUrl}/materias-disponibles`, { headers });
  }

  // ==================== ESTADÍSTICAS ====================
  getStats(): Observable<MaterialStats> {
    const headers = this.getHeaders();
    return this.http.get<MaterialStats>(`${this.apiUrl}/stats`, { headers });
  }

  // ==================== VER MATERIAL ====================
  verMaterial(idMaterial: number): Observable<Blob> {
    const headers = this.getHeaders();
    return this.http.get(`${this.apiUrl}/ver/${idMaterial}`, {
      headers,
      responseType: 'blob'
    });
  }

  // ==================== DESCARGAR MATERIAL ====================
  descargarMaterial(idMaterial: number): Observable<Blob> {
    const headers = this.getHeaders();
    return this.http.get(`${this.apiUrl}/descargar/${idMaterial}`, {
      headers,
      responseType: 'blob'
    });
  }

  // ==================== MÉTODOS PARA PROFESORES (Admin) ====================
  
  // Subir material (profesor)
  subirMaterial(formData: FormData): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(`${this.apiUrl}/subir`, formData, { headers });
  }

  // Obtener materiales del profesor
  getMisMaterialesProfesor(): Observable<Material[]> {
    const headers = this.getHeaders();
    return this.http.get<Material[]>(`${this.apiUrl}/mis-materiales-profesor`, { headers });
  }

  // Eliminar material
  eliminarMaterial(idMaterial: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.delete(`${this.apiUrl}/eliminar/${idMaterial}`, { headers });
  }

  // Actualizar material
  actualizarMaterial(idMaterial: number, data: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.put(`${this.apiUrl}/actualizar/${idMaterial}`, data, { headers });
  }
}