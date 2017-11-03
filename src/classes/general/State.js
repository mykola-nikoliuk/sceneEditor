import {Defer} from 'general/Defer';

//todo: State is not a Defer, remove after creating multiple inheritance
export class State extends Defer {
  constructor(state = {}) {
    super();
    this._state = state;
  }

  setState(state) {
    Object.extend(this._state, state);
    this.stateWillUpdate(this._state);
    return this;
  }

  getState() {
    return this._state;
  }

  stateWillUpdate() {
    // should be overridden
  }
}