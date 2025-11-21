// src/app/services/documentos.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Plantilla {
  id_plantilla: number;
  nombre: string;
  descripcion: string;
  es_fijo: number;
  requiere_actualizacion: number;
  dias_vigencia: number | null;
  obligatorio: number;
  tipo_estudiante: string | null;
}

export interface DocumentoDetalle {
  id_documento: number;
  id_plantilla: number;
  nombre_archivo: string;
  url_archivo: string;
  estado: 'PENDIENTE' | 'EN_REVISION' | 'APROBADO' | 'RECHAZADO';
  comentario: string | null;
  fecha_subida: string;
  fecha_validacion: string | null;
  fecha_vencimiento: string | null;
  plantilla_nombre: string;
  descripcion: string;
  obligatorio: number;
  es_fijo: number;
  requiere_actualizacion: number;
  dias_vigencia: number | null;
}

export interface DocumentoFaltante {
  id_plantilla: number;
  nombre: string;
  descripcion: string;
  obligatorio: number;
  es_fijo: number;
  requiere_actualizacion: number;
  dias_vigencia: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentosService {
  private apiUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  // Obtener todas las plantillas
  getPlantillas(tipoEstudiante?: string): Observable<Plantilla[]> {
    let url = `${this.apiUrl}/documentos/plantillas`;
    if (tipoEstudiante) {
      url += `?tipo_estudiante=${tipoEstudiante}`;
    }
    return this.http.get<Plantilla[]>(url);
  }

  // Obtener documentos del estudiante
  getMisDocumentos(): Observable<DocumentoDetalle[]> {
    return this.http.get<DocumentoDetalle[]>(`${this.apiUrl}/documentos/mis-documentos`);
  }

  // Ver documento (obtener blob para visualizar)
  verDocumento(idDocumento: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/documentos/ver/${idDocumento}`, {
      responseType: 'blob'
    });
  }

  // Descargar documento
  descargarDocumento(idDocumento: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/documentos/descargar/${idDocumento}`, {
      responseType: 'blob'
    });
  }

  // Subir documento
  subirDocumento(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/documentos/subir`, formData);
  }

  // Eliminar documento
  eliminarDocumento(idDocumento: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/documentos/eliminar/${idDocumento}`);
  }

  // Obtener plantillas faltantes 
  getPlantillasFaltantes(): Observable<DocumentoFaltante[]> {
    return this.http.get<DocumentoFaltante[]>(`${this.apiUrl}/documentos/plantillas-faltantes`);
  }

  // Convertir imagen a PDF
  convertirImagenAPDF(file: File): Observable<Blob> {
    const formData = new FormData();
    formData.append('imagen', file);
    return this.http.post(`${this.apiUrl}/documentos/convertir-pdf`, formData, {
      responseType: 'blob'
    });
  }
}