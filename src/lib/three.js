import * as THREE from "three";
import addMTLLoader from "./MTLLoader";
import addOBJLoader from "./OBJLoader";
import addOBJMTLLoader from "./OBJMTLLoader";

addMTLLoader(THREE);
addOBJLoader(THREE);
addOBJMTLLoader(THREE);

export default THREE;