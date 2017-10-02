import THREE from 'lib/three-lite';
import {View} from 'view/View';
import fontURL from 'fonts/helvetiker_regular.typeface.json';
import {screenService, SCREEN_EVENTS} from 'general/ScreenService'

const cameraDepth = 100;
const cubeSize = 10;

export class LoadingView extends View {
  constructor(renderer) {
    super(renderer);
    this._scene = new THREE.Scene();
    this._camera = new THREE.PerspectiveCamera(45, screenService.aspectRatio, 1, cameraDepth * 2);
    this._camera.position.z = -cameraDepth;
    this._camera.lookAt(new THREE.Vector3);
    this._createScene();
    this._resizeUnsubsribe = screenService.on(
      SCREEN_EVENTS.RESIZE,
      this._onResize.bind(this)
    );
  }

  render(delta) {
    this._cube.rotation.x += delta / 500;
    this._cube.rotation.y += delta / 1000;

    this._text.rotation.y = Math.sin(Date.now() / 500 % 1000) * 0.3;
    super.render(delta);
  }

  destroy() {
    this._resizeUnsubsribe();
    super.destroy();
  }

  _createScene() {
    const material = new THREE.MeshPhongMaterial({color: 0xff0000});
    const geometry = new THREE.CubeGeometry(cubeSize, cubeSize, cubeSize);
    this._cube = new THREE.Mesh(geometry, material);
    this._scene.add(this._cube);

    const light = new THREE.PointLight(0xffffff, 1, cameraDepth);
    light.position.set(0, 0, -cameraDepth / 2);
    light.lookAt(this._cube.position);
    this._scene.add(light);

    const font = new THREE.FontLoader().parse(fontURL);

    const textGeometry = new THREE.TextGeometry("LOADING", {
      font: font,
      size: 2,
      height: 1,
      curveSegments: 2
    });
    textGeometry.computeBoundingBox();

    const materials = [
      new THREE.MeshPhongMaterial({color: 0xffffff, overdraw: 0.5}),
      new THREE.MeshPhongMaterial({color: 0x808080, overdraw: 0.5})
    ];

    const mesh = new THREE.Mesh(textGeometry, materials);

    mesh.rotation.y = Math.PI;
    mesh.position.set(
      0.5 * (textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x),
      -16,
      0.5 * (textGeometry.boundingBox.max.z - textGeometry.boundingBox.min.z),
    );
    const group = new THREE.Group();
    group.add(mesh);

    this._text = group;
    this._scene.add(this._text);
  }
}