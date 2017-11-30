uniform sampler2D maps[5];
uniform sampler2D bumps[5];
uniform sampler2D blend;
varying vec2 vUv;
varying vec2 vUvr;

const float BLEND_RANGE = 0.1;

void main( void ) {
  float maxWeight = 0.;
  float totalCoef = 0.;
  float weights[5];
  vec3 mapsColors[5];
  vec4 blendColor = texture2D(blend, vUv);
  vec3 color = vec3(0., 0., 0.);

  weights[0] = blendColor.r;
  weights[1] = blendColor.g;
  weights[2] = blendColor.b;
  weights[3] = 1. - blendColor.a;
  weights[4] = 1. - (blendColor.r + blendColor.g + blendColor.b + (1. - blendColor.a));

  for (int i = 0; i < 5; i++) {
    mapsColors[i] = texture2D(maps[i], vUvr).rgb;
//    color += mapsColors[i] * weights[i];
    weights[i] *= texture2D(bumps[i], vUvr).r;
    maxWeight = max(maxWeight, weights[i]);
  }

  float blendLine = maxWeight - BLEND_RANGE;

  for (int i = 0; i < 5; i++) {
    float coef = max(weights[i] - blendLine, 0.);
    totalCoef += coef;
    color += coef * mapsColors[i];
  }
  color /= totalCoef;

  gl_FragColor = vec4(color, 1.);
}