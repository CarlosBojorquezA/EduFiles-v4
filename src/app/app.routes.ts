import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { estDashboardComponent } from './estudiante/est-dashboard/est-dashboard';
import { AdminDashboardComponent } from './administrador/admin-dashboard/admin-dashboard';
import { ProfDashboardComponent } from './profesor/prof-dashboard/prof-dashboard';
import { DocumentosComponent } from './estudiante/est-documentos/est-documentos';

export const routes: Routes = [
    { path: '', component: LoginComponent },
    { path: 'est-dashboard', component: estDashboardComponent },
    { path: 'admin-dashboard', component: AdminDashboardComponent },
    { path: 'prof-dashboard', component: ProfDashboardComponent },
    { path: 'est-documentos', component: DocumentosComponent}

];
