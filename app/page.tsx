'use client';

import { useMemo, useState } from 'react';

const projectionPoints = [
  { label: 'Mai/26', p: 480000, a: 210000 },
  { label: 'Jun/26', p: 560000, a: 235000 },
  { label: 'Jul/26', p: 615000, a: 260000 },
  { label: 'Ago/26', p: 690000, a: 285000 },
  { label: 'Set/26', p: 770000, a: 305000 },
  { label: 'Out/26', p: 860000, a: 332000 },
  { label: 'Nov/26', p: 910000, a: 355000 },
  { label: 'Dez/26', p: 980000, a: 382000 },
  { label: 'Mar/27', p: 1120000, a: 445000 },
  { label: 'Jun/27', p: 1290000, a: 500000 },
  { label: 'Set/27', p: 1460000, a: 532000 },
  { label: 'Dez/27', p: 1842618, a: 568792 }
];

const news = [
  { badge: 'FS', name: 'FS Florestal', text: 'Monitorar crescimento do fluxo de caixa do CRA, notícias de pagamentos realizados e novos informes de crédito.', date: '06/05/2026', time: '15:30' },
  { badge: 'BRF', name: 'BRF', text: 'Acompanhar resultado trimestral, exportações, margens e atualização de distribuição de dividendos.', date: '06/05/2026', time: '14:10' },
  { badge: 'RZ', name: 'Raízen', text: 'Atenção ao setor de energia, endividamento, crédito e qualquer reprecificação ligada aos títulos acompanhados.', date: '06/05/2026', time: '11:45' },
  { badge: '₿', name: 'Bitcoin', text: 'Subiu com fluxo institucional e leitura de eventual corte de juros nos EUA, mas ainda com volatilidade elevada.', date: '06/05/2026', time: '10:20' },
  { badge: '$', name: 'Dólar', text: 'Oscila com fiscal brasileiro, expectativa de juros americanos e fluxo estrangeiro para emergentes.', date: '06/05/2026', time: '09:15' }
];

const costRows = [
  ['06/05/2026','Supermercado','Alimentação','387,64'],
  ['06/05/2026','Combustível','Transporte','250,00'],
  ['05/05/2026','Conta de Luz','Casa','198,72'],
  ['05/05/2026','Academia','Saúde','129,90'],
  ['04/05/2026','Netflix','Lazer','55,90'],
  ['04/05/2026','Curso Online','Educação','89,90'],
  ['03/05/2026','Restaurantes','Alimentação','143,60']
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

function currency(show: boolean, value: string) {
  return show ? value : '••••••';
}

function buildLine(points: {x:number;y:number}[]) {
  return points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
}

export default function Home() {
  const [show, setShow] = useState(true);

  const chart = useMemo(() => {
    const w = 900;
    const h = 285;
    const padX = 48;
    const padY = 28;
    const maxY = 2000000;
    const usableW = w - padX * 2;
    const usableH = h - padY * 2;

    const mapped = projectionPoints.map((item, idx) => {
      const x = padX + (usableW / (projectionPoints.length - 1)) * idx;
      const y1 = h - padY - (item.p / maxY) * usableH;
      const y2 = h - padY - (item.a / maxY) * usableH;
      return { ...item, x, y1, y2 };
    });

    return {
      projected: buildLine(mapped.map(m => ({x: m.x, y: m.y1}))),
      aporte: buildLine(mapped.map(m => ({x: m.x, y: m.y2}))),
      mapped
    };
  }, []);

  return (
    <div className="page">
      <aside className="sidebar">
        <div className="brandBlock">
          <div className="crest">SCCP</div>
          <h1 className="brandTitle">JOHNNY DASH</h1>
          <div className="brandSub">Foco, disciplina e execução</div>
          <div className="heroSign">Johnny Oliveira</div>
        </div>

        <nav className="menu">
          <div className="menuItem active"><span className="menuIcon"></span> DASHBOARD</div>
          <div className="menuItem"><span className="menuIcon"></span> PROJEÇÃO</div>
          <div className="menuItem"><span className="menuIcon"></span> CONTROLE</div>
          <div className="menuItem"><span className="menuIcon"></span> NOTÍCIAS</div>
          <div className="menuItem"><span className="menuIcon"></span> MERCADO</div>
          <div className="menuItem"><span className="menuIcon"></span> CLIMA</div>
          <div className="menuItem"><span className="menuIcon"></span> RELATÓRIOS</div>
          <div className="menuItem"><span className="menuIcon"></span> CONFIGURAÇÕES</div>
        </nav>

        <div className="sidebarQuote">
          <strong>CORINTHIANS</strong>
          <div style={{marginTop: 10}}>“Disciplina é fazer o que tem que ser feito, mesmo quando você não está motivado.”</div>
        </div>
      </aside>

      <main className="content">
        <section className="hero">
          <div className="heroLeft">
            <h1 className="heroTitle">JOHNNY DASH</h1>
            <div className="heroSubtitle">Foco, disciplina e execução</div>
            <div className="heroSign">Modo premium, visão financeira diária</div>

            <div style={{marginTop: 18}}>
              <button className="hideBtn" onClick={() => setShow(v => !v)}>
                {show ? 'Ocultar valores' : 'Mostrar valores'}
              </button>
            </div>

            <div className="markStars">S.T.A.R.S.</div>
            <div className="markLeon">
              <div className="leonName">LEON S. KENNEDY</div>
              <div className="leonSub">Mission: survive</div>
            </div>
            <div className="ball"></div>
          </div>
        </section>

        <section className="topCards">
          <div className="card statCard">
            <div className="statIcon">🏦</div>
            <div>
              <div className="cardLabel">Patrimônio Total</div>
              <div className="bigValue">{currency(show, 'R$ 1.248.732,89')}</div>
            </div>
          </div>
          <div className="card statCard">
            <div className="statIcon">↗</div>
            <div>
              <div className="cardLabel">Aporte Total</div>
              <div className="bigValue">{currency(show, 'R$ 309.850,00')}</div>
            </div>
          </div>
          <div className="card statCard">
            <div className="statIcon">💲</div>
            <div>
              <div className="cardLabel">Rendimentos (Juros)</div>
              <div className="bigValue">{currency(show, 'R$ 278.942,89')}</div>
            </div>
          </div>
          <div className="card statCard">
            <div className="statIcon">🎯</div>
            <div>
              <div className="cardLabel">Projeção Dez/2027</div>
              <div className="bigValue">{currency(show, 'R$ 1.842.618,35')}</div>
            </div>
          </div>
        </section>

        <section className="layoutGrid">
          <div className="card">
            <div className="cardTitle">
              <h3>Projeção patrimonial até dez/2027</h3>
            </div>
            <div className="chartLegend">
              <div><span className="legendLine"></span> Patrimônio projetado</div>
              <div><span className="legendDot"></span> Aportes acumulados</div>
            </div>

            <div className="chartWrap">
              <svg className="chartSvg" viewBox="0 0 900 285" preserveAspectRatio="none">
                <path d={chart.aporte} fill="none" stroke="rgba(255,255,255,.72)" strokeWidth="2" strokeDasharray="3 4" />
                <path d={chart.projected} fill="none" stroke="#ffffff" strokeWidth="3.2" />
                {chart.mapped.map((p, idx) => (
                  <g key={idx}>
                    <circle cx={p.x} cy={p.y1} r="4" fill="#fff" />
                  </g>
                ))}
              </svg>
            </div>

            <div className="chartNote">
              Projeção considerando aportes mensais, juros compostos, custos da planilha e variações médias da carteira.
              <br />
              Detalhe: patrimônio projetado termina em <strong>{currency(show, 'R$ 1.842.618')}</strong> e aportes acumulados em <strong>{currency(show, 'R$ 568.792')}</strong>.
            </div>
          </div>

          <div className="card">
            <div className="cardTitle">
              <h3>Notícias & updates</h3>
              <button className="ghostBtn">Ver todas</button>
            </div>
            <div className="newsList">
              {news.map((item, idx) => (
                <div className="newsItem" key={idx}>
                  <div className="newsBadge">{item.badge}</div>
                  <div>
                    <div className="newsName">{item.name}</div>
                    <div className="newsDesc">{item.text}</div>
                  </div>
                  <div className="newsTime">
                    {item.date}<br />{item.time}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="sideStack">
            <div className="card marketCard">
              <div className="marketHeader">
                <div className="coinName"><span className="coinDot btc">₿</span> Bitcoin (BTC)</div>
                <div className="kpiLabel">Variação 24h</div>
              </div>
              <div className="rowBetween">
                <div className="marketValue">{currency(show, '$ 62.743,58')}</div>
                <div className="trendUp">+1,28%</div>
              </div>
              <div className="rowBetween">
                <div>
                  <div className="kpiLabel">Tendência</div>
                  <div className="trendUp" style={{fontSize: 28}}>ALTA ↑</div>
                </div>
                <div style={{fontSize: 12, color: '#ddd', textAlign: 'right'}}>
                  Viés positivo<br />curto prazo
                </div>
              </div>
              <div className="spark">
                <svg viewBox="0 0 220 58" preserveAspectRatio="none">
                  <path d="M0 46 L15 44 L28 38 L39 36 L52 34 L65 29 L79 32 L94 24 L107 27 L122 18 L137 22 L154 14 L171 16 L188 11 L205 15 L220 6" fill="none" stroke="#1fdc6d" strokeWidth="3" />
                </svg>
              </div>
              <div className="marketBullets">
                • Fluxo institucional segue relevante por ETFs.<br />
                • Mercado ainda sensível a juros dos EUA e liquidez global.<br />
                • Se perder suporte, volatilidade pode aumentar rapidamente.
              </div>
            </div>

            <div className="card marketCard">
              <div className="marketHeader">
                <div className="coinName"><span className="coinDot usd">$</span> Dólar (USD/BRL)</div>
                <div className="kpiLabel">Variação 24h</div>
              </div>
              <div className="rowBetween">
                <div className="marketValue">{currency(show, 'R$ 5,08')}</div>
                <div className="trendDown">-0,42%</div>
              </div>
              <div className="rowBetween">
                <div>
                  <div className="kpiLabel">Tendência</div>
                  <div className="trendDown" style={{fontSize: 28}}>BAIXA ↓</div>
                </div>
                <div style={{fontSize: 12, color: '#ddd', textAlign: 'right'}}>
                  Viés de alívio<br />curto prazo
                </div>
              </div>
              <div className="spark">
                <svg viewBox="0 0 220 58" preserveAspectRatio="none">
                  <path d="M0 14 L15 18 L30 20 L45 23 L60 21 L74 25 L90 28 L104 30 L120 34 L136 37 L152 35 L168 41 L184 43 L201 45 L220 49" fill="none" stroke="#ff4d5f" strokeWidth="3" />
                </svg>
              </div>
              <div className="marketBullets">
                • Dólar recua com expectativa de inflação mais comportada.<br />
                • Fiscal brasileiro e decisão do FED ainda dominam a tendência.<br />
                • Movimento pode inverter se o risco global apertar.
              </div>
            </div>
          </div>
        </section>

        <section className="bottomGrid">
          <div className="card">
            <div className="cardTitle"><h3>Gastos por segmento (mês atual)</h3></div>
            <div className="pie">
              <div className="pieCenter">
                <div style={{fontSize: 12, color: '#d7d7d7'}}>TOTAL</div>
                <div style={{fontWeight: 900, fontSize: 22}}>{currency(show, 'R$ 24.842,71')}</div>
              </div>
            </div>
            <div className="segmentLegend">
              <div className="segmentItem"><span>Casa</span><span>35,8% • R$ 8.897,14</span></div>
              <div className="segmentItem"><span>Transporte</span><span>18,7% • R$ 4.652,91</span></div>
              <div className="segmentItem"><span>Alimentação</span><span>15,3% • R$ 3.804,33</span></div>
              <div className="segmentItem"><span>Lazer</span><span>9,6% • R$ 2.384,22</span></div>
              <div className="segmentItem"><span>Saúde</span><span>7,8% • R$ 1.942,11</span></div>
              <div className="segmentItem"><span>Educação</span><span>6,2% • R$ 1.537,45</span></div>
              <div className="segmentItem"><span>Outros</span><span>6,6% • R$ 1.624,55</span></div>
            </div>
          </div>

          <div className="card">
            <div className="cardTitle">
              <h3>Controle de custos (Google Sheets)</h3>
              <span className="okTag">▣ Conectado</span>
            </div>
            <table className="table">
              <thead>
                <tr><th>Data</th><th>Descrição</th><th>Segmento</th><th>Valor (R$)</th></tr>
              </thead>
              <tbody>
                {costRows.map((row, idx) => (
                  <tr key={idx}>{row.map((col, idy) => <td key={idy}>{col}</td>)}</tr>
                ))}
              </tbody>
            </table>

            <div className="sheetHint">
              <strong>Formato que eu preciso dos seus investimentos na planilha:</strong><br />
              1. Aba <strong>investimentos</strong> com colunas: <strong>Tipo | Ativo | Código | Data da Compra | Valor Atual | Aporte Mensal | Rentabilidade | Observação</strong><br />
              2. Aba <strong>custos</strong> com colunas: <strong>Data | Descrição | Segmento | Valor</strong><br />
              3. Aba <strong>metas</strong> com colunas: <strong>Objetivo | Valor Alvo | Data Alvo</strong><br />
              4. Aba <strong>aportes</strong> com colunas: <strong>Mês | Valor</strong><br />
              Quando você me mandar o link do Google Sheets, eu ajusto para ler exatamente essa estrutura.
            </div>
          </div>

          <div className="card">
            <div className="cardTitle"><h3>Clima - Guarulhos/SP</h3></div>
            <div className="weatherCurrent">
              <div className="weatherIcon">🌧</div>
              <div>
                <div className="weatherTemp">20°C</div>
                <div style={{fontSize: 13, color: '#ddd'}}>Chuva fraca agora</div>
              </div>
              <div className="weatherMeta">
                Umidade: 86%<br />
                Vento: 12 km/h<br />
                Sensação: 19°C
              </div>
            </div>
            <div style={{fontSize: 13, marginBottom: 8}}>Próximos dias, com indicação se chove ou não:</div>
            <div className="forecast">
              {weatherDays.map((d, idx) => (
                <div className="day" key={idx}>
                  <div className="dayName">{d[0]}<br />{d[1]}</div>
                  <div className="dayIcon">{d[2]}</div>
                  <div className="dayTemps">{d[3]} / {d[4]}</div>
                  <div style={{fontSize: 10, color: '#d8d8d8', marginTop: 3}}>{d[5]}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="cardTitle"><h3>Análise do mercado</h3></div>
            <div className="marketAnalysis">
              No cenário atual, o mercado segue dividido entre expectativa de cortes de juros nos EUA e atenção ao fiscal brasileiro.
              Para sua carteira, faz sentido acompanhar principalmente três blocos:
              <ul>
                <li><strong>Crédito privado e CRA:</strong> atenção a risco de emissor, reprecificação e fluxo de pagamentos.</li>
                <li><strong>Bitcoin:</strong> tendência positiva no médio prazo, mas com alta volatilidade e correções bruscas.</li>
                <li><strong>Dólar:</strong> pode aliviar no curto prazo, mas segue muito sensível a risco global e política monetária.</li>
              </ul>
              <div style={{marginTop: 10}}>
                <strong>Leitura prática:</strong> mercado ainda pede disciplina, controle de custos e visão de aportes mensais.
                A projeção até 2027 melhora bastante se os aportes continuarem consistentes e o custo mensal permanecer controlado.
              </div>
            </div>
          </div>
        </section>

        <div className="bottomQuotes">
          <div>O sucesso é a soma de pequenos esforços, repetidos dia após dia.</div>
          <div className="miniMark">S</div>
          <div>Foco no objetivo. Disciplina na rotina. Fé na caminhada.</div>
        </div>
      </main>
    </div>
  );
}
