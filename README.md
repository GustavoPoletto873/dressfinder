# Achei o Vestido: buscador de vestidos na Shein Brasil

A pessoa descreve o vestido que procura e a ocasião, e o app devolve opções da Shein Brasil (br.shein.com) agrupadas por estilo, cada grupo com uma explicação de por que combina com a ocasião.

O app foi pensado para **nunca deixar a pessoa sem resposta**. Cada busca passa por uma cadeia de alternativas:

```
formulário
   │
   ▼
1. Gera de 5 a 8 buscas curtas ─── Claude (API da Anthropic)
   │                               └─ se falhar ou não houver chave: gerador por regras
   ▼
2. Produtos direto da Shein ────── serviço /scraper (Playwright)
   │  sem produtos? (bloqueio, erro ou scraper desligado)
   ▼
3. Anúncios encontrados no Google ─ SerpAPI, com "site:br.shein.com <busca>"
   │  sem resultados, sem cota ou sem chave?
   ▼
4. Links prontos ────────────────── "Buscar na Shein" e "Buscar no Google" (sempre aparecem)
```

Se até a API do próprio app cair, o navegador monta os links de busca sozinho, usando o gerador por regras.

## Estrutura

```
/web       → Next.js (App Router, TypeScript, Tailwind). Interface e API /api/buscar. Deploy na Vercel.
/scraper   → Node.js + TypeScript + Playwright + Fastify. Deploy no Railway ou Render via Dockerfile.
```

## Importante: a Shein bloqueia o scraper

Nos testes locais (novembro de 2026), a Shein redirecionou **todas** as buscas automatizadas para uma página de verificação (`/risk/challenge?captcha_type=909`), antes de carregar qualquer produto. Isso aconteceu até com o navegador visível e a partir de um IP residencial. Em servidores (IP de datacenter), o bloqueio tende a ser ainda mais frequente.

O scraper **não tenta contornar** captcha nem bloqueio. Ele detecta a verificação em 2 a 6 segundos e devolve `status: "bloqueado"`, e o app segue para o Google (SerpAPI) e para os links. Se um dia o acesso for liberado, os produtos aparecem sem mudar nada no código.

Por isso, **a SerpAPI é o que de fato traz anúncios para dentro do app hoje**. O scraper é opcional.

## Como rodar localmente

Pré-requisitos: Node.js 22 ou superior.

### 1. Scraper (opcional)

```bash
cd scraper
npm install
npx playwright install chromium
cp .env.example .env          # defina SCRAPER_TOKEN com um valor secreto
npm run dev                   # sobe em http://localhost:3001
```

Em outro terminal, teste com 3 buscas:

```bash
cd scraper
npm run testar                # ou: npm run testar -- "vestido longo cetim" "vestido midi linho"
```

Outros comandos:

- `npm run investigar -- "vestido midi floral"`: abre a Shein com o navegador **visível**, registra todas as respostas JSON e salva HTML, captura de tela e JSONs em `scraper/investigacao/` (fora do git). Use para ver o que a Shein está devolvendo.
- `npm run build && npm start`: versão de produção.

### 2. Web

```bash
cd web
npm install
cp .env.example .env.local    # preencha o que tiver (todas as chaves são opcionais)
npm run dev                   # http://localhost:3000
```

O app funciona **sem nenhuma variável configurada**, usando o gerador de buscas por regras e os links. Cada variável liga uma parte:

| Configurado | O que acontece |
|---|---|
| nada | buscas por regras + links da Shein e do Google |
| `ANTHROPIC_API_KEY` | o Claude gera buscas melhores e explicações sob medida |
| `SERPAPI_KEY` | anúncios reais encontrados no Google aparecem dentro do app |
| `SCRAPER_URL` + `SCRAPER_TOKEN` | tenta trazer produtos com foto e preço direto da Shein |

#### Gerador de buscas por regras (sem IA)

Quando não há `ANTHROPIC_API_KEY` (ou a API falha), as buscas são montadas por regras em [web/src/lib/termosRegras.ts](web/src/lib/termosRegras.ts):

- **Ocasião**: reconhece casamento de dia e à noite, madrinha, noivado, formatura, trabalho e reunião, praia, jantar, batizado e igreja, festa e aniversário, chá de bebê e chá revelação, réveillon, festa junina, carnaval, festival e show, viagem e dia a dia. Cada uma tem combinações típicas (ex.: réveillon → "branco renda").
- **Estilo**: traduz para palavras usadas nos títulos da Shein (ex.: romântico → "floral babado", minimalista → "liso básico", sexy → "fenda decote").
- **Observações**: procura detalhes no texto livre (manga, fenda, decote, costas abertas, babado, renda, "disfarçar a barriga" → "evasê", "usar sutiã" → "alça larga" etc.) e ignora o que vier negado ("não quero fenda").
- **Comprimento**: o comprimento escolhido sempre prevalece sobre as sugestões da ocasião.
- **Várias cores** (até 4 na paleta, mais o que for digitado): cada cor é tratada como alternativa e ganha a própria busca ("Em verde esmeralda"), em vez de procurar um vestido com todas as cores juntas.

O guia de tecidos do formulário (textura, caimento, temperatura, elasticidade e para que ocasiões serve) fica em [web/src/components/tecidos.tsx](web/src/components/tecidos.tsx), e a paleta de cores em [web/src/components/paletaCores.ts](web/src/components/paletaCores.ts).

Para incluir novas ocasiões, estilos ou detalhes, basta acrescentar linhas nas listas `PERFIS`, `ESTILOS` e `DETALHES` desse arquivo.

Para usar o scraper local, coloque no `web/.env.local`:

```
SCRAPER_URL=http://localhost:3001
SCRAPER_TOKEN=<o mesmo valor do scraper/.env>
```

## Deploy

### Web na Vercel

1. Importe o repositório na Vercel.
2. Em **Root Directory**, escolha `web`. O framework (Next.js) é detectado automaticamente.
3. Em **Environment Variables**, cadastre as variáveis da tabela abaixo (pelo menos `ANTHROPIC_API_KEY` e, se quiser anúncios, `SERPAPI_KEY`).
4. Faça o deploy.

A rota `/api/buscar` declara `maxDuration = 60` segundos (IA + scraper + Google). Os planos atuais da Vercel aceitam esse limite.

### Scraper no Railway

1. Crie um projeto a partir do repositório.
2. Em **Settings → Root Directory**, use `scraper`. O Railway detecta o `Dockerfile`.
3. Em **Variables**, defina `SCRAPER_TOKEN`. O `PORT` é definido pelo Railway.
4. Em **Settings → Networking**, gere um domínio público e use-o como `SCRAPER_URL` na Vercel.
5. Health check: `GET /saude`.

### Scraper no Render

1. **New → Web Service**, conecte o repositório.
2. **Root Directory**: `scraper`. **Runtime**: Docker (o Render usa o `Dockerfile`).
3. **Environment**: defina `SCRAPER_TOKEN`. O Render injeta o `PORT`.
4. **Health Check Path**: `/saude`.
5. Use a URL gerada (`https://<nome>.onrender.com`) como `SCRAPER_URL` na Vercel.

O Chromium consome bastante memória. Prefira instâncias com pelo menos 1 GB de RAM. Em planos gratuitos que "dormem", a primeira busca depois de um tempo parado demora mais.

O `Dockerfile` usa a imagem oficial `mcr.microsoft.com/playwright:v1.65.1-noble`. **Se atualizar o pacote `playwright` no `package.json`, atualize a tag da imagem para a mesma versão.**

## Variáveis de ambiente

### /web

| Variável | Obrigatória | Descrição |
|---|---|---|
| `ANTHROPIC_API_KEY` | não | Chave da API da Anthropic. Sem ela, as buscas vêm do gerador por regras (veja abaixo). |
| `ANTHROPIC_MODEL` | não | Modelo usado. Padrão: `claude-sonnet-5-5`. |
| `SCRAPER_URL` | não | URL do serviço /scraper. Sem ela, o scraper é pulado. |
| `SCRAPER_TOKEN` | se `SCRAPER_URL` existir | Mesmo token configurado no /scraper. |
| `SERPAPI_KEY` | não | Chave da [SerpAPI](https://serpapi.com) para trazer anúncios do Google. |
| `SERPAPI_MAX_TERMOS` | não | Quantas buscas de cada pesquisa consultam a SerpAPI. Padrão: `3`. |
| `LIMITE_BUSCAS_POR_MINUTO` | não | Pesquisas por minuto aceitas por IP. Padrão: `6`. |

### /scraper

| Variável | Obrigatória | Descrição |
|---|---|---|
| `SCRAPER_TOKEN` | sim | Token exigido no cabeçalho `Authorization: Bearer <token>`. O serviço não sobe sem ele. |
| `PORT` | não | Porta HTTP. Padrão: `3001`. Railway e Render definem automaticamente. |

## Custos e limites

- **SerpAPI**: o plano gratuito tem 250 buscas por mês (até 50 por hora). Cada pesquisa no app consulta no máximo `SERPAPI_MAX_TERMOS` buscas (padrão 3), então o plano gratuito rende cerca de 80 pesquisas por mês. Os resultados ficam em cache por 6 horas, e buscas repetidas na própria SerpAPI dentro de 1 hora não contam na cota. Quando a cota acaba, o app mostra só os links.
- **Anthropic**: uma chamada curta por pesquisa (esforço baixo). Com o modelo padrão (US$ 2 por milhão de tokens de entrada e US$ 10 por milhão de saída), fica em torno de 1 a 2 centavos de dólar por pesquisa.
- **Proteção contra abuso**: limite simples por IP em memória. Na Vercel, cada instância tem sua própria memória, então é uma proteção de melhor esforço.

## API

### `POST /api/buscar` (web)

Entrada (só `ocasiao` é obrigatória):

```json
{
  "ocasiao": "casamento de dia",
  "comprimento": "midi",
  "cor": "verde-oliva",
  "tecido": "",
  "decoteManga": "manga bufante",
  "estilo": "romântico",
  "tamanho": "M",
  "precoMin": 50,
  "precoMax": 200,
  "observacoes": ""
}
```

Saída: para cada busca, `termo`, `titulo`, `motivo`, `linkShein`, `linkGoogle`, `status` do scraper (`ok`, `vazio`, `bloqueado`, `erro` ou `desativado`), `produtos`, `statusAnuncios` (`ok`, `vazio`, `cota`, `erro`, `desativado` ou `pulado`) e `anuncios`. Itens com preço fora da faixa informada são removidos. Itens sem preço são mantidos.

### `POST /buscar` (scraper)

```bash
curl -X POST http://localhost:3001/buscar \
  -H "Authorization: Bearer $SCRAPER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"termo": "vestido midi floral", "limite": 12}'
```

Resposta: `{ "status": "ok" | "vazio" | "bloqueado" | "erro", "produtos": [{ "titulo", "preco", "precoNumero", "imagem", "url" }] }`. O `limite` padrão é 12 e o máximo 24.

`GET /saude` devolve o estado do navegador, o tamanho do cache e a fila.

Como o scraper funciona:

- Mantém um único Chromium headless aberto e cria um contexto novo por busca, fechado ao final.
- Estratégia principal: intercepta as respostas JSON da própria página e procura objetos de produto (`goods_id`, `goods_name`, `salePrice`...).
- Estratégias secundárias: dados embutidos na página e, por fim, os cards do DOM.
- Bloqueia imagens, vídeos e fontes no navegador para acelerar.
- Cache LRU de 6 horas por termo (bloqueios ficam só 15 minutos), no máximo 2 páginas abertas ao mesmo tempo com fila, e timeout de 20 segundos por busca.
- Log de cada busca com termo, status, quantidade de produtos, tempo e origem dos dados.
