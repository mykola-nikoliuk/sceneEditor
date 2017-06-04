import THREE from "./lib/three";
import "./style/index.styl";
import Car from "./classes/car/Car";
import "./utils/utils"
import keyboard from "./classes/Keyboard";

import bmwOBJ from "./resources/bmwm3/BMW_M3_GTR.obj";
import bmwMTL from "./resources/bmwm3/BMW_M3_GTR.mtl";
import wheelOBJ from "./resources/wheel/disk_g.obj";
import wheelMTL from "./resources/wheel/disk_g.mtl";

const {PI} = Math;

const renderer = new THREE.WebGLRenderer();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000000);
const scene = new THREE.Scene();
const aLight = new THREE.AmbientLight(0xffffff, 0.5);
const pLight = new THREE.DirectionalLight(0xffffff, 1);

let previousTimestamp = 0;

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// const car = createCar();

let bmw, car, wheel;
THREE.OBJMTLLoader.load(bmwOBJ, bmwMTL, 'resources/bmwm3/').then(obj => {
    scene.add(obj);
    bmw = obj;
    const scale = 0.1;
    bmw.scale.set(scale, scale, scale);
    let i = 0;
    // setInterval(() => {
    //     bmw.children[i].visible = true;
    //     if (i >= bmw.children.length - 1) {
    //         index = -1;
    //     }
    //     bmw.children[++i].visible = false;
    //     console.log(i);
    // }, 500);
    [30, 31, 36, 37, 42, 43, 48, 49].forEach(index => {
        bmw.children[index].visible = false;
    });
    bmw.children[32].transparent = true;
    // bmw.rotation.y = PI + PI / 2;

    THREE.OBJMTLLoader.load(wheelOBJ, wheelMTL, 'resources/wheel/').then(obj => {
        const scale = 2200;
        wheel = obj;
        wheel.scale.set(scale, scale, scale);
        car = createCar();
        render(previousTimestamp);
    });
});


scene.add(aLight);
scene.add(pLight);

camera.position.set(1300, 1300, 1200);
camera.lookAt(new THREE.Vector3(0,0,0));

renderer.setClearColor(0x222222);
renderer.shadowMapEnabled = true;
renderer.shadowMapType = THREE.PCFSoftShadowMap;

function createCar() {
    const radius = 1200;
    const wheelMaterial = new THREE.MeshStandardMaterial({color: 0xff0000, wireframe: !true});

    const wheelGeometry = new THREE.CylinderGeometry(radius, radius, 1000, 12, 1);
    const wheelMesh = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheelMesh.rotation.x = PI / 2;
    const wheelGroup = new THREE.Group();
    wheelGroup.add(wheel);

    const car = new Car(bmw, {
        axels: [{
            mesh: wheelGroup,
            width: 5000,
            maxAngle: PI / 3,
            camber: (-5).toRadians(),
            convergence: (.5).toRadians(),
            maxAngleCamber: 0,
            rotationPointOffset: 30,
            offset: new THREE.Vector2(5280, 1080)
        }, {
            mesh: wheelGroup,
            width: 5000,
            offset: new THREE.Vector2(-3700, 1100)
        }]
    });

    car.mesh.castShadow = true;
    car.mesh.receiveShadow = true;


    car.mesh.rotation.y = PI / 2;
    // car.mesh.position.z = 600;
    scene.add(car.mesh);

    return car;
}

const cubeG = new THREE.CubeGeometry(100, 100, 100, 1, 1, 1);
const cubeM = new THREE.MeshStandardMaterial({color: 0xff0000});
const cube = new THREE.Mesh(cubeG, cubeM);
cube.castShadow = true;
cube.position.y = 600;
scene.add(cube);


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
    bmw.rotation.y += 0.005;
    // car.position.z += 0.1;
    car.update(delta);
    renderer.render(scene, camera);
}