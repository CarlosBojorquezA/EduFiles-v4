import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { initializeApp } from 'firebase/app';
//import { AngularFireModule} from '@angular/fire/compat';
//import { AngularFirestoreModule} from '@angular/fire/compat/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDIjO8LB-EXmB11K4LYydDBDFFplHUbFHI",
  authDomain: "paqueteria-autentificacion.firebaseapp.com",
  projectId: "paqueteria-autentificacion",
  storageBucket: "paqueteria-autentificacion.firebasestorage.app",
  messagingSenderId: "269192440178",
  appId: "1:269192440178:web:c0d0e2a8d60e23336095eb"
};

initializeApp(firebaseConfig);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    //importProvidersFrom(
      //AngularFireModule.initializeApp(firebaseConfig),
      //AngularFirestoreModule)
  ]
};
