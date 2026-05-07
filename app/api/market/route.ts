import { NextResponse } from 'next/server';

function sparkFrom(values: number[], w = 220, h = 58) {
  if (!values.length) return '';
  const min = Math.min(...values), max = Math.max(...values), range = max - min || 1;
  return values.map((v, i) => {
    const x = (w / Math.max(1, values.length - 1)) * i;
    const y = h - ((v - min) / range) * (h - 8) - 4;
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');
}
function trend(change: number) { if (change > 0.35) return 'Alta'; if (change < -0.35) return 'Baixa'; return 'Neutra'; }
function safeNumber(value: any) { const n = Number(String(value ?? '').replace(',', '.')); return Number.isFinite(n) ? n : 0; }
async function getBitcoin() {
  try {
    const [btcRes, btcChartRes] = await Promise.all([
      fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true', { cache: 'no-store', headers: { accept: 'application/json' } }),
      fetch('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=7&interval=daily', { cache: 'no-store', headers: { accept: 'application/json' } })
    ]);
    const btcJson = btcRes.ok ? await btcRes.json() : {};
    const btcChart = btcChartRes.ok ? await btcChartRes.json().catch(() => ({ prices: [] })) : { prices: [] };
    const btcPrice = safeNumber(btcJson?.bitcoin?.usd);
    const btcChange = safeNumber(btcJson?.bitcoin?.usd_24h_change);
    const btcPrices = Array.isArray(btcChart?.prices) ? btcChart.prices.map((p:any) => safeNumber(p[1])).filter(Boolean) : [];
    return {
      priceUsd: btcPrice,
      change24h: btcChange,
      trend: trend(btcChange),
      summary: btcChange > 0 ? 'Bitcoin opera em alta no curto prazo. A leitura é positiva, mas ainda depende de liquidez global, juros dos EUA e fluxo institucional.' : btcChange < 0 ? 'Bitcoin opera em queda no curto prazo. A tendência exige cautela, pois correções podem acelerar com dólar forte ou juros elevados.' : 'Bitcoin está lateral no curto prazo. Mercado aguarda novos sinais de liquidez e fluxo institucional.',
      sparkPath: sparkFrom(btcPrices),
      source: 'CoinGecko'
    };
  } catch { return { priceUsd: 0, change24h: 0, trend: 'Neutra', summary: 'Não foi possível carregar Bitcoin agora.', sparkPath: '', source: 'fallback' }; }
}
async function getDollarFromAwesomeApi() {
  const res = await fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL', { cache: 'no-store', headers: { accept: 'application/json' } });
  if (!res.ok) throw new Error('AwesomeAPI failed');
  const json = await res.json();
  const data = json?.USDBRL || json?.['USD-BRL'] || Object.values(json || {})[0] as any;
  const bid = safeNumber(data?.bid || data?.ask || data?.high);
  if (!bid) throw new Error('empty bid');
  return { bid, pctChange: safeNumber(data?.pctChange), high: safeNumber(data?.high), low: safeNumber(data?.low), source: 'AwesomeAPI' };
}
async function getDollarFromFrankfurter() {
  const res = await fetch('https://api.frankfurter.app/latest?from=USD&to=BRL', { cache: 'no-store', headers: { accept: 'application/json' } });
  if (!res.ok) throw new Error('Frankfurter failed');
  const json = await res.json();
  const bid = safeNumber(json?.rates?.BRL);
  if (!bid) throw new Error('empty BRL');
  return { bid, pctChange: 0, high: bid, low: bid, source: 'Frankfurter' };
}
async function getDollar() {
  let data:any;
  try { data = await getDollarFromAwesomeApi(); } catch { try { data = await getDollarFromFrankfurter(); } catch { data = { bid: 0, pctChange: 0, high: 0, low: 0, source: 'fallback' }; } }
  return {
    bid: data.bid,
    pctChange: data.pctChange,
    high: data.high || data.bid,
    low: data.low || data.bid,
    trend: trend(data.pctChange),
    summary: data.bid === 0 ? 'Não foi possível carregar o dólar agora.' : data.pctChange > 0 ? 'Dólar sobe contra o real. Isso pode indicar maior aversão a risco, preocupação fiscal ou ajuste nas expectativas de juros.' : data.pctChange < 0 ? 'Dólar recua contra o real. A leitura sugere alívio de curto prazo, maior apetite a risco ou diferencial de juros favorável.' : 'Dólar está estável ou sem variação diária disponível na fonte atual.',
    source: data.source,
    sparkPath: data.pctChange >= 0 ? 'M0 44 L22 40 L44 38 L66 34 L88 35 L110 30 L132 28 L154 24 L176 22 L198 18 L220 14' : 'M0 14 L22 18 L44 20 L66 24 L88 28 L110 30 L120 34 L154 36 L176 40 L198 42 L220 46'
  };
}
export async function GET() {
  const [bitcoin, dollar] = await Promise.all([getBitcoin(), getDollar()]);
  return NextResponse.json({ updatedAt: new Date().toISOString(), bitcoin, dollar });
}
