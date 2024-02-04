import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { lastValueFrom } from 'rxjs';
import { Translate } from './translate';

@Injectable({
  providedIn: 'root',
})
export class AreasService extends Translate {
  constructor(
    protected override http: HttpClient,
    protected override translate: TranslateService,
  ) {
    super(http, translate);
  }

  public async getAreasForecast(): Promise<void> {
    await lastValueFrom(
      this.http.get('https://opendata.euskadi.eus/contenidos/prevision_tiempo/met_forecast_zone/opendata/met_forecast_zone.xml', {
        responseType: 'arraybuffer',
      }),
    )
      .then((data: ArrayBuffer): string => {
        const textDecoder: TextDecoder = new TextDecoder('ISO-8859-1');
        return textDecoder.decode(data);
      })
      .then((data: string): void => {
        const forecasts: any = new DOMParser().parseFromString(data, 'text/xml').getElementsByTagName('areasForecast')[0];

        Array.from(forecasts.getElementsByTagName('areaForecast')).forEach((forecast: any): void => {
          const id: number = this.texts.push({}) - 1;
          forecast.getAttributeNames().forEach((attribute: string) => (this.texts[id][attribute] = forecast.getAttribute(attribute)));
          this.childTexts(forecast.getElementsByTagName('areaName'), id, 'areaDescription');
          Array.from(forecast.getElementsByTagName('periodDataList')[0].children).forEach((element: any): void => {
            if (element.getAttribute('periodDay') === 'today') {
              this.setAreasForecastNow(id, element, 0);
            } else if (element.getAttribute('periodDay') === 'tomorrow') {
              this.setAreasForecastNow(id, element, 1);
            }
          });
          delete this.texts[id];
        });
        delete this.texts;
      })
      .catch((error: any) => console.error(error));
  }

  public getAreasForecastNow(now: number): void {
    this.data[now].forEach((value: any, key: number): void => {
      Object.keys(value).forEach(async (attr: any): Promise<void> => {
        if (attr.endsWith('Description')) {
          await this.translateMake(this.data[now][key][attr], (obj: any, src: string, dest: string = this.lang) =>
            this.translateFetch(obj[src], src, dest).then((text: string | void): void => {
              this.data[now][key][attr][dest] = text;
            }),
          );
        }
      });
    });
  }

  private setAreasForecastNow(id: number, area: any, now: number): void {
    if (!this.data[now]) {
      this.data[now] = [];
    }
    this.data[now].push(this.texts[id]);
    this.data[now][id]['periodDate'] = area.getAttribute('periodDate');
    Array.from(area.getElementsByTagName('areaForecastData')[0].children).forEach((areaForecast: any): void => {
      if (areaForecast.nodeName === 'forecastDescription') {
        this.data[now][id]['forecastDescription'] = {};
        Array.from(areaForecast.children).forEach((text: any): void => {
          this.data[now][id]['forecastDescription'][text.nodeName] = text.textContent;
        });
      } else {
        Array.from(areaForecast.children).forEach((element: any): void => {
          if (element.nodeName.endsWith('Image')) {
            this.data[now][id][areaForecast.nodeName] = 'https://opendata.euskadi.eus' + element.textContent;
          } else if (element.nodeName === 'descriptions') {
            this.data[now][id][areaForecast.nodeName + 'Description'] = {};
            Array.from(element.children).forEach((text: any): void => {
              this.data[now][id][areaForecast.nodeName + 'Description'][text.nodeName] = text.textContent;
            });
          }
        });
      }
    });
  }
}
