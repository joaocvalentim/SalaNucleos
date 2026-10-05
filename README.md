# Sala · Inventário

Aplicação web mobile-first para gerir materiais distribuídos por caixas, com levantamentos, devoluções parciais, transferências, baixas, correções, histórico e QR Code por caixa.

Para compreender a arquitetura, o estado atual, o que falta implementar e os principais riscos, consulta o [documento de passagem de contexto](HANDOFF.md).

## Desenvolvimento local

Requisitos: Node.js 22 e npm.

```bash
npm install
copy .env.example .env.local
npm run dev
```

Preenche `.env.local` com a configuração pública da Web App Firebase. Nunca coloques a password partilhada num ficheiro.

```bash
npm test
npm run lint
npm run build
```

## Configurar o Firebase

1. Cria um projeto na [Firebase Console](https://console.firebase.google.com/).
2. Em **Project settings → Your apps**, adiciona uma Web App e copia a configuração para `.env.local`.
3. Em **Authentication → Sign-in method**, ativa **Email/Password**.
4. Em **Authentication → Users**, cria uma única conta para a equipa.
5. Coloca apenas o email dessa conta em `VITE_SHARED_AUTH_EMAIL`.
6. Copia o UID da conta e substitui `REPLACE_WITH_SHARED_ACCOUNT_UID` em `firestore.rules`.
7. Cria o Cloud Firestore em modo de produção, numa região europeia adequada.
8. Publica regras e índices:

```bash
npm install -g firebase-tools
firebase login
firebase use --add
firebase deploy --only firestore:rules,firestore:indexes
```

9. Em **Authentication → Settings → Authorized domains**, adiciona o domínio GitHub Pages.

As regras recusam qualquer conta cujo UID não seja o UID partilhado. Movimentos não podem ser editados ou eliminados e quantidades negativas são rejeitadas.

## Variáveis

| Variável | Descrição |
|---|---|
| `VITE_FIREBASE_*` | Configuração pública da Web App Firebase |
| `VITE_SHARED_AUTH_EMAIL` | Email técnico da conta partilhada; não é segredo |
| `VITE_PUBLIC_APP_URL` | URL final, terminada em `/`, usada nos QR Codes |
| `VITE_BASE_PATH` | Base Vite, por exemplo `/SALANUCLEOS/` |

A password nunca é variável de build. É introduzida pelo utilizador e entregue diretamente ao Firebase Authentication.

## GitHub Pages

O workflow `.github/workflows/deploy.yml` testa, compila e publica em cada push para `main`.

1. Em **Settings → Pages**, escolhe **GitHub Actions**.
2. Em **Settings → Secrets and variables → Actions → Variables**, cria `PUBLIC_APP_URL`, todas as variáveis `FIREBASE_*` usadas no workflow e `SHARED_AUTH_EMAIL`.
3. Confirma que `VITE_BASE_PATH` no workflow corresponde ao nome do repositório.
4. Faz push para `main` ou executa o workflow manualmente.

Exemplo de QR: `https://utilizador.github.io/SALANUCLEOS/#/box/ID_IMUTAVEL`.

## Primeiros dados

A forma mais segura é criar as primeiras caixas e materiais na interface e adicionar stock através das ações normais. Assim, os movimentos iniciais ficam auditados e não existe um seed capaz de correr acidentalmente em produção.

Para desenvolvimento isolado:

```bash
firebase emulators:start
```

O projeto configura emuladores de Authentication, Firestore e respetiva UI. Dados dos emuladores nunca se misturam com produção.

## Modelo de dados

- `materials`: catálogo de materiais;
- `boxes`: caixas físicas;
- `stocks`: relação material/caixa e quantidade;
- `checkouts`: levantamentos abertos ou fechados;
- `movements`: histórico imutável.

Todas as ações de stock usam transações Firestore e gravam o movimento correspondente na mesma operação.

## Limitações conscientes do MVP

- todos partilham a mesma identidade Firebase;
- o nome indicado numa ação é auditoria operacional, não prova de identidade;
- a pesquisa parcial é local, adequada a inventários pequenos/médios;
- não existe escrita offline: as transações falham sem Internet;
- proteção contra manipulação deliberada exigiria Cloud Functions.
