'use client'

import {useState} from 'react'

const news = [
  {empresa:'FS Florestal', data:'07/05/2026', texto:'Monitorar atualizações de CRA, pagamentos realizados, risco de crédito e novas divulgações.'},
  {empresa:'BRF', data:'07/05/2026', texto:'Acompanhar resultados, margens, endividamento e notícias sobre exportação.'},
  {empresa:'Raízen', data:'07/05/2026', texto:'Acompanhar recuperação, precificação do CRA, dívida e setor de energia.'},
  {empresa:'Bitcoin', data:'07/05/2026', texto:'Mercado acompanha juros dos EUA, liquidez global e fluxo em ETFs.'},
  {empresa:'Dólar', data:'07/05/2026', texto:'Câmbio sensível a juros americanos, fiscal brasileiro e fluxo estrangeiro.'}
]

const projection = [
  ['Mai/26','744k'],['Jun/26','765k'],['Jul/26','788k'],['Ago/26','812k'],
  ['Set/26','838k'],['Out/26','866k'],['Nov/26','895k'],['Dez/26','926k'],
  ['Mar/27','1.02M'],['Jun/27','1.13M'],['Set/27','1.26M'],['Dez/27','1.42M']
]

export default function Home(){
  const [show,setShow]=useState(true)
  const v=(x:string)=>show?x:'••••••'

  return(
    <main className="dashboard">
      <div className="bgMark">SCCP ⚽</div>
      <div className="bgMark2">Raccoon City • Survival Mode</div>

      <section className="header">
        <div>
          <div className="title">JOHNNY DASH</div>
          <div className="subtitle">Financeiro • Investimentos • Bitcoin • Dólar • Clima • Corinthians • Resident Evil</div>
        </div>
        <button onClick={()=>setShow(!show)}>{show?'👁 Ocultar valores':'👁 Mostrar valores'}</button>
      </section>

      <section className="grid">
        <div className="card">
          <h2>Patrimônio total</h2>
          <div className="value">{v('R$ 744.145')}</div>
          <p className="muted">Base atual importada da carteira e Google Sheets.</p>
        </div>

        <div className="card">
          <h2>Bitcoin</h2>
          <div className="value">{v('US$ 96.420')}</div>
          <p className="muted">Tendência: neutra para alta, sensível a juros dos EUA e fluxo institucional.</p>
        </div>

        <div className="card">
          <h2>Dólar USD/BRL</h2>
          <div className="value">{v('R$ 5,11')}</div>
          <p className="muted">Variação recente: acompanhar fiscal, Selic e Fed.</p>
        </div>

        <div className="card big">
          <h2>Projeção patrimonial até Dez/2027</h2>
          <p className="muted">Projeção aproximada considerando aportes, juros compostos e carteira por tipo.</p>
          <div className="chart">
            <div className="line"></div>
            <span className="dot" style={{left:'10%',top:'64%'}} title="Mai/26 R$ 744k"></span>
            <span className="dot" style={{left:'35%',top:'52%'}} title="Dez/26 R$ 926k"></span>
            <span className="dot" style={{left:'65%',top:'38%'}} title="Jun/27 R$ 1.13M"></span>
            <span className="dot" style={{left:'90%',top:'24%'}} title="Dez/27 R$ 1.42M"></span>
          </div>
          <p>{projection.map(p=>`${p[0]}: ${show?p[1]:'•••'}`).join(' | ')}</p>
        </div>

        <div className="card">
          <h2>Clima • Guarulhos/SP</h2>
          <div className="value">20°C</div>
          <p className="muted">Previsão 16 dias: alternância entre chuva fraca e períodos de sol.</p>
        </div>

        <div className="card">
          <h2>Google Sheets</h2>
          <p className="muted">Pronto para ler sua planilha de custos por segmento.</p>
          <p>Segmentos: Casa, Alimentação, Transporte, Saúde, Educação, Lazer, Outros.</p>
        </div>

        <div className="card full">
          <h2>Notícias e updates acompanhados</h2>
          <div className="news">
            {news.map((n,i)=>(
              <div className="newsItem" key={i}>
                <strong>{n.empresa}</strong> • <span className="muted">{n.data}</span>
                <p>{n.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
