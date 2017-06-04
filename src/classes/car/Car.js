import Axle from "./Axle";
import map from "lodash/map";
import each from "lodash/each";
import keyboard from "../Keyboard";


export default class Car {
    constructor (bodyMesh, {
        axels
    }) {
        this._axels = map(axels, axleConfig => {
            const axle = new Axle(axleConfig);
            bodyMesh.add(axle.leftSemiAxis, axle.rightSemiAxis);
            return axle;
        });

        this._bodyMesh = bodyMesh;
        this._angle = 0;
    }

    get angle() {
        return this._angle;
    }

    set angle(value) {
        if (typeof value !== 'number') return;
        if(value < -1) value = -1;
        if(value > 1) value = 1;
        this._angle = value;
    }

    get mesh() {
        return this._bodyMesh;
    }

    update(delta) {
        const {LEFT, RIGHT} = keyboard.state;
        const rotationCoefficient = 0.001;
        const rotatePath = delta * rotationCoefficient;

        if ((LEFT && RIGHT) || (!LEFT && !RIGHT)) {
            this._angle > 0 ? this.angle -= rotatePath : this.angle += rotatePath;
        } else {
            if (LEFT) {
                this.angle += rotatePath;
            }
            if (RIGHT) {
                this.angle -= rotatePath;
            }
        }
        each(this._axels, axle => {
            axle.leftWheel.rotation.z -= 0.02;
            axle.rightWheel.rotation.z += 0.02;
            axle.angle = this._angle;
        });
    }
}