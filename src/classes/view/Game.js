import THREE from 'lib/three';
import {View} from 'view/View';
import {screenService, SCREEN_EVENTS} from 'general/ScreenService';
import {Plane} from 'maps/maps';
import {UNITS} from 'units/common/UnitsFactory';
import store from 'store';
import mouse, {ENUMS as MOUSE_ENUMS} from 'input/Mouse';
import {normalizeAngle} from 'utils/utils';
import AnimationManager, {
  Animation,
  Keyframe,
  UPDATE_VECTOR3,
  UPDATE_NUMBER
} from 'animationManager/AnimationManager';

const cameraLimit = Math.PI / 720;
const selectorOpacity = 0.5;
const animationManager = new AnimationManager();

export class GameView extends View {
  constructor(renderer) {
    super(renderer);
    this._scene = new THREE.Scene();
    this._target = new THREE.Vector3(0, 0, 0);

    this._createCamera();
    this._createScene();
    this._initMouse();
    this._createSelector();

    this._resizeUnsubsribe = screenService.on(
      SCREEN_EVENTS.RESIZE,
      this._onResize.bind(this)
    );
  }

  render(delta) {
    // super.render(delta);
    animationManager.update(delta);

    this._camera.position.copy(this._cameraPosition).add(this._target);
    this._camera.lookAt(this._target);

    this._map.render(delta);
    this._renderer.render(this._map.scene, this._camera);
  }

  destroy() {
    this._resizeUnsubsribe();
  }

  _createCamera() {
    // todo: change far to logical value
    this._cameraPosition = new THREE.Vector3();
    this._camera = new THREE.PerspectiveCamera(45, screenService.aspectRatio, 1, 1000000);

    this._cameraData = store.get('cameraData') || {
      theta: Math.PI / 2 + Math.PI / 32,
      phi: Math.PI / 24,
      radius: 500,
      rotationEnabled: false
    };
    this._mouseUpdate({delta: {x: 0, y: 0}});
  }

  _createScene() {
    this._promise = new Promise(resolve => {
      this._raycaster = new THREE.Raycaster();

      this._selectedUnits = [];

      this._map = new Plane({renderer: this._renderer, camera: this._camera});
      this._map.onLoad(() => {
        let units = 24;
        this._units = [];
        this._unitsMeshes = [];
        while (units--) {
          const unit = this._map.getUnit(UNITS.IRON_CAT);
          unit.mesh.position.x = Math.random() * this._map.size.x - this._map.size.x / 2;
          unit.mesh.position.z = Math.random() * this._map.size.z - this._map.size.z / 2;
          this._map.scene.add(unit.mesh);
          this._map.addToUpdate(unit);
          this._units.push(unit);
          this._unitsMeshes.push(unit.mesh.children[0]);
        }
        resolve(this);
      });
    });
  }

  _cameraScale(e, {y}) {
    this._cameraData.radius = (this._cameraData.radius + y / 10).fitToRange(1, Infinity);
    this._mouseUpdate({e, delta: {x: 0, y: 0}});
  }

  _mouseUpdate({event, delta: {x, y}}) {
    const position = new THREE.Vector3();

    // if (event && moveEnabled) {
    //unit.mesh.position.copy(getPosition(event));
    // position.copy(getPosition(event).sub(lastClickPosition));
    // target.add(getPosition(previousEvent).sub(getPosition(event)));
    // console.log(target);
    // console.log('-');
    // }


    if (event) {
      if (this._selector.start) {
        this._selector.end = this._getPosition(event);
        this._updateSelector();
      }
    }

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
    const {EVENTS: {MOVE, UP, DOWN, WHEEL, CONTEXT}, BUTTONS: {MAIN, MIDDLE, SECOND}} = MOUSE_ENUMS;
    mouse.subscribe(MOVE, this._mouseUpdate.bind(this));

    mouse.subscribe(DOWN, e => {
      switch (e.button) {
        case MAIN:
          this._selector.start = this._getPosition(event);
          this._selector.end = this._selector.start.clone();
          this._updateSelector();
          break;
        case SECOND:
          const side = Math.ceil(Math.sqrt(this._selectedUnits.length));
          const position = this._getPosition(event);
          this._selectedUnits.forEach((unit, index) => {
            const row = index / side | 0;
            const column = index % side;
            const point = position.clone();
            point.x += (row - (side - 1) / 2) * 80;
            point.z += (column - (side - 1) / 2) * 80;
            this._animateUnit(unit, point);
          });
          this._cameraData.rotationEnabled = true;
          break;
      }
    });

    mouse.subscribe(UP, e => {
      switch (e.button) {
        case MAIN:
          this._selectUnits();
          this._selector.start = null;
          this._updateSelector();
          break;
        case MIDDLE:
          // unit.setTarget({position: getPosition(e)});
          break;
        case SECOND:
          this._cameraData.rotationEnabled = false;
          break;
      }
    });

    mouse.subscribe(CONTEXT, e => {
      e.preventDefault();
    });
    mouse.subscribe(WHEEL, this._cameraScale.bind(this));
  }

  _animateUnit(unit, position, index = 0) {

    // todo: make it look better
    const speed = 100;
    const path = this._map._terrain.findPath(unit.mesh.position, position);

    if (path.length) {
      let keyframes = [];
      let angle = null;

      for (let i = 0; i < path.length; i++) {
        path[i].y = unit.mesh.position.y;
        if (i < path.length - 1) {
          if (i === 0) {
            angle = path[i].angleTo(path[i + 1]);
          } else {
            // const spin = Math.PI * 2;
            const newAngle = path[i].angleTo(path[i + 1]);
            const normalizedAngle = normalizeAngle(angle);
            const delta = newAngle - normalizedAngle;
            const abs = Math.abs(delta);
            if (abs > Math.PI) {
              angle -= -Math.PI * 2 - delta;
            } else {
              angle += delta
            }
          }
          keyframes.push(new Keyframe({
            position: path[i],
            'rotation.y': -angle
          }));
        } else {

        }
      }
      // const keyframes = map(path, position => {
      //   position.y = unit.mesh.position.y;
      //   return new Keyframe({position});
      // });

      if (unit.animation) {
        animationManager.remove(unit.animation);
      }
      unit.animation = new Animation({
        target: unit.mesh,
        duration: speed * path.length,
        keyframes,
        updateFunctions: {
          position: UPDATE_VECTOR3,
          'rotation.y': UPDATE_NUMBER
        }
      });
      // console.log(terrain.getClosest(getPosition(event)));
      animationManager.animate(unit.animation);
    }
  };

  _getPosition(event) {
    const vector = new THREE.Vector3();

    vector.set(
      (event.clientX / screenService.width) * 2 - 1,
      -(event.clientY / screenService.height) * 2 + 1,
      0.5,
    );

    vector.unproject(this._camera);

    const position = this._camera.position.clone();
    const dir = vector.sub(position).normalize();

    const distance = -position.y / dir.y;

    return position.add(dir.multiplyScalar(distance));
  }

  _createSelector() {
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshPhongMaterial({
        color: 0xff0000,
        opacity: selectorOpacity,
        transparent: true
      })
    );

    plane.rotation.x = -Math.PI / 2;

    this._map.scene.add(plane);

    this._selector = {
      enabled: false,
      plane,
      start: null,
      end: null
    }
  }

  _updateSelector() {
    const {start, end, plane, enabled} = this._selector;

    if (start && !enabled) {
      if (plane.animation) {
        animationManager.remove(plane.animation);
        plane.animation = null;
      }
      plane.material.opacity = selectorOpacity;
    }

    if (enabled && !start) {
      animationManager.animate(
        plane.animation = new Animation({
          target: plane.material,
          keyframes: [
            new Keyframe({opacity: selectorOpacity}),
            new Keyframe({opacity: 0})
          ],
          updateFunctions: {opacity: UPDATE_NUMBER},
          duration: 200
        })
      );
    }

    if (this._selector.start) {
      const delta = end.clone().sub(start);
      delta.x = delta.x === 0 ? 0.01 : delta.x;
      delta.y = delta.y === 0 ? 0.01 : delta.y;
      delta.z = delta.z === 0 ? 0.01 : delta.z;
      // delta = new THREE.Vector3(10, 0, 10);

      plane.scale.set(Math.abs(delta.x), Math.abs(delta.z), 1);
      plane.position.set(
        delta.x / 2 + start.x,
        0.1,
        delta.z / 2 + start.z,
      );
    }

    this._selector.enabled = !!this._selector.start;
  }

  _selectUnits() {
    this._selectedUnits = [];
    this._units.forEach(unit => {
      const {start, end} = this._selector;
      const position = unit.mesh.position;
      const point = new THREE.Vector2(position.x, position.z);
      const isNeedToSelect = point.isBetween(
        new THREE.Vector2(start.x, start.z),
        new THREE.Vector2(end.x, end.z),
      );

      if (isNeedToSelect) {
        this._selectedUnits.push(unit);
      }
    });
    console.log(this._selectedUnits);
    // const mouse = {
    //   x: ( event.clientX / screenService.width ) * 2 - 1,
    //   y: -( event.clientY / screenService.height ) * 2 + 1
    // };
    // this._raycaster.setFromCamera(mouse, this._camera);
    // const objects = this._raycaster.intersectObjects(this._unitsMeshes);
    // if (objects.length) {
    //   const mesh = objects[0].object;
    //   this._units.forEach(unit => {
    //     if (unit.mesh.children[0] === mesh) {
    //       this._selectedUnit = unit;
    //     }
    //   })
    // } else {
    //   if (this._selectedUnit) {
    //     this._animateUnit(this._selectedUnit, this._getPosition(event));
    //   }
    // }
  }
}