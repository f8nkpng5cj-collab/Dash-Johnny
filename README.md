# Johnny Dash V18

Versão refeita com:
- correção do problema de senha
- senha padrão de teste: johnny123
- suporte ao link aberto do Google Sheets
- leitura da aba `updates` por nome e também por GID
- fallback se a planilha ainda não permitir CSV público
- layout premium com mais detalhes

## Variáveis na Vercel

Obrigatória se quiser trocar a senha:
DASHBOARD_PASSWORD=sua_senha

Recomendadas para a planilha:
GOOGLE_SHEET_ID=1uUV1LzOP5Q68vuPkD8VUVSiSAetv_v2rsPylVO4CWzY
GOOGLE_UPDATES_GID=1622609470
GOOGLE_UPDATES_SHEET=updates

## Senha

Se você não configurar `DASHBOARD_PASSWORD`, a senha será:
johnny123

## Testes depois do deploy

1. Abra o site e entre com a senha.
2. Teste a leitura da planilha:
   /api/sheet-summary

Se aparecer `connected: true`, está lendo o Google Sheets.
Se aparecer fallback, a planilha ainda não está liberando CSV público.
