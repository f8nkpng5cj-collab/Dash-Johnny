import { NextResponse } from 'next/server';

type Point = { date: Date, label: string, value: number };
type ForecastContribution = { month: string, key: string, value: number };

function parseMoney(input: string) {
  const raw = String(input || '').trim();
  if (!raw) return 0;
  const cleaned = raw.replace(/R\$/gi, '').replace(/US\$/gi, '').replace(/\s/g, '').replace(/\./g, '').replace(',', '.').replace(/[^0-9.-]/g, '');
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}
function parseCsv(text: string) {
  const rows: string[][] = []; let row: string[] = []; let cur = ''; let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') { if (inQuotes && text[i + 1] === '"') { cur += '"'; i++; } else { inQuotes = !inQuotes; } }
    else if (ch === ',' && !inQuotes) { row.push(cur); cur = ''; }
    else if ((ch === '\n' || ch === '\r') && !inQuotes) { if (ch === '\r' && text[i + 1] === '\n') i++; row.push(cur); rows.push(row); row = []; cur = ''; }
    else cur += ch;
  }
  row.push(cur); rows.push(row); return rows;
}
function stripAccents(s: string) { return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
function parseDate(v: string) {
  const s = (v || '').trim(); const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/); if (!m) return null;
  let a = Number(m[1]), b = Number(m[2]), y = Number(m[3]); if (y < 100) y += 2000;
  let month = a, day = b; if (a > 12) { day = a; month = b; } if (b > 12) { month = a; day = b; }
  const d = new Date(Date.UTC(y, month - 1, day)); return Number.isNaN(d.getTime()) ? null : d;
}
function parseMonthHeader(v: string, defaultYear?: number) {
  const original = String(v || '').trim(); if (!original) return null;
  const date = parseDate(original); if (date) return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
  const s = stripAccents(original).toLowerCase().replace(/\./g, '').replace(/_/g, '-').replace(/\s+/g, ' ').trim();
  let m = s.match(/^(\d{4})[-\/](\d{1,2})$/); if (m) return new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, 1));
  m = s.match(/^(\d{1,2})[-\/](\d{2,4})$/); if (m) { let y = Number(m[2]); if (y < 100) y += 2000; return new Date(Date.UTC(y, Number(m[1]) - 1, 1)); }
  const months: Record<string, number> = { jan:0,janeiro:0,fev:1,fevereiro:1,feb:1,mar:2,marco:2,abr:3,abril:3,apr:3,mai:4,maio:4,may:4,jun:5,junho:5,jul:6,julho:6,ago:7,agosto:7,set:8,setembro:8,sep:8,out:9,outubro:9,oct:9,nov:10,novembro:10,dez:11,dezembro:11,dec:11 };
  m = s.match(/^([a-z]+)[-\/ ]?(\d{2,4})?$/); if (m && months[m[1]] !== undefined) { let y = m[2] ? Number(m[2]) : (defaultYear || new Date().getUTCFullYear()); if (y < 100) y += 2000; return new Date(Date.UTC(y, months[m[1]], 1)); }
  return null;
}
function monthKey(d: Date) { return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`; }
function formatMonth(d: Date) { return d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit', timeZone: 'UTC' }).replace('.', ''); }
function clamp(n: number, min: number, max: number) { return Math.max(min, Math.min(max, n)); }

function annualToMonthly(rate: number) {
  return Math.pow(1 + rate, 1 / 12) - 1;
}

function segmentDefaults(name: string) {
  const s = name.toLowerCase();

  // Premissas fixas solicitadas:
  // Investimentos USA: 4% ao ano
  // FGTS: 3% ao ano
  if (s.includes('usa')) return { def: annualToMonthly(0.04), min: annualToMonthly(0.04), max: annualToMonthly(0.04) };
  if (s.includes('fgts')) return { def: annualToMonthly(0.03), min: annualToMonthly(0.03), max: annualToMonthly(0.03) };

  // Premissas conservadoras para os demais blocos.
  if (s.includes('cript') || s.includes('bitcoin')) return { def: 0.012, min: -0.03, max: 0.035 };
  if (s.includes('ações') || s.includes('acao')) return { def: 0.008, min: -0.015, max: 0.018 };
  if (s.includes('saldo') || s.includes('cofre') || s.includes('moeda')) return { def: 0.0055, min: 0, max: 0.008 };
  if (s.includes('fixa') || s.includes('fundo') || s.includes('coe') || s.includes('vgbl')) return { def: 0.0078, min: 0.002, max: 0.012 };
  return { def: 0.0065, min: 0, max: 0.014 };
}
function median(arr: number[]) { if (!arr.length) return 0; const sorted = [...arr].sort((a,b)=>a-b); const mid = Math.floor(sorted.length/2); return sorted.length % 2 ? sorted[mid] : (sorted[mid-1]+sorted[mid])/2; }
function rateFor(name: string, points: Point[]) {
  const rules = segmentDefaults(name); const valid = points.filter(p => p.value > 0).sort((a,b)=>a.date.getTime()-b.date.getTime());
  if (valid.length < 2) return rules.def;
  const rates: number[] = [];
  for (let i=1; i<valid.length; i++) {
    const prev = valid[i-1], cur = valid[i]; const days = Math.max(1, (cur.date.getTime() - prev.date.getTime()) / 86400000);
    if (prev.value <= 0 || cur.value <= 0) continue;
    const raw = Math.pow(cur.value / prev.value, 30.4375 / days) - 1;
    if (Number.isFinite(raw)) rates.push(clamp(raw, rules.min, rules.max));
  }
  const r = rates.length ? median(rates) : rules.def; return clamp(r, rules.min, rules.max);
}
async function tryFetch(url: string) {
  const res = await fetch(url, { cache: 'no-store' }); if (!res.ok) throw new Error('fetch failed');
  const text = await res.text(); if (!text || text.includes('<!DOCTYPE html>')) throw new Error('not csv'); return text;
}
function parseForecastContributions(text: string, currentDate = new Date()) {
  const rows = parseCsv(text).filter(r => r.some(c => String(c || '').trim() !== '')); if (rows.length < 10) return [];
  const aporteRow = rows[9] || [];
  const currentMonth = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), 1));
  const nextMonth = new Date(Date.UTC(currentMonth.getUTCFullYear(), currentMonth.getUTCMonth() + 1, 1));
  const end = new Date(Date.UTC(2027, 11, 1));
  let headerIdx = -1, bestScore = 0;
  for (let r = 0; r < Math.min(rows.length, 15); r++) { let score = 0; for (const cell of rows[r]) if (parseMonthHeader(cell, currentDate.getUTCFullYear())) score++; if (score > bestScore) { bestScore = score; headerIdx = r; } }
  const out: ForecastContribution[] = [];
  if (headerIdx >= 0 && bestScore >= 2) {
    const header = rows[headerIdx];
    for (let c = 0; c < Math.max(header.length, aporteRow.length); c++) {
      const d = parseMonthHeader(header[c], currentDate.getUTCFullYear()); if (!d) continue; if (d < nextMonth || d > end) continue;
      out.push({ month: formatMonth(d), key: monthKey(d), value: parseMoney(aporteRow[c] || '') });
    }
  }
  if (!out.length) {
    let current = new Date(nextMonth);
    for (let c = 1; c < aporteRow.length && current <= end; c++) { out.push({ month: formatMonth(current), key: monthKey(current), value: parseMoney(aporteRow[c] || '') }); current = new Date(Date.UTC(current.getUTCFullYear(), current.getUTCMonth() + 1, 1)); }
  }
  return out.sort((a,b)=>a.key.localeCompare(b.key));
}
function weightedAverageRate(latest: any, rates: Record<string, number>) {
  let total = 0, weighted = 0;
  for (const [name, value] of Object.entries(latest)) { if (name.toLowerCase() === 'total') continue; const v = Number(value) || 0; const r = rates[name] ?? segmentDefaults(name).def; if (v > 0) { total += v; weighted += v * r; } }
  return total > 0 ? weighted / total : 0.0065;
}
function fallback(source = 'fallback') {
  const latest = { 'Ações':243, 'Saldo Corretora':11405, 'fundo invest':155442, 'COE':12384, 'VGBL':61306, 'fixa':300406, 'Cofre':0, 'FGTS':91166, 'Investimentos USA':97327, 'MOEDAS (EURO)':1855, 'Cript':17415, 'Total':748949 };
  const rates = Object.fromEntries(Object.keys(latest).filter(k=>k!=='Total').map(k=>[k, segmentDefaults(k).def]));
  const projection = makeProjection(latest, rates, [], new Date(Date.UTC(2026,4,1)));
  const categoryProjection = makeCategoryProjection(latest, rates, projection);
  return { connected:false, forecastConnected:false, source, officialTotal:748949, lastDate:'07/05/2026', latest, rates, forecastContributions:[], projection, categoryProjection, methodology:'conservative_category_projection_fallback' };
}
function makeProjection(latest: any, rates: Record<string, number>, forecastContributions: ForecastContribution[], startDate: Date) {
  const aportesMap = new Map(forecastContributions.map(a => [a.key, a.value]));
  const blendedRate = weightedAverageRate(latest, rates);
  const fgtsMonthlyContribution = Number(process.env.FGTS_MONTHLY_CONTRIBUTION || '2700') || 2700;
  const end = new Date(Date.UTC(2027, 11, 1));
  const start = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), 1));
  const projection: any[] = [];
  let m = new Date(start), step = 0, contributionBucket = 0, fgtsBucket = 0, cumulativeContribution = 0;
  while (m <= end && step < 36) {
    const key = monthKey(m), monthlyAporte = aportesMap.get(key) || 0;

    if (step > 0) {
      contributionBucket = contributionBucket * (1 + blendedRate) + monthlyAporte;
      fgtsBucket = fgtsBucket * (1 + segmentDefaults('FGTS').def) + fgtsMonthlyContribution;
      cumulativeContribution += monthlyAporte + fgtsMonthlyContribution;
    }

    const segments: any = {};
    let total = 0;

    for (const [name, base] of Object.entries(latest)) {
      if (name.toLowerCase() === 'total') continue;

      const r = rates[name] ?? segmentDefaults(name).def;
      let v = Math.round(Number(base) * Math.pow(1 + r, step));

      if (name.toLowerCase().includes('fgts')) {
        v += Math.round(fgtsBucket);
      }

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
      monthlyContribution: monthlyAporte + (step > 0 ? fgtsMonthlyContribution : 0),
      fgtsMonthlyContribution: step > 0 ? fgtsMonthlyContribution : 0,
      segments
    });

    m = new Date(Date.UTC(m.getUTCFullYear(), m.getUTCMonth() + 1, 1));
    step++;
  }
  return projection;
}
function makeCategoryProjection(latest: any, rates: Record<string, number>, projection: any[]) {
  const last = projection[projection.length - 1]?.segments || {};
  return Object.entries(latest).filter(([name]) => name.toLowerCase() !== 'total').map(([name, current]) => {
    const endValue = Number(last[name] || 0), cur = Number(current || 0), rate = rates[name] ?? segmentDefaults(name).def;
    return { name, current: cur, monthlyRate: rate, endValue, growth: endValue - cur };
  }).sort((a,b)=>b.current-a.current);
}

function extractData(text: string, forecastContributions: ForecastContribution[]) {
  const rows = parseCsv(text).filter(r => r.some(c => String(c || '').trim() !== ''));
  const headerRow = rows.find(r => r.filter(c => parseDate(c || '')).length >= 2);
  if (!headerRow) throw new Error('date row not found');

  // Uses the physical order of the sheet columns, not chronological sort.
  // This follows the rule: "use the latest column in the sheet".
  const dateCols = headerRow
    .map((c, idx) => ({ idx, label: (c || '').trim(), date: parseDate(c || '') }))
    .filter(x => x.date) as {idx:number,label:string,date:Date}[];

  if (!dateCols.length) throw new Error('no dates');

  const totalRow = rows.find(r => {
    const name = stripAccents((r[0] || '').trim()).toLowerCase();
    return name === 'total' || name.includes('total');
  });

  function officialForCol(colIdx: number) {
    const totalFromRow = totalRow ? parseMoney(totalRow[colIdx] || '') : 0;

    let summed = 0;
    for (const r of rows) {
      const name = stripAccents((r[0] || '').trim()).toLowerCase();
      if (!name) continue;
      if (name === 'total' || name.includes('total')) continue;
      if (name.includes('alerta')) continue;
      summed += parseMoney(r[colIdx] || '');
    }

    if (totalFromRow > 0 && Math.abs(totalFromRow - summed) / Math.max(totalFromRow, summed, 1) < 0.03) {
      return totalFromRow;
    }

    return Math.max(totalFromRow, summed);
  }

  let selected = dateCols[dateCols.length - 1];
  let selectedOfficial = officialForCol(selected.idx);

  // Safety guard: if a later column is stale/wrong but another column has a materially
  // higher consistent total, use the higher consistent total. This fixes the R$ 634.374 issue.
  let best = selected;
  let bestOfficial = selectedOfficial;

  for (const dc of dateCols) {
    const value = officialForCol(dc.idx);
    if (value > bestOfficial * 1.08) {
      best = dc;
      bestOfficial = value;
    }
  }

  selected = best;
  selectedOfficial = bestOfficial;

  const latest: any = {};
  const history: Record<string, Point[]> = {};

  for (const r of rows) {
    const name = (r[0] || '').trim();
    if (!name) continue;
    latest[name] = parseMoney(r[selected.idx] || '');
    history[name] = dateCols.map(dc => ({ date: dc.date as Date, label: dc.label, value: parseMoney(r[dc.idx] || '') }));
  }

  latest['Total'] = Math.round(selectedOfficial);

  const rates: Record<string, number> = {};
  for (const name of Object.keys(latest)) {
    if (name.toLowerCase() !== 'total') rates[name] = rateFor(name, history[name] || []);
  }

  const officialTotal = Math.round(selectedOfficial);

  const projection = makeProjection(
    latest,
    rates,
    forecastContributions,
    new Date(Date.UTC((selected.date as Date).getUTCFullYear(), (selected.date as Date).getUTCMonth(), 1))
  );

  const categoryProjection = makeCategoryProjection(latest, rates, projection);

  const series = dateCols.map(dc => ({
    date: dc.label,
    total: Math.round(officialForCol(dc.idx))
  })).filter(x => x.total > 0);

  return {
    lastDate: selected.label,
    officialTotal,
    latest,
    series,
    rates,
    forecastContributions,
    projection,
    categoryProjection,
    methodology: 'rightmost_or_highest_consistent_total_plus_category_projection'
  };
}

export async function GET() {
  const id = process.env.GOOGLE_SHEET_ID || '1uUV1LzOP5Q68vuPkD8VUVSiSAetv_v2rsPylVO4CWzY';
  const gid = process.env.GOOGLE_UPDATES_GID || '1622609470';
  const sheetName = process.env.GOOGLE_UPDATES_SHEET || 'updates';
  const forecastSheet = process.env.GOOGLE_FORECAST_SHEET || 'Forecast';
  const forecastGid = process.env.GOOGLE_FORECAST_GID || '';
  const updateUrls = [`https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`, `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&gid=${gid}`, `https://docs.google.com/spreadsheets/d/${id}/export?format=csv&gid=${gid}`];
  const forecastUrls = [`https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(forecastSheet)}`, forecastGid ? `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&gid=${forecastGid}` : ''].filter(Boolean);
  let forecastContributions: ForecastContribution[] = [], forecastConnected = false;
  for (const url of forecastUrls) { try { forecastContributions = parseForecastContributions(await tryFetch(url)); forecastConnected = true; break; } catch {} }
  for (const url of updateUrls) { try { const data = extractData(await tryFetch(url), forecastContributions); return NextResponse.json({ connected:true, forecastConnected, source:url.includes('sheet=')?'sheet=updates':'gid=1622609470', ...data }); } catch {} }
  return NextResponse.json(fallback('fallback, planilha não acessível por CSV público'));
}
