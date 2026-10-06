/**
 * Versão do sistema, exibida no rodapé da sidebar.
 *
 * Fonte única: `client/package.json`. O Vite congela o valor no build via
 * `define` (`__APP_VERSION__`), então a tela mostra exatamente o que foi
 * compilado — não existe segundo lugar para manter em sincronia.
 *
 * O template fica em `1.0.0` e não bumpa: versão é assunto do projeto derivado,
 * que escolhe o próprio esquema de release (ver `AGENTS.md` §2).
 */
export const APP_VERSION: string = __APP_VERSION__;
