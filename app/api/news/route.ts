import { NextResponse } from 'next/server';

const topics = [
  { cls: 'fs', badge: 'FS', name: 'FS Florestal', q: 'FS Florestal CRA investimento' },
  { cls: 'brf', badge: 'BRF', name: 'BRF', q: 'BRF ações resultado notícia' },
  { cls: 'rz', badge: 'RZ', name: 'Raízen', q: 'Raízen dívida crédito notícia' },
  { cls: 'btc', badge: '₿', name: 'Bitcoin', q: 'Bitcoin preço tendência mercado hoje' },
  { cls: 'usd', badge: '$', name: 'Dólar', q: 'dólar hoje real tendência mercado' }
];
function decodeXml(s: string) { return (s || '').replace(/<!\[CDATA\[/g, '').replace(/\]\]>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim(); }
function pick(xml: string, tag: string) { const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'); const m = xml.match(re); return decodeXml(m?.[1] || ''); }
async function rss(topic: any) {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(topic.q)}&hl=pt-BR&gl=BR&ceid=BR:pt-419`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) return [];
  const xml = await res.text();
  const itemBlocks = xml.split('<item>').slice(1).map(x => x.split('</item>')[0]).slice(0, 2);
  return itemBlocks.map(block => {
    const title = pick(block, 'title'), link = pick(block, 'link'), pubDate = pick(block, 'pubDate'), source = pick(block, 'source');
    return { cls: topic.cls, badge: topic.badge, name: topic.name, title, text: source ? `Fonte: ${source}` : 'Clique para ler a matéria original.', date: pubDate ? new Date(pubDate).toLocaleDateString('pt-BR') : '', link };
  });
}
export async function GET() {
  try { return NextResponse.json({ items: (await Promise.all(topics.map(rss))).flat().slice(0, 8) }); }
  catch { return NextResponse.json({ items: [] }); }
}
