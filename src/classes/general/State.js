import {Defer} from 'general/Defer';

//todo: State is not a Defer, remove after creating multiple inheritance
export class State extends Defer {
  constructor(state = {}) {
    super();
    this._state = state;
  }

  setState(state) {
    const newState = {};
    Object.assign(newState, this._state, state);
    this.stateWillUpdate(newState, this._state);
    this._state = state;
    return this;
  }

  getState() {
    return this._state;
  }

  stateWillUpdate() {
    // should be overridden
  }
}