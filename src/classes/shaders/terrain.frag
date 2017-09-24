uniform sampler2D tex1;
uniform sampler2D tex1b;
uniform sampler2D tex2;
uniform sampler2D tex2b;
uniform sampler2D tex3;
uniform sampler2D tex3b;
uniform sampler2D tex4;
uniform sampler2D tex4b;
uniform sampler2D blend;
uniform float repeat;
varying vec2 vUv;

void main( void ) {
  vec2 uv = vUv * repeat;
  uv = vec2(mod(uv.x, 1.0), mod(uv.y, 1.0));

  vec3 t1 = texture2D(tex1, uv).rgb;
  vec3 t1b = texture2D(tex1b, uv).rgb;
  vec3 t2 = texture2D(tex2, uv).rgb;
  vec3 t2b = texture2D(tex2b, uv).rgb;
  vec3 t3 = texture2D(tex3, uv).rgb;
  vec3 t3b = texture2D(tex3b, uv).rgb;
  vec3 t4 = texture2D(tex4, uv).rgb;
  vec3 t4b = texture2D(tex4b, uv).rgb;

  vec4 b = texture2D(blend, vUv);
  vec4 depth = vec4(b.rgb, 1. - b.a) * vec4(t1b.r, t2b.r, t3b.r, t4b.r);
  vec3 tex = t1;
  float m = depth.r;

  if (depth.g > m) {
    m = depth.g;
    tex = t2;
  }
  if (depth.b > m) {
    m = depth.b;
    tex = t3;
  }
  if (depth.a > m) {
    m = depth.a;
    tex = t4;
  }

  float ma = m - 0.1;
  float fm1 = max(depth.r - ma, 0.);
  float fm2 = max(depth.g - ma, 0.);
  float fm3 = max(depth.b - ma, 0.);
  float fm4 = max(depth.a - ma, 0.);

  tex = (t1.rgb * fm1 + t2.rgb * fm2 + t3.rgb * fm3 + t4.rgb * fm4) / (fm1 + fm2 + fm3 + fm4);

//  t1 = vec3(t1.rgb * (b.g * coefficient));
//  t2 = vec3(t2.rgb * (b.b * coefficient));
//  t3 = vec3(t3.rgb * (b.r * coefficient));
//  t4 = vec3(t4.rgb * ((1.0 - b.a) * coefficient));
//  gl_FragColor = vec4(t1 + t2 + t3 + t4, 1.0);
  gl_FragColor = vec4(tex, 1.0);
}
/*

float max(float a, float b) {
    return a > b ? a : b;
}*/
