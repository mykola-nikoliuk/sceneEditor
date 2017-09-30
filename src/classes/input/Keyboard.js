import mapValues from 'lodash/mapValues';
import {EventEmitter} from '../general/EventEmitter';

export const KEY_CODES = {
  37: 'LEFT',
  38: 'UP',
  39: 'RIGHT',
  40: 'DOWN',
  87: 'W',
  16: 'SHIFT',
  17: 'CTRL',
  18: 'ALT',
  46: 'DELETE',
  84: 'T',
  83: 'S',
  82: 'R',
  67: 'C',
  27: 'ESC'
};

function turnOff(state, {keyCode}) {
  if (typeof KEY_CODES[keyCode] === 'string') {
    state[KEY_CODES[keyCode]] = false;
  }
  console.log('key up:', keyCode);
}

function turnOn(state, {keyCode}) {
  if (typeof KEY_CODES[keyCode] === 'string') {
    state[KEY_CODES[keyCode]] = true;
    this.emit(KEY_CODES[keyCode]);
  }
  console.log('key down:', keyCode);
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