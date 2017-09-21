export class EventEmitter {
  constructor() {
    this._subscribers = {};
  }

  emit(type, msg) {
    if (this._subscribers[type]) {
      this._subscribers[type].forEach(callback => callback(msg));
    }
  }

  on(type, callback) {
    if (!this._subscribers[type]) {
      this._subscribers[type] = [];
    }
    this._subscribers[type].push(callback);
    return this._off.bind(this, type, callback);
  }

  _off(type, callback) {
    this._subscribers[type].splice(this._subscribers[type].indexOf(callback), 1);
  }
}