import THREE from './classes/lib/three';
import map from 'lodash/map';
import Stats from 'stats-js';
import './style/index.styl';
import store from 'store';
import mouse, {ENUMS as MOUSE_ENUMS} from './classes/Mouse';
import utils from 'threejs-utils';
import AnimationManager, {Animation, Keyframe, UPDATE_VECTOR3, UPDATE_NUMBER, ENUMS as ANIMATION_ENUMS} from './classes/animationManager/AnimationManager';
import {TestMap, Plane} from 'maps/maps';
import {IronCat} from 'units/IronCat';

// todo: remove it
import grass from 'resources/terrain/grass.jpg';
import ground from 'resources/terrain/ground.jpg';
import snow from 'resources/terrain/snow.jpg';
import sand from 'resources/terrain/sand.jpg';
import blend from 'resources/blendMap.png';
// import b_sand from 'resources/terrain/b_sand.jpg';
import {normalizeAngle} from './utils/utils';

const scene = new THREE.Scene();
let uniforms = {
  time:       { value: 1.0 },
  resolution: { value: new THREE.Vector2() },
  tex1: {value: new THREE.TextureLoader().load(grass)},
  tex2: {value: new THREE.TextureLoader().load(ground)},
  tex3: {value: new THREE.TextureLoader().load(snow)},
  tex4: {value: new THREE.TextureLoader().load(sand)},
  blend: {value: new THREE.TextureLoader().load(blend)},
};

const renderer = new THREE.WebGLRenderer({antialias: true});
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000000);

let previousTimestamp = 0;
let terrain = null;
let unit = null;
let testMap = null;
const cameraPosition = new THREE.Vector3();
const stats = new Stats();
const animationManager = new AnimationManager();
const gui = new utils.dat.GUI();

function loadMap() {
  testMap = new Plane({renderer, camera});
  testMap.onLoad(() => {
    // unit = new Box(10);
    // testMap.scene.add(unit.mesh);

    new IronCat().onLoad(ironCat => {
      unit = ironCat;
      testMap.scene.add(ironCat.mesh);
      testMap.addToUpdate(ironCat);
      // for (let i = 0; i < 1000; i++) {
      //   let mesh = ironCat.mesh.clone();
      //   mesh.position.x = Math.random() * 1024 - 512;
      //   mesh.position.z = Math.random() * 1024 - 512;
      //   testMap.scene.add(mesh);
      //   // testMap.addToUpdate(ironCat);
      // }
    });


    // THREE.OBJMTLLoader.load(tankOBJ, tankMTL, 'resources/tank2/').then(mesh => {
    //   unit = {mesh};
    //   testMap.scene.add(mesh);
    //   let i = 200;
    //   while (i--) {
    //     testMap.scene.add(mesh.clone());
    //   }
    // });

    console.log('loaded');
    init();
  });
}
loadMap();



(() => {

  const vertexShader = [
    'varying vec2 vUv;',
    'void main()',
    '{',
    'vUv = uv;',
    'vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );',
    'gl_Position = projectionMatrix * mvPosition;',
    '}',
  ].join('\n');

  const fragmentShader = [
    // 'uniform float time;',
    'uniform sampler2D tex1;',
    'uniform sampler2D tex2;',
    'uniform sampler2D tex3;',
    'uniform sampler2D tex4;',
    'uniform sampler2D blend;',
    // 'uniform vec2 resolution;',
    'varying vec2 vUv;',
    'void main( void ) {',
    'vec2 uv = vUv * 4.0;',
    'uv = vec2(mod(uv.x, 1.0), mod(uv.y, 1.0));',
    // '	vec2 position = -1.0 + 2.0 * vUv;',
    // '	float red = abs( sin( position.x * position.y + time / 7.0 ) );',
    // '	float green = abs( sin( position.x * position.y + time / 5.0 ) );',
    // '	float blue = abs( sin( position.x * position.y + time / 2.0 ) );',
    // '	gl_FragColor = vec4( red, green, blue, 1.0 );',
    ' vec4 b = texture2D(blend, vUv);',
    ' float coefficient = 1. / (b.r + b.g + b.b + (1.0 - b.a));',
    ' vec3 t1 = texture2D(tex1, uv).rgb;',
    ' t1 = vec3(t1.rgb * (b.g * coefficient));',
    ' vec3 t2 = texture2D(tex2, uv).rgb;',
    ' t2 = vec3(t2.rgb * (b.b * coefficient));',
    ' vec3 t3 = texture2D(tex3, uv).rgb;',
    ' t3 = vec3(t3.rgb * (b.r * coefficient));',
    ' vec3 t4 = texture2D(tex4, uv).rgb;',
    ' t4 = vec3(t4.rgb * ((1.0 - b.a) * coefficient));',
    '	gl_FragColor = vec4(t1 + t2 + t3 + t4, 1.0);',
    '}'
  ].join('\n');

  // let material = new THREE.ShaderMaterial( {
  //   uniforms,
  //   vertexShader,
  //   fragmentShader
  // } );

  let material = new THREE.MeshPhongMaterial({
    map: new THREE.TextureLoader().load(sand),
    // bumpMap: new THREE.TextureLoader().load(b_sand),
    bumpSize: 3
  });

  scene.background = new THREE.Color(0x555555);

  const geometry = new THREE.Geometry();
  const size = 100;
  geometry.vertices.push(
    new THREE.Vector3(-size, size, 0),
    new THREE.Vector3(size, size, 0),
    new THREE.Vector3(-size, -size, 0),
    new THREE.Vector3(size, -size, 0)
  );
  geometry.faces.push(
    new THREE.Face3(2, 1, 0),
    new THREE.Face3(2, 3, 1)
  );
  geometry.computeVertexNormals();
  geometry.faceVertexUvs[0] = [[
    new THREE.Vector2(0, 0),
    new THREE.Vector2(1, 1),
    new THREE.Vector2(0, 1)
  ], [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(1, 0),
    new THREE.Vector2(1, 1)
  ]];

  geometry.faceVertexUvs[1] = [[
    new THREE.Vector2(0, 0),
    new THREE.Vector2(1, 1),
    new THREE.Vector2(0, 1)
  ], [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(1, 0),
    new THREE.Vector2(1, 1)
  ]];

  const geometry2 = new THREE.CubeGeometry(size, size, size);


  const plane = new THREE.Mesh(
    geometry,
      /*new THREE.MeshStandardMaterial({
        // opacity: .5,
        // blending: THREE.AdditiveBlending,
        color: 0xff
        // map: new THREE.TextureLoader().load(tex)
      }),*/
      [material]
  );
  // plane.material[0].transparent = true;
  // plane.material[1].transparent = true;
  scene.add(plane);
  scene.add(new THREE.AmbientLight(0xffffff, 1));
  init();
});


const cameraData = store.get('cameraData') || {
  theta: Math.PI / 2 + Math.PI / 32,
  phi: Math.PI / 24,
  radius: 500
};


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

// const config = {
//   upload: () => {
//     const input = document.createElement('input');
//     input.type = 'file';
//     input.addEventListener('change', () => {
//       if (input.files.length) {
//         const reader = new FileReader();
//         reader.onload = e => {
//           init(e.target.result);
//         };
//         reader.readAsDataURL(input.files[0]);
//       }
//     });
//     input.click();
//   }
// };
// gui.add(config, 'upload');

let animateUnit = function () {

  // todo: make it look better
  const speed = 100;
  const path = testMap._terrain.findPath(unit.mesh.position, getPosition(event));

  if (path.length) {
    let keyframes = [];
    let angle = null;

    for (let i = 0; i < path.length; i++) {
      path[i].y = unit.mesh.position.y;
      if (i < path.length - 1) {
        if (i === 0) {
          angle = path[i].angleTo(path[i + 1]);
        } else {
          // const spin = Math.PI * 2;
          const newAngle = path[i].angleTo(path[i + 1]);
          const normalizedAngle = normalizeAngle(angle);
          const delta = newAngle - normalizedAngle;
          const abs = Math.abs(delta);
          if (abs > Math.PI) {
            angle -= -Math.PI * 2 - delta;
          } else {
            angle += delta
          }
        }
        keyframes.push(new Keyframe({
          position: path[i],
          'rotation.y': -angle
        }));
      } else {

      }
    }
    // const keyframes = map(path, position => {
    //   position.y = unit.mesh.position.y;
    //   return new Keyframe({position});
    // });

    if (unit.animation) {
      animationManager.remove(unit.animation);
    }
    unit.animation = new Animation({
      target: unit.mesh,
      duration: speed * path.length,
      keyframes,
      updateFunctions: {
        position: UPDATE_VECTOR3,
        'rotation.y': UPDATE_NUMBER
      }
    });
    // console.log(terrain.getClosest(getPosition(event)));
    animationManager.animate(unit.animation);
  }
};

(() => {
  const {EVENTS: {MOVE, UP, DOWN, WHEEL, CONTEXT}, BUTTONS: {MAIN, MIDDLE, SECOND}} = MOUSE_ENUMS;
  mouse.subscribe(MOVE, mouseUpdate);
  mouse.subscribe(UP, e => {
    switch (e.button) {
      case MAIN:
        moveEnabled = false;
        break;
      case MIDDLE:
        unit.setTarget({position: getPosition(e)});
        break;
      case SECOND:
        rotationEnabled = false;
        break;
    }
  });
  mouse.subscribe(DOWN, e => {
    switch (e.button) {
      case MAIN:
        moveEnabled = true;
        animateUnit();
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

let target = new THREE.Vector3(0, 0, 0);

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

renderer.setClearColor(0x222222);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

let rotationEnabled = false;
let moveEnabled = false;
mouseUpdate({delta: {x: 0, y: 0}});

function scale(e, {y}) {
  cameraData.radius = (cameraData.radius + y / 10).fitToRange(1, Infinity);
  mouseUpdate({e, delta: {x: 0, y: 0}});
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
    //unit.mesh.position.copy(getPosition(event));
    // position.copy(getPosition(event).sub(lastClickPosition));
    // target.add(getPosition(previousEvent).sub(getPosition(event)));
    // console.log(target);
    // console.log('-');
  }

  if (rotationEnabled) {
    cameraData.theta = (cameraData.theta - y / 500).fitToRange(limit, Math.PI / 2 - limit);
    cameraData.phi += x / 500;
  }

  // Turn back into Cartesian coordinates
  cameraPosition.x = cameraData.radius * Math.sin(cameraData.theta) * Math.cos(cameraData.phi);
  cameraPosition.z = cameraData.radius * Math.sin(cameraData.theta) * Math.sin(cameraData.phi);
  cameraPosition.y = cameraData.radius * Math.cos(cameraData.theta);

  // skyBox && skyBox.position.copy(position);

  store.set('cameraData', cameraData);

  // if (event) {
  //   previousEvent = event;
  // }
}

//
// function createMap(mapImage) {
//   const map = parseMap(mapImage);
//   const planeMaterial = new THREE.MeshPhongMaterial({
//     map: new THREE.CanvasTexture(map.canvas),
//   });
//   planeMaterial.map.minFilter = THREE.NearestFilter;
//   planeMaterial.map.magFilter = THREE.NearestFilter;
//
//   const plane = new THREE.Mesh(
//     new THREE.PlaneGeometry(mapImage.width, mapImage.height),
//     planeMaterial
//   );
//
//   plane.receiveShadow = true;
//   plane.rotation.x = -PI / 2;
//   subScene.add(plane);
// }
//
// function parseMap(image) {
//   let start = null;
//   let end = null;
//
//   const canvas = document.createElement('canvas');
//   const contex = canvas.getContext('2d');
//   canvas.width = image.width;
//   canvas.height = image.height;
//   contex.drawImage(image, 0, 0, canvas.width, canvas.height);
//
//   const imageData = contex.getImageData(0, 0, canvas.width, canvas.height);
//   const imageDataSize = canvas.width * canvas.height * 4;
//   const field = [];
//   const colors = [];
//   for (let i = 0; i < imageDataSize; i += 4) {
//     const x = i / 4 % canvas.width;
//     const y = i / 4 / canvas.width | 0;
//
//     if (!field[y]) {
//       field[y] = [];
//       colors[y] = [];
//     }
//     if (!start && (imageData.data[i + 1] > 200) && (imageData.data[i] + imageData.data[i + 2] < 200)) {
//       start = {x, y};
//     }
//     if (!end && imageData.data[i] > 200 && imageData.data[i + 1] + imageData.data[i + 2] < 200) {
//       end = {x, y};
//     }
//     field[y][x] = imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2] === 765 ? 1 : 0;
//     colors[y][x] = (imageData.data[i] << 16) | (imageData.data[i + 1] << 8) | (imageData.data[i + 2])
//   }
//
//   if (!start) start = {x: 0, y: 0};
//   if (!end) end = {x: image.width - 1, y: image.height - 1};
//   field[end.y][end.x] = 2;
//
//   const path = findPath(field, start, setPixel);
//
//   path.forEach(({x, y}) => {
//     setPixel(x, y, [255, 0, 0, 1]);
//   });
//
//   function setPixel(x, y, color) {
//     const offset = (canvas.width * y + x) * 4;
//     color.forEach((item, index) => {
//       imageData.data[offset + index] = color[index];
//     });
//   }
//
//   contex.putImageData(imageData, 0, 0);
//
//   return {canvas, field, colors};
//
// }
//
// function createScene(width, height, field, colors) {
//   const maxHeight = 10;
//   const halfWidth = width / 2;
//   const halfHeight = height / 2;
//   field.forEach((row, y) => {
//     const offsetY = y + .5;
//
//     row.forEach((cell, x) => {
//       const offsetX = x + .5;
//
//       if (cell === 0) {
//         let cube = new THREE.Mesh(
//           cubeGeometry,
//           new THREE.MeshStandardMaterial({color: colors[y][x]})
//         );
//         const percent = 1 - ((colors[y][x] >> 16) + ((colors[y][x] & 0xff00) >> 8) + (colors[y][x] & 0xff)) / (255 * 3);
//         cube.position.set(offsetX - halfWidth, maxHeight * percent / 2, offsetY - halfHeight);
//         cube.scale.y = maxHeight * percent;
//         subScene.add(cube);
//       }
//     });
//   });
// }
// function findPath(field, start, setPixel) {
//
//   let result = [];
//   let pathField = [];
//   let positions = [start];
//   let value = 1;
//   let pathFound = false;
//   let end = null;
//   let offsets = [
//     [-1, 0], [0, 1], [1, 0], [0, -1]
//   ];
//   if (config.neighborhood === NEIGHBORHOOD.MOORE) {
//     offsets.push([-1, 1], [1, 1], [1, -1], [-1, -1])
//   }
//
//   pathField[start.y] = [];
//   pathField[start.y][start.x] = 0;
//
//   while (true) {
//     const color = [Math.random() * 255 | 0, Math.random() * 255 | 0, Math.random() * 255 | 0, 1];
//     const nextWavePositions = [];
//
//     for (let pos = 0; pos < positions.length; pos++) {
//       const {x, y} = positions[pos];
//
//       for (let index = 0; index < offsets.length; index++) {
//         let {0: i, 1: j} = offsets[index];
//         i += x;
//         j += y;
//
//         if (field[j] && field[j][i]) {
//           if (field[j][i] === 2) {
//             end = {x: i, y: j, value};
//             break;
//           } else {
//             if (!pathField[j]) {
//               pathField[j] = [];
//             }
//             if (pathField[j][i] === undefined) {
//               pathField[j][i] = value;
//               // setPixel(i, j, color);
//               nextWavePositions.push({x: i, y: j});
//             }
//           }
//         }
//       }
//     }
//     if (end || nextWavePositions.length === 0) {
//       break;
//     } else {
//       positions = nextWavePositions;
//       value++;
//     }
//   }
//
//   if (end) {
//     let {x, y, value} = end;
//
//     while (!pathFound) {
//       result.push({x, y});
//
//       if (value-- === 0) break;
//
//       for (let index = 0; index < offsets.length; index++) {
//         let {0: i, 1: j} = offsets[index];
//         i += x;
//         j += y;
//         if (pathField[j] && pathField[j][i] === value) {
//           x = i;
//           y = j;
//           break;
//         }
//       }
//     }
//   }
//
//   return result;
// }


function init() {
  addEventListener('resize', () => {
    const SCREEN_WIDTH = window.innerWidth;
    const SCREEN_HEIGHT = window.innerHeight;
    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    camera.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
    camera.updateProjectionMatrix();
  });
  addStats();
  render(previousTimestamp);
}

function addStats() {
  stats.setMode(0); // 0: fps, 1: ms

// Align top-left
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';

  document.body.appendChild( stats.domElement );
}

function render(timestamp) {
  const delta = timestamp - previousTimestamp;
  previousTimestamp = timestamp;

  stats.begin();

  animationManager.update(delta);

  requestAnimationFrame(render);

  // todo: remove it
  uniforms.time.value += 0.05;

  if (testMap) {
    testMap.render(delta);
    renderer.render(testMap.scene, camera);
  } else {
    renderer.render(scene, camera);
  }

  camera.position.copy(cameraPosition).add(target);
  camera.lookAt(target);

  stats.end();
}