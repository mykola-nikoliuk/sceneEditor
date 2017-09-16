import THREE from 'lib/three';
import Map from 'maps/Map';
import right from 'resources/skyboxes/blueSky/right.jpg';
import left from 'resources/skyboxes/blueSky/left.jpg';
import top from 'resources/skyboxes/blueSky/top.jpg';
import bottom from 'resources/skyboxes/blueSky/bottom.jpg';
import front from 'resources/skyboxes/blueSky/front.jpg';
import back from 'resources/skyboxes/blueSky/back.jpg';

import heightMapUrl from './textures/heightMap.png';
import textureMapUrl from 'resources/terrain/ground.jpg';
import {UNITS} from 'units/common/UnitsFactory';

const skyboxImages = [right, left, top, bottom, front, back];
const maps = {heightMapUrl, textureMapUrl};
const fog = new THREE.FogExp2(0x666666, 0.001);
const light = new THREE.DirectionalLight(0xffffff, .5);
const ambientLight = new THREE.AmbientLight(0xffffff, .5);
light.position.set(-1, 1, -1);

const size = new THREE.Vector3(1024, 128, 1024);

export class Plane extends Map {
  constructor({renderer, camera}) {
    super();

    const config = [maps, {renderer, camera, fog, light}, size];
    const units = [UNITS.IRON_CAT];

    this._scene.add(light);
    this._scene.add(ambientLight);
    this._promise = this._createSkybox(skyboxImages)
      .then(this._createTerrain.bind(this, ...config))
      .then(this._createUnitsFactory.bind(this, units));
  }

  render(delta) {
    super.render(delta);
    this._terrain.render(delta);
  }
}