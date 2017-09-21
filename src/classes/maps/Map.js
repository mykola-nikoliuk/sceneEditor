import Skybox from 'Skybox';
import THREE from 'lib/three';
import {Defer} from 'general/Defer';
import Terrain from '../Terrain';
import {UnitsFactory} from 'units/common/UnitsFactory';

export default class Map extends Defer {
  constructor() {
    super();
    this._scene = new THREE.Scene();
    this._units = [];
  }

  addToUpdate(unit) {
    this._units.push(unit);
  }

  render(delta) {
    this._units.forEach(unit => unit.update(delta));
  }

  getUnit(unit) {
    return this._unitsFactory.get(unit.name)
  }

  get size() {
    return this._size;
  }

  get scene() {
    return this._scene;
  }

  _createSkybox(images) {
    return new Promise(resolve => {
      new Skybox(images).onLoad(mesh => {
        this._scene.add(mesh);
        resolve();
      });
    })
  }

  _createTerrain(...args) {
    return new Promise(resolve => {
      this._terrain = new Terrain(...args);
      this._terrain.onLoad(mesh => {
        this._scene.add(mesh);
        resolve();
      });
    })
  }

  _createUnitsFactory(units) {
    return new Promise(resolve => {
      this._unitsFactory = new UnitsFactory(units);
      this._unitsFactory.onLoad(resolve);
    });
  }
}