import mapValues from 'lodash/mapValues';
import {EventEmitter} from '../general/EventEmitter';

export const KEY_CODES = {
  37: 'LEFT',
  38: 'UP',
  39: 'RIGHT',
  40: 'DOWN',
  87: 'W',
  83: 'S',
  16: 'SHIFT',
  17: 'CTRL',
  18: 'ALT',
  46: 'DELETE'
};

function turnOff(state, {keyCode}) {
  if (typeof KEY_CODES[keyCode] === 'string') {
    state[KEY_CODES[keyCode]] = false;
  }
}

function turnOn(state, {keyCode}) {
  if (typeof KEY_CODES[keyCode] === 'string') {
    state[KEY_CODES[keyCode]] = true;
    this.emit(KEY_CODES[keyCode]);
  }
}

class Keyboard extends EventEmitter {
  constructor() {
    super();
    this._state = {};

    mapValues(KEY_CODES, value => {
      this._state[value] = false;
    });

    document.addEventListener('keydown', turnOn.bind(this, this._state));
    document.addEventListener('keyup', turnOff.bind(this, this._state));
  }

  get state() {
    return this._state;
  }
}

export default new Keyboard();