import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { lastValueFrom } from 'rxjs';
import { Translate } from './translate';

@Injectable({
  providedIn: 'root',
})
export class CitiesService extends Translate {
  private intervals: number[] = [];
  private timeouts: number[] = [];

  constructor(
    protected override http: HttpClient,
    protected override translate: TranslateService,
  ) {
    super(http, translate);
  }

  public async getCitiesForecast(now: number): Promise<void> {
    await this.getCitiesForecastDo().then((): Promise<any> => this.translateDateAndTime(now).then((): Promise<any> => this.getCitiesForecastTranslate(now)));
  }

  private async getCitiesForecastDo(): Promise<any> {
    await lastValueFrom(
      this.http.get('https://opendata.euskadi.eus/contenidos/prevision_tiempo/met_forecast/opendata/met_forecast.xml', { responseType: 'arraybuffer' }),
    )
      .then((data: ArrayBuffer): string => {
        const textDecoder: TextDecoder = new TextDecoder('ISO-8859-1');
        return textDecoder.decode(data);
      })
      .then((data: string): void => {
        const forecasts: any = new DOMParser().parseFromString(data, 'text/xml').getElementsByTagName('forecasts')[0];
        Array.from(forecasts.getElementsByTagName('forecast')).forEach((forecast: any): void => {
          const id: number = this.data.push({}) - 1;
          forecast.getAttributeNames().forEach((attribute: string) => (this.data[id][attribute] = forecast.getAttribute(attribute)));
          this.data[id]['cities'] = [];
          Array.from(forecast.getElementsByTagName('cityForecastDataList')[0].children).forEach((element: any, index: number): void => {
            this.data[id]['cities'][index] = {};
            element.getAttributeNames().forEach((attribute: string): void => {
              const attr: string = attribute === 'cityCode' ? 'code' : attribute === 'cityName' ? 'name' : attribute;
              this.data[id]['cities'][index][attr] = element.getAttribute(attribute);
            });
            Array.from(element.children).forEach(async (value: any): Promise<void> => {
              if (value.tagName === 'symbol') {
                Array.from(value.children).forEach((value: any): void => {
                  if (value.tagName === 'descriptions') {
                    this.data[id]['cities'][index]['description'] = {};
                    Array.from(value.children).forEach((value: any): void => {
                      this.data[id]['cities'][index]['description'][value.tagName] = value.textContent;
                    });
                  } else if (value.tagName === 'symbolImage') {
                    this.data[id]['cities'][index]['image'] = 'https://opendata.euskadi.eus' + value.textContent;
                  }
                });
                await this.translateMake(this.data[id]['cities'][index]['description'], (obj: any, src: string, dest: string = this.lang) =>
                  this.translateFetch(obj[src], src, dest).then((text: string | void): void => {
                    this.data[id]['cities'][index]['description'][dest] = text;
                  }),
                );
              } else {
                this.data[id]['cities'][index][value.tagName] = value.textContent;
              }
            });
          });
          this.data[id]['maps'] = [];
          Array.from(forecast.getElementsByTagName('mapSymbolList')[0].children).forEach((element: any, index: number): void => {
            this.data[id]['maps'][index] = {};
            Array.from(element.children).forEach((value: any): void => {
              if (value.tagName === 'symbolImage') {
                this.data[id]['maps'][index]['image'] = 'https://opendata.euskadi.eus' + value.textContent;
              } else {
                this.data[id]['maps'][index][value.tagName] = value.textContent;
              }
            });
          });
          this.icons.push({});
          this.icons[id]['image'] = 'https://opendata.euskadi.eus' + this.firstChild(forecast, 'imageMap');

          this.texts.push({});
          this.childTexts(Array.from(forecast.getElementsByTagName('description')), id, 'description');
        });
      })
      .catch((error: any) => console.error(error));
  }

  public async getCitiesForecastTranslate(item: number): Promise<any> {
    await this.translateText(item).then((): void => {
      const containerEl: HTMLElement = document.querySelector('.forecast');
      // First build map
      const htmlEl: HTMLDivElement = document.createElement('div');
      htmlEl.style.height = '436px';
      htmlEl.style.position = 'absolute';
      htmlEl.style.width = '437px';
      const imgEl = document.createElement('img');
      imgEl.setAttribute('height', '436');
      imgEl.setAttribute('src', this.icons[item]['image']);
      imgEl.setAttribute('title', this.data[item]['forecastDateText']);
      imgEl.setAttribute('width', '437');
      htmlEl.append(imgEl);
      this.data[item]['maps'].forEach((item: any): void => {
        const mapEl: HTMLDivElement = document.createElement('div');
        mapEl.style.height = '52px';
        mapEl.style.left = (item.positionX * 453.543364223).toString() + 'px';
        mapEl.style.position = 'absolute';
        mapEl.style.top = (item.positionY * 453.543364223).toString() + 'px';
        mapEl.style.width = '52px';
        const imgEl: HTMLImageElement = document.createElement('img');
        imgEl.height = 52;
        imgEl.width = 52;
        imgEl.setAttribute('src', item.image);
        mapEl.append(imgEl);
        htmlEl.append(mapEl);
      });
      containerEl.append(htmlEl);
      // Finally forecast texts
      const cbs: any[] = [];
      const descriptions = this.texts[item]['description'][this.lang].split('. ');
      this.timeouts.forEach((timeout: number): void => clearTimeout(timeout));
      descriptions.forEach((text: string, i: number): void => {
        if (text.trim() !== '') {
          const htmlEl: HTMLDivElement = document.createElement('div');
          htmlEl.className = 'forecast-detail';
          htmlEl.style.position = 'absolute';
          htmlEl.style.visibility = 'hidden';
          const textEl: HTMLSpanElement = document.createElement('span');
          textEl.textContent = text.lastIndexOf('.') === text.length - 1 ? text : text + '.';
          htmlEl.append(textEl);
          containerEl.append(htmlEl);
          htmlEl.style.top = (436 - htmlEl.offsetHeight).toString() + 'px';
          cbs.push(() =>
            this.timeouts.push(
              setTimeout((): void => {
                document.querySelectorAll('.forecast-detail').forEach((el: any): void => {
                  el.style.visibility = 'hidden';
                });
                htmlEl.style.visibility = 'visible';
              }, 5000 * i),
            ),
          );
        }
      });
      const cbs_run = () => cbs.forEach((cb) => (typeof cb === 'function' ? cb() : null));
      cbs_run();
      this.intervals.forEach((interval: number): void => clearInterval(interval));
      this.intervals.push(setInterval(() => cbs_run(), 5000 * descriptions.length));
    });
  }
}
