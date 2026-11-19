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

### Correção crítica WYSIWYG da Etapa 3B — 19/11/2026

**Bug** — a prévia React/CSS e o PNG reconstruído em SVG eram dois layouts independentes. Embora ambos recebessem os mesmos dados, o Minimal da prévia usava indicadores verticais, posições e escalas CSS e o exportador usava linhas horizontais e coordenadas próprias. A prévia também usava o ícone Activity, enquanto o exportador desenhava outro símbolo. Essa duplicação, e não estado desatualizado ou troca silenciosa de template, causava a divergência observada com e sem fotografia.

**Correção** — `createExportSvg` tornou-se a fonte canônica da composição. `Sticker` insere esse mesmo SVG na prévia, escalado pelo `viewBox`, e o exportador o desenha no Canvas na resolução final. A fotografia continua como camada inferior e usa o cálculo compartilhado de enquadramento; guia, borda e controles permanecem exclusivos do editor. O modelo de dados visual foi separado em `src/sticker-data.ts` para remover a dependência circular entre prévia e exportador. A mudança ficou limitada a `src/export-engine.ts`, `src/export-engine.test.ts`, `src/preview.tsx`, `src/sticker-data.ts`, `src/studio.tsx`, `src/styles.css`, `README.md`, `ROADMAP.md` e este relatório.

| Teste | Estado | Evidência em 19/11/2026 |
| --- | --- | --- |
| T1–T3 · Minimal, Performance e Clean com foto | aprovado no Chromium | Os três templates foram comparados em Story e Feed, totalizando seis pares prévia/PNG real. Erro absoluto médio após normalização: 3,03–3,97 em 255; diferenças residuais concentradas em antialiasing e reamostragem, sem mudança estrutural. |
| T4 · Barras decorativas | aprovado | Regressão automatizada exige `data-divider="vertical"` no Minimal à esquerda; inspeção do SVG exibido confirmou a mesma orientação. |
| T5 · Logomarca | aprovado | Regressão exige o ícone Activity e seu mesmo path no SVG canônico usado pelos dois destinos. |
| T6 · Escalas tipográficas | aprovado | Regressão fixa os tamanhos relativos de título, valor e unidade do caso Story Minimal; os seis pares visuais mantiveram posições e escalas. |
| T7 · Cores | aprovado | Cor de destaque e texto são resolvidos uma vez no SVG compartilhado; as comparações de pixels incluíram as camadas coloridas dos templates. |
| T8 · Foto: recorte, zoom e deslocamento | aprovado no Chromium | Foto horizontal exercitada com zoom 1,37× e arraste; Story e Feed preservaram o foco relativo nos PNGs correspondentes. Cálculos unitários de enquadramento continuam aprovados. |
| T9 · Contraste | aprovado no Chromium | Escurecimento 31% e gradiente 46% participaram da comparação dos seis pares e permaneceram equivalentes. |
| T10 · Story | aprovado | Todos os três PNGs decodificados com exatamente 1080 × 1920 px. |
| T11 · Feed | aprovado | Todos os três PNGs decodificados com exatamente 1080 × 1350 px. |
| T12 · Transparência | aprovado | PNG Minimal real em RGBA, recortado a 802 × 1241 px, com extremos do canal alfa 0 e 255. |
| T13 · Título | aprovado no Chromium | Alterar para “Longão de domingo na trilha” atualizou imediatamente o SVG canônico exibido e usado no download. |
| T14 · Métrica oculta | aprovado no Chromium | Ocultar Frequência cardíaca removeu `data-metric="heartRate"` da composição canônica. |
| T15 · Opcionais ausentes | aprovado | Regressão existente confirma ausência de FC média e Elevação quando não fornecidas. |
| T16 · Estado imutável | aprovado | Regressão percorre Transparente, Story e Feed e confirma que dados e aparência não sofrem mutação. |
| T17 · Regressões anteriores | aprovado localmente | 43/43 testes cobrem pace, validação, fotografia, templates, histórico, rascunhos e exportação. Smoke test abriu Início, Estúdio, Análises, Histórico, Perfil e Entrar. |
| T18 · Download desktop e móvel | parcial | Downloads reais aprovados no Chromium desktop e em viewport móvel 390 × 844; o PNG móvel resultou em 1080 × 1920. Navegador/aparelho móvel real segue pendente. |
| T19 · `/estudio` direta | aprovado localmente | Abertura direta respondeu HTTP 200 e carregou “Estúdio de figurinhas”. |
| T20 · Qualidade | aprovado localmente | `npm test`, `npm run lint` e `npm run build` concluídos com sucesso. |

**Método da comparação visual** — a superfície da prévia foi capturada sem guia e borda exclusivas do editor; o PNG baixado foi redimensionado para a mesma área e comparado pixel a pixel. Entre 5,64% e 6,97% dos pixels tiveram diferença luminosa acima de 12/255, principalmente em bordas de texto e formas após reduzir de 1080 px para 239 px. A inspeção dos pares confirmou as mesmas posições, barras, logomarca, escalas, recorte e contraste. O pico isolado por canal não foi usado como aprovação porque antialiasing de bordas pode produzir extremos locais; o erro médio e a inspeção estrutural foram considerados em conjunto.

**Limitações remanescentes** — a comparação automatizada foi executada localmente e não adicionou Playwright/Pillow ao projeto ou ao CI. A rasterização de fontes pode variar entre navegadores que não tenham a mesma fonte disponível. Safari/iOS, Android real, prévia Vercel, toque real, galeria e compartilhamento nativo ainda não foram validados; a correção permanece em validação até esse teste manual.

**Próxima ação** — revisar o PR e a prévia Vercel em celular real: fotografar ou escolher JPEG, ajustar com toque, alternar Story/Feed, baixar, compartilhar e conferir os PNGs na galeria. Só depois dessa evidência marcar a Etapa 3 como concluída.

## Etapa 4A — Importação FIT/TCX e métricas básicas. Status: implementada localmente; em validação.

**Linha de base em 19/11/2026** — a correção WYSIWYG estava incorporada à `main` pelo merge `8184261`. Antes desta etapa, `npm test` aprovou 43/43 testes, lint e build; a página Análises ainda mostrava somente dados fictícios.

**Arquitetura** — `activity-types.ts` define a atividade normalizada e a origem/estado de cada métrica; `activity-normalization.ts` valida unidades, timestamps e cálculos; `activity-fit.ts` e `activity-tcx.ts` isolam os formatos; `activity-import-policy.ts` aplica extensão, vazio e limite de 20 MB; `activity-parse.ts` valida o conteúdo real; `activity-import.worker.ts` executa parsing fora da thread da interface com timeout de 30 segundos; `analyses.tsx` contém somente o fluxo e a apresentação. O bundle inicial não carrega os parsers: eles ficam em Worker/chunk separado.

**Bibliotecas** — `fit-file-parser` 6.2.10 (MIT, TypeScript, atualizado em 17/11/2026) foi escolhido em vez de um parser binário próprio. Ele opera com `force: false` e `strict: true`, exigindo CRC, estrutura e registros completos. `fast-xml-parser` 5.12.1 (MIT) valida TCX; processamento de entidades fica desativado e `DOCTYPE`/`ENTITY` são recusados antes do parse.

**Modelo e metodologia** — metros, segundos e bpm permanecem numéricos. Cada métrica registra valor, disponibilidade/inconsistência e origem. Resumo de sessão FIT ou soma de voltas TCX precede amostras; divergência acima de 1% ou 50 m gera aviso. Tempo de cronômetro, decorrido e movimento nunca são tratados como sinônimos. O pace usa cronômetro quando disponível e decorrido como alternativa identificada. Tempo em movimento não é inferido. FC usa resumo válido ou amostras entre 1 e 250 bpm. Elevação só usa resumo fornecido pelo arquivo; altitudes não são somadas. Timestamps exigem UTC/offset, são ordenados e duplicatas são consolidadas.

| Teste 4A | Estado | Evidência em 19/11/2026 |
| --- | --- | --- |
| T1 · FIT válido | aprovado | Fixture FIT de 182 bytes com estrutura e CRC válidos: 10.000 m, 3.280 s, FC 155/170, elevação resumida 84 m e três pontos GPS. |
| T2 · TCX válido | aprovado | TCX v2 com duas voltas e três trackpoints normalizado para 10.000 m e 3.280 s. |
| T3 · Incompatível | aprovado | XML declarado como FIT foi recusado pela ausência da assinatura `.FIT`. |
| T4 · Corrompido | aprovado | Alteração no CRC do FIT produziu erro compreensível sem derrubar o processo. |
| T5 · Vazio | aprovado | Metadado com zero byte recusado antes do parsing. |
| T6 · Tamanho | aprovado | Limite documentado de 20 MB; tamanho superior recusado antes da leitura. |
| T7 · Sem GPS | aprovado | TCX sem `Position` importado; nenhuma coordenada inventada. |
| T8 · Sem FC | aprovado | FC média/máxima permanecem ausentes e a interface informa indisponibilidade. |
| T9 · 10 km / 54:40 | aprovado | Referência independente: 328 s/km = 5:28/km. |
| T10 · 5 km / 25:00 | aprovado | Referência independente: 300 s/km = 5:00/km. |
| T11 · Distância zero | aprovado | Cálculo retorna ausência, nunca divisão por zero, `Infinity` ou `NaN`. |
| T12 · Ordem temporal | aprovado | Registros fora de ordem são ordenados; duplicatas são consolidadas e duração permanece não negativa. |
| T13 · Pausas ausentes | aprovado | Tempo em movimento permanece indisponível sem resumo explícito. |
| T14 · Ausências/inválidos | aprovado | Distância negativa, tempo infinito e FC zero/fora do limite não viram medições. |
| T15 · Fuso | aprovado | UTC e `-03:00` representando os mesmos intervalos produzem a mesma duração. |
| T16 · Equivalência | aprovado | Fixtures FIT e TCX equivalentes produziram exatamente distância, cronômetro, pace e FC iguais. |
| T17 · Processamento | aprovado no Chromium | MutationObserver confirmou a exibição do estado “Lendo e validando” durante o Worker. |
| T18 · Resultado real | aprovado no Chromium | Upload FIT exibiu 10,00 km, 54:40, 5:28 min/km, 155/170 bpm e origem FIT. |
| T19 · Erro | aprovado no Chromium | FIT incompatível exibiu mensagem sobre assinatura e a seleção continuou utilizável. |
| T20 · Troca | aprovado no Chromium | Trocar FIT por TCX removeu nome/origem anteriores e exibiu somente a nova atividade. |
| T21 · Limpar | aprovado no Chromium | Limpeza removeu resultados e restaurou o seletor inicial. |
| T22 · Responsividade | aprovado em viewport | 360, 390, 768 e 1280 px com `scrollWidth === clientWidth`; captura completa conferida em 390 e 1280 px. Não equivale a aparelho real. |
| T23 · Rotas | aprovado | Início, Estúdio, Análises, Histórico, Perfil, Entrar e 404 responderam HTTP 200 com títulos esperados. |
| T24 · Recarga direta | aprovado localmente | `/analises` abriu diretamente e continuou funcional após `reload`. |
| T25 · Estúdio | aprovado | Regressões automatizadas anteriores passaram e 5 km / 25:00 continuou exibindo 5:00 no Estúdio. |

**Privacidade verificada** — a automação não observou requisições externas durante seleção, Worker e resultados. Nenhuma coordenada é exibida, persistida ou registrada. Atividade e Worker são descartados ao terminar, limpar ou substituir; não há `localStorage`, banco, API, autenticação ou mapa.

**Resultados de qualidade** — 60/60 testes automatizados, lint e build concluídos com sucesso; `npm audit --omit=dev` encontrou zero vulnerabilidades conhecidas. O build preserva apenas os avisos conhecidos das diretivas `use client` do React Router. O bundle inicial ficou em aproximadamente 103,5 kB gzip; parser/Worker ficam separados e carregam somente na importação.

**Limitações conhecidas** — as fixtures cobrem FIT com campos padrão/CRC válido e TCX v2 de corrida; não vieram de uma matriz de relógios ou aplicativos reais, portanto não há alegação de compatibilidade ampla com marcas. Arquivos concatenados, cursos TCX, multiesporte e múltiplas atividades não são combinados; quando há múltiplas sessões/atividades, uma é escolhida com aviso. Não há mapa, gráfico, zonas, parciais calculadas, elevação avançada, integração com Estúdio, persistência ou importação múltipla. Safari/iOS, Android real e prévia Vercel seguem pendentes.

**Próxima subetapa recomendada** — validar a 4A com arquivos reais e aparelhos móveis pela prévia do PR; depois iniciar 4B com metodologia testada para parciais, pausas/tempo em movimento e qualidade de elevação, sem antecipar mapas públicos.

## Auditoria corretiva da Etapa 4A — elevação e tempos. Status: implementada no PR; aguardando validação real.

**Diagnóstico em 19/11/2026** — o caminho positivo de `session.total_ascent` já chegava ao modelo em metros e a fixture anterior exibia 84 m; portanto não foi reproduzida uma falha universal de subida FIT. A auditoria encontrou lacunas semânticas reais: o modelo não representava descida, descartava zero por exigir valor positivo, não possuía fallback seguro de voltas e usava um rótulo genérico de elevação. O parser já normaliza `total_ascent`, `total_descent` e altitudes para metros com `lengthUnit: 'm'`; reconverter esses valores seria um erro. Os arquivos Zepp citados pelo usuário não estavam no workspace, então a causa específica daquele arquivo não pôde ser confirmada e não é declarada como testada.

**Correção e precedência** — `normalizeFit` lê subida e descida do resumo da sessão, incluindo zero. Se um campo estiver ausente, `lapElevation` só soma o mesmo campo nas voltas depois de `lapsSafelyCoverSession` comprovar ausência de sobreposição e cobertura integral por número de voltas e por distância, cronômetro ou limites temporais. Sessão e voltas não são somadas. Em múltiplas sessões, a atividade de maior distância/duração é selecionada e seus registros, eventos e voltas são isolados. O modelo normalizado e a interface agora mantêm `ascentMeters` e `descentMeters` com origem `fit-session` ou `fit-laps`.

**TCX e tempos** — altitude TCX continua nas amostras, mas, sem resumo explícito reconhecido, subida e descida ficam indisponíveis com explicação; não há soma de diferenças positivas sujeita a ruído. Tempo decorrido, tempo de cronômetro e tempo em movimento possuem métricas distintas. O pace mantém a precedência documentada de cronômetro e depois decorrido. `total_moving_time` só é aceito quando explicitamente fornecido; eventos de início/parada são preservados como evidência, mas não copiam o cronômetro para movimento.

| Auditoria T1–T32 | Estado | Evidência em 19/11/2026 |
| --- | --- | --- |
| T1 · Subida 36 m | aprovado | FIT sintético binário com estrutura e CRC válidos percorreu parser, normalização e interface; origem `fit-session`. |
| T2 · Descida 34 m | aprovado | O mesmo FIT produziu 34 m com origem `fit-session`, sem inverter os campos. |
| T3 · Zero válido | aprovado | Resumo FIT com 0 m permaneceu disponível, distinto de ausência. |
| T4 · Elevação ausente | aprovado | FIT sem resumo nem fallback confiável manteve as duas métricas ausentes. |
| T5 · Sessão e voltas | aprovado | 36/34 da sessão prevaleceram; voltas não foram duplicadas. |
| T6 · Múltiplas sessões | aprovado | Sessão de corrida de 21,10 km selecionada sem misturar elevação da caminhada. |
| T7 · Unidades e escalas | aprovado | Parser configurado em metros retornou altitude 510 m e resumos 36/34 sem reconversão. |
| T8 · Registros incompletos | aprovado | Registros inválidos foram ignorados sem perder resumo nem lançar erro. |
| T9 · TCX com altitude | aprovado | Altitudes foram preservadas; subida/descida não foram calculadas por soma ingênua. |
| T10 · TCX sem altitude | aprovado | Importação concluída e nenhuma elevação foi fabricada. |
| T11 · TCX sem opcionais | aprovado | FC e movimento permaneceram ausentes. |
| T12 · Extensão reconhecida | aprovado | Velocidade `3.5 m/s` em extensão foi lida na unidade correta e não confundida com elevação. |
| T13 · Decorrido = cronômetro | aprovado | Ambos preservados em 6.634 s (1:50:34). |
| T14 · Decorrido > cronômetro | aprovado | 3.900 s e 3.600 s permaneceram distintos; pace usou cronômetro identificado. |
| T15 · Pausa e retomada | aprovado | Eventos preservados, sem inferir movimento. |
| T16 · Sem eventos de pausa | aprovado | A atividade foi preservada sem deduzir movimento pela ausência de eventos. |
| T17 · Sem movimento explícito | aprovado | Movimento permaneceu indisponível e não copiou o cronômetro. |
| T18 · Movimento explícito | aprovado | `total_moving_time = 3.500` foi aceito com origem FIT. |
| T19 · Timestamps problemáticos | aprovado | Inválidos foram ignorados, duplicados consolidados e fora de ordem ordenados. |
| T20 · Duração não negativa | aprovado | Os mesmos casos nunca produziram duração negativa. |
| T21 · Pace 10 km | aprovado | 54:40 resultou em 328 s/km = 5:28/km. |
| T22 · Pace 21,10 km | aprovado | 1:50:34 resultou em 314,41 s/km, exibido como 5:14/km. |
| T23 · Distância inválida | aprovado | Nenhum `NaN` ou `Infinity`; pace ausente. |
| T24 · FC ausente | aprovado | Nenhum valor fictício criado. |
| T25 · Subida/descida | aprovado | 36 m e 34 m permaneceram nos campos corretos. |
| T26 · Interface e unidades | aprovado no Chromium | Upload do FIT sintético exibiu “Subida acumulada 36 m” e “Descida acumulada 34 m”. |
| T27 · Ausências explicadas | aprovado no Chromium | TCX com altitude mostrou “Não disponível” nos dois cards e explicou a falta de resumo confiável; movimento também foi explicado. |
| T28 · Responsividade | aprovado em viewport | 360, 390, 768 e 1280 px tiveram `scrollWidth === clientWidth`; capturas desktop e móvel foram inspecionadas. Não equivale a aparelho real. |
| T29 · Substituição | aprovado no Chromium | Importar TCX após FIT removeu nome, formato e métricas anteriores. |
| T30 · `/analises` direta | aprovado no Chromium | Abertura direta e `reload` mantiveram a rota funcional. |
| T31 · Regressão do Estúdio | aprovado no Chromium | 5 km / 25:00 continuou exibindo 5:00. |
| T32 · Regressões FIT/TCX | aprovado | 83/83 testes automatizados passaram, incluindo a matriz anterior de importação. |

**Compatibilidade efetivamente exercitada** — FIT sintético de 182 bytes e FIT sintético/anônimo de 157 bytes, ambos com CRC válido; objetos FIT controlados para voltas, sessões, eventos, zero e movimento; TCX v2 sintético com e sem GPS, FC, altitude e extensão de velocidade. O Chromium processou os arquivos pelo Worker e não realizou requisições externas. Nenhuma fixture contém localização pessoal. `Zepp20261115043908.fit`, `Zepp20261115043908.tcx`, Safari/iOS, Android real e a prévia Vercel não foram executados neste ambiente.

**Qualidade** — `npm test` aprovou 83/83 testes; `npm run lint` e `npm run build` concluíram com sucesso. O teste funcional do Chromium aprovou importação de 21,10 km, 1:50:34, pace 5:14, FC 168/183, subida 36 m, descida 34 m, movimento indisponível com explicação, TCX sem elevação inventada, substituição, rotas e responsividade.

**Próxima ação** — abrir a nova prévia do PR da 4A no celular, importar os arquivos Zepp sem os publicar, comparar distância, tempos, pace, FC e 36/34 m, conferir que movimento permanece indisponível se o FIT não trouxer uma métrica independente e repetir com TCX. Só após essa evidência deve-se aprovar a correção; a Etapa 4B não foi iniciada.

## Etapa 4C antecipada — integração Análises → Estúdio. Status: implementada localmente; aguardando prévia e aparelho real.

**Base confirmada em 19/11/2026** — `origin/main` apontava para o merge `1d23877` do PR #7 e continha os commits `a1b516d` e `31f4b42` da Etapa 4A. Antes desta implementação, 83/83 testes, lint e build passaram. O branch `codex/etapa-4c-integracao-estudio` foi criado diretamente dessa `main` atualizada.

**Arquitetura** — `activity-to-studio.ts` é o adaptador puro entre `NormalizedActivity` e `EditorState`; ele não relê o arquivo nem recebe amostras, voltas ou GPS. `studio-session.tsx` mantém o estado mínimo da figurinha em memória acima das rotas, permitindo navegação normal sem URL ou armazenamento permanente. Distância, duração, base temporal, pace numérico original, FC, subida, data e formato são transferidos. FC máxima e descida permanecem na referência tipada e aparecem como informação de origem, pois os templates atuais não possuem campos próprios para elas.

**Edição e rascunhos** — métricas importadas começam bloqueadas, com identificação FIT/TCX e base “cronômetro” ou “decorrido”. O usuário pode editar título e toda a aparência sem alterar medições. Liberar métricas exige confirmação explícita, marca a sessão como edição manual e mantém uma cópia restaurável dos dados originais. Um estado do Estúdio ou rascunho existente dispara confirmação antes da substituição; cancelar mantém a edição. O rascunho não é apagado e só recebe os dados quando o salvamento opt-in está ativo. Rascunhos v1 são migrados como manuais. Após recarga sem rascunho, campos ficam vazios e uma orientação pede nova importação, sem dados fictícios.

**Privacidade** — a transferência não inclui nome do arquivo, pontos, coordenadas ou o binário FIT/TCX. O marcador de recarga em `sessionStorage` contém apenas `1`; o estado fica na memória. A automação encontrou somente URLs `blob:` locais criadas para foto/PNG e nenhuma requisição de rede externa.

| Prompt 09 | Estado | Evidência em 19/11/2026 |
| --- | --- | --- |
| T1 · FIT → Estúdio | aprovado no Chromium | FIT sintético com CRC válido abriu o Estúdio pelo novo CTA. |
| T2 · TCX → Estúdio | aprovado no Chromium | TCX v2 abriu o mesmo editor e exibiu origem TCX. |
| T3 · Distância | aprovado | 21.100 m virou `21,1` internamente e 21,10 km na composição. |
| T4 · Tempo e denominação | aprovado | 6.634 s permaneceu 1:50:34, identificado como tempo de cronômetro. |
| T5 · Pace | aprovado | Referência exata preservada; apresentação arredondada para 5:14/km na prévia e nos PNGs. |
| T6 · FC | aprovado | FC média 168 bpm transferida; FC máxima 183 bpm preservada como referência. |
| T7 · Subida/descida | aprovado | Subida 36 m entrou no campo visual; descida 34 m permaneceu na referência sem ser confundida com subida. |
| T8 · TCX sem elevação | aprovado | Campo ficou vazio e invisível; nenhuma altitude virou ganho fictício. |
| T9 · Sem FC | aprovado | O segundo arquivo limpou FC e elevação da corrida anterior. |
| T10 · Templates | aprovado no Chromium | Minimal, Performance e Clean mantiveram os dados importados. |
| T11 · Cores | aprovado no Chromium | Alterar destaque para rosa não mudou métricas. |
| T12 · Foto/enquadramento | aprovado no Chromium | JPEG e zoom 1,40× mantiveram distância, tempo e pace. |
| T13 · Story | aprovado | PNG real RGBA de 1080 × 1920 px com métricas importadas. |
| T14 · Feed | aprovado | PNG real RGBA de 1080 × 1350 px com métricas importadas. |
| T15 · Transparente | aprovado | PNG RGBA com alfa, recortado a 1080 × 1236 px, com métricas corretas. |
| T16 · Prévia × exportação | aprovado por inspeção | Capturas e três PNGs mantiveram título, data, 21,10 km, 1:50:34, 5:14, 168 bpm e 36 m na mesma composição canônica. |
| T17 · Outra atividade | aprovado no Chromium | Confirmação foi exigida; aceitar substituiu 21,1 km por 5 km e limpou opcionais. |
| T18 · Edição existente | aprovado | Cancelar a confirmação manteve a página e a edição; liberação manual/restauração também possui teste automatizado. |
| T19 · Sem conta | aprovado no Chromium | Fluxo completo funcionou sem autenticação. |
| T20 · Desfazer/refazer | aprovado no Chromium | Título voltou de “Longão importado” para “Corrida importada” e foi refeito. |
| T21 · Rascunho | aprovado | Rascunho v2 recuperou proveniência/referência; v1 migrou como manual; JSON não continha GPS, amostras ou nome do arquivo. |
| T22 · Recarga `/estudio` | aprovado no Chromium | Sem rascunho, mostrou orientação e campos vazios, nunca os dados demonstrativos. |
| T23 · Navegação móvel | aprovado em viewport | Fluxo passou em 360 e 390 px sem overflow; não equivale a aparelho real. |
| T24 · Editor manual | aprovado no Chromium | Em contexto novo, 5 km / 25:00 continuou em 5:00/km sem importação. |
| T25 · Exportações anteriores | aprovado | Toda a suíte anterior permaneceu verde; dimensões, alfa, templates, foto e composição canônica continuam cobertos. |

**Qualidade** — após a integração, `npm test` aprovou 94/94 testes, `npm run lint` e `npm run build` concluíram com sucesso. O Chromium validou 360, 390, 768 e 1280 px com `scrollWidth === clientWidth`. As imagens e scripts funcionais ficaram somente em `/tmp` e não entram no repositório.

**Limitações e próxima ação** — fotografia continua restrita à aba e não sobrevive à navegação/recarga, conforme a política existente. FC máxima e descida são preservadas, mas ainda não são métricas selecionáveis nos templates. Prévia Vercel, Safari/iOS, Android real, Web Share nativo e arquivos Zepp reais continuam pendentes. A próxima ação é validar o PR em celular; a Etapa 4B de análise avançada continua pendente e não foi iniciada.

### Planejamento posterior registrado na Etapa 4C

A sequência **4A → 4C → 4D → 4B** foi registrada na entrega anterior. A seção abaixo atualiza esse planejamento com a implementação da 4D; a análise avançada 4B permanece posterior e não foi iniciada.

## Etapa 4D — trajetos GPS reais. Status: implementada na branch; aguardando PR, Vercel e aparelho real.

**Base e diagnóstico em 19/11/2026** — a branch `codex/etapa-4d-trajetos-gps` foi criada da `main` no merge `b3734b9`, que já continha a Etapa 4C. A linha de base aprovou 94/94 testes, lint e build. `fit-file-parser` já multiplica campos FIT em semicircles por sua constante de conversão antes de entregá-los; por isso a nova guarda converte somente valores que ainda excedem ±90/±180. O TCX já extraía `Position`, mas achatava voltas e reconhecia somente um `Track` por volta, o que apagava limites de segmento. O renderizador usava uma linha decorativa fixa nos templates Clean e Performance, enquanto o Minimal não reservava percurso.

**Implementação** — amostras normalizadas agora podem carregar `segmentId`; cada `Lap/Track` TCX mantém seu limite e FIT recebe validação defensiva sem reconversão dupla. `route-geometry.ts` separa pontos originais da geometria de desenho, valida limites e zero, remove duplicatas, separa saltos implausíveis, preserva segmentos, recorta privacidade por distância, desembrulha o antimeridiano, projeta longitude com correção pela latitude média, centraliza com margem e aplica Ramer–Douglas–Peucker a uma cópia limitada a 1.000 pontos por segmento. Uma única escala é usada nos eixos, inclusive na área final do template.

**Estúdio e privacidade** — a rota fica no `StudioSessionContext` somente em memória; o `EditorState` versionado guarda apenas cor, espessura, escala, deslocamento, visibilidade, marcadores e opção de recorte. Rascunhos v1/v2 migram com padrões seguros, sem coordenadas. A importação sempre chama `setRoute`, inclusive com `null`, impedindo herança. O recorte de 100/200/500 m altera só o SVG; métricas e referência original permanecem iguais. Percursos curtos recebem aviso. A primeira exportação identificável por sessão pede confirmação e explica que o recorte não garante anonimato.

**Prévia e exportação** — `StickerData.route` distingue três estados: rota real, atividade importada sem GPS e criação manual ilustrativa. `createExportSvg` é a fonte canônica usada tanto por `Sticker` quanto pelo Canvas/PNG; portanto cor, largura, escala, posição, marcadores e recorte percorrem a mesma renderização. O Chromium gerou PNG transparente, Story e Feed com a rota sintética e confirmou que uma segunda atividade sem GPS remove a geometria real e não reativa a ilustração.

| Caso 4D | Estado | Evidência executada em 19/11/2026 |
| --- | --- | --- |
| T01 | aprovado | FIT normalizado produziu dois pontos GPS válidos. |
| T02 | aprovado | Objeto FIT sintético em semicircles foi convertido para 45° uma única vez. |
| T03 | aprovado | -23,55/-46,63 já em graus permaneceu idêntico. |
| T04 | aprovado | FIT sem posições retornou rota ausente. |
| T05 | aprovado | Registro intermediário sem posição foi ignorado. |
| T06 | aprovado | Identificadores de segmento produziram dois caminhos independentes. |
| T07 | aprovado | Trackpoints TCX viraram pontos válidos. |
| T08 | aprovado | Namespace TCX v2 foi removido e lido pelo parser. |
| T09 | aprovado | TCX sem `Position` continuou importável, sem rota. |
| T10 | aprovado | Duas voltas TCX mantiveram dois segmentos. |
| T11 | aprovado | Dois `Track` não foram ligados artificialmente. |
| T12 | aprovado | ±90/±180 e números finitos foram validados. |
| T13 | aprovado | Latitude/longitude zero foram preservadas. |
| T14 | aprovado | Duplicata consecutiva foi removida com aviso. |
| T15 | aprovado | Salto incompatível com tempo/distância dividiu o segmento. |
| T16 | aprovado | Projeção e escala única preservaram a relação dos eixos. |
| T17 | aprovado | Extremos normalizados ficaram centrados em 125/90. |
| T18 | aprovado | Coordenadas do desenho ficaram dentro das margens 12/238 e 12/168. |
| T19 | aprovado | Linhas somente horizontais e somente verticais geraram SVG válido. |
| T20 | aprovado | Um único ponto não gerou rota. |
| T21 | aprovado | 10.000 pontos foram processados em cerca de 38 ms e desenho ficou ≤1.001 pontos. |
| T22 | aprovado | 179,9° → -179,9° usou o caminho curto junto ao antimeridiano. |
| T23 | aprovado no Chromium | TCX sintético passou de Análises ao Estúdio sem segundo upload. |
| T24 | aprovado | SVG real apareceu e a assinatura do percurso decorativo ficou ausente. |
| T25 | aprovado | Cor personalizada foi preservada no SVG. |
| T26 | aprovado | Espessura personalizada foi preservada no SVG. |
| T27 | aprovado | Escala personalizada foi preservada no transform. |
| T28 | aprovado | Deslocamentos X/Y foram preservados no transform. |
| T29 | aprovado | Visibilidade removeu/recolocou o grupo sem perder geometria. |
| T30 | aprovado | Minimal, Performance e Clean renderizaram a mesma rota real. |
| T31 | aprovado no Chromium | Segunda atividade sem GPS removeu rota anterior, sem linha fictícia. |
| T32 | aprovado | Alterações visuais mantiveram todos os campos esportivos. |
| T33 | aprovado | Recorte interpolou novos extremos no início e no fim. |
| T34 | aprovado | Distância da referência permaneceu 21.100 m após recorte de 500 m. |
| T35 | aprovado | Serialização guarda estilo, nunca segmentos/coordenadas. |
| T36 | aprovado | Fluxo navegou apenas para `/estudio`; nenhuma coordenada apareceu na URL. |
| T37 | aprovado | SVG recebeu exatamente os caminhos produzidos depois do recorte. |
| T38 | aprovado no Chromium | PNG transparente real foi gerado pelo Canvas com rota. |
| T39 | aprovado no Chromium | Story real foi gerado em 1080 × 1920. |
| T40 | aprovado no Chromium | Feed real foi gerado em 1080 × 1350. |
| T41 | parcial | Prévia e PNG usam e testam o mesmo SVG determinístico; comparação visual em aparelho/prévia Vercel ainda não executada. |
| T42 | aprovado | Transform final usa escala uniforme e margens; não há `scale(x y)` desigual. |
| T43 | aprovado | Fundo, título e métricas permaneceram no SVG com rota. |
| T44 | aprovado | Suíte de pace/editor manual permaneceu verde e o desenho manual é identificado como ilustrativo. |
| T45 | aprovado | Regressões FIT mantiveram 36 m de subida e 34 m de descida. |
| T46 | aprovado | TCX com altitude continuou sem ganho acumulado inventado. |
| T47 | aprovado | Adaptador 4C, proteção de métricas e referências permaneceram verdes. |
| T48 | aprovado | Rascunho v3 e migrações v1/v2 não contêm latitude/longitude/amostras. |
| T49 | aprovado | Desfazer/refazer restaurou cor e espessura do trajeto. |
| T50 | aprovado | 132/132 testes, lint e build concluíram com sucesso. |

**Validação funcional local** — um TCX sintético e anônimo de 5 km/25:00 foi importado em Chromium. Análises reconheceu GPS; o Estúdio mostrou rota real, métricas e sete controles de trajeto; a assinatura decorativa não apareceu. PNG transparente, Story e Feed concluíram a codificação. Viewports 360, 390, 768 e 1280 px tiveram `scrollWidth === clientWidth`. O monitor de recursos não encontrou origem externa. Uma segunda versão do mesmo TCX sem posições exibiu “Percurso GPS não disponível nesta atividade.”, sem rota real ou fictícia. Isso não equivale a Safari/iOS, Android físico ou inspeção visual dos arquivos na galeria.

**Qualidade e limitações** — `npm test` aprovou 132/132, `npm run lint` e `npm run build` passaram; o build manteve apenas os avisos conhecidos de `use client` do React Router. Não foram usados arquivos pessoais. Permanecem pendentes T41 em inspeção visual hospedada, arquivos reais de relógios diferentes, aparelhos físicos e a prévia Vercel. A Etapa 4B continua posterior e não foi iniciada.

**Próxima ação** — abrir o PR, aguardar a Vercel e testar no celular um FIT/TCX próprio sem publicá-lo: conferir formato do percurso, recorte 100/200/500 m, controles por toque, três PNGs e troca por atividade sem GPS. Só então registrar o aceite visual da T41.
