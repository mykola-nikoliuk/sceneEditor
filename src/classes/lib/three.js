import THREE from "lib/three-lite";
import addMTLLoader from "lib/MTLLoader";
import addOBJLoader from "lib/OBJLoader";
import addOBJMTLLoader from "lib/OBJMTLLoader";
import addWaterShader from "lib/WaterShader";
import addCinematicCamera from "lib/CinematicCamera";
import addBokehShader from "lib/BokehShader";
import addFBXLoader from "lib/FBXLoader";

// addMTLLoader(THREE);
// addOBJLoader(THREE);
// addOBJMTLLoader(THREE);
addWaterShader(THREE);
// addCinematicCamera(THREE);
// addBokehShader(THREE);
addFBXLoader(THREE);

export default THREE;