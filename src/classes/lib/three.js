import THREE from 'lib/three-lite';
import {addFBXLoader} from 'lib/FBXLoader';
import {addWaterShader} from 'lib/WaterShader';
import {addOrbitControls} from 'lib/OrbitControls';

addFBXLoader(THREE);
addWaterShader(THREE);
addOrbitControls(THREE);

export default THREE;