import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { EstDashboardComponent } from './estudiante/est-dashboard/est-dashboard';
import { EstDocumentosComponent } from './estudiante/est-documentos/est-documentos';
import { EstProfesoresComponent } from './estudiante/est-profesores/est-profesores';
import { ChatProfesorComponent } from './estudiante/est-profesores-chat/est-profesores-chat';
import { EstPerfilComponent } from './estudiante/est-perfil/est-perfil';
import { AdminDashboardComponent } from './administrador/admin-dashboard/admin-dashboard';
import { AdminDocumentosComponent } from './administrador/admin-documentos/admin-documentos';
import { AdminGestionComponent } from './administrador/admin-gestion/admin-gestion';
import { AdminPerfilComponent } from './administrador/admin-perfil/admin-perfil';
import { ProfDashboardComponent } from './profesor/prof-dashboard/prof-dashboard';


export const routes: Routes = [
    { path: '', component: LoginComponent },
    { path: 'est-dashboard', component: EstDashboardComponent },
    { path: 'est-documentos', component: EstDocumentosComponent},
    { path: 'est-profesores', component: EstProfesoresComponent},
    { path: 'est-profesores-chat', component: ChatProfesorComponent},
    { path: 'est-perfil', component: EstPerfilComponent},
    { path: 'admin-dashboard', component: AdminDashboardComponent },
    { path: 'admin-documentos', component: AdminDocumentosComponent },
    { path: 'admin-gestion', component: AdminGestionComponent },
    { path: 'admin-perfil', component: AdminPerfilComponent },
    { path: 'prof-dashboard', component: ProfDashboardComponent }
    
];
