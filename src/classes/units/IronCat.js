import THREE from 'lib/three';
import {Unit} from './common/Unit';
import {normalizeAngle} from 'utils/utils';

export class IronCat extends Unit {
  static get name() {
    return 'Iron Cat';
  }

  constructor(mesh) {
    super();
    if (mesh) {
      this._parse(mesh);
    } else {
      this._promise = new Promise(resolve => {
        new THREE.FBXLoader().load('resources/tank/tank.FBX', mesh => {
          // todo: remove this after model will fix
          mesh.children[0].rotation.y = Math.PI / 2;
          this._parse(mesh);
          resolve(this);
        });
      });
    }
  }

  setTarget(target) {
    this._target = target;
  }

  setHeadAngle(angle) {
    angle -= this._mesh.rotation.y;
    this._head.rotation.z = normalizeAngle(angle);
  }

  update() {
    if (this._target) {
      const {x, z} = this._target.position.clone().sub(this._mesh.position);
      let angle = 0;
      if (x === 0) {
        angle = z > 0 ? Math.PI : 0;
      } else {
        angle = Math.atan(z / x);
        angle += x > 0 ? Math.PI / 2 : Math.PI / 2 * 3;
      }
      this.setHeadAngle(-angle);
    }
  }

  _parse(mesh) {
    const scale = 0.2;

    mesh.position.set(0, 8, 0);
    mesh.scale.set(scale, scale, scale);
    mesh.children[0].castShadow = true;
    mesh.children[0].children.forEach(mesh => {
      mesh.castShadow = true;
    });

    this._mesh = mesh;
    this._head = mesh.children[0].children[5];
    this._target = null;
  }
}