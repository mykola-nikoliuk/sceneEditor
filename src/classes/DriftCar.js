import THREE from "./lib/three";
import Car from "../classes/car/Car";
import each from "lodash/each";

import bmwOBJ from "../resources/bmwm3/BMW_M3_GTR.obj";
import bmwMTL from "../resources/bmwm3/BMW_M3_GTR.mtl";
import wheelOBJ from "../resources/wheel/disk_g.obj";
import wheelMTL from "../resources/wheel/disk_g.mtl";

const {PI} = Math;

export default new Promise(response => {

    THREE.OBJMTLLoader.load(bmwOBJ, bmwMTL, 'resources/bmwm3/').then(carMesh => {
        const scale = 0.1;
        carMesh.scale.set(scale, scale, scale);
        let i = 0;
        each(carMesh.children, mesh => {
            mesh.receiveShadow = true;
            mesh.castShadow = true;
        });
        // setInterval(() => {
        //     bmw.children[i].visible = true;
        //     if (i >= bmw.children.length - 1) {
        //         index = -1;
        //     }
        //     bmw.children[++i].visible = false;
        //     console.log(i);
        // }, 500);
        [30, 31, 36, 37, 42, 43, 48, 49].forEach(index => {
            carMesh.children[index].visible = false;
        });
        carMesh.children[32].transparent = true;
        // bmw.rotation.y = PI + PI / 2;

        THREE.OBJMTLLoader.load(wheelOBJ, wheelMTL, 'resources/wheel/').then(wheelMesh => {
            const scale = 2200;
            wheelMesh.scale.set(scale, scale, scale);
            response(createCar(carMesh, wheelMesh));
        });
    });
});

function createCar(carMesh, wheelMesh) {
    // const wheelGroup = new THREE.Group();
    // wheelGroup.add(wheelMesh);

    const car = new Car(carMesh, {
        axels: [{
            mesh: wheelMesh,
            width: 5000,
            maxAngle: PI / 3,
            camber: (-5).toRadians(),
            convergence: (.5).toRadians(),
            maxAngleCamber: 0,
            rotationPointOffset: 30,
            offset: new THREE.Vector2(5280, 1080)
        }, {
            mesh: wheelMesh,
            width: 5000,
            offset: new THREE.Vector2(-3700, 1100)
        }]
    });

    car.mesh.castShadow = true;
    car.mesh.receiveShadow = true;

    car.mesh.rotation.y = PI / 2;

    return car;
}
