import * as THREE from "three";
import addMTLLoader from "lib/MTLLoader";
import addOBJLoader from "lib/OBJLoader";
import addOBJMTLLoader from "lib/OBJMTLLoader";
import addWaterShader from "lib/WaterShader";
import addCinematicCamera from "lib/CinematicCamera";
import addBokehShader from "lib/BokehShader";
import addFBXLoader from "lib/FBXLoader";

addMTLLoader(THREE);
addOBJLoader(THREE);
addOBJMTLLoader(THREE);
addWaterShader(THREE);
// addCinematicCamera(THREE);
// addBokehShader(THREE);
addFBXLoader(THREE);

THREE.Vector3.prototype.angleTo = function (point) {
  const {x, z} = point.clone().sub(this);
  let angle = 0;
  if (x === 0) {
    angle = z > 0 ? Math.PI : 0;
  } else {
    angle = Math.atan(z / x);
    angle += x > 0 ? Math.PI / 2 : Math.PI / 2 * 3;
  }
  return angle;
};

export default THREE;