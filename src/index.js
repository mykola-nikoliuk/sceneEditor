import THREE from "./lib/three";
import "./style/index.styl";
import {loadImage} from "./utils/utils";
import big_labyrinth from "./resources/map/big_labyrinth.png"
import circle_labyrinth from "./resources/map/circle_labyrinth.png"
import map from "./resources/map/map.png"
import labyrinth from "./resources/map/labirynth.png"
import heightMapData from "./resources/terrain/heightMap.png";
// import keyboard from "./classes/Keyboard";
import mouse, {ENUMS as MOUSE_ENUMS} from "./classes/Mouse";
import utils from "threejs-utils";
import {NEIGHBORHOOD} from './constants/config';
import Terrain from './classes/Terrain';

const textures = {map, labyrinth, circle_labyrinth, big_labyrinth};
const gui = new utils.dat.GUI();
const {PI} = Math;
let terrain = null;
// const config = {
//     neighborhood: NEIGHBORHOOD.VON_NEUMANN,
//     map: 'map',
//     terrain: false,
//     upload: () => {
//         const input = document.createElement('input');
//         input.type = 'file';
//         input.addEventListener('change', () => {
//             if (input.files.length) {
//                 const reader = new FileReader();
//                 reader.onload = e => {
//                     loadImage(e.target.result, init);
//                 };
//                 reader.readAsDataURL(input.files[0]);
//             }
//         });
//         input.click();
//     }
// };
// gui.add(
//     config,
//     'neighborhood',
//     [NEIGHBORHOOD.VON_NEUMANN, NEIGHBORHOOD.MOORE]
// ).onChange(() => init(lastTexture));
// gui.add(
//     config,
//     'map',
//     Object.keys(textures)
// ).onChange(() => loadImage(textures[config.map], init));
// gui.add(
//     config,
//     'terrain'
// ).onChange(() => init(lastTexture));
// gui.add(config, 'upload');

const config = {
    upload: () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.addEventListener('change', () => {
            if (input.files.length) {
                const reader = new FileReader();
                reader.onload = e => {
                    init(e.target.result);
                };
                reader.readAsDataURL(input.files[0]);
            }
        });
        input.click();
    }
};
gui.add(config, 'upload');

(() => {
    const {EVENTS: {MOVE, UP, DOWN, WHEEL, CONTEXT}, BUTTONS: {MAIN, MIDDLE, SECOND}} = MOUSE_ENUMS;
    mouse.subscribe(MOVE, mouseUpdate);
    mouse.subscribe(UP, e => {
        switch (e.button) {
            case MIDDLE:
                moveEnabled = false;
                break;
            case MAIN:
            case SECOND:
                rotationEnabled = false;
                break;
        }
    });
    mouse.subscribe(DOWN, e => {
        switch (e.button) {
            case MIDDLE:
                moveEnabled = true;
                break;
            case MAIN:
            case SECOND:
                rotationEnabled = true;
                break;
        }
    });
    mouse.subscribe(CONTEXT, e => {
        e.preventDefault();
    });
    mouse.subscribe(WHEEL, scale);
})();

const renderer = new THREE.WebGLRenderer({antialias: true});
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 1000000);
const scene = new THREE.Scene();
const aLight = new THREE.AmbientLight(0xffffff, 1);
const pLight = new THREE.SpotLight(0xffffff, 1, 200, Math.PI / 2);
const cubeGeometry = new THREE.CubeGeometry(1, 1, 1);
// scene.add(aLight);
scene.add(pLight);
pLight.position.y = 128;
pLight.lookAt(new THREE.Vector3());

let previousTimestamp = 0;
let subScene = null;
let lastTexture = null;
let lastClickPosition = null;

let previousEvent;
const target = new THREE.Vector3(10, 0, 10);

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

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

render(previousTimestamp);


const cube = new THREE.Mesh(
    new THREE.CubeGeometry(2, 2, 2),
    new THREE.MeshStandardMaterial({color: 0xff})
);
//scene.add(cube);



let center = new THREE.Vector3();
camera.position.y = 1500;
camera.lookAt(center);

let theta = -0,
    phi = -Math.PI / 2;
let rotationEnabled = false,
    moveEnabled = false,
    radius = 160;
mouseUpdate({delta: {x: 0, y: 0}});


init(heightMapData);
// loadImage(textures[config.map], init);

function scale({y}) {
    radius = (radius +  y / 10).fitToRange(1, Infinity);
    mouseUpdate({delta: {x: 0, y: 0}});
}

function getPosition(event) {
    const vector = new THREE.Vector3();

    vector.set(
        ( event.clientX / window.innerWidth ) * 2 - 1,
        -( event.clientY / window.innerHeight ) * 2 + 1,
        0.5,
    );

    vector.unproject(camera);

    const position = camera.position.clone();
    const dir = vector.sub(position).normalize();

    const distance = -position.y / dir.y;

    return position.add(dir.multiplyScalar(distance));
}

function mouseUpdate({event, delta: {x, y}}) {
    const limit = Math.PI / 720;
    const position = new THREE.Vector3();

    if (event && moveEnabled) {
        cube.position.add(getPosition(event).sub(getPosition(previousEvent)));
        // position.copy(getPosition(event).sub(lastClickPosition));
        // target.add(getPosition(previousEvent).sub(getPosition(event)));
        // console.log(target);
        // console.log('-');
    }

    if (rotationEnabled) {
        theta = (theta + y / 500).fitToRange(-Math.PI / 2 + limit, -limit);
        phi += x / 500;
    }

    // Turn back into Cartesian coordinates
    position.x = radius * Math.sin(theta) * Math.cos(phi);
    position.z = radius * Math.sin(theta) * Math.sin(phi);
    position.y = radius * Math.cos(theta);

    position.add(target);

    camera.position.copy(position);
    camera.lookAt(target);

    if (event) {
        previousEvent = event;
    }
    console.log('camera changed');

}

function init(mapImage) {
    if (subScene) {
        scene.remove(subScene);
    }
    subScene = new THREE.Group();
    scene.add(subScene);
    // createMap(mapImage);
    lastTexture = mapImage;


    new Terrain(mapImage, 128, 16, 128, mesh => {
        subScene.add(mesh);
    });

}

function createMap(mapImage) {
    const map = parseMap(mapImage);
    const planeMaterial = new THREE.MeshPhongMaterial({
        map: new THREE.CanvasTexture(map.canvas),
    });
    planeMaterial.map.minFilter = THREE.NearestFilter;
    planeMaterial.map.magFilter = THREE.NearestFilter;

    const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(mapImage.width, mapImage.height),
        planeMaterial
    );

    plane.receiveShadow = true;
    plane.rotation.x = -PI / 2;
    subScene.add(plane);

    if (config.terrain) {
        createScene(mapImage.width, mapImage.height, map.field, map.colors);
    }
}

function parseMap(image) {
    let start = null;
    let end = null;

    const canvas = document.createElement('canvas');
    const contex = canvas.getContext('2d');
    canvas.width = image.width;
    canvas.height = image.height;
    contex.drawImage(image, 0, 0, canvas.width, canvas.height);

    const imageData = contex.getImageData(0, 0, canvas.width, canvas.height);
    const imageDataSize = canvas.width * canvas.height * 4;
    const field = [];
    const colors = [];
    for (let i = 0; i < imageDataSize; i += 4) {
        const x = i / 4 % canvas.width;
        const y = i / 4 / canvas.width | 0;

        if (!field[y]) {
            field[y] = [];
            colors[y] = [];
        }
        if (!start && (imageData.data[i + 1] > 200) && (imageData.data[i] + imageData.data[i + 2] < 200)) {
            start = {x, y};
        }
        if (!end && imageData.data[i] > 200 && imageData.data[i + 1] + imageData.data[i + 2] < 200) {
            end = {x, y};
        }
        field[y][x] = imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2] === 765 ? 1 : 0;
        colors[y][x] = (imageData.data[i] << 16) | (imageData.data[i + 1] << 8) | (imageData.data[i + 2])
    }

    if (!start) start = {x: 0, y: 0};
    if (!end) end = {x: image.width - 1, y: image.height - 1};
    field[end.y][end.x] = 2;

    const path = findPath(field, start, setPixel);

    path.forEach(({x, y}) => {
        setPixel(x, y, [255, 0, 0, 1]);
    });

    function setPixel(x, y, color) {
        const offset = (canvas.width * y + x) * 4;
        color.forEach((item, index) => {
            imageData.data[offset + index] = color[index];
        });
    }

    contex.putImageData(imageData, 0, 0);

    return {canvas, field, colors};

}

function createScene(width, height, field, colors) {
    const maxHeight = 10;
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    field.forEach((row, y) => {
        const offsetY = y + .5;

        row.forEach((cell, x) => {
            const offsetX = x + .5;

            if (cell === 0) {
                let cube = new THREE.Mesh(
                    cubeGeometry,
                    new THREE.MeshStandardMaterial({color: colors[y][x]})
                );
                const percent = 1 - ((colors[y][x] >> 16) + ((colors[y][x] & 0xff00) >> 8) + (colors[y][x] & 0xff)) / (255 * 3);
                cube.position.set(offsetX - halfWidth, maxHeight * percent / 2, offsetY - halfHeight);
                cube.scale.y = maxHeight * percent;
                subScene.add(cube);
            }
        });
    });
}

function findPath(field, start, setPixel) {

    let result = [];
    let pathField = [];
    let positions = [start];
    let value = 1;
    let pathFound = false;
    let end = null;
    let offsets = [
        [-1, 0], [0, 1], [1, 0], [0, -1]
    ];
    if (config.neighborhood === NEIGHBORHOOD.MOORE) {
        offsets.push([-1, 1], [1, 1], [1, -1], [-1, -1])
    }

    pathField[start.y] = [];
    pathField[start.y][start.x] = 0;

    while (true) {
        const color = [Math.random() * 255 | 0, Math.random() * 255 | 0, Math.random() * 255 | 0, 1];
        const nextWavePositions = [];

        for (let pos = 0; pos < positions.length; pos++) {
            const {x, y} = positions[pos];

            for (let index = 0; index < offsets.length; index++) {
                let {0: i, 1: j} = offsets[index];
                i += x;
                j += y;

                if (field[j] && field[j][i]) {
                    if (field[j][i] === 2) {
                        end = {x: i, y: j, value};
                        break;
                    } else {
                        if (!pathField[j]) {
                            pathField[j] = [];
                        }
                        if (pathField[j][i] === undefined) {
                            pathField[j][i] = value;
                            // setPixel(i, j, color);
                            nextWavePositions.push({x: i, y: j});
                        }
                    }
                }
            }
        }
        if (end || nextWavePositions.length === 0) {
            break;
        } else {
            positions = nextWavePositions;
            value++;
        }
    }

    if (end) {
        let {x, y, value} = end;

        while (!pathFound) {
            result.push({x, y});

            if (value-- === 0) break;

            for (let index = 0; index < offsets.length; index++) {
                let {0: i, 1: j} = offsets[index];
                i += x;
                j += y;
                if (pathField[j] && pathField[j][i] === value) {
                    x = i;
                    y = j;
                    break;
                }
            }
        }
    }

    return result;
}

function render(timestamp) {
    const delta = timestamp - previousTimestamp;
    previousTimestamp = timestamp;

    requestAnimationFrame(render);
    renderer.render(scene, camera);
}