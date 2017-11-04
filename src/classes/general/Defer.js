import {EventEmitter} from 'general/EventEmitter';

export class Defer extends EventEmitter {
  constructor() {
    super();
    this._promise = Promise.resolve(this);
  }

  onLoad(callback) {
    return this._promise.then(callback);
  }
}