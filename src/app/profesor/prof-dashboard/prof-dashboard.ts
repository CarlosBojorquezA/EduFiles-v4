import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../Herramientas/navbar/navbar';

@Component({
  selector: 'app-profesor-dashboard',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './prof-dashboard.html',
  styleUrls: ['./prof-dashboard.css']
})
export class ProfDashboardComponent {

  // Datos para las tarjetas de estadísticas
  stats = [
    { value: 4, label: 'Sin leer', icon: 'fa-regular fa-envelope', colorClass: 'purple' },
    { value: 45, label: 'Estudiantes', icon: 'fa-regular fa-user', colorClass: 'green' },
    { value: 12, label: 'Total mensajes', icon: 'fa-regular fa-paper-plane', colorClass: 'blue' },
    { value: 8, label: 'Respondidos hoy', icon: 'fa-solid fa-reply', colorClass: 'orange' }
  ];

  // Datos para la lista de acciones rápidas
  quickActions = [
    'Responde a consultas de estudiantes',
    'Ayuda con documentos rechazados',
    'Proporciona orientación académica'
  ];

  // Datos para la actividad reciente
  recentActivity = [
    { label: 'Mensajes respondidos hoy', value: '8' },
    { label: 'Estudiantes activos', value: '23' },
    { label: 'Consultas sobre documentos', value: '15' },
    { label: 'Tiempo promedio de respuesta', value: '2.5 hrs' }
  ];

  constructor() { }

}