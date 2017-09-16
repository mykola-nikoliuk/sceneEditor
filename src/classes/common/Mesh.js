import Defer from 'Defer';

export default class Mesh extends Defer {
  constructor() {
    super();
    this._mesh = null;
  }

  get mesh() {
    return this._mesh;
  }
}