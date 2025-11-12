import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { initializeApp } from 'firebase/app';
import { AngularFireModule} from '@angular/fire/compat';
import { AngularFirestoreModule} from '@angular/fire/compat/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDkGxOnEE6z9xdegyZxfVzmpZ9BM7NsHIA",
  authDomain: "edufiles-autentificacion.firebaseapp.com",
  projectId: "edufiles-autentificacion",
  storageBucket: "edufiles-autentificacion.firebasestorage.app",
  messagingSenderId: "847578842387",
  appId: "1:847578842387:web:f83293a157f807fcb186e6"
};

initializeApp(firebaseConfig);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    importProvidersFrom(
      AngularFireModule.initializeApp(firebaseConfig),
      AngularFirestoreModule)
  ]
};
