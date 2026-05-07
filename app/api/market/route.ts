import { NextResponse } from 'next/server';

function sparkFrom(values: number[], w = 220, h = 58) {
  if (!values.length) return '';
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  return values.map((v, i) => {
    const x = (w / Math.max(1, values.length - 1)) * i;
    const y = h - ((v - min) / range) * (h - 8) - 4;
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');
}

function trend(change: number) {
  if (change > 0.4) return 'Alta';
  if (change < -0.4) return 'Baixa';
  return 'Neutra';
}

export async function GET() {
  try {
    const [btcRes, btcChartRes, usdRes] = await Promise.all([
      fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true', { cache: 'no-store' }),
      fetch('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=7&interval=daily', { cache: 'no-store' }),
      fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL', { cache: 'no-store' })
    ]);

    const btcJson = await btcRes.json();
    const btcChart = await btcChartRes.json().catch(() => ({ prices: [] }));
    const usdJson = await usdRes.json();

    const btcPrice = Number(btcJson?.bitcoin?.usd || 0);
    const btcChange = Number(btcJson?.bitcoin?.usd_24h_change || 0);
    const btcPrices = Array.isArray(btcChart?.prices) ? btcChart.prices.map((p:any) => Number(p[1])) : [];

    const usdData = usdJson?.USDBRL || {};
    const bid = Number(usdData.bid || 0);
    const pctChange = Number(usdData.pctChange || 0);
    const high = Number(usdData.high || 0);
    const low = Number(usdData.low || 0);

    const btcTrend = trend(btcChange);
    const dollarTrend = trend(pctChange);

    const btcSummary =
      btcChange > 0
        ? 'Bitcoin opera em alta no curto prazo. A leitura é positiva, mas ainda depende de liquidez global, juros dos EUA e fluxo institucional.'
        : btcChange < 0
          ? 'Bitcoin opera em queda no curto prazo. A tendência exige cautela, pois correções podem acelerar com dólar forte ou juros elevados.'
          : 'Bitcoin está lateral no curto prazo. Mercado aguarda novos sinais de liquidez e fluxo institucional.';

    const dollarSummary =
      pctChange > 0
        ? 'Dólar sobe contra o real. Isso pode indicar maior aversão a risco, preocupação fiscal ou ajuste nas expectativas de juros.'
        : pctChange < 0
          ? 'Dólar recua contra o real. A leitura sugere alívio de curto prazo, maior apetite a risco ou expectativa de diferencial de juros favorável.'
          : 'Dólar está estável no curto prazo. Mercado aguarda novos dados de inflação, fiscal e política monetária.';

    return NextResponse.json({
      updatedAt: new Date().toISOString(),
      bitcoin: {
        priceUsd: btcPrice,
        change24h: btcChange,
        trend: btcTrend,
        summary: btcSummary,
        sparkPath: sparkFrom(btcPrices)
      },
      dollar: {
        bid,
        pctChange,
        high,
        low,
        trend: dollarTrend,
        summary: dollarSummary,
        sparkPath: pctChange >= 0
          ? 'M0 44 L22 40 L44 38 L66 34 L88 35 L110 30 L132 28 L154 24 L176 22 L198 18 L220 14'
          : 'M0 14 L22 18 L44 20 L66 24 L88 28 L110 30 L132 34 L154 36 L176 40 L198 42 L220 46'
      }
    });
  } catch {
    return NextResponse.json({
      updatedAt: new Date().toISOString(),
      bitcoin: { priceUsd: 0, change24h: 0, trend: 'Neutra', summary: 'Não foi possível carregar Bitcoin agora. Verifique o deploy ou tente novamente.', sparkPath: '' },
      dollar: { bid: 0, pctChange: 0, high: 0, low: 0, trend: 'Neutra', summary: 'Não foi possível carregar dólar agora. Verifique o deploy ou tente novamente.', sparkPath: '' }
    });
  }
}
