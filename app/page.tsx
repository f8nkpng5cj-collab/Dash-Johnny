'use client'

import {useState} from 'react'

export default function Home(){
const [show,setShow]=useState(true)

const v=(x:string)=>show?x:'••••••'

return(
<div className="layout">

<div className="sidebar">
  <div className="logo">JOHNNY DASH</div>
  <div className="subtitle">
    Corinthians • Resident Evil • Mercado • Futebol
  </div>

  <div className="menu">
    <div className="menuItem">🏠 Dashboard</div>
    <div className="menuItem">📈 Projeção</div>
    <div className="menuItem">💰 Controle</div>
    <div className="menuItem">📰 Notícias</div>
    <div className="menuItem">📊 Mercado</div>
    <div className="menuItem">🌧 Clima</div>
    <div className="menuItem">⚙ Configurações</div>
  </div>
</div>

<div className="content">

<div style={{display:'flex',justifyContent:'space-between',marginBottom:20}}>
  <div>
    <h1>Dashboard Premium</h1>
    <p className="small">Foco, disciplina e execução.</p>
  </div>

  <button onClick={()=>setShow(!show)}>
    {show?'Ocultar valores':'Mostrar valores'}
  </button>
</div>

<div className="topGrid">

  <div className="card">
    <div className="small">Patrimônio Total</div>
    <div className="value">{v('R$ 1.248.732')}</div>
  </div>

  <div className="card">
    <div className="small">Aportes</div>
    <div className="value">{v('R$ 309.850')}</div>
  </div>

  <div className="card">
    <div className="small">Rendimentos</div>
    <div className="value">{v('R$ 278.942')}</div>
  </div>

  <div className="card">
    <div className="small">Projeção Dez/2027</div>
    <div className="value">{v('R$ 1.842.618')}</div>
  </div>

</div>

<div className="bigGrid">

  <div className="card">
    <h2>Projeção patrimonial</h2>
    <div className="chart">
      <div className="chartLine"></div>

      <span className="dot" style={{left:'8%',top:'72%'}}></span>
      <span className="dot" style={{left:'25%',top:'60%'}}></span>
      <span className="dot" style={{left:'45%',top:'48%'}}></span>
      <span className="dot" style={{left:'70%',top:'34%'}}></span>
      <span className="dot" style={{left:'90%',top:'20%'}}></span>
    </div>

    <p className="small">
      Mai/26 → Dez/27 • projeção considerando juros compostos e aportes.
    </p>
  </div>

  <div className="card">
    <h2>Notícias & Updates</h2>

    <div className="news">

      <div className="newsItem">
        <strong>FS Florestal</strong>
        <p className="small">07/05/2026</p>
        <p>Monitoramento do CRA e pagamentos realizados.</p>
      </div>

      <div className="newsItem">
        <strong>BRF</strong>
        <p className="small">07/05/2026</p>
        <p>Resultados e expectativa operacional positiva.</p>
      </div>

      <div className="newsItem">
        <strong>Raízen</strong>
        <p className="small">07/05/2026</p>
        <p>Mercado atento ao setor de energia e dívida.</p>
      </div>

    </div>
  </div>

  <div style={{display:'flex',flexDirection:'column',gap:18}}>

    <div className="card">
      <h2>Bitcoin</h2>
      <div className="value">{v('US$ 62.743')}</div>
      <p className="small">Tendência de alta moderada.</p>
    </div>

    <div className="card">
      <h2>Dólar</h2>
      <div className="value">{v('R$ 5,08')}</div>
      <p className="small">Variação diária negativa.</p>
    </div>

  </div>

</div>

<div className="bottomGrid">

  <div className="card">
    <h2>Gastos por segmento</h2>
    <p>Casa • Transporte • Alimentação • Saúde • Educação</p>
  </div>

  <div className="card">
    <h2>Controle Google Sheets</h2>
    <p>Integração preparada para leitura da planilha online.</p>
  </div>

  <div className="card">
    <h2>Clima • Guarulhos</h2>
    <div className="value">20°C</div>
    <p className="small">Próximos 16 dias com chuva fraca e períodos de sol.</p>
  </div>

</div>

</div>

<div className="watermark">
SCCP ⚽
</div>

<div className="leon">
Leon S. Kennedy
</div>

</div>
)
}
