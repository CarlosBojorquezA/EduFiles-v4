import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { EstDashboardComponent } from './estudiante/est-dashboard/est-dashboard';
import { EstDocumentosComponent } from './estudiante/est-documentos/est-documentos';
import { EstMaterialesComponent } from './estudiante/est-materiales/est-materiales';
import { EstProfesoresComponent } from './estudiante/est-profesores/est-profesores';
import { EstProfesoresChatComponent } from './estudiante/est-profesores-chat/est-profesores-chat';
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

import { requireAuthGuard } from './guards/auth.guard';
import { estudianteGuard } from './guards/estudiante.guard';
import { profesorGuard } from './guards/profesor.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
    { path: '', component: LoginComponent },
    
    // Rutas de Estudiante (con guards)
    { 
        path: 'est-dashboard', 
        component: EstDashboardComponent,
        canActivate: [requireAuthGuard, estudianteGuard]
    },
    { 
        path: 'est-documentos', 
        component: EstDocumentosComponent,
        canActivate: [requireAuthGuard, estudianteGuard]
    },
    { 
        path: 'est-materiales', 
        component: EstMaterialesComponent,
        canActivate: [requireAuthGuard, estudianteGuard]
    },
    { 
        path: 'est-profesores', 
        component: EstProfesoresComponent,
        canActivate: [requireAuthGuard, estudianteGuard]
    },
    { 
        path: 'est-profesores-chat/:id', 
        component: EstProfesoresChatComponent,
        canActivate: [requireAuthGuard, estudianteGuard]
    },
    { 
        path: 'est-perfil', 
        component: EstPerfilComponent,
        canActivate: [requireAuthGuard, estudianteGuard]
    },
    
    // Rutas de Administrador (con guards)
    { 
        path: 'admin-dashboard', 
        component: AdminDashboardComponent,
        canActivate: [requireAuthGuard, adminGuard]
    },
    { 
        path: 'admin-documentos', 
        component: AdminDocumentosComponent,
        canActivate: [requireAuthGuard, adminGuard]
    },
    { 
        path: 'admin-gestion', 
        component: AdminGestionComponent,
        canActivate: [requireAuthGuard, adminGuard]
    },
    { 
        path: 'admin-perfil', 
        component: AdminPerfilComponent,
        canActivate: [requireAuthGuard, adminGuard]
    },
    
    // Rutas de Profesor (con guards)
    { 
        path: 'prof-dashboard', 
        component: ProfDashboardComponent,
        canActivate: [requireAuthGuard, profesorGuard]
    },
    { 
        path: 'prof-materiales', 
        component: ProfMaterialesComponent,
        canActivate: [requireAuthGuard, profesorGuard]
    },
    { 
        path: 'prof-estudiantes', 
        component: ProfEstudiantesComponent,
        canActivate: [requireAuthGuard, profesorGuard]
    },
    { 
        path: 'prof-chat-estudiantes', 
        component: ProfChatEstudiantesComponent,
        canActivate: [requireAuthGuard, profesorGuard]
    },
    { 
        path: 'prof-perfil', 
        component: ProfPerfilComponent,
        canActivate: [requireAuthGuard, profesorGuard]
    },
    
    // Redirect por defecto
    { path: '**', redirectTo: '' }
];
