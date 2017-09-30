import THREE from 'lib/three-lite';
import {addFBXLoader} from 'lib/FBXLoader';
import {addWaterShader} from 'lib/WaterShader';
import {addOrbitControls} from 'lib/OrbitControls';
import {addTransformControls} from 'lib/TransformControls';

addFBXLoader(THREE);
addWaterShader(THREE);
addOrbitControls(THREE);
addTransformControls(THREE);

export default THREE;