export class Defer {
  constructor() {
    this._promise = Promise.resolve(this);
  }

  onLoad(callback) {
    return this._promise.then(callback);
  }
}