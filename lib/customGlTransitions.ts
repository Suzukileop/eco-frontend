import type { GlTransitionSpec } from 'gl-transitions';

/**
 * Transitions maison (format gl-transitions v1).
 * Inspirées de templates motion graphics — usage interne NoProbleme.
 */
export const CUSTOM_GL_TRANSITION_IDS = ['np-geometric-colorful-swipe'] as const;

export type CustomGlTransitionId = (typeof CUSTOM_GL_TRANSITION_IDS)[number];

/**
 * Swipe chevrons colorés L→R (réf. transaka.mov).
 * Bandes décalées, brillance, étincelles animées, traînées légères.
 */
const NP_GEOMETRIC_COLORFUL_SWIPE_GLSL = `// Author: NoProbleme
// License: MIT
// Reference: transaka.mov — chevrons colorés balayage gauche → droite

uniform float chevronSlope; // = 0.52
uniform float bandWidth; // = 0.04
uniform float stagger; // = 0.024
uniform float motionIntensity; // = 1.0
uniform float sparkleStrength; // = 1.0
uniform float shineStrength; // = 0.4

float npEase(float t) {
  float x = clamp(t, 0.0, 1.0);
  return x * x * (3.0 - 2.0 * x);
}

vec3 npBandColor(float bandIndex) {
  vec3 mint = vec3(0.45, 0.92, 0.84);
  vec3 orange = vec3(1.0, 0.42, 0.26);
  vec3 yellow = vec3(1.0, 0.86, 0.22);
  vec3 purple = vec3(0.58, 0.32, 0.88);
  vec3 pink = vec3(1.0, 0.1, 0.55);
  vec3 c = pink;
  c = mix(c, purple, step(3.5, bandIndex));
  c = mix(c, yellow, step(2.5, bandIndex));
  c = mix(c, orange, step(1.5, bandIndex));
  c = mix(c, mint, step(0.5, bandIndex));
  return c;
}

float npDiamond(vec2 uv, vec2 center, float size, float rot) {
  vec2 p = uv - center;
  float cr = cos(rot);
  float sr = sin(rot);
  p = vec2(cr * p.x - sr * p.y, sr * p.x + cr * p.y);
  float d = abs(p.x) + abs(p.y);
  return 1.0 - smoothstep(size * 0.55, size, d);
}

float npSparkleField(vec2 uv, float phase) {
  float sum = 0.0;
  float wob = sin(phase * 6.283) * 0.018 * motionIntensity;

  vec2 s0 = vec2(0.11 + wob, 0.74);
  vec2 s1 = vec2(0.19 - wob * 0.6, 0.36);
  vec2 s2 = vec2(0.08, 0.52 + sin(phase * 9.0) * 0.03);
  vec2 s3 = vec2(0.24 + sin(phase * 7.0) * 0.02, 0.62);

  sum += npDiamond(uv, s0, 0.022, phase * 4.5) * (0.65 + 0.35 * sin(phase * 14.0));
  sum += npDiamond(uv, s1, 0.016, phase * 5.8 + 1.2) * (0.55 + 0.45 * sin(phase * 11.0 + 2.0));
  sum += npDiamond(uv, s2, 0.012, phase * 6.2) * (0.5 + 0.5 * sin(phase * 16.0 + 1.0));
  sum += npDiamond(uv, s3, 0.014, phase * 3.9 + 0.5) * (0.6 + 0.4 * sin(phase * 13.0 + 3.0));

  float dust = sin(uv.x * 120.0 + phase * 20.0) * sin(uv.y * 95.0 - phase * 17.0);
  dust = smoothstep(0.92, 1.0, dust) * 0.15 * motionIntensity;
  return clamp(sum + dust, 0.0, 1.2);
}

float npInnerChevronLine(vec2 uv, float front, float slope) {
  float c = uv.x + abs(uv.y - 0.5) * slope;
  float linePos = front - bandWidth * 2.1;
  float d = abs(c - linePos);
  return (1.0 - smoothstep(0.0, 0.004, d)) * 0.35;
}

vec4 transition(vec2 uv) {
  vec4 fromC = getFromColor(uv);
  vec4 toC = getToColor(uv);

  float eased = npEase(progress);
  float slope = chevronSlope + sin(progress * 6.283) * 0.03 * motionIntensity;
  float c = uv.x + abs(uv.y - 0.5) * slope;
  float bw = bandWidth;
  float stag = stagger * motionIntensity;

  float leadFront = mix(-0.32, 1.34, eased);
  float tailBack = leadFront - stag * 4.0 - bw * 5.2;

  if (c > leadFront + 0.012) {
    return toC;
  }

  float shimmer = 0.9 + 0.1 * sin(progress * 18.0 + uv.x * 22.0 + uv.y * 11.0);

  float f0 = leadFront;
  float f1 = leadFront - stag;
  float f2 = leadFront - stag * 2.0;
  float f3 = leadFront - stag * 3.0;
  float f4 = leadFront - stag * 4.0;

  if (c >= f0 - bw && c <= f0) {
    float local = (c - (f0 - bw)) / bw;
    if (local > 0.86) return vec4(0.0, 0.0, 0.0, 1.0);
    vec3 col = npBandColor(0.0) * shimmer;
    col *= 1.0 + 0.06 * sin(progress * 12.0) * motionIntensity;
    col += vec3(1.0) * (1.0 - smoothstep(0.0, 0.12, local)) * shineStrength;
    col = mix(col, vec3(0.0), npInnerChevronLine(uv, f0, slope) * 0.25);
    return vec4(col, 1.0);
  }
  if (c >= f1 - bw && c <= f1) {
    float local = (c - (f1 - bw)) / bw;
    if (local > 0.86) return vec4(0.0, 0.0, 0.0, 1.0);
    vec3 col = npBandColor(1.0) * shimmer * (1.0 + 0.06 * sin(progress * 12.0 - 1.4) * motionIntensity);
    col = mix(col, vec3(0.0), npInnerChevronLine(uv, f1, slope) * 0.25);
    return vec4(col, 1.0);
  }
  if (c >= f2 - bw && c <= f2) {
    float local = (c - (f2 - bw)) / bw;
    if (local > 0.86) return vec4(0.0, 0.0, 0.0, 1.0);
    vec3 col = npBandColor(2.0) * shimmer * (1.0 + 0.06 * sin(progress * 12.0 - 2.8) * motionIntensity);
    col = mix(col, vec3(0.0), npInnerChevronLine(uv, f2, slope) * 0.25);
    return vec4(col, 1.0);
  }
  if (c >= f3 - bw && c <= f3) {
    float local = (c - (f3 - bw)) / bw;
    if (local > 0.86) return vec4(0.0, 0.0, 0.0, 1.0);
    vec3 col = npBandColor(3.0) * shimmer * (1.0 + 0.06 * sin(progress * 12.0 - 4.2) * motionIntensity);
    col = mix(col, vec3(0.0), npInnerChevronLine(uv, f3, slope) * 0.25);
    return vec4(col, 1.0);
  }
  if (c >= f4 - bw && c <= f4) {
    float local = (c - (f4 - bw)) / bw;
    if (local > 0.86) return vec4(0.0, 0.0, 0.0, 1.0);
    vec3 col = npBandColor(4.0) * shimmer * (1.0 + 0.06 * sin(progress * 12.0 - 5.6) * motionIntensity);
    col = mix(col, vec3(0.0), npInnerChevronLine(uv, f4, slope) * 0.25);
    return vec4(col, 1.0);
  }

  float ghost = 0.0;
  if (c >= f0 - bw * 0.95 && c < f0 - bw * 0.7) ghost = max(ghost, 0.12);
  if (c >= f1 - bw * 0.95 && c < f1 - bw * 0.7) ghost = max(ghost, 0.1);
  if (c >= f2 - bw * 0.95 && c < f2 - bw * 0.7) ghost = max(ghost, 0.085);
  if (ghost > 0.01) {
    vec3 gcol = npBandColor(2.0) * ghost * motionIntensity;
    return vec4(mix(fromC.rgb, gcol, ghost * 2.5), 1.0);
  }

  float sparkZone = smoothstep(tailBack - 0.16, tailBack + 0.04, c);
  float spark = npSparkleField(uv, progress) * sparkZone * sparkleStrength;
  if (spark > 0.2) {
    vec3 starOrange = vec3(1.0, 0.48, 0.24);
    vec3 starLilac = vec3(0.75, 0.58, 1.0);
    vec3 starMint = vec3(0.5, 1.0, 0.9);
    vec3 starCol = mix(starOrange, starLilac, step(0.5, uv.y));
    starCol = mix(starCol, starMint, step(0.45, uv.x) * (1.0 - step(0.55, uv.y)));
    return vec4(mix(fromC.rgb, starCol, clamp(spark, 0.0, 1.0)), 1.0);
  }

  return fromC;
}
`;

export const CUSTOM_GL_TRANSITIONS: GlTransitionSpec[] = [
  {
    name: 'np-geometric-colorful-swipe',
    author: 'NoProbleme',
    license: 'MIT',
    glsl: NP_GEOMETRIC_COLORFUL_SWIPE_GLSL,
    defaultParams: {
      chevronSlope: 0.52,
      bandWidth: 0.04,
      stagger: 0.024,
      motionIntensity: 1.0,
      sparkleStrength: 1.0,
      shineStrength: 0.4,
    },
    paramsTypes: {
      chevronSlope: 'float',
      bandWidth: 'float',
      stagger: 'float',
      motionIntensity: 'float',
      sparkleStrength: 'float',
      shineStrength: 'float',
    },
  },
];

export function isCustomGlTransitionName(name: string): boolean {
  return (CUSTOM_GL_TRANSITION_IDS as readonly string[]).includes(name);
}
