# Johnny Dash V20

Revisão solicitada:
- Bitcoin online via CoinGecko
- Dólar online via AwesomeAPI
- análise automática de tendência do Bitcoin e dólar
- notícias online via Google News RSS com link da matéria
- botão ocultar agora esconde somente valores de investimento/carteira
- Bitcoin e dólar continuam visíveis mesmo no modo oculto
- gráfico de projeção dinâmico mantido

## Variáveis na Vercel

DASHBOARD_PASSWORD=sua_senha
GOOGLE_SHEET_ID=1uUV1LzOP5Q68vuPkD8VUVSiSAetv_v2rsPylVO4CWzY
GOOGLE_UPDATES_GID=1622609470
GOOGLE_UPDATES_SHEET=updates

Opcional:
MONTHLY_CONTRIBUTION=1500

## Senha padrão se não configurar
johnny123

## Testes após deploy

/api/market
/api/news
/api/sheet-summary
