declare module 'gl-transitions' {
  export interface GlTransitionSpec {
    name: string;
    glsl: string;
    defaultParams: Record<string, number | boolean | number[]>;
    paramsTypes: Record<string, string>;
    author?: string;
    license?: string;
  }
  const transitions: GlTransitionSpec[];
  export default transitions;
}

declare module 'gl-transition' {
  import type { GlTransitionSpec } from 'gl-transitions';

  type GLTextureLike = {
    bind: (unit: number) => number;
    shape: [number, number];
  };

  type Options = { resizeMode?: 'cover' | 'contain' | 'stretch' };

  interface TransitionRunner {
    draw: (
      progress: number,
      from: GLTextureLike,
      to: GLTextureLike,
      width?: number,
      height?: number,
      params?: Record<string, number | boolean | GLTextureLike>
    ) => void;
    dispose: () => void;
  }

  export default function createTransition(
    gl: WebGLRenderingContext,
    transition: GlTransitionSpec,
    options?: Options
  ): TransitionRunner;
}

declare module 'gl-texture2d' {
  interface Texture2D {
    bind(unit: number): number;
    shape: [number, number];
    minFilter: number;
    magFilter: number;
    dispose: () => void;
  }
  export default function createTexture(
    gl: WebGLRenderingContext,
    image: TexImageSource,
    width?: number,
    height?: number
  ): Texture2D;
}
