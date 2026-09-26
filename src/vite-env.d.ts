/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** "false" desactiva el modo demostración (ver src/config/demo.ts). */
  readonly VITE_DEMO_MODE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
