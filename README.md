# Johnny Dash V17

Versão revisada com:
- layout mais próximo do modelo premium
- login privado com senha
- botão ocultar valores
- leitura real da aba `updates` do Google Sheets
- regra para usar sempre a última coluna com a data mais atual
- mais detalhes em Bitcoin, dólar, clima e análise de mercado
- badges visuais para empresas

## Variáveis na Vercel
DASHBOARD_PASSWORD=sua_senha
GOOGLE_SHEET_ID=1uUV1LzOP5Q68vuPkD8VUVSiSAetv_v2rsPylVO4CWzY
GOOGLE_UPDATES_GID=1622609470

## Como essa leitura funciona
A API `/api/sheet-summary` lê a aba `updates` via CSV do Google Sheets e:
1. encontra a linha com as datas
2. localiza a última coluna com data preenchida
3. usa essa coluna como base mais atual
4. monta um resumo por categoria
5. usa a linha `Total` para montar a série histórica

## Observação
Se a planilha não estiver acessível publicamente para leitura, o sistema cai em dados de fallback.
