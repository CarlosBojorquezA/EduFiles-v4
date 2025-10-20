import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

interface NavItem {
  icon: string;
  label: string;
  route: string;
}

type UserRole = 'administrador' | 'profesor' | 'estudiante';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class NavbarComponent implements OnInit, OnChanges {
  @Input() UserRole: string = 'estudiante'; // Recibe el rol desde el componente padre
  navItems: NavItem[] = [];

  private roleNavItems: Record<string, NavItem[]> = {
    administrador: [
      { icon: 'Inicio', label: 'Inicio', route: '/administrador/Inicio' },
      { icon: 'Pendientes', label: 'Pendientes', route: '/administrador/Pendientes' },
      { icon: 'Buscar', label: 'Buscar', route: '/administrador/Buscar' },
      { icon: 'Gestion', label: 'Gestion', route: '/administrador/Gestion' },
      { icon: 'Perfil', label: 'Perfil', route: '/administrador/Perfil' }
    ],
  
    profesor: [
      { icon: 'Inicio', label: 'Inicio', route: '/Profesor/Inicio' },
      { icon: 'Estudiantes', label: 'Estudiantes', route: '/Profesor/Estudiantes' },
      { icon: 'Perfil', label: 'Perfil', route: '/Profesor/Perfil' },
      { icon: 'Configuracion', label: 'Configuración', route: '/Profesor/Configuracion' }
    ],

    estudiante: [
      { icon: 'Inicio', label: 'Inicio', route: '/estudiante/Inicio' },
      { icon: 'Documentos', label: 'Documentos', route: '/estudiante/Documentos' },
      { icon: 'Buscar', label: 'Buscar', route: '/estudiante/Buscar' },
      { icon: 'Maestros', label: 'Maestros', route: '/estudiante/Maestros' },
      { icon: 'Perfil', label: 'Perfil', route: '/estudiante/Perfil' }
    ]
  };

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadNavItems();
  }

  ngOnChanges(): void {
    // Se ejecuta cuando el @Input cambia
    this.loadNavItems();
  }

  loadNavItems(): void {
    const roleLowerCase = this.UserRole.toLowerCase();
    this.navItems = this.roleNavItems[roleLowerCase] || this.roleNavItems['estudiante'];
  }

  setRole(role: string): void {
    this.UserRole = role;
    this.loadNavItems();
  }

  isActive(route: string): boolean {
    return this.router.url === route;
  }
}