import { useState } from 'react';

export default function CentralComercial({ tipo, leads }) {
  const [cliente, setCliente] = useState('');
  const url = new URL(tipo==='contratos'?'/contratos':'/orcamentos',import.meta.env.VITE_FINANCEIRO_URL||'https://leblanc-financeiro-v2.netlify.app');
  url.searchParams.set('crm','1');
  if(cliente)url.searchParams.set('lead',cliente);
  return <section style={{display:'flex',flexDirection:'column',flex:1,minHeight:0}}>
    <div style={{display:'flex',alignItems:'center',gap:16,padding:'12px 24px',flexWrap:'wrap'}}>
      <label style={{fontSize:12}}>Cliente do CRM
        <select aria-label="Cliente do CRM" value={cliente} onChange={e=>setCliente(e.target.value)} style={{padding:9,marginLeft:10,maxWidth:420}}>
          <option value="">Todos · selecione para um novo orçamento</option>
          {[...leads].sort((a,b)=>(a.name||'').localeCompare(b.name||'','pt-BR')).map(l=><option key={l.id} value={l.id}>{l.name} · {l.vendor||'Sem vendedor'}</option>)}
        </select>
      </label>
      <a href={url.toString()} target="_blank" rel="noopener noreferrer" style={{fontSize:12}}>Abrir em outra aba</a>
    </div>
    <iframe key={url.toString()} title={tipo==='contratos'?'Contratos dos clientes':'Orçamentos dos clientes'} src={url.toString()} style={{border:0,width:'100%',flex:1,minHeight:360}} />
  </section>;
}
