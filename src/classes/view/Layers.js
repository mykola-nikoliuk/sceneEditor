import {View} from 'view/View';
import THREE from 'lib/three';
import {screenService} from 'general/ScreenService';

export class LayersView extends View {
  constructor(renderer) {
    super(renderer);
    const halfWidth = 100 * screenService.aspectRatio / 2;

    this._layers = [];
    this._scene = new THREE.Scene();
    this._camera = new THREE.OrthographicCamera(-halfWidth, halfWidth, 50, -50, 1, 100);

    this._plane = new THREE.PlaneGeometry(1, 1);
    this._camera.position.set(0, 0, 100);
    this._camera.lookAt(new THREE.Vector3());
    this._scene.add(new THREE.AmbientLight(0xffffff));
  }

  addLayer(renderTarget) {
    const mesh = new THREE.Mesh(this._plane, new THREE.MeshBasicMaterial({
      map: renderTarget.texture,
      transparent: true
    }));
    const layer = {
      renderTarget,
      mesh
    };
    mesh.position.z = this._layers.length;
    mesh.scale.set(100 * screenService.aspectRatio, 100, 1);

    this._scene.add(mesh);
    this._layers.push(layer);
    return this._removeLayer.bind(this, layer);
  }

  _removeLayer(layer) {
    this._scene.remove(layer.mesh);
    this._layers.splice(this._layers.indexOf(layer), 1);
    this._layers.forEach((layer, index) => {
      layer.mesh.position.z = index;
    });
  }
}