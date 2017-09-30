import Mesh from 'common/Mesh';

export class Unit extends Mesh {
  static get name() {
    return 'Unit';
  }

  clone() {
    return new this.__proto__.constructor(this._mesh.clone());
  }
}