# RUNLAB Studio

Interface demonstrativa para um estúdio de figurinhas e um painel de análise de corrida. O acesso de visitante é livre. As métricas exibidas são exemplos fictícios.

React, TypeScript, Vite, Tailwind CSS, React Router e Lucide. A ilustração do percurso é um SVG local. O projeto roda sem backend, credenciais ou serviços de imagem e fontes.

## Executar

Use Node.js 24 LTS ou Node.js 22.12+ da série 22 e npm. Na pasta do projeto:

```sh
npm ci
npm test
npm run dev
```

`npm test` cobre parsing de distância e tempo, validação e cálculo de ritmo. `npm run lint` verifica o código, `npm run build` checa tipos e gera `dist/`, e `npm run preview` serve esse build para conferência local. Os testes automatizados, lint e build não substituem os testes visuais, funcionais ou de acessibilidade.

| Rota | Tela |
| --- | --- |
| `/` | Início com amostras e links para os dois módulos |
| `/estudio` | Editor manual, cálculo de ritmo, três templates e personalização da prévia 9:16 |
| `/analises` | Métricas e gráfico ilustrativos |
| `/historico` | Estado vazio |
| `/perfil` | Preferências e zonas cardíacas |
| `/entrar` | Tela demonstrativa de conta |
| Outras | Página 404 com volta ao Início |

No Estúdio, os mesmos dados alimentam Minimal, Performance e Clean. É possível ajustar título, data, métricas opcionais, cores compatíveis, visibilidade e organização, além de simular uma figurinha transparente ou uma arte completa. A troca de aparência não altera distância, tempo nem o pace calculado. Exportação e upload de fotografia ainda não estão disponíveis.

### Histórico, rascunho e restauração

Os botões **Desfazer** e **Refazer** cobrem dados e aparência. Fora dos campos, use `Ctrl + Z`/`Cmd + Z` e `Ctrl + Shift + Z`/`Cmd + Shift + Z`; dentro dos inputs, o comportamento nativo de edição é preservado.

O salvamento de rascunho é opcional e começa desativado. Quando ativado, guarda apenas o estado necessário no `localStorage` daquele navegador, sem conta, servidor ou sincronização. Ao voltar, o usuário escolhe recuperar ou começar novamente; o pace é sempre recalculado. **Restaurar padrão** preserva os dados da corrida, enquanto **Nova figurinha** pede confirmação e reinicia dados e aparência. Rascunhos são excluídos somente por uma ação separada e confirmada.

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
