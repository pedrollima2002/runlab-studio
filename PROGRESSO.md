# Progresso do RUNLAB

**Etapa 1 — Interface visual e fundação. Status: em validação.**

- [x] Início, Estúdio, Análises, Histórico, Perfil, Entrar e 404 navegáveis.
- [x] Estúdio com prévia 9:16, amostras Minimal, Performance e Clean e quatro painéis demonstrativos.
- [x] Build estático, lockfile e fallback da SPA para Vercel.
- [x] Verificação local do build e inspeção das telas do Estúdio.
- [ ] Primeiro CI remoto, prévia da Vercel e revisão em celular real.

| Teste | Estado | Resultado |
| --- | --- | --- |
| T1 · Instalar, rodar, lint e build | aprovado | `npm ci`, servidor Vite, `npm run lint` e `npm run build` executados; lint e build repetidos com sucesso em 18/11/2026. |
| T2 · Rotas, reload e 404 | aprovado | Chromium abriu diretamente as sete telas em 18/11/2026; todas responderam HTTP 200 e exibiram o título esperado, incluindo a 404 da SPA. |
| T3 · Responsividade | aprovado | Cobertura anterior em 360, 390, 768 e 1280 px. Em 18/11/2026, o Estúdio foi novamente verificado em 390 e 1280 px, sem rolagem horizontal no celular. |
| T4 · Prévia lateral no desktop | aprovado | Prévia à direita em 1280 px, com proporção 9:16 e posicionamento sticky conferido. |
| T5 · Prévia antes dos controles | aprovado | Ordem conferida em 360, 390 e 768 px. |
| T6 · Ações futuras | aprovado | Estúdio com ritmo somente leitura, botões desativados e aviso de desenvolvimento. Login e Perfil têm campos desativados. |
| T7 · Rótulos, contraste e teclado | aprovado | Rótulo do ritmo, atalho de pular ao conteúdo, indicador de foco e expansão por teclado exercitados. Pares principais da paleta medidos entre 6,72 e 8,63:1. Cobertura parcial de acessibilidade. |
| T8 · Git e integração contínua | pendente | O checkout de `main` não continha `.gitignore` nem `.github/workflows/ci.yml`. Os arquivos foram restaurados na branch da Etapa 2 e os comandos passaram localmente; falta evidência do primeiro CI remoto. |
| T9 · Build e fallback de rota | parcial | Build e rotas diretas foram verificados localmente, e `vercel.json` contém o rewrite da SPA. A execução na Vercel ainda não foi verificada. |
| T10 · Celular real via URL online | não executado | Requer conectar GitHub à hospedagem, publicar uma prévia e abrir Início e Estúdio no telefone. |
| T11 · Segredos | aprovado | Conferidos os arquivos candidatos à importação. Nenhum `.env`, chave privada ou token conhecido encontrado. |

**Etapa 2 — Editor de figurinhas funcional. Status: em desenvolvimento (2.1 a 2.4 implementadas).**

- [x] Formulário manual para distância e tempo.
- [x] Cálculo automático do ritmo médio e atualização imediata da prévia.
- [x] Validação de distância e tempo, com suporte a `MM:SS`, `H:MM:SS`, vírgula e ponto decimal.
- [x] Ressalva explícita sobre pausas no cálculo manual.
- [x] Teste funcional responsivo em Chromium a 390 e 1280 px.
- [x] Templates Minimal, Performance e Clean com composições próprias.
- [x] Cores, título, data, métricas opcionais, visibilidade e organizações predefinidas.
- [x] Modos de prévia transparente e arte completa, sem geração de arquivo.
- [ ] Desfazer/refazer e requisitos restantes da subetapa 2.5.

| Verificação da Etapa 2 | Resultado |
| --- | --- |
| Testes automatizados | 16 testes aprovados: os quatro casos de pace, entradas inválidas, padrões dos templates, compatibilidade e restauração de cores, visibilidade e proteção contra figurinha vazia. |
| Interface funcional | Chromium trocou os três templates sem perder dados, alterou/restaurou cores, título, métricas, organizações e modos de prévia; opcionais vazios não exibiram números fictícios. |
| Responsividade | Chromium em 360, 390, 768 e 1280 px, sem rolagem horizontal, cortes ou sobreposições; prévia acima dos controles no celular e ao lado no desktop. |
| Navegação | Sete rotas responderam HTTP 200 e exibiram o título esperado; `/estudio` foi aberta diretamente após recarga. |
| Qualidade | `npm test`, `npm run lint` e `npm run build` concluídos com sucesso em 18/11/2026. Teste funcional real cobriu T1–T9 e T12–T15; T10–T11 permaneceram cobertos pela suíte unitária. |

**Última entrega** — subetapas 2.3 e 2.4: templates e personalização reativos sobre a mesma fonte de dados da atividade. Exportação e fotografia permanecem desabilitadas; não foram adicionados PNG, download, Strava, autenticação, banco de dados ou IA.

**Pendências** — executar o GitHub Actions remoto, obter a prévia da Vercel e conferir Início, Estúdio e recarga de `/estudio` em celular real. Nenhum bug funcional foi encontrado na cobertura local descrita. npm emitiu aviso de depreciação do ESLint 9 e Vite informou duas diretivas `use client` ignoradas no bundle do React Router; os comandos terminaram com sucesso.

**Próxima ação** — revisar o PR e a prévia da Vercel no celular, alternando templates, cores, métricas, organizações e modos sem perder os dados. Depois do aceite de 2.3/2.4, planejar a subetapa 2.5 sem antecipar exportação.
