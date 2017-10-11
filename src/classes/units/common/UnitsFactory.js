import {IronCat} from 'units/IronCat';
import {Defer} from 'general/Defer';

export const UNITS = {
  IRON_CAT: IronCat
};

export class UnitsFactory extends Defer {

  constructor(units) {
    super();
    const promises = [];
    units.forEach(unit => promises.push(this._cache(unit)));

    this._cachedUnits = [];
    this._promise = Promise.all(promises);
  }

  get(name) {
    return this._cachedUnits[name].clone();
  }

  _cache(UnitClass) {
    return new Promise(resolve => {
      this._cachedUnits[UnitClass.name] = new UnitClass();
      this._cachedUnits[UnitClass.name].onLoad(resolve);
    });
  }
}