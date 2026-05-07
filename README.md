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


## V21 Dollar Fix

Correção específica:
- O dólar não zera mais se a API do Bitcoin falhar.
- Busca USD/BRL primeiro na AwesomeAPI.
- Se a AwesomeAPI falhar, usa Frankfurter como fallback.
- Parser aceita `USDBRL`, `USD-BRL` ou primeiro objeto retornado pela API.
- Endpoint de teste: `/api/market`


## V22 Forecast Aportes

Novo:
- Lê a aba `Forecast`
- Usa a linha 10 como linha de aportes
- Usa apenas os meses a partir do mês seguinte ao mês atual
- Aportes são somados na projeção mês a mês até Dez/2027
- Aporte acumulado aparece no tooltip do gráfico
- O bucket de aportes também valoriza pela média ponderada da carteira

Variáveis opcionais:
GOOGLE_FORECAST_SHEET=Forecast
GOOGLE_FORECAST_GID=
