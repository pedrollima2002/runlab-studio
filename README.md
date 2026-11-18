# RUNLAB Studio

Estúdio de figurinhas para corrida e painel demonstrativo de análise. O acesso de visitante é livre e o Estúdio exporta imagens localmente, sem conta ou envio dos dados a servidores.

React, TypeScript, Vite, Tailwind CSS, React Router e Lucide. A ilustração do percurso é um SVG local. O projeto roda sem backend, credenciais ou serviços de imagem e fontes.

## Executar

Use Node.js 24 LTS ou Node.js 22.12+ da série 22 e npm. Na pasta do projeto:

```sh
npm ci
npm test
npm run dev
```

`npm test` cobre distância, tempo, pace, personalização, histórico, rascunhos, exportação, validação de fotos e enquadramento. `npm run lint` verifica o código, `npm run build` checa tipos e gera `dist/`, e `npm run preview` serve esse build para conferência local. Os testes automatizados, lint e build não substituem os testes visuais, funcionais, de acessibilidade ou em aparelhos reais.

| Rota | Tela |
| --- | --- |
| `/` | Início com amostras e links para os dois módulos |
| `/estudio` | Editor manual, cálculo de ritmo, três templates e personalização da prévia 9:16 |
| `/analises` | Métricas e gráfico ilustrativos |
| `/historico` | Estado vazio |
| `/perfil` | Preferências e zonas cardíacas |
| `/entrar` | Tela demonstrativa de conta |
| Outras | Página 404 com volta ao Início |

No Estúdio, os mesmos dados alimentam Minimal, Performance e Clean. É possível ajustar título, data, métricas opcionais, cores compatíveis, visibilidade e organização. A troca de aparência ou formato não altera distância, tempo nem o pace calculado.

### Fotografias e enquadramento

O usuário pode selecionar localmente fotografias JPEG/JPG, PNG ou WebP de até **15 MB e 80 megapixels**. SVG e HEIC/HEIF não são aceitos. O navegador aplica a orientação da imagem, inclusive metadados EXIF, e reduz internamente o maior lado para 4096 px quando necessário para tornar a edição mais segura em memória. A proporção original nunca é esticada.

A foto pode ser substituída, removida, centralizada e restaurada. O enquadramento usa foco normalizado e zoom de 1× a 3×: arraste na prévia com mouse ou um dedo, ou use o slider acessível. Story e Feed recalculam automaticamente o recorte para suas proporções. Escurecimento e gradiente controlam a legibilidade; a guia tracejada existe apenas no editor e não entra no PNG. Pinça para zoom não foi implementada, pois o slider oferece um comportamento consistente entre navegadores.

A fotografia fica somente na aba atual. Ela não é enviada, não entra no `localStorage`, não vira Base64 e precisa ser selecionada novamente após fechar ou recarregar. Dados, métricas e personalização continuam recuperáveis pelo rascunho existente sem URL quebrada.

### Exportação de imagens

O Estúdio gera três modalidades reais de PNG:

| Formato | Saída |
| --- | --- |
| PNG transparente | Canal alfa real e área recortada aos elementos visíveis, com margem |
| Story | 1080 × 1920 px, proporção 9:16 e fundo do template |
| Feed | 1080 × 1350 px, proporção 4:5 e composição reorganizada |

A composição é criada no próprio navegador: o RUNLAB monta um SVG vetorial com os dados e parâmetros visuais compartilhados pela prévia, aguarda as fontes disponíveis, rasteriza em Canvas na resolução final e codifica o PNG. Não há serviço externo de imagem, upload ou armazenamento do arquivo. URLs temporárias são revogadas após o uso.

Story e Feed incorporam a fotografia enquadrada, o contraste e as métricas. O PNG transparente mantém somente elementos e textos da figurinha, mesmo quando existe uma foto selecionada. O botão **Compartilhar** usa Web Share API com arquivo PNG somente após toque/clique explícito; quando o navegador não oferece esse recurso, o download permanece disponível. Isso não publica automaticamente no Instagram.

Chrome/Chromium desktop foi exercitado com upload, enquadramento, download e decodificação dos arquivos; toque e Web Share foram verificados por emulação. As larguras de 360, 390, 768 e 1280 px foram testadas no Chromium, mas isso não equivale a um aparelho real. Safari/iOS, compartilhamento nativo real, outros navegadores móveis e a prévia da Vercel ainda precisam de validação manual. Em PNG transparente, o contraste final depende do fundo onde a figurinha será aplicada.

### Histórico, rascunho e restauração

Os botões **Desfazer** e **Refazer** cobrem dados e aparência. Fora dos campos, use `Ctrl + Z`/`Cmd + Z` e `Ctrl + Shift + Z`/`Cmd + Shift + Z`; dentro dos inputs, o comportamento nativo de edição é preservado.

O salvamento de rascunho é opcional e começa desativado. Quando ativado, guarda apenas dados e personalização no `localStorage` daquele navegador, sem conta, servidor, fotografia ou sincronização. Ao voltar, o usuário escolhe recuperar ou começar novamente; o pace é sempre recalculado. **Restaurar padrão** preserva os dados da corrida, enquanto **Nova figurinha** pede confirmação e reinicia dados, aparência e fotografia da aba. Rascunhos são excluídos somente por uma ação separada e confirmada.

## Configuração inicial pelo usuário

- [ ] Criar ou escolher um repositório GitHub para o RUNLAB e importar os arquivos da raiz do ZIP. Preservar `.github/workflows/ci.yml` e `.gitignore`, que são arquivos ocultos em alguns gerenciadores.
- [ ] Conectar o GitHub ao Codex pelo navegador do celular e selecionar o repositório. A primeira autorização pode pedir confirmação no navegador.
- [ ] Importar esse repositório na Vercel com o preset Vite, Node 24 e saída `dist`. A autorização inicial do GitHub e a primeira implantação são etapas manuais. O `vercel.json` direciona links diretos e atualizações de rota ao React Router.
- [ ] Conferir o primeiro resultado em **Actions** no GitHub e abrir a URL real do deploy em **Deployments** na Vercel.

Se for importar via terminal em um repositório remoto vazio, extraia o ZIP e, na pasta extraída:

```sh
git init -b main
git add .
git commit -m "Implementa a etapa 1 do RUNLAB"
git remote add origin <URL-do-repositório-vazio>
git push -u origin main
```

Se o remoto já tiver arquivos, clone-o primeiro e importe os arquivos preservando o trabalho existente. Faça uma branch e um PR por mudança relevante. Inclua no PR o que mudou, os testes e o endereço da prévia quando existir. Depois que o repositório estiver conectado, use-o como fonte principal do código.

## Rotina pelo celular

Abra o repositório no Codex, envie a próxima tarefa e revise o PR no GitHub. Abra a prévia pelo check da Vercel no PR ou pelo deploy da branch em **Deployments**. Confira Início e Estúdio, inclusive abrindo `/estudio` diretamente e atualizando a página. Envie os ajustes pelo Codex e registre o resultado em [PROGRESSO.md](PROGRESSO.md).

| Ambiente | Onde é executado |
| --- | --- |
| Build local | `dist/` gerado na máquina que roda o comando. `npm run preview` permite conferir os arquivos nessa máquina |
| Prévia de PR | Deploy hospedado da branch, com endereço próprio para revisão |
| Produção | Deploy que atende pelo domínio de produção do projeto |

## Abrir no VS Code depois

Use `git clone <URL>` na primeira vez ou `git pull` numa cópia existente. Faça commit das mudanças locais antes de sincronizar. Abra a pasta do projeto e rode `npm ci` e `npm run dev`.

Continue a partir de [ROADMAP.md](ROADMAP.md) e [PROGRESSO.md](PROGRESSO.md).
