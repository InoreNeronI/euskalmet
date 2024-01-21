import { HttpClient } from '@angular/common/http';
import { isDevMode } from '@angular/core';
import { TranslateLoader } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

// @see https://stackoverflow.com/a/76020552
const DEFAULT_LANG = 'en';

export class LazyTranslateLoader implements TranslateLoader {
  constructor(
    private http: HttpClient,
    // @see https://stackoverflow.com/a/67717547/16711967
    private prefix: string = isDevMode() ? '/assets/i18n/' : '/monaco/assets/i18n/',
    private suffix: string = '.json',
  ) {}

  /**
   * Gets the translations from the server
   */
  public getTranslation(lang: string): Observable<Object> {
    return this.http.get(`${this.prefix}${lang}${this.suffix}`).pipe(catchError(() => this.http.get(`${this.prefix}${DEFAULT_LANG}${this.suffix}`)));
  }
}
