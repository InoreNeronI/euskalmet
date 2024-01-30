import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { LangChangeEvent, TranslateModule, TranslateService } from '@ngx-translate/core';
import { SeaService } from '../../services/sea.service';

@Component({
  selector: 'sea',
  standalone: true,
  templateUrl: './sea.component.html',
  styleUrl: './sea.component.scss',
  imports: [TranslateModule],
})
export class SeaComponent implements OnChanges, OnInit {
  @Input() public now: number;

  constructor(
    private seaService: SeaService,
    private translate: TranslateService,
  ) {}

  private changesMade(): Promise<void> | void {
    if (this.seaService.data[this.now]) {
      return this.seaService.translateDateAndTime(this.now).then((): Promise<any> => this.seaService.getSeaForecastTranslate(this.now));
    }
  }

  ngOnChanges(): Promise<void> | void {
    return this.changesMade();
  }

  ngOnInit(): void {
    this.seaService.getSeaForecast(this.now).then((): void => {});
    // @see https://stackoverflow.com/a/70632907/16711967
    this.translate.onLangChange.subscribe((event: LangChangeEvent): Promise<void> | void => {
      this.seaService.lang = event.lang;
      return this.changesMade();
    });
  }
}
