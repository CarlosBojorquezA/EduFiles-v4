import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { estDashboardComponent } from './estudiante/est-dashboard/est-dashboard';
import { AdminDashboardComponent } from './administrador/admin-dashboard/admin-dashboard';
import { AdminPendientesComponent } from './administrador/admin-pendientes/admin-pendientes';
import { AdminGestionComponent } from './administrador/admin-gestion/admin-gestion';
import { AdminPerfilComponent } from './administrador/admin-perfil/admin-perfil';
import { ProfDashboardComponent } from './profesor/prof-dashboard/prof-dashboard';
import { DocumentosComponent } from './estudiante/est-documentos/est-documentos';

export const routes: Routes = [
    { path: '', component: LoginComponent },
    { path: 'est-dashboard', component: estDashboardComponent },
    { path: 'admin-dashboard', component: AdminDashboardComponent },
    { path: 'admin-pendientes', component: AdminPendientesComponent },
    { path: 'admin-gestion', component: AdminGestionComponent},
    { path: 'admin-perfil', component: AdminPerfilComponent},
    { path: 'prof-dashboard', component: ProfDashboardComponent },
    { path: 'est-documentos', component: DocumentosComponent}

];
