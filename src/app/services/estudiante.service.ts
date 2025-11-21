// src/app/services/estudiante.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface EstudianteStats {
  total_requeridos: number;
  documentos_subidos: number;
  documentos_pendientes: number;
  documentos_aprobados: number;
}

interface DocumentoEstudiante {
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
  dias_vigencia: number | null;
}

interface AlertaEstudiante {
  type: 'error' | 'warning';
  icon: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class EstudianteService {
  private apiUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  // Obtener estadísticas del estudiante
  getEstadisticas(): Observable<EstudianteStats> {
    return this.http.get<EstudianteStats>(`${this.apiUrl}/dashboard/estudiante/stats`);
  }

  // Obtener documentos del estudiante
  getMisDocumentos(): Observable<DocumentoEstudiante[]> {
    return this.http.get<DocumentoEstudiante[]>(`${this.apiUrl}/documentos/mis-documentos`);
  }

  // Generar alertas en el frontend basadas en los documentos
  generarAlertas(documentos: DocumentoEstudiante[]): AlertaEstudiante[] {
    const alertas: AlertaEstudiante[] = [];
    
    documentos.forEach(doc => {
      // Alerta de documento rechazado
      if (doc.estado === 'RECHAZADO' && doc.comentario) {
        alertas.push({
          type: 'error',
          icon: 'alert-triangle',
          message: `${doc.plantilla_nombre} fue rechazado: ${doc.comentario}`
        });
      }
      
      // Alerta de documento próximo a vencer (si tiene fecha de vencimiento)
      if (doc.fecha_vencimiento) {
        const fechaVencimiento = new Date(doc.fecha_vencimiento);
        const hoy = new Date();
        const diferenciaDias = Math.ceil((fechaVencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diferenciaDias <= 7 && diferenciaDias > 0) {
          alertas.push({
            type: 'warning',
            icon: 'alert-circle',
            message: `${doc.plantilla_nombre} vence pronto (${doc.fecha_vencimiento})`
          });
        }
      }
    });
    
    return alertas;
  }

  // Ver documento
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
}