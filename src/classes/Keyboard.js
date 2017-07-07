const KEY_CODES = {
    37: 'LEFT',
    38: 'UP',
    39: 'RIGHT',
    40: 'DOWN',
    87: 'W',
    83: 'S'
};

function turnOff(state, {keyCode}) {
    if (typeof KEY_CODES[keyCode] === 'string') {
        state[KEY_CODES[keyCode]] = false;
    }
}

function turnOn(state, {keyCode}) {
    console.log(keyCode);
    if (typeof KEY_CODES[keyCode] === 'string') {
        state[KEY_CODES[keyCode]] = true;
    }
}

class Keyboard {
    constructor() {
        this._state = {
            LEFT: false,
            UP: false,
            RIGHT: false,
            DOWN: false,
            W: false,
            S: false
        };

        document.addEventListener('keydown', turnOn.bind(this, this._state));
        document.addEventListener('keyup', turnOff.bind(this, this._state));
    }

    get state() {
        return this._state;
    }
}

export default new Keyboard();