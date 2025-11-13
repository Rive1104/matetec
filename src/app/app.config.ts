// matetec/src/app/app.config.ts

import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, importProvidersFrom } from '@angular/core'; // <-- 1. Añadir importProvidersFrom
import { provideRouter } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms'; // <-- 2. Importar ReactiveFormsModule

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    
    // <-- 3. Añadir esto para los formularios reactivos -->
    importProvidersFrom(ReactiveFormsModule)
  ]
};