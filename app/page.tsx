
'use client'

import {useState} from 'react'

export default function Home(){
 const [show,setShow]=useState(true)

 return(
  <main className="dashboard">

   <div className="header">
    <div>
      <div className="title">JOHNNY DASH</div>
      <p>Corinthians • Resident Evil • Mercado • Futebol</p>
    </div>

    <button onClick={()=>setShow(!show)}>
      {show ? 'Ocultar valores' : 'Mostrar valores'}
    </button>
   </div>

   <div className="grid">

    <div className="card">
      <h2>Patrimônio</h2>
      <h1>{show ? 'R$ 744.145,00' : '••••••••'}</h1>
      <p>Projeção até Dez/2027</p>
    </div>

    <div className="card">
      <h2>Bitcoin</h2>
      <h1>{show ? 'US$ 96.420' : '••••'}</h1>
      <p>Tendência de alta moderada.</p>
    </div>

    <div className="card">
      <h2>Dólar</h2>
      <h1>{show ? 'R$ 5,11' : '••••'}</h1>
      <p>Variação diária negativa.</p>
    </div>

    <div className="card">
      <h2>Clima • Guarulhos</h2>
      <p>Previsão 16 dias.</p>
      <p>Alternância entre chuva e sol.</p>
    </div>

    <div className="card">
      <h2>Notícias</h2>
      <p>FS Florestal • 07/05/2026</p>
      <p>BRF • 07/05/2026</p>
      <p>Raízen • 07/05/2026</p>
    </div>

    <div className="card">
      <h2>Controle de Custos</h2>
      <p>Integração pronta para Google Sheets.</p>
    </div>

   </div>

   <div className="watermark">
     SCCP ⚽
   </div>

  </main>
 )
}
