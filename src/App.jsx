import { useState, useMemo, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://kptgtftvyiyxynxkpmaw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtwdGd0ZnR2eWl5eHlueGtwbWF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxOTQwOTUsImV4cCI6MjA4NDc3MDA5NX0.PTARgU61ku6He-WTza6k3muDeAuTsP21yjODbraXxr0";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const STAGES = [
  { id: "novo",               label: "Novo Lead",        colorClass: "" },
  { id: "analise_diretoria",  label: "Análise Diretoria", colorClass: "purple-dark" },
  { id: "sem_resposta",       label: "Sem Resposta",     colorClass: "amber" },
  { id: "retorno_helena", label: "Retorno p/ Helena",    colorClass: "purple" },
  { id: "atendimento",  label: "Em Atendimento",         colorClass: "" },
  { id: "aguardando",   label: "Aguardando Informações", colorClass: "" },
  { id: "projeto",      label: "Desenvolvendo Projeto",  colorClass: "" },
  { id: "apresentacao", label: "Apresentação",           colorClass: "" },
  { id: "negociacao",   label: "Negociação",             colorClass: "" },
  { id: "vendidos",     label: "Vendidos",               colorClass: "green" },
  { id: "perdido",      label: "Perdido",                colorClass: "red" },
];

const VENDOR_MAP = {
  Tayne:    { initials: "TA" },
  Murilo:   { initials: "MU" },
  Andriely: { initials: "AN" },
  Bruna:    { initials: "BR" },
  Leticia:  { initials: "LE" },
};

const REGIONS = ["Curitiba", "RMC", "Litoral PR/SC"];
const PIPELINE_STAGES = ["novo","analise_diretoria","sem_resposta","retorno_helena","atendimento","aguardando","projeto","apresentacao","negociacao","vendidos","perdido"];
const stageNext = (id) => { const i = STAGES.findIndex(s => s.id === id); return i < STAGES.length - 1 ? STAGES[i + 1] : null; };

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  :root{
    --bg:#f5f4f2;
    --surface:#ffffff;
    --s2:#f0efed;
    --s3:#e8e7e4;
    --card:#ffffff;
    --card-h:#fafaf9;
    --border:#e2e0db;
    --border2:#d0cdc7;
    --black:#111110;
    --dark:#2a2927;
    --mid:#6b6860;
    --light:#9e9b96;
    --faint:#c8c5bf;
    --accent:#111110;
    --accent-light:rgba(17,17,16,0.06);
    --accent-mid:rgba(17,17,16,0.12);
    --green:#2d6a4f;
    --green-bg:rgba(45,106,79,0.08);
    --red:#c0392b;
    --red-bg:rgba(192,57,43,0.08);
    --amber:#b7791f;
    --amber-bg:rgba(183,121,31,0.08);
    --r:4px;--r2:8px;--r3:12px;
  }
  body{background:var(--bg);color:var(--black);font-family:'Jost',sans-serif;font-weight:400;}
  ::-webkit-scrollbar{width:3px;height:3px;}
  ::-webkit-scrollbar-track{background:transparent;}
  ::-webkit-scrollbar-thumb{background:var(--border2);border-radius:3px;}

  /* LOGIN */
  .login-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--black);}
  .login-box{width:360px;padding:48px 40px;}
  .login-logo-wrap{display:flex;flex-direction:column;align-items:center;margin-bottom:40px;}
  .login-logo-box{border:1px solid rgba(255,255,255,0.25);padding:14px 28px;margin-bottom:8px;}
  .login-logo{font-family:'Cormorant Garamond',serif;font-size:26px;font-weight:300;color:#fff;letter-spacing:.22em;text-transform:uppercase;}
  .login-logo span{font-size:8px;color:rgba(255,255,255,0.4);letter-spacing:.28em;text-transform:uppercase;display:block;text-align:center;margin-top:4px;}
  .login-tagline{font-size:10px;color:rgba(255,255,255,0.3);letter-spacing:.2em;text-transform:uppercase;}
  .login-divider{width:32px;height:1px;background:rgba(255,255,255,0.15);margin:0 auto 32px;}
  .login-label{font-size:10px;color:rgba(255,255,255,0.4);letter-spacing:.16em;text-transform:uppercase;margin-bottom:8px;display:block;}
  .login-input{width:100%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:var(--r);padding:11px 14px;color:#fff;font-size:13px;font-family:'Jost',sans-serif;outline:none;transition:border .15s;margin-bottom:16px;}
  .login-input:focus{border-color:rgba(255,255,255,0.35);}
  .login-input::placeholder{color:rgba(255,255,255,0.2);}
  .login-btn{width:100%;padding:12px;background:#fff;border:none;border-radius:var(--r);color:var(--black);font-size:12px;font-weight:500;cursor:pointer;font-family:'Jost',sans-serif;letter-spacing:.1em;text-transform:uppercase;transition:opacity .15s;margin-top:4px;}
  .login-btn:hover{opacity:.88;}
  .login-btn:disabled{opacity:.4;cursor:not-allowed;}
  .login-error{font-size:11px;color:#e07070;margin-top:10px;text-align:center;letter-spacing:.04em;}

  /* CRM LAYOUT */
  .crm{display:flex;height:100vh;overflow:hidden;background:var(--bg);}

  /* SIDEBAR */
  .sidebar{width:220px;flex-shrink:0;background:var(--black);display:flex;flex-direction:column;}
  .logo-area{padding:24px 20px 20px;border-bottom:1px solid rgba(255,255,255,0.08);}
  .logo-box{border:1px solid rgba(255,255,255,0.2);padding:9px 14px;display:inline-block;margin-bottom:6px;}
  .logo-text{font-family:'Cormorant Garamond',serif;font-size:16px;font-weight:300;color:#fff;letter-spacing:.22em;text-transform:uppercase;}
  .logo-sub{font-size:8px;color:rgba(255,255,255,0.3);letter-spacing:.2em;text-transform:uppercase;margin-top:6px;}
  .nav{padding:12px 0;flex:1;}
  .nav-item{display:flex;align-items:center;gap:10px;padding:9px 20px;font-size:11px;color:rgba(255,255,255,0.35);cursor:pointer;transition:all .15s;letter-spacing:.08em;text-transform:uppercase;border-left:2px solid transparent;}
  .nav-item:hover{color:rgba(255,255,255,0.65);background:rgba(255,255,255,0.04);}
  .nav-item.active{color:#fff;border-left-color:#fff;background:rgba(255,255,255,0.07);}
  .nav-dot{width:4px;height:4px;border-radius:50%;background:currentColor;flex-shrink:0;}
  .hbadge{margin:0 14px 10px;padding:10px 12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:var(--r2);}
  .hpulse{width:6px;height:6px;border-radius:50%;background:#4caf7d;flex-shrink:0;animation:pulse 2s infinite;}
  @keyframes pulse{0%,100%{opacity:1;}50%{opacity:.3;}}
  .hrow{display:flex;align-items:center;gap:8px;margin-bottom:2px;}
  .htext{font-size:11px;color:rgba(255,255,255,0.7);font-weight:500;letter-spacing:.04em;}
  .hsub{font-size:10px;color:rgba(255,255,255,0.3);letter-spacing:.04em;}
  .sbox{margin:0 14px 10px;padding:10px 12px;border:1px solid rgba(255,255,255,0.08);border-radius:var(--r2);}
  .sr{display:flex;justify-content:space-between;align-items:center;padding:2px 0;}
  .sl{font-size:10px;color:rgba(255,255,255,0.3);letter-spacing:.06em;}
  .sv{font-size:11px;font-weight:500;color:rgba(255,255,255,0.6);}
  .logout-btn{margin:0 14px 16px;padding:8px 12px;background:none;border:1px solid rgba(255,255,255,0.08);border-radius:var(--r);font-size:10px;color:rgba(255,255,255,0.3);cursor:pointer;font-family:'Jost',sans-serif;letter-spacing:.1em;text-transform:uppercase;transition:all .15s;display:flex;align-items:center;gap:7px;}
  .logout-btn:hover{border-color:rgba(255,255,255,0.2);color:rgba(255,255,255,0.6);}

  /* MAIN */
  .main{flex:1;display:flex;flex-direction:column;overflow:hidden;}
  .topbar{display:flex;align-items:center;justify-content:space-between;padding:14px 24px;border-bottom:1px solid var(--border);background:var(--surface);flex-shrink:0;}
  .tbtitle{font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:400;color:var(--black);letter-spacing:.06em;}
  .tbr{display:flex;align-items:center;gap:10px;}
  .sbox2{display:flex;align-items:center;gap:8px;background:var(--s2);border:1px solid var(--border);border-radius:var(--r);padding:7px 12px;}
  .sbox2 input{background:none;border:none;outline:none;color:var(--dark);font-size:12px;width:180px;font-family:'Jost',sans-serif;}
  .sbox2 input::placeholder{color:var(--faint);}
  .search-icon{color:var(--faint);font-size:12px;}
  .uchip{display:flex;align-items:center;gap:8px;padding:5px 10px;background:var(--black);border-radius:20px;}
  .uav{width:22px;height:22px;border-radius:50%;background:rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center;font-size:8px;color:#fff;font-weight:600;letter-spacing:.05em;}
  .uname{font-size:11px;color:#fff;letter-spacing:.04em;}
  .role-badge{font-size:9px;padding:2px 7px;border-radius:20px;background:rgba(255,255,255,0.15);color:rgba(255,255,255,0.7);letter-spacing:.08em;text-transform:uppercase;}

  /* KPIs */
  .kpis{display:flex;gap:1px;border-bottom:1px solid var(--border);flex-shrink:0;background:var(--border);}
  .kpi{flex:1;background:var(--surface);padding:16px 20px;}
  .kpi.hi{background:var(--black);}
  .klabel{font-size:9px;color:var(--light);text-transform:uppercase;letter-spacing:.16em;margin-bottom:8px;}
  .kpi.hi .klabel{color:rgba(255,255,255,0.4);}
  .kval{font-family:'Cormorant Garamond',serif;font-size:32px;font-weight:300;color:var(--black);line-height:1;}
  .kpi.hi .kval{color:#fff;}
  .kdelta{font-size:10px;color:var(--light);margin-top:5px;letter-spacing:.04em;}
  .kpi.hi .kdelta{color:rgba(255,255,255,0.4);}
  .kdelta.green{color:var(--green);}
  .kpi.hi .kdelta.green{color:#4caf7d;}

  /* FILTERS */
  .filters{display:flex;align-items:center;gap:6px;padding:10px 24px;border-bottom:1px solid var(--border);flex-shrink:0;overflow-x:auto;background:var(--surface);}
  .fl{font-size:9px;color:var(--light);letter-spacing:.14em;text-transform:uppercase;margin-right:2px;white-space:nowrap;}
  .fb{padding:4px 12px;border-radius:2px;border:1px solid var(--border);font-size:10px;color:var(--mid);cursor:pointer;background:none;transition:all .15s;white-space:nowrap;font-family:'Jost',sans-serif;letter-spacing:.06em;}
  .fb:hover{border-color:var(--border2);color:var(--dark);}
  .fb.a{background:var(--black);border-color:var(--black);color:#fff;}
  .fdiv{width:1px;height:14px;background:var(--border);flex-shrink:0;margin:0 4px;}
  .tb{padding:4px 10px;border-radius:2px;border:1px solid var(--border);font-size:11px;cursor:pointer;background:none;color:var(--mid);font-family:'Jost',sans-serif;}
  .tb.ha{background:var(--red-bg);border-color:rgba(192,57,43,0.25);color:var(--red);}
  .tb.wa{background:var(--amber-bg);border-color:rgba(183,121,31,0.25);color:var(--amber);}
  .tb.ca{background:rgba(107,104,96,0.08);border-color:rgba(107,104,96,0.25);color:var(--mid);}

  /* BOARD */
  .board{flex:1;display:flex;overflow:hidden;}
  .kanban{flex:1;overflow-x:auto;padding:16px 24px;display:flex;gap:12px;background:var(--bg);}
  .col{width:235px;flex-shrink:0;display:flex;flex-direction:column;}
  .ch{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;padding-bottom:8px;border-bottom:2px solid var(--black);}
  .ct{font-size:9px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:var(--dark);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:120px;}
  .cc{font-size:10px;color:var(--light);background:var(--surface);border:1px solid var(--border);border-radius:2px;padding:1px 7px;font-family:'Cormorant Garamond',serif;font-size:13px;}
  .clist{display:flex;flex-direction:column;gap:6px;flex:1;overflow-y:auto;padding-bottom:8px;}

  /* LEAD CARD */
  .lcard{background:var(--card);border:1px solid var(--border);border-radius:var(--r2);padding:14px;cursor:pointer;transition:all .18s;position:relative;}
  .lcard:hover{background:var(--card-h);border-color:var(--border2);box-shadow:0 2px 8px rgba(0,0,0,0.06);}
  .lcard.sel{border-color:var(--black);background:var(--card);}
  .lcard.sel::before{content:'';position:absolute;left:0;top:0;bottom:0;width:2px;background:var(--black);border-radius:var(--r2) 0 0 var(--r2);}
  .ctop{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;}
  .lname{font-family:'Cormorant Garamond',serif;font-size:15px;font-weight:400;color:var(--black);line-height:1.25;flex:1;margin-right:8px;}
  .ttag{padding:2px 8px;border-radius:2px;font-size:9px;white-space:nowrap;font-weight:500;letter-spacing:.08em;text-transform:uppercase;}
  .th{background:var(--red-bg);color:var(--red);}
  .tw{background:var(--amber-bg);color:var(--amber);}
  .tc{background:rgba(107,104,96,0.08);color:var(--mid);}
  .cmeta{display:flex;flex-direction:column;gap:3px;margin-bottom:10px;}
  .mrow{display:flex;align-items:center;gap:5px;font-size:10px;color:var(--light);}
  .cbot{display:flex;align-items:center;justify-content:space-between;padding-top:8px;border-top:1px solid var(--border);}
  .btag{font-size:10px;color:var(--dark);background:var(--s2);border:1px solid var(--border);padding:2px 8px;border-radius:2px;font-weight:500;}
  .vav{width:22px;height:22px;border-radius:50%;background:var(--black);display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:600;color:#fff;flex-shrink:0;letter-spacing:.05em;}
  .novav{width:22px;height:22px;border-radius:50%;border:1.5px dashed var(--border2);display:flex;align-items:center;justify-content:center;font-size:9px;color:var(--faint);}
  .ctime{font-size:9px;color:var(--faint);letter-spacing:.04em;}
  .empty-col{text-align:center;padding:24px 0;color:var(--faint);font-size:11px;letter-spacing:.06em;}

  /* DRAWER */
  .drawer{width:370px;flex-shrink:0;background:var(--surface);border-left:1px solid var(--border);display:flex;flex-direction:column;transition:width .25s;overflow:hidden;}
  .drawer.closed{width:0;border-left:none;}
  .dh{padding:16px 20px;border-bottom:1px solid var(--border);display:flex;align-items:flex-start;justify-content:space-between;flex-shrink:0;}
  .dname{font-family:'Cormorant Garamond',serif;font-size:20px;font-weight:400;color:var(--black);line-height:1.2;}
  .did{font-size:9px;color:var(--light);margin-top:4px;letter-spacing:.1em;text-transform:uppercase;}
  .xbtn{background:none;border:1px solid var(--border);color:var(--light);font-size:14px;cursor:pointer;padding:3px 8px;border-radius:var(--r);transition:all .15s;}
  .xbtn:hover{border-color:var(--border2);color:var(--dark);}
  .dbody{flex:1;overflow-y:auto;padding:16px 20px;display:flex;flex-direction:column;gap:16px;}
  .stitle{font-size:9px;color:var(--light);text-transform:uppercase;letter-spacing:.16em;margin-bottom:8px;font-weight:500;}
  .igrid{display:grid;grid-template-columns:1fr 1fr;gap:6px;}
  .ifield{background:var(--s2);border:1px solid var(--border);border-radius:var(--r);padding:8px 10px;}
  .ifield.full{grid-column:1/-1;}
  .ilabel{font-size:9px;color:var(--light);letter-spacing:.1em;text-transform:uppercase;margin-bottom:3px;}
  .ivalue{font-size:12px;color:var(--dark);font-weight:500;}
  .ivalue.hi{color:var(--black);font-weight:600;}
  .iselect{width:100%;background:var(--s2);border:1px solid var(--border2);border-radius:var(--r);padding:5px 8px;color:var(--dark);font-size:12px;font-family:'Jost',sans-serif;outline:none;cursor:pointer;}
  .iselect:focus{border-color:var(--black);}
  .sdrbox{background:var(--s2);border:1px solid var(--border);border-radius:var(--r2);padding:12px 13px;}
  .sdrh{display:flex;align-items:center;gap:6px;margin-bottom:8px;}
  .sdrdot{width:5px;height:5px;border-radius:50%;background:var(--green);animation:pulse 2s infinite;}
  .sdrl{font-size:10px;color:var(--green);font-weight:500;letter-spacing:.06em;text-transform:uppercase;}
  .sdrt{font-size:12px;color:var(--mid);line-height:1.65;}
  .aibox{background:var(--black);border-radius:var(--r2);padding:12px 13px;}
  .aih{display:flex;align-items:center;gap:6px;margin-bottom:8px;}
  .ail{font-size:10px;color:rgba(255,255,255,0.5);font-weight:500;letter-spacing:.1em;text-transform:uppercase;}
  .ait{font-size:12px;color:rgba(255,255,255,0.8);line-height:1.65;}
  .aiacts{display:flex;gap:6px;margin-top:10px;}
  .aibtn{padding:5px 12px;border-radius:var(--r);border:1px solid rgba(255,255,255,0.15);font-size:10px;color:rgba(255,255,255,0.6);cursor:pointer;background:none;font-family:'Jost',sans-serif;letter-spacing:.06em;transition:all .15s;}
  .aibtn:hover{background:rgba(255,255,255,0.08);color:#fff;}
  .add-fu{display:flex;gap:6px;margin-top:8px;}
  .fu-input{flex:1;background:var(--s2);border:1px solid var(--border);border-radius:var(--r);padding:7px 10px;color:var(--dark);font-size:12px;font-family:'Jost',sans-serif;outline:none;}
  .fu-input:focus{border-color:var(--black);}
  .fu-btn{padding:7px 12px;border-radius:var(--r);border:1px solid var(--black);font-size:10px;color:var(--black);cursor:pointer;background:none;font-family:'Jost',sans-serif;letter-spacing:.06em;white-space:nowrap;transition:all .15s;}
  .fu-btn:hover{background:var(--black);color:#fff;}
  .tl{display:flex;flex-direction:column;gap:10px;}
  .tli{display:flex;gap:10px;align-items:flex-start;}
  .tlic{width:24px;height:24px;border-radius:50%;background:var(--s2);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:11px;flex-shrink:0;}
  .tlb{flex:1;padding-top:1px;}
  .tla{font-size:12px;color:var(--dark);line-height:1.4;}
  .tlm{font-size:9px;color:var(--light);margin-top:2px;letter-spacing:.04em;}
  .dfoot{padding:12px 20px;border-top:1px solid var(--border);display:flex;gap:6px;flex-shrink:0;}
  .bact{flex:1;padding:8px 10px;border-radius:var(--r);border:1px solid var(--border);font-size:10px;color:var(--mid);cursor:pointer;background:none;font-family:'Jost',sans-serif;text-align:center;letter-spacing:.08em;text-transform:uppercase;transition:all .15s;}
  .bact:hover{border-color:var(--border2);color:var(--dark);}
  .badv{flex:2;padding:8px 10px;border-radius:var(--r);border:1px solid var(--black);font-size:10px;color:#fff;cursor:pointer;background:var(--black);font-weight:500;font-family:'Jost',sans-serif;letter-spacing:.08em;text-transform:uppercase;transition:opacity .15s;}
  .badv:hover{opacity:.8;}
  .dempty{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;color:var(--faint);}
  .demi{font-family:'Cormorant Garamond',serif;font-size:48px;font-weight:300;opacity:.2;letter-spacing:.1em;}
  .demt{font-size:11px;text-align:center;line-height:1.7;letter-spacing:.06em;text-transform:uppercase;}
  .loading{display:flex;align-items:center;justify-content:center;height:100vh;color:var(--mid);font-size:12px;background:var(--black);letter-spacing:.12em;text-transform:uppercase;}

  /* REPORTS */
  .reports-wrap{flex:1;overflow-y:auto;padding:24px;background:var(--bg);}
  .reports-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;}
  .report-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r2);padding:20px;}
  .report-card.full{grid-column:1/-1;}
  .report-title{font-size:9px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--light);margin-bottom:16px;}
  .vendor-row{display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border);}
  .vendor-row:last-child{border-bottom:none;}
  .vendor-av{width:32px;height:32px;border-radius:50%;background:var(--black);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:600;color:#fff;flex-shrink:0;}
  .vendor-name{font-size:13px;color:var(--dark);font-weight:500;flex:1;}
  .vendor-stats{display:flex;gap:16px;}
  .vstat{text-align:right;}
  .vstat-val{font-family:'Cormorant Garamond',serif;font-size:20px;font-weight:400;color:var(--black);line-height:1;}
  .vstat-label{font-size:9px;color:var(--faint);letter-spacing:.08em;text-transform:uppercase;}
  .vstat-val.green{color:var(--green);}
  .vstat-val.red{color:var(--red);}
  .bar-wrap{flex:1;height:6px;background:var(--s2);border-radius:3px;overflow:hidden;}
  .bar-fill{height:100%;background:var(--black);border-radius:3px;transition:width .4s;}
  .bar-fill.green{background:var(--green);}
  .pie-row{display:flex;align-items:center;justify-content:space-around;padding:8px 0;}
  .pie-item{text-align:center;}
  .pie-val{font-family:'Cormorant Garamond',serif;font-size:36px;font-weight:300;line-height:1;}
  .pie-label{font-size:9px;color:var(--light);letter-spacing:.1em;text-transform:uppercase;margin-top:4px;}
  .pie-val.black{color:var(--black);}
  .pie-val.green{color:var(--green);}
  .pie-val.red{color:var(--red);}
  .pie-val.amber{color:var(--amber);}
  .evolution-bars{display:flex;align-items:flex-end;gap:8px;height:120px;padding-top:12px;}
  .evo-bar-wrap{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;}
  .evo-bar{width:100%;background:var(--black);border-radius:2px 2px 0 0;transition:height .4s;min-height:2px;}
  .evo-label{font-size:9px;color:var(--faint);letter-spacing:.04em;}
  .evo-val{font-size:10px;color:var(--dark);font-weight:500;}
  .region-row{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border);}
  .region-row:last-child{border-bottom:none;}
  .region-name{font-size:12px;color:var(--dark);flex:1;}
  .region-count{font-family:'Cormorant Garamond',serif;font-size:18px;color:var(--black);}
`;

function sanitizeFilename(name) {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_+/g, '_');
}

async function pedirPermissaoNotificacoes() {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

function dispararNotificacaoNavegador(notif) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const n = new Notification(notif.titulo, {
    body: notif.corpo || '',
    icon: '/favicon.ico',
    tag: `notif-${notif.id}`,
  });
  n.onclick = () => { window.focus(); n.close(); };
}

function useNotifications(userEmail) {
  const [notifications, setNotifications] = useState([]);
  const [naoLidas, setNaoLidas] = useState(0);
  const [toasts, setToasts] = useState([]);
  const previousIdsRef = useRef(new Set());

  useEffect(() => {
    if (!userEmail) return;

    async function fetch() {
      const { data, error } = await supabase
        .from('leblanc_notifications')
        .select('*')
        .eq('destinatario_email', userEmail)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error || !data) return;

      const currentIds = new Set(data.map(n => n.id));
      const previousIds = previousIdsRef.current;
      const novasNotifications = data.filter(n => !previousIds.has(n.id) && !n.lida);

      if (previousIds.size > 0) {
        novasNotifications.forEach(notif => {
          const toast = { id: notif.id, titulo: notif.titulo, corpo: notif.corpo, tipo: notif.tipo, lead_id: notif.lead_id };
          setToasts(prev => [...prev, toast]);
          setTimeout(() => setToasts(prev => prev.filter(t => t.id !== toast.id)), 5000);
          dispararNotificacaoNavegador(notif);
        });
      }

      previousIdsRef.current = currentIds;
      setNotifications(data);
      setNaoLidas(data.filter(n => !n.lida).length);
    }

    fetch();
    const interval = setInterval(fetch, 15000);
    return () => clearInterval(interval);
  }, [userEmail]);

  async function marcarComoLida(id) {
    await supabase.from('leblanc_notifications').update({ lida: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, lida: true } : n));
    setNaoLidas(prev => Math.max(0, prev - 1));
  }

  async function marcarTodasComoLidas() {
    await supabase.from('leblanc_notifications')
      .update({ lida: true })
      .eq('destinatario_email', userEmail)
      .eq('lida', false);
    setNotifications(prev => prev.map(n => ({ ...n, lida: true })));
    setNaoLidas(0);
  }

  function dismissToast(id) {
    setToasts(prev => prev.filter(t => t.id !== id));
  }

  return { notifications, naoLidas, marcarComoLida, marcarTodasComoLidas, toasts, dismissToast };
}

function NotificationToasts({ toasts, onClick }) {
  return (
    <div style={{position:'fixed',top:20,right:20,zIndex:9999,display:'flex',flexDirection:'column',gap:8,maxWidth:360}}>
      {toasts.map(t => {
        const cor = t.tipo === 'agendamento_1h' ? '#f59e0b' : t.tipo === 'retorno_helena' ? '#9333ea' : '#3b82f6';
        const icone = t.tipo === 'agendamento_1h' ? '⏰' : t.tipo === 'retorno_helena' ? '🔄' : '👤';
        return (
          <div key={t.id} onClick={() => onClick(t)}
            style={{background:'white',borderLeft:`4px solid ${cor}`,borderRadius:8,padding:'12px 16px',boxShadow:'0 4px 12px rgba(0,0,0,0.15)',cursor:t.lead_id?'pointer':'default'}}>
            <div style={{fontWeight:600,fontSize:14,marginBottom:4}}>{icone} {t.titulo}</div>
            {t.corpo && <div style={{fontSize:13,color:'#555'}}>{t.corpo}</div>}
          </div>
        );
      })}
    </div>
  );
}

function NotificationBell({ notifications, naoLidas, onItemClick, onMarcarTodas }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{position:'relative'}}>
      <button onClick={() => setOpen(!open)}
        style={{background:'transparent',border:'none',fontSize:22,cursor:'pointer',position:'relative',padding:8}}
        title="Notificações">
        🔔
        {naoLidas > 0 && (
          <span style={{position:'absolute',top:4,right:4,background:'#dc2626',color:'white',borderRadius:10,padding:'2px 6px',fontSize:10,fontWeight:700,minWidth:18,textAlign:'center'}}>
            {naoLidas > 99 ? '99+' : naoLidas}
          </span>
        )}
      </button>
      {open && (
        <div style={{position:'absolute',top:'calc(100% + 8px)',right:0,width:360,maxHeight:480,overflowY:'auto',background:'white',borderRadius:8,boxShadow:'0 8px 24px rgba(0,0,0,0.15)',zIndex:1000}}>
          <div style={{padding:'12px 16px',borderBottom:'1px solid #eee',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <strong>Notificações</strong>
            {naoLidas > 0 && (
              <button onClick={onMarcarTodas} style={{fontSize:12,background:'none',border:'none',color:'#3b82f6',cursor:'pointer'}}>
                Marcar todas como lidas
              </button>
            )}
          </div>
          {notifications.length === 0 ? (
            <div style={{padding:24,textAlign:'center',color:'#999',fontSize:13}}>Nenhuma notificação</div>
          ) : (
            notifications.map(n => {
              const icone = n.tipo === 'agendamento_1h' ? '⏰' : n.tipo === 'retorno_helena' ? '🔄' : '👤';
              return (
                <div key={n.id} onClick={() => { onItemClick(n); setOpen(false); }}
                  style={{padding:'12px 16px',borderBottom:'1px solid #f3f4f6',cursor:'pointer',background:n.lida?'white':'#eff6ff'}}>
                  <div style={{fontSize:13,fontWeight:n.lida?400:600,marginBottom:2}}>{icone} {n.titulo}</div>
                  {n.corpo && <div style={{fontSize:12,color:'#666',marginBottom:2}}>{n.corpo}</div>}
                  <div style={{fontSize:11,color:'#999'}}>{new Date(n.created_at).toLocaleString('pt-BR')}</div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

function TagPill({ nome, cor, size = 'sm', onRemove }) {
  const styles = {
    sm: { fontSize: 10, padding: '2px 8px', borderRadius: 10 },
    md: { fontSize: 12, padding: '4px 10px', borderRadius: 12 },
  }[size];
  return (
    <span style={{
      ...styles,
      background: cor,
      color: '#fff',
      fontWeight: 600,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      whiteSpace: 'nowrap',
    }}>
      {nome}
      {onRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          style={{background:'transparent',border:'none',color:'#fff',cursor:'pointer',padding:0,fontSize:'inherit',opacity:0.7}}
          title="Remover tag"
        >×</button>
      )}
    </span>
  );
}

function TagsDoLead({ tagsCatalogo, tagsDoLead, onAdicionar, onRemover }) {
  const [picker, setPicker] = useState(false);
  const tagsDisponiveis = tagsCatalogo.filter(t => !tagsDoLead.some(lt => lt.id === t.id));
  return (
    <div style={{ padding: '12px 16px' }}>
      <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>TAGS</div>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
        {tagsDoLead.map(t => (
          <TagPill key={t.id} nome={t.nome} cor={t.cor} size="md" onRemove={() => onRemover(t.id)} />
        ))}
        <button
          onClick={() => setPicker(!picker)}
          style={{fontSize:12,padding:'4px 10px',borderRadius:12,border:'1px dashed #999',background:'transparent',cursor:'pointer',color:'#666'}}
        >+ Adicionar tag</button>
      </div>
      {picker && (
        <div style={{marginTop:8,padding:8,border:'1px solid #ddd',borderRadius:6,background:'#f9f9f9',maxHeight:200,overflowY:'auto'}}>
          {tagsDisponiveis.length === 0 ? (
            <div style={{fontSize:12,color:'#999'}}>Nenhuma tag disponível. Crie uma nova em "Gerenciar tags".</div>
          ) : (
            tagsDisponiveis.map(t => (
              <div key={t.id} onClick={() => { onAdicionar(t.id); setPicker(false); }}
                style={{padding:'4px 0',cursor:'pointer',display:'flex',alignItems:'center',gap:6}}>
                <TagPill nome={t.nome} cor={t.cor} size="sm" />
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function FiltroTagsKanban({ tagsCatalogo, filtroTags, setFiltroTags }) {
  const [open, setOpen] = useState(false);
  function toggle(tagId) {
    setFiltroTags(prev => prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]);
  }
  return (
    <div style={{position:'relative',display:'inline-block'}}>
      <button onClick={() => setOpen(!open)}
        style={{padding:'4px 12px',borderRadius:2,border:'1px solid var(--border)',background:filtroTags.length>0?'#eff6ff':'none',cursor:'pointer',fontSize:10,color:'var(--mid)',fontFamily:"'Jost',sans-serif",letterSpacing:'.06em',whiteSpace:'nowrap'}}>
        🏷️ Tags {filtroTags.length > 0 && `(${filtroTags.length})`}
      </button>
      {open && (
        <div style={{position:'absolute',top:'calc(100% + 4px)',left:0,background:'white',border:'1px solid #ddd',borderRadius:6,boxShadow:'0 4px 12px rgba(0,0,0,0.1)',minWidth:200,maxHeight:300,overflowY:'auto',zIndex:100}}>
          {filtroTags.length > 0 && (
            <button onClick={() => setFiltroTags([])}
              style={{width:'100%',padding:8,fontSize:12,background:'none',border:'none',borderBottom:'1px solid #eee',cursor:'pointer',color:'#3b82f6'}}>
              Limpar filtros
            </button>
          )}
          {tagsCatalogo.map(t => (
            <label key={t.id}
              style={{display:'flex',alignItems:'center',gap:8,padding:'8px 12px',cursor:'pointer',background:filtroTags.includes(t.id)?'#f0f9ff':'transparent'}}>
              <input type="checkbox" checked={filtroTags.includes(t.id)} onChange={() => toggle(t.id)}/>
              <TagPill nome={t.nome} cor={t.cor} size="sm" />
            </label>
          ))}
          {tagsCatalogo.length === 0 && (
            <div style={{padding:12,fontSize:12,color:'#999',textAlign:'center'}}>Nenhuma tag criada</div>
          )}
        </div>
      )}
    </div>
  );
}

function ModalGerenciarTags({ tagsCatalogo, onClose, userEmail, onRefresh }) {
  const [novoNome, setNovoNome] = useState('');
  const [novaCor, setNovaCor] = useState('#3b82f6');
  async function criar() {
    if (!novoNome.trim()) return;
    const { error } = await supabase.from('leblanc_tags')
      .insert({ nome: novoNome.trim(), cor: novaCor, criado_por: userEmail });
    if (error) {
      alert(error.message.includes('duplicate') ? 'Tag com esse nome já existe' : error.message);
      return;
    }
    setNovoNome('');
    setNovaCor('#3b82f6');
    await onRefresh();
  }
  async function deletar(tagId) {
    if (!confirm('Deletar essa tag? Será removida de todos os leads.')) return;
    await supabase.from('leblanc_tags').delete().eq('id', tagId);
    await onRefresh();
  }
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}} onClick={onClose}>
      <div style={{background:'white',borderRadius:8,padding:20,width:480,maxHeight:'80vh',overflowY:'auto'}} onClick={(e) => e.stopPropagation()}>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:16,alignItems:'center'}}>
          <h3 style={{margin:0}}>Gerenciar Tags</h3>
          <button onClick={onClose} style={{border:'none',background:'none',fontSize:20,cursor:'pointer'}}>×</button>
        </div>
        <div style={{display:'flex',gap:8,marginBottom:16,padding:12,background:'#f9fafb',borderRadius:6}}>
          <input type="text" placeholder="Nome da tag" value={novoNome}
            onChange={(e) => setNovoNome(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') criar(); }}
            style={{flex:1,padding:6,border:'1px solid #ddd',borderRadius:4}}/>
          <input type="color" value={novaCor} onChange={(e) => setNovaCor(e.target.value)}
            style={{width:40,height:32,border:'1px solid #ddd',borderRadius:4,padding:0,cursor:'pointer'}}/>
          <button onClick={criar}
            style={{padding:'6px 14px',background:'#3b82f6',color:'white',border:'none',borderRadius:4,cursor:'pointer'}}>
            Criar
          </button>
        </div>
        <div>
          {tagsCatalogo.length === 0 && (
            <div style={{padding:16,textAlign:'center',color:'#999',fontSize:13}}>Nenhuma tag criada ainda</div>
          )}
          {tagsCatalogo.map(t => (
            <div key={t.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid #eee'}}>
              <TagPill nome={t.nome} cor={t.cor} size="md" />
              <button onClick={() => deletar(t.id)}
                style={{fontSize:12,color:'#dc2626',background:'none',border:'none',cursor:'pointer'}}>
                Deletar
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const btnIcon = {
  background: 'transparent', border: 'none', cursor: 'pointer',
  fontSize: 16, padding: 2, lineHeight: 1
};

function TarefaCard({ tarefa, atrasada, concluida, onConcluir, onReabrir, onDeletar }) {
  const cor = concluida ? '#94a3b8' : atrasada ? '#ef4444' : '#3b82f6';
  return (
    <div style={{
      padding: 10, marginBottom: 8, borderLeft: `3px solid ${cor}`,
      background: concluida ? '#f9fafb' : 'white',
      borderRadius: 4, border: '1px solid #eee',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, textDecoration: concluida ? 'line-through' : 'none', color: concluida ? '#999' : '#000' }}>
            {tarefa.titulo}
          </div>
          {tarefa.descricao && (
            <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>{tarefa.descricao}</div>
          )}
          {tarefa.prazo && (
            <div style={{ fontSize: 11, color: atrasada ? '#ef4444' : '#888', marginTop: 4 }}>
              {atrasada && '⚠️ '}
              {new Date(tarefa.prazo).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
          <div style={{ fontSize: 10, color: '#aaa', marginTop: 2 }}>
            {tarefa.tipo} • {tarefa.vendedor}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {concluida ? (
            <button onClick={onReabrir} style={btnIcon} title="Reabrir">↩</button>
          ) : (
            <button onClick={onConcluir} style={{...btnIcon, color: '#10b981'}} title="Concluir">✓</button>
          )}
          <button onClick={onDeletar} style={{...btnIcon, color: '#ef4444'}} title="Deletar">×</button>
        </div>
      </div>
    </div>
  );
}

function TarefasDoLead({ leadId, leadVendor, userVendorName }) {
  const [tarefas, setTarefas] = useState([]);
  const [criando, setCriando] = useState(false);
  const [formData, setFormData] = useState({ titulo: '', descricao: '', prazo: '', tipo: 'followup' });

  async function carregar() {
    const { data } = await supabase.from('leblanc_tarefas')
      .select('*')
      .eq('lead_id', leadId)
      .order('prazo', { ascending: true, nullsFirst: false });
    setTarefas(data || []);
  }
  useEffect(() => { carregar(); }, [leadId]);

  async function criar() {
    if (!formData.titulo.trim()) { alert('Título obrigatório'); return; }
    const vendedorAtribuido = userVendorName || leadVendor || 'Geral';
    const { error } = await supabase.from('leblanc_tarefas').insert({
      lead_id: leadId,
      vendedor: vendedorAtribuido,
      titulo: formData.titulo.trim(),
      descricao: formData.descricao.trim() || null,
      tipo: formData.tipo,
      prazo: formData.prazo ? new Date(formData.prazo).toISOString() : null,
      status: 'pendente',
    });
    if (error) { alert(error.message); return; }
    setFormData({ titulo: '', descricao: '', prazo: '', tipo: 'followup' });
    setCriando(false);
    await carregar();
  }

  async function concluir(id) {
    await supabase.from('leblanc_tarefas')
      .update({ status: 'concluida', completed_at: new Date().toISOString() })
      .eq('id', id);
    await carregar();
  }
  async function reabrir(id) {
    await supabase.from('leblanc_tarefas')
      .update({ status: 'pendente', completed_at: null })
      .eq('id', id);
    await carregar();
  }
  async function deletar(id) {
    if (!confirm('Deletar essa tarefa?')) return;
    await supabase.from('leblanc_tarefas').delete().eq('id', id);
    await carregar();
  }

  const agora = new Date();
  const pendentes = tarefas.filter(t => t.status === 'pendente');
  const concluidas = tarefas.filter(t => t.status === 'concluida');

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <strong style={{ fontSize: 14 }}>Tarefas ({pendentes.length} pendentes)</strong>
        <button onClick={() => setCriando(!criando)}
          style={{ fontSize: 12, padding: '4px 10px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
          {criando ? 'Cancelar' : '+ Nova tarefa'}
        </button>
      </div>
      {criando && (
        <div style={{ padding: 12, background: '#f9fafb', borderRadius: 6, marginBottom: 16 }}>
          <input type="text" placeholder="Título da tarefa *" value={formData.titulo}
            onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
            style={{ width: '100%', padding: 6, marginBottom: 6, border: '1px solid #ddd', borderRadius: 4, boxSizing: 'border-box' }}/>
          <textarea placeholder="Descrição (opcional)" value={formData.descricao}
            onChange={(e) => setFormData({ ...formData, descricao: e.target.value })} rows={2}
            style={{ width: '100%', padding: 6, marginBottom: 6, border: '1px solid #ddd', borderRadius: 4, boxSizing: 'border-box', fontFamily: 'inherit' }}/>
          <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
            <input type="datetime-local" value={formData.prazo}
              onChange={(e) => setFormData({ ...formData, prazo: e.target.value })}
              style={{ flex: 1, padding: 6, border: '1px solid #ddd', borderRadius: 4 }}/>
            <select value={formData.tipo} onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
              style={{ padding: 6, border: '1px solid #ddd', borderRadius: 4 }}>
              <option value="followup">Follow-up</option>
              <option value="ligacao">Ligação</option>
              <option value="reuniao">Reunião</option>
              <option value="envio">Envio</option>
              <option value="visita">Visita</option>
            </select>
          </div>
          <button onClick={criar}
            style={{ width: '100%', padding: 8, background: '#10b981', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
            Criar tarefa
          </button>
        </div>
      )}
      {pendentes.map(t => {
        const atrasada = t.prazo && new Date(t.prazo) < agora;
        return (
          <TarefaCard key={t.id} tarefa={t} atrasada={atrasada}
            onConcluir={() => concluir(t.id)} onDeletar={() => deletar(t.id)}/>
        );
      })}
      {concluidas.length > 0 && (
        <details style={{ marginTop: 16 }}>
          <summary style={{ cursor: 'pointer', fontSize: 12, color: '#666' }}>
            Concluídas ({concluidas.length})
          </summary>
          {concluidas.map(t => (
            <TarefaCard key={t.id} tarefa={t} concluida={true}
              onReabrir={() => reabrir(t.id)} onDeletar={() => deletar(t.id)}/>
          ))}
        </details>
      )}
      {tarefas.length === 0 && !criando && (
        <div style={{ textAlign: 'center', color: '#999', padding: 24, fontSize: 13 }}>
          Nenhuma tarefa criada ainda
        </div>
      )}
    </div>
  );
}

function PaginaTarefas({ userVendorName, userRole, abrirLead }) {
  const [tarefas, setTarefas] = useState([]);
  const [filtroStatus, setFiltroStatus] = useState('pendentes');
  const [leadNames, setLeadNames] = useState({});

  async function carregar() {
    let query = supabase.from('leblanc_tarefas').select('*');
    if (userRole !== 'gerente' && userVendorName) {
      query = query.eq('vendedor', userVendorName);
    }
    const { data } = await query.order('prazo', { ascending: true, nullsFirst: false });
    setTarefas(data || []);
  }
  useEffect(() => {
    carregar();
    const i = setInterval(carregar, 60000);
    return () => clearInterval(i);
  }, [userRole, userVendorName]);

  useEffect(() => {
    async function fetchNames() {
      const leadIds = [...new Set(tarefas.map(t => t.lead_id).filter(Boolean))];
      if (leadIds.length === 0) return;
      const { data } = await supabase.schema('leblanc').from('leads').select('id, name').in('id', leadIds);
      const map = {};
      (data || []).forEach(l => { map[l.id] = l.name; });
      setLeadNames(map);
    }
    fetchNames();
  }, [tarefas]);

  const agora = new Date();
  const fimHoje = new Date(); fimHoje.setHours(23, 59, 59, 999);
  const inicioHoje = new Date(); inicioHoje.setHours(0, 0, 0, 0);

  const filtradas = tarefas.filter(t => {
    if (filtroStatus === 'pendentes') return t.status === 'pendente';
    if (filtroStatus === 'hoje') {
      if (t.status !== 'pendente' || !t.prazo) return false;
      const p = new Date(t.prazo);
      return p >= inicioHoje && p <= fimHoje;
    }
    if (filtroStatus === 'atrasadas') {
      return t.status === 'pendente' && t.prazo && new Date(t.prazo) < agora;
    }
    if (filtroStatus === 'concluidas') return t.status === 'concluida';
    return true;
  });

  const counts = {
    pendentes: tarefas.filter(t => t.status === 'pendente').length,
    hoje: tarefas.filter(t => {
      if (t.status !== 'pendente' || !t.prazo) return false;
      const p = new Date(t.prazo);
      return p >= inicioHoje && p <= fimHoje;
    }).length,
    atrasadas: tarefas.filter(t => t.status === 'pendente' && t.prazo && new Date(t.prazo) < agora).length,
    concluidas: tarefas.filter(t => t.status === 'concluida').length,
  };

  return (
    <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>
      <h2 style={{ marginBottom: 16, fontFamily: "'Cormorant Garamond',serif", fontWeight: 400 }}>
        📋 {userRole === 'gerente' ? 'Todas as Tarefas' : 'Minhas Tarefas'}
      </h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { id: 'pendentes', label: `Pendentes (${counts.pendentes})` },
          { id: 'hoje', label: `Hoje (${counts.hoje})`, cor: '#3b82f6' },
          { id: 'atrasadas', label: `Atrasadas (${counts.atrasadas})`, cor: '#ef4444' },
          { id: 'concluidas', label: `Concluídas (${counts.concluidas})`, cor: '#10b981' },
          { id: 'todas', label: 'Todas' },
        ].map(f => (
          <button key={f.id} onClick={() => setFiltroStatus(f.id)}
            style={{
              padding: '6px 12px', borderRadius: 6, cursor: 'pointer',
              border: '1px solid #ddd',
              background: filtroStatus === f.id ? (f.cor || '#000') : 'white',
              color: filtroStatus === f.id ? 'white' : '#333',
              fontSize: 13,
            }}>
            {f.label}
          </button>
        ))}
      </div>
      {filtradas.length === 0 ? (
        <div style={{ padding: 48, textAlign: 'center', color: '#999' }}>Nenhuma tarefa nesse filtro</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtradas.map(t => {
            const atrasada = t.status === 'pendente' && t.prazo && new Date(t.prazo) < agora;
            return (
              <div key={t.id}
                onClick={() => t.lead_id && abrirLead(t.lead_id)}
                style={{
                  padding: 14, borderRadius: 8, border: '1px solid #eee',
                  background: 'white', cursor: t.lead_id ? 'pointer' : 'default',
                  borderLeft: `4px solid ${atrasada ? '#ef4444' : t.status === 'concluida' ? '#10b981' : '#3b82f6'}`,
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <div style={{ fontWeight: 600, textDecoration: t.status === 'concluida' ? 'line-through' : 'none' }}>
                    {t.titulo}
                  </div>
                  <div style={{ fontSize: 11, color: '#888' }}>
                    {t.prazo && new Date(t.prazo).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                {t.descricao && (
                  <div style={{ fontSize: 13, color: '#555', marginBottom: 4 }}>{t.descricao}</div>
                )}
                <div style={{ fontSize: 11, color: '#888' }}>
                  {leadNames[t.lead_id] || t.lead_id} • {t.vendedor} • {t.tipo}
                  {atrasada && ' • ⚠️ atrasada'}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function VendorAvatar({ name }) {
  if (!name) return <div className="novav" title="Sem vendedor">—</div>;
  const v = VENDOR_MAP[name] || { initials: name.slice(0,2).toUpperCase() };
  return <div className="vav" title={name}>{v.initials}</div>;
}

function MediaMessage({ tipo, media_url, media_filename, media_duration_sec, media_caption }) {
  const [signedUrl, setSignedUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fetchUrl() {
      if (!media_url) {
        setError(true);
        setLoading(false);
        return;
      }
      try {
        const { data, error: e } = await supabase.storage
          .from('leblanc-midias')
          .createSignedUrl(media_url, 3600);
        if (cancelled) return;
        if (e || !data?.signedUrl) {
          setError(true);
        } else {
          setSignedUrl(data.signedUrl);
        }
      } catch (_) {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchUrl();
    return () => { cancelled = true; };
  }, [media_url]);

  if (loading) {
    return (
      <div style={{ fontSize: 12, color: '#999', padding: 6 }}>
        ⏳ Carregando mídia...
      </div>
    );
  }

  if (error || !signedUrl) {
    return (
      <div style={{ fontSize: 12, color: '#c00', padding: 6 }}>
        ⚠️ Mídia indisponível
      </div>
    );
  }

  if (tipo === 'audio') {
    return (
      <div style={{ padding: '4px 0' }}>
        <audio
          controls
          src={signedUrl}
          style={{ width: '100%', maxWidth: 300, display: 'block' }}
        >
          Seu navegador não suporta áudio
        </audio>
        <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>
          🎵 {media_filename || 'audio'}
          {media_duration_sec ? ` • ${media_duration_sec}s` : ''}
        </div>
      </div>
    );
  }

  if (tipo === 'imagem') {
    return (
      <div style={{ padding: '4px 0' }}>
        <img
          src={signedUrl}
          alt={media_caption || 'Imagem'}
          style={{
            maxWidth: 250,
            maxHeight: 250,
            borderRadius: 8,
            cursor: 'pointer',
            display: 'block',
          }}
          onClick={() => window.open(signedUrl, '_blank')}
        />
        {media_caption && (
          <div style={{ fontSize: 13, marginTop: 4 }}>{media_caption}</div>
        )}
      </div>
    );
  }

  if (tipo === 'documento') {
    return (
      <div style={{ padding: '4px 0' }}>
        <a
          href={signedUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 14px',
            border: '1px solid #ddd',
            borderRadius: 8,
            textDecoration: 'none',
            color: '#333',
            background: '#f9f9f9',
          }}
        >
          📄 {media_filename || 'Documento'}
        </a>
        {media_caption && (
          <div style={{ fontSize: 13, marginTop: 4 }}>{media_caption}</div>
        )}
      </div>
    );
  }

  return null;
}

function LeadCard({ lead, selected, onClick, onDragStart, onDragEnd, tagsDoLead = [] }) {
  const tcls = { hot:"th", warm:"tw", cold:"tc" }[lead.temperature] || "tc";
  const tlabel = { hot:"Quente", warm:"Morno", cold:"Frio" }[lead.temperature] || "Frio";
  const ts = new Date(lead.updated_at);
  const diff = Math.floor((Date.now() - ts) / 60000);
  const ago = diff < 60 ? `${diff}min` : diff < 1440 ? `${Math.floor(diff/60)}h` : `${Math.floor(diff/1440)}d`;
  return (
    <div className={`lcard${selected?" sel":""}`} onClick={onClick} draggable={true} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <div className="ctop">
        <div className="lname">{lead.name}</div>
        <div className={`ttag ${tcls}`}>{tlabel}</div>
      </div>
      <div className="cmeta">
        <div className="mrow"><span>◎</span><span>{lead.city||"—"}</span></div>
        <div className="mrow"><span>◈</span><span>{lead.product||"—"}</span></div>
      </div>
      {tagsDoLead.length > 0 && (
        <div style={{display:'flex',gap:4,marginTop:6,marginBottom:6,flexWrap:'wrap'}}>
          {tagsDoLead.slice(0,3).map(t => <TagPill key={t.id} nome={t.nome} cor={t.cor} size="sm" />)}
          {tagsDoLead.length > 3 && <span style={{fontSize:10,color:'#666'}}>+{tagsDoLead.length - 3}</span>}
        </div>
      )}
      <div className="cbot">
        <div className="btag">{lead.budget||"—"}</div>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <span className="ctime">{ago}</span>
          <VendorAvatar name={lead.vendor}/>
        </div>
      </div>
    </div>
  );
}

function Drawer({ lead, user, onClose, onUpdate, onAdvance, tagsCatalogo = [], tagsDoLead = [], onAdicionarTag, onRemoverTag, vendedoresDisponiveis = [] }) {
  const [tab, setTab] = useState('ficha');
  const [conversas, setConversas] = useState([]);
  const [vendorConversas, setVendorConversas] = useState([]);
  const [tarefas, setTarefas] = useState([]);
  const [arquivos, setArquivos] = useState([]);
  const [agendamentos, setAgendamentos] = useState([]);
  const [novoAg, setNovoAg] = useState({ data_hora: '', tipo: 'visita' });
  const [msg, setMsg] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [novaTarefa, setNovaTarefa] = useState({ descricao: '', prazo: '', tipo: 'ligacao' });
  const [notes, setNotes] = useState('');
  const [observacoes, setObservacoes] = useState([]);
  const [novaObs, setNovaObs] = useState('');
  const [valorLocal, setValorLocal] = useState('');
  const [salvandoObs, setSalvandoObs] = useState(false);
  const [helenaChats, setHelenaChats] = useState([]);
  const [helenaHistory, setHelenaHistory] = useState([]);
  const [followups, setFollowups] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const convRef = useRef(null);

  useEffect(() => { setNotes(lead?.notes || ''); }, [lead?.id]);
  useEffect(() => { setValorLocal(lead?.valor_estimado != null ? String(lead.valor_estimado) : ''); }, [lead?.id]);

  useEffect(() => { if (lead?.id) loadObservacoes(); }, [lead?.id]);

  useEffect(() => {
    if (!lead) return;
    setConversas([]); setTarefas([]); setArquivos([]); setHelenaChats([]); setHelenaHistory([]); setFollowups([]); setTimeline([]); setAgendamentos([]);
    if (tab === 'conversa') loadConversas();
    if (tab === 'tarefas') loadTarefas();
    if (tab === 'agendamentos') loadAgendamentos();
    if (tab === 'arquivos') loadArquivos();
    if (tab === 'historico') loadTimeline();
    if (tab === 'helena') fetchHelenaHistory(lead);
  }, [lead?.id, tab]);

  async function loadConversas() {
    const { data, error } = await supabase
      .from('leblanc_conversas')
      .select('id, de, mensagem, vendedor, created_at, tipo, media_url, media_filename, media_duration_sec, media_caption')
      .or(`lead_id.eq.${lead.id},telefone_cliente.eq.${lead.phone}`)
      .order('created_at', { ascending: true });
    if (error) console.error('Erro conversa vendedor:', error);
    setVendorConversas(data || []);
    setTimeout(() => convRef.current?.scrollTo(0, convRef.current.scrollHeight), 150);
  }

  async function loadTarefas() {
    const { data } = await supabase
      .from('leblanc_tarefas').select('*')
      .eq('lead_id', lead.id).order('prazo', { ascending: true });
    setTarefas(data || []);
  }

  async function loadAgendamentos() {
    const { data } = await supabase
      .from('leblanc_agendamentos').select('*')
      .eq('lead_id', lead.id).order('data_hora', { ascending: false });
    setAgendamentos(data || []);
  }
  async function criarAgendamento() {
    if (!novoAg.data_hora) return;
    const { error } = await supabase
      .from('leblanc_agendamentos')
      .insert({ lead_id: lead.id, vendor: lead.vendor || null,
        data_hora: new Date(novoAg.data_hora).toISOString(),
        tipo: novoAg.tipo, status: 'agendado' });
    if (!error) { setNovoAg({ data_hora: '', tipo: 'visita' }); loadAgendamentos(); }
    else { console.error('Erro ao criar agendamento:', error); alert('Erro ao criar. Tente de novo.'); }
  }
  async function mudarStatusAg(id, status) {
    const { error } = await supabase
      .from('leblanc_agendamentos')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (!error) loadAgendamentos();
  }

  async function loadArquivos() {
    const { data, error } = await supabase.storage
      .from('leblanc-arquivos')
      .list(`leads/${lead.id}`, { limit: 100, offset: 0, sortBy: { column: 'created_at', order: 'desc' } });
    if (!error && data) {
      const arquivosComUrl = data
        .filter(f => f.name !== '.emptyFolderPlaceholder')
        .map(f => ({
          ...f,
          url: `https://kptgtftvyiyxynxkpmaw.supabase.co/storage/v1/object/public/leblanc-arquivos/leads/${lead.id}/${f.name}`
        }));
      setArquivos(arquivosComUrl);
    } else {
      setArquivos([]);
    }
  }

  async function fetchHelenaHistory(lead) {
    const leadPhone = lead.phone;
    const { data: sdrData, error } = await supabase
      .from('leblanc_sdr_chats')
      .select('id, session_id, message, created_at')
      .eq('session_id', leadPhone)
      .order('created_at', { ascending: true, nullsFirst: true })
      .order('id', { ascending: true });
    if (error) console.error('Erro Helena:', error);

    const { data: midiasHelena } = await supabase
      .from('leblanc_conversas')
      .select('id, telefone_cliente, de, tipo, mensagem, media_url, media_filename, media_duration_sec, media_caption, created_at')
      .eq('vendedor', 'Helena')
      .eq('telefone_cliente', leadPhone)
      .in('tipo', ['audio', 'imagem', 'documento'])
      .order('created_at', { ascending: true });

    const mensagensTexto = (sdrData || []).map(m => ({
      source: 'helena',
      id: `h-${m.id}`,
      papel: m.message?.type === 'ai' ? 'helena' : 'cliente',
      content: m.message?.content || '',
      created_at: m.created_at,
      sortKey: m.created_at ? new Date(m.created_at).getTime() : m.id,
    }));

    const mensagensMidia = (midiasHelena || []).map(m => ({
      source: 'midia',
      id: `m-${m.id}`,
      papel: m.de === 'cliente' ? 'cliente' : 'helena',
      media: {
        tipo: m.tipo,
        media_url: m.media_url,
        media_filename: m.media_filename,
        media_duration_sec: m.media_duration_sec,
        media_caption: m.media_caption,
      },
      created_at: m.created_at,
      sortKey: m.created_at ? new Date(m.created_at).getTime() : m.id,
    }));

    const conversa = [...mensagensTexto, ...mensagensMidia].sort((a, b) => a.sortKey - b.sortKey);
    setHelenaHistory(conversa);

    const { data: fups } = await supabase
      .from('followups')
      .select('*')
      .eq('lead_id', lead.id)
      .order('created_at', { ascending: true });
    setFollowups(fups || []);
  }

  async function loadHelena() {
    const phone = lead.phone?.replace(/\D/g,'');
    const { data } = await supabase.from('leblanc_sdr_chats')
      .select('*').eq('session_id', phone).order('id',{ascending:true});
    setHelenaChats(data||[]);
  }

  async function loadTimeline() {
    const { data: convs } = await supabase
      .from('leblanc_conversas')
      .select('de, created_at')
      .or(`lead_id.eq.${lead.id},telefone_cliente.eq.${lead.phone}`)
      .order('created_at', { ascending: true });
    const { data: tasks } = await supabase
      .from('leblanc_tarefas')
      .select('titulo, status, prazo, created_at')
      .eq('lead_id', lead.id);
    const { data: etapas } = await supabase
      .from('leblanc_historico_eventos')
      .select('acao, icone, created_at')
      .eq('lead_id', lead.id);

    const eventos = [];
    if (lead.created_at) eventos.push({ icone:'✨', texto:'Lead criado pela Helena', data: lead.created_at });
    if (lead.assigned_at) eventos.push({ icone:'👤', texto:`Passado para ${lead.vendor||'vendedor'}`, data: lead.assigned_at });
    if (convs?.length) {
      eventos.push({ icone:'💬', texto:'Primeira mensagem trocada', data: convs[0].created_at });
      const ult = convs[convs.length-1];
      eventos.push({ icone:'💬', texto:`Última mensagem (${ult.de === 'cliente' ? 'cliente' : 'vendedor'})`, data: ult.created_at });
    }
    (tasks||[]).forEach(t => {
      eventos.push({ icone:'📞', texto:`Tarefa: ${t.titulo}`, data: t.created_at });
      if (t.status === 'concluida') eventos.push({ icone:'✅', texto:`Tarefa concluída: ${t.titulo}`, data: t.prazo || t.created_at });
    });
    (etapas||[]).forEach(e => eventos.push({ icone: e.icone || '🔄', texto: e.acao, data: e.created_at }));

    eventos.sort((a,b) => new Date(b.data) - new Date(a.data));
    setTimeline(eventos);
  }

  async function loadObservacoes() {
    const { data, error } = await supabase
      .from('leblanc_observacoes')
      .select('id, texto, autor, created_at')
      .eq('lead_id', lead.id)
      .order('created_at', { ascending: false });
    if (!error) setObservacoes(data || []);
  }
  async function salvarObservacao() {
    const texto = novaObs.trim();
    if (!texto) return;
    setSalvandoObs(true);
    const { error } = await supabase
      .from('leblanc_observacoes')
      .insert({ lead_id: lead.id, texto, autor: lead.vendor || 'vendedor' });
    setSalvandoObs(false);
    if (!error) { setNovaObs(''); loadObservacoes(); }
    else { console.error('Erro ao salvar observação:', error); alert('Erro ao salvar. Tente de novo.'); }
  }

  async function enviarMensagem() {
    if (!msg.trim() || enviando) return;
    setEnviando(true);
    try {
      await fetch('https://dinastia-n8n-editor.sw8ro0.easypanel.host/webhook/crm-send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendedor: lead.vendor,
          telefone: lead.phone?.replace(/\D/g, ''),
          mensagem: msg
        })
      });
      setMsg('');
      setTimeout(loadConversas, 1200);
    } catch { alert('Erro ao enviar mensagem'); }
    setEnviando(false);
  }

  async function adicionarTarefa() {
    if (!novaTarefa.descricao.trim()) return;
    const { data, error } = await supabase.from('leblanc_tarefas').insert({
      lead_id: lead.id,
      vendedor: lead.vendor || '',
      titulo: novaTarefa.descricao,
      prazo: novaTarefa.prazo ? new Date(novaTarefa.prazo).toISOString() : null,
      status: 'pendente'
    }).select().single();
    if (!error && data) {
      setTarefas(prev => [...prev, data]);
      setNovaTarefa({ descricao: '', prazo: '', tipo: 'ligacao' });
    } else {
      console.error('Erro ao salvar tarefa:', error);
      loadTarefas();
    }
  }

  async function toggleTarefa(id, status) {
    await supabase.from('leblanc_tarefas')
      .update({ status: status === 'pendente' ? 'concluida' : 'pendente' }).eq('id', id);
    loadTarefas();
  }

  async function uploadArquivo(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      alert(`Arquivo muito grande: ${(file.size / 1024 / 1024).toFixed(1)} MB. Máximo: 50 MB.`);
      return;
    }
    const safeName = sanitizeFilename(file.name);
    const path = `leads/${lead.id}/${Date.now()}_${safeName}`;
    const { error } = await supabase.storage.from('leblanc-arquivos').upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || 'application/octet-stream',
    });
    if (error) {
      console.error('Upload arquivo falhou:', error);
      alert(`Não foi possível enviar o arquivo: ${error.message}`);
      return;
    }
    loadArquivos();
  }

  if (!lead) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100%',color:'var(--muted)',fontSize:13}}>
      Selecione um lead
    </div>
  );

  const TABS = [
    { id:'ficha', label:'Ficha' },
    { id:'helena', label:'Helena' },
    { id:'conversa', label:'Conversa' },
    { id:'tarefas', label:'Tarefas' },
    { id:'agendamentos', label:'Agendamentos' },
    { id:'arquivos', label:'Arquivos' },
    { id:'historico', label:'Histórico' },
  ];

  const S = {
    infoBox: { background:'var(--bg2)',borderRadius:6,padding:'8px 10px',marginBottom:0 },
    infoLabel: { fontSize:10,color:'var(--muted)',marginBottom:2 },
    infoVal: { fontSize:13,fontWeight:500 },
    sectionTitle: { fontSize:10,fontWeight:600,letterSpacing:'.1em',color:'var(--muted)',marginBottom:10 },
  };

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%'}}>
      <style>{`
        .chat-scroll::-webkit-scrollbar { width: 8px; }
        .chat-scroll::-webkit-scrollbar-track { background: #1a1a1a; border-radius: 4px; }
        .chat-scroll::-webkit-scrollbar-thumb { background: #555; border-radius: 4px; }
        .chat-scroll::-webkit-scrollbar-thumb:hover { background: #888; }
        .drawer-body::-webkit-scrollbar { width: 8px; }
        .drawer-body::-webkit-scrollbar-track { background: #111; }
        .drawer-body::-webkit-scrollbar-thumb { background: #444; border-radius: 4px; }
      `}</style>
      {/* Header */}
      <div style={{padding:'16px 16px 12px',borderBottom:'1px solid var(--border)'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
          <div>
            <div style={{fontFamily:'var(--serif)',fontSize:18,fontWeight:500,lineHeight:1.2}}>{lead.name}</div>
            <div style={{fontSize:11,color:'var(--muted)',marginTop:4,display:'flex',gap:6,alignItems:'center'}}>
              <span>{lead.id}</span>
              <span>·</span>
              <span className={`temp ${lead.temperature}`}>{lead.temperature}</span>
              <span>·</span>
              <span>{lead.vendor}</span>
            </div>
          </div>
          <button onClick={onClose}
            style={{background:'none',border:'none',cursor:'pointer',fontSize:14,color:'var(--muted)',padding:'4px 8px'}}>✕</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:'flex',borderBottom:'1px solid var(--border)',padding:'0 8px',overflowX:'auto'}}>
        {TABS.map(tabItem => (
          <button key={tabItem.id} onClick={() => setTab(tabItem.id)}
            style={{
              padding:'9px 10px',fontSize:11,fontWeight:500,whiteSpace:'nowrap',
              border:'none',background:'none',cursor:'pointer',
              borderBottom: tab===tabItem.id ? '2px solid var(--dark)' : '2px solid transparent',
              color: tab===tabItem.id ? 'var(--dark)' : 'var(--muted)',
            }}>
            {tabItem.label}
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="dbody drawer-body" style={{
        flex:1,overflowY:'auto',
        padding: tab==='conversa' ? 0 : 14,
        display:'flex',flexDirection:'column'
      }}>

        {/* ── FICHA ── */}
        {tab==='ficha' && (
          <div>
            <TagsDoLead
              tagsCatalogo={tagsCatalogo}
              tagsDoLead={tagsDoLead}
              onAdicionar={(tagId) => onAdicionarTag && onAdicionarTag(lead.id, tagId)}
              onRemover={(tagId) => onRemoverTag && onRemoverTag(lead.id, tagId)}
            />
            <div style={{marginBottom:16}}>
              <div style={S.sectionTitle}>ETAPA NO FUNIL</div>
              <select
                value={lead.stage || ''}
                onChange={async (e) => {
                  const novoStage = e.target.value;
                  if (novoStage === lead.stage) return;
                  const { error } = await supabase.schema('leblanc').from('leads')
                    .update({ stage: novoStage, updated_at: new Date().toISOString() })
                    .eq('id', lead.id);
                  if (error) {
                    console.error('Update stage (drawer) falhou:', error);
                    alert(`Não foi possível atualizar etapa: ${error.message}`);
                    return;
                  }
                  const labelDestino = STAGES.find(s => s.id === novoStage)?.label || novoStage;
                  await supabase.from('leblanc_historico_eventos').insert({
                    lead_id: lead.id, tipo: 'mudanca_etapa', acao: `Movido para "${labelDestino}"`, icone: '🔄'
                  });
                  onUpdate && onUpdate({ ...lead, stage: novoStage });
                }}
                style={{width:'100%',padding:'8px 10px',border:'1px solid var(--border)',borderRadius:6,fontSize:13,fontWeight:500,background:'#fff',cursor:'pointer'}}>
                {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
            <div style={S.sectionTitle}>FICHA DO CLIENTE</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginBottom:6}}>
              <div style={S.infoBox}><div style={S.infoLabel}>Telefone</div><div style={S.infoVal}>{lead.phone}</div></div>
              <div style={S.infoBox}><div style={S.infoLabel}>Região</div><div style={S.infoVal}>{lead.region||lead.city||'—'}</div></div>
            </div>
            <div style={{marginBottom:6}}>
              <div style={S.infoBox}><div style={S.infoLabel}>Produto</div><div style={S.infoVal}>{lead.product||'—'}</div></div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginBottom:16}}>
              <div style={S.infoBox}><div style={S.infoLabel}>Orçamento</div><div style={S.infoVal}>{lead.budget||'—'}</div></div>
              <div style={S.infoBox}>
                <div style={S.infoLabel}>Vendedor</div>
                <select
                  value={lead.vendor || ''}
                  onChange={async (e) => {
                    const novoVendedor = e.target.value;
                    const { error } = await supabase.schema('leblanc').from('leads')
                      .update({ vendor: novoVendedor, updated_at: new Date().toISOString() })
                      .eq('id', lead.id);
                    if (error) {
                      console.error('Update vendor falhou:', error);
                      alert(`Não foi possível atualizar vendedor: ${error.message}`);
                      return;
                    }
                    onUpdate && onUpdate({ ...lead, vendor: novoVendedor });
                  }}
                  style={{width:'100%',border:'none',background:'transparent',fontSize:13,fontWeight:500,cursor:'pointer',padding:0}}>
                  <option value="">Sem vendedor</option>
                  {vendedoresDisponiveis.map(nome=>(
                    <option key={nome} value={nome}>{nome}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{marginBottom:16}}>
              <div style={{fontSize:10,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:6}}>Estimativa de investimento — preencher após o briefing (R$)</div>
              <input
                type="number"
                value={valorLocal}
                onChange={(e) => setValorLocal(e.target.value)}
                placeholder="Valor que o cliente pretende investir, ex.: 100000"
                onBlur={async () => {
                  const novoValor = valorLocal === '' ? null : Number(valorLocal);
                  if (novoValor === lead.valor_estimado) return;
                  const valorAnterior = lead.valor_estimado;
                  const { error } = await supabase
                    .schema('leblanc').from('leads')
                    .update({ valor_estimado: novoValor, updated_at: new Date().toISOString() })
                    .eq('id', lead.id);
                  if (error) {
                    console.error('[update valor_estimado] falhou:', error);
                    alert(`Não foi possível salvar: ${error.message}`);
                    setValorLocal(valorAnterior != null ? String(valorAnterior) : '');
                    return;
                  }
                  onUpdate && onUpdate({ ...lead, valor_estimado: novoValor });
                }}
                style={{width:'100%',padding:'8px 10px',border:'1px solid var(--border)',borderRadius:6,fontSize:13,boxSizing:'border-box'}}
              />
            </div>
            <div style={{marginBottom:16}}>
              <div style={{fontSize:10,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:6}}>Temperatura</div>
              <div style={{display:'flex',gap:8}}>
                {['hot','warm','cold'].map(t => (
                  <button key={t} onClick={async () => {
                    const { error } = await supabase.schema('leblanc').from('leads')
                      .update({ temperature: t, updated_at: new Date().toISOString() })
                      .eq('id', lead.id);
                    if (error) {
                      console.error('Update temperature falhou:', error);
                      alert(`Não foi possível atualizar temperatura: ${error.message}`);
                      return;
                    }
                    onUpdate && onUpdate({ ...lead, temperature: t });
                  }} style={{
                    padding:'4px 12px', borderRadius:20, border:'1px solid', fontSize:12, cursor:'pointer',
                    background: lead.temperature === t ? (t==='hot'?'#ef4444':t==='warm'?'#f59e0b':'#3b82f6') : 'transparent',
                    color: lead.temperature === t ? '#fff' : '#888',
                    borderColor: t==='hot'?'#ef4444':t==='warm'?'#f59e0b':'#3b82f6'
                  }}>
                    {t==='hot'?'🔥 Quente':t==='warm'?'🌤 Morno':'❄️ Frio'}
                  </button>
                ))}
              </div>
            </div>
            {lead.sdr_summary && (<>
              <div style={S.sectionTitle}>RESUMO DA HELENA</div>
              <div style={{fontSize:12,lineHeight:1.6,background:'var(--bg2)',padding:'10px 12px',borderRadius:6,marginBottom:16}}>{lead.sdr_summary}</div>
            </>)}
            {lead.ai_next_step && (<>
              <div style={S.sectionTitle}>PRÓXIMO PASSO</div>
              <div style={{fontSize:12,lineHeight:1.6,background:'#f0f9f4',padding:'10px 12px',borderRadius:6,border:'1px solid #d1f0e0'}}>{lead.ai_next_step}</div>
            </>)}
            <div style={{marginTop:16,marginBottom:16}}>
              <div style={S.sectionTitle}>REGISTRAR CONTATO MANUAL</div>
              <div style={{fontSize:11,color:'var(--muted)',marginBottom:8,lineHeight:1.4}}>
                Use quando entrar em contato com o cliente fora do WhatsApp. O lead sai da lista de "parados".
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:6}}>
                {[
                  {icon:'📞',label:'Ligação'},
                  {icon:'🎙️',label:'Áudio'},
                  {icon:'👥',label:'Presencial'},
                  {icon:'✍️',label:'Outro'}
                ].map(b => (
                  <button key={b.label} onClick={async () => {
                    if (!lead.vendor) { alert('Lead sem vendedor — não dá pra registrar contato'); return; }
                    const { error } = await supabase.rpc('leblanc_registrar_contato_manual', {
                      p_lead_id: lead.id,
                      p_vendedor: lead.vendor,
                      p_telefone: lead.phone || '',
                      p_tipo_contato: b.label
                    });
                    if (error) { alert('Erro: ' + error.message); return; }
                    onUpdate && onUpdate({ ...lead, updated_at: new Date().toISOString() });
                    if (tab === 'conversa') loadConversas();
                    alert(`✓ Contato (${b.label}) registrado`);
                  }} style={{
                    padding:'10px 12px',background:'#fff',border:'1px solid var(--border)',
                    borderRadius:6,fontSize:12,cursor:'pointer',display:'flex',
                    alignItems:'center',gap:6,fontFamily:'var(--sans)'
                  }}>
                    <span style={{fontSize:16}}>{b.icon}</span>
                    <span>{b.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div style={{marginTop:16}}>
              <div style={S.sectionTitle}>OBSERVAÇÕES DO VENDEDOR</div>

              {observacoes.length > 0 && (
                <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:10}}>
                  {observacoes.map(o => (
                    <div key={o.id} style={{border:'1px solid var(--border)',borderRadius:6,padding:'8px 12px',background:'#fafafa'}}>
                      <div style={{fontSize:13,lineHeight:1.6,whiteSpace:'pre-wrap'}}>{o.texto}</div>
                      <div style={{fontSize:11,color:'var(--muted)',marginTop:6}}>{o.autor || 'vendedor'} · {new Date(o.created_at).toLocaleString('pt-BR')}</div>
                    </div>
                  ))}
                </div>
              )}

              <textarea
                value={novaObs}
                onChange={e => setNovaObs(e.target.value)}
                placeholder="Escreva uma nova observação..."
                rows={4}
                style={{
                  width:'100%', padding:'10px 12px', border:'1px solid var(--border)',
                  borderRadius:6, fontSize:13, lineHeight:1.6, resize:'vertical',
                  fontFamily:'var(--sans)', boxSizing:'border-box', outline:'none'
                }}
              />
              <button
                onClick={salvarObservacao}
                disabled={salvandoObs || !novaObs.trim()}
                style={{
                  marginTop:8, padding:'7px 18px', background:'var(--dark)', color:'#fff',
                  border:'none', borderRadius:6, fontSize:12, cursor:'pointer', float:'right',
                  opacity:(salvandoObs || !novaObs.trim())?0.5:1
                }}>
                {salvandoObs ? 'Salvando...' : 'Salvar observação'}
              </button>
              <div style={{clear:'both'}}/>
            </div>
          </div>
        )}

        {/* ── HELENA ── */}
        {tab==='helena' && (
          <div style={{padding:0,overflowY:'auto',flex:1}}>
            {/* Timeline */}
            <div style={{fontSize:10,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:12}}>Histórico de Datas</div>
            <div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:24}}>
              <div style={{display:'flex',gap:10,alignItems:'flex-start'}}>
                <span style={{fontSize:16}}>✨</span>
                <div>
                  <div style={{fontSize:12}}>Lead criado pela Helena</div>
                  <div style={{fontSize:11,color:'var(--muted)'}}>{lead.created_at ? new Date(lead.created_at).toLocaleString('pt-BR') : '—'}</div>
                </div>
              </div>
              {lead.assigned_at && (
                <div style={{display:'flex',gap:10,alignItems:'flex-start'}}>
                  <span style={{fontSize:16}}>👤</span>
                  <div>
                    <div style={{fontSize:12}}>Passado para {lead.vendor||'vendedor'}</div>
                    <div style={{fontSize:11,color:'var(--muted)'}}>{new Date(lead.assigned_at).toLocaleString('pt-BR')}</div>
                  </div>
                </div>
              )}
              {followups.map(f => (
                <div key={f.id} style={{display:'flex',gap:10,alignItems:'flex-start'}}>
                  <span style={{fontSize:16}}>📝</span>
                  <div>
                    <div style={{fontSize:12}}>{f.content||f.nota||f.text||f.acao||'—'}</div>
                    <div style={{fontSize:11,color:'var(--muted)'}}>{new Date(f.created_at).toLocaleString('pt-BR')}</div>
                  </div>
                </div>
              ))}
            </div>
            {/* Conversa com Helena */}
            <div style={{fontSize:10,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:12}}>Conversa com a Helena</div>
            <div className="chat-scroll" style={{display:'flex',flexDirection:'column',gap:8,overflowY:'scroll',flex:1,minHeight:'280px',maxHeight:'420px',padding:'12px 16px',scrollbarWidth:'auto',scrollbarColor:'#555 #1a1a1a'}}>
              {helenaHistory.length===0 && (
                <div style={{fontSize:12,color:'var(--muted)',textAlign:'center',padding:'20px 0'}}>Nenhuma conversa registrada</div>
              )}
              {helenaHistory.map((row) => {
                const isHelena = row.papel === 'helena';
                return (
                  <div key={row.id} style={{
                    alignSelf: isHelena ? 'flex-end' : 'flex-start',
                    maxWidth:'78%',
                    padding:'10px 14px',
                    borderRadius: isHelena ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                    background: isHelena ? '#1a1a2e' : '#2a2a2a',
                    fontSize:13, lineHeight:1.6, color:'#e8e8e8',
                    wordBreak:'break-word', whiteSpace:'pre-wrap', marginBottom:2
                  }}>
                    <div style={{fontSize:10,color:'#888',marginBottom:4,fontWeight:500}}>
                      {isHelena ? '🤖 Helena' : '👤 Cliente'}
                    </div>
                    {row.source === 'midia' ? (
                      <MediaMessage
                        tipo={row.media.tipo}
                        media_url={row.media.media_url}
                        media_filename={row.media.media_filename}
                        media_duration_sec={row.media.media_duration_sec}
                        media_caption={row.media.media_caption}
                      />
                    ) : (
                      row.content
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── CONVERSA ── */}
        {tab==='conversa' && (
          <div style={{display:'flex',flexDirection:'column',height:'100%',minHeight:0}}>
            <div style={{fontSize:10,fontWeight:600,letterSpacing:'.1em',color:'var(--muted)',padding:'10px 14px 4px'}}>
              CONVERSA WHATSAPP — {(lead.vendor||'').toUpperCase()}
            </div>
            <div ref={convRef} className="chat-scroll" style={{display:'flex',flexDirection:'column',gap:8,overflowY:'scroll',flex:1,minHeight:'280px',maxHeight:'420px',padding:'12px 16px',scrollbarWidth:'auto',scrollbarColor:'#555 #1a1a1a'}}>
              {vendorConversas.length===0 && (
                <div style={{textAlign:'center',color:'var(--muted)',fontSize:12,marginTop:40}}>
                  Nenhuma mensagem registrada ainda
                </div>
              )}
              {vendorConversas.map((msg) => {
                const isVendedor = msg.de === 'vendedor';
                return (
                  <div key={msg.id} style={{
                    alignSelf: isVendedor ? 'flex-end' : 'flex-start',
                    maxWidth:'78%',
                    padding:'10px 14px',
                    borderRadius: isVendedor ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                    background: isVendedor ? '#1a2e1a' : '#2a2a2a',
                    fontSize:13, lineHeight:1.6, color:'#e8e8e8',
                    wordBreak:'break-word', whiteSpace:'pre-wrap', marginBottom:2
                  }}>
                    <div style={{fontSize:10,color:'#888',marginBottom:4,fontWeight:500}}>
                      {isVendedor ? `🟢 ${msg.vendedor}` : '👤 Cliente'}
                      {' · '}
                      {new Date(msg.created_at).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}
                    </div>
                    {(msg.tipo === 'audio' || msg.tipo === 'imagem' || msg.tipo === 'documento') && msg.media_url ? (
                      <MediaMessage
                        tipo={msg.tipo}
                        media_url={msg.media_url}
                        media_filename={msg.media_filename}
                        media_duration_sec={msg.media_duration_sec}
                        media_caption={msg.media_caption}
                      />
                    ) : (
                      msg.mensagem
                    )}
                  </div>
                );
              })}
            </div>
            <div style={{padding:'10px 14px',borderTop:'1px solid var(--border)',display:'flex',gap:8,flexShrink:0}}>
              <input value={msg} onChange={e=>setMsg(e.target.value)}
                onKeyDown={e=>{ if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();enviarMensagem();} }}
                placeholder="Escreva uma mensagem..."
                style={{flex:1,padding:'8px 12px',border:'1px solid var(--border)',borderRadius:20,fontSize:12,outline:'none'}}/>
              <button onClick={enviarMensagem} disabled={enviando}
                style={{padding:'8px 16px',background:'var(--dark)',color:'#fff',border:'none',borderRadius:20,fontSize:12,cursor:'pointer',opacity:enviando ? 0.6 : 1}}>
                {enviando?'…':'Enviar'}
              </button>
            </div>
          </div>
        )}

        {/* ── TAREFAS ── */}
        {tab==='tarefas' && (
          <TarefasDoLead
            leadId={lead.id}
            leadVendor={lead.vendor}
            userVendorName={user?.vendor_name}
          />
        )}

        {/* ── AGENDAMENTOS ── */}
        {tab==='agendamentos' && (
          <div>
            <div style={S.sectionTitle}>AGENDAMENTOS</div>
            {agendamentos.length===0 && <div style={{color:'var(--muted)',fontSize:12,marginBottom:14}}>Nenhum agendamento ainda</div>}
            {agendamentos.map(a => {
              const cor = { agendado:'#1565c0', apresentado:'#2e7d32', cancelado:'#c0392b', remarcado:'#e65100', fechado:'#000' }[a.status] || '#555';
              const tipoLabel = { visita:'Visita', apresentacao:'Apresentação', online:'Apresentação Online', reuniao:'Reunião', retorno:'Retorno', apresentacao_1:'1ª Apresentação', apresentacao_2:'2ª Apresentação', apresentacao_3:'3ª Apresentação', apresentacao_online:'Apresentação Online' }[a.tipo] || a.tipo;
              return (
                <div key={a.id} style={{padding:'10px 12px',background:'var(--bg2)',borderRadius:6,marginBottom:6}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:8}}>
                    <div>
                      <div style={{fontSize:13,fontWeight:500}}>{tipoLabel}</div>
                      <div style={{fontSize:11,color:'var(--muted)',marginTop:1}}>
                        📅 {new Date(a.data_hora).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',year:'2-digit',hour:'2-digit',minute:'2-digit'})}
                      </div>
                    </div>
                    <select value={a.status} onChange={e=>mudarStatusAg(a.id, e.target.value)}
                      style={{fontSize:11,fontWeight:600,color:cor,border:'1px solid '+cor+'33',borderRadius:10,padding:'3px 8px',background:'#fff',cursor:'pointer'}}>
                      {[['agendado','Agendado'],['apresentado','Apresentado'],['cancelado','Cancelado'],['remarcado','Remarcado'],['fechado','Fechado']].map(([s,lbl])=>(
                        <option key={s} value={s}>{lbl}</option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })}
            <div style={{marginTop:14,padding:'12px',background:'var(--bg2)',borderRadius:6}}>
              <div style={{...S.sectionTitle,marginBottom:8}}>NOVO AGENDAMENTO</div>
              <div style={{marginBottom:6}}>
                <select value={novoAg.tipo} onChange={e=>setNovoAg(p=>({...p,tipo:e.target.value}))}
                  style={{width:'100%',padding:'6px 8px',border:'1px solid var(--border)',borderRadius:4,fontSize:12,boxSizing:'border-box'}}>
                  <option value="visita">Visita</option>
                  <option value="apresentacao_1">1ª Apresentação</option>
                  <option value="apresentacao_2">2ª Apresentação</option>
                  <option value="apresentacao_3">3ª Apresentação</option>
                  <option value="apresentacao_online">Apresentação Online</option>
                  <option value="reuniao">Reunião</option>
                  <option value="retorno">Retorno</option>
                </select>
              </div>
              <div style={{display:'flex',gap:6}}>
                <input type="datetime-local" value={novoAg.data_hora} onChange={e=>setNovoAg(p=>({...p,data_hora:e.target.value}))}
                  style={{flex:1,padding:'6px 8px',border:'1px solid var(--border)',borderRadius:4,fontSize:11}}/>
                <button onClick={criarAgendamento}
                  style={{padding:'6px 14px',background:'var(--dark)',color:'#fff',border:'none',borderRadius:4,fontSize:12,cursor:'pointer',whiteSpace:'nowrap'}}>
                  + Agendar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── ARQUIVOS ── */}
        {tab==='arquivos' && (
          <div>
            <div style={S.sectionTitle}>ARQUIVOS DO LEAD</div>
            {arquivos.length===0&&<div style={{color:'var(--muted)',fontSize:12,marginBottom:10}}>Nenhum arquivo ainda</div>}
            {arquivos.map(f=>(
              <a key={f.name} href={f.url} target="_blank" rel="noopener noreferrer"
                style={{display:'flex',alignItems:'center',gap:8,padding:'8px 10px',background:'var(--bg2)',borderRadius:6,marginBottom:4,textDecoration:'none',color:'var(--dark)'}}>
                <span>📎</span>
                <span style={{fontSize:12,flex:1}}>{f.name}</span>
                <span style={{fontSize:10,color:'var(--muted)'}}>{f.metadata?.size?((f.metadata.size/1024).toFixed(0)+' KB'):''}</span>
              </a>
            ))}
            <label style={{display:'block',marginTop:12,padding:'12px',border:'1.5px dashed var(--border)',borderRadius:6,textAlign:'center',cursor:'pointer',fontSize:12,color:'var(--muted)'}}>
              📎 Clique para anexar arquivo
              <input type="file" hidden onChange={uploadArquivo} accept=".pdf,.jpg,.jpeg,.png,.dwg,.docx,.xlsx"/>
            </label>
          </div>
        )}

        {/* ── HISTÓRICO ── */}
        {tab==='historico' && (
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            <div style={{fontSize:10,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:4}}>Linha do tempo</div>
            {timeline.length === 0 ? (
              <div style={{textAlign:'center',color:'#666',fontSize:12,padding:20}}>Sem eventos registrados</div>
            ) : timeline.map((ev, i) => (
              <div key={i} style={{display:'flex',gap:10,alignItems:'flex-start'}}>
                <span style={{fontSize:16}}>{ev.icone}</span>
                <div>
                  <div style={{fontSize:12}}>{ev.texto}</div>
                  <div style={{fontSize:11,color:'var(--muted)'}}>{new Date(ev.data).toLocaleString('pt-BR')}</div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Footer */}
      <div className="dfoot">
        <button className="btn-sec" onClick={()=>window.open(`tel:${lead.phone}`)}>📞 Ligar</button>
        <button className="btn-sec" onClick={()=>window.open(`https://wa.me/${lead.phone?.replace(/\D/g,'')}`)}>💬 WhatsApp</button>
        <button className="btn-gold" onClick={()=>onAdvance(lead)}>→ Avançar</button>
      </div>
    </div>
  );
}

function Reports({ leads, isGerente, vendorName, vendedoresDisponiveis = [] }) {
  const VENDORS = Object.keys(VENDOR_MAP);

  const [parados, setParados] = useState([]);
  const [limiteDias, setLimiteDias] = useState(7);
  useEffect(() => {
    if (!isGerente) return;
    (async () => {
      const { data } = await supabase
        .from('leblanc_leads_parados')
        .select('id, name, vendor, stage, dias_parado')
        .order('dias_parado', { ascending: false });
      setParados(data || []);
    })();
  }, [isGerente]);

  const [ags, setAgs] = useState([]);
  useEffect(() => {
    (async () => {
      let q = supabase.from('leblanc_agendamentos').select('lead_id, lead_name, vendor, tipo, status, data_hora');
      if (!isGerente && vendorName) q = q.eq('vendor', vendorName);
      const { data } = await q;
      setAgs(data || []);
    })();
  }, [isGerente, vendorName]);

  const funil = useMemo(() => {
    const byStatus = { agendado:0, apresentado:0, cancelado:0, remarcado:0, fechado:0 };
    const byStatusItems = { agendado:[], apresentado:[], cancelado:[], remarcado:[], fechado:[] };
    const seen = { agendado:new Set(), apresentado:new Set(), cancelado:new Set(), remarcado:new Set(), fechado:new Set() };
    ags.forEach(a => {
      if (byStatus[a.status] !== undefined) byStatus[a.status]++;
      if (byStatusItems[a.status] && a.lead_name) {
        const key = `${a.lead_name}|${a.vendor||''}`;
        if (!seen[a.status].has(key)) {
          seen[a.status].add(key);
          byStatusItems[a.status].push({ name: a.lead_name, vendor: a.vendor || '—' });
        }
      }
    });
    const byStatusEntries = Object.fromEntries(
      Object.entries(byStatusItems).map(([k, arr]) => [k, arr.sort((a,b) => a.name.localeCompare(b.name))])
    );
    const total = ags.length;
    const realizados = byStatus.apresentado + byStatus.fechado;
    const comDesfecho = byStatus.apresentado + byStatus.cancelado + byStatus.remarcado + byStatus.fechado;
    const comparecimento = comDesfecho ? Math.round((realizados / comDesfecho) * 100) : 0;
    const cancelamento = total ? Math.round((byStatus.cancelado / total) * 100) : 0;
    const vendidosIds = new Set(leads.filter(l => l.stage === 'vendidos').map(l => l.id));
    const apsPorLead = {};
    ags.forEach(a => {
      if (vendidosIds.has(a.lead_id) && String(a.tipo).startsWith('apresentacao')) {
        apsPorLead[a.lead_id] = (apsPorLead[a.lead_id] || 0) + 1;
      }
    });
    const arr = Object.values(apsPorLead);
    const mediaAps = arr.length ? (arr.reduce((x,y)=>x+y,0) / arr.length).toFixed(1) : '—';
    return { byStatus, byStatusEntries, total, comparecimento, cancelamento, mediaAps };
  }, [ags, leads]);

  const metaSemanal = useMemo(() => {
    const META = 16;
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1, 0, 0, 0, 0);
    const inicioProxMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 1, 0, 0, 0, 0);
    const diasNoMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate();
    const esperado = META * (hoje.getDate() / diasNoMes);
    const ehNovo = a => !['apresentacao_2','apresentacao_3'].includes(a.tipo) && a.status !== 'cancelado';
    return vendedoresDisponiveis.map(v => {
      const novos = ags.filter(a => {
        if (a.vendor !== v || !ehNovo(a) || !a.data_hora) return false;
        const d = new Date(a.data_hora);
        return d >= inicioMes && d < inicioProxMes;
      }).length;
      return { name: v, novos, meta: META, bateu: novos >= META, esperado: Math.round(esperado), noRitmo: novos >= esperado };
    }).sort((a,b) => b.novos - a.novos);
  }, [ags]);

  const [painelRecebidosMes, setPainelRecebidosMes] = useState([]);
  useEffect(() => {
    (async () => {
      const inicioMes = new Date();
      inicioMes.setDate(1);
      inicioMes.setHours(0, 0, 0, 0);
      const mesISO = inicioMes.toISOString().slice(0, 10);
      const { data, error } = await supabase
        .from('leblanc_relatorio_mensal')
        .select('vendor,recebidos')
        .eq('mes', mesISO);
      if (error) console.error('[painelRecebidosMes] falhou:', error);
      setPainelRecebidosMes(data || []);
    })();
  }, []);

  const painelOperacional = useMemo(() => {
    const hoje = new Date();
    const dow = hoje.getDay();
    const diffSeg = dow === 0 ? -6 : 1 - dow;
    const inicioSemana = new Date(hoje); inicioSemana.setDate(hoje.getDate()+diffSeg); inicioSemana.setHours(0,0,0,0);
    const fimSemana = new Date(inicioSemana); fimSemana.setDate(inicioSemana.getDate()+7);
    const semanaFimVis = new Date(fimSemana); semanaFimVis.setDate(semanaFimVis.getDate()-1);
    const recebidosPorVendor = {};
    painelRecebidosMes.forEach(r => { recebidosPorVendor[r.vendor] = Number(r.recebidos) || 0; });
    const linhas = vendedoresDisponiveis.map(v => {
      const ativos = leads.filter(l => l.vendor === v && !['vendidos','perdido'].includes(l.stage)).length;
      const recebidosMes = recebidosPorVendor[v] || 0;
      const agendSemana = ags.filter(a => {
        if (a.vendor !== v || a.status === 'cancelado' || !a.data_hora) return false;
        const d = new Date(a.data_hora);
        return d >= inicioSemana && d < fimSemana;
      }).length;
      return { name: v, ativos, recebidosMes, agendSemana };
    }).sort((a,b) => b.ativos - a.ativos);
    const fmtDM = d => d.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'});
    const mesNome = hoje.toLocaleDateString('pt-BR',{month:'long'});
    return { linhas, mesNome, semanaIni: fmtDM(inicioSemana), semanaFim: fmtDM(semanaFimVis) };
  }, [leads, ags, vendedoresDisponiveis, painelRecebidosMes]);

  const [histMensal, setHistMensal] = useState([]);
  const [fHistVend, setFHistVend] = useState('todos');
  const [fHistMes, setFHistMes] = useState('todos');
  const [resumoMes, setResumoMes] = useState(null);
  const [resumoMesAtual, setResumoMesAtual] = useState('');
  const [funilTempo, setFunilTempo] = useState([]);
  const [metaRealizado, setMetaRealizado] = useState([]);
  const [projecao, setProjecao] = useState([]);
  const [historicoMensal, setHistoricoMensal] = useState([]);
  useEffect(() => {
    (async () => {
      const [a, b, c, d] = await Promise.all([
        supabase.from('leblanc_funil_tempo_medio').select('*'),
        supabase.from('leblanc_meta_realizado').select('*'),
        supabase.from('leblanc_projecao_vendedora').select('*'),
        supabase.from('leblanc_historico_vendas_mensal').select('*'),
      ]);
      if (a.data) setFunilTempo(a.data);
      if (b.data) setMetaRealizado(b.data);
      if (c.data) setProjecao(c.data);
      if (d.data) setHistoricoMensal(d.data);
    })();
  }, []);
  const [activeTab, setActiveTab] = useState('operacional');
  useEffect(() => {
    (async () => {
      if (!isGerente) return;
      const hoje = new Date();
      const mesAtualStr = `${hoje.getFullYear()}-${String(hoje.getMonth()+1).padStart(2,'0')}-01`;
      setResumoMesAtual(resumoMesAtual || mesAtualStr);
    })();
  }, [isGerente]);
  useEffect(() => {
    (async () => {
      if (!isGerente) return;
      const { data } = await supabase
        .from('leblanc_relatorio_mensal')
        .select('*')
        .order('mes', { ascending: false });
      setHistMensal(data || []);
    })();
  }, [isGerente]);

  const [perdidos, setPerdidos] = useState([]);
  const [fVendPerd, setFVendPerd] = useState('todos');
  useEffect(() => {
    if (!isGerente) return;
    (async () => {
      const { data } = await supabase
        .from('leblanc_perdidos')
        .select('id, name, vendor, notes, ultima_obs, obs_data');
      setPerdidos(data || []);
    })();
  }, [isGerente]);

  const vendorValores = useMemo(() => {
    return vendedoresDisponiveis.map(v => {
      const vLeads = leads.filter(l => l.vendor === v);
      const carteira = vLeads.filter(l => PIPELINE_STAGES.includes(l.stage)).reduce((s,l)=> s + (Number(l.valor_estimado)||0), 0);
      const convertido = vLeads.filter(l => l.stage === 'vendidos').reduce((s,l)=> s + (Number(l.valor_estimado)||0), 0);
      return { name: v, carteira, convertido };
    }).sort((a,b)=> b.carteira - a.carteira);
  }, [leads]);
  const totalCarteira = vendorValores.reduce((s,v)=>s+v.carteira,0);
  const totalConvertido = vendorValores.reduce((s,v)=>s+v.convertido,0);
  const brl = n => n.toLocaleString('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0});

  const minhaCarteira = leads.filter(l => PIPELINE_STAGES.includes(l.stage)).reduce((s,l)=> s + (Number(l.valor_estimado)||0), 0);
  const meuConvertido = leads.filter(l => l.stage === 'vendidos').reduce((s,l)=> s + (Number(l.valor_estimado)||0), 0);

  const vendorStats = useMemo(() => vendedoresDisponiveis.map(v => {
    const vLeads = leads.filter(l => l.vendor === v);
    const fechados = vLeads.filter(l => l.stage === "vendidos").length;
    const perdidos = vLeads.filter(l => l.stage === "perdido").length;
    const ativos = vLeads.filter(l => PIPELINE_STAGES.includes(l.stage)).length;
    const taxa = vLeads.length ? Math.round((fechados / vLeads.length) * 100) : 0;
    return { name: v, total: vLeads.length, fechados, perdidos, ativos, taxa };
  }).sort((a,b) => b.total - a.total), [leads]);

  const maxLeads = Math.max(...vendorStats.map(v => v.total), 1);

  const totalFechados = leads.filter(l => l.stage === "vendidos").length;
  const totalPerdidos = leads.filter(l => l.stage === "perdido").length;
  const totalSemContato = leads.filter(l => l.stage === "sem_resposta").length;
  const totalAtivos = leads.filter(l => PIPELINE_STAGES.includes(l.stage)).length;

  const regionStats = useMemo(() => {
    const map = {};
    leads.forEach(l => { if(l.region) map[l.region] = (map[l.region]||0) + 1; });
    return Object.entries(map).sort((a,b)=>b[1]-a[1]);
  }, [leads]);

  const evolution = useMemo(() => {
    const months = [];
    for (let i = 7; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      const label = d.toLocaleString('pt-BR', { month:'short' });
      const count = leads.filter(l => l.updated_at?.startsWith(key)).length;
      months.push({ label, count, key });
    }
    return months;
  }, [leads]);

  const maxEvo = Math.max(...evolution.map(e => e.count), 1);

  return (
    <div className="reports-wrap">
      <div className="reports-grid">
        <div style={{display:'flex',gap:4,marginBottom:16,borderBottom:'1px solid var(--border)',gridColumn:'1/-1'}}>
          {[
            { id:'operacional', label:'Operacional' },
            { id:'historico', label:'Histórico' },
            { id:'performance', label:'Performance' }
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              style={{
                background:'none',border:'none',padding:'10px 18px',
                fontSize:11,textTransform:'uppercase',letterSpacing:'.1em',
                cursor:'pointer',fontFamily:"'Jost',sans-serif",
                color: activeTab === t.id ? 'var(--dark)' : 'var(--muted)',
                fontWeight: activeTab === t.id ? 600 : 400,
                borderBottom: activeTab === t.id ? '2px solid var(--dark)' : '2px solid transparent',
                marginBottom:'-1px',
                transition:'all .15s ease'
              }}>
              {t.label}
            </button>
          ))}
        </div>
        {activeTab === 'operacional' && !isGerente && vendorName && (() => {
          const m = painelOperacional.linhas.find(p => p.name === vendorName);
          if (!m) return null;
          return (
            <div className="report-card full">
              <div className="report-title">Minha visão operacional</div>
              <div style={{display:'flex',gap:8}}>
                <div style={{flex:1,textAlign:'center',padding:'12px 8px',background:'var(--bg2)',borderRadius:6}}>
                  <div style={{fontSize:26,fontWeight:600}}>{m.ativos}</div>
                  <div style={{fontSize:9,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'.05em',marginTop:2}}>Ativos</div>
                </div>
                <div style={{flex:1,textAlign:'center',padding:'12px 8px',background:'var(--bg2)',borderRadius:6}}>
                  <div style={{fontSize:26,fontWeight:600}}>{m.recebidosMes}</div>
                  <div style={{fontSize:9,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'.05em',marginTop:2}}>Recebidos no mês</div>
                </div>
                <div style={{flex:1,textAlign:'center',padding:'12px 8px',background:'var(--bg2)',borderRadius:6}}>
                  <div style={{fontSize:26,fontWeight:600,color: m.agendSemana >= 4 ? '#2e7d32' : (m.agendSemana >= 1 ? 'var(--dark)' : '#c0392b')}}>{m.agendSemana}</div>
                  <div style={{fontSize:9,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'.05em',marginTop:2}}>Agend. semana</div>
                </div>
              </div>
              <div style={{fontSize:10,color:'var(--muted)',marginTop:10,textTransform:'capitalize'}}>
                Mês: {painelOperacional.mesNome} · Semana: {painelOperacional.semanaIni} a {painelOperacional.semanaFim}
              </div>
            </div>
          );
        })()}
        {activeTab === 'operacional' && isGerente && (
          <div className="report-card full">
            <div className="report-title">Painel por vendedora — visão operacional</div>
            <div style={{display:'flex',gap:8,fontSize:9,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'.05em',paddingBottom:8,borderBottom:'1px solid var(--border)'}}>
              <div style={{flex:'1.4'}}>Vendedora</div>
              <div style={{flex:1,textAlign:'center'}}>Ativos</div>
              <div style={{flex:1,textAlign:'center'}}>Recebidos no mês</div>
              <div style={{flex:1,textAlign:'center'}}>Agend. semana</div>
            </div>
            {painelOperacional.linhas.map(p => (
              <div key={p.name} style={{display:'flex',gap:8,alignItems:'center',padding:'10px 0',borderBottom:'1px solid var(--border)'}}>
                <div style={{flex:'1.4',display:'flex',alignItems:'center',gap:8}}>
                  <div className="vendor-av" style={{width:26,height:26,fontSize:10}}>{VENDOR_MAP[p.name]?.initials || p.name.slice(0,2).toUpperCase()}</div>
                  <div style={{fontSize:12}}>{p.name}</div>
                </div>
                <div style={{flex:1,textAlign:'center',fontWeight:600,fontSize:16}}>{p.ativos}</div>
                <div style={{flex:1,textAlign:'center',fontWeight:600,fontSize:16}}>{p.recebidosMes}</div>
                <div style={{flex:1,textAlign:'center',fontWeight:600,fontSize:16,color: p.agendSemana >= 4 ? '#2e7d32' : (p.agendSemana >= 1 ? 'var(--dark)' : '#c0392b')}}>{p.agendSemana}</div>
              </div>
            ))}
            <div style={{fontSize:10,color:'var(--muted)',marginTop:10,textTransform:'capitalize'}}>
              Mês: {painelOperacional.mesNome} · Semana: {painelOperacional.semanaIni} a {painelOperacional.semanaFim}
            </div>
          </div>
        )}
        {activeTab === 'operacional' && isGerente && (
          <div className="report-card full">
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14,flexWrap:'wrap',gap:8}}>
              <div className="report-title" style={{marginBottom:0}}>📊 Resumo mensal de leads</div>
              <select
                value={resumoMesAtual}
                onChange={e=>setResumoMesAtual(e.target.value)}
                style={{fontSize:11,padding:'4px 10px',borderRadius:4,border:'1px solid var(--border)',background:'var(--bg2)',color:'var(--light)'}}
              >
                {[...new Set(histMensal.map(r => r.mes))].sort().reverse().map(m => {
                  const d = new Date(m + 'T12:00:00');
                  const lbl = d.toLocaleDateString('pt-BR',{month:'long',year:'numeric'});
                  return <option key={m} value={m}>{lbl.charAt(0).toUpperCase()+lbl.slice(1)}</option>;
                })}
              </select>
            </div>

            {(() => {
              const dadosMes = histMensal.filter(r => r.mes === resumoMesAtual && r.vendor);
              const totais = dadosMes.reduce((acc, r) => ({
                recebidos: acc.recebidos + Number(r.recebidos),
                ativos: acc.ativos + Number(r.ativos),
                perdidos: acc.perdidos + Number(r.perdidos),
                vendidos: acc.vendidos + Number(r.vendidos),
              }), { recebidos:0, ativos:0, perdidos:0, vendidos:0 });
              const brl = v => 'R$ ' + (Number(v) || 0).toLocaleString('pt-BR',{maximumFractionDigits:0});

              return (
                <>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:10,marginBottom:18}}>
                    <div style={{padding:14,background:'var(--bg2)',borderRadius:6,textAlign:'center'}}>
                      <div style={{fontSize:26,fontWeight:600,color:'var(--dark)'}}>{totais.recebidos}</div>
                      <div style={{fontSize:9,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'.05em',marginTop:4}}>Entraram</div>
                    </div>
                    <div style={{padding:14,background:'var(--bg2)',borderRadius:6,textAlign:'center'}}>
                      <div style={{fontSize:26,fontWeight:600,color:'#1565c0'}}>{totais.ativos}</div>
                      <div style={{fontSize:9,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'.05em',marginTop:4}}>Ativos</div>
                    </div>
                    <div style={{padding:14,background:'var(--bg2)',borderRadius:6,textAlign:'center'}}>
                      <div style={{fontSize:26,fontWeight:600,color:'#c0392b'}}>{totais.perdidos}</div>
                      <div style={{fontSize:9,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'.05em',marginTop:4}}>Perdidos {totais.recebidos > 0 ? `(${Math.round(totais.perdidos/totais.recebidos*100)}%)` : ''}</div>
                    </div>
                    <div style={{padding:14,background:'var(--bg2)',borderRadius:6,textAlign:'center'}}>
                      <div style={{fontSize:26,fontWeight:600,color:'#2e7d32'}}>{totais.vendidos}</div>
                      <div style={{fontSize:9,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'.05em',marginTop:4}}>Vendidos</div>
                    </div>
                  </div>

                  <div style={{fontSize:10,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:8}}>Por vendedora</div>
                  <table style={{width:'100%',fontSize:12,borderCollapse:'collapse'}}>
                    <thead>
                      <tr style={{color:'var(--muted)',fontSize:9,textTransform:'uppercase',letterSpacing:'.05em',borderBottom:'1px solid var(--border)'}}>
                        <th style={{padding:'6px 4px',textAlign:'left'}}>Vendedora</th>
                        <th style={{padding:'6px 4px',textAlign:'center'}}>Receb.</th>
                        <th style={{padding:'6px 4px',textAlign:'center'}}>Ativos</th>
                        <th style={{padding:'6px 4px',textAlign:'center'}}>Perdidos</th>
                        <th style={{padding:'6px 4px',textAlign:'center'}}>Vendidos</th>
                        <th style={{padding:'6px 4px',textAlign:'right'}}>R$ ativo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dadosMes.sort((a,b) => Number(b.recebidos) - Number(a.recebidos)).map((r,i) => {
                        const pctPerda = Number(r.recebidos) > 0 ? Math.round(Number(r.perdidos)/Number(r.recebidos)*100) : 0;
                        return (
                          <tr key={i} style={{borderBottom:'1px solid var(--border)'}}>
                            <td style={{padding:'8px 4px'}}>{r.vendor}</td>
                            <td style={{padding:'8px 4px',textAlign:'center',fontWeight:500}}>{r.recebidos}</td>
                            <td style={{padding:'8px 4px',textAlign:'center'}}>{r.ativos}</td>
                            <td style={{padding:'8px 4px',textAlign:'center',color:pctPerda>=40?'#c0392b':(pctPerda>=20?'#e65100':'var(--muted)')}}>
                              {r.perdidos}{Number(r.perdidos)>0 && ` (${pctPerda}%)`}
                            </td>
                            <td style={{padding:'8px 4px',textAlign:'center',color:Number(r.vendidos)>0?'#2e7d32':'var(--muted)',fontWeight:Number(r.vendidos)>0?600:400}}>{r.vendidos}</td>
                            <td style={{padding:'8px 4px',textAlign:'right',fontWeight:500}}>{brl(r.valor_ativo)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </>
              );
            })()}
          </div>
        )}
        {activeTab === 'historico' && isGerente && (
          <div className="report-card full">
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10,flexWrap:'wrap',gap:8}}>
              <div className="report-title" style={{marginBottom:0}}>📊 Histórico mensal por vendedora</div>
              <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                <select value={fHistMes} onChange={e=>setFHistMes(e.target.value)}
                  style={{fontSize:11,padding:'4px 10px',borderRadius:4,border:'1px solid var(--border)',background:'var(--bg2)',color:'var(--light)'}}>
                  <option value="todos">Todos os meses</option>
                  {[...new Set(histMensal.map(r => r.mes))].sort().reverse().map(m => {
                    const d = new Date(m + 'T12:00:00');
                    const lbl = d.toLocaleDateString('pt-BR',{month:'long',year:'numeric'});
                    return <option key={m} value={m}>{lbl.charAt(0).toUpperCase()+lbl.slice(1)}</option>;
                  })}
                </select>
                <select value={fHistVend} onChange={e=>setFHistVend(e.target.value)}
                  style={{fontSize:11,padding:'4px 10px',borderRadius:4,border:'1px solid var(--border)',background:'var(--bg2)',color:'var(--light)'}}>
                  <option value="todos">Todas vendedoras</option>
                  {vendedoresDisponiveis.map(nome=><option key={nome} value={nome}>{nome}</option>)}
                </select>
              </div>
            </div>
            <div style={{overflowX:'auto'}}>
              <table style={{width:'100%',fontSize:11,borderCollapse:'collapse',minWidth:760}}>
                <thead>
                  <tr style={{color:'var(--muted)',fontSize:9,textTransform:'uppercase',letterSpacing:'.05em',borderBottom:'1px solid var(--border)'}}>
                    <th style={{padding:'8px 6px',textAlign:'left'}}>Mês</th>
                    <th style={{padding:'8px 6px',textAlign:'left'}}>Vendedora</th>
                    <th style={{padding:'8px 6px',textAlign:'center'}}>Receb.</th>
                    <th style={{padding:'8px 6px',textAlign:'center'}}>Ativos</th>
                    <th style={{padding:'8px 6px',textAlign:'center'}}>Vendidos</th>
                    <th style={{padding:'8px 6px',textAlign:'center'}}>Perdidos</th>
                    <th style={{padding:'8px 6px',textAlign:'right'}}>R$ entrou</th>
                    <th style={{padding:'8px 6px',textAlign:'right'}}>R$ ativo</th>
                    <th style={{padding:'8px 6px',textAlign:'center'}}>Agend.</th>
                    <th style={{padding:'8px 6px',textAlign:'center'}}>Cancel.</th>
                    <th style={{padding:'8px 6px',textAlign:'center'}}>Apres.</th>
                  </tr>
                </thead>
                <tbody>
                  {histMensal
                    .filter(r => r.vendor
                      && (fHistVend === 'todos' || r.vendor === fHistVend)
                      && (fHistMes === 'todos' || r.mes === fHistMes))
                    .map((r,i) => {
                      const brl = v => 'R$ ' + (Number(v) || 0).toLocaleString('pt-BR',{maximumFractionDigits:0});
                      const mesD = new Date(r.mes + 'T12:00:00');
                      const mesLabel = mesD.toLocaleDateString('pt-BR',{month:'short',year:'2-digit'}).replace('.','');
                      return (
                        <tr key={i} style={{borderBottom:'1px solid var(--border)'}}>
                          <td style={{padding:'8px 6px',textTransform:'capitalize'}}>{mesLabel}</td>
                          <td style={{padding:'8px 6px'}}>{r.vendor}</td>
                          <td style={{padding:'8px 6px',textAlign:'center',fontWeight:500}}>{r.recebidos}</td>
                          <td style={{padding:'8px 6px',textAlign:'center'}}>{r.ativos}</td>
                          <td style={{padding:'8px 6px',textAlign:'center',color:r.vendidos>0?'#2e7d32':'var(--muted)'}}>{r.vendidos}</td>
                          <td style={{padding:'8px 6px',textAlign:'center',color:r.perdidos>0?'#c0392b':'var(--muted)'}}>{r.perdidos}</td>
                          <td style={{padding:'8px 6px',textAlign:'right',color:'var(--muted)'}}>{brl(r.valor_entrou)}</td>
                          <td style={{padding:'8px 6px',textAlign:'right',fontWeight:500}}>{brl(r.valor_ativo)}</td>
                          <td style={{padding:'8px 6px',textAlign:'center'}}>{r.agend_total}</td>
                          <td style={{padding:'8px 6px',textAlign:'center',color:r.agend_cancelados>0?'#c0392b':'var(--muted)'}}>{r.agend_cancelados}</td>
                          <td style={{padding:'8px 6px',textAlign:'center',color:r.agend_apresentados>0?'#2e7d32':'var(--muted)'}}>{r.agend_apresentados}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {activeTab === 'operacional' && isGerente && (
          <div className="report-card full">
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
              <div className="report-title" style={{marginBottom:0}}>⚠️ Leads parados — sem movimentação</div>
              <div style={{display:'flex',gap:6}}>
                {[3,7,14].map(d => (
                  <button key={d} onClick={()=>setLimiteDias(d)}
                    style={{fontSize:10,padding:'3px 9px',borderRadius:20,cursor:'pointer',
                      border:'1px solid var(--border)',
                      background: limiteDias===d ? 'var(--dark)' : 'transparent',
                      color: limiteDias===d ? '#fff' : 'var(--muted)'}}>+{d}d</button>
                ))}
              </div>
            </div>
            {parados.filter(p => p.dias_parado >= limiteDias).length === 0 ? (
              <div style={{textAlign:'center',padding:'16px 0',color:'var(--faint)',fontSize:11}}>Nenhum lead parado há {limiteDias}+ dias 🎉</div>
            ) : (
              <div style={{display:'flex',flexDirection:'column'}}>
                {parados.filter(p => p.dias_parado >= limiteDias).map(p => (
                  <div key={p.id} className="vendor-row" style={{gap:10}}>
                    <div style={{flex:1}}>
                      <div className="vendor-name">{p.name}</div>
                      <div style={{fontSize:10,color:'var(--muted)',marginTop:2}}>
                        {p.vendor || 'sem vendedor'} · {STAGES.find(s=>s.id===p.stage)?.label || p.stage}
                      </div>
                    </div>
                    <div style={{textAlign:'right'}}>
                      <div style={{fontSize:16,fontWeight:600,color: p.dias_parado>=14 ? '#c0392b' : 'var(--dark)'}}>{p.dias_parado}d</div>
                      <div style={{fontSize:9,color:'var(--muted)'}}>parado</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {activeTab === 'performance' && isGerente && (
          <div className="report-card full">
            <div className="report-title">🎯 Meta vs Realizado (mês atual)</div>
            <div style={{fontSize:12,color:'var(--muted)',marginBottom:16,lineHeight:1.5}}>
              Meta mensal: R$ 100.000 por vendedora. Vendas contam a partir do momento que o lead vai pra "Vendidos".
            </div>
            {metaRealizado.length === 0 ? (
              <div style={{textAlign:'center',padding:'16px 0',color:'var(--faint)',fontSize:11}}>Sem dados ainda</div>
            ) : (
              <div style={{display:'flex',flexDirection:'column',gap:12}}>
                {metaRealizado.map(v => {
                  const pct = Number(v.percentual);
                  const cor = pct >= 100 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444';
                  const larguraBarra = Math.min(pct, 100);
                  return (
                    <div key={v.vendedora}>
                      <div style={{display:'flex',justifyContent:'space-between',fontSize:13,marginBottom:4}}>
                        <span style={{fontWeight:600}}>{v.vendedora}</span>
                        <span>
                          <strong style={{color:cor}}>{brl(v.realizado)}</strong>
                          <span style={{color:'#999'}}> / {brl(v.meta_mensal)}</span>
                          <span style={{marginLeft:8,fontSize:12,color:cor,fontWeight:600}}>{v.percentual}%</span>
                        </span>
                      </div>
                      <div style={{background:'#eee',borderRadius:4,overflow:'hidden',height:8}}>
                        <div style={{width:`${larguraBarra}%`,height:'100%',background:cor,transition:'width 0.3s'}}/>
                      </div>
                      {pct < 100 && (
                        <div style={{fontSize:11,color:'#999',marginTop:2}}>
                          Faltam {brl(v.falta)} pra bater meta
                        </div>
                      )}
                      {pct >= 100 && (
                        <div style={{fontSize:11,color:'#10b981',marginTop:2}}>
                          ✓ Meta batida (+{brl(Number(v.realizado) - Number(v.meta_mensal))} acima)
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        {activeTab === 'performance' && isGerente && (
          <div className="report-card full">
            <div className="report-title">📈 Projeção do Pipeline</div>
            <div style={{fontSize:12,color:'var(--muted)',marginBottom:16,lineHeight:1.5}}>
              Estimativa baseada nos leads ativos × probabilidade de fechamento por etapa.
              <br/>
              <span style={{fontSize:11,fontStyle:'italic'}}>
                Probabilidades: novo 5% • atendimento 20% • aguardando 30% • projeto 50% • apresentação 65% • negociação 80%
              </span>
            </div>
            {projecao.length === 0 ? (
              <div style={{textAlign:'center',padding:'16px 0',color:'var(--faint)',fontSize:11}}>Sem dados ainda</div>
            ) : (
              <div style={{overflowX:'auto'}}>
                <table style={{width:'100%',fontSize:13,borderCollapse:'collapse'}}>
                  <thead>
                    <tr style={{color:'var(--muted)',fontSize:9,textTransform:'uppercase',letterSpacing:'.05em',borderBottom:'1px solid var(--border)'}}>
                      <th style={{padding:'8px 6px',textAlign:'left'}}>Vendedora</th>
                      <th style={{padding:'8px 6px',textAlign:'right'}}>Leads ativos</th>
                      <th style={{padding:'8px 6px',textAlign:'right'}}>Projeção</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projecao.map(v => (
                      <tr key={v.vendedora} style={{borderBottom:'1px solid var(--border)'}}>
                        <td style={{padding:'8px 6px',fontWeight:600}}>{v.vendedora}</td>
                        <td style={{padding:'8px 6px',textAlign:'right',color:'#666'}}>{v.leads_ativos}</td>
                        <td style={{padding:'8px 6px',textAlign:'right',fontWeight:600,color:'#3b82f6'}}>{brl(v.projecao)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        {activeTab === 'performance' && (
          <div className="report-card full">
            <div className="report-title">⏱️ Tempo médio por etapa</div>
            <div style={{fontSize:12,color:'var(--muted)',marginBottom:14,lineHeight:1.5}}>
              Quanto tempo um lead fica em média em cada etapa antes de ser movido. Use pra identificar gargalos.
            </div>
            {funilTempo.length === 0 ? (
              <div style={{textAlign:'center',padding:'16px 0',color:'var(--faint)',fontSize:11}}>Sem dados de funil ainda</div>
            ) : (
              <div style={{overflowX:'auto'}}>
                <table style={{width:'100%',borderCollapse:'collapse',fontSize:13,minWidth:520}}>
                  <thead>
                    <tr style={{color:'var(--muted)',fontSize:9,textTransform:'uppercase',letterSpacing:'.05em',borderBottom:'1px solid var(--border)'}}>
                      <th style={{padding:'8px 6px',textAlign:'left'}}>Etapa</th>
                      <th style={{padding:'8px 6px',textAlign:'right'}}>Média</th>
                      <th style={{padding:'8px 6px',textAlign:'right'}}>Mediana</th>
                      <th style={{padding:'8px 6px',textAlign:'right'}}>Range</th>
                      <th style={{padding:'8px 6px',textAlign:'right'}}>Amostras</th>
                    </tr>
                  </thead>
                  <tbody>
                    {funilTempo.map((row, idx) => {
                      const cor = row.media_dias >= 3 ? '#fee2e2'
                                : row.media_dias >= 1.5 ? '#fef3c7'
                                : '#dcfce7';
                      return (
                        <tr key={row.etapa} style={{borderBottom:'1px solid var(--border)',background:cor}}>
                          <td style={{padding:'8px 6px',fontWeight: idx === 0 ? 600 : 400}}>
                            {row.etapa}
                            {idx === 0 && row.media_dias >= 3 && ' ⚠️'}
                          </td>
                          <td style={{padding:'8px 6px',textAlign:'right',fontWeight:600}}>{row.media_dias}d</td>
                          <td style={{padding:'8px 6px',textAlign:'right',color:'#666'}}>{row.mediana_dias}d</td>
                          <td style={{padding:'8px 6px',textAlign:'right',fontSize:11,color:'#888'}}>
                            {row.min_dias}d–{row.max_dias}d
                          </td>
                          <td style={{padding:'8px 6px',textAlign:'right',fontSize:11,color:'#666'}}>{row.amostras}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            <div style={{fontSize:11,color:'var(--faint)',marginTop:12,fontStyle:'italic',lineHeight:1.5}}>
              💡 Quando média e mediana são muito diferentes (ex: Negociação 3.6 vs 0.0), significa que alguns leads ficam parados nessa etapa enquanto outros passam rápido.
            </div>
          </div>
        )}
        {activeTab === 'performance' && isGerente && (
          <div className="report-card full">
            <div className="report-title">Funil de agendamentos</div>
            {funil.total === 0 ? (
              <div style={{textAlign:'center',padding:'16px 0',color:'var(--faint)',fontSize:11}}>Ainda sem agendamentos registrados</div>
            ) : (
              <>
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:8,marginBottom:12}}>
                  {[['agendado','Agendados','#1565c0'],['apresentado','Apresentados','#2e7d32'],['remarcado','Remarcados','#e65100'],['cancelado','Cancelados','#c0392b'],['fechado','Fechados','#000']].map(([k,lbl,c])=>(
                    <div key={k} style={{padding:10,background:'var(--bg2)',borderRadius:6,textAlign:'center'}}>
                      <div style={{marginBottom:8}}>
                        <div style={{fontSize:24,fontWeight:600,color:c,lineHeight:1.1}}>{funil.byStatus[k]}</div>
                        <div style={{fontSize:9,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'.05em',marginTop:2}}>{lbl}</div>
                      </div>
                      {funil.byStatusEntries[k]?.length > 0 && (
                        <div style={{fontSize:10,lineHeight:1.35,maxHeight:160,overflow:'auto'}}>
                          {funil.byStatusEntries[k].slice(0,12).map(item => (
                            <div key={`${item.name}|${item.vendor}`} style={{padding:'3px 0',borderTop:'1px dashed var(--border)'}}>
                              <div style={{color:'var(--light)'}}>{item.name}</div>
                              <div style={{fontSize:9,color:'var(--muted)',marginTop:1}}>{item.vendor}</div>
                            </div>
                          ))}
                          {funil.byStatusEntries[k].length > 12 && (
                            <div style={{color:'var(--muted)',fontStyle:'italic',marginTop:4,fontSize:9}}>+{funil.byStatusEntries[k].length - 12} mais</div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div style={{display:'flex',gap:16,fontSize:12,color:'var(--muted)',flexWrap:'wrap'}}>
                  <div>Comparecimento: <b style={{color:'var(--dark)'}}>{funil.comparecimento}%</b></div>
                  <div>Cancelamento: <b style={{color:'var(--dark)'}}>{funil.cancelamento}%</b></div>
                  <div>Apresentações até fechar (média): <b style={{color:'var(--dark)'}}>{funil.mediaAps}</b></div>
                </div>
              </>
            )}
          </div>
        )}
        {activeTab === 'performance' && isGerente && (
          <div className="report-card full">
            <div className="report-title">Meta mensal — novos agendamentos (16/mês)</div>
            {metaSemanal.every(m => m.novos === 0) ? (
              <div style={{textAlign:'center',padding:'16px 0',color:'var(--faint)',fontSize:11}}>Sem novos agendamentos neste mês ainda</div>
            ) : (
              <div style={{display:'flex',flexDirection:'column'}}>
                {metaSemanal.map(m => {
                  const cor = m.bateu ? '#2e7d32' : (m.noRitmo ? '#1565c0' : '#c0392b');
                  return (
                    <div key={m.name} className="vendor-row" style={{gap:10}}>
                      <div className="vendor-av">{VENDOR_MAP[m.name]?.initials || m.name.slice(0,2)}</div>
                      <div style={{flex:1}}>
                        <div className="vendor-name">{m.name}</div>
                        <div className="bar-wrap" style={{marginTop:4}}>
                          <div className="bar-fill" style={{width:`${Math.min(m.novos/m.meta,1)*100}%`,background:cor}}/>
                        </div>
                      </div>
                      <div style={{textAlign:'right',minWidth:64}}>
                        <div style={{fontSize:15,fontWeight:600,color:cor}}>{m.novos}/{m.meta}</div>
                        <div style={{fontSize:9,color:cor}}>{m.bateu ? 'meta batida' : (m.noRitmo ? 'no ritmo' : 'atrasado')}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        {activeTab === 'operacional' && isGerente && (
          <div className="report-card full">
            <div className="report-title">Valor em carteira por vendedor</div>
            <div style={{display:'flex',gap:16,marginBottom:12,fontSize:12}}>
              <div>Carteira da loja: <b>{brl(totalCarteira)}</b></div>
              <div>Convertido: <b style={{color:'#2e7d32'}}>{brl(totalConvertido)}</b></div>
            </div>
            {vendorValores.map(v => (
              <div key={v.name} className="vendor-row" style={{gap:10}}>
                <div className="vendor-av">{VENDOR_MAP[v.name]?.initials || v.name.slice(0,2)}</div>
                <div className="vendor-name" style={{flex:1}}>{v.name}</div>
                <div className="vendor-stats">
                  <div className="vstat"><div className="vstat-val">{brl(v.carteira)}</div><div className="vstat-label">em carteira</div></div>
                  <div className="vstat"><div className={`vstat-val${v.convertido>0?' green':''}`}>{brl(v.convertido)}</div><div className="vstat-label">convertido</div></div>
                </div>
              </div>
            ))}
          </div>
        )}
        {activeTab === 'historico' && isGerente && (
          <div className="report-card full">
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8,flexWrap:'wrap',gap:8}}>
              <div className="report-title" style={{marginBottom:0}}>Leads perdidos — observações</div>
              <select value={fVendPerd} onChange={e=>setFVendPerd(e.target.value)}
                style={{fontSize:11,padding:'3px 8px',border:'1px solid var(--border)',borderRadius:6,background:'#fff',cursor:'pointer'}}>
                <option value="todos">Todos os vendedores</option>
                {vendedoresDisponiveis.map(nome=><option key={nome} value={nome}>{nome}</option>)}
              </select>
            </div>
            {(() => {
              const lista = perdidos.filter(p => fVendPerd === 'todos' || p.vendor === fVendPerd);
              if (lista.length === 0) return <div style={{textAlign:'center',padding:'16px 0',color:'var(--faint)',fontSize:11}}>Nenhum lead perdido para este filtro</div>;
              return (
                <div style={{display:'flex',flexDirection:'column',gap:8,maxHeight:340,overflowY:'auto'}}>
                  {lista.map(p => {
                    const texto = p.ultima_obs || p.notes;
                    return (
                      <div key={p.id} style={{borderLeft:'3px solid #c0392b',padding:'6px 10px',background:'var(--bg2)',borderRadius:'0 6px 6px 0'}}>
                        <div style={{display:'flex',justifyContent:'space-between',gap:8}}>
                          <div style={{fontSize:13,fontWeight:500}}>{p.name}</div>
                          <div style={{fontSize:10,color:'var(--muted)',whiteSpace:'nowrap'}}>{p.vendor || 'sem vendedor'}</div>
                        </div>
                        <div style={{fontSize:12,color:texto?'var(--dark)':'var(--faint)',marginTop:3,whiteSpace:'pre-wrap'}}>
                          {texto || 'Sem observação registrada'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}
        {activeTab === 'performance' && !isGerente && (
          <div className="report-card full">
            <div className="report-title">Minha carteira × convertido</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <div style={{border:'1px solid var(--border)',borderRadius:8,padding:14,textAlign:'center'}}>
                <div style={{fontSize:18,fontWeight:600,color:'var(--dark)'}}>{brl(minhaCarteira)}</div>
                <div style={{fontSize:10,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'.05em',marginTop:2}}>Em carteira</div>
              </div>
              <div style={{border:'1px solid var(--border)',borderRadius:8,padding:14,textAlign:'center'}}>
                <div style={{fontSize:18,fontWeight:600,color:'#2e7d32'}}>{brl(meuConvertido)}</div>
                <div style={{fontSize:10,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'.05em',marginTop:2}}>Convertido</div>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'performance' && !isGerente && (() => {
          const m = metaSemanal.find(x => x.name === vendorName);
          if (!m) return null;
          const cor = m.bateu ? '#2e7d32' : (m.noRitmo ? '#1565c0' : '#c0392b');
          return (
            <div className="report-card full">
              <div className="report-title">Minha meta de agendamentos (16/mês)</div>
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                <div style={{flex:1}}><div className="bar-wrap"><div className="bar-fill" style={{width:`${Math.min(m.novos/m.meta,1)*100}%`,background:cor}}/></div></div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:18,fontWeight:600,color:cor}}>{m.novos}/{m.meta}</div>
                  <div style={{fontSize:10,color:cor}}>{m.bateu ? 'meta batida' : (m.noRitmo ? 'no ritmo' : 'atrasado')}</div>
                </div>
              </div>
            </div>
          );
        })()}
        {activeTab === 'performance' && !isGerente && (
          <div className="report-card full">
            <div className="report-title">Meus agendamentos</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:8}}>
              {[['agendado','Agendados','#1565c0'],['apresentado','Apresentados','#2e7d32'],['remarcado','Remarcados','#e65100'],['cancelado','Cancelados','#c0392b'],['fechado','Fechados','#000']].map(([k,lbl,c])=>(
                <div key={k} style={{padding:10,background:'var(--bg2)',borderRadius:6,textAlign:'center'}}>
                  <div style={{marginBottom:8}}>
                    <div style={{fontSize:24,fontWeight:600,color:c,lineHeight:1.1}}>{funil.byStatus[k]}</div>
                    <div style={{fontSize:9,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'.05em',marginTop:2}}>{lbl}</div>
                  </div>
                  {funil.byStatusEntries[k]?.length > 0 && (
                    <div style={{fontSize:10,lineHeight:1.35,maxHeight:140,overflow:'auto'}}>
                      {funil.byStatusEntries[k].slice(0,10).map(item => (
                        <div key={`${item.name}|${item.vendor}`} style={{padding:'3px 0',borderTop:'1px dashed var(--border)',color:'var(--light)'}}>{item.name}</div>
                      ))}
                      {funil.byStatusEntries[k].length > 10 && (
                        <div style={{color:'var(--muted)',fontStyle:'italic',marginTop:4,fontSize:9}}>+{funil.byStatusEntries[k].length - 10} mais</div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'performance' && isGerente && (() => {
          const meses = [...new Set(historicoMensal.map(h => h.mes_label))].slice(0, 6);
          const vendedoras = [...new Set(historicoMensal.map(h => h.vendedora))];
          const getValor = (vend, mes) => {
            const row = historicoMensal.find(h => h.vendedora === vend && h.mes_label === mes);
            return row?.valor_total || 0;
          };
          return (
            <div className="report-card full">
              <div className="report-title">📊 Histórico de vendas por mês</div>
              <div style={{fontSize:12,color:'var(--muted)',marginBottom:16,lineHeight:1.5}}>
                Vendas fechadas (movidas pra "Vendidos") nos últimos 6 meses.
              </div>
              {historicoMensal.length === 0 ? (
                <div style={{textAlign:'center',padding:'32px 0',color:'var(--faint)',fontSize:11}}>Sem histórico ainda</div>
              ) : (
                <div style={{overflowX:'auto'}}>
                  <table style={{width:'100%',fontSize:13,borderCollapse:'collapse'}}>
                    <thead>
                      <tr style={{color:'var(--muted)',fontSize:9,textTransform:'uppercase',letterSpacing:'.05em',borderBottom:'1px solid var(--border)'}}>
                        <th style={{padding:'8px 6px',textAlign:'left'}}>Vendedora</th>
                        {meses.map(m => <th key={m} style={{padding:'8px 6px',textAlign:'right'}}>{m}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {vendedoras.map(v => (
                        <tr key={v} style={{borderBottom:'1px solid var(--border)'}}>
                          <td style={{padding:'8px 6px',fontWeight:600}}>{v}</td>
                          {meses.map(m => {
                            const valor = getValor(v, m);
                            return (
                              <td key={m} style={{padding:'8px 6px',textAlign:'right'}}>
                                {valor > 0 ? brl(valor) : <span style={{color:'#ccc'}}>—</span>}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })()}
        {activeTab === 'performance' && (
        <div className="report-card full">
          <div className="report-title">Leads por vendedor — taxa de conversão</div>
          {vendorStats.map(v => (
            <div className="vendor-row" key={v.name}>
              <div className="vendor-av">{VENDOR_MAP[v.name]?.initials||v.name.slice(0,2)}</div>
              <div style={{flex:1}}>
                <div className="vendor-name">{v.name}</div>
                <div style={{display:"flex",alignItems:"center",gap:8,marginTop:4}}>
                  <div className="bar-wrap">
                    <div className="bar-fill" style={{width:`${(v.total/maxLeads)*100}%`}}/>
                  </div>
                  <span style={{fontSize:10,color:"var(--light)",minWidth:30}}>{v.total} leads</span>
                </div>
              </div>
              <div className="vendor-stats">
                <div className="vstat">
                  <div className={`vstat-val${v.fechados>0?" green":""}`}>{v.fechados}</div>
                  <div className="vstat-label">fechados</div>
                </div>
                <div className="vstat">
                  <div className={`vstat-val${v.perdidos>0?" red":""}`}>{v.perdidos}</div>
                  <div className="vstat-label">perdidos</div>
                </div>
                <div className="vstat">
                  <div className="vstat-val" style={{color:"var(--black)",fontFamily:"'Cormorant Garamond',serif",fontSize:20}}>{v.taxa}%</div>
                  <div className="vstat-label">conversão</div>
                </div>
              </div>
            </div>
          ))}
          {vendorStats.every(v=>v.total===0) && (
            <div style={{textAlign:"center",padding:"20px 0",color:"var(--faint)",fontSize:11}}>Nenhum lead atribuído ainda</div>
          )}
        </div>
        )}

        {activeTab === 'operacional' && (
        <div className="report-card">
          <div className="report-title">Status geral dos leads</div>
          <div className="pie-row">
            <div className="pie-item">
              <div className="pie-val black">{totalAtivos}</div>
              <div className="pie-label">No funil</div>
            </div>
            <div className="pie-item">
              <div className="pie-val green">{totalFechados}</div>
              <div className="pie-label">Fechados</div>
            </div>
            <div className="pie-item">
              <div className="pie-val amber">{totalSemContato}</div>
              <div className="pie-label">Sem contato</div>
            </div>
            <div className="pie-item">
              <div className="pie-val red">{totalPerdidos}</div>
              <div className="pie-label">Perdidos</div>
            </div>
          </div>
          {leads.length > 0 && (
            <div style={{marginTop:16}}>
              <div style={{display:"flex",height:8,borderRadius:4,overflow:"hidden",gap:2}}>
                <div style={{flex:totalAtivos,background:"var(--black)",minWidth:totalAtivos?2:0}}/>
                <div style={{flex:totalFechados,background:"var(--green)",minWidth:totalFechados?2:0}}/>
                <div style={{flex:totalSemContato,background:"var(--amber)",minWidth:totalSemContato?2:0}}/>
                <div style={{flex:totalPerdidos,background:"var(--red)",minWidth:totalPerdidos?2:0}}/>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}>
                <span style={{fontSize:9,color:"var(--faint)"}}>Total: {leads.length} leads</span>
                <span style={{fontSize:9,color:"var(--green)"}}>
                  {leads.length ? Math.round((totalFechados/leads.length)*100) : 0}% conversão
                </span>
              </div>
            </div>
          )}
        </div>
        )}

        {activeTab === 'operacional' && (
        <div className="report-card">
          <div className="report-title">Leads por região</div>
          {regionStats.length === 0 && (
            <div style={{textAlign:"center",padding:"20px 0",color:"var(--faint)",fontSize:11}}>Sem dados de região</div>
          )}
          {regionStats.map(([region, count]) => (
            <div className="region-row" key={region}>
              <div className="region-name">{region}</div>
              <div style={{flex:2,margin:"0 12px"}}>
                <div className="bar-wrap">
                  <div className="bar-fill green" style={{width:`${(count/leads.length)*100}%`}}/>
                </div>
              </div>
              <div className="region-count">{count}</div>
            </div>
          ))}
        </div>
        )}

        {activeTab === 'historico' && (
        <div className="report-card full">
          <div className="report-title">Evolução de leads — últimos 8 meses</div>
          <div className="evolution-bars">
            {evolution.map(e => (
              <div className="evo-bar-wrap" key={e.key}>
                <div className="evo-val">{e.count||""}</div>
                <div className="evo-bar" style={{height:`${Math.max((e.count/maxEvo)*80,e.count?4:0)}px`}}/>
                <div className="evo-label">{e.label}</div>
              </div>
            ))}
          </div>
        </div>
        )}
      </div>
    </div>
  );
}

function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const handleLogin = async () => {
    setLoading(true); setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError("E-mail ou senha incorretos.");
    setLoading(false);
  };
  return (
    <>
      <style>{CSS}</style>
      <div className="login-wrap">
        <div className="login-box">
          <div className="login-logo-wrap">
            <div className="login-logo-box">
              <div className="login-logo">Le <span style={{display:"inline",letterSpacing:".22em"}}>Blanc</span></div>
            </div>
            <div className="login-tagline">Móveis Planejados · CRM</div>
          </div>
          <div className="login-divider"/>
          <label className="login-label">E-mail</label>
          <input className="login-input" type="email" placeholder="seu@leblancinteriores.com" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()}/>
          <label className="login-label">Senha</label>
          <input className="login-input" type="password" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()}/>
          <button className="login-btn" onClick={handleLogin} disabled={loading}>{loading?"Entrando...":"Entrar"}</button>
          {error && <div className="login-error">{error}</div>}
        </div>
      </div>
    </>
  );
}

export default function LeBlancCRM() {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [leads, setLeads] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [fv, setFv] = useState("all");
  const [fr, setFr] = useState("all");
  const [ft, setFt] = useState("all");
  const [activePage, setActivePage] = useState("pipeline");
  const [dragging, setDragging] = useState(null);
  const [showNewLead, setShowNewLead] = useState(false);
  const [newLead, setNewLead] = useState({ name:'', phone:'', region:'', city:'', product:'', budget:'', vendor:'', temperature:'cold' });
  const [tagsCatalogo, setTagsCatalogo] = useState([]);
  const [leadTags, setLeadTags] = useState([]);
  const [filtroTags, setFiltroTags] = useState([]);
  const [showTagsModal, setShowTagsModal] = useState(false);
  const [vendedoresDisponiveis, setVendedoresDisponiveis] = useState([]);
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .schema('leblanc').from('crm_users')
        .select('vendor_name')
        .eq('role', 'vendedor')
        .order('vendor_name');
      setVendedoresDisponiveis((data || []).map(u => u.vendor_name).filter(Boolean));
    })();
  }, []);

  const notifEmail = user?.email || session?.user?.email;

  async function carregarTags() {
    const [{ data: tags }, { data: relacoes }] = await Promise.all([
      supabase.from('leblanc_tags').select('*').order('nome'),
      supabase.from('leblanc_lead_tags').select('*'),
    ]);
    setTagsCatalogo(tags || []);
    setLeadTags(relacoes || []);
  }
  useEffect(() => { carregarTags(); }, []);

  function getTagsDoLead(leadId) {
    return leadTags
      .filter(lt => lt.lead_id === leadId)
      .map(lt => ({ id: lt.tag_id, nome: lt.tag_nome, cor: lt.tag_cor }));
  }

  async function adicionarTagLead(leadId, tagId) {
    const { error } = await supabase.from('leblanc_lead_tags')
      .insert({ lead_id: leadId, tag_id: tagId, criado_por: notifEmail });
    if (!error) await carregarTags();
  }

  async function removerTagLead(leadId, tagId) {
    const { error } = await supabase.from('leblanc_lead_tags')
      .delete()
      .eq('lead_id', leadId).eq('tag_id', tagId);
    if (!error) await carregarTags();
  }
  const { notifications, naoLidas, marcarComoLida, marcarTodasComoLidas, toasts, dismissToast } = useNotifications(notifEmail);

  useEffect(() => { pedirPermissaoNotificacoes(); }, []);

  function handleNotificationClick(notif) {
    if (notif.lead_id) {
      const lead = leads.find(l => l.id === notif.lead_id);
      if (lead) setSelected(lead);
    }
    if (!notif.lida) marcarComoLida(notif.id);
    dismissToast(notif.id);
  }

  function abrirLead(leadId) {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;
    setActivePage('pipeline');
    setSelected(lead);
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) { setLoading(false); return; }
    const loadUser = async () => {
      const { data } = await supabase.schema("leblanc").from("crm_users").select("*").eq("id", session.user.id).single();
      setUser(data);
    };
    loadUser();
  }, [session]);

  useEffect(() => {
    if (!session || !user) return;
    const loadLeads = async () => {
      setLoading(true);
      let q = supabase.schema("leblanc").from("leads").select("*, followups(*)").order("updated_at", { ascending: false });
      if (user.role === "vendedor") q = q.eq("vendor", user.vendor_name);
      const { data } = await q;
      setLeads(data || []);
      setLoading(false);
    };
    loadLeads();
  }, [session, user]);

  const filtered = useMemo(() => leads.filter(l => {
    if (fv !== "all" && l.vendor !== fv) return false;
    if (fr !== "all" && l.region !== fr) return false;
    if (ft !== "all" && l.temperature !== ft) return false;
    if (search && !l.name?.toLowerCase().includes(search.toLowerCase()) &&
        !l.product?.toLowerCase().includes(search.toLowerCase()) &&
        !l.city?.toLowerCase().includes(search.toLowerCase())) return false;
    if (filtroTags.length > 0) {
      const ids = leadTags.filter(lt => lt.lead_id === l.id).map(lt => lt.tag_id);
      if (!ids.some(id => filtroTags.includes(id))) return false;
    }
    return true;
  }), [leads, fv, fr, ft, search, filtroTags, leadTags]);

  const [fechadosMesCount, setFechadosMesCount] = useState(0);
  useEffect(() => {
    (async () => {
      const inicioMes = new Date();
      inicioMes.setDate(1);
      inicioMes.setHours(0, 0, 0, 0);
      const { count } = await supabase
        .from('leblanc_historico_eventos')
        .select('*', { count: 'exact', head: true })
        .eq('tipo', 'mudanca_etapa')
        .ilike('acao', '%vendido%')
        .gte('created_at', inicioMes.toISOString());
      setFechadosMesCount(count || 0);
    })();
  }, []);

  const kpis = useMemo(() => {
    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);
    const semDesfecho = l => !['vendidos','perdido'].includes(l.stage);
    return {
      novosMes: leads.filter(l => l.created_at && new Date(l.created_at) >= inicioMes).length,
      quentes: leads.filter(l => l.temperature === "hot" && semDesfecho(l)).length,
      pipeline: leads.filter(semDesfecho).length,
      fechadosMes: fechadosMesCount,
    };
  }, [leads, fechadosMesCount]);

  const handleUpdate = (updated) => {
    setLeads(prev => prev.map(l => l.id === updated.id ? updated : l));
    setSelected(updated);
  };

  async function handleAdvance(lead) {
    const idx = STAGES.findIndex(s => s.id === lead.stage);
    if (idx === -1 || idx >= STAGES.length - 2) return;
    const nextStage = STAGES[idx + 1].id;
    const { error } = await supabase.schema('leblanc').from('leads')
      .update({ stage: nextStage, updated_at: new Date().toISOString() })
      .eq('id', lead.id);
    if (error) {
      console.error('handleAdvance falhou:', error);
      alert(`Não foi possível avançar etapa: ${error.message}`);
      return;
    }
    setLeads(prev => prev.map(l =>
      l.id === lead.id ? { ...l, stage: nextStage } : l
    ));
    setSelected(prev => prev ? { ...prev, stage: nextStage } : null);
  }

  if (!session) return <LoginScreen/>;
  if (loading) return <><style>{CSS}</style><div className="loading">Carregando pipeline...</div></>;

  const isGerente = user?.role === "gerente";
  const VENDORS = Object.keys(VENDOR_MAP);
  const initials = user?.name?.split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase() || "??";

  return (
    <>
      <style>{CSS}</style>
      <NotificationToasts toasts={toasts} onClick={handleNotificationClick}/>
      {showTagsModal && (
        <ModalGerenciarTags
          tagsCatalogo={tagsCatalogo}
          onClose={() => setShowTagsModal(false)}
          userEmail={notifEmail}
          onRefresh={carregarTags}
        />
      )}
      <div className="crm">
        <div className="sidebar">
          <div className="logo-area">
            <div className="logo-box"><div className="logo-text">Le Blanc</div></div>
            <div className="logo-sub">Pipeline de Vendas</div>
          </div>
          <nav className="nav">
            {[["pipeline","Pipeline"],["tarefas","Tarefas"],["reports","Relatórios"]].map(([id,label])=>(
              <div key={id} className={`nav-item${activePage===id?" active":""}`} onClick={()=>{ setActivePage(id); setSelected(null); }}>
                <div className="nav-dot"/>{label}
              </div>
            ))}
          </nav>
          <div className="hbadge">
            <div className="hrow"><div className="hpulse"/><div className="htext">Helena ativa</div></div>
            <div className="hsub">SDR online</div>
          </div>
          <div className="sbox">
            <div className="sr"><span className="sl">Total leads</span><span className="sv">{leads.length}</span></div>
            <div className="sr"><span className="sl">Conversão</span><span className="sv">{leads.length?Math.round((leads.filter(l=>l.stage==='vendidos').length/leads.length)*100):0}%</span></div>
            <div className="sr"><span className="sl">Quentes</span><span className="sv">{kpis.quentes}</span></div>
          </div>
          <button className="logout-btn" onClick={()=>supabase.auth.signOut()}>⎋ Sair</button>
        </div>

        <div className="main">
          <div className="topbar">
            <div className="tbtitle">{activePage==="reports"?"Relatórios":"Pipeline de Vendas"}</div>
            <div className="tbr">
              <div className="sbox2">
                <span className="search-icon">⌕</span>
                <input placeholder="Buscar lead, produto, cidade..." value={search} onChange={e=>setSearch(e.target.value)}/>
              </div>
              <NotificationBell
                notifications={notifications}
                naoLidas={naoLidas}
                onItemClick={handleNotificationClick}
                onMarcarTodas={marcarTodasComoLidas}
              />
              <div className="uchip">
                <div className="uav">{initials}</div>
                <div className="uname">{user?.name||"—"}</div>
                <div className="role-badge">{isGerente?"Gerente":"Vendedor"}</div>
              </div>
            </div>
          </div>

          <div className="kpis">
            <div className="kpi"><div className="klabel">Novos este mês</div><div className="kval">{kpis.novosMes}</div><div className="kdelta">este mês</div></div>
            <div className="kpi hi"><div className="klabel">Leads quentes</div><div className="kval">{kpis.quentes}</div><div className="kdelta">alta prioridade</div></div>
            <div className="kpi"><div className="klabel">No funil</div><div className="kval">{kpis.pipeline}</div><div className="kdelta">ativos</div></div>
            <div className="kpi"><div className="klabel">Fechados este mês</div><div className="kval">{kpis.fechadosMes}</div><div className="kdelta green">este mês</div></div>
          </div>

          {activePage === "reports" ? (
            <Reports leads={leads} isGerente={isGerente} vendorName={user?.vendor_name} vendedoresDisponiveis={vendedoresDisponiveis}/>
          ) : activePage === "tarefas" ? (
            <PaginaTarefas
              userVendorName={user?.vendor_name}
              userRole={user?.role}
              abrirLead={abrirLead}
            />
          ) : (
            <>
              <div className="filters">
                {isGerente && (<>
                  <span className="fl">Vendedor</span>
                  <button className={`fb${fv==="all"?" a":""}`} onClick={()=>setFv("all")}>Todos</button>
                  {vendedoresDisponiveis.map(v=><button key={v} className={`fb${fv===v?" a":""}`} onClick={()=>setFv(fv===v?"all":v)}>{v}</button>)}
                  <div className="fdiv"/>
                </>)}
                <span className="fl">Região</span>
                <button className={`fb${fr==="all"?" a":""}`} onClick={()=>setFr("all")}>Todas</button>
                {REGIONS.map(r=><button key={r} className={`fb${fr===r?" a":""}`} onClick={()=>setFr(fr===r?"all":r)}>{r}</button>)}
                <div className="fdiv"/>
                <FiltroTagsKanban tagsCatalogo={tagsCatalogo} filtroTags={filtroTags} setFiltroTags={setFiltroTags}/>
                <button
                  onClick={()=>setShowTagsModal(true)}
                  style={{padding:'4px 12px',borderRadius:2,border:'1px solid var(--border)',background:'none',cursor:'pointer',fontSize:10,color:'var(--mid)',fontFamily:"'Jost',sans-serif",letterSpacing:'.06em',whiteSpace:'nowrap'}}>
                  🏷️ Gerenciar
                </button>
                <button
                  onClick={()=>setShowNewLead(true)}
                  style={{marginLeft:'auto',padding:'5px 14px',background:'var(--black)',color:'#fff',border:'none',borderRadius:4,fontSize:11,fontWeight:500,cursor:'pointer',letterSpacing:'.06em',whiteSpace:'nowrap',fontFamily:"'Jost',sans-serif"}}>
                  + Novo Lead
                </button>
              </div>

              {/* Modal Novo Lead */}
              {showNewLead && (
                <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.45)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}
                  onClick={e=>{ if(e.target===e.currentTarget) setShowNewLead(false); }}>
                  <div style={{background:'#fff',borderRadius:10,width:480,maxWidth:'95vw',maxHeight:'90vh',overflowY:'auto',boxShadow:'0 8px 40px rgba(0,0,0,0.18)'}}>
                    {/* Modal header */}
                    <div style={{padding:'20px 24px 16px',borderBottom:'1px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,fontWeight:400,letterSpacing:'.04em'}}>Novo Lead</div>
                      <button onClick={()=>setShowNewLead(false)}
                        style={{background:'none',border:'none',cursor:'pointer',fontSize:16,color:'var(--light)',padding:'2px 6px'}}>✕</button>
                    </div>
                    {/* Modal body */}
                    <div style={{padding:'20px 24px',display:'flex',flexDirection:'column',gap:12}}>
                      {[
                        { label:'Nome', field:'name', placeholder:'Nome completo' },
                        { label:'Telefone', field:'phone', placeholder:'(00) 00000-0000' },
                        { label:'Cidade', field:'city', placeholder:'Cidade' },
                        { label:'Produto', field:'product', placeholder:'Ex: Cozinha planejada' },
                        { label:'Orçamento', field:'budget', placeholder:'Ex: R$ 25.000' },
                      ].map(({ label, field, placeholder }) => (
                        <div key={field}>
                          <div style={{fontSize:10,color:'var(--light)',letterSpacing:'.1em',textTransform:'uppercase',marginBottom:4}}>{label}</div>
                          <input
                            value={newLead[field]}
                            onChange={e=>setNewLead(p=>({...p,[field]:e.target.value}))}
                            placeholder={placeholder}
                            style={{width:'100%',padding:'8px 10px',border:'1px solid var(--border)',borderRadius:4,fontSize:13,fontFamily:"'Jost',sans-serif",outline:'none',boxSizing:'border-box'}}/>
                        </div>
                      ))}
                      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                        <div>
                          <div style={{fontSize:10,color:'var(--light)',letterSpacing:'.1em',textTransform:'uppercase',marginBottom:4}}>Região</div>
                          <select value={newLead.region} onChange={e=>setNewLead(p=>({...p,region:e.target.value}))}
                            style={{width:'100%',padding:'8px 10px',border:'1px solid var(--border)',borderRadius:4,fontSize:13,fontFamily:"'Jost',sans-serif",outline:'none',background:'#fff'}}>
                            <option value="">— Selecione</option>
                            {REGIONS.map(r=><option key={r} value={r}>{r}</option>)}
                          </select>
                        </div>
                        <div>
                          <div style={{fontSize:10,color:'var(--light)',letterSpacing:'.1em',textTransform:'uppercase',marginBottom:4}}>Temperatura</div>
                          <select value={newLead.temperature} onChange={e=>setNewLead(p=>({...p,temperature:e.target.value}))}
                            style={{width:'100%',padding:'8px 10px',border:'1px solid var(--border)',borderRadius:4,fontSize:13,fontFamily:"'Jost',sans-serif",outline:'none',background:'#fff'}}>
                            <option value="hot">🔥 Quente</option>
                            <option value="warm">🌤 Morno</option>
                            <option value="cold">❄️ Frio</option>
                          </select>
                        </div>
                      </div>
                      {isGerente && (
                        <div>
                          <div style={{fontSize:10,color:'var(--light)',letterSpacing:'.1em',textTransform:'uppercase',marginBottom:4}}>Vendedor</div>
                          <select value={newLead.vendor} onChange={e=>setNewLead(p=>({...p,vendor:e.target.value}))}
                            style={{width:'100%',padding:'8px 10px',border:'1px solid var(--border)',borderRadius:4,fontSize:13,fontFamily:"'Jost',sans-serif",outline:'none',background:'#fff'}}>
                            <option value="">— Não atribuído</option>
                            {vendedoresDisponiveis.map(nome=><option key={nome} value={nome}>{nome}</option>)}
                          </select>
                        </div>
                      )}
                    </div>
                    {/* Modal footer */}
                    <div style={{padding:'12px 24px 20px',display:'flex',gap:8,justifyContent:'flex-end'}}>
                      <button onClick={()=>setShowNewLead(false)}
                        style={{padding:'8px 18px',border:'1px solid var(--border)',borderRadius:4,background:'none',fontSize:12,cursor:'pointer',fontFamily:"'Jost',sans-serif",color:'var(--mid)'}}>
                        Cancelar
                      </button>
                      <button onClick={async()=>{
                          if(!newLead.name.trim()) return;
                          const { data } = await supabase.schema('leblanc').from('leads').insert({
                            ...newLead,
                            vendor: newLead.vendor || user?.vendor_name || '',
                            stage:'novo',
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                          }).select().single();
                          if(data) setLeads(prev=>[data,...prev]);
                          setNewLead({ name:'', phone:'', region:'', city:'', product:'', budget:'', vendor:'', temperature:'cold' });
                          setShowNewLead(false);
                        }}
                        style={{padding:'8px 22px',background:'var(--black)',color:'#fff',border:'none',borderRadius:4,fontSize:12,fontWeight:500,cursor:'pointer',fontFamily:"'Jost',sans-serif",letterSpacing:'.06em'}}>
                        Criar Lead
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="board">
                <div className="kanban">
                  {STAGES.map(stage=>{
                    const cl = filtered.filter(l=>l.stage===stage.id);
                    return (
                      <div className="col" key={stage.id}
                        onDragOver={e=>e.preventDefault()}
                        onDrop={async()=>{
                          if(!dragging) return;
                          const { error } = await supabase.schema('leblanc').from('leads').update({stage:stage.id,updated_at:new Date().toISOString()}).eq('id',dragging);
                          if (error) {
                            console.error('onDrop kanban (update stage) falhou:', error);
                            alert(`Não foi possível mover o lead: ${error.message}`);
                            setDragging(null);
                            return;
                          }
                          const labelDestino = STAGES.find(s => s.id === stage.id)?.label || stage.id;
                          await supabase.from('leblanc_historico_eventos').insert({
                            lead_id: dragging,
                            tipo: 'mudanca_etapa',
                            acao: `Movido para "${labelDestino}"`,
                            icone: '🔄'
                          });
                          setLeads(p=>p.map(l=>l.id===dragging?{...l,stage:stage.id}:l));
                          setDragging(null);
                        }}>
                        <div className="ch">
                          <div className="ct">{stage.label}</div>
                          <div className="cc">{cl.length}</div>
                        </div>
                        <div className="clist">
                          {cl.length===0?<div className="empty-col">sem leads</div>:
                            cl.map(lead=><LeadCard key={lead.id} lead={lead} selected={selected?.id===lead.id}
                              onClick={()=>setSelected(selected?.id===lead.id?null:lead)}
                              onDragStart={()=>setDragging(lead.id)}
                              onDragEnd={()=>setDragging(null)}
                              tagsDoLead={getTagsDoLead(lead.id)}/>)}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className={`drawer${!selected?" closed":""}`}>
                  <Drawer lead={selected} user={user} onClose={()=>setSelected(null)} onUpdate={handleUpdate} onAdvance={handleAdvance}
                    tagsCatalogo={tagsCatalogo}
                    tagsDoLead={selected ? getTagsDoLead(selected.id) : []}
                    onAdicionarTag={adicionarTagLead}
                    onRemoverTag={removerTagLead}
                    vendedoresDisponiveis={vendedoresDisponiveis}/>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
