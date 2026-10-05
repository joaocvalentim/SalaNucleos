# Sala · Inventário

Documento de passagem de contexto técnico para permitir que outra pessoa continue o projeto sem depender da conversa que lhe deu origem.

> **Resumo:** existe um MVP completo em código, mas ainda não deve ser considerado pronto para produção. Falta ligá-lo a um projeto Firebase real, publicar e testar as regras, configurar o GitHub Pages e executar testes end-to-end das operações de stock.

## 1. O que é a aplicação

**Sala · Inventário** é uma aplicação web para gerir materiais guardados numa sala ou pequeno armazém.

- Existem várias caixas, armários ou localizações.
- Cada caixa pode conter vários materiais.
- O mesmo material pode existir em várias caixas.
- Materiais podem entrar, ser retirados, devolvidos, transferidos, corrigidos ou dados como baixa.
- Cada caixa tem um QR Code que abre diretamente o respetivo conteúdo.

A pergunta principal é: **Onde está este material e quanto temos disponível?**

Fluxo prioritário:

```text
Scan do QR da caixa
  -> autenticação, se necessária
  -> conteúdo da caixa
  -> ação sobre um material
```

## 2. Âmbito do MVP

Incluido:

- password comum à equipa;
- materiais, caixas e stock por localização;
- pesquisa e filtros;
- entrada, retirada, devolução parcial, transferência, baixa e correção;
- materiais atualmente em uso;
- historico de movimentos;
- stock minimo/baixo;
- QR Code estável por caixa, impressão e download SVG;
- UI responsiva para computador, tablet e telemovel;
- build e deploy por GitHub Actions/GitHub Pages.

Fora do MVP: contas individuais, permissões, fornecedores, encomendas, gestão financeira, notificações, relatórios avançados, reservas, app nativa e sincronização offline.

## 3. Estado do trabalho

### Implementado em código

- React/TypeScript/Vite e tema Material UI;
- `HashRouter`, guard de autenticacao e preservacao de deep links;
- Firebase configurável por variáveis de ambiente;
- listeners Firestore para todas as entidades;
- páginas, navegação e formulários principais;
- transações Firestore para todas as alterações de quantidade;
- movimento histórico na mesma transação da alteração;
- regras e índices Firestore iniciais;
- QR Codes e workflow de GitHub Pages;
- documentação de setup no `README.md`;
- testes unitários básicos de texto e quantidades.

### Validado localmente na implementação inicial

```bash
npm test
npm run lint
npm run build
```

Também foi verificado visualmente o ecrã de configuração em desktop e mobile.

### Ainda não validado

- Firebase real e site publicado;
- operações reais contra Firestore;
- regras através do Emulator Suite;
- concorrência entre duas sessões;
- QR num telemóvel físico e impressão real;
- fluxo completo de produção com dados reais.

## 4. Stack

| Área | Tecnologia |
|---|---|
| Frontend | React 19 + TypeScript |
| Build | Vite |
| UI | Material UI + Emotion |
| Routing | React Router com `HashRouter` |
| Autenticação | Firebase Authentication, Email/Password |
| Dados | Cloud Firestore |
| Datas | date-fns, locale português |
| QR Code | qrcode.react |
| Testes | Vitest + Testing Library |
| Qualidade | ESLint + TypeScript strict |
| Hosting | GitHub Pages |
| CI/CD | GitHub Actions |

O workflow usa Node.js 22.

## 5. Arquitetura

```text
Utilizador / QR Code
        |
        v
React + HashRouter
        |
        +-- AuthContext ---------- Firebase Authentication
        |
        +-- InventoryContext ----- listeners Firestore
        |
        +-- inventoryService ----- transações Firestore
                                      |
                                      +-- stocks
                                      +-- checkouts
                                      +-- movements
```

Princípios atuais:

1. Firestore é a fonte oficial dos dados.
2. O total de um material é calculado através dos stocks por caixa.
3. As alterações de stock passam por `inventoryService.ts`.
4. Stock e movimento são gravados na mesma transação.
5. Movimentos não devem ser editados ou eliminados.
6. O ID interno da caixa é imutável e independente do nome visível.
7. O QR Code usa esse ID interno.

## 6. Estrutura do código

```text
src/
  app/
    App.tsx                 routing e composição global
    theme.ts               tema Material UI
  components/
    AppShell.tsx            navegação desktop/mobile
    EntityDialogs.tsx       formulários de material e caixa
    FeedbackProvider.tsx    snackbars globais
    InventoryActionDialog.tsx
                             formulário comum de ações de stock
    MaterialCard.tsx
    MovementList.tsx
    OfflineBanner.tsx
    QrCodeDialog.tsx
  features/
    auth/AuthContext.tsx
    inventory/InventoryContext.tsx
  firebase/client.ts        inicialização Firebase
  models/inventory.ts       tipos do domínio
  pages/                    páginas da aplicação
  services/inventoryService.ts
                             operações e transações de stock
  utils/                    datas, erros e pesquisa
```

Infraestrutura:

```text
.github/workflows/deploy.yml
firebase.json
firestore.rules
firestore.indexes.json
.env.example
vite.config.ts
```

## 7. Rotas

| Rota | Página |
|---|---|
| `#/` | Dashboard e pesquisa principal |
| `#/login` | Login com password partilhada |
| `#/materials` | Lista e filtros de materiais |
| `#/material/:id` | Detalhe e ações de um material |
| `#/boxes` | Lista de caixas |
| `#/box/:id` | Conteúdo e ações de uma caixa |
| `#/in-use` | Levantamentos ainda pendentes |
| `#/history` | Histórico global |

É usado `HashRouter` para evitar erros 404 em links diretos no GitHub Pages.

## 8. Autenticação e deep links

A aplicação usa uma única conta Firebase Email/Password partilhada pela equipa.

- O email técnico vem de `VITE_SHARED_AUTH_EMAIL`.
- O utilizador vê apenas o campo da password.
- A password não fica no código, repositório ou variáveis de build.
- A sessão Firebase é persistida no browser.
- Cada operação pede o nome da pessoa.
- O último nome é guardado em `localStorage` apenas por conveniência.

Quando alguém abre um QR sem sessão:

1. a rota pretendida é guardada em `sessionStorage`;
2. aparece o login;
3. depois do login, a aplicação regressa à rota original.

Limitação: o nome indicado é auditoria operacional, não uma identidade comprovada. Toda a equipa usa a mesma conta Firebase.

## 9. Modelo de dados Firestore

### `materials/{materialId}`

```text
name, normalizedName, description, category, unit
minimumStock, notes, active, createdAt, updatedAt
```

### `boxes/{boxId}`

```text
code, name, description, roomLocation, notes
active, createdAt, updatedAt
```

O `boxId` é gerado pelo Firestore e usado no URL. Alterar o nome, código visível ou localização não quebra o QR.

### `stocks/{materialId}__{boxId}`

```text
materialId, boxId, quantity, updatedAt, lastOperationId
```

Existe no máximo um documento por combinação material/caixa.

### `checkouts/{checkoutId}`

```text
materialId, materialNameSnapshot
sourceBoxId, sourceBoxNameSnapshot
initialQuantity, pendingQuantity
person, reason, note
status: open | closed
createdAt, closedAt, lastOperationId
```

`pendingQuantity` permite várias devoluções e baixas parciais.

### `movements/{movementId}`

```text
type, materialId, materialNameSnapshot
quantity, delta
sourceBoxId, sourceBoxNameSnapshot
destinationBoxId, destinationBoxNameSnapshot
checkoutId, person, reason, note
sourceQuantityBefore, sourceQuantityAfter
destinationQuantityBefore, destinationQuantityAfter
createdAt
```

Tipos possíveis:

```text
stock_in
checkout
return
transfer
write_off_stock
write_off_checkout
correction
```

Os snapshots dos nomes mantêm o histórico legível mesmo que uma caixa ou material seja renomeado.

## 10. Operações de stock

Todas estão em `src/services/inventoryService.ts`.

| Operação | Alterações atómicas |
|---|---|
| Entrada | aumenta stock destino + cria movimento |
| Retirada | reduz stock origem + cria levantamento + movimento |
| Devolução | aumenta destino + reduz pendente + movimento |
| Transferência | reduz origem + aumenta destino + movimento |
| Baixa em armazém | reduz stock + movimento |
| Baixa em uso | reduz pendente + movimento |
| Correção | define quantidade real + movimento com diferença |

Validações implementadas:

- quantidades positivas e inteiras;
- stock nunca pode ficar negativo;
- não retirar/transferir/dar baixa acima do disponível;
- não devolver ou dar baixa acima do pendente;
- origem e destino têm de ser diferentes;
- caixas de destino desativadas não recebem stock;
- botões ficam bloqueados durante gravação;
- timestamps das operações usam `serverTimestamp()`.

## 11. Pesquisa e carregamento de dados

A pesquisa é feita no cliente: remove acentos, ignora maiúsculas/minúsculas e procura parcialmente no nome e categoria. O total disponível é a soma de `stocks`; o total em uso é a soma dos levantamentos abertos.

Esta solução é adequada a inventários pequenos/médios. Atualmente:

- materiais, caixas, stocks e levantamentos são carregados integralmente;
- são carregados apenas os 100 movimentos mais recentes;
- não existe pesquisa server-side nem paginação do histórico.

Se o volume crescer, introduzir queries específicas, paginação e eventualmente totais agregados.

## 12. Regras Firestore

`firestore.rules` contém regras iniciais que:

- aceitam apenas o UID da conta partilhada;
- impedem quantidades negativas;
- impedem mudar os IDs de um stock existente;
- exigem um movimento associado à alteração de stock;
- limitam a quantidade pendente de um levantamento;
- impedem editar/eliminar movimentos;
- impedem eliminações diretas das entidades principais.

### Configuração obrigatória

O ficheiro ainda contém:

```text
REPLACE_WITH_SHARED_ACCOUNT_UID
```

Tem de ser substituído pelo UID real do Firebase Authentication antes de publicar as regras.

### Limitação conhecida

Não existe backend próprio. As regras protegem invariantes básicos, mas a lógica mais sofisticada vive no cliente. Proteção forte contra manipulação deliberada exigiria Cloud Functions ou outro backend confiável.

## 13. Configuração local

```bash
npm install
copy .env.example .env.local
npm run dev
```

Variáveis necessárias:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_SHARED_AUTH_EMAIL=
VITE_PUBLIC_APP_URL=https://joaocvalentim.github.io/SalaNucleos/
VITE_BASE_PATH=/SalaNucleos/
```

As credenciais web Firebase são públicas por desenho. A password partilhada nunca deve ser colocada em `.env.local`.

### Configuração Firebase necessária

1. Criar projeto e Web App Firebase.
2. Ativar Authentication Email/Password.
3. Criar o utilizador partilhado.
4. Substituir o UID em `firestore.rules`.
5. Criar Firestore em modo de produção.
6. Autorizar o domínio `joaocvalentim.github.io`.
7. Associar o projeto com `firebase use --add`.
8. Publicar regras e índices:

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

### Variáveis GitHub Actions

Criar em **Settings -> Secrets and variables -> Actions -> Variables**:

```text
PUBLIC_APP_URL
FIREBASE_API_KEY
FIREBASE_AUTH_DOMAIN
FIREBASE_PROJECT_ID
FIREBASE_STORAGE_BUCKET
FIREBASE_MESSAGING_SENDER_ID
FIREBASE_APP_ID
SHARED_AUTH_EMAIL
```

Não criar uma variável para a password.

## 14. Deploy

O workflow `.github/workflows/deploy.yml` corre em cada push para `main`:

```text
npm ci -> npm test -> npm run build -> upload de dist -> GitHub Pages
```

No GitHub selecionar:

```text
Settings -> Pages -> Source -> GitHub Actions
```

### Atenção ao base path

No workflow, `VITE_BASE_PATH` está fixado como `/SALANUCLEOS/`, mas o URL esperado na documentação usa `/SalaNucleos/`. Confirmar a capitalização usada pelo GitHub Pages no primeiro deploy e tornar estes valores consistentes.

## 15. O que falta implementar ou validar

### P0 - obrigatório antes de produção

1. Criar/configurar o Firebase real.
2. Substituir o UID placeholder nas regras.
3. Configurar as variáveis GitHub Actions.
4. Publicar regras e índices.
5. Confirmar/corrigir o base path e URL público.
6. Testar todas as operações contra Firestore real ou Emulator Suite.
7. Testar concorrência com duas sessões sobre o mesmo stock.
8. Testar regras com `@firebase/rules-unit-testing`.
9. Testar QR num telemóvel físico, incluindo login e retorno à caixa.
10. Confirmar impressão da etiqueta.

### P1 - robustez recomendada

1. Adicionar callbacks de erro aos listeners `onSnapshot`.
2. Criar testes para `inventoryService.ts` e formulários.
3. Implementar paginação do histórico.
4. Reforçar schemas e campos permitidos nas regras Firestore.
5. Impedir também nas regras desativar caixas/materiais com stock pendente.
6. Adicionar idempotência explícita por operação, além do bloqueio do botão.
7. Ligar o frontend aos emuladores com `connectAuthEmulator` e `connectFirestoreEmulator`.
8. Melhorar loading, erros de subscrição e acessibilidade.

### P2 - melhorias futuras

- PWA instalável;
- exportação/backup CSV ou JSON;
- importação inicial CSV;
- QR Code por material;
- modo guiado de inventário físico;
- caixas recentemente abertas;
- pesquisa server-side;
- contas individuais e permissões;
- operações críticas através de Cloud Functions.

## 16. Riscos e problemas conhecidos

### Integração real ainda não comprovada

Sem as variáveis Firebase, a aplicação mostra apenas “Configuração necessária”. Compilar com sucesso não comprova o funcionamento contra produção.

### Cobertura de testes insuficiente

Existem apenas testes básicos em `src/utils/text.test.ts`. Transações e regras ainda não têm cobertura automatizada.

### Confiança no cliente

Quem tiver a password partilhada pode tentar escrever diretamente no Firestore. As regras reduzem o risco, mas não validam todos os invariantes de negócio.

### Conta partilhada

O campo `person` pode ser preenchido com qualquer nome e não prova identidade.

### Escrita offline

As transações falham offline. Isto é intencional para não apresentar como guardada uma alteração ainda não sincronizada.

### Histórico limitado

A UI carrega apenas os 100 movimentos mais recentes.

### Emuladores não ligados automaticamente

`firebase.json` define portas, mas `firebase emulators:start` não redireciona sozinho o frontend. Falta configuração condicional no cliente Firebase.

## 17. Plano sugerido para continuar

### Primeira passagem

1. Clonar o repositório e confirmar `npm ci`, `npm test`, `npm run lint` e `npm run build`.
2. Ler este documento, o `README.md`, `firestore.rules` e `src/services/inventoryService.ts`.
3. Criar ou selecionar o projeto Firebase e preencher `.env.local`.
4. Criar a conta partilhada, colocar o UID nas regras e publicar regras/índices.
5. Testar manualmente todos os fluxos com dados descartáveis.

### Robustez antes da entrega

1. Ligar a aplicação ao Emulator Suite em modo de desenvolvimento.
2. Criar testes automatizados das regras Firestore.
3. Criar testes das transações de inventário, sobretudo limites e concorrência.
4. Tratar erros dos listeners e apresentar mensagens recuperáveis ao utilizador.
5. Rever acessibilidade, estados vazios, loading e comportamento mobile.

### Antes de disponibilizar aos utilizadores

1. Corrigir e validar o URL/base path do GitHub Pages.
2. Fazer deploy com um conjunto pequeno de dados de teste.
3. Validar o scan de QR em Android e iPhone.
4. Simular duas pessoas a retirar ou transferir o mesmo material em simultâneo.
5. Imprimir uma etiqueta real e confirmar leitura, tamanho e destino.
6. Apagar os dados de teste ou criar os dados iniciais definitivos.

## 18. Checklist de conclusão do MVP

- [ ] Login funciona com a conta partilhada de produção.
- [ ] Utilizadores não autenticados não conseguem ler nem escrever dados.
- [ ] Criar, editar e desativar materiais e caixas funciona.
- [ ] Entrada aumenta o stock e cria movimento.
- [ ] Retirada nunca permite stock negativo e cria checkout aberto.
- [ ] Devolução parcial mantém o checkout aberto com a quantidade correta.
- [ ] Devolução total fecha o checkout.
- [ ] Baixa reduz a quantidade em uso e regista motivo.
- [ ] Transferência atualiza origem e destino atomicamente.
- [ ] Correção de inventário exige motivo e deixa histórico.
- [ ] Operações concorrentes não corrompem quantidades.
- [ ] QR de cada caixa abre a caixa certa.
- [ ] Após login por QR, o utilizador regressa à caixa pretendida.
- [ ] Caixas e materiais inativos não aceitam novas operações.
- [ ] Etiquetas imprimem corretamente.
- [ ] Erros de rede e permissões são apresentados de forma compreensível.
- [ ] Regras Firestore têm testes automatizados.
- [ ] Workflow publica com sucesso no URL final.

## 19. Comandos úteis

```bash
npm ci
npm run dev
npm test
npm run lint
npm run build
```

Com Firebase CLI instalado e autenticado:

```bash
firebase emulators:start
firebase deploy --only firestore:rules,firestore:indexes
```

Não executar o segundo comando sem confirmar o projeto Firebase ativo.

## 20. Dados e segredos

- A configuração Web do Firebase usada nas variáveis `VITE_FIREBASE_*` identifica o projeto, mas não substitui regras de segurança corretas.
- A password da conta partilhada nunca deve ser colocada no Git, no `.env.local` nem nas variáveis de build do site.
- `.env.local` está ignorado pelo Git; `.env.example` deve permanecer sem valores reais.
- O UID da conta é usado nas regras, mas não é uma password.
- Para dados reais, definir antecipadamente quem pode fazer backups, restaurar dados e alterar regras.

## 21. Referências do projeto

- Repositório: <https://github.com/joaocvalentim/SalaNucleos>
- Branch de partilha/produção: `main`
- Commit-base do MVP antes deste documento: `09b0184`
- Setup: `README.md`
- Lógica transacional: `src/services/inventoryService.ts`
- Estado global e listeners: `src/contexts/InventoryContext.tsx`
- Autenticação: `src/contexts/AuthContext.tsx`
- Regras: `firestore.rules`
- Índices: `firestore.indexes.json`
- Deploy: `.github/workflows/deploy.yml`

Documento revisto em 5 de outubro de 2026. Deve ser atualizado quando o Firebase real, o URL público ou os requisitos mudarem.
