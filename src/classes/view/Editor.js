import THREE from 'lib/three';
import {GUI} from 'lib/dat.gui';
import {View} from 'view/View';
import {screenService, SCREEN_EVENTS} from 'general/ScreenService';
import store from 'store';
import map from 'lodash/map';
import each from 'lodash/each';
import mouse, {ENUMS as MOUSE_ENUMS} from 'input/Mouse';
import keyboard from 'input/Keyboard';
import Skybox from 'Skybox';
import Terrain from '../Terrain';
import 'style/dat.gui.styl';
import 'utils/utils';
import Stats from 'vendors/stats.min';
import heightMapURL from 'editor/textures/height_map.png';
import textureMapURL from 'resources/textures/terrain/grass.png';
import normalMapURL from 'resources/textures/terrain/grass_n.png';
import config from 'editor/editor.json';
import right from 'resources/skyboxes/blueSky/right.jpg';
import left from 'resources/skyboxes/blueSky/left.jpg';
import top from 'resources/skyboxes/blueSky/top.jpg';
import bottom from 'resources/skyboxes/blueSky/bottom.jpg';
import front from 'resources/skyboxes/blueSky/front.jpg';
import back from 'resources/skyboxes/blueSky/back.jpg';
import {LayersView} from 'view/Layers';
import {Canvas} from 'editor/Canvas';
import {EditorMenu} from 'editor/EditorMenu';
import {copySkinnedGroup} from 'utils/copySkinnedGroup';

const assetsContext = 'editor/assets/';
const guiStorageKey = 'editor.gui.r1';
const assetsStorageKey = 'editor.assets.r1';
const statesStorageKey = 'editor.states.r1';
const terrainHeightStorageKey = 'editor.terrainHeight.r1';
const skyboxImages = [right, left, top, bottom, front, back];

const mouseData = {
  heightDrawingEnabled: false,
  dragVerticalEnabled: false,
  scaleEnabled: false,
  rotationEnabled: false,
  dragEnabled: false,
  dragDelta: null
};

const uv = new THREE.Vector2(0, 0);
let drawEnabled = true;

export class EditorView extends View {
  constructor(renderer) {
    super(renderer);
    this._mixers = [];
    this._scene = new THREE.Scene();
    this._target = new THREE.Vector3(0, 0, 0);
    this._raycaster = new THREE.Raycaster();
    this._stats = new Stats();
    this._renderTarget = new THREE.WebGLRenderTarget(screenService.width, screenService.height);
    document.body.appendChild(this._stats.dom);

    const promises = [];
    this._createLayers();
    this._createCamera();
    this._createScene();
    promises.push(this._createSkybox(skyboxImages));
    promises.push(this._createHeightCanvas());
    promises.push(this._createTerrain(this)
      .then(this._createGUI.bind(this))
      .then(this._createMenu.bind(this))
    );

    this._promise = Promise.all(promises)
      .then(this._initInput.bind(this))
    // .then(this._test.bind(this));
  }

  _test() {

  }

  update(delta) {
    if (this._menu.mode === EditorMenu.MODES.TERRAIN_HEIGHT && mouseData.heightDrawingEnabled) {
      this._heightCanvas.draw(uv, delta, keyboard.state.CTRL);
    }

    this._mixers.forEach(mixer => mixer.update(delta / 1000));
    this._transformControls.enabled && this._transformControls.update();

    this._menu.update();
  }

  render(delta) {
    this._stats.begin();

    // this._FPCotrols.update(delta);
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

    // this._FPCotrols = new THREE.FPControls(this._camera, this._renderer.domElement);
    // this._FPCotrols._speed = 10;

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
    return new Promise(resolve => {
      const loader = new THREE.TextureLoader();

      this._assets = [];
      this._selectedAsset = null;

      this._ambientLight = new THREE.AmbientLight(0xffffff, 1);
      this._scene.add(this._ambientLight);

      this._directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      this._directionalLight.position.set(1, 1, 1);
      this._scene.add(this._directionalLight);
    });
  }

  _createMenu() {
    this._menu = new EditorMenu(this._camera);
    this._scene.add(this._menu.mesh)
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

  _initInput() {
    this._initMouse();
    this._initKeyboard();
    this._resizeUnsubsribe = screenService.on(
      SCREEN_EVENTS.RESIZE,
      this._onResize.bind(this)
    );
  }

  _initMouse() {
    const {EVENTS: {DOWN, MOVE, UP}, BUTTONS: {MAIN}} = MOUSE_ENUMS;

    mouse.subscribe(DOWN, ({event}) => {
      const intersects = this._getIntersects(event, this._menu.mesh.children);
      if (intersects.length) {
        this._menu.onClick(intersects);
      } else {
        switch (event.button) {
          case MAIN:
            this._mouseDown(event);
            break;
        }
      }
    }, this._renderer.domElement);

    mouse.subscribe(MOVE, ({event}) => {
      switch (event.button) {
        case MAIN:
          this._mouseUpdate(event);
          break;
      }
    }, this._renderer.domElement);

    mouse.subscribe(UP, ({event}) => {
      switch (event.button) {
        case MAIN:
          this._mouseUp(event);
          break;
      }
    }, this._renderer.domElement);
  }

  _mouseDown(event) {
    switch (this._menu.mode) {
      case EditorMenu.MODES.TERRAIN_HEIGHT:
        const intersects = this._getIntersects(event, [this._terrain.mesh.children[0]]);
        if (intersects.length) {
          uv.copy(intersects[0].uv);
          mouseData.heightDrawingEnabled = true;
        }
        break;
      case EditorMenu.MODES.EDIT_ASSETS:
        this._selectAsset(event);
        break;
    }
  }

  _mouseUpdate(event) {
    switch (this._menu.mode) {
      case EditorMenu.MODES.TERRAIN_HEIGHT:
        if (mouseData.heightDrawingEnabled) {
          const intersects = this._getIntersects(event, [this._terrain.mesh.children[0]]);
          if (intersects.length > 0 && intersects[0].uv) {
            uv.copy(intersects[0].uv);
          }
        }
        break;
    }
  }

  _mouseUp(event) {
    switch (this._menu.mode) {
      case EditorMenu.MODES.TERRAIN_HEIGHT:
        mouseData.heightDrawingEnabled = false;
        this._selectAsset(event);
        break;
    }
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
  }

  _createGUI() {
    const gui = new GUI();
    const createAsset = {};
    const assetsPromises = [];
    let assetsPromise = null;
    let guiConfig = Object.assign({}, {
      lights: {
        ambient_color: '#ffffff',
        directional_color: '#ffffff',
        ambient_intensity: 1,
        directional_intensity: 1
      }
    }, store.get(guiStorageKey));

    const guiChange = {
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
        const stateNames = ['_terrain', '_heightCanvas'];
        const states = {};
        stateNames.forEach(stateName => {
          states[stateName] = Object.toStringTypes(this[stateName].getState());
        });


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
        store.set(statesStorageKey, states);
        let imageData = this._heightCanvas.getData();
        store.set(terrainHeightStorageKey, {
          data: Array.prototype.slice.call(imageData.data),
          width: imageData.width,
          height: imageData.height
        });
        store.set('editor.r1.camera', {
          position: this._camera.position.toArray(),
          target: this._orbitControls.target.toArray()
        });
      },
      load: () => {
        const states = store.get(statesStorageKey);
        for (let key in states) {
          if (states.hasOwnProperty(key)) {
            this[key].setState(Object.parseStringTypes(states[key]));
          }
        }

        const imageData = store.get(terrainHeightStorageKey);
        if (imageData) {
          this._heightCanvas.setData(imageData);
        }

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
      },
      reset: () => {
        if (confirm('Are you really want to reset editor?\nAll data will be erased!')) {
          localStorage.clear();
          location.reload();
        }
      }
    };

    gui.addState('Map', this._terrain);
    gui.addState('Brush', this._heightCanvas);

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

    this._loadAssets(config.assets, spawn, assetsPromises, createAsset);
    assetsPromise = Promise.all(assetsPromises);

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
    gui.add(guiChange, 'reset');

    guiChange.load();
    this._guiApply(guiConfig, guiChange);
  }

  _loadAssets(assetsURLs, gui, promises, assets) {
    each(assetsURLs, (value, key) => {
      if (typeof value === 'string') {
        promises.push(new Promise(resolve => {
          new THREE.FBXLoader().load(assetsContext + value, mesh => {

            if (mesh.animations && mesh.animations.length) {
              mesh.mixer = new THREE.AnimationMixer(mesh);
              this._mixers.push(mesh.mixer);
              mesh.animation = mesh.mixer.clipAction(mesh.animations[0]).play();
              mesh = {
                animations: mesh.animations,
                clone: copySkinnedGroup.bind(null, mesh)
              };
            }

            assets[key] = () => {

              let clone = mesh.clone();

              if (mesh.animations && mesh.animations.length) {
                // todo: fix that hack somehow
                clone.scale.multiplyScalar(1 / 39.370079040527344);

                clone.mixer = new THREE.AnimationMixer(clone.children[1]);
                this._mixers.push(clone.mixer);
                const animation = clone.animation = clone.mixer.clipAction(mesh.animations[0]);
                animation.startAt(-Math.random() * 3);
                animation.play();
              }

              clone.name = key;
              this._assets.push(clone);
              this._scene.add(clone);
              return clone;
            };

            if (mesh.animations.length) {
              setTimeout(() => {
                const width = 10;
                const height = 10;
                const offset = 10;
                const randomPercent = 0.6;
                for (let x = 0; x < width; x++) {
                  for (let y = 0; y < height; y++) {
                    const mesh = assets[key]();
                    mesh.position
                      .set(
                        x - width / 2 + Math.random() * randomPercent,
                        0,
                        y - height / 2 + Math.random() * randomPercent)
                      .multiplyScalar(offset);
                  }
                }
              }, 1000);
            }

            gui.add(assets, key);
            resolve();
          });
        }));
      } else {
        this._loadAssets(value, gui.addFolder(key), promises, assets);
      }
    });
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
    const intersects = this._getIntersects(event, addChildren(this._assets));

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
    const maps = {
      heightMapURL,
      textureMapURL,
      normalMapURL,
      heightCanvas: this._heightCanvas
    };
    const size = new THREE.Vector3(2000, 400, 2000);
    const water = {};
    const env = {
      renderer: this._renderer,
      camera: this._camera,
      fog: null,
      light: this._directionalLight
    };

    return new Promise(resolve => {
      this._terrain = new Terrain({maps, env, size, water});
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

  _getIntersects(event, objects) {
    const {x, y} = new THREE.Vector2(event.clientX, event.clientY);
    const vector = new THREE.Vector2(
      (x / screenService.width) * 2 - 1,
      -(y / screenService.height) * 2 + 1,
    );

    this._raycaster.setFromCamera(vector, this._camera);
    return this._raycaster.intersectObjects(objects);
  };

  _createHeightCanvas() {
    return new Promise(resolve => {
      this._heightCanvas = new Canvas(64, 64);
      this._heightCanvas.onLoad(resolve);
    });
  }
}