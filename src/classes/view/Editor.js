import THREE from 'lib/three';
import {GUI} from 'lib/dat.gui';
import {View} from 'view/View';
import {screenService, SCREEN_EVENTS} from 'general/ScreenService';
import store from 'store';
import map from 'lodash/map';
import mouse, {ENUMS as MOUSE_ENUMS} from 'input/Mouse';
import keyboard from 'input/Keyboard';
import Skybox from 'Skybox';
import Terrain from '../Terrain';
import 'style/dat.gui.styl';
import 'utils/utils';
import Stats from 'vendors/stats.min';
import heightMapURL from 'editor/textures/height_map.png';
import textureMapURL from 'resources/textures/terrain/stone_road.png';
import normalMapURL from 'resources/textures/terrain/stone_road_normal.png';
import config from 'editor/editor.json';
import right from 'resources/skyboxes/blueSky/right.jpg';
import left from 'resources/skyboxes/blueSky/left.jpg';
import top from 'resources/skyboxes/blueSky/top.jpg';
import bottom from 'resources/skyboxes/blueSky/bottom.jpg';
import front from 'resources/skyboxes/blueSky/front.jpg';
import back from 'resources/skyboxes/blueSky/back.jpg';
import {LayersView} from 'view/Layers';

const assetsContext = 'editor/assets/';
const guiStorageKey = 'editor.gui.r1';
const assetsStorageKey = 'editor.assets.r1';
const skyboxImages = [right, left, top, bottom, front, back];

const mouseData = {
  dragVerticalEnabled: false,
  scaleEnabled: false,
  rotationEnabled: false,
  dragEnabled: false,
  dragDelta: null
};

export class EditorView extends View {
  constructor(renderer) {
    super(renderer);
    this._scene = new THREE.Scene();
    this._target = new THREE.Vector3(0, 0, 0);
    this._raycaster = new THREE.Raycaster();
    this._stats = new Stats();
    this._renderTarget = new THREE.WebGLRenderTarget(screenService.width, screenService.height);
    document.body.appendChild(this._stats.dom);

    this._createCamera();
    this._createScene();
    this._createLayers();
    this._initMouse();
    this._initKeyboard();
    this._createTerrain().then(() => {
      this._createGUI();
    });

    this._resizeUnsubsribe = screenService.on(
      SCREEN_EVENTS.RESIZE,
      this._onResize.bind(this)
    );
  }

  render(delta) {
    this._stats.begin();

    this._transformControls.enabled && this._transformControls.update();
    this._terrain.render(delta);
    this._renderer.render(this._scene, this._camera, this._renderTarget);

    this._layers.render();

    this._stats.end();
  }

  destroy() {
    this._resizeUnsubsribe();
  }

  _createCamera() {
    const save = store.get('editor.r1.camera');
    // todo: change far to logical value
    this._camera = new THREE.PerspectiveCamera(45, screenService.aspectRatio, 1, 1000000000);
    //debugger;
    if (save) {
      this._camera.position.fromArray(save.position);
      this._camera.lookAt(new THREE.Vector3().fromArray(save.target));
    } else {
      this._camera.position.set(0, 1000, 1000);
      this._camera.lookAt(new THREE.Vector3());
    }

    this._orbitControls = new THREE.OrbitControls(this._camera, this._renderer.domElement, {
      maxPolarAngle: Math.PI / 2
    });
    if (save) {
      this._orbitControls.target = new THREE.Vector3().fromArray(save.target);
      this._orbitControls.update();
    }

    this._transformControls = new THREE.TransformControls(this._camera, this._renderer.domElement);
    this._transformControls.enabled = false;
    this._scene.add(this._transformControls);
  }

  _createScene() {
    this._promise = new Promise(resolve => {
      const loader = new THREE.TextureLoader();
      const {map, normalMap} = config.plane.material;

      this._assets = [];
      this._selectedAsset = null;

      this._plane = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 1),
        new THREE.MeshPhongMaterial({
          map: map && loader.load(assetsContext + map),
          normalMap: normalMap && loader.load(assetsContext + normalMap)
        })
      );
      map && (this._plane.material.map.wrapS = this._plane.material.map.wrapT = THREE.RepeatWrapping);
      normalMap && (this._plane.material.normalMap.wrapS = this._plane.material.normalMap.wrapT = THREE.RepeatWrapping);
      this._plane.rotation.x = -Math.PI / 2;
      this._scene.add(this._plane);

      this._ambientLight = new THREE.AmbientLight(0xffffff, 1);
      this._scene.add(this._ambientLight);

      this._directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      this._directionalLight.position.set(1, 1, 1);
      this._scene.add(this._directionalLight);

      this._axis = new THREE.AxisHelper(1);
      this._scene.add(this._axis);

      this._createSkybox(skyboxImages).then(resolve.bind(null, this));
    });
  }

  _createSkybox(images) {
    return new Promise(resolve => {
      new Skybox(images, 1000000000).onLoad(mesh => {
        this._skybox = mesh;
        this._scene.add(mesh);
        resolve();
      });
    });
  }

  _mouseUpdate({event, delta: {x, y}, position}) {
    if (event) {
      if (mouseData.dragEnabled) {
        this._selectedAsset.position.copy(this._getPosition(position).sub(mouseData.dragDelta));
      }
      if (mouseData.rotationEnabled) {
        this._selectedAsset.rotation.y += x / 200;
      }
      if (mouseData.scaleEnabled) {
        const scale = this._selectedAsset.scale.x - y / 200;
        this._selectedAsset.scale.set(scale, scale, scale);
      }
      if (mouseData.dragVerticalEnabled) {
        this._selectedAsset.position.y -= y;
      }
    }
  }

  _initMouse() {
    const {EVENTS: {DOWN}, BUTTONS: {MAIN}} = MOUSE_ENUMS;

    mouse.subscribe(DOWN, ({event}) => {
      switch (event.button) {
        case MAIN:
          this._selectAsset(event);
          break;
      }
    }, this._renderer.domElement);
  }

  _initKeyboard() {
    keyboard.on('DELETE', () => {
      if (this._selectedAsset) {
        this._scene.remove(this._selectedAsset);
        this._assets.splice(this._assets.indexOf(this._selectedAsset), 1);
        this._selectedAsset = null;
        this._transformControls.detach();
      }
    });

    keyboard.on('ESC', () => {
      this._transformControls.detach();
      this._transformControls.enabled = false;
    });
    keyboard.on('T', () => this._transformControls.setMode(THREE.TransformControls.TRANSLATE));
    keyboard.on('R', () => this._transformControls.setMode(THREE.TransformControls.ROTATE));
    keyboard.on('S', () => this._transformControls.setMode(THREE.TransformControls.SCALE));
    keyboard.on('C', () => {
      if (this._selectedAsset) {
        const radius = new THREE.Box3().setFromObject(this._selectedAsset).getBoundingSphere().radius * 4;
        const distance = this._selectedAsset.position.distanceTo(this._camera.position);
        this._camera.position
          .sub(this._selectedAsset.position)
          .multiplyScalar(radius / distance)
          .add(this._selectedAsset.position);
        this._orbitControls.target.copy(this._selectedAsset.position);
        this._orbitControls.update();
      }
    });

    12
  }

  _createGUI() {
    const gui = new GUI();
    const createAsset = {};
    let assetsPromise = new Promise(resolve => resolve());
    let guiConfig = Object.assign({}, {
      plane: {
        size: 1000,
        texture_repeat: 1,
      },
      lights: {
        ambient_color: '#ffffff',
        directional_color: '#ffffff',
        ambient_intensity: 1,
        directional_intensity: 1
      }
    }, store.get(guiStorageKey));

    const guiChange = {
      plane: {
        size: value => {
          this._axis.scale.set(value, value, value);
          this._plane.scale.set(value, value, value);
        },
        texture_repeat: value => {
          const {map, normalMap} = this._plane.material;
          map && map.repeat.set(value, value);
          normalMap && normalMap.repeat.set(value, value);
        }
      },
      lights: {
        ambient_color: value => {
          this._ambientLight.color.set(value);
        },
        ambient_intensity: value => {
          this._ambientLight.intensity = value;
        },
        directional_color: value => {
          this._directionalLight.color.set(value);
        },
        directional_intensity: value => {
          this._directionalLight.intensity = value;
        }
      },
      save: () => {
        const assets = map(this._assets, asset => {
          return {
            name: asset.name,
            position: asset.position.toArray(),
            rotation: asset.rotation.toArray(),
            scale: asset.scale.toArray()
          };
        });
        store.set(guiStorageKey, guiConfig);
        store.set(assetsStorageKey, assets);
        store.set('editor.r1.camera', {
          position: this._camera.position.toArray(),
          target: this._orbitControls.target.toArray()
        });
      },
      load: () => {
        assetsPromise.then(() => {
          while (this._assets.length) {
            this._scene.remove(this._assets.pop());
          }
          const loadedAssets = store.get(assetsStorageKey);
          if (loadedAssets) {
            loadedAssets.forEach(asset => {
              const mesh = createAsset[asset.name]();
              mesh.position.fromArray(asset.position);
              mesh.rotation.fromArray(asset.rotation);
              mesh.scale.fromArray(asset.scale);
            });
          }
          this._selectedAsset = null;
        });
        const loadedConfig = store.get(guiStorageKey);
        if (loadedConfig) {
          Object.extend(guiConfig, loadedConfig);
          this._guiApply(guiConfig, guiChange);
        }
      }
    };

    const terrain = gui.addState('Terrain', this._terrain);
    terrain.open();

    const plane = gui.addFolder('Plane');
    plane.add(guiConfig.plane, 'size', 1)
      .onChange(guiChange.plane.size)
      .listen();
    plane.add(guiConfig.plane, 'texture_repeat', 1, 24)
      .step(1)
      .onChange(guiChange.plane.texture_repeat)
      .listen();

    const lights = gui.addFolder('Lights');
    lights.addColor(guiConfig.lights, 'ambient_color')
      .onChange(guiChange.lights.ambient_color)
      .listen();
    lights.addColor(guiConfig.lights, 'directional_color')
      .onChange(guiChange.lights.directional_color)
      .listen();
    lights.add(guiConfig.lights, 'ambient_intensity', 0, 2)
      .onChange(guiChange.lights.ambient_intensity)
      .listen();
    lights.add(guiConfig.lights, 'directional_intensity', 0, 2)
      .onChange(guiChange.lights.directional_intensity)
      .listen();

    const spawn = gui.addFolder('Spawn asset');

    Object.keys(config.assets).forEach(key => {
      assetsPromise = assetsPromise.then(() => {
        return new Promise(resolve => {
          new THREE.FBXLoader().load(assetsContext + config.assets[key], mesh => {
            createAsset[key] = () => {
              const clone = mesh.clone();
              clone.name = key;
              this._assets.push(clone);
              this._scene.add(clone);
              return clone;
            };
            spawn.add(createAsset, key);
            resolve();
          });
        });
      });
    });

    createAsset['Cube'] = () => {
      const clone = new THREE.Mesh(
        new THREE.CubeGeometry(100, 100, 100),
        new THREE.MeshPhongMaterial({
          color: Math.random() * 0xffffff,
          transparent: true,
          opacity: .5,
          side: THREE.DoubleSide
        })
      );
      clone.name = 'cube';
      this._assets.push(clone);
      this._scene.add(clone);
      return clone;
    };
    spawn.add(createAsset, 'Cube');

    createAsset['Sphere'] = () => {
      const clone = new THREE.Mesh(
        new THREE.SphereGeometry(100, 16, 16),
        new THREE.MeshPhongMaterial({
          color: Math.random() * 0xffffff,
          transparent: true,
          opacity: .5,
          side: THREE.DoubleSide
        })
      );
      clone.name = 'Sphere';
      this._assets.push(clone);
      this._scene.add(clone);
      return clone;
    };
    spawn.add(createAsset, 'Sphere');

    gui.add(guiChange, 'save');
    gui.add(guiChange, 'load');

    gui.close();

    guiChange.load();
    this._guiApply(guiConfig, guiChange);
  }

  _guiApply(guiConfig, guiChange) {
    Object.keys(guiChange).forEach(key => {
      if (typeof guiChange[key] === 'object') {
        this._guiApply(guiConfig[key], guiChange[key]);
      } else if (guiConfig[key]) {
        guiChange[key](guiConfig[key]);
      }
    });
  }

  _getPosition({x, y}) {
    const vector = new THREE.Vector3();

    vector.set(
      (x / screenService.width) * 2 - 1,
      -(y / screenService.height) * 2 + 1,
      0.5
    );

    vector.unproject(this._camera);

    const position = this._camera.position.clone();
    const dir = vector.sub(position).normalize();

    const distance = -position.y / dir.y;

    return position.add(dir.multiplyScalar(distance));
  }

  _selectAsset(event) {
    const mouse = new THREE.Vector2(
      (event.clientX / window.innerWidth ) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    );

    this._raycaster.setFromCamera(mouse, this._camera);

    const objects = addChildren(this._assets);

    const intersects = this._raycaster.intersectObjects(objects);

    if (intersects.length) {
      this._selectedAsset = findRootParent(intersects[0].object);
      this._transformControls.attach(this._selectedAsset);
      this._transformControls.enabled = true;
    } else {
      this._selectedAsset = null;
    }

    function addChildren(children, objects = []) {
      children.forEach(child => {
        if (objects.indexOf(child) === -1) {
          if (child instanceof THREE.Mesh) {
            objects.push(child);
          }
          addChildren(child.children, objects);
        }
      });
      return objects;
    }

    function findRootParent(child) {
      if (!child.parent || child.parent instanceof THREE.Scene) {
        return child;
      } else {
        return findRootParent(child.parent);
      }
    }
  }

  _createTerrain() {
    const maps = {heightMapURL, textureMapURL, normalMapURL};
    const size = new THREE.Vector3(2000, 20, 2000);
    const water = {};
    const env = {
      renderer: this._renderer,
      camera: this._camera,
      fog: null,
      light: this._directionalLight
    };

    return new Promise(resolve => {
      this._terrain = new Terrain(maps, env, size, water);
      this._terrain.onLoad(mesh => {
        this._scene.add(mesh);
        resolve();
      });
    });
  }

  _createLayers() {
    this._layers = new LayersView(this._renderer);
    this._layers.addLayer(this._renderTarget);
  }
}