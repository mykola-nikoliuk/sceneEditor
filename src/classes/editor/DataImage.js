import {Pixel5} from 'editor/Pixel5';

export class DataImage {
  constructor(width, height, type = DataImage.ENUM.RGBA) {
    /**
     * @type {Pixel5[][]}
     * @private
     */
    this._pixels = [];
    this._width = width;
    this._height = height;
    for (let y = 0; y < height; y++) {
      const row = [];
      for (let x = 0; x < width; x++) {
        row.push(new Pixel5(type));
      }
      this._pixels.push(row);
    }
  }

  /**
   * Draw image
   * @param {DataImage} dataImage
   * @param {number} x
   * @param {number} y
   * @param {number} channel
   */
  drawToChannel(dataImage, x, y, channel) {
    dataImage._pixels.forEach((row, rowIndex) => {
      row.forEach((pixel, columnIndex) => {
        const _x = x + columnIndex;
        const _y = y + rowIndex;
        if (this._isInRange(_x, _y)) {
          this._pixels[_y][_x].addToChannel(channel, pixel.channels[Pixel5.ENUM.BW]);
        }
      });
    });
  }

  _isInRange(x, y) {
    return x < this._width && y < this._height && x >= 0 && y >= 0;
  }
}

DataImage.ENUM = {
  BW: 1,
  BW_ALPHA: 2,
  RGB: 3,
  RGBA: 4,
  RGBA_REST: 5
};