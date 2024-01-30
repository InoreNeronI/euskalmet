import { Component, Input, OnInit } from '@angular/core';
import { LangChangeEvent, TranslateModule, TranslateService } from '@ngx-translate/core';
import { SeaService } from '../../services/sea.service';

@Component({
  selector: 'sea',
  standalone: true,
  templateUrl: './sea.component.html',
  styleUrl: './sea.component.scss',
  imports: [TranslateModule],
})
export class SeaComponent implements OnInit {
  @Input() now: number = 0;

  constructor(
    private seaService: SeaService,
    private translate: TranslateService,
  ) {}

  ngOnInit(): void {
    this.seaService.getSeaForecast(this.now).then((): void => {});
    // @see https://stackoverflow.com/a/70632907/16711967
    this.translate.onLangChange.subscribe((event: LangChangeEvent): Promise<void> | void => {
      this.seaService.lang = event.lang;
      if (this.seaService.data[this.now]) {
        return this.seaService.translateDateAndTime(this.now).then((): Promise<any> => this.seaService.getSeaForecastTranslate(this.now));
      }
    });
  }
}
