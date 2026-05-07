'use client';

import { useEffect, useMemo, useState } from 'react';

const news = [
  { cls: 'fs', badge: 'FS', name: 'FS Florestal', text: 'Monitorar pagamentos realizados, saúde do CRA e novas divulgações operacionais.', date: '06/05/2026', time: '15:30' },
  { cls: 'brf', badge: 'BRF', name: 'BRF', text: 'Acompanhar resultados, margens, exportação e percepção de risco da companhia.', date: '06/05/2026', time: '14:10' },
  { cls: 'rz', badge: 'RZ', name: 'Raízen', text: 'Mercado atento ao setor de energia, dívida, reprecificação e notícias de crédito.', date: '06/05/2026', time: '11:45' },
  { cls: 'btc', badge: '₿', name: 'Bitcoin', text: 'Fluxo em ETFs e juros nos EUA continuam guiando o humor do mercado cripto.', date: '06/05/2026', time: '10:20' },
  { cls: 'usd', badge: '$', name: 'Dólar', text: 'Câmbio sensível ao fiscal brasileiro, Selic e movimento do FED.', date: '06/05/2026', time: '09:15' }
];

const weatherDays = [
  ['TER','06','🌧','23°','18°','Chuva'],
  ['QUA','07','🌦','22°','17°','Chove cedo'],
  ['QUI','08','⛅','24°','18°','Pouca chuva'],
  ['SEX','09','☀️','25°','18°','Sem chuva'],
  ['SÁB','10','🌤','26°','19°','Sem chuva'],
  ['DOM','11','🌧','24°','19°','Chuva à tarde'],
  ['SEG','12','⛅','23°','17°','Baixa chance'],
  ['TER','13','🌧','22°','16°','Chuva fraca']
];

const defaultLatest: Record<string, number> = {
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
};

const defaultSeries = [
  { date: '04/05/2026', total: 659199 },
  { date: '24/04/2026', total: 675330 },
  { date: '01/05/2026', total: 745421 },
  { date: '07/05/2026', total: 748949 }
];

function money(v:number){ return new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(v || 0); }
function hideValue(show:boolean, value:string){ return show ? value : '••••••'; }
function buildLine(points:{x:number;y:number}[]) { return points.map((p,i)=>`${i===0?'M':'L'} ${p.x} ${p.y}`).join(' '); }

export default function DashboardClient() {
  const [show, setShow] = useState(true);
  const [sheet, setSheet] = useState<any>(null);

  useEffect(() => {
    fetch('/api/sheet-summary')
      .then(r => r.json())
      .then(setSheet)
      .catch(() => setSheet(null));
  }, []);

  const latest = sheet?.latest || defaultLatest;
  const totalAtual = Number(latest['Total'] || defaultLatest['Total']);
  const fixa = Number(latest['fixa'] || latest['Fixa'] || defaultLatest['fixa']);
  const cript = Number(latest['Cript'] || latest['Cripto'] || defaultLatest['Cript']);
  const invUSA = Number(latest['Investimentos USA'] || defaultLatest['Investimentos USA']);
  const fgts = Number(latest['FGTS'] || defaultLatest['FGTS']);
  const projectionEnd = Math.round(totalAtual * 2.05);
  const aportes = Math.round(totalAtual * 0.42);
  const rendimentos = Math.max(projectionEnd - totalAtual - aportes, 0);
  const series = (sheet?.series && sheet.series.length >= 2) ? sheet.series : defaultSeries;

  const chart = useMemo(() => {
    const max = Math.max(...series.map((s:any)=>Number(s.total)), projectionEnd, 1000000);
    const items = [...series, { date: 'Dez/2027', total: projectionEnd }];
    const aportSeries = items.map((it:any, idx:number)=> ({ date: it.date, total: Number(it.total), aport: Math.round((aportes/(items.length-1))*idx) }));
    const w = 900, h = 290, px = 48, py = 26;
    const uw = w - px*2, uh = h - py*2;
    const map = aportSeries.map((it:any, idx:number)=> {
      const x = px + (uw/(aportSeries.length-1))*idx;
      const y1 = h - py - (it.total/max)*uh;
      const y2 = h - py - (it.aport/max)*uh;
      return {...it, x, y1, y2};
    });
    return { map, main: buildLine(map.map((m:any)=>({x:m.x, y:m.y1}))), sub: buildLine(map.map((m:any)=>({x:m.x, y:m.y2}))) };
  }, [series, projectionEnd, aportes]);

  async function logout() {
    await fetch('/api/logout', { method: 'POST' });
    window.location.reload();
  }

  return (
    <div className="page">
      <aside className="sidebar">
        <div className="logoTop">
          <div className="crest">SCCP</div>
          <div className="brand">JOHNNY DASH</div>
          <div className="brandMini">Foco, disciplina e execução</div>
          <div className="brandMini" style={{marginTop:8}}>Leon S. Kennedy • Futebol • Mercado</div>
        </div>

        <div className="menu">
          <div className="item active"><span className="ico"></span> DASHBOARD</div>
          <div className="item"><span className="ico"></span> PROJEÇÃO</div>
          <div className="item"><span className="ico"></span> CONTROLE</div>
          <div className="item"><span className="ico"></span> NOTÍCIAS</div>
          <div className="item"><span className="ico"></span> MERCADO</div>
          <div className="item"><span className="ico"></span> CLIMA</div>
          <div className="item"><span className="ico"></span> RELATÓRIOS</div>
          <div className="item"><span className="ico"></span> CONFIGURAÇÕES</div>
        </div>

        <div className="sideBottom">
          <strong>Corinthians</strong><br />
          “Disciplina é fazer o que tem que ser feito, mesmo quando você não está motivado.”
        </div>
      </aside>

      <main className="main">
        <section className="hero">
          <div className="heroInner">
            <h1>JOHNNY DASH</h1>
            <p>Foco, disciplina e execução</p>
            <div className="signature">Acompanhamento financeiro diário, estilo premium.</div>
            <div className="topBar" style={{marginTop:16}}>
              <button className="hide" onClick={() => setShow(v => !v)}>{show ? 'Ocultar valores' : 'Mostrar valores'}</button>
              <button className="ghost" onClick={logout}>Sair</button>
            </div>
          </div>
          <div className="water1">S.T.A.R.S.</div>
          <div className="water2"><strong>LEON S. KENNEDY</strong><span>Mission: survive</span></div>
          <div className="ball"></div>
        </section>

        <section className="topStats">
          <div className="card stat"><div className="statIcon">🏦</div><div><div className="kLabel">Patrimônio total</div><div className="kValue">{hideValue(show, money(totalAtual))}</div></div></div>
          <div className="card stat"><div className="statIcon">↗</div><div><div className="kLabel">Aporte total</div><div className="kValue">{hideValue(show, money(aportes))}</div></div></div>
          <div className="card stat"><div className="statIcon">💲</div><div><div className="kLabel">Rendimentos (juros)</div><div className="kValue">{hideValue(show, money(rendimentos))}</div></div></div>
          <div className="card stat"><div className="statIcon">🎯</div><div><div className="kLabel">Projeção Dez/2027</div><div className="kValue">{hideValue(show, money(projectionEnd))}</div></div></div>
        </section>

        <section className="grid">
          <div className="card">
            <div className="titleRow"><h3>Projeção patrimonial até dez/2027</h3></div>
            <div className="legend"><div><span className="lineChip"></span> Patrimônio projetado</div><div><span className="dotChip"></span> Aportes acumulados</div></div>
            <div className="chart">
              <svg viewBox="0 0 900 290" preserveAspectRatio="none">
                <path d={chart.sub} fill="none" stroke="rgba(255,255,255,.72)" strokeWidth="2" strokeDasharray="4 4" />
                <path d={chart.main} fill="none" stroke="#ffffff" strokeWidth="3.2" />
                {chart.map.map((p:any, idx:number)=><circle key={idx} cx={p.x} cy={p.y1} r="4" fill="#fff" />)}
              </svg>
            </div>
            <div className="note">
              Regra: usa sempre a <strong>última coluna com a data mais atual</strong> da aba <strong>updates</strong>.<br />
              Base atual lida da planilha: <strong>{sheet?.lastDate || '07/05/2026'}</strong>.<br />
              Último total detectado: <strong>{hideValue(show, money(totalAtual))}</strong>.
              {sheet?.source ? <><br />Fonte: <strong>{sheet.source}</strong></> : null}
            </div>
          </div>

          <div className="card">
            <div className="titleRow"><h3>Notícias & updates</h3><button className="ghost">Ver todas</button></div>
            <div className="newsList">
              {news.map((n, i) => (
                <div className="news" key={i}>
                  <div className={`badge ${n.cls}`}>{n.badge}</div>
                  <div><h4>{n.name}</h4><p>{n.text}</p></div>
                  <div className="newsTime">{n.date}<br />{n.time}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="stack">
            <div className="card">
              <div className="marketHead"><div className="marketName"><span className="coin btc">₿</span> Bitcoin (BTC)</div><div style={{fontSize:12,color:'#d4d4d4'}}>Variação 24h</div></div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end'}}><div className="marketVal">{show ? '$ 62.743,58' : '••••••'}</div><div className="up">+1,28%</div></div>
              <div className="marketMeta"><div><div style={{fontSize:12,color:'#d4d4d4'}}>Tendência</div><div className="up" style={{fontSize:28}}>ALTA ↑</div></div><div style={{fontSize:12,color:'#ddd',textAlign:'right'}}>Viés positivo<br />curto prazo</div></div>
              <div className="spark"><svg viewBox="0 0 220 58" preserveAspectRatio="none"><path d="M0 46 L15 44 L28 38 L39 36 L52 34 L65 29 L79 32 L94 24 L107 27 L122 18 L137 22 L154 14 L171 16 L188 11 L205 15 L220 6" fill="none" stroke="#1fdb73" strokeWidth="3" /></svg></div>
              <div className="bullets">• Fluxo institucional e ETFs sustentam o viés positivo.<br />• Principal risco: juros altos por mais tempo nos EUA.<br />• Se perder suporte, volatilidade pode aumentar rápido.</div>
            </div>

            <div className="card">
              <div className="marketHead"><div className="marketName"><span className="coin usd">$</span> Dólar (USD/BRL)</div><div style={{fontSize:12,color:'#d4d4d4'}}>Variação 24h</div></div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end'}}><div className="marketVal">{show ? 'R$ 5,08' : '••••••'}</div><div className="down">-0,42%</div></div>
              <div className="marketMeta"><div><div style={{fontSize:12,color:'#d4d4d4'}}>Tendência</div><div className="down" style={{fontSize:28}}>BAIXA ↓</div></div><div style={{fontSize:12,color:'#ddd',textAlign:'right'}}>Viés de alívio<br />curto prazo</div></div>
              <div className="spark"><svg viewBox="0 0 220 58" preserveAspectRatio="none"><path d="M0 14 L15 18 L30 20 L45 23 L60 21 L74 25 L90 28 L104 30 L120 34 L136 37 L152 35 L168 41 L184 43 L201 45 L220 49" fill="none" stroke="#ff5264" strokeWidth="3" /></svg></div>
              <div className="bullets">• Dólar recua quando há maior apetite a risco.<br />• Fiscal brasileiro, Selic e FED continuam dominantes.<br />• Em piora global, o câmbio pode inverter.</div>
            </div>
          </div>
        </section>

        <section className="bottomGrid">
          <div className="card">
            <div className="titleRow"><h3>Gastos por segmento</h3></div>
            <div className="pie"><div className="pieCenter"><div style={{fontSize:12,color:'#d7d7d7'}}>TOTAL</div><div style={{fontWeight:900,fontSize:22}}>{hideValue(show, money(24842.71))}</div></div></div>
            <div className="legendList">
              <div className="legendRow"><span>Casa</span><span>35,8% • R$ 8.897,14</span></div>
              <div className="legendRow"><span>Transporte</span><span>18,7% • R$ 4.652,91</span></div>
              <div className="legendRow"><span>Alimentação</span><span>15,3% • R$ 3.804,33</span></div>
              <div className="legendRow"><span>Lazer</span><span>9,6% • R$ 2.384,22</span></div>
              <div className="legendRow"><span>Saúde</span><span>7,8% • R$ 1.942,11</span></div>
              <div className="legendRow"><span>Educação</span><span>6,2% • R$ 1.537,45</span></div>
              <div className="legendRow"><span>Outros</span><span>6,6% • R$ 1.624,55</span></div>
            </div>
          </div>

          <div className="card">
            <div className="titleRow"><h3>Controle Google Sheets</h3><span className={sheet?.connected ? 'good' : 'warn'}>{sheet?.connected ? '▣ Conectado' : 'Fallback'}</span></div>
            <table className="table">
              <thead><tr><th>Categoria</th><th>Último valor</th></tr></thead>
              <tbody>
                {Object.entries(latest).filter(([k]) => k !== 'Total').slice(0, 10).map(([k,v], i) => (
                  <tr key={i}><td>{k}</td><td>{show ? money(Number(v)) : '••••••'}</td></tr>
                ))}
              </tbody>
            </table>
            <div className="hint">
              <strong>Planilha configurada:</strong><br />
              ID: 1uUV1LzOP5Q68vuPkD8VUVSiSAetv_v2rsPylVO4CWzY<br />
              Aba: <strong>updates</strong> ou GID <strong>1622609470</strong><br />
              Regra: datas na linha superior, categorias na primeira coluna, última data válida como base.
            </div>
          </div>

          <div className="card">
            <div className="titleRow"><h3>Clima - Guarulhos/SP</h3></div>
            <div className="weatherNow">
              <div className="weatherIcon">🌧</div><div><div className="temp">20°C</div><div style={{fontSize:13,color:'#ddd'}}>Chuva fraca agora</div></div>
              <div className="meta">Umidade: 86%<br />Vento: 12 km/h<br />Sensação: 19°C</div>
            </div>
            <div style={{fontSize:13,marginBottom:8}}>Próximos dias, com indicação se chove ou não:</div>
            <div className="forecast">
              {weatherDays.map((d, i) => (
                <div className="day" key={i}><small>{d[0]}<br />{d[1]}</small><div style={{fontSize:18,margin:'4px 0'}}>{d[2]}</div><small>{d[3]} / {d[4]}</small><em>{d[5]}</em></div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="titleRow"><h3>Análise do mercado</h3></div>
            <div className="analysis">
              No cenário atual, os principais pontos para sua carteira são:
              <ul>
                <li><strong>Crédito privado:</strong> acompanhar risco de emissor, pagamentos e eventuais reprecificações.</li>
                <li><strong>Bitcoin:</strong> tendência construtiva, mas com volatilidade elevada.</li>
                <li><strong>Dólar:</strong> pode aliviar no curto prazo, mas fiscal e FED seguem dominantes.</li>
                <li><strong>Projeção:</strong> os aportes mensais continuam sendo o maior motor do crescimento.</li>
              </ul>
              <div>
                <strong>Destaques da última coluna:</strong><br />
                Fixa: {hideValue(show, money(fixa))}<br />
                Cript: {hideValue(show, money(cript))}<br />
                Investimentos USA: {hideValue(show, money(invUSA))}<br />
                FGTS: {hideValue(show, money(fgts))}
              </div>
            </div>
          </div>
        </section>

        <div className="footerQuotes"><div>O sucesso é a soma de pequenos esforços, repetidos dia após dia.</div><div className="mini">S</div><div>Foco no objetivo. Disciplina na rotina. Fé na caminhada.</div></div>
      </main>
    </div>
  );
}
