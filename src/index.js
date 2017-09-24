/* eslint-env node */
import * as THREE from 'three/build/three.min';
import './style/index.styl';
import {screen, SCREEN_EVENTS} from 'general/Screen';
import {LoadingView} from 'view/Loading';

let renderer = null;
let previousTimestamp = 0;
let view;

createRenderer();
createLoadingView();

function createRenderer() {
  renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setSize(screen.width, screen.height);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.BasicShadowMap;
  document.body.appendChild(renderer.domElement);

  screen.on(SCREEN_EVENTS.RESIZE, () => {
    renderer.setSize(screen.width, screen.height);
  });
}

function createLoadingView() {
  new LoadingView(renderer).onLoad(loadingView => {
    view = loadingView;
    render(previousTimestamp);
    require.ensure([], require => {
      // const ViewClass = require('view/Material').MaterialView;
      const ViewClass = require('view/Editor').EditorView;
      new ViewClass(renderer).onLoad(viewInstance => {
        view.destroy();
        view = viewInstance;
      });
    });
  });
}

function render(timestamp) {
  const delta = timestamp - previousTimestamp;
  previousTimestamp = timestamp;

  view && view.render(delta);
  requestAnimationFrame(render);
}