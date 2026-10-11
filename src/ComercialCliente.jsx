import { useEffect, useRef, useState } from 'react';

export default function ComercialCliente({ lead }) {
  const [aberto, setAberto] = useState(false);
  const dialog = useRef(null);
  const url = new URL('/orcamentos', import.meta.env.VITE_FINANCEIRO_URL || 'https://leblanc-financeiro-v2.netlify.app');
  url.searchParams.set('lead', String(lead.id));
  url.searchParams.set('crm', '1');
  useEffect(() => {
    if (aberto) dialog.current?.showModal();
    else dialog.current?.close();
  }, [aberto]);
  return <section style={{lineHeight:1.65}}>
    <h3>Orçamento e contrato</h3>
    <p style={{margin:'12px 0'}}>Prepare a proposta de {lead.name}, importe o XML do Promob e simule o pagamento. Complete os dados do cliente para gerar o contrato no modelo da loja.</p>
    <p style={{margin:'12px 0'}}>Os orçamentos ficam vinculados a este atendimento. O financeiro acompanha o contrato e seus documentos após a geração.</p>
    <button className="btn-sec" onClick={()=>setAberto(true)}>Abrir orçamentos e contratos</button>
    <dialog ref={dialog} onCancel={()=>setAberto(false)} style={{width:'96vw',height:'94vh',maxWidth:1400,maxHeight:'96vh',margin:'auto',padding:0,border:'1px solid #d0cdc7',borderRadius:12}}>
      <header style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,padding:14,borderBottom:'1px solid #ddd'}}>
        <strong>{lead.name} · Orçamentos e contratos</strong>
        <div style={{display:'flex',gap:16}}><a href={url.toString()} target="_blank" rel="noopener noreferrer">Abrir em outra aba</a><button className="btn-sec" onClick={()=>setAberto(false)}>Voltar ao CRM</button></div>
      </header>
      {aberto && <iframe key={lead.id} title={`Orçamento e contrato de ${lead.name}`} src={url.toString()} style={{border:0,width:'100%',height:'calc(100% - 68px)'}} />}
    </dialog>
  </section>;
}
