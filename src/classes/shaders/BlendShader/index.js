import vertexShader from './blend.vert';
import fragmentShader from './blend.frag';
import sand from 'resources/textures/terrain/sand/map.jpg';
import grass from 'resources/textures/terrain/grass/map.jpg';
import stone from 'resources/textures/terrain/river_stone/map.jpg';
import dirt from 'resources/textures/terrain/dirt/map.jpg';
import clay from 'resources/textures/terrain/clay/map.jpg';
import sandBump from 'resources/textures/terrain/sand/bump.jpg';
import grassBump from 'resources/textures/terrain/grass/bump.jpg';
import stoneBump from 'resources/textures/terrain/river_stone/bump.jpg';
import dirtBump from 'resources/textures/terrain/dirt/bump.jpg';
import clayBump from 'resources/textures/terrain/clay/bump.jpg';
import blend from 'resources/blend_map.png';
import THREE from 'lib/three-lite';

const loader = new THREE.TextureLoader();

function load(textureMap, repeat = true) {
  const map = loader.load(textureMap);
  if (repeat) {
    map.wrapT = map.wrapS = THREE.RepeatWrapping;
  }
  return map;
}

export const BlendShader = {
  uniforms: {
    repeat: {value: 16},
    maps: {value: [load(sand), load(grass), load(stone), load(dirt), load(clay)]},
    bumps: {value: [load(sandBump), load(grassBump), load(stoneBump), load(dirtBump), load(clayBump)]},
    blend: {value: load(blend, false)}
    // tex1b: {value: new THREE.TextureLoader().load(sandBump)},
    // tex2b: {value: new THREE.TextureLoader().load(gravelBump)},
    // tex3b: {value: new THREE.TextureLoader().load(soilBump)},
    // tex4b: {value: new THREE.TextureLoader().load(groundBump)},
  },
  fragmentShader,
  vertexShader
};