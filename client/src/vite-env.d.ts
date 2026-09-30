/// <reference types="vite/client" />

type ImportMetaEnv = {
	readonly VITE_API_URL: string;
};

type ImportMeta = {
	readonly env: ImportMetaEnv;
};

/** Versão vinda de `client/package.json`, injetada pelo `define` do Vite. */
declare const __APP_VERSION__: string;
