import THREE from '../lib/three';
import ImageGrid from './ImageGrid';
import map from 'lodash/map';

const repeat = 16;

export default class Terrain {
  constructor({heightMapUrl, textureMapUrl, normalMapUrl, waterNormalsMapUrl}, env, width, height, depth, callback = null) {
    const geometry = new THREE.Geometry();
    const map = new THREE.TextureLoader().load(textureMapUrl);
    map.wrapS = THREE.RepeatWrapping;
    map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(repeat, repeat);
    const normal = new THREE.TextureLoader().load(normalMapUrl);
    //normal.wrapS = THREE.RepeatWrapping;
    //normal.wrapT = THREE.RepeatWrapping;
    //normal.repeat.set(repeat, repeat);

    this._mesh = new THREE.Group();

    this._width = width;
    this._height = height;
    this._depth = depth;

    this._addWater(env, waterNormalsMapUrl);

    const material = new THREE.MeshLambertMaterial({
      wireframe: !true,
      map: map,
      //bumpMap: normal,
      //shading: THREE.FlatShading,
      //vertexColors: THREE.VertexColors
    });

    const heightMapGrid = this._heightGrid = new ImageGrid(heightMapUrl);

    // material.side = THREE.DoubleSide;

    function getColor(x, y) {
      const percent = heightMapGrid.get(x, y) / 0xffffff;
      const red = 0xa0 * percent;
      const green = 0xff * (1 - percent);
      let color = (red << 16) | (green << 8);
      if (percent < 0.15) {
        color = 0xff;
      }

      return color;
    }

    geometry.faceVertexUvs[0] = [];
    heightMapGrid.parse(({x, y, color}) => {
      geometry.vertices.push(new THREE.Vector3(
        x / heightMapGrid.width * width - width / 2,
        color / 0xffffff * height,
        y / heightMapGrid.height * depth - depth / 2,
      ));
      if (y && x) {
        geometry.faceVertexUvs[0].push([
          new THREE.Vector2((x - 1) / heightMapGrid.width, y / heightMapGrid.height),
          new THREE.Vector2(x / heightMapGrid.width, (y - 1) / heightMapGrid.height),
          new THREE.Vector2((x - 1) / heightMapGrid.width, (y - 1) / heightMapGrid.height),
        ], [
          new THREE.Vector2(x / heightMapGrid.width, y / heightMapGrid.height),
          new THREE.Vector2(x / heightMapGrid.width, (y - 1) / heightMapGrid.height),
          new THREE.Vector2((x - 1) / heightMapGrid.width, y / heightMapGrid.height),
        ]);
        geometry.faces.push(
          new THREE.Face3(
            y * heightMapGrid.width + x - 1,
            (y - 1) * heightMapGrid.width + x,
            (y - 1) * heightMapGrid.width + x - 1,
            undefined, [
              new THREE.Color(getColor(x - 1, y)),
              new THREE.Color(getColor(x, y - 1)),
              new THREE.Color(getColor(x - 1, y - 1))
            ]
          ),
          new THREE.Face3(
            y * heightMapGrid.width + x,
            (y - 1) * heightMapGrid.width + x,
            y * heightMapGrid.width + x - 1,
            undefined, [
              new THREE.Color(getColor(x, y)),
              new THREE.Color(getColor(x, y - 1)),
              new THREE.Color(getColor(x - 1, y))
            ]
          )
        );
      }
    }, () => {
      // geometry.computeBoundingSphere();
      geometry.computeVertexNormals();

      // this._mesh = new THREE.Mesh(new THREE.CubeGeometry(width, height, depth), new THREE.MeshStandardMaterial({color: 0x666666}));
      this._mesh.add(new THREE.Mesh(geometry, material));
      callback && callback(this._mesh);
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
    offsets.push([-1, 1], [1, 1], [1, -1], [-1, -1])
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

  _addWater({renderer, camera, light, fog}, normalsMap) {
    const waterNormals = new THREE.TextureLoader().load(normalsMap);
    waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping;

    this._water = new THREE.Water(renderer, camera, this._mesh, {
      textureWidth: 512,
      textureHeight: 512,
      waterNormals: waterNormals,
      alpha: .8,
      sunDirection: light.position.clone().normalize(),
      sunColor: 0xffffff,
      waterColor: 0x001e0f,
      distortionScale: 24.0,
      fog
    });

    this._mesh.add(this._water);

    const mirrorMesh = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(this._width, this._depth),
      this._water.material
    );
    mirrorMesh.add(this._water);
    mirrorMesh.rotation.x = - Math.PI * 0.5;
    mirrorMesh.position.y = 0.15 * this._height;
    this._mesh.add(mirrorMesh);
  }

  render() {
    this._water.material.uniforms.time.value += 0.01;
    this._water.render();
  }
}