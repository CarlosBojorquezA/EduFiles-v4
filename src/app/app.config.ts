import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { authInterceptor } from './interceptors/auth.interceptor';

const firebaseConfig = {
  apiKey: "AIzaSyDkGxOnEE6z9xdegyZxfVzmpZ9BM7NsHIA",
  authDomain: "edufiles-autentificacion.firebaseapp.com",
  projectId: "edufiles-autentificacion",
  storageBucket: "edufiles-autentificacion.firebasestorage.app",
  messagingSenderId: "847578842387",
  appId: "1:847578842387:web:f83293a157f807fcb186e6"
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    importProvidersFrom(
      AngularFireModule.initializeApp(firebaseConfig),
      AngularFirestoreModule
    )
  ]
};