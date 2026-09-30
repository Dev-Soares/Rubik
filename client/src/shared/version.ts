/**
 * Versão do sistema, exibida no rodapé da sidebar.
 *
 * Fonte única: `client/package.json`. O Vite congela o valor no build via
 * `define` (`__APP_VERSION__`), então a tela mostra exatamente o que foi
 * compilado — não existe segundo lugar para manter em sincronia.
 *
 * Como bumpar: `.claude/rules/versionamento.md`.
 */
export const APP_VERSION: string = __APP_VERSION__;
