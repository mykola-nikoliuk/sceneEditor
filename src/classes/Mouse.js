// TODO: refactor!!!

export const MOVE = 'move';
export const UP = 'up';
export const DOWN = 'down';
export const WHEEL = 'wheel';

class Mouse {
    constructor() {
        this._state = {
            position: {x: 0, y: 0},
            subscribers: {}
        };
    }

    _move(e) {
        if (this._state.subscribers[MOVE]) {
            this._state.subscribers[MOVE].forEach(callback => {
                callback({
                    delta: {
                        x: e.screenX - this._state.position.x,
                        y: e.screenY - this._state.position.y
                    },
                    position: {
                        x: e.screenX,
                        y: e.screenY
                    }
                })
            })
        }
        this._state.position.x = e.screenX;
        this._state.position.y = e.screenY;
    }

    _up() {
        if (this._state.subscribers[UP]) {
            this._state.subscribers[UP].forEach(callback => {
                callback()
            })
        }
    }

    _down() {
        if (this._state.subscribers[DOWN]) {
            this._state.subscribers[DOWN].forEach(callback => {
                callback()
            })
        }
    }

    _wheel(e) {
        if (this._state.subscribers[WHEEL]) {
            this._state.subscribers[WHEEL].forEach(callback => {
                callback({x: e.deltaX, y: e.deltaY})
            })
        }
    }

    subscribe(event, callback) {
        let eventSubscribers = this._state.subscribers[event];

        switch (event) {
            case MOVE:
                if (!eventSubscribers) {
                    eventSubscribers = this._state.subscribers[event] = [];
                    document.addEventListener('mousemove', this._move.bind(this));
                }
                eventSubscribers.push(callback);
                break;

            case DOWN:
                if (!eventSubscribers) {
                    eventSubscribers = this._state.subscribers[event] = [];
                    document.addEventListener('mousedown', this._down.bind(this));
                }
                eventSubscribers.push(callback);
                break;

            case UP:
                if (!eventSubscribers) {
                    eventSubscribers = this._state.subscribers[event] = [];
                    document.addEventListener('mouseup', this._up.bind(this));
                }
                eventSubscribers.push(callback);
                break;

            case WHEEL:
                if (!eventSubscribers) {
                    eventSubscribers = this._state.subscribers[event] = [];
                    document.addEventListener('mousewheel', this._wheel.bind(this));
                }
                eventSubscribers.push(callback);
                break;

            default:
                console.error(`Mouse() : unknown event "${event}"`);
        }
    }
}

export default new Mouse();