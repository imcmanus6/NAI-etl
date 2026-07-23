const fs = require('fs');
const DIR = __dirname;
const DATA = JSON.parse(fs.readFileSync(`${DIR}/lateral-schema.json`, 'utf8'));

const STYLE = `<style>
  :root{--bg:#f6f7f9;--panel:#fff;--panel-2:#fbfcfd;--ink:#1a2129;--muted:#5b6672;--line:#e4e8ee;--line-2:#eef1f5;--accent:#0e7c86;--accent-ink:#0a5b63;--accent-soft:#e0f0f1;--key:#b45309;--key-soft:#f6e9d8;--link:#0e7c86;--chip:#eef1f5;--shadow:0 1px 2px rgba(16,32,48,.04),0 8px 24px rgba(16,32,48,.05);}
  @media (prefers-color-scheme:dark){:root{--bg:#0e1216;--panel:#161c23;--panel-2:#12171d;--ink:#d7dee6;--muted:#8a97a6;--line:#242c35;--line-2:#1c232b;--accent:#3fb6c2;--accent-ink:#7fd4dd;--accent-soft:#123037;--key:#e0a458;--key-soft:#2a2113;--link:#4fc2ce;--chip:#1c232b;--shadow:0 1px 2px rgba(0,0,0,.3),0 10px 30px rgba(0,0,0,.35);}}
  :root[data-theme="dark"]{--bg:#0e1216;--panel:#161c23;--panel-2:#12171d;--ink:#d7dee6;--muted:#8a97a6;--line:#242c35;--line-2:#1c232b;--accent:#3fb6c2;--accent-ink:#7fd4dd;--accent-soft:#123037;--key:#e0a458;--key-soft:#2a2113;--link:#4fc2ce;--chip:#1c232b;--shadow:0 1px 2px rgba(0,0,0,.3),0 10px 30px rgba(0,0,0,.35);}
  :root[data-theme="light"]{--bg:#f6f7f9;--panel:#fff;--panel-2:#fbfcfd;--ink:#1a2129;--muted:#5b6672;--line:#e4e8ee;--line-2:#eef1f5;--accent:#0e7c86;--accent-ink:#0a5b63;--accent-soft:#e0f0f1;--key:#b45309;--key-soft:#f6e9d8;--link:#0e7c86;--chip:#eef1f5;--shadow:0 1px 2px rgba(16,32,48,.04),0 8px 24px rgba(16,32,48,.05);}
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--ink);font:14px/1.5 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;-webkit-font-smoothing:antialiased}
  .mono{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
  a{color:var(--link);text-decoration:none}
  header{padding:20px clamp(16px,3vw,32px) 16px;border-bottom:1px solid var(--line);background:var(--panel)}
  .toprow{display:flex;align-items:center;justify-content:space-between;gap:12px}
  h1{margin:0 0 3px;font-size:18px;font-weight:650;letter-spacing:-.01em;text-wrap:balance}
  .themebtn{border:1px solid var(--line);background:var(--panel-2);color:var(--muted);cursor:pointer;
    width:32px;height:32px;border-radius:8px;font-size:16px;line-height:1;flex:none}
  .themebtn:hover{color:var(--ink);border-color:var(--accent)}
  .sub{color:var(--muted);font-size:12.5px;max-width:74ch}
  .chips{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
  .chip{display:inline-flex;align-items:baseline;gap:5px;background:var(--chip);border:1px solid var(--line);border-radius:999px;padding:4px 11px;font-size:12px;color:var(--muted)}
  .chip b{color:var(--ink);font-variant-numeric:tabular-nums;font-weight:640}
  .search{margin-top:14px;position:relative;max-width:520px}
  .search input{width:100%;padding:9px 12px 9px 34px;border:1px solid var(--line);border-radius:9px;background:var(--panel-2);color:var(--ink);font-size:13.5px;font-family:inherit}
  .search input:focus{outline:2px solid var(--accent);outline-offset:1px;border-color:transparent}
  .search svg{position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--muted)}
  main{display:grid;grid-template-columns:300px 1fr;min-height:calc(100vh - 150px)}
  @media(max-width:820px){main{grid-template-columns:1fr}.side{border-right:0;border-bottom:1px solid var(--line);max-height:44vh}}
  .side{border-right:1px solid var(--line);overflow-y:auto;background:var(--panel-2)}
  .domain{padding:14px 18px 5px;font-size:10.5px;font-weight:670;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
  .tbtn{display:flex;align-items:center;gap:8px;width:100%;text-align:left;border:0;background:none;cursor:pointer;padding:6px 18px;color:var(--ink);font-family:ui-monospace,Menlo,monospace;font-size:12.5px;border-left:2px solid transparent}
  .tbtn:hover{background:var(--line-2)}
  .tbtn.on{background:var(--accent-soft);border-left-color:var(--accent);color:var(--accent-ink)}
  .tbtn .rc{margin-left:auto;font-family:system-ui;font-size:10.5px;color:var(--muted);font-variant-numeric:tabular-nums}
  .empty{padding:16px 18px;color:var(--muted);font-size:12.5px}
  .detail{overflow-y:auto;padding:clamp(16px,2.4vw,28px)}
  .dhead{display:flex;align-items:baseline;gap:12px;flex-wrap:wrap;margin-bottom:4px}
  .dhead h2{margin:0;font-size:17px;font-family:ui-monospace,Menlo,monospace;font-weight:640;letter-spacing:-.01em}
  .dhead .meta{color:var(--muted);font-size:12px;font-variant-numeric:tabular-nums}
  .joins{margin:10px 0 18px;display:flex;gap:6px;flex-wrap:wrap}
  .jtag{font-size:11.5px;background:var(--panel);border:1px solid var(--line);border-radius:7px;padding:3px 8px;font-family:ui-monospace,Menlo,monospace}
  .jtag a{font-weight:600}
  .jlabel{font-size:10.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);align-self:center;margin-right:2px}
  .tablewrap{overflow-x:auto;border:1px solid var(--line);border-radius:11px;box-shadow:var(--shadow);background:var(--panel)}
  table{border-collapse:collapse;width:100%;font-size:12.5px}
  th{text-align:left;font-size:10.5px;letter-spacing:.05em;text-transform:uppercase;color:var(--muted);font-weight:640;padding:9px 14px;border-bottom:1px solid var(--line);background:var(--panel-2);position:sticky;top:0}
  td{padding:7px 14px;border-bottom:1px solid var(--line-2);vertical-align:top}
  tr:last-child td{border-bottom:0}
  tr.match td{background:var(--accent-soft)}
  .cname{font-family:ui-monospace,Menlo,monospace;color:var(--ink);font-weight:550}
  .ctype{font-family:ui-monospace,Menlo,monospace;color:var(--muted);font-size:11.5px}
  .pk{color:var(--key);font-weight:700;font-size:10px;letter-spacing:.04em;background:var(--key-soft);padding:1px 6px;border-radius:5px}
  .mul{color:var(--muted);font-size:10px;letter-spacing:.04em}
  .null{color:var(--muted)}
  .fk a{font-family:ui-monospace,Menlo,monospace;font-size:11.5px;font-weight:600}
  .fk::before{content:"→ ";color:var(--muted)}
  .refby{margin-top:22px}.refby h3{font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);margin:0 0 8px}
  .refby .list{display:flex;gap:6px;flex-wrap:wrap}
  footer{padding:14px clamp(16px,3vw,32px);color:var(--muted);font-size:11.5px;border-top:1px solid var(--line);background:var(--panel)}
  .warn{color:var(--key)}
</style>`;

const APP = `<script id="data" type="application/json">__DATA__</script>
<script>
// theme toggle — decouple from OS so the page looks the same however it's opened
(function(){ const r=document.documentElement, btn=document.getElementById('theme');
  const saved=localStorage.getItem('lse-theme'); if(saved) r.setAttribute('data-theme',saved);
  btn.onclick=()=>{ const cur=r.getAttribute('data-theme')||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');
    const next=cur==='dark'?'light':'dark'; r.setAttribute('data-theme',next); localStorage.setItem('lse-theme',next); }; })();
const S=JSON.parse(document.getElementById('data').textContent);
const byName=Object.fromEntries(S.tables.map(t=>[t.name,t]));
const refBy={}; for(const t of S.tables) for(const r of t.relationships){ (refBy[r.references]??=[]).push({from:t.name,column:r.column}); }
let current=null,query='';
const side=document.getElementById('side'),detail=document.getElementById('detail'),q=document.getElementById('q');
document.getElementById('chips').innerHTML=[['tables',S.tableCount],['columns',S.columnCount],['inferred joins',S.joinCount]].map(([l,n])=>\`<span class="chip"><b>\${n.toLocaleString()}</b> \${l}</span>\`).join('');
document.getElementById('fcount').textContent=S.joinCount+' inferred joins across '+S.tableCount+' tables';
function mt(t,ql){ if(!ql) return {colHits:new Set()}; const th=t.name.toLowerCase().includes(ql); const ch=new Set(t.columns.filter(c=>c.name.toLowerCase().includes(ql)).map(c=>c.name)); return (th||ch.size)?{colHits:ch}:null; }
function fmt(n){ return n>=1000?(n/1000).toFixed(n>=10000?0:1)+'k':n; }
function renderSide(){ const ql=query.trim().toLowerCase(); let html='';
  for(const dom of S.domains){ const dt=S.tables.filter(t=>t.domain===dom); if(!dt.length) continue; const vis=dt.filter(t=>!ql||mt(t,ql)); if(!vis.length) continue;
    html+=\`<div class="domain">\${dom}</div>\`+vis.map(t=>{ const m=ql?mt(t,ql):null; const b=m&&m.colHits.size?\` · \${m.colHits.size}✓\`:''; return \`<button class="tbtn \${t.name===current?'on':''}" data-t="\${t.name}"><span>\${t.name}</span><span class="rc">\${t.columns.length}c\${t.approxRows!=null?' · '+fmt(t.approxRows):''}\${b}</span></button>\`; }).join(''); }
  side.innerHTML=html||'<div class="empty">No tables or columns match.</div>'; side.querySelectorAll('.tbtn').forEach(b=>b.onclick=()=>select(b.dataset.t)); }
function select(name){ current=name; renderSide(); const t=byName[name]; const ql=query.trim().toLowerCase(); const hit=c=>ql&&c.name.toLowerCase().includes(ql);
  const joins=t.relationships.length?\`<div class="joins"><span class="jlabel">joins</span>\${t.relationships.map(r=>\`<span class="jtag"><span class="mono">\${r.column}</span> → <a data-t="\${r.references}">\${r.references}</a></span>\`).join('')}</div>\`:'';
  const rows=t.columns.map(c=>\`<tr class="\${hit(c)?'match':''}"><td><span class="cname">\${c.name}</span></td><td><span class="ctype">\${c.type}</span></td><td>\${c.nullable?'<span class="null">null</span>':''}</td><td>\${c.key==='PRI'?'<span class="pk">PK</span>':c.key==='MUL'?'<span class="mul">idx</span>':c.key==='UNI'?'<span class="mul">uniq</span>':''}</td><td class="\${c.fk?'fk':''}">\${c.fk?\`<a data-t="\${c.fk}">\${c.fk}</a>\`:''}</td></tr>\`).join('');
  const back=refBy[name]||[]; const rb=back.length?\`<div class="refby"><h3>Referenced by (\${back.length})</h3><div class="list">\${back.map(r=>\`<span class="jtag"><a data-t="\${r.from}">\${r.from}</a>.<span class="mono">\${r.column}</span></span>\`).join('')}</div></div>\`:'';
  detail.innerHTML=\`<div class="dhead"><h2>\${t.name}</h2><span class="meta">\${t.columns.length} columns\${t.approxRows!=null?' · ~'+t.approxRows.toLocaleString()+' rows':''} · \${t.domain}</span></div>\${joins}<div class="tablewrap"><table><thead><tr><th>Column</th><th>Type</th><th>Null</th><th>Key</th><th>References</th></tr></thead><tbody>\${rows}</tbody></table></div>\${rb}\`;
  detail.querySelectorAll('[data-t]').forEach(a=>a.onclick=e=>{e.preventDefault();select(a.dataset.t);}); detail.scrollTop=0; }
q.oninput=()=>{ query=q.value; renderSide(); const ql=query.trim().toLowerCase(); if(ql){ const f=S.tables.find(t=>mt(t,ql)); if(f&&(!current||!mt(byName[current],ql))) select(f.name); } };
renderSide(); select(S.tables[0].name);
</script>`;

for (const s of DATA.schemas) {
  const page = `<!DOCTYPE html>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<title>${s.label} — Schema Explorer</title>
${STYLE}
<header>
  <div class="toprow"><h1>${s.label} — Schema Explorer</h1>
    <button id="theme" class="themebtn" title="Toggle light / dark" aria-label="Toggle light or dark theme">◐</button></div>
  <div class="sub">${s.source}. Relationships are <span class="warn">inferred from column naming</span> — no foreign-key constraints, so verify a join before relying on it.</div>
  <div class="chips" id="chips"></div>
  <div class="search"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4-4"/></svg>
    <input id="q" placeholder="Search tables and columns…" autocomplete="off"></div>
</header>
<main><nav class="side" id="side"></nav><section class="detail" id="detail"></section></main>
<footer>Source-schema reference for the ETL platform. <span id="fcount"></span></footer>
${APP.replace('__DATA__', JSON.stringify(s))}`;
  fs.writeFileSync(`${DIR}/explorer-${s.id}.html`, page);
  console.log(`explorer-${s.id}.html — ${s.label} (${s.tableCount}t, ${(page.length/1024).toFixed(0)}KB)`);
}
