# Instruções para agentes

Carregado junto com `CLAUDE.md` via `.cursor/rules/project-context.mdc` (`alwaysApply: true`).

## Pasta `prototipo/` — não consultar

**Nunca** leia, busque, cite ou use arquivos em `prototipo/` para planejar, implementar, revisar ou responder perguntas — **a menos que o operador peça explicitamente** que aquele material seja usado.

- O HTML em `prototipo/` é referência legada; o app atual está em `src/`.
- Abrir ou vasculhar esse arquivo é inútil na maior parte do trabalho e consome muitos tokens.
- Em dúvida sobre comportamento ou formato de planilhas, use `src/`, `CLAUDE.md` e o código já implementado — não o protótipo.

**Exceção:** só quando o operador disser algo como “consulte o prototipo”, “veja o prototipo01.html” ou indicar um arquivo específico dentro de `prototipo/`.
