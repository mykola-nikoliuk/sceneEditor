import {Defer} from 'general/Defer';
import {screen} from 'general/Screen';

export class View extends Defer {
  constructor(renderer) {
    super();
    this._renderer = renderer;
    this._camera = null;
    this._scene = null;
  }

  get camera() {
    return this._camera;
  }

  get scene() {
    return this._scene;
  }

  render() {
    this._renderer.render(this._scene, this._camera);
  }

  destroy() {
    this._scene.dispose(true);
    this._camera = null;
    this._scene = null;
  }

  _updateFullScreenView() {
    this._camera.aspect = screen.aspectRatio;
    this._camera.updateProjectionMatrix();
  }
}