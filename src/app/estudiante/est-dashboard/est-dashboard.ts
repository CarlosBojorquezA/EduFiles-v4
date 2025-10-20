import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NavbarComponent } from '../../Herramientas/navbar/navbar';

// Definimos una interfaz para tipar nuestros documentos
export interface Documento {
  id: number;
  nombre: string;
  vence?: string;
  subido?: string;
  estado: 'Aprobado' | 'Rechazado' | 'Pendiente' | 'Faltante';
  comentario?: string;
  icon: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true, 
  imports: [CommonModule, NavbarComponent] ,
  templateUrl: './est-dashboard.html',
  styleUrls: ['./est-dashboard.css']
})
export class estDashboardComponent implements OnInit {

  documentos: Documento[] = [
    {
      id: 1,
      nombre: 'Certificado de Nacimiento',
      vence: '2024-03-15',
      subido: '2024-02-20',
      estado: 'Aprobado',
      comentario: 'Documento aprobado correctamente',
      icon: 'fa-solid fa-check'
    },
    {
      id: 2,
      nombre: 'Constancia de Estudios',
      vence: '2024-03-20',
      subido: '2024-02-25',
      estado: 'Rechazado',
      comentario: 'El documento está borroso, por favor sube una versión más clara',
      icon: 'fa-solid fa-xmark'
    },
    {
      id: 3,
      nombre: 'Carta de Motivación',
      vence: '2024-03-25',
      subido: '2024-03-01',
      estado: 'Pendiente',
      icon: 'fa-regular fa-file-lines'
    },
    {
      id: 4,
      nombre: 'Comprobante de Domicilio',
      estado: 'Faltante',
      icon: 'fa-regular fa-file-lines'
    }
  ];

  constructor() { }

  ngOnInit(): void {
  }

  getStatusClass(estado: string): string {
    switch (estado) {
      case 'Aprobado': return 'approved';
      case 'Rechazado': return 'rejected';
      case 'Pendiente': return 'pending';
      case 'Faltante': return 'missing';
      default: return '';
    }
  }

}