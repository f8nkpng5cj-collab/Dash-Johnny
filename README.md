# Johnny Dash V23

Atualização solicitada:
- patrimônio total atual aparece explicitamente como R$ 748.949 quando vier no Total da planilha
- controle Google Sheets mostra a soma oficial do Total
- projeção por categoria até Dez/2027
- todas as categorias recebem uma premissa conservadora de crescimento
- Investimentos USA incluído na projeção
- FGTS incluído como parte do patrimônio
- Forecast linha 10 continua sendo usado para aportes futuros

## Variáveis Vercel

DASHBOARD_PASSWORD=sua_senha
GOOGLE_SHEET_ID=1uUV1LzOP5Q68vuPkD8VUVSiSAetv_v2rsPylVO4CWzY
GOOGLE_UPDATES_GID=1622609470
GOOGLE_UPDATES_SHEET=updates
GOOGLE_FORECAST_SHEET=Forecast

Opcional:
GOOGLE_FORECAST_GID=

Teste:
- /api/sheet-summary
- /api/market
- /api/news


## V24 Total Fix

Correção específica:
- O card "Patrimônio total hoje" agora usa o total oficial mais confiável.
- A API usa a última coluna física com data na aba updates.
- Se houver inconsistência no Total, ela recalcula pela soma das categorias.
- Se uma coluna posterior estiver errada e houver uma coluna recente com total materialmente maior, usa o total consistente.
- Resolve o caso em que aparecia R$ 634.374 em vez de R$ 748.949.


## V25 Rates, FGTS and Hide Axis

Atualização solicitada:
- Investimentos USA fixados em 4% ao ano.
- FGTS fixado em 3% ao ano.
- Aporte mensal de FGTS considerado em R$ 2.700.
- Variável opcional: `FGTS_MONTHLY_CONTRIBUTION=2700`.
- Ao ocultar valores, os valores do eixo Y do gráfico também são ocultados.


## V26 Nerd Layout

Atualização visual:
- escudo estilizado do Corinthians no layout
- painel visual inspirado em Leon S. Kennedy / Resident Evil
- símbolo inspirado em God of War
- marca d'água de futebol
- visual mais nerd e premium, mantendo o dashboard funcional

Arquivos adicionados:
- public/assets/corinthians-badge.svg
- public/assets/leon-card.svg
- public/assets/godofwar-mark.svg
- public/assets/resident-mark.svg
- public/assets/football-mark.svg


## V27 User Images Applied

Esta versão usa as imagens enviadas pelo usuário:
- Corinthians real
- Leon / Resident Evil
- God of War Ragnarök
- God of War Valhalla
- Ômega de God of War

Os arquivos foram copiados para `public/assets/` e aplicados no layout do dashboard.
