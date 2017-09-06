import THREE from '../lib/three';
import ImageGrid from './ImageGrid';

export default class Terrain {
    constructor(heightMapData, width, height, depth, callback = null) {
        const geometry = new THREE.Geometry();
        const material = new THREE.MeshLambertMaterial({
            wireframe: false,
            shading: THREE.FlatShading,
            vertexColors: THREE.VertexColors
        });

        const heightMapGrid = new ImageGrid(heightMapData);

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

        heightMapGrid.parse(({x, y, color}) => {
            geometry.vertices.push(new THREE.Vector3(
                x / heightMapGrid.width * width - width / 2,
                color / 0xffffff * height,
                y / heightMapGrid.height * depth - depth / 2,
            ));
            if (y && x) {
                geometry.faces.push(
                    new THREE.Face3(
                        y * heightMapGrid.width + x - 1,
                        (y - 1) * heightMapGrid.width + x,
                        (y - 1) * heightMapGrid.width + x - 1,
                        undefined, [
                            new THREE.Color(getColor(x-1, y)),
                            new THREE.Color(getColor(x, y-1)),
                            new THREE.Color(getColor(x-1, y-1))
                        ]
                    ),
                    new THREE.Face3(
                        y * heightMapGrid.width + x,
                        (y - 1) * heightMapGrid.width + x,
                        y * heightMapGrid.width + x - 1,
                        undefined, [
                            new THREE.Color(getColor(x, y)),
                            new THREE.Color(getColor(x, y-1)),
                            new THREE.Color(getColor(x-1, y))
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
}