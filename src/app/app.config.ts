import { HttpClient, provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { provideToastr } from 'ngx-toastr';

import { LazyTranslateLoader } from './loaders/translate.loader';

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useClass: LazyTranslateLoader,
          deps: [HttpClient],
        },
      }),
    ),
    provideAnimations(),
    provideHttpClient(),
    provideToastr(),
  ],
};
