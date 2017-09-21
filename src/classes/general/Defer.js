export class Defer {
  constructor() {
    this._promise = new Promise(resolve => resolve(this));
  }

  onLoad(callback) {
    return this._promise.then(callback);
  }
}