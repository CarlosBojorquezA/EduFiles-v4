import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

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
  id_documento?: number;
  id_plantilla: number;
  nombre_archivo?: string;
  url_archivo?: string;
  estado: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO' | 'FALTANTE' | 'EN_REVISION';
  comentario?: string;
  fecha_subida?: string;
  fecha_validacion?: string;
  fecha_vencimiento?: string;
  plantilla_nombre: string;
  descripcion: string;
  obligatorio: number;
  es_fijo: number;
  requiere_actualizacion: number;
  dias_vigencia: number | null;
  tipo_registro?: 'SUBIDO' | 'FALTANTE'; 
}

@Injectable({
  providedIn: 'root'
})
export class DocumentosService {
  private apiUrl =  `${environment.apiUrl}/documentos`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getTodosDocumentos(): Observable<DocumentoDetalle[]> {
    const headers = this.getHeaders();

    return forkJoin({
      subidos: this.http.get<DocumentoDetalle[]>(
        `${this.apiUrl}/mis-documentos`, 
        { headers }
      ).pipe(catchError(() => of([]))),
      
      faltantes: this.http.get<Plantilla[]>(
        `${this.apiUrl}/plantillas-faltantes`, 
        { headers }
      ).pipe(catchError(() => of([])))
    }).pipe(
      map(({ subidos, faltantes }) => {
        // Marcar documentos subidos
        const docsSubidos = subidos.map(doc => ({
          ...doc,
          tipo_registro: 'SUBIDO' as const,
          estado: doc.estado || 'PENDIENTE' as const
        }));

        // Convertir plantillas faltantes a formato DocumentoDetalle
        const docsFaltantes: DocumentoDetalle[] = faltantes.map(plantilla => ({
          id_plantilla: plantilla.id_plantilla,
          estado: 'FALTANTE' as const,
          plantilla_nombre: plantilla.nombre,
          descripcion: plantilla.descripcion,
          obligatorio: plantilla.obligatorio,
          es_fijo: plantilla.es_fijo,
          requiere_actualizacion: plantilla.requiere_actualizacion,
          dias_vigencia: plantilla.dias_vigencia,
          tipo_registro: 'FALTANTE' as const
        }));

        // Combinar ambos arrays
        return [...docsSubidos, ...docsFaltantes];
      })
    );
  }

  // ==================== DOCUMENTOS SUBIDOS ====================
  getMisDocumentos(): Observable<DocumentoDetalle[]> {
    const headers = this.getHeaders();
    return this.http.get<DocumentoDetalle[]>(`${this.apiUrl}/mis-documentos`, { headers });
  }

  // ==================== PLANTILLAS FALTANTES ====================
  getPlantillasFaltantes(): Observable<Plantilla[]> {
    const headers = this.getHeaders();
    return this.http.get<Plantilla[]>(`${this.apiUrl}/plantillas-faltantes`, { headers });
  }

  // ==================== SUBIR DOCUMENTO ====================
  subirDocumento(formData: FormData): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(`${this.apiUrl}/subir`, formData, { headers });
  }

  // ==================== VER DOCUMENTO ====================
  verDocumento(idDocumento: number): Observable<Blob> {
    const headers = this.getHeaders();
    return this.http.get(`${this.apiUrl}/ver/${idDocumento}`, {
      headers,
      responseType: 'blob'
    });
  }

  // ==================== DESCARGAR DOCUMENTO ====================
  descargarDocumento(idDocumento: number): Observable<Blob> {
    const headers = this.getHeaders();
    return this.http.get(`${this.apiUrl}/descargar/${idDocumento}`, {
      headers,
      responseType: 'blob'
    });
  }

  // ==================== ELIMINAR DOCUMENTO ====================
  eliminarDocumento(idDocumento: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.delete(`${this.apiUrl}/eliminar/${idDocumento}`, { headers });
  }

  // ==================== PLANTILLAS (ADMIN) ====================
  getPlantillas(tipoEstudiante?: string): Observable<Plantilla[]> {
    const headers = this.getHeaders();
    const url = tipoEstudiante 
      ? `${this.apiUrl}/plantillas?tipo_estudiante=${tipoEstudiante}`
      : `${this.apiUrl}/plantillas`;
    
    return this.http.get<Plantilla[]>(url, { headers });
  }

  crearPlantilla(plantilla: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(`${this.apiUrl}/plantillas`, plantilla, { headers });
  }

  actualizarPlantilla(idPlantilla: number, plantilla: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.put(`${this.apiUrl}/plantillas/${idPlantilla}`, plantilla, { headers });
  }

  eliminarPlantilla(idPlantilla: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.delete(`${this.apiUrl}/plantillas/${idPlantilla}`, { headers });
  }

  // ==================== DOCUMENTOS PENDIENTES (ADMIN/PROFESOR) ====================
  getDocumentosPendientes(): Observable<any[]> {
    const headers = this.getHeaders();
    return this.http.get<any[]>(`${this.apiUrl}/pendientes`, { headers });
  }

  // ==================== VALIDAR DOCUMENTO (ADMIN/PROFESOR) ====================
  validarDocumento(idDocumento: number, estado: string, comentario?: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.put(
      `${this.apiUrl}/validar/${idDocumento}`,
      { estado, comentario },
      { headers }
    );
  }

  // ==================== HISTORIAL ====================
  getHistorialDocumento(idDocumento: number): Observable<any[]> {
    const headers = this.getHeaders();
    return this.http.get<any[]>(`${this.apiUrl}/historial/${idDocumento}`, { headers });
  }

  analizarDocumentoConIA(idDocumento: number): Observable<any> {
    const headers = this.getHeaders(); 

    return this.http.post(
      `${this.apiUrl}/analizar-con-ia/${idDocumento}`,
      {}, 
      { headers } 
    );
  }
}