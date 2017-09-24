import THREE from 'lib/three';
import {View} from 'view/View';
import {screen, SCREEN_EVENTS} from 'general/Screen';
import store from 'store';
import 'utils/utils';
import mouse, {ENUMS as MOUSE_ENUMS} from 'input/Mouse';
import Skybox from 'Skybox';
import 'style/dat.gui.styl';
import right from 'resources/skyboxes/blueSky/right.jpg';
import left from 'resources/skyboxes/blueSky/left.jpg';
import top from 'resources/skyboxes/blueSky/top.jpg';
import bottom from 'resources/skyboxes/blueSky/bottom.jpg';
import front from 'resources/skyboxes/blueSky/front.jpg';
import back from 'resources/skyboxes/blueSky/back.jpg';

import gravel from 'resources/texture/gravel/gravel.jpg';
import gravelBump from 'resources/texture/gravel/gravel_bump.jpg';
import ground from 'resources/texture/ground/ground.jpg';
import groundBump from 'resources/texture/ground/ground_bump.jpg';
import sand from 'resources/texture/sand/sand.jpg';
import sandBump from 'resources/texture/sand/sand_bump.jpg';
import soil from 'resources/texture/soil/soil.jpg';
import soilBump from 'resources/texture/soil/soil_bump.jpg';
import blend from 'resources/blendMap.png';

import vertexShader from 'shaders/terrain.vert';
import fragmentShader from 'shaders/terrain.frag';


const cameraLimit = Math.PI / 720;
const skyboxImages = [right, left, top, bottom, front, back];

export class MaterialView extends View {
  constructor(renderer) {
    super(renderer);
    this._scene = new THREE.Scene();
    this._target = new THREE.Vector3(0, 0, 0);
    this._raycaster = new THREE.Raycaster();

    this._createCamera();
    this._createScene();
    this._initMouse();

    this._resizeUnsubsribe = screen.on(
      SCREEN_EVENTS.RESIZE,
      this._updateFullScreenView.bind(this)
    );
  }

  render() {
    this._camera.position.copy(this._cameraPosition).add(this._target);
    this._camera.lookAt(this._target);

    this._renderer.render(this._scene, this._camera);
  }

  destroy() {
    this._resizeUnsubsribe();
  }

  _createCamera() {
    // todo: change far to logical value
    this._cameraPosition = new THREE.Vector3();
    this._camera = new THREE.PerspectiveCamera(45, screen.aspectRatio, 1, 1000000);

    this._cameraData = store.get('cameraData') || {
      theta: Math.PI / 2 - Math.PI / 4,
      phi: Math.PI / 24,
      radius: 500,
      rotationEnabled: false
    };
    this._mouseUpdate({delta: {x: 0, y: 0}});
  }

  _createScene() {
    this._promise = new Promise(resolve => {
      const material = this._createMaterial();

      this._scene.add(
        new THREE.Mesh(
          new THREE.PlaneGeometry(100, 100, 100),
          material
        )
      );
      this._scene.add(new THREE.AmbientLight(0xffffff, 1));
      this._createSkybox(skyboxImages).then(resolve.bind(null, this));
    });
  }

  _createSkybox(images) {
    return new Promise(resolve => {
      new Skybox(images).onLoad(mesh => {
        this._scene.add(mesh);
        resolve();
      });
    });
  }

  _cameraScale(e, {y}) {
    this._cameraData.radius = (this._cameraData.radius + y / 10).fitToRange(1, Infinity);
    this._mouseUpdate({e, delta: {x: 0, y: 0}});
  }

  _mouseUpdate({delta: {x, y}}) {

    if (this._cameraData.rotationEnabled) {
      this._cameraData.theta = (this._cameraData.theta - y / 500).fitToRange(cameraLimit, Math.PI / 2 - cameraLimit);
      this._cameraData.phi += x / 500;
    }

    // Turn back into Cartesian coordinates
    this._cameraPosition.x = this._cameraData.radius * Math.sin(this._cameraData.theta) * Math.cos(this._cameraData.phi);
    this._cameraPosition.z = this._cameraData.radius * Math.sin(this._cameraData.theta) * Math.sin(this._cameraData.phi);
    this._cameraPosition.y = this._cameraData.radius * Math.cos(this._cameraData.theta);

    store.set('cameraData', this._cameraData);
  }

  _initMouse() {
    const {EVENTS: {MOVE, UP, DOWN, WHEEL, CONTEXT}, BUTTONS: {MAIN, SECOND}} = MOUSE_ENUMS;
    mouse.subscribe(MOVE, this._mouseUpdate.bind(this), this._renderer.domElement);

    mouse.subscribe(DOWN, e => {
      switch (e.button) {
        case MAIN:
          break;
        case SECOND:
          this._cameraData.rotationEnabled = true;
          break;
      }
    }, this._renderer.domElement);

    mouse.subscribe(UP, e => {
      switch (e.button) {
        case MAIN:
          break;
        case SECOND:
          this._cameraData.rotationEnabled = false;
          break;
      }
    }, this._renderer.domElement);

    mouse.subscribe(CONTEXT, e => {
      e.preventDefault();
    }, this._renderer.domElement);
    mouse.subscribe(WHEEL, this._cameraScale.bind(this), this._renderer.domElement);
  }

  _createMaterial() {
    const uniforms = {
      repeat: {value: 1},
      tex1: {value: new THREE.TextureLoader().load(gravel)},
      tex1b: {value: new THREE.TextureLoader().load(gravelBump)},
      tex2: {value: new THREE.TextureLoader().load(ground)},
      tex2b: {value: new THREE.TextureLoader().load(groundBump)},
      tex3: {value: new THREE.TextureLoader().load(soil)},
      tex3b: {value: new THREE.TextureLoader().load(soilBump)},
      tex4: {value: new THREE.TextureLoader().load(sand)},
      tex4b: {value: new THREE.TextureLoader().load(sandBump)},
      blend: {value: new THREE.TextureLoader().load(blend)},
    };

    return new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader
    });
  }
}