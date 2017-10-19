import THREE from 'lib/three';
import {Defer} from 'general/Defer';
import circle from 'editor/brushes/circle.png';
import {DataImage} from 'editor/DataImage';

export const BRUSHES = {
  CIRCLE: {
    src: circle
  }
};

export class Canvas extends Defer {
  constructor(width = 0, height = 0) {
    super();
    const brushSize = height;
    this._canvasDataImage = new DataImage(width, height, DataImage.ENUM.BW);
    this._brushDataImage = new DataImage(brushSize, brushSize, DataImage.ENUM.BW);

    this._canvas = document.createElement('canvas');
    this._canvas.width = width;
    this._canvas.height = height;
    this._context = this._canvas.getContext('2d');
    this._context.fillStyle = '#000000';
    this._context.fillRect(0, 0, width, height);
    this._context.globalCompositeOperation = 'lighter';

    this._brush = {
      type: BRUSHES.CIRCLE,
      size: height,
      soft: 1
    };
    this._width = width;
    this._height = height;
    this._texture = new THREE.CanvasTexture(this._canvas);
    this._promise = brushesPromise;
    this._promise.then(this.setBrush.bind(this, BRUSHES.CIRCLE));
    document.body.appendChild(this._canvas);
  }

  getTexture() {
    return this._texture;
  }

  // setSize(width, height) {
  //   this._brush.size = height * (this._brush.size / this._height);
  //   this._canvas.width = width;
  //   this._canvas.height = height;
  // }

  // setBrushSize(size) {
  //   this._brush.size = size * this._height;
  // }

  // setBrushSoft(soft) {
  //   this._brush.soft = soft;
  // }

  setBrush(brush) {
    this._brush.type = brush;
  }

  draw(position, delta) {
    const {x, y} = position;
    this._texture.needsUpdate = true;
    this._context.globalAlpha = this._brush.soft * (delta / 1000);
    const size = this._brush.size;
    this._context.drawImage(
      this._brush.type.image,
      x * this._width - size / 2,
      y * this._height - size / 2,
      size,
      size
    );

    const value = this._brush.soft * (delta / 1000);

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