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

**Etapa 2 — Editor de figurinhas funcional. Status: em validação (2.1 a 2.5 implementadas).**

- [x] Formulário manual para distância e tempo.
- [x] Cálculo automático do ritmo médio e atualização imediata da prévia.
- [x] Validação de distância e tempo, com suporte a `MM:SS`, `H:MM:SS`, vírgula e ponto decimal.
- [x] Ressalva explícita sobre pausas no cálculo manual.
- [x] Teste funcional responsivo em Chromium a 390 e 1280 px.
- [x] Templates Minimal, Performance e Clean com composições próprias.
- [x] Cores, título, data, métricas opcionais, visibilidade e organizações predefinidas.
- [x] Modos de prévia transparente e arte completa, sem geração de arquivo.
- [x] Desfazer/refazer por botões e atalhos, com agrupamento previsível da digitação.
- [x] Rascunho local opcional, versionado, validado e recuperável sem persistir o pace derivado.
- [x] Restauração da aparência e nova figurinha com confirmação, sem excluir rascunho implicitamente.
- [ ] Aceite da experiência completa em celular real pela prévia da Vercel.

| Verificação da Etapa 2 | Resultado |
| --- | --- |
| Testes automatizados | 25 testes aprovados: regressão de pace/personalização e novos casos de undo/redo, histórico divergente, agrupamento, limite de 50 estados, rascunhos, corrupção e restauração. |
| Interface funcional | Chromium executou T1–T16: botões e atalhos, pace após undo, autosave opt-in, recuperação após recarga, corrupção, confirmações, templates, personalização e regressões. |
| Responsividade | Chromium em 360, 390, 768 e 1280 px, sem rolagem horizontal, cortes ou sobreposições; prévia acima dos controles no celular e ao lado no desktop. |
| Navegação | Sete rotas responderam HTTP 200 e exibiram o título esperado; `/estudio` foi aberta diretamente após recarga. |
| Qualidade | Linha de base e resultado final: `npm test`, `npm run lint` e `npm run build` concluídos com sucesso em 18/11/2026. |

**Última entrega** — subetapa 2.5: histórico tipado, persistência local opcional, recuperação segura, restauração e feedback acessível. Alterações contínuas no mesmo campo formam uma entrada de histórico até a saída do foco; novas edições invalidam o refazer; atalhos globais não interceptam inputs.

**Limitações do rascunho local** — usa `localStorage`, formato versão 1, debounce de 300 ms e não envia dados ao servidor. Vale somente para o navegador/dispositivo atual, pode ser removido por limpeza dos dados do navegador e não sincroniza entre dispositivos ou modo anônimo. Um rascunho inválido é ignorado com mensagem clara. Desativar o autosave não exclui um rascunho existente; a exclusão exige ação e confirmação próprias.

**Pendências** — executar o GitHub Actions remoto, obter a prévia da Vercel e conferir o fluxo completo e a recarga de `/estudio` em celular real. Nenhum bug funcional foi encontrado na cobertura local descrita. npm emitiu aviso de depreciação do ESLint 9 e Vite informou duas diretivas `use client` ignoradas no bundle do React Router; os comandos terminaram com sucesso.

**Próxima ação** — revisar o PR e a prévia da Vercel no celular: editar, desfazer/refazer, salvar, recarregar, recuperar, restaurar e navegar. Após o aceite, encerrar a Etapa 2 e planejar a Etapa 3 sem antecipar funcionalidades neste PR.
