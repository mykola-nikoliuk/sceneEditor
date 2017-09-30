import THREE from 'lib/three';
import utils from 'threejs-utils';
import {View} from 'view/View';
import {screen, SCREEN_EVENTS} from 'general/Screen';
import store from 'store';
import map from 'lodash/map';
import mouse, {ENUMS as MOUSE_ENUMS} from 'input/Mouse';
import keyboard from 'input/Keyboard';
import Skybox from 'Skybox';
import 'style/dat.gui.styl';
import 'utils/utils';
import config from 'editor/editor.json';
import right from 'resources/skyboxes/blueSky/right.jpg';
import left from 'resources/skyboxes/blueSky/left.jpg';
import top from 'resources/skyboxes/blueSky/top.jpg';
import bottom from 'resources/skyboxes/blueSky/bottom.jpg';
import front from 'resources/skyboxes/blueSky/front.jpg';
import back from 'resources/skyboxes/blueSky/back.jpg';

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

    this._createCamera();
    this._createScene();
    this._initMouse();
    this._initKeyboard();
    this._createGUI();

    this._resizeUnsubsribe = screen.on(
      SCREEN_EVENTS.RESIZE,
      this._updateFullScreenView.bind(this)
    );
  }

  render() {
    this._renderer.render(this._scene, this._camera);
  }

  destroy() {
    this._resizeUnsubsribe();
  }

  _createCamera() {
    const save = store.get('editor.r1.camera');
    // todo: change far to logical value
    this._camera = new THREE.PerspectiveCamera(45, screen.aspectRatio, 1, 1000000);
    if (save) {
      this._camera.position.fromArray(save.position);
    } else {
      this._camera.position.set(0, 1000, 1000);
    }
    this._camera.lookAt(new THREE.Vector3());

    this._controls = new THREE.OrbitControls(this._camera, this._renderer.domElement, {
      maxPolarAngle: Math.PI / 2
    });
    if (save) {
      this._controls.target = new THREE.Vector3().fromArray(save.target);
    }
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

      this._assetBBox = new THREE.BoxHelper(undefined, 0x00ff00);
      this._assetBBox.visible = false;
      this._scene.add(this._assetBBox);
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

  _mouseUpdate({event, delta: {x, y}, position}) {
    if (event) {
      if (mouseData.dragEnabled) {
        this._selectedAsset.position.copy(this._getPosition(position).sub(mouseData.dragDelta));
        this._assetBBox.update();
      }
      if (mouseData.rotationEnabled) {
        this._selectedAsset.rotation.y += x / 200;
        this._assetBBox.update();
      }
      if (mouseData.scaleEnabled) {
        const scale = this._selectedAsset.scale.x - y / 200;
        this._selectedAsset.scale.set(scale, scale, scale);
        this._assetBBox.update();
      }
      if (mouseData.dragVerticalEnabled) {
        this._selectedAsset.position.y -= y;
        this._assetBBox.update();
      }
    }
  }

  _initMouse() {
    const {EVENTS: {MOVE, UP, DOWN}, BUTTONS: {MAIN}} = MOUSE_ENUMS;
    mouse.subscribe(MOVE, this._mouseUpdate.bind(this), this._renderer.domElement);

    mouse.subscribe(DOWN, ({event, position}) => {
      switch (event.button) {
        case MAIN:
          this._selectAsset(event);
          if (this._selectedAsset) {
            if (keyboard.state.SHIFT) {
              mouseData.rotationEnabled = true;
            } else if (keyboard.state.CTRL) {
              mouseData.scaleEnabled = true;
            } else if (keyboard.state.ALT) {
              mouseData.dragVerticalEnabled = true;
            } else {
              mouseData.dragDelta = this._getPosition(position).sub(this._selectedAsset.position);
              mouseData.dragEnabled = true;
            }
          }
          break;
      }
    }, this._renderer.domElement);

    mouse.subscribe(UP, ({event}) => {
      switch (event.button) {
        case MAIN:
          mouseData.dragEnabled = false;
          mouseData.rotationEnabled = false;
          mouseData.scaleEnabled = false;
          mouseData.dragVerticalEnabled = false;
          break;
      }
    }, this._renderer.domElement);
  }

  _initKeyboard() {
    keyboard.on('DELETE', () => {
      if (this._selectedAsset) {
        this._scene.remove(this._selectedAsset);
        this._assets.splice(this._assets.indexOf(this._selectedAsset), 1);
        this._assetBBox.visible = false;
        this._selectedAsset = null;
      }
    });
  }

  _createGUI() {
    const gui = new utils.dat.GUI();
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
          target: this._controls.target.toArray()
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
          this._assetBBox.visible = false;
        });
        const loadedConfig = store.get(guiStorageKey);
        if (loadedConfig) {
          Object.assign(guiConfig.plane, loadedConfig.plane);
          Object.assign(guiConfig.lights, loadedConfig.lights);
          this._guiApply(guiConfig, guiChange);
        }
      }
    };

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

    guiChange.load();
    this._guiApply(guiConfig, guiChange);
  }

  _guiApply(guiConfig, guiChange) {
    Object.keys(guiChange).forEach(key => {
      if (typeof guiChange[key] === 'object') {
        Object.keys(guiChange[key]).forEach(subKey => {
          guiChange[key][subKey](guiConfig[key][subKey]);
        });
      } else if (guiConfig[key]) {
        guiChange[key](guiConfig[key]);
      }
    });
  }

  _getPosition({x, y}) {
    const vector = new THREE.Vector3();

    vector.set(
      (x / screen.width) * 2 - 1,
      -(y / screen.height) * 2 + 1,
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
      this._assetBBox.setFromObject(this._selectedAsset);
      this._assetBBox.visible = true;
    } else {
      this._selectedAsset = null;
      this._assetBBox.visible = false;
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
}