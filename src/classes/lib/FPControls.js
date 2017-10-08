export function addFPControls(THREE) {

  THREE.FPControls = class FPControls {
    constructor(object, domElement) {

      this.object = object;

      this.domElement = ( domElement !== undefined ) ? domElement : document;
      if (domElement) this.domElement.setAttribute('tabindex', -1);

      this._speed = 1;
      this._theta = Math.PI / 2;
      this._phi = 0;

      this._mouseButtons = {ORBIT: THREE.MOUSE.RIGHT};
      this._orbitEnabled = 0;
      this._speedMultiplier = 1;
      this._target = new THREE.Vector3();

      this._moveState = {
        forward: false,
        back: false,
        left: false,
        right: false,
      };

      this._subscribeEvents();
      this._updateTarget();
    }

    keydown(event) {
      //
      //if (event.altKey) {
      //
      //  return;
      //
      //}
      //
      ////event.preventDefault();
      //
      switch (event.keyCode) {
        case 16: /* shift */
          this._speedMultiplier = 0.1;
          break;
        case 87: /*W*/
          this._moveState.forward = true;
          break;
        case 83: /*S*/
          this._moveState.back = true;
          break;
        case 65: /*A*/
          this._moveState.left = true;
          break;
        case 68: /*D*/
          this._moveState.right = true;
          break;
        //
        //  case 82: /*R*/
        //    this.moveState.up = 1;
        //    break;
        //  case 70: /*F*/
        //    this.moveState.down = 1;
        //    break;
        //
        //  case 38: /*up*/
        //    this.moveState.pitchUp = 1;
        //    break;
        //  case 40: /*down*/
        //    this.moveState.pitchDown = 1;
        //    break;
        //
        //  case 37: /*left*/
        //    this.moveState.yawLeft = 1;
        //    break;
        //  case 39: /*right*/
        //    this.moveState.yawRight = 1;
        //    break;
        //
        //  case 81: /*Q*/
        //    this.moveState.rollLeft = 1;
        //    break;
        //  case 69: /*E*/
        //    this.moveState.rollRight = 1;
        //    break;
        //
      }
    }

    keyup(event) {

      switch (event.keyCode) {

        case 16: /* shift */
          this._speedMultiplier = 1;
          break;
        case 87: /*W*/
          this._moveState.forward = false;
          break;
        case 83: /*S*/
          this._moveState.back = false;
          break;
        case 65: /*A*/
          this._moveState.left = false;
          break;
        case 68: /*D*/
          this._moveState.right = false;
          break;

        //  case 82: /*R*/
        //    this.moveState.up = 0;
        //    break;
        //  case 70: /*F*/
        //    this.moveState.down = 0;
        //    break;
        //
        //  case 38: /*up*/
        //    this.moveState.pitchUp = 0;
        //    break;
        //  case 40: /*down*/
        //    this.moveState.pitchDown = 0;
        //    break;
        //
        //  case 37: /*left*/
        //    this.moveState.yawLeft = 0;
        //    break;
        //  case 39: /*right*/
        //    this.moveState.yawRight = 0;
        //    break;
        //
        //  case 81: /*Q*/
        //    this.moveState.rollLeft = 0;
        //    break;
        //  case 69: /*E*/
        //    this.moveState.rollRight = 0;
        //    break;
        //
      }

    }

    mousedown(event) {
      switch (event.button) {
        case this._mouseButtons.ORBIT: {
          this._orbitEnabled++;
        }
      }

      //if (this.domElement !== document) {
      //
      //  this.domElement.focus();
      //
      //}
      //
      //event.preventDefault();
      //event.stopPropagation();
      //
      //if (this.dragToLook) {
      //
      //  this.mouseStatus++;
      //  this.lastMousePosition.copy(this.getPosition(event));
      //
      //} else {
      //
      //  switch (event.button) {
      //
      //    case 0:
      //      this.moveState.forward = 1;
      //      break;
      //    case 2:
      //      this.moveState.back = 1;
      //      break;
      //
      //  }
      //}

    }

    mousemove(event) {


      if (this._orbitEnabled > 0) {
        // todo: optimize
        this._phi += event.movementX / 500;
        this._theta += event.movementY / 500;
        this._updateTarget();
      }

      //
      //if (!this.dragToLook || this.mouseStatus > 0) {
      //
      //  var position = this.getPosition(event);
      //  var delta = this.lastMousePosition.sub(position).multiplyScalar(10);
      //
      //  console.log(delta);
      //
      //  this.rotationVector.set(delta.y, -delta.x, 0);
      //
      //  this.lastMousePosition.copy(position);
      //
      //  this.updateRotationVector();
      //
      //}

    }

    mouseup(event) {
      switch (event.button) {
        case this._mouseButtons.ORBIT: {
          this._orbitEnabled--;
        }
      }

      //event.preventDefault();
      //event.stopPropagation();
      //
      //if (this.dragToLook) {
      //
      //  this.mouseStatus--;
      //  this.lastMousePosition.copy(this.getPosition(event));
      //
      //  this.moveState.yawLeft = this.moveState.pitchDown = 0;
      //
      //} else {
      //
      //  switch (event.button) {
      //
      //    case 0:
      //      this.moveState.forward = 0;
      //      break;
      //    case 2:
      //      this.moveState.back = 0;
      //      break;
      //
      //  }
      //}
    }

    mouseout() {
      this._speedMultiplier = 1;
      this._orbitEnabled = false;
      this._moveState.forward = false;
      this._moveState.back = false;
      this._moveState.left = false;
      this._moveState.right = false;
    }

    update(delta) {
      let position = new THREE.Vector3();
      if (this._moveState.forward) {
        position = FPControls._getAngle(this._phi, this._theta);
      }
      if (this._moveState.back) {
        position = FPControls._getAngle(this._phi, this._theta).multiplyScalar(-1);
      }
      if (this._moveState.left) {
        position = FPControls._getAngle(this._phi - Math.PI / 2, Math.PI / 2);
      }
      if (this._moveState.right) {
        position = FPControls._getAngle(this._phi + Math.PI / 2, Math.PI / 2);
      }
      position.multiplyScalar(this._speed * this._speedMultiplier);
      this.object.position.add(position);
    }

    _updateTarget() {
      this._target
        .copy(FPControls._getAngle(this._phi, this._theta))
        .add(this.object.position);
      this.object.lookAt(this._target);
    }

    _subscribeEvents() {
      this._subscribe = {
        mousemove: this.mousemove.bind(this),
        mousedown: this.mousedown.bind(this),
        mouseup: this.mouseup.bind(this),
        mouseout: this.mouseout.bind(this),
        keydown: this.keydown.bind(this),
        keyup: this.keyup.bind(this)
      };

      this.domElement.addEventListener('contextmenu', FPControls._contextmenu, false);
      this.domElement.addEventListener('mousemove', this._subscribe.mousemove, false);
      this.domElement.addEventListener('mousedown', this._subscribe.mousedown, false);
      this.domElement.addEventListener('mouseup', this._subscribe.mouseup, false);
      this.domElement.addEventListener('mouseout', this._subscribe.mouseout, false);

      window.addEventListener('keydown', this._subscribe.keydown, false);
      window.addEventListener('keyup', this._subscribe.keyup, false);
    }

    dispose() {
      this.domElement.removeEventListener('contextmenu', FPControls._contextmenu, false);
      this.domElement.removeEventListener('mousedown', this._subscribe.mousedown, false);
      this.domElement.removeEventListener('mousemove', this._subscribe.mousemove, false);
      this.domElement.removeEventListener('mouseup', this._subscribe.mouseup, false);
      this.domElement.removeEventListener('mouseout', this._subscribe.mouseout, false);

      window.removeEventListener('keydown', this._subscribe.keydown, false);
      window.removeEventListener('keyup', this._subscribe.keyup, false);
    }

    static _contextmenu(event) {
      event.preventDefault();
    }

    static _getAngle(phi, theta) {
      return new THREE.Vector3(
        Math.sin(theta) * Math.cos(phi),
        Math.cos(theta),
        Math.sin(theta) * Math.sin(phi)
      );
    }
  };
}