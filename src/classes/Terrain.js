import THREE from '../lib/three';
import ImageGrid from './ImageGrid';

const repeat = 1;

export default class Terrain {
  constructor({heightMapData, textureMapData}, width, height, depth, callback = null) {
    const geometry = new THREE.Geometry();
    const map = new THREE.TextureLoader().load(textureMapData);
    map.wrapS = THREE.RepeatWrapping;
    map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(repeat, repeat);

    const material = new THREE.MeshLambertMaterial({
      wireframe: false,
      map: map
      //shading: THREE.FlatShading,
      //vertexColors: THREE.VertexColors
    });

    this._width = width;
    this._height = height;
    this._depth = depth;

    const heightMapGrid = this._heightGrid = new ImageGrid(heightMapData);

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
      this._mesh = new THREE.Mesh(geometry, material);
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

  getClosest(position) {
    const closest = new THREE.Vector3();
    const closestCell = this.getClosestCell(position);

    closest.x = closestCell.x * (this._width / this._heightGrid.width) - this._width / 2;
    closest.y = 0;
    closest.z = closestCell.y * (this._depth  / this._heightGrid.height) - this._depth / 2;

    return closest.add(this._mesh.position);
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

    return {x: closestCell.x, y: closestCell.y}
  }
}