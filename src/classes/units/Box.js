import THREE from '../../lib/three';
import Unit from './Unit';

export default class Box extends Unit {
  constructor(size) {
    super();
    const material = new THREE.MeshBasicMaterial({color: Math.random() * 0xffffff | 0});
    const geometry = new THREE.CubeGeometry(size, size, size);
    this._mesh = new THREE.Mesh(geometry, material);
  }
}