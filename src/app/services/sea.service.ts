import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { lastValueFrom } from 'rxjs';
import { Translate } from './translate';

@Injectable({
  providedIn: 'root',
})
export class SeaService extends Translate {
  constructor(
    protected override http: HttpClient,
    protected override translate: TranslateService,
  ) {
    super(http, translate);
  }

  public async getSeaForecast(now: number): Promise<void> {
    await this.getSeaForecastDo().then((): Promise<any> => this.translateDateAndTime(now).then((): Promise<any> => this.getSeaForecastTranslate(now)));
  }

  private async getSeaForecastDo(): Promise<any> {
    await lastValueFrom(
      this.http.get('https://opendata.euskadi.eus/contenidos/prevision_maritima/sea_forecast/opendata/sea_forecast.xml', { responseType: 'arraybuffer' }),
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
          this.data[id]['moonPhaseCode'] = this.firstChild(forecast, 'moonPhaseCode');
          this.data[id]['waterTemperature'] = this.firstChild(forecast, 'waterTemperature');
          this.data[id]['waveHeight'] = this.firstChild(forecast, 'waveHeight');

          this.data[id]['moonRisingTime'] = this.timeExtract(this.firstChild(forecast, 'moonRisingTime'));
          this.data[id]['moonSetTime'] = this.timeExtract(this.firstChild(forecast, 'moonSetTime'));
          this.data[id]['sunRisingTime'] = this.timeExtract(this.firstChild(forecast, 'sunRisingTime'));
          this.data[id]['sunSetTime'] = this.timeExtract(this.firstChild(forecast, 'sunSetTime'));

          this.data[id]['firstHighTide'] = this.firstChild(forecast, 'firstHighTide');
          this.data[id]['secondHighTide'] = this.firstChild(forecast, 'secondHighTide');
          this.data[id]['firstHighTideTime'] = this.timeExtract(this.firstChild(forecast, 'firstHighTideTime'));
          this.data[id]['secondHighTideTime'] = this.timeExtract(this.firstChild(forecast, 'secondHighTideTime'));
          this.data[id]['firstLowTide'] = this.firstChild(forecast, 'firstLowTide');
          this.data[id]['secondLowTide'] = this.firstChild(forecast, 'secondLowTide');
          this.data[id]['firstLowTideTime'] = this.timeExtract(this.firstChild(forecast, 'firstLowTideTime'));
          this.data[id]['secondLowTideTime'] = this.timeExtract(this.firstChild(forecast, 'secondLowTideTime'));

          this.icons.push({});
          this.icons[id]['moonPhase'] = 'https://opendata.euskadi.eus' + this.firstChild(forecast, 'moonPhaseIcon');
          this.icons[id]['wave'] = 'https://opendata.euskadi.eus' + this.firstChild(forecast, 'waveIcon');
          this.icons[id]['wind'] = 'https://opendata.euskadi.eus' + this.firstChild(forecast, 'windIcon');

          this.texts.push({});
          this.texts[id]['synopsis'] = { eu: this.firstChild(forecast, 'synopticalDescription') };
          this.texts[id]['visibility'] = { es: this.firstChild(forecast, 'visibility') };
          this.childTexts(forecast.getElementsByTagName('forecastDescription'), id, 'description');
          this.childTexts(forecast.getElementsByTagName('moonPhase'), id, 'moonPhase');
        });
      })
      .catch((error: any) => console.error(error));
  } /*

    let date: Date = new Date();
    const options: Intl.DateTimeFormatOptions = {
      month: 'numeric',
      day: 'numeric',
      year: '2-digit',
    };
    glob.now = 'today';
    glob.today = date.toLocaleDateString('en', options);
    date.setDate(date.getDate() + 1);
    glob.tomorrow = date.toLocaleString('en', options);
    date.setDate(date.getDate() + 1);
    glob.next = date.toLocaleString('en', options);

    console.log(glob.now, glob.today, glob.tomorrow, glob.next);*/

  async getSeaForecastTranslate(item: number): Promise<any> {
    await this.translateText(item).then((): void => {
      /*if (this.days.hasOwnProperty(glob.now)) {
          const data = this.days[glob.now]['data'];*/
      document
        .querySelector('.navbar-brand')
        .setAttribute(
          'title',
          this.translate.instant('SUN_RISING') +
            ': ' +
            this.data[item]['sunRisingTimeTranslated'] +
            '\n' +
            this.translate.instant('SUN_SET') +
            ': ' +
            this.data[item]['sunSetTimeTranslated'],
        );
      const htmlEl: HTMLSpanElement = document.createElement('span');
      const imgEl: HTMLImageElement = document.createElement('img');
      imgEl.setAttribute('title', this.data[item]['periodDateTranslated']);
      const iEl: HTMLImageElement = document.createElement('img');
      // Slider
      const sliderItems: NodeListOf<Element> = document.querySelectorAll('.slider-item');
      // Slider0. Date & Sun times
      // Slider0. Sunrise time
      htmlEl.textContent = this.data[item]['sunRisingTimeTranslated'];
      iEl.setAttribute('title', this.translate.instant('SUN_RISING'));
      iEl.src = 'https://material-icons.github.io/material-icons/svg/wb_sunny/baseline.svg';
      sliderItems[0].innerHTML = '&nbsp;' + iEl.outerHTML + htmlEl.outerHTML + '&nbsp;';
      // Slider0. Sunset time
      htmlEl.textContent = this.data[item]['sunSetTimeTranslated'];
      iEl.setAttribute('title', this.translate.instant('SUN_SET'));
      iEl.src = 'https://material-icons.github.io/material-icons/svg/nights_stay/baseline.svg';
      sliderItems[0].innerHTML += '&nbsp;' + iEl.outerHTML + htmlEl.outerHTML + '&nbsp;';
      // Slider1. High tides time
      htmlEl.textContent =
        this.data[item]['firstHighTideTimeTranslated'] +
        ' (' +
        this.data[item]['firstHighTide'] +
        'm) | ' +
        this.data[item]['secondHighTideTimeTranslated'] +
        ' (' +
        this.data[item]['secondHighTide'] +
        'm)';
      iEl.setAttribute('title', this.translate.instant('HIGH_TIDE'));
      iEl.src = 'https://material-icons.github.io/material-icons/svg/waves/baseline.svg';
      sliderItems[1].innerHTML = iEl.outerHTML + '&nbsp;' + htmlEl.outerHTML;
      // Slider1. Low tides time
      htmlEl.textContent =
        this.data[item]['firstLowTideTimeTranslated'] +
        ' (' +
        this.data[item]['firstLowTide'] +
        'm) | ' +
        this.data[item]['secondLowTideTimeTranslated'] +
        ' (' +
        this.data[item]['secondLowTide'] +
        'm)';
      iEl.setAttribute('title', this.translate.instant('LOW_TIDE'));
      iEl.src = 'https://material-icons.github.io/material-icons/svg/pool/baseline.svg';
      sliderItems[1].innerHTML += '&nbsp;' + iEl.outerHTML + '&nbsp;' + htmlEl.outerHTML;
      // Slider2. Synopsis
      htmlEl.textContent = this.texts[item]['synopsis'][this.lang];
      sliderItems[2].innerHTML = htmlEl.outerHTML;
      // Slider3. Wind
      imgEl.setAttribute('src', this.icons[item]['wind']);
      imgEl.height = 32;
      imgEl.width = 32;
      htmlEl.textContent = this.texts[item]['description'][this.lang];
      sliderItems[3].innerHTML = imgEl.outerHTML + '&nbsp;' + htmlEl.outerHTML;
      // Slider4. Waves
      imgEl.setAttribute('src', this.icons[item]['wave']);
      htmlEl.textContent = this.translate.instant('WAVE_HEIGHT') + ': ' + this.data[item]['waveHeight'] + 'm';
      sliderItems[4].innerHTML = imgEl.outerHTML + '&nbsp;' + htmlEl.outerHTML;
      htmlEl.textContent = '| ' + this.translate.instant('WATER_TEMPERATURE') + ': ' + this.data[item]['waterTemperature'] + '°C';
      sliderItems[4].innerHTML += '&nbsp;' + htmlEl.outerHTML;
      htmlEl.textContent = '| ' + this.translate.instant('VISIBILITY') + ': ' + this.texts[item]['visibility'][this.lang];
      sliderItems[4].innerHTML += '&nbsp;' + htmlEl.outerHTML;
      // Slider5. Moon
      imgEl.setAttribute('src', this.icons[item]['moonPhase']);
      htmlEl.textContent = this.texts[item]['moonPhase'][this.lang];
      sliderItems[5].innerHTML = imgEl.outerHTML + '&nbsp;' + htmlEl.outerHTML;
      htmlEl.textContent = '| ' + this.translate.instant('MOON_RISING') + ': ' + this.data[item]['moonRisingTimeTranslated'];
      sliderItems[5].innerHTML += '&nbsp;' + htmlEl.outerHTML;
      htmlEl.textContent = '| ' + this.translate.instant('MOON_SET') + ': ' + this.data[item]['moonSetTimeTranslated'];
      sliderItems[5].innerHTML += '&nbsp;' + htmlEl.outerHTML;
      // Finally start animation
      // @see https://medium.com/better-programming/how-to-restart-a-css-animation-with-javascript-and-what-is-the-dom-reflow-a86e8b6df00f
      sliderItems.forEach((item: any): void => {
        item.classList.add('animate');
        /*Array.from(item.querySelectorAll('i')).forEach((icon: any): void => {
            htmlEl.className = 'tooltip';
            htmlEl.textContent = icon.getAttribute('title');
            htmlEl.style.fontSize = '0.65rem';
            htmlEl.style.position = 'absolute';
            htmlEl.style.top = '5%';
            htmlEl.style.visibility = 'hidden';
            icon.insertAdjacentHTML('beforeend', htmlEl.outerHTML);
            setTimeout((): string => (icon.querySelector('.tooltip').style.visibility = 'visible'), 3250);
          });*/
      }); /*
        } else {
            errorEl.className = 'warning';
            errorEl.textContent = this.translate.instant('NO_DATA;
        }*/
    });

    console.log(this.data, this.icons, this.texts);
  }
}
