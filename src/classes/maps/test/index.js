import THREE from 'lib/three';
import Map from 'maps/Map';
import right from 'resources/skyboxes/blueSky/right.jpg';
import left from 'resources/skyboxes/blueSky/left.jpg';
import top from 'resources/skyboxes/blueSky/top.jpg';
import bottom from 'resources/skyboxes/blueSky/bottom.jpg';
import front from 'resources/skyboxes/blueSky/front.jpg';
import back from 'resources/skyboxes/blueSky/back.jpg';

import waterNormalsMapUrl from './textures/waternormals.jpg';
import heightMapUrl from './textures/heightMap.png';
import textureMapUrl from 'resources/terrain/ground.jpg';

const skyboxImages = [right, left, top, bottom, front, back];
const maps = {heightMapUrl, textureMapUrl};
const fog = new THREE.FogExp2(0x666666, 0.001);
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(-1, 1, -1);

const size = new THREE.Vector3(1024, 128, 1024);

export class TestMap extends Map {
  constructor({renderer, camera}) {
    super();

    const water = {normalMapUrl: waterNormalsMapUrl};
    const config = [maps, {renderer, camera, fog, light}, size, water];

    this._scene.add(light);
    this._promise = this._createSkybox(skyboxImages)
      .then(this._createTerrain.bind(this, ...config));
  }

  render(delta) {
    this._terrain.render(delta);
  }
}