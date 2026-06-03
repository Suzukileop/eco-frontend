import createTexture from 'gl-texture2d';
import createTransition from 'gl-transition';
import type { GlTransitionSpec } from 'gl-transitions';
import { getGlTransitionByName } from '@/lib/glTransitions';

const BIG_TRIANGLE = new Float32Array([-1, -1, -1, 4, 4, -1]);

export function loadMediaSource(url: string): Promise<TexImageSource> {
  return new Promise((resolve, reject) => {
    const lower = url.toLowerCase();
    const isVideo = /\.(mp4|webm|mov)(\?|$)/i.test(lower);
    if (isVideo) {
      const video = document.createElement('video');
      video.crossOrigin = 'anonymous';
      video.muted = true;
      video.playsInline = true;
      video.preload = 'auto';
      video.onloadeddata = () => resolve(video);
      video.onerror = () => reject(new Error('video load failed'));
      video.src = url;
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('image load failed'));
    img.src = url;
  });
}

export type GlRenderer = {
  draw: (
    progress: number,
    glName: string,
    from: TexImageSource,
    to: TexImageSource,
    width: number,
    height: number
  ) => void;
  dispose: () => void;
};

export function createGlRenderer(canvas: HTMLCanvasElement): GlRenderer | null {
  const gl = canvas.getContext('webgl', {
    premultipliedAlpha: false,
    preserveDrawingBuffer: true,
  }) as WebGLRenderingContext | null;
  if (!gl) return null;

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, BIG_TRIANGLE, gl.STATIC_DRAW);

  const runners = new Map<string, ReturnType<typeof createTransition>>();
  const textureCache = new Map<string, ReturnType<typeof createTexture>>();

  const getRunner = (glName: string) => {
    let runner = runners.get(glName);
    if (runner) return runner;
    const spec = getGlTransitionByName(glName);
    if (!spec) return null;
    runner = createTransition(gl, spec, { resizeMode: 'cover' });
    runners.set(glName, runner);
    return runner;
  };

  const getTexture = (key: string, source: TexImageSource) => {
    let tex = textureCache.get(key);
    if (!tex) {
      tex = createTexture(gl, source);
      tex.minFilter = gl.LINEAR;
      tex.magFilter = gl.LINEAR;
      textureCache.set(key, tex);
    }
    return tex;
  };

  return {
    draw(progress, glName, from, to, width, height) {
      const runner = getRunner(glName);
      if (!runner) return;
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      const fromTex = getTexture('from', from);
      const toTex = getTexture('to', to);
      const spec = getGlTransitionByName(glName) as GlTransitionSpec;
      runner.draw(
        progress,
        fromTex,
        toTex,
        width,
        height,
        (spec.defaultParams ?? {}) as Record<string, number | boolean>
      );
    },
    dispose() {
      runners.forEach((r) => r.dispose());
      textureCache.forEach((t) => t.dispose());
      runners.clear();
      textureCache.clear();
    },
  };
}
