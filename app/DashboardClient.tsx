'use client';

import { useEffect, useMemo, useState } from 'react';

const fallbackNews = [
  { cls: 'fs', badge: 'FS', name: 'FS Florestal', title: 'Monitoramento FS Florestal', text: 'Monitorar pagamentos realizados, saúde do CRA e novas divulgações operacionais.', date: '06/05/2026', link: '#' },
  { cls: 'brf', badge: 'BRF', name: 'BRF', title: 'Monitoramento BRF', text: 'Acompanhar resultados, margens, exportação e percepção de risco da companhia.', date: '06/05/2026', link: '#' },
  { cls: 'rz', badge: 'RZ', name: 'Raízen', title: 'Monitoramento Raízen', text: 'Mercado atento ao setor de energia, dívida, reprecificação e notícias de crédito.', date: '06/05/2026', link: '#' }
];

const weatherDays = [
  ['TER','06','🌧','23°','18°','Chuva'],['QUA','07','🌦','22°','17°','Chove cedo'],['QUI','08','⛅','24°','18°','Pouca chuva'],['SEX','09','☀️','25°','18°','Sem chuva'],
  ['SÁB','10','🌤','26°','19°','Sem chuva'],['DOM','11','🌧','24°','19°','Chuva à tarde'],['SEG','12','⛅','23°','17°','Baixa chance'],['TER','13','🌧','22°','16°','Chuva fraca']
];

const defaultLatest: Record<string, number> = {
  'Ações': 243, 'Saldo Corretora': 11405, 'fundo invest': 155442, 'COE': 12384, 'VGBL': 61306,
  'fixa': 300406, 'Cofre': 0, 'FGTS': 91166, 'Investimentos USA': 97327, 'MOEDAS (EURO)': 1855,
  'Cript': 17415, 'Total': 748949
};

const defaultProjection = [
  { month: 'Mai/26', total: 748949, contribution: 0, monthlyContribution: 0, segments: defaultLatest },
  { month: 'Jun/26', total: 756801, contribution: 0, monthlyContribution: 0, segments: defaultLatest },
  { month: 'Jul/26', total: 764744, contribution: 0, monthlyContribution: 0, segments: defaultLatest },
  { month: 'Ago/26', total: 772781, contribution: 0, monthlyContribution: 0, segments: defaultLatest },
  { month: 'Set/26', total: 780913, contribution: 0, monthlyContribution: 0, segments: defaultLatest },
  { month: 'Out/26', total: 789143, contribution: 0, monthlyContribution: 0, segments: defaultLatest },
  { month: 'Nov/26', total: 797472, contribution: 0, monthlyContribution: 0, segments: defaultLatest },
  { month: 'Dez/26', total: 805902, contribution: 0, monthlyContribution: 0, segments: defaultLatest },
  { month: 'Mar/27', total: 832000, contribution: 0, monthlyContribution: 0, segments: defaultLatest },
  { month: 'Jun/27', total: 860000, contribution: 0, monthlyContribution: 0, segments: defaultLatest },
  { month: 'Set/27', total: 889000, contribution: 0, monthlyContribution: 0, segments: defaultLatest },
  { month: 'Dez/27', total: 920000, contribution: 0, monthlyContribution: 0, segments: defaultLatest }
];

function money(v:number){ return new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(v || 0); }
function usd(v:number){ return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(v || 0); }
function hideInvestment(show:boolean, value:string){ return show ? value : '••••••'; }
function buildLine(points:{x:number;y:number}[]) { return points.map((p,i)=>`${i===0?'M':'L'} ${p.x} ${p.y}`).join(' '); }
function topSegments(obj:any) { if (!obj) return []; return Object.entries(obj).filter(([k]) => k !== 'Total').map(([k,v]) => [k, Number(v || 0)] as [string, number]).sort((a,b)=>b[1]-a[1]).slice(0,6); }
function trendClass(t:string) { if ((t || '').toLowerCase().includes('alta')) return 'up'; if ((t || '').toLowerCase().includes('baixa')) return 'down'; return 'neutral'; }

export default function DashboardClient() {
  const [show, setShow] = useState(true);
  const [sheet, setSheet] = useState<any>(null);
  const [market, setMarket] = useState<any>(null);
  const [news, setNews] = useState<any[]>(fallbackNews);
  const [hover, setHover] = useState<any>(null);

  useEffect(() => {
    fetch('/api/sheet-summary').then(r => r.json()).then(setSheet).catch(() => setSheet(null));
    fetch('/api/market').then(r => r.json()).then(setMarket).catch(() => setMarket(null));
    fetch('/api/news').then(r => r.json()).then(data => setNews(data?.items?.length ? data.items : fallbackNews)).catch(() => setNews(fallbackNews));
  }, []);

  const latest = sheet?.latest || defaultLatest;
  const projection = sheet?.projection?.length ? sheet.projection : defaultProjection;
  const rates = sheet?.rates || {};
  const categoryProjection = sheet?.categoryProjection || [];
  const latestTotal = Number(latest['Total'] || 748949);
  const totalAtual = Number(sheet?.officialTotal || latestTotal || 748949);
  const lastProjection = projection[projection.length - 1] || defaultProjection[defaultProjection.length - 1];
  const projectionEnd = Number(lastProjection.total || totalAtual);
  const aportes = Number(lastProjection.contribution || 0);
  const rendimentos = Math.max(projectionEnd - totalAtual - aportes, 0);

  const btc = market?.bitcoin || { priceUsd: 0, change24h: 0, trend: 'Neutra', summary: 'Carregando leitura online...' };
  const dollar = market?.dollar || { bid: 0, pctChange: 0, high: 0, low: 0, trend: 'Neutra', summary: 'Carregando leitura online...' };

  const chart = useMemo(() => {
    const max = Math.max(...projection.map((s:any)=>Number(s.total)), totalAtual, 1000000) * 1.08;
    const w = 900, h = 330, px = 55, py = 30, uw = w - px*2, uh = h - py*2;
    const map = projection.map((it:any, idx:number)=> {
      const x = px + (uw/(projection.length-1))*idx;
      const y1 = h - py - (Number(it.total)/max)*uh;
      const y2 = h - py - (Number(it.contribution || 0)/max)*uh;
      return {...it, x, y1, y2};
    });
    const ticks = [0,.25,.5,.75,1].map(t => ({ value: max*t, y: h - py - t*uh }));
    return { map, main: buildLine(map.map((m:any)=>({x:m.x,y:m.y1}))), sub: buildLine(map.map((m:any)=>({x:m.x,y:m.y2}))), ticks };
  }, [projection, totalAtual]);

  function onChartMove(e:any) {
    const rect = e.currentTarget.getBoundingClientRect();
    const rel = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const idx = Math.max(0, Math.min(chart.map.length - 1, Math.round((rel / rect.width) * (chart.map.length - 1))));
    const point = chart.map[idx];
    setHover({ ...point, left: (point.x / 900) * rect.width, top: (point.y1 / 330) * rect.height });
  }

  async function logout() { await fetch('/api/logout', { method: 'POST' }); window.location.reload(); }

  return (
    <div className="page">
      <aside className="sidebar">
        <div className="logoTop">
          <div className="logoBadge">
            <img src="/assets/corinthians-real.png" alt="Corinthians badge" />
            <div>
              <div className="brand">JOHNNY DASH</div>
              <div className="brandMini">Foco, disciplina e execução</div>
            </div>
          </div>
          <div className="brandMini" style={{marginTop:8}}>Leon S. Kennedy • Futebol • Mercado</div>
        </div>
        <div className="menu">
          <div className="item active"><span className="ico"></span> DASHBOARD</div><div className="item"><span className="ico"></span> PROJEÇÃO</div><div className="item"><span className="ico"></span> CONTROLE</div><div className="item"><span className="ico"></span> NOTÍCIAS</div><div className="item"><span className="ico"></span> MERCADO</div><div className="item"><span className="ico"></span> CLIMA</div><div className="item"><span className="ico"></span> RELATÓRIOS</div><div className="item"><span className="ico"></span> CONFIGURAÇÕES</div>
        </div>
        <div className="sidebarTheme">
          <div className="sidebarThemeRow"><img src="/assets/corinthians-real.png" alt="Corinthians" /><span>Corinthians, identidade e raça</span></div>
          <div className="sidebarThemeRow"><img src="/assets/leon-real.jpg" alt="Leon, Resident Evil" /><span>Leon S. Kennedy, estética tática</span></div>
          <div className="sidebarThemeRow"><img src="/assets/gow-omega.jpg" alt="God of War" /><span>God of War, força e presença épica</span></div>
        </div>
        <div className="sideBottom"><strong>Corinthians</strong><br />“Disciplina é fazer o que tem que ser feito, mesmo quando você não está motivado.”</div>
      </aside>

      <main className="main">
        <section className="hero heroReal">
          <div className="nerdStage">
            <img className="heroBgWide" src="/assets/gow-ragnarok.jpg" alt="God of War Ragnarök background" />
            <img className="watermarkImg watermarkBioReal" src="/assets/leon-real.jpg" alt="Leon S. Kennedy" />
            <img className="watermarkImg watermarkBallReal" src="/assets/gow-omega.jpg" alt="God of War Omega symbol" />
            <img className="watermarkImg watermarkWarReal" src="/assets/gow-valhalla.webp" alt="God of War Valhalla" />
            <img className="watermarkImg watermarkCorReal" src="/assets/corinthians-real.png" alt="Corinthians" />
          </div>
          <div className="heroSplit">
            <div className="heroInner">
              <div className="logoBadge realBadge">
                <img src="/assets/corinthians-real.png" alt="Corinthians" />
                <div>
                  <h1>JOHNNY DASH</h1>
                  <p>Foco, disciplina e execução</p>
                </div>
              </div>
              <div className="signature">Dashboard pessoal — mercado, patrimônio, futebol e cultura.</div>
              <div className="nerdChips">
                <div className="nerdChip">Corinthians</div>
                <div className="nerdChip">Leon S. Kennedy</div>
                <div className="nerdChip">Resident Evil</div>
                <div className="nerdChip">God of War</div>
                <div className="nerdChip">Ragnarök</div>
              </div>
              <div style={{display:'flex',alignItems:'center',marginTop:14,gap:10,flexWrap:'wrap'}}>
                <button className="hide" onClick={() => setShow(v => !v)}>{show ? 'Ocultar valores' : 'Mostrar valores'}</button>
                <button className="ghost" onClick={logout}>Sair</button>
              </div>
            </div>
            <div className="heroArtWrap">
              <div className="heroArtCard realHeroCard">
                <img src="/assets/leon-real.jpg" alt="Leon S. Kennedy" />
                <div className="cornerBadge badgeCorinthians"><img src="/assets/corinthians-real.png" alt="Corinthians" /><div><strong>Corinthians</strong><span>Minha identidade</span></div></div>
                <div className="cornerBadge badgeWar"><img src="/assets/gow-omega.jpg" alt="God of War" /><div><strong>God of War</strong><span>Força e foco</span></div></div>
              </div>
            </div>
          </div>
          <div className="water2"><strong>LEON S. KENNEDY</strong><span>Mission: survive</span></div>
        </section>

        <section className="topStats">
          <div className="card stat"><div className="statIcon">🏦</div><div><div className="kLabel">Patrimônio total hoje</div><div className="kValue">{hideInvestment(show, money(totalAtual))}</div></div></div>
          <div className="card stat"><div className="statIcon">↗</div><div><div className="kLabel">Aportes Forecast</div><div className="kValue">{hideInvestment(show, money(aportes))}</div></div></div>
          <div className="card stat"><div className="statIcon">💲</div><div><div className="kLabel">Valorização estimada</div><div className="kValue">{hideInvestment(show, money(rendimentos))}</div></div></div>
          <div className="card stat"><div className="statIcon">🎯</div><div><div className="kLabel">Projeção Dez/2027</div><div className="kValue">{hideInvestment(show, money(projectionEnd))}</div></div></div>
        </section>

        <section className="grid">
          <div className="card">
            <div className="titleRow"><h3>Projeção patrimonial dinâmica até dez/2027</h3></div>
            <div className="legend"><div><span className="lineChip"></span> Patrimônio projetado por categoria</div><div><span className="dotChip"></span> Aportes Forecast</div><div><span className="segChip"></span> Tooltip ao passar o mouse</div></div>
            <div className="chart" onMouseMove={onChartMove} onMouseLeave={() => setHover(null)}>
              <svg viewBox="0 0 900 330" preserveAspectRatio="none">
                {chart.ticks.map((t:any,i:number)=><g key={i}><line x1="48" x2="870" y1={t.y} y2={t.y} stroke="rgba(255,255,255,.06)" /><text x="8" y={t.y+4} className="axisText">{show ? `${Math.round(t.value/1000)}k` : ''}</text></g>)}
                <path d={chart.sub} fill="none" stroke="rgba(255,255,255,.72)" strokeWidth="2" strokeDasharray="4 4" />
                <path d={chart.main} fill="none" stroke="#ffffff" strokeWidth="3.2" />
                {chart.map.map((p:any,idx:number)=><circle key={idx} cx={p.x} cy={p.y1} r={hover?.month===p.month?6:4} fill="#fff" />)}
                {chart.map.filter((_:any,i:number)=>i===0||i===Math.floor(chart.map.length/2)||i===chart.map.length-1).map((p:any,i:number)=><text key={i} x={p.x-18} y="318" className="axisText">{p.month}</text>)}
              </svg>
              {hover && <div className="tooltip" style={{left:Math.min(hover.left+10,520),top:Math.max(hover.top-30,10)}}><div className="tipTitle">{hover.month}</div><div className="tipRow"><span>Patrimônio</span><strong>{show?money(Number(hover.total)):'••••••'}</strong></div><div className="tipRow"><span>Aporte acumulado</span><strong>{show?money(Number(hover.contribution||0)):'••••••'}</strong></div><div className="tipRow"><span>Aporte do mês</span><strong>{show?money(Number(hover.monthlyContribution||0)):'••••••'}</strong></div><div style={{marginTop:8,color:'#bbb'}}>Principais categorias:</div>{topSegments(hover.segments).map(([k,v]:any,idx:number)=><div className="tipRow" key={idx}><span>{k}</span><strong>{show?money(Number(v)):'••••••'}</strong></div>)}</div>}
            </div>
            <div className="note">A base oficial agora aparece como <strong>{hideInvestment(show, money(totalAtual))}</strong>, incluindo FGTS e proposta quando vierem no Total da planilha. A projeção usa 4% ao ano para Investimentos USA, 3% ao ano para FGTS e considera aporte mensal de R$ 2.700 no FGTS. Ao ocultar, os valores do eixo do gráfico também somem.</div>
          </div>

          <div className="card">
            <div className="titleRow"><h3>Notícias & links</h3><button className="ghost">Online</button></div>
            <div className="newsList">{news.slice(0,5).map((n:any,i:number)=><div className="news" key={i}><div className={`badge ${n.cls||'fs'}`}>{n.badge||'N'}</div><div><h4>{n.name||n.source}</h4><p>{n.title||n.text}</p>{n.link?<a className="newsLink" href={n.link} target="_blank" rel="noreferrer">Abrir matéria ↗</a>:null}</div><div className="newsTime">{n.date||''}</div></div>)}</div>
          </div>

          <div className="stack">
            <div className="card"><div className="marketHead"><div className="marketName"><span className="coin btc">₿</span> Bitcoin (BTC)</div><div style={{fontSize:12,color:'#d4d4d4'}}>Variação 24h</div></div><div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end'}}><div className="marketVal">{usd(Number(btc.priceUsd))}</div><div className={Number(btc.change24h)>=0?'up':'down'}>{Number(btc.change24h||0).toFixed(2)}%</div></div><div className="marketMeta"><div><div style={{fontSize:12,color:'#d4d4d4'}}>Tendência</div><div className={trendClass(btc.trend)} style={{fontSize:28}}>{String(btc.trend||'Neutra').toUpperCase()}</div></div><div style={{fontSize:12,color:'#ddd',textAlign:'right'}}>Atualização<br />online</div></div><div className="spark"><svg viewBox="0 0 220 58" preserveAspectRatio="none"><path d={btc.sparkPath||"M0 40 L25 36 L50 31 L75 35 L100 25 L125 27 L150 18 L175 20 L200 14 L220 10"} fill="none" stroke={Number(btc.change24h)>=0?'#1fdb73':'#ff5264'} strokeWidth="3" /></svg></div><div className="bullets">{btc.summary}</div></div>

            <div className="card"><div className="marketHead"><div className="marketName"><span className="coin usd">$</span> Dólar (USD/BRL)</div><div style={{fontSize:12,color:'#d4d4d4'}}>Variação 24h</div></div><div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end'}}><div className="marketVal">R$ {Number(dollar.bid||0).toFixed(2).replace('.',',')}</div><div className={Number(dollar.pctChange)>=0?'up':'down'}>{Number(dollar.pctChange||0).toFixed(2)}%</div></div><div className="marketMeta"><div><div style={{fontSize:12,color:'#d4d4d4'}}>Tendência</div><div className={trendClass(dollar.trend)} style={{fontSize:28}}>{String(dollar.trend||'Neutra').toUpperCase()}</div></div><div style={{fontSize:12,color:'#ddd',textAlign:'right'}}>High/Low<br />R$ {Number(dollar.high||0).toFixed(2)} / R$ {Number(dollar.low||0).toFixed(2)}</div></div><div className="spark"><svg viewBox="0 0 220 58" preserveAspectRatio="none"><path d={dollar.sparkPath||"M0 14 L25 18 L50 24 L75 26 L100 30 L125 35 L150 34 L175 40 L200 44 L220 46"} fill="none" stroke={Number(dollar.pctChange)>=0?'#1fdb73':'#ff5264'} strokeWidth="3" /></svg></div><div className="bullets">{dollar.summary}</div></div>
          </div>
        </section>

        <section className="wideGrid">
          <div className="card">
            <div className="titleRow"><h3>Projeção por categoria até Dez/2027</h3><span className={sheet?.connected?'good':'warn'}>{sheet?.connected?'▣ Dados da planilha':'Fallback'}</span></div>
            <table className="table"><thead><tr><th>Categoria</th><th>Hoje</th><th>Taxa mensal</th><th>Dez/2027</th><th>Crescimento</th></tr></thead><tbody>{categoryProjection.slice(0,12).map((r:any,i:number)=><tr key={i}><td>{r.name}</td><td>{show?money(Number(r.current)):'••••••'}</td><td>{(Number(r.monthlyRate)*100).toFixed(2)}%</td><td>{show?money(Number(r.endValue)):'••••••'}</td><td>{show?money(Number(r.growth)):'••••••'}</td></tr>)}</tbody></table>
            <div className="hint">Premissas: Investimentos USA em 4% ao ano, FGTS em 3% ao ano + R$ 2.700/mês, renda fixa/fundos/VGBL/COE conservadores, Cript limitada para não distorcer a projeção.</div>
          </div>

          <div className="card">
            <div className="titleRow"><h3>Controle Google Sheets, soma oficial</h3><span className={sheet?.connected?'good':'warn'}>{sheet?.connected?'▣ Conectado':'Fallback'}</span></div>
            <div className="totalBox"><div className="kLabel">Total atual, inclui FGTS e proposta quando estiverem no Total</div><strong>{hideInvestment(show, money(totalAtual))}</strong><div className="note">Esse é o número que você citou: <strong>R$ 748.949</strong>. Agora ele aparece explicitamente no dashboard.</div></div>
            <table className="table"><thead><tr><th>Categoria</th><th>Último valor</th><th>% do total</th></tr></thead><tbody>{Object.entries(latest).filter(([k])=>k!=='Total').slice(0,12).map(([k,v],i)=><tr key={i}><td>{k}</td><td>{show?money(Number(v)):'••••••'}</td><td>{totalAtual?((Number(v)/totalAtual)*100).toFixed(1):'0.0'}%</td></tr>)}</tbody></table>
          </div>
        </section>

        <section className="miniThemedGrid">
          <div className="card themeCard realCard"><h4>Corinthians</h4><p>Escudo real aplicado na identidade do dashboard, com presença visual mais forte e premium.</p><img src="/assets/corinthians-real.png" alt="Corinthians themed card" /></div>
          <div className="card themeCard realCard"><h4>Resident Evil</h4><p>Leon como destaque principal, trazendo o clima tático e sombrio que você pediu.</p><img src="/assets/leon-real.jpg" alt="Resident Evil themed card" /></div>
          <div className="card themeCard realCard"><h4>God of War</h4><p>Elementos de Ragnarök e Valhalla como apoio visual, com o símbolo ômega como detalhe de impacto.</p><img src="/assets/gow-omega.jpg" alt="God of War themed card" /></div>
        </section>

        <section className="bottomGrid">
          <div className="card"><div className="titleRow"><h3>Aportes Forecast</h3></div><table className="table"><thead><tr><th>Mês</th><th>Aporte</th></tr></thead><tbody>{(sheet?.forecastContributions||[]).slice(0,8).map((a:any,i:number)=><tr key={i}><td>{a.month}</td><td>{show?money(Number(a.value)):'••••••'}</td></tr>)}</tbody></table><div className="hint">Aba Forecast, linha 10, sempre do mês seguinte em diante.</div></div>

          <div className="card"><div className="titleRow"><h3>Taxas médias por categoria</h3></div><table className="table"><thead><tr><th>Categoria</th><th>Taxa usada</th></tr></thead><tbody>{Object.entries(rates).slice(0,9).map(([k,v],i)=><tr key={i}><td>{k}</td><td>{(Number(v)*100).toFixed(2)}%</td></tr>)}</tbody></table></div>

          <div className="card"><div className="titleRow"><h3>Clima - Guarulhos/SP</h3></div><div className="weatherNow"><div className="weatherIcon">🌧</div><div><div className="temp">20°C</div><div style={{fontSize:13,color:'#ddd'}}>Chuva fraca agora</div></div><div className="meta">Umidade: 86%<br />Vento: 12 km/h<br />Sensação: 19°C</div></div><div className="forecast">{weatherDays.map((d,i)=><div className="day" key={i}><small>{d[0]}<br />{d[1]}</small><div style={{fontSize:18,margin:'4px 0'}}>{d[2]}</div><small>{d[3]} / {d[4]}</small><em>{d[5]}</em></div>)}</div></div>

          <div className="card"><div className="titleRow"><h3>Análise do mercado</h3></div><div className="analysis"><ul><li><strong>Projeção:</strong> agora todos os segmentos recebem uma premissa conservadora.</li><li><strong>Investimentos USA:</strong> incluídos na projeção com taxa mensal conservadora.</li><li><strong>FGTS:</strong> mantido como parte do patrimônio, com crescimento moderado.</li><li><strong>Cript:</strong> crescimento limitado para não distorcer a projeção.</li></ul></div></div>
        </section>

        <div className="footerQuotes"><div>O sucesso é a soma de pequenos esforços, repetidos dia após dia.</div><div className="mini">S</div><div>Foco no objetivo. Disciplina na rotina. Fé na caminhada.</div></div>
      </main>
    </div>
  );
}
