import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-documentos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './est-documentos.html',
  styleUrls: ['./est-documentos.css']
})
export class DocumentosComponent {

  // Datos para la sección de alertas
  alerts = [
    {
      type: 'danger',
      icon: 'fa-solid fa-triangle-exclamation',
      title: 'Identificación Oficial:',
      message: 'Imagen borrosa, volver a subir'
    },
    {
      type: 'warning',
      icon: 'fa-solid fa-circle-info',
      title: 'Comprobante de Domicilio:',
      message: 'Documento vencido, en revisión'
    }
  ];

  // Datos para la lista de documentos
  documents = [
    {
      title: 'CURP',
      status: 'Aprobado',
      required: true,
      description: 'Clave Única de Registro de Población',
      uploadDate: '14/02/2024',
      statusMessage: 'Documento aprobado',
      icon: 'fa-solid fa-check-circle'
    },
    {
      title: 'Identificación Oficial',
      status: 'Rechazado',
      required: true,
      description: 'Credencial para votar, pasaporte, etc.',
      uploadDate: '11/02/2024',
      statusMessage: 'La imagen está borrosa',
      icon: 'fa-solid fa-times-circle'
    },
    {
      title: 'Comprobante de Domicilio',
      status: 'Revisión',
      required: true,
      description: 'Recibo de luz, agua o teléfono no mayor a 3 meses.',
      uploadDate: '10/02/2024',
      statusMessage: 'El documento ha vencido, en revisión por administrador.',
      icon: 'fa-solid fa-clock'
    }
    // Agrega más documentos aquí
  ];

  constructor() { }

  // Función para obtener la clase de color según el estado
  getStatusClass(status: string): string {
    return 'status-' + status.toLowerCase();
  }
}