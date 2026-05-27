import { useState, useMemo, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://kptgtftvyiyxynxkpmaw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtwdGd0ZnR2eWl5eHlueGtwbWF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxOTQwOTUsImV4cCI6MjA4NDc3MDA5NX0.PTARgU61ku6He-WTza6k3muDeAuTsP21yjODbraXxr0";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const STAGES = [
  { id: "novo",         label: "Novo Lead",              colorClass: "" },
  { id: "sem_resposta", label: "Sem Resposta",           colorClass: "amber" },
  { id: "atendimento",  label: "Em Atendimento",         colorClass: "" },
  { id: "aguardando",   label: "Aguardando Informações", colorClass: "" },
  { id: "projeto",      label: "Desenvolvendo Projeto",  colorClass: "" },
  { id: "apresentacao", label: "Apresentação",           colorClass: "" },
  { id: "negociacao",   label: "Negociação",             colorClass: "" },
  { id: "vendidos",     label: "Vendidos",               colorClass: "green" },
  { id: "perdido",      label: "Perdido",                colorClass: "red" },
];

const VENDOR_MAP = {
  Tayne:   { initials: "TA" },
  Murilo:  { initials: "MU" },
  Nicolle: { initials: "NI" },
  Bruna:   { initials: "BR" },
  Andre:   { initials: "AN" },
};

const REGIONS = ["Curitiba", "RMC", "Litoral PR/SC"];
const PIPELINE_STAGES = ["novo","atendimento","aguardando","projeto","apresentacao","negociacao"];
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
  .ct{font-size:9px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:var(--dark);}
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

function VendorAvatar({ name }) {
  if (!name) return <div className="novav" title="Sem vendedor">—</div>;
  const v = VENDOR_MAP[name] || { initials: name.slice(0,2).toUpperCase() };
  return <div className="vav" title={name}>{v.initials}</div>;
}

function LeadCard({ lead, selected, onClick }) {
  const tcls = { hot:"th", warm:"tw", cold:"tc" }[lead.temperature] || "tc";
  const tlabel = { hot:"Quente", warm:"Morno", cold:"Frio" }[lead.temperature] || "Frio";
  const ts = new Date(lead.updated_at);
  const diff = Math.floor((Date.now() - ts) / 60000);
  const ago = diff < 60 ? `${diff}min` : diff < 1440 ? `${Math.floor(diff/60)}h` : `${Math.floor(diff/1440)}d`;
  return (
    <div className={`lcard${selected?" sel":""}`} onClick={onClick}>
      <div className="ctop">
        <div className="lname">{lead.name}</div>
        <div className={`ttag ${tcls}`}>{tlabel}</div>
      </div>
      <div className="cmeta">
        <div className="mrow"><span>◎</span><span>{lead.city||"—"}</span></div>
        <div className="mrow"><span>◈</span><span>{lead.product||"—"}</span></div>
      </div>
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

function Drawer({ lead, user, onClose, onUpdate, onAdvance }) {
  const [newNote, setNewNote] = useState("");
  const [saving, setSaving] = useState(false);
  if (!lead) return (
    <div className="dempty">
      <div className="demi">◈</div>
      <div className="demt">Selecione um lead<br/>para ver os detalhes</div>
    </div>
  );
  const tcls = { hot:"th", warm:"tw", cold:"tc" }[lead.temperature] || "tc";
  const tlabel = { hot:"Quente", warm:"Morno", cold:"Frio" }[lead.temperature] || "Frio";
  const next = stageNext(lead.stage);
  const isGerente = user?.role === "gerente";

  const updateField = async (field, value) => {
    await supabase.schema("leblanc").from("leads").update({ [field]: value, updated_at: new Date().toISOString() }).eq("id", lead.id);
    onUpdate({ ...lead, [field]: value });
  };

  const addFollowup = async () => {
    if (!newNote.trim()) return;
    setSaving(true);
    await supabase.schema("leblanc").from("followups").insert({
      lead_id: lead.id, tipo: "vendedor", acao: newNote.trim(), icone: "💬",
      tempo: new Date().toLocaleString("pt-BR", { day:"2-digit", month:"2-digit", hour:"2-digit", minute:"2-digit" }),
    });
    setNewNote("");
    onUpdate({ ...lead, followups: [...(lead.followups||[]), { tipo:"vendedor", acao:newNote.trim(), icone:"💬", tempo:"agora" }] });
    setSaving(false);
  };

  return (
    <>
      <div className="dh">
        <div>
          <div className="dname">{lead.name}</div>
          <div className="did">{lead.id} · <span className={`ttag ${tcls}`} style={{display:"inline-flex",padding:"1px 8px",borderRadius:2,fontSize:9}}>{tlabel}</span></div>
        </div>
        <button className="xbtn" onClick={onClose}>✕</button>
      </div>
      <div className="dbody">
        <div>
          <div className="stitle">Ficha do cliente</div>
          <div className="igrid">
            <div className="ifield"><div className="ilabel">Telefone</div><div className="ivalue">{lead.phone||"—"}</div></div>
            <div className="ifield"><div className="ilabel">Região</div><div className="ivalue">{lead.region||"—"}</div></div>
            <div className="ifield full"><div className="ilabel">Cidade</div><div className="ivalue">{lead.city||"—"}</div></div>
            <div className="ifield full"><div className="ilabel">Produto</div><div className="ivalue">{lead.product||"—"}</div></div>
            <div className="ifield"><div className="ilabel">Orçamento</div><div className="ivalue hi">{lead.budget||"—"}</div></div>
            <div className="ifield">
              <div className="ilabel">Temperatura</div>
              <select className="iselect" value={lead.temperature||"cold"} onChange={e=>updateField("temperature",e.target.value)}>
                <option value="hot">Quente</option>
                <option value="warm">Morno</option>
                <option value="cold">Frio</option>
              </select>
            </div>
            {isGerente && (
              <div className="ifield full">
                <div className="ilabel">Vendedor atribuído</div>
                <select className="iselect" value={lead.vendor||""} onChange={e=>updateField("vendor",e.target.value)}>
                  <option value="">— Não atribuído</option>
                  {Object.keys(VENDOR_MAP).map(v=><option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            )}
          </div>
        </div>
        {lead.sdr_summary && (
          <div>
            <div className="stitle">Resumo — SDR Helena</div>
            <div className="sdrbox">
              <div className="sdrh"><div className="sdrdot"/><div className="sdrl">Gerado pela IA</div></div>
              <div className="sdrt">{lead.sdr_summary}</div>
            </div>
          </div>
        )}
        {lead.ai_next_step && (
          <div>
            <div className="stitle">Próximo passo</div>
            <div className="aibox">
              <div className="aih"><span style={{color:"rgba(255,255,255,0.4)"}}>◆</span><span className="ail">Sugestão da IA</span></div>
              <div className="ait">{lead.ai_next_step}</div>
              <div className="aiacts">
                <button className="aibtn">Agendar</button>
                <button className="aibtn">WhatsApp</button>
              </div>
            </div>
          </div>
        )}
        <div>
          <div className="stitle">Histórico</div>
          <div className="tl">
            {(lead.followups||[]).map((f,i)=>(
              <div className="tli" key={i}>
                <div className="tlic">{f.icone||"•"}</div>
                <div className="tlb">
                  <div className="tla">{f.acao}</div>
                  <div className="tlm">{{sdr:"SDR Helena",vendedor:lead.vendor||"Vendedor",sistema:"Sistema"}[f.tipo]||"Sistema"} · {f.tempo}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="add-fu" style={{marginTop:12}}>
            <input className="fu-input" placeholder="Adicionar anotação..." value={newNote} onChange={e=>setNewNote(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addFollowup()}/>
            <button className="fu-btn" onClick={addFollowup} disabled={saving}>{saving?"...":"Salvar"}</button>
          </div>
        </div>
      </div>
      <div className="dfoot">
        <button className="bact">Ligar</button>
        <button className="bact">Proposta</button>
        {next && <button className="badv" onClick={()=>onAdvance(lead.id,next.id)}>→ {next.label}</button>}
      </div>
    </>
  );
}

function Reports({ leads }) {
  const VENDORS = Object.keys(VENDOR_MAP);

  const vendorStats = useMemo(() => VENDORS.map(v => {
    const vLeads = leads.filter(l => l.vendor === v);
    const fechados = vLeads.filter(l => l.stage === "fechado").length;
    const perdidos = vLeads.filter(l => l.stage === "perdido").length;
    const ativos = vLeads.filter(l => PIPELINE_STAGES.includes(l.stage)).length;
    const taxa = vLeads.length ? Math.round((fechados / vLeads.length) * 100) : 0;
    return { name: v, total: vLeads.length, fechados, perdidos, ativos, taxa };
  }).sort((a,b) => b.total - a.total), [leads]);

  const maxLeads = Math.max(...vendorStats.map(v => v.total), 1);

  const totalFechados = leads.filter(l => l.stage === "fechado").length;
  const totalPerdidos = leads.filter(l => l.stage === "perdido").length;
  const totalSemContato = leads.filter(l => l.stage === "sem_contato").length;
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
    return true;
  }), [leads, fv, fr, ft, search]);

  const kpis = useMemo(() => ({
    total: leads.length,
    quentes: leads.filter(l => l.temperature === "hot").length,
    pipeline: leads.filter(l => l.stage !== "perdido").length,
    fechados: leads.filter(l => l.stage === "fechado").length,
  }), [leads]);

  const handleUpdate = (updated) => {
    setLeads(prev => prev.map(l => l.id === updated.id ? updated : l));
    setSelected(updated);
  };

  const handleAdvance = async (id, nextStage) => {
    await supabase.schema("leblanc").from("leads").update({ stage: nextStage, updated_at: new Date().toISOString() }).eq("id", id);
    handleUpdate({ ...selected, stage: nextStage });
  };

  if (!session) return <LoginScreen/>;
  if (loading) return <><style>{CSS}</style><div className="loading">Carregando pipeline...</div></>;

  const isGerente = user?.role === "gerente";
  const VENDORS = Object.keys(VENDOR_MAP);
  const initials = user?.name?.split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase() || "??";

  return (
    <>
      <style>{CSS}</style>
      <div className="crm">
        <div className="sidebar">
          <div className="logo-area">
            <div className="logo-box"><div className="logo-text">Le Blanc</div></div>
            <div className="logo-sub">Pipeline de Vendas</div>
          </div>
          <nav className="nav">
            {[["pipeline","Pipeline"],["reports","Relatórios"]].map(([id,label])=>(
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
            <div className="sr"><span className="sl">Conversão</span><span className="sv">{leads.length?Math.round((kpis.fechados/leads.length)*100):0}%</span></div>
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
              <div className="uchip">
                <div className="uav">{initials}</div>
                <div className="uname">{user?.name||"—"}</div>
                <div className="role-badge">{isGerente?"Gerente":"Vendedor"}</div>
              </div>
            </div>
          </div>

          <div className="kpis">
            <div className="kpi"><div className="klabel">Total de leads</div><div className="kval">{kpis.total}</div><div className="kdelta">no CRM</div></div>
            <div className="kpi hi"><div className="klabel">Leads quentes</div><div className="kval">{kpis.quentes}</div><div className="kdelta">alta prioridade</div></div>
            <div className="kpi"><div className="klabel">Em negociação</div><div className="kval">{kpis.pipeline}</div><div className="kdelta">no funil</div></div>
            <div className="kpi"><div className="klabel">Fechados</div><div className="kval">{kpis.fechados}</div><div className="kdelta green">convertidos</div></div>
          </div>

          {activePage === "reports" ? (
            <Reports leads={leads}/>
          ) : (
            <>
              <div className="filters">
                {isGerente && (<>
                  <span className="fl">Vendedor</span>
                  <button className={`fb${fv==="all"?" a":""}`} onClick={()=>setFv("all")}>Todos</button>
                  {VENDORS.map(v=><button key={v} className={`fb${fv===v?" a":""}`} onClick={()=>setFv(fv===v?"all":v)}>{v}</button>)}
                  <div className="fdiv"/>
                </>)}
                <span className="fl">Região</span>
                <button className={`fb${fr==="all"?" a":""}`} onClick={()=>setFr("all")}>Todas</button>
                {REGIONS.map(r=><button key={r} className={`fb${fr===r?" a":""}`} onClick={()=>setFr(fr===r?"all":r)}>{r}</button>)}
                <div className="fdiv"/>
                <button className={`tb${ft==="hot"?" ha":""}`} onClick={()=>setFt(ft==="hot"?"all":"hot")}>🔥</button>
                <button className={`tb${ft==="warm"?" wa":""}`} onClick={()=>setFt(ft==="warm"?"all":"warm")}>🌤</button>
                <button className={`tb${ft==="cold"?" ca":""}`} onClick={()=>setFt(ft==="cold"?"all":"cold")}>❄️</button>
              </div>

              <div className="board">
                <div className="kanban">
                  {STAGES.map(stage=>{
                    const cl = filtered.filter(l=>l.stage===stage.id);
                    return (
                      <div className="col" key={stage.id}>
                        <div className="ch">
                          <div className="ct">{stage.label}</div>
                          <div className="cc">{cl.length}</div>
                        </div>
                        <div className="clist">
                          {cl.length===0?<div className="empty-col">sem leads</div>:
                            cl.map(lead=><LeadCard key={lead.id} lead={lead} selected={selected?.id===lead.id} onClick={()=>setSelected(selected?.id===lead.id?null:lead)}/>)}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className={`drawer${!selected?" closed":""}`}>
                  <Drawer lead={selected} user={user} onClose={()=>setSelected(null)} onUpdate={handleUpdate} onAdvance={handleAdvance}/>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
