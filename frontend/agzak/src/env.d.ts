/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GA_ID?: string;
  readonly VITE_HJ_ID?: string;
  readonly VITE_ENABLE_ANALYTICS?: string; // "true"/"false"
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
