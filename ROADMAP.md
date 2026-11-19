# Roteiro do RUNLAB

## 1. Interface visual e fundação

- [x] Stack, identidade visual, layout e rotas navegáveis.
- [x] Estúdio com prévia 9:16, três amostras de modelo e controles demonstrativos.
- [x] Documentação, lockfile, CI e configuração SPA para hospedagem.
- [ ] Validar o checklist completo T1–T11 em [PROGRESSO.md](PROGRESSO.md). CI remoto, prévia da Vercel e revisão em celular real seguem pendentes.

**Aceite** — interface responsiva e navegável, com os estados futuros sinalizados e sem backend.  
**Escopo posterior** — edição, exportação, importação, armazenamento de atividades, contas e IA.

## 2. Editor de figurinhas funcional

- [x] Definir o modelo de dados das métricas e implementar entrada manual de distância e tempo com validação.
- [x] Calcular ritmo médio como tempo em segundos dividido pela distância em km, sem exigir preenchimento manual do ritmo.
- [x] Implementar Minimal, Performance e Clean, cores, textos e seleção de métricas visíveis.
- [x] Sincronizar imediatamente dados, template, cores, organização, métricas e modo de prévia.
- [x] Implementar desfazer/refazer, rascunho local opcional e restauração segura da subetapa 2.5.
- [ ] Validar a experiência completa da Etapa 2 em celular real pela prévia da Vercel.

**Entregue em 2.1 e 2.2** — atualização imediata da prévia para distância, tempo e ritmo; suporte a `MM:SS`, `H:MM:SS`, vírgula e ponto decimal; mensagens de erro acessíveis; layout responsivo; e ressalva sobre pausas no cálculo manual. A sincronização completa de modelos, personalização e histórico de desfazer/refazer permanece para as próximas subetapas.

**Entregue em 2.3 e 2.4** — três composições funcionais, cores predefinidas e restauráveis, título/data/métricas opcionais, controle de visibilidade, organizações centralizada, à esquerda e com métrica principal em destaque, além de simulação de figurinha transparente e arte completa. Exportação, fotografia, posicionamento livre e desfazer/refazer permanecem fora desta entrega.

**Entregue em 2.5** — histórico limitado a 50 estados, agrupamento de digitação por sessão de foco, botões e atalhos de desfazer/refazer, rascunho local versionado e opt-in, recuperação validada, tratamento de dados corrompidos, restauração apenas da aparência e nova figurinha com confirmação. O rascunho não contém pace calculado e fica restrito ao navegador/dispositivo atual. A aceitação final da Etapa 2 depende da revisão em celular real.

**Testes** — 10 km / 54:40 = 5:28/km, 5 km / 25:00 = 5:00/km, 2,5 km / 12:30 = 5:00/km e 10 km / 1:00:00 = 6:00/km. Cobrir distância zero ou negativa, texto e tempo inválidos, troca de modelo e uso em celular.  
**Aceite** — visitante monta a figurinha manualmente. Exibir “O ritmo médio é calculado com base no tempo informado. Caso sua atividade tenha pausas, o resultado poderá ser diferente do registrado no seu relógio ou aplicativo.”  
**Escopo posterior** — fotografia, exportação, importação, contas e IA.

## 3. Exportação e Stories

- [x] Adicionar foto local, enquadramento, composição, contraste e guia de área segura na subetapa 3B.
- [x] Exportar PNG transparente, Story 1080 × 1920 e feed 1080 × 1350 na subetapa 3A.
- [x] Verificar nitidez local e habilitar Web Share quando compatível, com download como alternativa, na subetapa 3B.
- [ ] Validar upload, exportação e compartilhamento em celular real e Safari/iOS pela prévia hospedada.

**Entregue em 3A** — geração local por SVG e Canvas, PNG transparente com alfa real e recorte ao conteúdo, Story 9:16 e Feed 4:5 com composição adaptada, seletor de formato, prévia coerente, download, estados de processamento/sucesso/erro e bloqueio de exportações simultâneas. Os três templates usam os mesmos dados e parâmetros visuais do editor. A cobertura automatizada e no Chromium validou dimensões, decodificação, alfa, templates, textos, personalização, rotas e regressões.

**Entregue em 3B** — JPEG/PNG/WebP locais com validação e orientação EXIF, redução interna de imagens grandes, enquadramento normalizado compartilhado pela prévia e Canvas, zoom, arraste, centralização, contraste, guia de área segura, Story/Feed com foto, PNG transparente sem foto, Web Share com arquivo e fallback de download. Fotografias e URLs temporárias ficam fora dos rascunhos e são liberadas ao substituir, remover ou sair.

**Correção WYSIWYG da 3B** — prévia e exportação passaram a usar exatamente o mesmo SVG de composição para cada template e formato. A correção removeu os layouts independentes que divergiam em barras, posições, tipografia e símbolo RUNLAB; fotografia, recorte e contraste permanecem compartilhados por coordenadas normalizadas. A validação local comparou PNGs reais de Minimal, Performance e Clean em Story e Feed. O aceite em aparelho real pela prévia hospedada continua pendente.

**Validação pendente** — apesar da cobertura automatizada e funcional em Chromium, a Etapa 3 não está encerrada até executar o fluxo em celular real, Safari/iOS e prévia Vercel. Web Share foi exercitado com API simulada; o menu nativo e aplicativos de destino não foram testados. Pinça não foi implementada; zoom permanece disponível pelo slider.

**Testes** — canal alfa, dimensões, camadas, acentos, fontes, margens, cortes e alternativa de download em Android e desktop.  
**Aceite** — arquivos utilizáveis fora do RUNLAB.  
**Fora de escopo** — postagem automática no Instagram, análise de arquivos e login.

## 4. Importação e análise de corridas

- [x] Importar FIT e TCX localmente e normalizar unidades e timestamps na Etapa 4A.
- [x] Integrar atividades normalizadas ao Estúdio na Etapa 4C antecipada.
- [ ] Implementar trajetos GPS reais e privados no Estúdio na Etapa 4D.
- [ ] Calcular tempo decorrido e tempo em movimento quando verificáveis, ritmo, parciais, elevação, FC e zonas na Etapa 4B.
- [ ] Implementar gráficos e testes independentes da análise avançada 4B.
- [ ] Documentar metodologia, privacidade e tratamento de GPS opcional.

**Entregue em 4A** — seleção e validação de um arquivo FIT/TCX de até 20 MB, parsing local em Worker, modelo normalizado com proveniência, resumo de distância, tempos identificados, pace, FC e elevação somente quando confiável, avisos de ausência/inconsistência e fluxo para substituir ou limpar a atividade. FIT exige estrutura e CRC válidos; TCX recusa DTD e entidades. O processamento não usa API, conta, banco ou persistência.

**Auditoria corretiva da 4A** — o modelo agora separa subida e descida, aceita zero válido e rastreia resumo de sessão FIT ou fallback seguro de voltas. Resumos de sessão têm precedência e nunca são somados às voltas; arquivos multissessão têm registros e voltas isolados. Altitude TCX permanece disponível como amostra, mas sem estimativa acumulada até existir metodologia validada. Tempo decorrido, cronômetro e movimento continuam independentes, e eventos de pausa não inventam tempo em movimento. A matriz T1–T32 passou com fixtures sintéticas e Chromium; os dois arquivos Zepp reais e aparelho móvel real não estavam disponíveis, portanto o aceite da prévia continua pendente.

**Etapa 4C antecipada — integração com o Estúdio** — implementada em branch própria antes da análise avançada 4B. A atividade normalizada alimenta o editor existente por um adaptador tipado, sem novo parsing, GPS, URL ou persistência automática. Dados importados ficam identificados e protegidos, opcionais ausentes são limpos, edições manuais exigem ação explícita e rascunhos existentes pedem confirmação. Templates, fotografia, histórico e os três formatos de PNG continuam no mesmo fluxo. A validação automatizada e no Chromium foi concluída; prévia Vercel e aparelho real permanecem como aceite manual.

**Etapa 4D planejada — trajeto GPS real no Estúdio** — próxima etapa após a 4C. Deverá transformar coordenadas FIT/TCX em um percurso visual real no lugar da ilustração atual, com controles de cor, espessura, tamanho e posição, além de proteção de locais sensíveis e escolhas explícitas de privacidade. Este item é somente planejamento: nenhuma coordenada é transferida ao Estúdio nesta entrega. A ordem prevista é 4A → 4C → 4D → 4B.

**Ainda pendente na Etapa 4** — validação ampla com arquivos reais de diferentes dispositivos, a Etapa 4D de trajetos privados e a Etapa 4B de metodologia avançada de elevação/tempo em movimento, parciais, gráficos e zonas cardíacas. Nem 4D nem 4B foram iniciadas e a Etapa 4 não está concluída.

**Testes** — equivalência FIT/TCX, pausas presentes e ausentes, FC ausente, lacunas, duplicidade, soma de parciais e uso sem GPS.  
**Aceite** — cálculos confiáveis e reproduzíveis, com lacunas explicitadas.  
**Escopo posterior** — armazenamento em conta e interpretação por IA.

## 5. Contas, histórico, evolução e IA

- [ ] Adicionar Supabase Auth opcional e salvar atividades com autorização.
- [ ] Implementar histórico, comparação contextualizada, RLS, logout e exclusão.
- [ ] Adicionar API de IA opcional em backend seguro com limites e alternativa em caso de indisponibilidade.
- [ ] Validar segurança e implantação.

**Testes** — visitante sem conta, cadastro após editar, bloqueio entre usuários, logout, exclusão, dados incompletos, limites e indisponibilidade da IA e proteção de segredos.  
**Aceite** — conta opcional segura, histórico confiável e uso independente da IA.  
**Fora de escopo** — cobrança e integração com Strava.
