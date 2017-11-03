export class RangeNumber {
  constructor(value, min = -Infinity, max = Infinity, step) {

    if (value instanceof Array) {
      RangeNumber.call(this, value);
    } else {
      this._value = value;
      this._min = min;
      this._max = max;
      this._step = step;
    }
  }

  set value(value) {
    if (value >= this._min && value <= this._max) {
      this._value = value;
    }
  }

  get value() {
    return this._value;
  }

  get min() { return this._min; }
  get max() { return this._max; }
  get step() { return this._step; }

  getArray() {
    return [
      this._value,
      this._min,
      this._max,
      this._step
    ];
  }
}