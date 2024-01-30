import { Component, Input, OnInit } from '@angular/core';
import { CitiesService } from '../../services/cities.service';
import { LangChangeEvent, TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'cities',
  standalone: true,
  templateUrl: './cities.component.html',
  styleUrl: './cities.component.scss',
  imports: [TranslateModule],
})
export class CitiesComponent implements OnInit {
  @Input() now: number = 0;
  nowDate: string;

  constructor(
    private citiesService: CitiesService,
    private translate: TranslateService,
  ) {}

  ngOnInit(): void {
    this.citiesService.getCitiesForecast(this.now).then((): void => {
      this.nowDate = this.citiesService.data[this.now]['forecastDateTranslated'];
    });
    // @see https://stackoverflow.com/a/70632907/16711967
    this.translate.onLangChange.subscribe((event: LangChangeEvent): Promise<void> | void => {
      this.citiesService.lang = event.lang;
      if (this.citiesService.data[this.now]) {
        return this.citiesService
          .translateDateAndTime(this.now)
          .then((): Promise<any> => this.citiesService.getCitiesForecastTranslate(this.now))
          .then((): void => {
            this.nowDate = this.citiesService.data[this.now]['forecastDateTranslated'];
          });
      }
    });
  }
}
