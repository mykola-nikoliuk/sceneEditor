import THREE from 'three';
import Stats from 'stats-js';
// import utils from 'threejs-utils';
import {screen, SCREEN_EVENTS} from 'general/Screen';

// todo: remove it
// import grass from 'resources/terrain/grass.jpg';
// import ground from 'resources/terrain/ground.jpg';
// import snow from 'resources/terrain/snow.jpg';
// import sand from 'resources/terrain/sand.jpg';
// import blend from 'resources/blendMap.png';
// import b_sand from 'resources/terrain/b_sand.jpg';
import {LoadingView} from 'view/Loading';
import {GameView} from 'view/Game';

const scene = new THREE.Scene();
// let uniforms = {
//   time: {value: 1.0},
//   resolution: {value: new THREE.Vector2()},
//   tex1: {value: new THREE.TextureLoader().load(grass)},
//   tex2: {value: new THREE.TextureLoader().load(ground)},
//   tex3: {value: new THREE.TextureLoader().load(snow)},
//   tex4: {value: new THREE.TextureLoader().load(sand)},
//   blend: {value: new THREE.TextureLoader().load(blend)},
// };

const renderer = new THREE.WebGLRenderer({antialias: true});

let previousTimestamp = 0;
let terrain = null;
let view = null;
const stats = new Stats();

function loading() {
  new LoadingView(renderer).onLoad(loadingView => {
    view = loadingView;
    console.log('loading view loaded');
    init();
    new GameView(renderer).onLoad(gameView => {
      view.destroy();
      view = gameView;
      console.log('game view loaded');
    });
  });
}

loading();


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

renderer.setSize(screen.width, screen.height);
document.body.appendChild(renderer.domElement);

renderer.setClearColor(0x222222);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

let rotationEnabled = false;
let moveEnabled = false;




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
  screen.on(SCREEN_EVENTS.RESIZE, () => {
    const SCREEN_WIDTH = screen.width;
    const SCREEN_HEIGHT = screen.height;
    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
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

  document.body.appendChild(stats.domElement);
}

function render(timestamp) {
  const delta = timestamp - previousTimestamp;
  previousTimestamp = timestamp;

  stats.begin();

  requestAnimationFrame(render);

  view && view.render(delta);

  stats.end();
}