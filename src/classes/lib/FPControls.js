export function addFPControls(THREE) {

  THREE.FPControls = function (object, domElement) {

    this.object = object;

    this.domElement = ( domElement !== undefined ) ? domElement : document;
    if (domElement) this.domElement.setAttribute('tabindex', -1);

    this._speed = 1;
    this._theta = Math.PI / 2;
    this._phi = 0;

    this.keydown = function (event) {
      //
      //if (event.altKey) {
      //
      //  return;
      //
      //}
      //
      ////event.preventDefault();
      //
      //switch (event.keyCode) {
      //
      //  case 16: /* shift */
      //    this.movementSpeedMultiplier = .1;
      //    break;
      //
      //  case 87: /*W*/
      //    this.moveState.forward = 1;
      //    break;
      //  case 83: /*S*/
      //    this.moveState.back = 1;
      //    break;
      //
      //  case 65: /*A*/
      //    this.moveState.left = 1;
      //    break;
      //  case 68: /*D*/
      //    this.moveState.right = 1;
      //    break;
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
      //}
    };

    this.keyup = function (event) {

      //switch (event.keyCode) {
      //
      //  case 16: /* shift */
      //    this.movementSpeedMultiplier = 1;
      //    break;
      //
      //  case 87: /*W*/
      //    this.moveState.forward = 0;
      //    break;
      //  case 83: /*S*/
      //    this.moveState.back = 0;
      //    break;
      //
      //  case 65: /*A*/
      //    this.moveState.left = 0;
      //    break;
      //  case 68: /*D*/
      //    this.moveState.right = 0;
      //    break;
      //
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
      //}

    };

    this.mousedown = function (event) {

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

    };

    this.mousemove = function (event) {


      // todo: optimize
      this._phi += event.movementX / 500;
      this._theta += event.movementY / 500;
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

    };

    this.mouseup = function (event) {

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
    };

    this.update = function (delta) {

      // Turn back into Cartesian coordinates
      //this._cameraPosition.x = this._cameraData.radius * Math.sin(this._cameraData.theta) * Math.cos(this._cameraData.phi);
      //this._cameraPosition.y = this._cameraData.radius * Math.cos(this._cameraData.theta);
      //this._cameraPosition.z = this._cameraData.radius * Math.sin(this._cameraData.theta) * Math.sin(this._cameraData.phi);


      const target = new THREE.Vector3(
        Math.sin(this._theta) * Math.cos(this._phi),
        Math.cos(this._theta),
        Math.sin(this._theta) * Math.sin(this._phi)
      ).add(this.object.position);
      this.object.lookAt(target);

    };

    function contextmenu(event) {

      event.preventDefault();

    }

    this.dispose = function () {

      this.domElement.removeEventListener('contextmenu', contextmenu, false);
      this.domElement.removeEventListener('mousedown', _mousedown, false);
      this.domElement.removeEventListener('mousemove', _mousemove, false);
      this.domElement.removeEventListener('mouseup', _mouseup, false);

      window.removeEventListener('keydown', _keydown, false);
      window.removeEventListener('keyup', _keyup, false);

    };

    var _mousemove = this.mousemove.bind(this);
    var _mousedown = this.mousedown.bind(this);
    var _mouseup = this.mouseup.bind(this);
    var _keydown = this.keydown.bind(this);
    var _keyup = this.keyup.bind(this);

    this.domElement.addEventListener('contextmenu', contextmenu, false);

    this.domElement.addEventListener('mousemove', _mousemove, false);
    this.domElement.addEventListener('mousedown', _mousedown, false);
    this.domElement.addEventListener('mouseup', _mouseup, false);

    window.addEventListener('keydown', _keydown, false);
    window.addEventListener('keyup', _keyup, false);
  };
}