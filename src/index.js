import baseDots from '../data/dot.json';

const bounds = [-180, -90, 180, 90];

export default class DotMatrixMap {
  constructor(target, options) {
    if (target === undefined) {
      throw new Error('target is undefined');
    }
    this.targetElement = typeof target === 'string' ? document.getElementById(target) : target;
    this.options = Object.assign({
      backgroundColor: 'rgba(0, 0, 0, 0)',
      baseDotColor: 'rgba(0, 0, 0, 0.75)',
      activeBaseDotColor: 'rgba(255, 255, 255, 0.5)',
      markSize: 6,
      markDotColor: 'rgba(255, 255, 255, 1)',
      activeMarkDotColor: 'rgba(0, 0, 0, 1)'
    }, options);
    this.eventMap = {};
    this.markDots = [];
    this.baseDotMap = {};
    this.markDotMap = {};
    window.requestAnimationFrame = this.requestAnimationFrame();
    this.execute();
  }
  addMarkDot(data) {
    data.forEach(item => {
      const { coordinate } = item;
      const positionX = Math.round(coordinate[0] - bounds[0]);
      const positionY = Math.round(bounds[3] - coordinate[1]);
      this.markDots.push({position: [positionX, positionY], ...item});
    });
  }
  execute() {
    this.canvas = this.createCanvas();
    this.addEvnets();
    const drawCanvas = () => {
      this.drawBaseDotMap();
      window.requestAnimationFrame(drawCanvas);
    };
    drawCanvas();
  }
  requestAnimationFrame() {
    return window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.oRequestAnimationFrame ||
      window.msRequestAnimationFrame ||
      function(callback) {
        window.setTimeout(callback, 1000 / 60);
      };
  }
  createCanvas() {
    const canvas = document.createElement('canvas');
    this.targetElement.appendChild(canvas);

    const targetWidth = this.targetElement.clientWidth;
    const targetHeight = targetWidth * 180 / 360;
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    return canvas;
  }
  addEvnets() {
    const { canvas } = this;
    canvas.addEventListener('mousemove', e => {
      const x = e.pageX - canvas.offsetLeft;
      const y = e.pageY - canvas.offsetTop;
      this.activeBaseDot = null;
      this.activeMarkDot = null;
      if(this.markDotMap && this.markDotMap[`${x},${y}`]) {
        this.canvas.style.cursor = 'pointer';
        this.activeMarkDot = this.markDotMap[`${x},${y}`];
      } else {
        this.canvas.style.cursor = 'default';
      }
      if (!this.activeMarkDot) {
        if(this.baseDotMap && this.baseDotMap[`${x},${y}`]) {
          this.canvas.style.cursor = 'pointer';
          this.activeBaseDot = this.baseDotMap[`${x},${y}`];
        } else {
          this.canvas.style.cursor = 'default';
        }
      }
      this.emit('mousemove', e, this.activeMarkDot);
    });
  }
  drawBaseDotMap() {
    const { canvas } = this;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    const { backgroundColor } = this.options;
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const scale = canvas.width / 360;
    const { baseDotColor, activeBaseDotColor } = this.options;
    baseDots.forEach(dot => {
      if(this.activeBaseDot && this.activeBaseDot === dot) {
        const size = Math.round(1.2 * scale);
        const x = Math.round((dot[0] * scale) - size / 2);
        const y = Math.round((dot[1] * scale) - size / 2);
        ctx.fillStyle = activeBaseDotColor;
        ctx.fillRect(x, y, size, size);
      } else {
        const size = Math.round(0.8 * scale);
        const x = Math.round((dot[0] * scale) - size / 2);
        const y = Math.round((dot[1] * scale) - size / 2);
        ctx.fillStyle = baseDotColor;
        ctx.fillRect(x, y, size, size);
        if (!this.baseDotMap[`${x},${y}`]) {
          for (let i = -2;i < size + 2; i++) {
            for (let j = -2;j < size + 2; j++) {
              this.baseDotMap[`${x + i},${y + j}`] = dot;
            }
          }
        }
      }
    });
    this.drawMarkDot();
  }
  drawMarkDot() {
    const { canvas, options } = this;
    const scale = canvas.width / 360;
    const { markDotColor, activeMarkDotColor } = this.options;
    this.markDots.forEach(dot => {
      const x = Math.round((dot.position[0] * scale) - options.markSize / 2);
      const y = Math.round((dot.position[1] * scale) - options.markSize / 2);
      if(this.activeMarkDot && this.activeMarkDot === dot) {
        this.drawStar(x, y, activeMarkDotColor);
      } else {
        this.drawStar(x, y, markDotColor);
        if (!this.markDotMap[`${x},${y}`]) {
          for (let i = 0;i < options.markSize; i++) {
            for (let j = 0;j < options.markSize; j++) {
              this.markDotMap[`${x + i},${y + j}`] = dot;
            }
          }
        }
      }
    });
  }
  drawStar(x, y, color) {
    const { canvas, options } = this;
    const ctx = canvas.getContext('2d');
    const horn = 5;
    const angle = 360 / horn;
    const R = options.markSize;
    const r = options.markSize / 2;
    ctx.beginPath();
    for (var i = 0; i < horn; i++) {
      ctx.lineTo(Math.cos((18 + i * angle) / 180 * Math.PI) * R + x, -Math.sin((18 + i * angle) / 180 * Math.PI) * R + y);
      ctx.lineTo(Math.cos((54 + i * angle) / 180 * Math.PI) * r + x, -Math.sin((54 + i * angle) / 180 * Math.PI) * r + y);
    }
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }
  on(type, callback) {
    let fns = (this.eventMap[type] = this.eventMap[type] || []);
    if (fns.indexOf(callback === -1)) {
      fns.push(callback);
    }
    return this;
  }
  off(type, callback) {
    let fns = this.eventMap[type];
    if (Array.isArray(fns)) {
      if (callback) {
        let index = fns.indexOf(callback);
        if (index !== -1) {
          fns.splice(index, 1);
        }
      } else {
        fns.length = 0;
      }
    }
    return this;
  }
  emit(eventName, event, data) {
    let fns = this.eventMap[eventName];
    if (Array.isArray(fns)) {
      fns.forEach((fn) => {
        fn(event, data);
      })
    }
    return this;
  }
};