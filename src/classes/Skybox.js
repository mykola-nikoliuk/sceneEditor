import THREE from 'lib/three';
import Mesh from 'common/Mesh';

export default class SkyBox extends Mesh {
  constructor(images, size) {
    super();

    let resolvePromise = null;
    const cubeShader = THREE.ShaderLib['cube'];

    this._promise = new Promise(resolve => {
      cubeShader.uniforms['tCube'].value = new THREE.CubeTextureLoader()
        .load(images, () => {
          if (this._mesh) {
            resolve(this._mesh);
          } else {
            resolvePromise = resolve;
          }
        });
    });

    const skyBoxMaterial = new THREE.ShaderMaterial({
      fragmentShader: cubeShader.fragmentShader,
      vertexShader: cubeShader.vertexShader,
      uniforms: cubeShader.uniforms,
      depthWrite: false,
      side: THREE.BackSide
    });

    this._mesh = new THREE.Mesh(
      new THREE.BoxGeometry(size, size, size),
      skyBoxMaterial
    );

    if (resolvePromise) {
      resolvePromise(this._mesh);
    }
  }
}