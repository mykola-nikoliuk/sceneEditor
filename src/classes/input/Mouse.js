export const ENUMS = {
  BUTTONS: {
    MAIN: 0,
    MIDDLE: 1,
    SECOND: 2
  },
  EVENTS: {
    TOUCH_MOVE: 'touchmove',
    TOUCH_START: 'touchstart',
    TOUCH_END: 'touchend',
    DOWN: 'mousedown',
    UP: 'mouseup',
    MOVE: 'mousemove',
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

  _move(eventType, event) {
    const position = {
      x: eventType === ENUMS.EVENTS.TOUCH_MOVE ? event.touches[0].clientX : event.clientX,
      y: eventType === ENUMS.EVENTS.TOUCH_MOVE ? event.touches[0].clientY : event.clientY
    };
    if (this._state.subscribers[eventType]) {
      this._state.subscribers[eventType].forEach(callback => {
        callback({
          event,
          delta: {
            x: position.x - this._state.position.x,
            y: position.y - this._state.position.y
          },
          position
        });
      });
    }
    this._state.position = position;
  }

  _defaultEvent(eventType, event) {
    if (this._state.subscribers[eventType]) {
      const position = {
        x: eventType.indexOf('touch') > -1 ? this._state.position.x : event.clientX,
        y: eventType.indexOf('touch') > -1 ? this._state.position.y : event.clientY
      };
      this._state.subscribers[eventType].forEach(callback => {
        callback({event, position});
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

  subscribe(eventType, callback, target = document) {
    let eventSubscribers = this._state.subscribers[eventType];

    switch (eventType) {
      case ENUMS.EVENTS.MOVE:
      case ENUMS.EVENTS.TOUCH_MOVE:
        if (!eventSubscribers) {
          eventSubscribers = this._state.subscribers[eventType] = [];
          target.addEventListener(eventType, this._move.bind(this, eventType));
        }
        eventSubscribers.push(callback);
        break;

      case ENUMS.EVENTS.TOUCH_START:
      case ENUMS.EVENTS.TOUCH_END:
      case ENUMS.EVENTS.DOWN:
      case ENUMS.EVENTS.UP:
      case ENUMS.EVENTS.CONTEXT:
        if (!eventSubscribers) {
          eventSubscribers = this._state.subscribers[eventType] = [];
          target.addEventListener(eventType, this._defaultEvent.bind(this, eventType));
        }
        eventSubscribers.push(callback);
        break;

      case ENUMS.EVENTS.WHEEL:
        if (!eventSubscribers) {
          eventSubscribers = this._state.subscribers[eventType] = [];
          target.addEventListener(eventType, this._wheel.bind(this));
        }
        eventSubscribers.push(callback);
        break;

      default:
        console.error(`Mouse() : unknown event "${eventType}"`);
    }
  }
}

export default new Mouse();