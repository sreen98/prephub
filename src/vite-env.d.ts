/// <reference types="vite/client" />

declare module '@babel/standalone' {
  const babel: any;
  export default babel;
  export function transform(code: string, options: any): { code: string };
}

interface Window {
  gtag: (...args: any[]) => void;
}
