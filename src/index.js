import THREE from "./lib/three";
import "./style/index.styl";
import "./utils/utils"
import keyboard from "./classes/Keyboard";
import carPromise from "./classes/DriftCar";

const {PI} = Math;

const renderer = new THREE.WebGLRenderer({ antialias: true});
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000000);
const scene = new THREE.Scene();
const aLight = new THREE.AmbientLight(0xffffff, 1);
const pLight = new THREE.SpotLight(0xffffff, 1, 5000, 0.5);

let previousTimestamp = 0;

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


pLight.position.y = 1000;
pLight.position.x = 2000;
pLight.castShadow = true;
scene.add(pLight);
scene.add(aLight);

const cubemapImages = [
  'resources/cubemap/right.jpg',
  'resources/cubemap/left.jpg',
  'resources/cubemap/top.jpg',
  'resources/cubemap/bottom.jpg',
  'resources/cubemap/front.jpg',
  'resources/cubemap/back.jpg'
];
scene.background = new THREE.CubeTextureLoader().load(cubemapImages);

renderer.setClearColor(0x222222);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const asphaltTexture = new THREE.TextureLoader().load('resources/asphalt/asphalt.jpg');
asphaltTexture.wrapT = THREE.RepeatWrapping;
asphaltTexture.wrapS = THREE.RepeatWrapping;
asphaltTexture.repeat.set(400, 400);
const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(100000, 100000),
    new THREE.MeshPhongMaterial({map: asphaltTexture})
);

plane.receiveShadow = true;
plane.rotation.x = -PI / 2;
scene.add(plane);



let car;
carPromise.then(driftCar => {
    car = driftCar;
    driftCar.mesh.position.y = -10;
    scene.add(driftCar.mesh);
    render(previousTimestamp);
});

camera.lookAt(new THREE.Vector3());
const cameraRotation = new THREE.Vector2();
const R = 2000;




function render(timestamp) {
    const delta = timestamp - previousTimestamp;
    previousTimestamp = timestamp;
    const {W, S, LEFT, RIGHT, UP, DOWN} = keyboard.state;
    const cameraSpeed = delta * 0.1;

    // if (LEFT) camera.position.x += cameraSpeed;
    // if (RIGHT) camera.position.x -= cameraSpeed;
    // if (UP) camera.position.z += cameraSpeed;
    // if (DOWN) camera.position.z -= cameraSpeed;
    // if (W) camera.position.y += cameraSpeed;
    // if (S) camera.position.y -= cameraSpeed;

    window.requestAnimationFrame(render);
    // car.mesh.rotation.y += 0.005;
    // car.mesh.position.z -= 2;
    car.update(delta);

    // camera.rotation.copy(car.mesh.rotation);
    // camera.position.set(
    //     R * Math.cos(cameraRotation.x),
    //     R * Math.sin(cameraRotation.x) * Math.sin(cameraRotation.y),
    //     R * Math.sin(cameraRotation.x) * Math.cos(cameraRotation.y)
    // ).add(car.mesh.position);
    // cameraRotation.y = (cameraRotation.y + 0.001);
    // cameraRotation.x = (cameraRotation.x + 0.01);
    // cameraRotation.y = cameraRotation.y - 0.001  % Math.PI;
    // camera.lookAt(car.mesh.position);
    // cameraRotation.rotation.y += 0.01;

    camera.position.x =
    camera.position.y =
    camera.position.z = 1500;
    camera.lookAt(car.mesh.position);

    renderer.render(scene, camera);
}