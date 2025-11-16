import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './app/interceptors/auth.interceptor';

bootstrapApplication(App, {
  providers: [
    provideHttpClient(
      withInterceptors([authInterceptor])
    )
  ]
});
