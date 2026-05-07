import { NextResponse } from 'next/server';

type Point = { date: Date, label: string, value: number };

function parseMoney(input: string) {
  const cleaned = (input || '').replace(/R\$/g, '').replace(/\s/g, '').replace(/\./g, '').replace(',', '.').trim();
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
      if (inQuotes && text[i + 1] === '"') { cur += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (ch === ',' && !inQuotes) {
      row.push(cur); cur = '';
    } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(cur); rows.push(row); row = []; cur = '';
    } else {
      cur += ch;
    }
  }
  row.push(cur); rows.push(row);
  return rows;
}

function parseDate(v: string) {
  const s = (v || '').trim();
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (!m) return null;
  let a = Number(m[1]);
  let b = Number(m[2]);
  let y = Number(m[3]);
  if (y < 100) y += 2000;
  let month = a;
  let day = b;
  if (a > 12) { day = a; month = b; }
  if (b > 12) { month = a; day = b; }
  const d = new Date(Date.UTC(y, month - 1, day));
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatMonth(d: Date) {
  return d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit', timeZone: 'UTC' }).replace('.', '');
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

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
    const prev = valid[i-1];
    const cur = valid[i];
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
  const projection = [];
  for (let i=0; i<=19; i++) {
    const d = new Date(Date.UTC(2026, 4 + i, 1));
    const segments: any = {};
    let total = 0;
    for (const [k,v] of Object.entries(latest)) {
      if (k === 'Total') continue;
      const r = rateFor(k, []);
      segments[k] = Math.round(Number(v) * Math.pow(1+r, i));
      total += segments[k];
    }
    projection.push({ month: formatMonth(d), total, contribution: 0, segments });
  }
  return { connected: false, source, lastDate: '07/05/2026', latest, rates: Object.fromEntries(Object.keys(latest).filter(k=>k!=='Total').map(k=>[k, rateFor(k, [])])), projection, methodology: 'segment_average_with_caps' };
}

async function tryFetch(url: string) {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('fetch failed');
  const text = await res.text();
  if (!text || text.includes('<!DOCTYPE html>')) throw new Error('not csv');
  return text;
}

function extractData(text: string) {
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
  for (const name of Object.keys(latest)) {
    if (name.toLowerCase() !== 'total') rates[name] = rateFor(name, history[name] || []);
  }

  const monthlyContribution = Number(process.env.MONTHLY_CONTRIBUTION || '0') || 0;
  const end = new Date(Date.UTC(2027, 11, 1));
  const start = new Date(Date.UTC(last.date.getUTCFullYear(), last.date.getUTCMonth(), 1));
  const projection: any[] = [];
  let m = new Date(start);
  let step = 0;

  while (m <= end && step < 36) {
    const segments: any = {};
    let total = 0;
    for (const [name, base] of Object.entries(latest)) {
      if (name.toLowerCase() === 'total') continue;
      const r = rates[name] ?? segmentDefaults(name).def;
      const v = Math.round(Number(base) * Math.pow(1 + r, step));
      segments[name] = v;
      total += v;
    }
    const contribution = monthlyContribution * step;
    total += contribution;
    projection.push({ month: formatMonth(m), total: Math.round(total), contribution, segments });
    m = new Date(Date.UTC(m.getUTCFullYear(), m.getUTCMonth() + 1, 1));
    step++;
  }

  const lastDate = last.label;
  const series = dateCols.map(dc => ({
    date: dc.label,
    total: history['Total']?.find(p => p.label === dc.label)?.value || 0
  })).filter(x => x.total > 0);

  return { lastDate, latest, series, rates, projection, methodology: 'segment_average_with_caps' };
}

export async function GET() {
  const id = process.env.GOOGLE_SHEET_ID || '1uUV1LzOP5Q68vuPkD8VUVSiSAetv_v2rsPylVO4CWzY';
  const gid = process.env.GOOGLE_UPDATES_GID || '1622609470';
  const sheetName = process.env.GOOGLE_UPDATES_SHEET || 'updates';

  const urls = [
    `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`,
    `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&gid=${gid}`,
    `https://docs.google.com/spreadsheets/d/${id}/export?format=csv&gid=${gid}`
  ];

  for (const url of urls) {
    try {
      const text = await tryFetch(url);
      const data = extractData(text);
      return NextResponse.json({ connected: true, source: url.includes('sheet=') ? 'sheet=updates' : 'gid=1622609470', ...data });
    } catch {}
  }

  return NextResponse.json(fallback('fallback, planilha não acessível por CSV público'));
}
