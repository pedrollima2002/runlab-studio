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

**Última entrega da Etapa 2** — subetapa 2.5: histórico tipado, persistência local opcional, recuperação segura, restauração e feedback acessível. Alterações contínuas no mesmo campo formam uma entrada de histórico até a saída do foco; novas edições invalidam o refazer; atalhos globais não interceptam inputs.

**Limitações do rascunho local** — usa `localStorage`, formato versão 1, debounce de 300 ms e não envia dados ao servidor. Vale somente para o navegador/dispositivo atual, pode ser removido por limpeza dos dados do navegador e não sincroniza entre dispositivos ou modo anônimo. Um rascunho inválido é ignorado com mensagem clara. Desativar o autosave não exclui um rascunho existente; a exclusão exige ação e confirmação próprias.

**Pendências** — executar o GitHub Actions remoto, obter a prévia da Vercel e conferir o fluxo completo e a recarga de `/estudio` em celular real. Nenhum bug funcional foi encontrado na cobertura local descrita. npm emitiu aviso de depreciação do ESLint 9 e Vite informou duas diretivas `use client` ignoradas no bundle do React Router; os comandos terminaram com sucesso.

**Etapa 3 — Exportação, fotografias e compartilhamento. Status: 3A e 3B implementadas; Etapa 3 permanece em validação.**

- [x] PNG transparente real, sem quadriculado ou fundo introduzido e com área ajustada ao conteúdo.
- [x] Story 1080 × 1920 e Feed 1080 × 1350 com layouts próprios para cada proporção.
- [x] Seleção de formato, prévia proporcional, download real e estados de processamento, sucesso e falha.
- [x] Renderização local por SVG vetorial e Canvas, sem dependência nova ou serviço externo.
- [x] Espera pelas fontes disponíveis, escape de entradas textuais e liberação de URLs temporárias.
- [x] Fotografia, composição, guia de área segura e compartilhamento compatível (Etapa 3B).
- [ ] Validação de download em celular real e Safari/iOS pela prévia da Vercel.

### Evidências da Etapa 3A — 18/11/2026

| Teste | Estado | Evidência |
| --- | --- | --- |
| T1 · Transparência | aprovado | PNG RGBA decodificado; canal alfa medido de 0 a 255 e saída recortada a 1080 × 1255 px, sem retângulo de fundo nem quadriculado. |
| T2 · Story | aprovado | Arquivo baixado e decodificado com exatamente 1080 × 1920 px. |
| T3 · Feed | aprovado | Arquivo baixado e decodificado com exatamente 1080 × 1350 px. |
| T4 · Arquivo válido | aprovado | Pillow abriu os três formatos como PNG; Story e Feed tinham aproximadamente 1,7 MB e 1,2 MB no caso exercitado. |
| T5 · Templates | aprovado | Minimal, Performance e Clean exportados em Feed e decodificados sem falha. |
| T6 · Dados | aprovado | Teste do plano SVG confirmou título, distância, tempo e ritmo; arquivo personalizado foi gerado com 1,8 MB. |
| T7 · Personalização | aprovado | Teste automatizado confirmou cor rosa, alinhamento central e somente as métricas fornecidas; inspeção visual cobriu cores e métricas. |
| T8 · Dados opcionais | aprovado | Teste automatizado forneceu apenas Distância e comprovou ausência de FC média, Elevação e Ritmo médio no SVG final. |
| T9 · Acentuação | aprovado | “São João”, “ação”, acentos, travessão e unidades foram preservados; marcação textual foi escapada. |
| T10 · Textos longos | aprovado | Título longo foi limitado a duas linhas e o Feed permaneceu decodificável em 1080 × 1350, sem ultrapassar o canvas. |
| T11 · Estados | aprovado | Teste automatizado gerou os três formatos e confirmou que dados e aparência originais não sofreram mutação. |
| T12 · Download | aprovado no Chromium desktop | O botão iniciou downloads reais com nome previsível, por exemplo `runlab-10-00km-story.png`. Aparelhos reais seguem pendentes. |
| T13 · Qualidade | aprovado por inspeção local | Oito saídas comparadas em montagem: texto nítido, margens internas, alinhamento e proporções preservados; Feed é reorganizado, não cortado do Story. |
| T14 · Responsividade | aprovado no Chromium | 360, 390, 768 e 1280 px sem rolagem horizontal; captura completa em 390 px sem sobreposição. Não equivale a teste em aparelho real. |
| T15 · Rotas | aprovado | Sete rotas, inclusive abertura direta de `/estudio` e 404, responderam HTTP 200 no servidor Vite. |
| T16 · Regressão | aprovado localmente | 5 km / 25:00 retornou 5:00/km, desfazer restaurou 54:40; 34 testes automatizados cobrem pace, templates, cores, histórico e rascunhos. |
| T17 · Erros | aprovado | `canvas.toBlob` foi simulado com falha; a interface exibiu erro claro e permaneceu utilizável. Exportação concorrente também foi bloqueada, com uma única codificação. |
| T18 · Consistência | aprovado por inspeção local | Prévia e arquivos mantêm template, hierarquia, paleta e conteúdo. Diferenças justificadas: Story usa mais espaço vertical, Feed reorganiza conteúdo em 4:5 e Transparente remove fundo e recorta margens vazias. |

**Técnica escolhida** — o estado tipado do editor alimenta um SVG local com as composições Minimal, Performance e Clean; o SVG é desenhado em Canvas na resolução-alvo e convertido por `toBlob('image/png')`. A abordagem preserva vetores e acentos, produz alfa verdadeiro, evita captura de elementos da interface e mantém aberta a evolução para fotografia na 3B, sem adicionar pacote ao bundle.

**Comandos finais** — `npm test` (34/34), `npm run lint` e `npm run build` concluídos com sucesso. O Chromium gerou e baixou arquivos reais; Pillow confirmou o conteúdo binário e as dimensões. O build manteve apenas os avisos já conhecidos das diretivas `use client` do React Router.

**Limitações conhecidas** — a fonte efetiva depende das fontes disponíveis no navegador, com fallback para Arial/sans-serif; o PNG transparente pode ter contraste insuficiente sobre determinadas fotos, por isso a interface orienta a escolha de cor; Safari/iOS, Android real, Vercel e consumo de memória em aparelhos de baixa capacidade não foram testados. Não há fotografia, compartilhamento, upload ou persistência das imagens nesta subetapa.

### Evidências da Etapa 3B — 18/11/2026

| Teste | Estado | Evidência |
| --- | --- | --- |
| T1 · Upload | aprovado no Chromium | JPEG 1600 × 900, PNG e WebP 900 × 1600 foram decodificados. JPEG 5000 × 1000 teve prévia interna reduzida para 4096 px. |
| T2 · Arquivos inválidos | aprovado | Testes unitários recusaram SVG, HEIC, arquivo vazio e mais de 15 MB; a interface rejeitou SVG com mensagem explícita. |
| T3 · Orientação | aprovado no Chromium | JPEG 1200 × 800 com EXIF orientação 6 foi interpretado como 800 × 1200; fotos horizontal e vertical também foram exercitadas. |
| T4 · Proporção | aprovado | Cálculos unitários e inspeção do CSS comprovaram preservação da razão original durante o preenchimento. |
| T5 · Zoom | aprovado | Slider ampliou de 1× a 2×; limites unitários normalizam entre 1× e 3× sem área descoberta. |
| T6 · Arrastar | aprovado em ambiente emulado | Mouse e eventos de toque do Chromium alteraram o foco normalizado; toque real em aparelho segue pendente. |
| T7 · Restaurar | aprovado | Restauração devolveu zoom 1× e foco central; contraste possui restauração separada. |
| T8 · Templates | aprovado | Minimal, Performance e Clean foram alternados sem perder foto ou dados. |
| T9 · Contraste | aprovado | Escurecimento de 40% apareceu na prévia; gradiente de 70% foi aplicado no mesmo estado usado pela exportação. |
| T10 · Story | aprovado | PNG com foto e métricas decodificado em exatamente 1080 × 1920 px. |
| T11 · Feed | aprovado | PNG com foto e métricas decodificado em exatamente 1080 × 1350 px. |
| T12 · Transparência | aprovado | PNG RGBA manteve alfa zero e foi binariamente idêntico com e sem foto selecionada. |
| T13 · Fidelidade | aprovado por inspeção local | Prévia e montagem dos PNGs mantiveram foco, recorte, contraste, template, textos e métricas; guia segura não apareceu nos arquivos. |
| T14 · Acentuação | aprovado | “Corrida de São João — ação” foi exportado em PNG com foto. |
| T15 · Textos longos | aprovado por regressão | Limite de 48 caracteres e quebra em até duas linhas do motor 3A permaneceram ativos, sem corte observado. |
| T16 · Remover fotografia | aprovado | Remoção voltou ao estado sem imagem e manteve título e dados da corrida. |
| T17 · Compartilhamento | aprovado com API simulada | Web Share recebeu um `File` PNG válido; cancelamento `AbortError` retornou mensagem neutra. Menu nativo real não foi executado. |
| T18 · Fallback | aprovado | Ausência simulada de Web Share mostrou orientação para download, que permaneceu habilitado. |
| T19 · Privacidade | aprovado localmente | Nenhuma requisição HTTP externa; rascunho de 361 bytes sem `blob:`, Base64, nome ou conteúdo da fotografia. |
| T20 · Rascunhos | aprovado | Recarregar recuperou o fluxo textual sem camada de foto nem URL quebrada; a interface informa a necessidade de reseleção. |
| T21 · Mobile | aprovado em viewport Chromium | 360 e 390 px sem rolagem horizontal; captura completa em 390 px sem sobreposição. Não equivale a aparelho real. |
| T22 · Tablet e desktop | aprovado no Chromium | 768 e 1280 px sem rolagem horizontal. |
| T23 · Rotas | aprovado | Abertura direta e recarga de `/estudio` responderam HTTP 200. |
| T24 · Regressão | aprovado localmente | 5 km / 25:00 retornou 5:00/km; testes automatizados cobrem templates, cores, histórico, rascunhos e exportação 3A. |
| T25 · Memória | parcial | Após seis substituições e uma exportação, restou somente a URL da foto atual; URLs anteriores e temporárias foram revogadas. Perfil de heap em celular real não foi executado. |

**Decisões técnicas da 3B** — a fotografia é um `ImageBitmap` orientado pelo navegador e, acima de 4096 px no maior lado, recebe cópia reduzida para edição. Zoom e foco usam coordenadas normalizadas independentes da tela; a mesma função calcula posições CSS e Canvas. O motor 3A desenha foto, escurecimento e gradiente antes do SVG dos templates. Nenhuma biblioteca foi adicionada. Movimentos são limitados a um `requestAnimationFrame` para evitar atualizações acima da taxa de pintura.

**Privacidade e rascunhos** — fotos permanecem em memória na aba, nunca entram no `EditorState` serializado e não são enviadas. Trocar/remover foto ou sair revoga a URL e fecha o `ImageBitmap`. Recuperar rascunho restaura somente dados e personalização, sem simular referência persistente para uma foto temporária.

**Comandos finais da 3B** — `npm ci --cache /tmp/runlab-npm-cache`, `npm test` (41/41), `npm run lint` e `npm run build` concluídos com sucesso. O cache explícito foi necessário porque o cache padrão do npm no ambiente não era gravável. O teste funcional do Chromium executou T1–T25, Pillow decodificou os PNGs e a inspeção visual comparou prévia, Story, Feed e transparência.

**Limitações conhecidas da 3B** — Safari/iOS, Android real, menu de compartilhamento nativo, aplicativos receptores e prévia Vercel não foram testados. Web Share varia por navegador e pode recusar PNG. Pinça para zoom não foi implementada; há slider por toque/teclado. O fallback sem `createImageBitmap` depende da decodificação nativa do elemento de imagem. O teste de recursos acompanha URLs, não substitui perfil de heap em aparelho intermediário.

**Próxima ação** — revisar o PR e a prévia Vercel em celular real: fotografar ou escolher JPEG, ajustar com toque, alternar Story/Feed, baixar, compartilhar e conferir os PNGs na galeria. Só depois dessa evidência marcar a Etapa 3 como concluída.
