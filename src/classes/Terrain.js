import THREE from './lib/three';
import ImageGrid from './ImageGrid';
import map from 'lodash/map';
import waterNormalsMapURL from 'resources/textures/terrain/water_normal_map.jpg';
import {State} from 'general/State';

const repeat = 16;

const state = {
  water: {
    color: '#001e0f',
    alpha: 1
  }
};

export default class Terrain extends State {
  constructor(
    {heightMapURL, textureMapURL, normalMapURL = null, heightCanvas = null},
    env, {x: width, y: height, z: depth}, water) {

    super(state);

    this._env = env;
    this._heightCanvas = heightCanvas;

    this._promise = new Promise(resolve => {
      this._width = width;
      this._height = height;
      this._depth = depth;
      this._mesh = new THREE.Group();

      this._geometry = new THREE.Geometry();
      this._geometry.faceVertexUvs[0] = [];

      new THREE.TextureLoader().load(textureMapURL, map => {
        new THREE.TextureLoader().load(normalMapURL, normalMap => {
          map.wrapS =
            map.wrapT =
              normalMap.wrapS =
                normalMap.wrapT = THREE.RepeatWrapping;
          map.repeat.set(repeat, repeat);
          normalMap.repeat.set(repeat, repeat);

          const material = new THREE.MeshPhongMaterial({
            wireframe: false,
            map: map,
            normalMap: normalMap,
            shininess: 10,
            normalScale: new THREE.Vector2(1, 1)
          });

          this._heightGrid = new ImageGrid(heightMapURL);

          this._heightGrid.parse(({x, y, color}) => {
            this._addVertex({x, y, color});
            if (y && x) {
              this._addVertexUV({x, y});
              this._addFaces({x, y});
            }
          }).then(() => {
            this._geometry.computeVertexNormals();
            const terrainMesh = new THREE.Mesh(this._geometry, material);
            this._mesh.add(terrainMesh);
            terrainMesh.receiveShadow = true;

            if (water) {
              this._addWater(env, water).then(resolve.bind(null, this._mesh));
            } else {
              this._water = null;
              resolve(this._mesh);
            }
          });
        });
      });
    });
  }

  get mesh() {
    return this._mesh;
  }

  get width() {
    return this._width;
  }

  get height() {
    return this._height;
  }

  get depth() {
    return this._depth;
  }

  findPath(from, to) {
    const start = this.getClosestCell(from);
    const finish = this.getClosestCell(to);

    const path = this._findPath(this._heightGrid.grid, start, finish);
    return map(path, this.cellToPosition.bind(this));
  }

  getClosest(position) {
    const closestCell = this.getClosestCell(position);
    const closest = this.cellToPosition(closestCell);

    return closest.add(this._mesh.position);
  }

  cellToPosition({x, y}) {
    return new THREE.Vector3(
      x * (this._width / this._heightGrid.width) - this._width / 2,
      0,
      y * (this._depth / this._heightGrid.height) - this._depth / 2
    );
  }

  getClosestCell(position) {
    const closestCell = new THREE.Vector2();
    const halfWidth = this._width / 2;
    const halfDepth = this._depth / 2;
    const {x, z} = position.clone()
      .sub(this._mesh.position)
      .add(new THREE.Vector3(halfWidth, 0, halfDepth));


    closestCell.x = x / this._width * this._heightGrid.width | 0;
    closestCell.y = z / this._depth * this._heightGrid.height | 0;

    return closestCell;
  }

  stateWillUpdate({water: {color, alpha}}) {
    this._water.waterColor.set(color);
    this._water.material.uniforms.alpha.value = alpha;
  }

  render(delta) {
    if (this._water) {
      this._water.material.uniforms.time.value += delta * 0.0005;
      this._water.render();
    }
    if (this._heightCanvas) {
      const pixels = this._heightCanvas.getData();
      this._geometry.vertices.forEach((vertex, index) => {
        const offset = index * 4;
        vertex.y = pixels.data[offset] / 255 * this._height;
      });

      this._geometry.verticesNeedUpdate = true;
    }
  }

  _addVertex({x, y, color}) {
    this._geometry.vertices.push(
      new THREE.Vector3(
        x / this._heightGrid.width * this._width - this._width / 2,
        color / 0xffffff * this._height,
        y / this._heightGrid.height * this._depth - this._depth / 2
      )
    );
  }

  _addVertexUV({x, y}) {
    this._geometry.faceVertexUvs[0].push([
      new THREE.Vector2((x - 1) / this._heightGrid.width, y / this._heightGrid.height),
      new THREE.Vector2(x / this._heightGrid.width, (y - 1) / this._heightGrid.height),
      new THREE.Vector2((x - 1) / this._heightGrid.width, (y - 1) / this._heightGrid.height),
    ], [
      new THREE.Vector2(x / this._heightGrid.width, y / this._heightGrid.height),
      new THREE.Vector2(x / this._heightGrid.width, (y - 1) / this._heightGrid.height),
      new THREE.Vector2((x - 1) / this._heightGrid.width, y / this._heightGrid.height),
    ]);
  }

  _addFaces({x, y}) {
    this._geometry.faces.push(
      new THREE.Face3(
        y * this._heightGrid.width + x - 1,
        (y - 1) * this._heightGrid.width + x,
        (y - 1) * this._heightGrid.width + x - 1,
        undefined, [
          new THREE.Color(this._getColor(x - 1, y)),
          new THREE.Color(this._getColor(x, y - 1)),
          new THREE.Color(this._getColor(x - 1, y - 1))
        ]
      ),
      new THREE.Face3(
        y * this._heightGrid.width + x,
        (y - 1) * this._heightGrid.width + x,
        y * this._heightGrid.width + x - 1,
        undefined, [
          new THREE.Color(this._getColor(x, y)),
          new THREE.Color(this._getColor(x, y - 1)),
          new THREE.Color(this._getColor(x - 1, y))
        ]
      )
    );
  }

  _getColor(x, y) {
    const percent = this._heightGrid.get(x, y) / 0xffffff;
    const red = 0xa0 * percent;
    const green = 0xff * (1 - percent);
    let color = (red << 16) | (green << 8);
    if (percent < 0.15) {
      color = 0xff;
    }

    return color;
  }

  _findPath(field, start, finish) {
    let result = [];
    let pathField = [];
    let positions = [start];
    let value = 1;
    let pathFound = false;
    let end = null;
    let offsets = [
      [-1, 0], [0, 1], [1, 0], [0, -1]
    ];
    // if (config.neighborhood === NEIGHBORHOOD.MOORE) {
    offsets.push([-1, 1], [1, 1], [1, -1], [-1, -1]);
    // }

    pathField[start.y] = [];
    pathField[start.y][start.x] = 0;

    while (true) {
      // const color = [Math.random() * 255 | 0, Math.random() * 255 | 0, Math.random() * 255 | 0, 1];
      const nextWavePositions = [];

      for (let pos = 0; pos < positions.length; pos++) {
        const {x, y} = positions[pos];

        for (let index = 0; index < offsets.length; index++) {
          let {0: i, 1: j} = offsets[index];
          i += x;
          j += y;

          if (field[j] && field[j][i] === 0) {
            if (finish.x === i && finish.y === j) {
              end = {x: i, y: j, value};
              break;
            } else {
              if (!pathField[j]) {
                pathField[j] = [];
              }
              if (pathField[j][i] === undefined) {
                pathField[j][i] = value;
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

    return result.reverse();
  }

  _addWater({renderer, camera, light, fog}) {
    return new Promise(resolve => {
      const waterNormals = new THREE.TextureLoader().load(waterNormalsMapURL, resolve);
      waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping;

      this._water = new THREE.Water(renderer, camera, this._mesh, {
        textureWidth: 512,
        textureHeight: 512,
        waterNormals: waterNormals,
        sunDirection: light.position.clone().normalize(),
        sunColor: 0xffffff,
        distortionScale: 24.0,
        fog
      });

      this._mesh.add(this._water);

      const mirrorMesh = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(this._width * 10, this._depth * 10),
        this._water.material
      );
      mirrorMesh.add(this._water);
      mirrorMesh.rotation.x = -Math.PI * 0.5;
      mirrorMesh.position.y = 0.15 * this._height;
      this._mesh.add(mirrorMesh);
    });
  }
}