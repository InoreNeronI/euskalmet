// @see https://codepen.io/72lions/pen/nzdpWz
export class Particles {
  QUANTITY: number = 100;
  PARTICLE_SIZE: number = 10;
  CONTAINER: HTMLElement;
  context: CanvasRenderingContext2D;
  particles: Array<any>;
  document: Document;
  window: Window;

  constructor(document: Document) {
    this.document = document;
    // @see https://stackoverflow.com/a/52620181/16711967
    this.window = document.defaultView;
  }

  drawParticles(el: HTMLCanvasElement, container: HTMLElement): void {
    const CANVAS: HTMLCanvasElement = el;
    if (!!(CANVAS && CANVAS.getContext)) {
      this.context = CANVAS.getContext('2d');
      this.context.globalCompositeOperation = 'destination-over';
      // @see https://stackoverflow.com/a/51600005
      // @see https://stackoverflow.com/a/43505254/16711967
      this.window.addEventListener('resize', this.windowResizeHandler.bind(this), false);
      // @see https://christiankohler.net/how-to-use-resizeobserver-with-angular
      const observer: ResizeObserver = new ResizeObserver((entries: ResizeObserverEntry[]) => entries.forEach(this.windowResizeHandler.bind(this)));
      this.CONTAINER = container;
      observer.observe(this.CONTAINER);
      this.windowResizeHandler();
      this.createParticles();
      this.loop();
    }
  }

  windowResizeHandler(): void {
    this.context.canvas.width = this.CONTAINER.offsetWidth;
    this.context.canvas.height = this.CONTAINER.offsetHeight;
  }

  createParticles(): void {
    this.particles = [];
    const depth = 0;

    for (let i: number = 0; i < this.QUANTITY; i++) {
      const posX: number = this.PARTICLE_SIZE / 2 + Math.random() * (this.context.canvas.width - this.PARTICLE_SIZE / 2);
      const posY: number = this.PARTICLE_SIZE / 2 + Math.random() * (this.context.canvas.offsetHeight - this.PARTICLE_SIZE / 2);

      const speed = 2;
      const directionX: number = -speed + Math.random() * speed * 2;
      const directionY: number = -speed + Math.random() * speed * 2;

      this.particles.push({
        position: { x: posX, y: posY },
        size: this.PARTICLE_SIZE,
        directionX,
        directionY,
        speed,
        targetX: posX,
        targetY: posY,
        depth,
        index: i,
        fillColor: `#${((Math.random() * 0x00eaff + 0xff0000) | 0).toString(16)}`,
      });
    }
  }

  loop(): void {
    const theme: string = this.document.documentElement.getAttribute('data-bs-theme');
    this.context.fillStyle = theme === 'dark' ? 'rgba(33, 37, 41, 0.2)' : 'rgba(248, 249, 250, 0.2)';
    this.context.fillRect(0, 0, this.context.canvas.width, this.context.canvas.height);

    let z: number = 0;
    let x: number = 0;
    let y: number = 0;
    let dist: number = 0;

    for (let i: number = 0; i < this.particles.length; i++) {
      const particle: any = this.particles[i];

      const lp: { x: number; y: number } = { x: particle.position.x, y: particle.position.y };

      if (particle.position.x <= particle.size / 2 || particle.position.x >= this.context.canvas.width - this.PARTICLE_SIZE / 2) {
        particle.directionX *= -1;
      }

      if (particle.position.y <= particle.size / 2 || particle.position.y >= this.context.canvas.offsetHeight - this.PARTICLE_SIZE / 2) {
        particle.directionY *= -1;
      }

      for (let s: number = 0; s < this.particles.length; s++) {
        const bounceParticle = this.particles[s];
        if (bounceParticle.index !== particle.index) {
          // what are the distances
          z = this.PARTICLE_SIZE;
          x = Math.abs(bounceParticle.position.x - particle.position.x);
          y = Math.abs(bounceParticle.position.y - particle.position.y);
          dist = Math.sqrt(x ** 2 + y ** 2);
          if (dist < z) {
            this.randomiseDirection(particle);
            this.randomiseDirection(bounceParticle);
          }
        }
      }

      particle.position.x -= particle.directionX;
      particle.position.y -= particle.directionY;

      this.context.beginPath();
      this.context.fillStyle = particle.fillColor;
      this.context.lineWidth = particle.size;
      this.context.moveTo(lp.x, lp.y);
      this.context.arc(particle.position.x, particle.position.y, particle.size / 2, 0, Math.PI * 2, true);
      this.context.closePath();
      this.context.fill();
    }

    // @see https://stackoverflow.com/a/43505254/16711967
    this.window.requestAnimationFrame(this.loop.bind(this));
  }

  randomiseDirection(particle: any): void {
    // pick a random deg
    let d: number = 0;
    while (d === 0 || d === 90 || d === 180 || d === 360) {
      d = Math.floor(Math.random() * 360);
    }

    const r: number = (d * 180) / Math.PI;
    particle.directionX = Math.sin(r) * particle.speed;
    particle.directionY = Math.cos(r) * particle.speed;
  }
}
