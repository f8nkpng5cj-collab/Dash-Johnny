import { NextResponse } from 'next/server';

type Point = { date: Date, label: string, value: number };
type ForecastContribution = { month: string, key: string, value: number };

function parseMoney(input: string) {
  const raw = String(input || '').trim();
  if (!raw) return 0;
  const cleaned = raw
    .replace(/R\$/gi, '')
    .replace(/US\$/gi, '')
    .replace(/\s/g, '')
    .replace(/\./g, '')
    .replace(',', '.')
    .replace(/[^0-9.-]/g, '');
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (inQuotes && text[i + 1] === '"') { cur += '"'; i++; } else { inQuotes = !inQuotes; }
    } else if (ch === ',' && !inQuotes) { row.push(cur); cur = ''; }
    else if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(cur); rows.push(row); row = []; cur = '';
    } else { cur += ch; }
  }
  row.push(cur); rows.push(row);
  return rows;
}

function stripAccents(s: string) {
  return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function parseDate(v: string) {
  const s = (v || '').trim();
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (!m) return null;
  let a = Number(m[1]); let b = Number(m[2]); let y = Number(m[3]);
  if (y < 100) y += 2000;
  let month = a; let day = b;
  if (a > 12) { day = a; month = b; }
  if (b > 12) { month = a; day = b; }
  const d = new Date(Date.UTC(y, month - 1, day));
  return Number.isNaN(d.getTime()) ? null : d;
}

function parseMonthHeader(v: string, defaultYear?: number) {
  const original = String(v || '').trim();
  if (!original) return null;

  const date = parseDate(original);
  if (date) return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));

  const s = stripAccents(original).toLowerCase()
    .replace(/\./g, '')
    .replace(/_/g, '-')
    .replace(/\s+/g, ' ')
    .trim();

  let m = s.match(/^(\d{4})[-\/](\d{1,2})$/);
  if (m) return new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, 1));

  m = s.match(/^(\d{1,2})[-\/](\d{2,4})$/);
  if (m) {
    let y = Number(m[2]);
    if (y < 100) y += 2000;
    return new Date(Date.UTC(y, Number(m[1]) - 1, 1));
  }

  const months: Record<string, number> = {
    jan:0, janeiro:0, january:0,
    fev:1, fevereiro:1, feb:1, february:1,
    mar:2, marco:2, march:2,
    abr:3, abril:3, apr:3, april:3,
    mai:4, maio:4, may:4,
    jun:5, junho:5, june:5,
    jul:6, julho:6, july:6,
    ago:7, agosto:7, aug:7, august:7,
    set:8, setembro:8, sep:8, sept:8, september:8,
    out:9, outubro:9, oct:9, october:9,
    nov:10, novembro:10, november:10,
    dez:11, dezembro:11, dec:11, december:11
  };

  m = s.match(/^([a-z]+)[-\/ ]?(\d{2,4})?$/);
  if (m && months[m[1]] !== undefined) {
    let y = m[2] ? Number(m[2]) : (defaultYear || new Date().getUTCFullYear());
    if (y < 100) y += 2000;
    return new Date(Date.UTC(y, months[m[1]], 1));
  }

  return null;
}

function monthKey(d: Date) {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

function formatMonth(d: Date) {
  return d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit', timeZone: 'UTC' }).replace('.', '');
}

function clamp(n: number, min: number, max: number) { return Math.max(min, Math.min(max, n)); }

function segmentDefaults(name: string) {
  const s = name.toLowerCase();
  if (s.includes('cript') || s.includes('bitcoin')) return { def: 0.018, min: -0.04, max: 0.04 };
  if (s.includes('ações') || s.includes('acao') || s.includes('usa')) return { def: 0.010, min: -0.02, max: 0.025 };
  if (s.includes('saldo') || s.includes('cofre') || s.includes('moeda')) return { def: 0.006, min: 0, max: 0.008 };
  if (s.includes('fgts')) return { def: 0.0035, min: 0, max: 0.006 };
  if (s.includes('fixa') || s.includes('fundo') || s.includes('coe') || s.includes('vgbl')) return { def: 0.0085, min: 0, max: 0.014 };
  return { def: 0.007, min: -0.01, max: 0.018 };
}

function median(arr: number[]) {
  if (!arr.length) return 0;
  const sorted = [...arr].sort((a,b)=>a-b);
  const mid = Math.floor(sorted.length/2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid-1]+sorted[mid])/2;
}

function rateFor(name: string, points: Point[]) {
  const rules = segmentDefaults(name);
  const valid = points.filter(p => p.value > 0).sort((a,b)=>a.date.getTime()-b.date.getTime());
  if (valid.length < 2) return rules.def;
  const rates: number[] = [];
  for (let i=1; i<valid.length; i++) {
    const prev = valid[i-1]; const cur = valid[i];
    const days = Math.max(1, (cur.date.getTime() - prev.date.getTime()) / 86400000);
    if (prev.value <= 0 || cur.value <= 0) continue;
    const raw = Math.pow(cur.value / prev.value, 30.4375 / days) - 1;
    if (Number.isFinite(raw)) rates.push(clamp(raw, rules.min, rules.max));
  }
  const r = rates.length ? median(rates) : rules.def;
  return clamp(r, rules.min, rules.max);
}

function fallback(source = 'fallback') {
  const latest = {
    'Ações': 243, 'Saldo Corretora': 11405, 'fundo invest': 155442, 'COE': 12384, 'VGBL': 61306,
    'fixa': 300406, 'Cofre': 0, 'FGTS': 91166, 'Investimentos USA': 97327, 'MOEDAS (EURO)': 1855,
    'Cript': 17415, 'Total': 748949
  };
  const forecastContributions: ForecastContribution[] = [];
  const projection = [];
  for (let i=0; i<=19; i++) {
    const d = new Date(Date.UTC(2026, 4 + i, 1));
    const segments: any = {}; let total = 0;
    for (const [k,v] of Object.entries(latest)) {
      if (k === 'Total') continue;
      const r = rateFor(k, []);
      segments[k] = Math.round(Number(v) * Math.pow(1+r, i));
      total += segments[k];
    }
    projection.push({ month: formatMonth(d), total, contribution: 0, monthlyContribution: 0, segments });
  }
  return {
    connected: false,
    forecastConnected: false,
    source,
    lastDate: '07/05/2026',
    latest,
    rates: Object.fromEntries(Object.keys(latest).filter(k=>k!=='Total').map(k=>[k, rateFor(k, [])])),
    forecastContributions,
    projection,
    methodology: 'segment_average_with_caps_plus_forecast_row_10'
  };
}

async function tryFetch(url: string) {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('fetch failed');
  const text = await res.text();
  if (!text || text.includes('<!DOCTYPE html>')) throw new Error('not csv');
  return text;
}

function parseForecastContributions(text: string, currentDate = new Date()) {
  const rows = parseCsv(text).filter(r => r.some(c => String(c || '').trim() !== ''));
  if (rows.length < 10) return [];

  const aporteRow = rows[9] || [];
  const currentMonth = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), 1));
  const nextMonth = new Date(Date.UTC(currentMonth.getUTCFullYear(), currentMonth.getUTCMonth() + 1, 1));
  const end = new Date(Date.UTC(2027, 11, 1));

  let headerIdx = -1;
  let bestScore = 0;
  for (let r = 0; r < Math.min(rows.length, 15); r++) {
    let score = 0;
    for (const cell of rows[r]) if (parseMonthHeader(cell, currentDate.getUTCFullYear())) score++;
    if (score > bestScore) { bestScore = score; headerIdx = r; }
  }

  const out: ForecastContribution[] = [];

  if (headerIdx >= 0 && bestScore >= 2) {
    const header = rows[headerIdx];
    for (let c = 0; c < Math.max(header.length, aporteRow.length); c++) {
      const d = parseMonthHeader(header[c], currentDate.getUTCFullYear());
      if (!d) continue;
      if (d < nextMonth || d > end) continue;
      const value = parseMoney(aporteRow[c] || '');
      out.push({ month: formatMonth(d), key: monthKey(d), value });
    }
  }

  // Fallback: if no reliable header, assume numeric cells after column A are sequential months from next month.
  if (!out.length) {
    let current = new Date(nextMonth);
    for (let c = 1; c < aporteRow.length && current <= end; c++) {
      const value = parseMoney(aporteRow[c] || '');
      if (value !== 0) out.push({ month: formatMonth(current), key: monthKey(current), value });
      current = new Date(Date.UTC(current.getUTCFullYear(), current.getUTCMonth() + 1, 1));
    }
  }

  return out.sort((a,b)=>a.key.localeCompare(b.key));
}

function weightedAverageRate(latest: any, rates: Record<string, number>) {
  let total = 0;
  let weighted = 0;
  for (const [name, value] of Object.entries(latest)) {
    if (name.toLowerCase() === 'total') continue;
    const v = Number(value) || 0;
    const r = rates[name] ?? segmentDefaults(name).def;
    if (v > 0) { total += v; weighted += v * r; }
  }
  return total > 0 ? weighted / total : 0.008;
}

function extractData(text: string, forecastContributions: ForecastContribution[]) {
  const rows = parseCsv(text).filter(r => r.some(c => String(c || '').trim() !== ''));
  const headerRow = rows.find(r => r.filter(c => parseDate(c || '')).length >= 2);
  if (!headerRow) throw new Error('date row not found');

  const dateCols = headerRow
    .map((c, idx) => ({ idx, label: (c || '').trim(), date: parseDate(c || '') }))
    .filter(x => x.date)
    .sort((a:any,b:any)=>a.date.getTime()-b.date.getTime()) as {idx:number,label:string,date:Date}[];

  if (!dateCols.length) throw new Error('no dates');
  const last = dateCols[dateCols.length - 1];

  const latest: any = {};
  const history: Record<string, Point[]> = {};

  for (const r of rows) {
    const name = (r[0] || '').trim();
    if (!name) continue;
    latest[name] = parseMoney(r[last.idx] || '');
    history[name] = dateCols.map(dc => ({ date: dc.date, label: dc.label, value: parseMoney(r[dc.idx] || '') }));
  }

  const rates: Record<string, number> = {};
  for (const name of Object.keys(latest)) if (name.toLowerCase() !== 'total') rates[name] = rateFor(name, history[name] || []);

  const aportesMap = new Map(forecastContributions.map(a => [a.key, a.value]));
  const blendedRate = weightedAverageRate(latest, rates);
  const end = new Date(Date.UTC(2027, 11, 1));
  const start = new Date(Date.UTC(last.date.getUTCFullYear(), last.date.getUTCMonth(), 1));
  const projection: any[] = [];

  let m = new Date(start);
  let step = 0;
  let contributionBucket = 0;
  let cumulativeContribution = 0;

  while (m <= end && step < 36) {
    const key = monthKey(m);
    const monthlyAporte = aportesMap.get(key) || 0;

    if (step > 0) {
      contributionBucket = contributionBucket * (1 + blendedRate) + monthlyAporte;
      cumulativeContribution += monthlyAporte;
    }

    const segments: any = {};
    let total = 0;

    for (const [name, base] of Object.entries(latest)) {
      if (name.toLowerCase() === 'total') continue;
      const r = rates[name] ?? segmentDefaults(name).def;
      const v = Math.round(Number(base) * Math.pow(1 + r, step));
      segments[name] = v;
      total += v;
    }

    if (contributionBucket > 0) {
      segments['Aportes Forecast'] = Math.round(contributionBucket);
      total += contributionBucket;
    }

    projection.push({
      month: formatMonth(m),
      total: Math.round(total),
      contribution: Math.round(cumulativeContribution),
      monthlyContribution: monthlyAporte,
      segments
    });

    m = new Date(Date.UTC(m.getUTCFullYear(), m.getUTCMonth() + 1, 1));
    step++;
  }

  const series = dateCols.map(dc => ({
    date: dc.label,
    total: history['Total']?.find(p => p.label === dc.label)?.value || 0
  })).filter(x => x.total > 0);

  return {
    lastDate: last.label,
    latest,
    series,
    rates,
    forecastContributions,
    projection,
    methodology: 'segment_average_with_caps_plus_forecast_row_10_next_month',
    blendedRate
  };
}

export async function GET() {
  const id = process.env.GOOGLE_SHEET_ID || '1uUV1LzOP5Q68vuPkD8VUVSiSAetv_v2rsPylVO4CWzY';
  const gid = process.env.GOOGLE_UPDATES_GID || '1622609470';
  const sheetName = process.env.GOOGLE_UPDATES_SHEET || 'updates';
  const forecastSheet = process.env.GOOGLE_FORECAST_SHEET || 'Forecast';
  const forecastGid = process.env.GOOGLE_FORECAST_GID || '';

  const updateUrls = [
    `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`,
    `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&gid=${gid}`,
    `https://docs.google.com/spreadsheets/d/${id}/export?format=csv&gid=${gid}`
  ];

  const forecastUrls = [
    `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(forecastSheet)}`,
    forecastGid ? `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&gid=${forecastGid}` : ''
  ].filter(Boolean);

  let forecastContributions: ForecastContribution[] = [];
  let forecastConnected = false;

  for (const url of forecastUrls) {
    try {
      const forecastText = await tryFetch(url);
      forecastContributions = parseForecastContributions(forecastText);
      forecastConnected = true;
      break;
    } catch {}
  }

  for (const url of updateUrls) {
    try {
      const text = await tryFetch(url);
      const data = extractData(text, forecastContributions);
      return NextResponse.json({
        connected: true,
        forecastConnected,
        source: url.includes('sheet=') ? 'sheet=updates' : 'gid=1622609470',
        ...data
      });
    } catch {}
  }

  return NextResponse.json(fallback('fallback, planilha não acessível por CSV público'));
}
