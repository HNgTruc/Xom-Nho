/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Gốc của backend, không kèm /api/v1. Công khai: chỉ để URL, không để bí mật. */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
