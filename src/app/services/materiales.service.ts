import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Material {
  id_material: number;
  titulo: string;
  descripcion: string;
  categoria: 'GUIA' | 'APOYO' | 'AVISO' | 'EXAMEN' | 'TAREA' | 'OTRO';
  materia: string;
  semestre: number | null;
  nombre_archivo: string;
  tamaño_archivo: number;
  tamaño_legible?: string;
  fecha_subida: string;
  fecha_formateada?: string;
  nombre_profesor: string;
  turno: string | null;
  es_nuevo: number;
}

export interface MaterialStats {
  total_materiales: number;
  total_materias: number;
  nuevos: number;
}

@Injectable({
  providedIn: 'root'
})
export class MaterialesService {
  private apiUrl = 'http://localhost:5000/api/materiales';

  constructor(private http: HttpClient) {}

  getMisMateriales(): Observable<Material[]> {
    return this.http.get<Material[]>(`${this.apiUrl}/mis-materiales`);
  }

  getStats(): Observable<MaterialStats> {
    return this.http.get<MaterialStats>(`${this.apiUrl}/stats`);
  }

  getMateriasDisponibles(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/materias-disponibles`);
  }

  verMaterial(idMaterial: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/ver/${idMaterial}`, {
      responseType: 'blob'
    });
  }

  descargarMaterial(idMaterial: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/descargar/${idMaterial}`, {
      responseType: 'blob'
    });
  }
}