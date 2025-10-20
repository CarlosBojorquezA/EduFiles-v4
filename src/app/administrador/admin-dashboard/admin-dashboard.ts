import { Component } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common'; // Importa CommonModule y TitleCasePipe

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, TitleCasePipe], // Añade los módulos aquí
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboardComponent {

  // Datos para las tarjetas de estadísticas
  stats = [
    { value: 156, label: 'Estudiantes', icon: 'fa-solid fa-users', colorClass: 'blue' },
    { value: 23, label: 'Pendientes', icon: 'fa-regular fa-clock', colorClass: 'yellow' },
    { value: 12, label: 'Aprobados hoy', icon: 'fa-regular fa-circle-check', colorClass: 'green' },
    { value: 3, label: 'Rechazados hoy', icon: 'fa-regular fa-circle-xmark', colorClass: 'red' }
  ];

  // Datos para las alertas
  alerts = [
    { message: '5 documentos vencen en 24 horas', level: 'urgente' },
    { message: '2 estudiantes sin documentos requeridos', level: 'critico' }
  ];

  // Datos para la actividad reciente
  activity = [
    { type: 'upload', text: 'María García subió Certificado de Nacimiento', time: 'hace 2 min' },
    { type: 'approved', text: 'Aprobaste Constancia de Estudios de Juan Pérez', time: 'hace 15 min' },
    { type: 'rejected', text: 'Rechazaste Comprobante de Domicilio de Ana López', time: 'hace 1 hora' },
    { type: 'system', text: 'Carlos Mendoza se registró en el sistema', time: 'hace 3 horas' }
  ];

  constructor() { }

  // Funciones para obtener clases de CSS dinámicamente
  getActivityClass(type: string): string {
    return `activity-icon ${type}`;
  }

  getActivityIcon(type: string): string {
    switch (type) {
      case 'upload': return 'fa-solid fa-arrow-up-from-bracket';
      case 'approved': return 'fa-solid fa-check';
      case 'rejected': return 'fa-solid fa-xmark';
      case 'system': return 'fa-solid fa-user-plus';
      default: return '';
    }
  }

}