import THREE from 'lib/three-lite';
import {addFBXLoader} from 'lib/FBXLoader';
import {addWaterShader} from 'lib/WaterShader';
import {addOrbitControls} from 'lib/OrbitControls';
import {addFPControls} from 'lib/FPControls';
import {addTransformControls} from 'lib/TransformControls';

addFBXLoader(THREE);
addWaterShader(THREE);
addOrbitControls(THREE);
addFPControls(THREE);
addTransformControls(THREE);

export default THREE;