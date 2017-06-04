import * as THREE from "three";
const {PI} = Math;


export default class Axle {
    constructor({
                    mesh,
                    width,
                    offset,
                    camber = 0,
                    convergence = 0,
                    maxAngle = 0,
                    angleCoefficient = 1,
                    isFront = true,
                    rotationPointOffset = 0
    }) {
        this._maxAngle = maxAngle;
        this._isFront = isFront;
        this._convergence = convergence;

        this._leftWheel = mesh.clone();
        this._rightWheel = mesh.clone();
        this._leftWheel.position.z -= rotationPointOffset;
        this._rightWheel.position.z += rotationPointOffset;
        this._rightWheel.rotation.y += PI;

        this._leftSemiAxis = new THREE.Group();
        this._leftSemiAxis.add(this._leftWheel);
        this._leftSemiAxis.position.set(offset.x, offset.y, -width / 2 + rotationPointOffset);

        this._rightSemiAxis = new THREE.Group();
        this._rightSemiAxis.add(this._rightWheel);
        this._rightSemiAxis.position.copy(this._leftSemiAxis.position);
        this._rightSemiAxis.position.z *= -1;

        this._leftSemiAxis.rotation.x -= camber;
        this._rightSemiAxis.rotation.x += camber;

        this._angleCoefficient = angleCoefficient;

        this.angle = 0;
    }

    set angle(value) {
        let angle = value * this._angleCoefficient * this._maxAngle;
        if (!this._isFront) angle *= -1;
        this._leftSemiAxis.rotation.y = angle - this._convergence;
        this._rightSemiAxis.rotation.y = angle + this._convergence;
    }

    get leftWheel() {
        return this._leftWheel;
    }

    get rightWheel() {
        return this._rightWheel;
    }

    get leftSemiAxis() {
        return this._leftSemiAxis;
    }

    get rightSemiAxis() {
        return this._rightSemiAxis;
    }
}