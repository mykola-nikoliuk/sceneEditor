export const ENUMS = {
  BUTTONS: {
    MAIN: 0,
    MIDDLE: 1,
    SECOND: 2
  },
  EVENTS: {
    MOVE: 'move',
    UP: 'up',
    DOWN: 'down',
    WHEEL: 'wheel',
    CONTEXT: 'contextmenu'
  }
};

class Mouse {
  constructor() {
    this._state = {
      position: {x: 0, y: 0},
      subscribers: {}
    };
  }

  _move(e) {
    if (this._state.subscribers[ENUMS.EVENTS.MOVE]) {
      this._state.subscribers[ENUMS.EVENTS.MOVE].forEach(callback => {
        callback({
          event: e,
          delta: {
            x: e.screenX - this._state.position.x,
            y: e.screenY - this._state.position.y
          },
          position: {
            x: e.screenX,
            y: e.screenY
          }
        });
      });
    }
    this._state.position.x = e.screenX;
    this._state.position.y = e.screenY;
  }

  _up(e) {
    if (this._state.subscribers[ENUMS.EVENTS.UP]) {
      this._state.subscribers[ENUMS.EVENTS.UP].forEach(callback => {
        callback(e);
      });
    }
  }

  _down(e) {
    if (this._state.subscribers[ENUMS.EVENTS.DOWN]) {
      this._state.subscribers[ENUMS.EVENTS.DOWN].forEach(callback => {
        callback(e);
      });
    }
  }

  _wheel(e) {
    if (this._state.subscribers[ENUMS.EVENTS.WHEEL]) {
      this._state.subscribers[ENUMS.EVENTS.WHEEL].forEach(callback => {
        callback(e, {x: e.deltaX, y: e.deltaY});
      });
    }
  }

  _context(e) {
    if (this._state.subscribers[ENUMS.EVENTS.CONTEXT]) {
      this._state.subscribers[ENUMS.EVENTS.CONTEXT].forEach(callback => {
        callback(e);
      });
    }
  }

  subscribe(event, callback, target = document) {
    let eventSubscribers = this._state.subscribers[event];

    switch (event) {
      case ENUMS.EVENTS.MOVE:
        if (!eventSubscribers) {
          eventSubscribers = this._state.subscribers[event] = [];
          target.addEventListener('mousemove', this._move.bind(this));
        }
        eventSubscribers.push(callback);
        break;

      case ENUMS.EVENTS.DOWN:
        if (!eventSubscribers) {
          eventSubscribers = this._state.subscribers[event] = [];
          target.addEventListener('mousedown', this._down.bind(this));
        }
        eventSubscribers.push(callback);
        break;

      case ENUMS.EVENTS.UP:
        if (!eventSubscribers) {
          eventSubscribers = this._state.subscribers[event] = [];
          target.addEventListener('mouseup', this._up.bind(this));
        }
        eventSubscribers.push(callback);
        break;

      case ENUMS.EVENTS.WHEEL:
        if (!eventSubscribers) {
          eventSubscribers = this._state.subscribers[event] = [];
          target.addEventListener('mousewheel', this._wheel.bind(this));
        }
        eventSubscribers.push(callback);
        break;

      case ENUMS.EVENTS.CONTEXT:
        if (!eventSubscribers) {
          eventSubscribers = this._state.subscribers[event] = [];
          target.addEventListener(ENUMS.EVENTS.CONTEXT, this._context.bind(this));
        }
        eventSubscribers.push(callback);
        break;

      default:
        console.error(`Mouse() : unknown event "${event}"`);
    }
  }
}

export default new Mouse();