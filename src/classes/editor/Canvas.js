import THREE from 'lib/three';
import {State} from 'general/State';
import {RangeNumber} from 'common/RangeNumber';
import circle from 'editor/brushes/circle.png';

export const BRUSHES = {
  CIRCLE: {
    src: circle
  }
};

const state = {
  soft: new RangeNumber(1, 0, 2),
  size: new RangeNumber(0.5, 0, 2)
};

export class Canvas extends State {
  constructor(width = 0, height = 0) {
    super(state);
    this._canvas = document.createElement('canvas');
    this._canvas.width = width;
    this._canvas.height = height;
    this._context = this._canvas.getContext('2d');
    this._context.fillStyle = '#888888';
    this._context.fillRect(0, 0, width, height);
    this._context.fillStyle = '#000000';
    this._context.fillRect(0, 0, width / 4, height / 4);
    this._context.fillStyle = '#ffffff';
    this._context.fillRect(width * 0.75, height * 0.75, width * 0.25, height * 0.25);
    this._context.globalCompositeOperation = 'lighter';

    this._brush = {
      type: BRUSHES.CIRCLE,
      size: height * state.size.value,
      soft: state.soft.value
    };
    this._delta = 0;
    this._width = width;
    this._height = height;
    this._texture = new THREE.CanvasTexture(this._canvas);
    this._promise = brushesPromise;
    this._promise.then(this.setBrush.bind(this, BRUSHES.CIRCLE));
    document.body.appendChild(this._canvas);
  }

  stateWillUpdate(state) {
    this._brush.soft = state.soft.value;
    this._brush.size = this._height * state.size.value;
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

  draw(position, delta, inverted = false) {
    this._delta += delta;
    if (this._delta >= 50) {
      const {x, y} = position;
      this._texture.needsUpdate = true;
      this._context.globalAlpha = this._brush.soft * (this._delta / 1000);
      const size = this._brush.size;
      inverted && this._invert();
      this._context.drawImage(
        this._brush.type.image,
        x * this._width - size / 2,
        y * this._height - size / 2,
        size,
        size
      );
      inverted && this._invert();
      this._delta = 0;
    }
  }

  _invert() {
    const pixels = this._context.getImageData(0, 0, this._width, this._height);
    for (let i = 0; i < pixels.data.length; i += 4) {
      for (let j = 0; j < 3; j++) {
        pixels.data[i + j] = 255 - pixels.data[i + j];
      }
    }
    this._context.putImageData(pixels, 0, 0);
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