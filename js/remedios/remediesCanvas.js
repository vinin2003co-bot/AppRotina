export class RemedyJarCanvas {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas?.getContext('2d');
    this.pills = [];
    this.targetFillProgress = 0; // 0 a 1 (0% a 100%)
    this.currentFillProgress = 0;
    this.init();
  }

  init() {
    if (!this.canvas) return;
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.animate();
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
  }

  setProgress(percentage) {
    this.targetFillProgress = percentage / 100;
  }

  animate() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Suavização do preenchimento
    this.currentFillProgress += (this.targetFillProgress - this.currentFillProgress) * 0.05;

    const fillHeight = this.canvas.height * this.currentFillProgress;
    const fillTop = this.canvas.height - fillHeight;

    // Desenha o nível de fluido/líquido de pílulas transparente
    if (this.currentFillProgress > 0) {
      this.ctx.fillStyle = 'rgba(99, 102, 241, 0.15)'; // Indigo translúcido
      this.ctx.fillRect(0, fillTop, this.canvas.width, fillHeight);
    }

    requestAnimationFrame(() => this.animate());
  }
}
