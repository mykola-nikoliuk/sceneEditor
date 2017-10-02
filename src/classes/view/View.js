import {Defer} from 'general/Defer';
import {screenService} from 'general/ScreenService';

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

  _onResize() {
    this._camera.aspect = screenService.aspectRatio;
    this._camera.updateProjectionMatrix();
    this._renderTarget.setSize(screenService.width, screenService.height);
  }
}