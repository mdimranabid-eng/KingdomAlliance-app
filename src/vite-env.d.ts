/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BACKEND_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module 'qrcode.react' {
  export const QRCodeSVG: any;
  export const QRCodeCanvas: any;
}
