import { useState, useEffect, useCallback } from "react";

// Atendimentos que já passaram e continuam como "agendado" — o vendedor precisa dar o desfecho.
// Margem de 2h após o horário marcado antes de cobrar a baixa.
export const MARGEM_BAIXA_MS = 2 * 60 * 60 * 1000;

const TIPO_LABEL = {
  visita: 'Visita', apresentacao: 'Apresentação', online: 'Apresentação Online',
  reuniao: 'Reunião', retorno: 'Retorno', apresentacao_1: '1ª Apresentação',
  apresentacao_2: '2ª Apresentação', apresentacao_3: '3ª Apresentação',
  apresentacao_online: 'Apresentação Online',
};

const ACOES = [
  { status: 'apresentado', label: 'Apresentado', cor: '#2e7d32' },
  { status: 'remarcado', label: 'Remarcado', cor: '#e65100' },
  { status: 'cancelado', label: 'Cancelado', cor: '#c0392b' },
  { status: 'fechado', label: 'Fechado', cor: '#000' },
];

export function useBaixasPendentes(supabase, user) {
  const [pendentes, setPendentes] = useState([]);
  const isGerente = user?.role === 'gerente';
  const vendorName = user?.vendor_name;

  const recarregar = useCallback(async () => {
    if (!user) return;
    if (!isGerente && !vendorName) { setPendentes([]); return; }
    const limite = new Date(Date.now() - MARGEM_BAIXA_MS).toISOString();
    let q = supabase.from('leblanc_agendamentos')
      .select('id, lead_id, lead_name, vendor, tipo, data_hora, status')
      .eq('status', 'agendado')
      .lt('data_hora', limite)
      .order('data_hora', { ascending: false });
    if (!isGerente) q = q.eq('vendor', vendorName);
    const { data, error } = await q;
    if (error) { console.error('Erro ao carregar baixas pendentes:', error); return; }
    setPendentes(data || []);
  }, [supabase, user, isGerente, vendorName]);

  useEffect(() => {
    recarregar();
    const i = setInterval(recarregar, 5 * 60 * 1000);
    return () => clearInterval(i);
  }, [recarregar]);

  return { pendentes, recarregar };
}

function fmtData(iso) {
  return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function haQuanto(iso) {
  const dias = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (dias <= 0) return 'hoje';
  if (dias === 1) return 'ontem';
  return `há ${dias} dias`;
}

export default function PaginaBaixas({ supabase, user, pendentes, recarregar, abrirLead }) {
  const isGerente = user?.role === 'gerente';
  const [filtroVendor, setFiltroVendor] = useState('all');
  const [salvando, setSalvando] = useState(null);
  const [remarcando, setRemarcando] = useState(null); // id do agendamento
  const [novaData, setNovaData] = useState('');

  const porVendor = pendentes.reduce((acc, a) => {
    const v = a.vendor || 'Sem vendedor';
    acc[v] = (acc[v] || 0) + 1;
    return acc;
  }, {});
  const lista = filtroVendor === 'all' ? pendentes : pendentes.filter(a => (a.vendor || 'Sem vendedor') === filtroVendor);

  async function darBaixa(ag, status) {
    if (status === 'remarcado') {
      setRemarcando(ag.id);
      setNovaData('');
      return;
    }
    await salvar(ag, status);
  }

  async function salvar(ag, status, dataRemarcada) {
    setSalvando(ag.id);
    const { error } = await supabase.from('leblanc_agendamentos')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', ag.id);
    if (error) {
      setSalvando(null);
      console.error('Erro ao dar baixa:', error);
      alert(`Não foi possível salvar: ${error.message}`);
      return;
    }
    if (status === 'remarcado' && dataRemarcada) {
      const { error: errNovo } = await supabase.from('leblanc_agendamentos').insert({
        lead_id: ag.lead_id, vendor: ag.vendor, tipo: ag.tipo,
        data_hora: new Date(dataRemarcada).toISOString(), status: 'agendado',
      });
      if (errNovo) {
        console.error('Erro ao criar novo agendamento:', errNovo);
        alert('A baixa foi salva, mas o novo agendamento não foi criado. Crie pela ficha do cliente.');
      }
    }
    const label = ACOES.find(a => a.status === status)?.label || status;
    const extra = status === 'remarcado' && dataRemarcada ? ` para ${fmtData(new Date(dataRemarcada).toISOString())}` : '';
    await supabase.from('leblanc_historico_eventos').insert({
      lead_id: ag.lead_id, tipo: 'agendamento', icone: '📅',
      acao: `${TIPO_LABEL[ag.tipo] || ag.tipo} de ${fmtData(ag.data_hora)} marcado como ${label}${extra}`,
    });
    setSalvando(null);
    setRemarcando(null);
    recarregar();
  }

  return (
    <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>
      <h2 style={{ marginBottom: 6, fontFamily: "'Cormorant Garamond',serif", fontWeight: 400 }}>
        {isGerente ? 'Atendimentos sem baixa' : 'Meus atendimentos sem baixa'}
      </h2>
      <div style={{ fontSize: 13, color: '#666', marginBottom: 18, maxWidth: 720 }}>
        Atendimentos que já passaram e continuam como "Agendado". Informe o que aconteceu em cada um. Isso mantém o funil e os relatórios corretos.
      </div>

      {isGerente && pendentes.length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
          {[['all', `Todos (${pendentes.length})`], ...Object.entries(porVendor).sort((a, b) => b[1] - a[1]).map(([v, n]) => [v, `${v} (${n})`])].map(([id, label]) => (
            <button key={id} onClick={() => setFiltroVendor(id)}
              style={{
                padding: '6px 12px', borderRadius: 6, cursor: 'pointer', border: '1px solid #ddd', fontSize: 13,
                background: filtroVendor === id ? '#000' : 'white', color: filtroVendor === id ? 'white' : '#333',
              }}>{label}</button>
          ))}
        </div>
      )}

      {lista.length === 0 ? (
        <div style={{ padding: 48, textAlign: 'center', color: '#2e7d32' }}>✓ Nenhum atendimento pendente de baixa</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {lista.map(ag => (
            <div key={ag.id} style={{
              padding: 14, borderRadius: 8, border: '1px solid #eee', background: 'white',
              borderLeft: '4px solid #e65100', opacity: salvando === ag.id ? 0.5 : 1,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ minWidth: 220 }}>
                  <div onClick={() => abrirLead(ag.lead_id)}
                    style={{ fontWeight: 600, cursor: 'pointer', textDecoration: 'underline', textDecorationColor: '#ccc' }}>
                    {ag.lead_name || ag.lead_id}
                  </div>
                  <div style={{ fontSize: 12, color: '#777', marginTop: 2 }}>
                    {TIPO_LABEL[ag.tipo] || ag.tipo} • 📅 {fmtData(ag.data_hora)} • {haQuanto(ag.data_hora)}
                    {isGerente && ` • ${ag.vendor || 'sem vendedor'}`}
                  </div>
                </div>
                {remarcando === ag.id ? (
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12, color: '#555' }}>Nova data:</span>
                    <input type="datetime-local" value={novaData} onChange={e => setNovaData(e.target.value)}
                      style={{ padding: '5px 8px', border: '1px solid #ddd', borderRadius: 6, fontSize: 12 }} />
                    <button disabled={salvando === ag.id} onClick={() => salvar(ag, 'remarcado', novaData || null)}
                      style={{ padding: '6px 12px', borderRadius: 6, border: 'none', background: '#e65100', color: '#fff', fontSize: 12, cursor: 'pointer' }}>
                      {novaData ? 'Confirmar' : 'Remarcar sem data'}
                    </button>
                    <button onClick={() => setRemarcando(null)}
                      style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #ddd', background: '#fff', fontSize: 12, cursor: 'pointer' }}>
                      Voltar
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {ACOES.map(a => (
                      <button key={a.status} disabled={salvando === ag.id} onClick={() => darBaixa(ag, a.status)}
                        style={{
                          padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 500,
                          border: `1px solid ${a.cor}55`, background: '#fff', color: a.cor,
                        }}>{a.label}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
