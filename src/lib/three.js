import * as THREE from "three";
import addMTLLoader from "./MTLLoader";
import addOBJLoader from "./OBJLoader";
import addOBJMTLLoader from "./OBJMTLLoader";
import addWaterShader from "./WaterShader";
import addCinematicCamera from "./CinematicCamera";
import addBokehShader from "./BokehShader";

addMTLLoader(THREE);
addOBJLoader(THREE);
addOBJMTLLoader(THREE);
addWaterShader(THREE);
addCinematicCamera(THREE);
addBokehShader(THREE);

export default THREE;