# Progresso do RUNLAB

**Etapa 1 — Interface visual e fundação. Status: em validação.**

- [x] Início, Estúdio, Análises, Histórico, Perfil, Entrar e 404 navegáveis.
- [x] Estúdio com prévia 9:16, amostras Minimal, Performance e Clean e quatro painéis demonstrativos.
- [x] Build estático, lockfile, workflow GitHub Actions e fallback da SPA para Vercel.
- [x] Verificação local do build e inspeção das telas do Estúdio.
- [ ] Revisão em celular real e primeiro CI remoto.

| Teste | Estado | Resultado |
| --- | --- | --- |
| T1 · Instalar, rodar, lint e build | aprovado | `npm ci`, servidor Vite, `npm run lint` e `npm run build` executados. |
| T2 · Rotas, reload e 404 | aprovado | Chromium abriu diretamente e recarregou as sete telas. Cliques de navegação e retorno do 404 conferidos. |
| T3 · Responsividade | aprovado | Chromium em 360, 390, 768 e 1280 px sem rolagem horizontal nas sete telas. Inspeção visual do Estúdio em 390 e 1280 px. |
| T4 · Prévia lateral no desktop | aprovado | Prévia à direita em 1280 px, com proporção 9:16 e posicionamento sticky conferido. |
| T5 · Prévia antes dos controles | aprovado | Ordem conferida em 360, 390 e 768 px. |
| T6 · Ações futuras | aprovado | Estúdio com ritmo somente leitura, botões desativados e aviso de desenvolvimento. Login e Perfil têm campos desativados. |
| T7 · Rótulos, contraste e teclado | aprovado | Rótulo do ritmo, atalho de pular ao conteúdo, indicador de foco e expansão por teclado exercitados. Pares principais da paleta medidos entre 6,72 e 8,63:1. Cobertura parcial de acessibilidade. |
| T8 · Git e integração contínua | aprovado | Git confirmou as exclusões e os comandos do workflow passaram localmente. Execução remota pendente. |
| T9 · Build e fallback de rota | aprovado | Vite Preview serviu o build, as rotas diretas e os ativos estáticos; o rewrite da Vercel foi preparado. Verificação na Vercel ainda pendente. |
| T10 · Celular real via URL online | não executado | Requer conectar GitHub à hospedagem, publicar uma prévia e abrir Início e Estúdio no telefone. |
| T11 · Segredos | aprovado | Conferidos os arquivos candidatos à importação. Nenhum `.env`, chave privada ou token conhecido encontrado. |

**Última entrega** — código da Etapa 1, fluxo de revisão pelo celular e instruções de publicação. A prévia troca de lado no breakpoint de 896 px. O Estúdio usa dados de exemplo e mantém edição e exportação indisponíveis nesta etapa.

**Pendências** — importar o código em um repositório, executar o GitHub Actions remoto e conferir a implantação no celular. Nenhum bug funcional encontrado na cobertura descrita. npm emitiu aviso de depreciação do ESLint 9 e Vite informou duas diretivas `use client` ignoradas no bundle do React Router. Os comandos terminaram com sucesso.

**Próxima ação** — conectar o repositório, abrir a primeira prévia no celular e validar Início, Estúdio e atualização de `/estudio`. Após o aceite, começar a Etapa 2 pelo modelo de dados e formulário manual, calculando o ritmo médio automaticamente.
