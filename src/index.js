/* eslint-env node */
import THREE from 'lib/three-lite';
import './style/index.styl';
import {screenService, SCREEN_EVENTS} from 'general/ScreenService';
import {LoadingView} from 'view/Loading';

let renderer = null;
let previousTimestamp = 0;
let view;

createRenderer();
createLoadingView();

function createRenderer() {
  renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
  renderer.setSize(screenService.width, screenService.height);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.BasicShadowMap;
  document.body.appendChild(renderer.domElement);

  screenService.on(SCREEN_EVENTS.RESIZE, () => {
    renderer.setSize(screenService.width, screenService.height);
  });
}

function createLoadingView() {
  new LoadingView(renderer).onLoad(loadingView => {
    view = loadingView;
    render(previousTimestamp);
    require.ensure([], require => {
      // const ViewClass = require('view/Material').MaterialView;
      const ViewClass = require('view/Editor').EditorView;
      const viewInstance = new ViewClass(renderer);
      viewInstance.onLoad(() => {
        view.destroy();
        view = viewInstance;
      });
    });
  });
}

function render(timestamp) {
  const delta = timestamp - previousTimestamp;
  previousTimestamp = timestamp;

  if (view) {
    view.update(delta);
    view.render(delta);
  }
  requestAnimationFrame(render);
}