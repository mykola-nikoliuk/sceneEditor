import {EventEmitter} from './EventEmitter';

export const SCREEN_EVENTS = {
  RESIZE: Symbol('RESIZE')
};

class ScreenService extends EventEmitter {
  constructor() {
    super();

    addEventListener('resize', () => {
      this.emit(SCREEN_EVENTS.RESIZE);
    });
  }

  get width() {
    return window.innerWidth;
  }

  get height() {
    return window.innerHeight;
  }

  get aspectRatio() {
    return this.width / this.height;
  }

}

export const screenService = new ScreenService();