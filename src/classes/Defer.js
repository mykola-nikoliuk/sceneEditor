export default class Defer {
  constructor() {
    this._promise = new Promise(resolve => resolve());
  }

  onLoad(callback) {
    return this._promise.then(callback);
  }
}