import { Directive, ElementRef, Renderer2 } from '@angular/core';

// @see https://www.digitalocean.com/community/tutorials/angular-viewchild-access-component-es
@Directive({
  selector: '[particles-element]',
  standalone: true,
})
export class ParticlesDirective {
  element: HTMLCanvasElement;

  constructor(el: ElementRef, renderer: Renderer2) {
    this.element = renderer.createElement('canvas');
    this.element.classList.add('canvas-background');
    renderer.appendChild(el.nativeElement, this.element);
  }
}
