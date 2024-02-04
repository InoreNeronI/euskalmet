import { CommonModule, DOCUMENT } from '@angular/common';
import { AfterViewInit, Component, Inject, Input, ViewChild } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CitiesComponent } from './components/cities/cities.component';
import { Particles } from './particles';
import { ParticlesDirective } from './particles.directive';
import { SeaComponent } from './components/sea/sea.component';
import { AreasComponent } from './components/areas/areas.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [AreasComponent, CitiesComponent, CommonModule, ParticlesDirective, SeaComponent, TranslateModule],
  templateUrl: 'app.component.html',
})
export class AppComponent extends Particles implements AfterViewInit {
  private canvasParticlesElement: HTMLCanvasElement;
  private languages: string[] = ['en', 'es', 'eu', 'fr'];
  protected now: number = 0;
  private title: string = 'euskalmet';

  // @see https://www.digitalocean.com/community/tutorials/angular-viewchild-access-component-es
  @ViewChild(ParticlesDirective)
  set particlesElement(directive: ParticlesDirective) {
    this.canvasParticlesElement = directive.element;
  }

  ngAfterViewInit(): void {
    this.drawParticles(this.canvasParticlesElement, this.canvasParticlesElement.parentElement);
  }

  nowAssign(now: number): void {
    this.now = now;
  }

  constructor(
    @Inject(DOCUMENT) public override document: Document,
    private title_platform: Title,
    private meta: Meta,
    public translate: TranslateService,
  ) {
    super(document);
    this.setLang();
    title_platform.setTitle(this.title);
    this.setMeta();
  }

  changeLang(lang: string): void {
    this.document.documentElement.lang = lang;
    this.translate.use(lang);
    this.setMeta();
  }

  getLang(): string {
    const lang: string = this.translate.getBrowserLang();
    if (this.languages.indexOf(lang) != -1) {
      return lang;
    }
    return this.languages[0];
  }

  isLang(lang: string): boolean {
    return this.translate.currentLang === lang;
  }

  setLang(): void {
    const lang: string = this.getLang();
    this.document.documentElement.lang = lang;
    this.translate.setDefaultLang(lang);
    this.translate.use(lang);
  }

  setMeta(): void {
    this.translate.get('DESCRIPTION').subscribe((text: string): void => {
      this.meta.updateTag({ name: 'description', content: text });
    });
  }
}
