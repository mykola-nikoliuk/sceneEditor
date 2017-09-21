import THREE from 'lib/three';
import Map from 'maps/Map';
import right from 'resources/skyboxes/blueSky/right.jpg';
import left from 'resources/skyboxes/blueSky/left.jpg';
import top from 'resources/skyboxes/blueSky/top.jpg';
import bottom from 'resources/skyboxes/blueSky/bottom.jpg';
import front from 'resources/skyboxes/blueSky/front.jpg';
import back from 'resources/skyboxes/blueSky/back.jpg';

import heightMapUrl from './textures/heightMap.png';
import textureMapUrl from 'resources/stone-road.png';
import normalMapUrl from 'resources/stone_road_normal.png';
import {UNITS} from 'units/common/UnitsFactory';

const skyboxImages = [right, left, top, bottom, front, back];
const maps = {heightMapUrl, textureMapUrl, normalMapUrl};
const fog = new THREE.FogExp2(0x666666, 0.001);
const light = new THREE.DirectionalLight(0xffffff, 1);
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
light.position.set(-100, 100, 0);
// light.castShadow = true;
light.shadow.camera.near = 1;
light.shadow.camera.far = 100000;
const cameraRange = 512;
light.shadow.camera.right = cameraRange;
light.shadow.camera.left = -cameraRange;
light.shadow.camera.top	= cameraRange;
light.shadow.camera.bottom = -cameraRange;
light.shadow.mapSize.width = 1024;
light.shadow.mapSize.height = 1024;

const size = new THREE.Vector3(1024, 128, 1024);
//todo; TEST
let time = 0;

export class Plane extends Map {
  constructor({renderer, camera}) {
    super();

    const config = [maps, {renderer, camera, fog, light}, size];
    const units = [UNITS.IRON_CAT];

    this._size = size;
    this._scene.add(light);
    this._scene.add(ambientLight);
    this._promise = this._createSkybox(skyboxImages)
      .then(this._createTerrain.bind(this, ...config))
      .then(this._createUnitsFactory.bind(this, units));
  }

  render(delta) {
    time += delta;
    super.render(delta);
    light.position.z = Math.sin(Date.now() * 0.001) * 100;
    light.position.x = Math.cos(Date.now() * 0.001) * 100;
    this._terrain.render(delta);
  }
}