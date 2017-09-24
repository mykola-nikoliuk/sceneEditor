/*global ENVIRONMENT*/
/*eslint-env node*/
let THREE;
if (ENVIRONMENT === 'production') {
  THREE = require('three/build/three.min');
} else {
  THREE = require('three');
}


THREE.Vector3.prototype.angleTo = function (point) {
  const {x, z} = point.clone().sub(this);
  let angle = 0;
  if (x === 0) {
    angle = z > 0 ? Math.PI : 0;
  } else {
    angle = Math.atan(z / x);
    angle += x > 0 ? Math.PI / 2 : Math.PI / 2 * 3;
  }
  return angle;
};

THREE.Object3D.prototype.dispose = function (deep) {
  this.geometry && this.geometry.dispose();
  if (this.material) {
    if (Array.isArray(this.material)) {
      this.material.forEach(material => material.dispose());
    } else {
      this.material.dispose();
    }
  }
  if (deep && this.children) {
    this.children.forEach(child => {
      child.dispose && child.dispose(deep);
    });
  }
};

THREE.Vector2.prototype.isBetween = function (p1, p2) {
  const max = new THREE.Vector2(
    p1.x > p2.x ? p1.x : p2.x,
    p1.y > p2.y ? p1.y : p2.y
  );
  const min = new THREE.Vector2(
    p1.x > p2.x ? p2.x : p1.x,
    p1.y > p2.y ? p2.y : p1.y
  );

  return this.x > min.x && this.x < max.x && this.y > min.y && this.y < max.y;
};

export default THREE;