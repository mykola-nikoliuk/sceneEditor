import THREE from '../../lib/three';
import Unit from './Unit';

export default class Box extends Unit {
  constructor(size) {
    super();
    const material = new THREE.MeshBasicMaterial({color: Math.random() * 0xffffff | 0});
    const geometry = new THREE.CubeGeometry(size, size, size);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = size / 2;
    this._mesh = new THREE.Group().add(mesh)
  }
}