import THREE from 'lib/three';
import {Defer} from 'general/Defer';
import circle from 'editor/brushes/circle.png';

export const BRUSHES = {
  CIRCLE: {
    src: circle
  }
};

export class Canvas extends Defer {
  constructor(width = 0, height = 0) {
    super();
    this._canvas = document.createElement('canvas');
    this._canvas.width = width;
    this._canvas.height = height;
    this._context = this._canvas.getContext('2d');
    this._context.fillStyle = '#000000';
    this._context.fillRect(0, 0, width, height);
    this._context.globalCompositeOperation = 'lighter';

    this._brush = {
      type: BRUSHES.CIRCLE,
      size: height / 2,
      soft: 1
    };
    this._delta = 0;
    this._width = width;
    this._height = height;
    this._texture = new THREE.CanvasTexture(this._canvas);
    this._promise = brushesPromise;
    this._promise.then(this.setBrush.bind(this, BRUSHES.CIRCLE));
    document.body.appendChild(this._canvas);
  }

  getData() {
    return this._context.getImageData(0, 0, this._width, this._height);
  }

  getTexture() {
    return this._texture;
  }

  setSize(width, height) {
    this._brush.size = height * (this._brush.size / this._height);
    this._canvas.width = width;
    this._canvas.height = height;
  }

  setBrushSize(size) {
    this._brush.size = size * this._height;
  }

  setBrushSoft(soft) {
    this._brush.soft = soft;
  }

  setBrush(brush) {
    this._brush.type = brush;
  }

  draw(position, delta) {
    this._delta += delta;
    if (this._delta >= 50) {
      const {x, y} = position;
      this._texture.needsUpdate = true;
      this._context.globalAlpha = this._brush.soft * (this._delta / 1000);
      const size = this._brush.size;
      this._context.drawImage(
        this._brush.type.image,
        x * this._width - size / 2,
        y * this._height - size / 2,
        size,
        size
      );
      this._delta = 0;
    }
  }
}

const brushesPromise = new Promise(resolve => {
  const keys = Object.keys(BRUSHES);
  let promises = [];
  keys.forEach(key => {
    promises.push(
      new Promise(resolve => {
        const image = new Image();
        image.onload = resolve;
        image.src = BRUSHES[key].src;
        BRUSHES[key].image = image;
      })
    );
  });
  Promise.all(promises).then(resolve);
});