varying vec2 vUv;
varying vec2 vUvr;
uniform float repeat;
void main()
{
  vUv = uv;
  vUvr = uv * repeat;
  vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
  gl_Position = projectionMatrix * mvPosition;
}