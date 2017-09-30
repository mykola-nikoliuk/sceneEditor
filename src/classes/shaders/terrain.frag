uniform sampler2D tex1;
uniform sampler2D tex1b;
uniform sampler2D tex2;
uniform sampler2D tex2b;
uniform sampler2D tex3;
uniform sampler2D tex3b;
uniform sampler2D tex4;
uniform sampler2D tex4b;
uniform sampler2D blend;
varying vec2 vUv;
varying vec2 vUvr;

void main( void ) {
  vec3 t1 = texture2D(tex1, vUvr).rgb;
  vec3 t1b = texture2D(tex1b, vUvr).rgb;
  vec3 t2 = texture2D(tex2, vUvr).rgb;
  vec3 t2b = texture2D(tex2b, vUvr).rgb;
  vec3 t3 = texture2D(tex3, vUvr).rgb;
  vec3 t3b = texture2D(tex3b, vUvr).rgb;
  vec3 t4 = texture2D(tex4, vUvr).rgb;
  vec3 t4b = texture2D(tex4b, vUvr).rgb;

  vec4 b = texture2D(blend, vUv);
  vec4 depth = vec4(b.rgb, 1. - b.a) * vec4(t1b.r, t2b.r, t3b.r, t4b.r);
  vec3 tex = t1;
  float m = b.r;
//  float coefficient = 1. / (b.r + b.g + b.b + (1.0 - b.a));

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

//  t1 = vec3(t1.rgb * (b.g * coefficient));
//  t2 = vec3(t2.rgb * (b.b * coefficient));
//  t3 = vec3(t3.rgb * (b.r * coefficient));
//  t4 = vec3(t4.rgb * ((1.0 - b.a) * coefficient));
//  gl_FragColor = vec4(t1 + t2 + t3 + t4, 1.0);
  gl_FragColor = vec4(tex, 1.0);
}