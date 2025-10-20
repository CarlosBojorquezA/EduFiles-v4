import { Routes } from '@angular/router';
import { Login } from './login/login';
import { estDashboardComponent } from './estudiante/est-dashboard/est-dashboard';
import { AdminDashboardComponent } from './administrador/admin-dashboard/admin-dashboard';
import { ProfDashboardComponent } from './profesor/prof-dashboard/prof-dashboard';

export const routes: Routes = [
    { path: '', component: Login },
    { path: 'est-dashboard', component: estDashboardComponent },
    { path: 'admin-dashboard', component: AdminDashboardComponent },
    { path: 'prof-dashboard', component: ProfDashboardComponent }

];
