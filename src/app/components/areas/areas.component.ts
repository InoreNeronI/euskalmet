import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { AreasService } from '../../services/areas.service';
import { NgClass, NgForOf } from '@angular/common';

@Component({
  selector: 'areas',
  standalone: true,
  imports: [NgClass, NgForOf],
  templateUrl: './areas.component.html',
  styleUrl: './areas.component.scss',
})
export class AreasComponent implements OnChanges, OnInit {
  @Input() now!: number;
  protected selectedTab: string = '1';

  constructor(
    protected areasService: AreasService,
    private translate: TranslateService,
  ) {}

  private changesMade(): Promise<void> | void {
    if (this.areasService.data[this.now]) {
      return this.areasService.getAreasForecastNow(this.now);
    }
  }

  ngOnChanges(): Promise<void> | void {
    return this.changesMade();
  }

  ngOnInit(): void {
    this.areasService.getAreasForecast().then((): void => this.areasService.getAreasForecastNow(this.now));
    // @see https://stackoverflow.com/a/70632907/16711967
    this.translate.onLangChange.subscribe((event: LangChangeEvent): Promise<void> | void => {
      this.areasService.lang = event.lang;
      return this.changesMade();
    });
  }

  setCurrentNav(id: string): void {
    this.selectedTab = id;
  }
}
