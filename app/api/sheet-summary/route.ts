import { NextResponse } from 'next/server';

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

export async function GET() {
  const id = process.env.GOOGLE_SHEET_ID || '1uUV1LzOP5Q68vuPkD8VUVSiSAetv_v2rsPylVO4CWzY';
  const gid = process.env.GOOGLE_UPDATES_GID || '1622609470';
  const fallback = {
    lastDate: '07/05/2026',
    latest: {
      'Ações': 243,
      'Saldo Corretora': 11405,
      'fundo invest': 155442,
      'COE': 12384,
      'VGBL': 61306,
      'fixa': 300406,
      'Cofre': 0,
      'FGTS': 91166,
      'Investimentos USA': 97327,
      'MOEDAS (EURO)': 1855,
      'Cript': 17415,
      'Total': 748949
    },
    series: [
      { date: '04/05/2026', total: 659199 },
      { date: '24/04/2026', total: 675330 },
      { date: '01/05/2026', total: 745421 },
      { date: '07/05/2026', total: 748949 }
    ]
  };

  try {
    const url = `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&gid=${gid}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return NextResponse.json(fallback);
    const text = await res.text();
    const rows = parseCsv(text).filter(r => r.some(c => String(c || '').trim() !== ''));
    if (!rows.length) return NextResponse.json(fallback);

    const headerRow = rows.find(r => r.filter(c => /\d{1,2}\/\d{1,2}\/\d{2,4}/.test((c || '').trim())).length >= 2);
    if (!headerRow) return NextResponse.json(fallback);

    let lastIdx = -1;
    let lastDate = '';
    headerRow.forEach((c, idx) => {
      const v = (c || '').trim();
      if (/\d{1,2}\/\d{1,2}\/\d{2,4}/.test(v)) {
        lastIdx = idx;
        lastDate = v;
      }
    });
    if (lastIdx === -1) return NextResponse.json(fallback);

    const latest: any = {};
    const series: any[] = [];

    headerRow.forEach((c, idx) => {
      const d = (c || '').trim();
      if (/\d{1,2}\/\d{1,2}\/\d{2,4}/.test(d)) {
        let totalValue = 0;
        for (const r of rows) {
          const name = (r[0] || '').trim();
          if (name.toLowerCase() === 'total') {
            totalValue = parseMoney(r[idx] || '');
            break;
          }
        }
        if (totalValue) series.push({ date: d, total: totalValue });
      }
    });

    for (const r of rows) {
      const name = (r[0] || '').trim();
      if (!name) continue;
      latest[name] = parseMoney(r[lastIdx] || '');
    }

    return NextResponse.json({ lastDate, latest, series: series.length ? series : fallback.series });
  } catch {
    return NextResponse.json(fallback);
  }
}
