import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { lastValueFrom } from 'rxjs';

export class Translate {
  public data: any[] = [];
  public icons: any[] = [];
  public lang: string;
  public texts: any[] = [];

  constructor(
    protected http: HttpClient,
    protected translate: TranslateService,
  ) {
    // constructor syntactic sugar
    this.lang = this.translate.currentLang;
  }

  protected childTexts(elements: any, id: number, tagName: string): void {
    Array.from(elements).forEach((element: any): void => {
      this.texts[id][tagName] = {};
      Array.from(element.children).forEach((text: any): void => {
        this.texts[id][tagName][text.tagName] = text.textContent;
      });
    });
  }

  protected firstChild(elements: any, tag: string, prop: string = 'textContent') {
    const children: HTMLCollectionOf<any> = elements.getElementsByTagName(tag);

    return children.length > 0 ? children[0][prop] : '';
  }

  protected timeExtract(str: string): string {
    return str.substring(str.lastIndexOf('[') + 1, str.lastIndexOf(']'));
  }

  protected async translateDo(index: number, key: string): Promise<any> {
    return this.translateMake(
      this.texts[index][key],
      async (obj: any, src: string, dest: string = this.lang): Promise<string | void> =>
        await this.translateFetch(obj[src], src, dest)
          .then((data: string | void): void => {
            this.texts[index][key][dest] = data;
          })
          .catch((error: any): void => console.error(error)),
    );
  }

  async translateDateAndTime(item: number, source: string = 'es', target: string = this.lang): Promise<any> {
    const promises: any[] = [];
    Object.keys(this.data[item]).forEach((key: string): void => {
      if (this.data[item][key] !== '') {
        if (key.endsWith('Date')) {
          promises.push(
            this.translateFetchDate(this.data[item][key], source, target).then((text: string | void): void => {
              this.data[item][key + 'Translated'] = text;
            }),
          );
        } else if (key.endsWith('Time')) {
          promises.push(
            this.translateFetchTime(this.data[item][key], source, target).then((text: string | void): void => {
              this.data[item][key + 'Translated'] = text;
            }),
          );
        }
      } else {
        console.log(key + ' is empty.');
      }
    });

    return Promise.all(promises);
  }

  protected translateMake(obj: {}, cb: Function): any {
    if (this.lang === 'en' && !obj.hasOwnProperty('en')) {
      if (obj.hasOwnProperty('es')) {
        return cb(obj, 'es');
      } else if (obj.hasOwnProperty('eu')) {
        return cb(obj, 'eu');
      } else if (obj.hasOwnProperty('fr')) {
        return cb(obj, 'fr');
      }
    } else if (this.lang === 'es' && !obj.hasOwnProperty('es')) {
      if (obj.hasOwnProperty('en')) {
        return cb(obj, 'en', 'es');
      } else if (obj.hasOwnProperty('eu')) {
        return cb(obj, 'eu', 'es');
      } else if (obj.hasOwnProperty('fr')) {
        return cb(obj, 'fr', 'es');
      }
    } else if (this.lang === 'eu' && !obj.hasOwnProperty('eu')) {
      if (obj.hasOwnProperty('en')) {
        return cb(obj, 'en', 'eu');
      } else if (obj.hasOwnProperty('es')) {
        return cb(obj, 'es', 'eu');
      } else if (obj.hasOwnProperty('fr')) {
        return cb(obj, 'fr', 'eu');
      }
    } else if (this.lang === 'fr' && !obj.hasOwnProperty('fr')) {
      if (obj.hasOwnProperty('en')) {
        return cb(obj, 'en', 'fr');
      } else if (obj.hasOwnProperty('es')) {
        return cb(obj, 'es', 'fr');
      } else if (obj.hasOwnProperty('eu')) {
        return cb(obj, 'eu', 'fr');
      }
    }
  }

  protected async translateText(item: number): Promise<any[]> {
    const promises: any[] = [];
    Object.keys(this.texts[item]).forEach((key: string) => promises.push(this.translateDo(item, key)));

    return await Promise.all(promises);
  }

  protected async translateFetch(text: string, source: string = 'auto', target: string = this.lang): Promise<string | void> {
    return lastValueFrom(this.http.get('https://api.beltza.eus/translate?source=' + source + '&target=' + target + '&text=' + text, { responseType: 'text' }));
  }

  protected async translateFetchDate(date: string, source: string, target: string = this.lang): Promise<string | void> {
    try {
      const response: Response = await fetch('https://api.beltza.eus/translate-date?date=' + date + '&source=' + source + '&target=' + target);
      return await response.text();
    } catch (error) {
      return console.error(error);
    }
  }

  protected async translateFetchTime(time: string, source: string, target: string = this.lang): Promise<string | void> {
    try {
      const response: Response = await fetch('https://api.beltza.eus/translate-time?time=' + time + '&source=' + source + '&target=' + target);
      return await response.text();
    } catch (error) {
      return console.error(error);
    }
  }
}
