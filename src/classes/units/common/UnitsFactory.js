import {IronCat} from '../IronCat'
import {Defer} from 'general/Defer';

export const UNITS = {
  IRON_CAT: IronCat
};

export class UnitsFactory extends Defer {

  constructor(units) {
    super();
    this._cachedUnits = [];
    this._promise = this._cacheNext(units);
  }

  get(name) {
    return this._cachedUnits[name].clone();
  }

  /** @param {[Unit]} units */
  _cacheNext(units) {
    return new Promise(resolve => {
      const UnitClass = units.shift();
      if (UnitClass) {
        this._cachedUnits[UnitClass.name] = new UnitClass();
        this._cachedUnits[UnitClass.name].onLoad(() => {
          this._cacheNext(units).then(resolve);
        });
      } else {
        resolve();
      }
    })
  }
}