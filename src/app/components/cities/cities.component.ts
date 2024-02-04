import { NgIf } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { CitiesService } from '../../services/cities.service';
import { LangChangeEvent, TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'cities',
  standalone: true,
  templateUrl: './cities.component.html',
  styleUrl: './cities.component.scss',
  imports: [NgIf, TranslateModule],
})
export class CitiesComponent implements OnChanges, OnInit {
  @Input() public now: number;
  protected nowDate: string;
  @Output() private nowEvent: EventEmitter<number> = new EventEmitter();

  constructor(
    private citiesService: CitiesService,
    private translate: TranslateService,
  ) {}

  private changesMade(): Promise<void> | void {
    if (this.citiesService.data[this.now]) {
      return this.citiesService
        .translateDateAndTime(this.now)
        .then((): Promise<any> => this.citiesService.getCitiesForecastTranslate(this.now))
        .then((): void => {
          this.nowDate = this.citiesService.data[this.now]['forecastDateTranslated'];
        });
    }
  }

  ngOnChanges(): Promise<void> | void {
    return this.changesMade();
  }

  ngOnInit(): void {
    this.citiesService.getCitiesForecast(this.now).then((): void => {
      this.nowDate = this.citiesService.data[this.now]['forecastDateTranslated'];
    });
    // @see https://stackoverflow.com/a/70632907/16711967
    this.translate.onLangChange.subscribe((event: LangChangeEvent): Promise<void> | void => {
      this.citiesService.lang = event.lang;
      return this.changesMade();
    });
  }

  nowItem(value: number): void {
    this.nowEvent.emit(value);
  }
}
