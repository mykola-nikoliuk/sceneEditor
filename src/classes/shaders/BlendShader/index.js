import vertexShader from './blend.vert';
import fragmentShader from './blend.frag';

export const BlendShader = {
  uniforms: {
    repeat: {value: 4},
    tex1: {value: null},
    tex1b: {value: null},
    tex2: {value: null},
    tex2b: {value: null},
    tex3: {value: null},
    tex3b: {value: null},
    tex4: {value: null},
    tex4b: {value: null},
    blend: {value: null}
  },
  vertexShader,
  fragmentShader
};