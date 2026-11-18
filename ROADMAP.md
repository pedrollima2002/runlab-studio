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
- [ ] Implementar desfazer/refazer para as mudanças essenciais e concluir a experiência de edição da subetapa 2.5.

**Entregue em 2.1 e 2.2** — atualização imediata da prévia para distância, tempo e ritmo; suporte a `MM:SS`, `H:MM:SS`, vírgula e ponto decimal; mensagens de erro acessíveis; layout responsivo; e ressalva sobre pausas no cálculo manual. A sincronização completa de modelos, personalização e histórico de desfazer/refazer permanece para as próximas subetapas.

**Entregue em 2.3 e 2.4** — três composições funcionais, cores predefinidas e restauráveis, título/data/métricas opcionais, controle de visibilidade, organizações centralizada, à esquerda e com métrica principal em destaque, além de simulação de figurinha transparente e arte completa. Exportação, fotografia, posicionamento livre e desfazer/refazer permanecem fora desta entrega.

**Testes** — 10 km / 54:40 = 5:28/km, 5 km / 25:00 = 5:00/km, 2,5 km / 12:30 = 5:00/km e 10 km / 1:00:00 = 6:00/km. Cobrir distância zero ou negativa, texto e tempo inválidos, troca de modelo e uso em celular.  
**Aceite** — visitante monta a figurinha manualmente. Exibir “O ritmo médio é calculado com base no tempo informado. Caso sua atividade tenha pausas, o resultado poderá ser diferente do registrado no seu relógio ou aplicativo.”  
**Escopo posterior** — fotografia, exportação, importação, contas e IA.

## 3. Exportação e Stories

- [ ] Adicionar foto, composição e guia de área segura.
- [ ] Exportar PNG transparente, Story 1080 × 1920 e feed 1080 × 1350.
- [ ] Verificar nitidez e habilitar compartilhamento quando compatível, com download como alternativa.

**Testes** — canal alfa, dimensões, camadas, acentos, fontes, margens, cortes e alternativa de download em Android e desktop.  
**Aceite** — arquivos utilizáveis fora do RUNLAB.  
**Fora de escopo** — postagem automática no Instagram, análise de arquivos e login.

## 4. Importação e análise de corridas

- [ ] Importar FIT e TCX e normalizar unidades e timestamps.
- [ ] Calcular tempo decorrido e tempo em movimento quando verificáveis, ritmo, parciais, elevação, FC e zonas.
- [ ] Implementar gráficos, testes independentes e integração com o Estúdio.
- [ ] Documentar metodologia, privacidade e tratamento de GPS opcional.

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
