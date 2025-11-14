import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { EstDashboardComponent } from './estudiante/est-dashboard/est-dashboard';
import { EstDocumentosComponent } from './estudiante/est-documentos/est-documentos';
import { EstMaterialesComponent } from './estudiante/est-materiales/est-materiales';
import { EstProfesoresComponent } from './estudiante/est-profesores/est-profesores';
import { ChatProfesorComponent } from './estudiante/est-profesores-chat/est-profesores-chat';
import { EstPerfilComponent } from './estudiante/est-perfil/est-perfil';
import { AdminDashboardComponent } from './administrador/admin-dashboard/admin-dashboard';
import { AdminDocumentosComponent } from './administrador/admin-documentos/admin-documentos';
import { AdminGestionComponent } from './administrador/admin-gestion/admin-gestion';
import { AdminPerfilComponent } from './administrador/admin-perfil/admin-perfil';
import { ProfDashboardComponent } from './profesor/prof-dashboard/prof-dashboard';
import { ProfMaterialesComponent } from './profesor/prof-materiales/prof-materiales';
import { ProfEstudiantesComponent } from './profesor/prof-estudiantes/prof-estudiantes';
import { ProfChatEstudiantesComponent } from './profesor/prof-chat-estudiantes/prof-chat-estudiantes';
import { ProfPerfilComponent } from './profesor/prof-perfil/prof-perfil';

export const routes: Routes = [
    { path: '', component: LoginComponent }, // Ruta predeterminada Login
    { path: 'est-dashboard', component: EstDashboardComponent }, // Ruta de inicio del rol de estudiante
    { path: 'est-documentos', component: EstDocumentosComponent }, // Ruta de documentos del estudiante
    { path: 'est-materiales', component: EstMaterialesComponent }, // Ruta de materiales de apoyo del estudiante
    { path: 'est-profesores', component: EstProfesoresComponent }, // Ruta de los profesores asignados del estudiante 
    { path: 'est-profesores-chat', component: ChatProfesorComponent }, // Ruta del chat de los profesores con el estudiante
    { path: 'est-perfil', component: EstPerfilComponent }, // Ruta del perfil del estudiante
    { path: 'admin-dashboard', component: AdminDashboardComponent }, // Ruta de inicio del rol de administrador
    { path: 'admin-documentos', component: AdminDocumentosComponent }, // Ruta para la revision de documentos del administrador
    { path: 'admin-gestion', component: AdminGestionComponent }, // Ruta para la gestion de usuarios 
    { path: 'admin-perfil', component: AdminPerfilComponent }, // Ruta para el perfil del administrador
    { path: 'prof-dashboard', component: ProfDashboardComponent }, // Ruta de inicio del rol de profesor
    { path: 'prof-materiales', component: ProfMaterialesComponent }, // Ruta de materiales de apoyo que asigna el profesor
    { path: 'prof-estudiantes', component: ProfEstudiantesComponent }, // Ruta para la busqueda de alumnos en el rol de profesor
    { path: 'prof-chat-estudiantes', component: ProfChatEstudiantesComponent }, // Ruta para el chat con alumnos en el rol de profesor
    { path: 'prof-perfil', component: ProfPerfilComponent }, // Ruta del perfil del profesor
];
