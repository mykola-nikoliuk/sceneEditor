import THREE from '../lib/three';
import Mesh from 'common/Mesh'

export default class Box extends Mesh {
  constructor(size) {
    super();
    const material = new THREE.MeshBasicMaterial({color: 0xffffff});
    const geometry = new THREE.CubeGeometry(size, size, size);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = size / 2;
    this._mesh = new THREE.Group().add(mesh)
  }
}