import { createIcons, ArrowUpRight, ArrowRight, ArrowLeftRight, ChevronDown, RefreshCw, Search, Check, X, Clock3, Info, ExternalLink, Leaf, SlidersHorizontal, CircleDollarSign, TrendingUp, LoaderCircle, Layers, TriangleAlert } from 'lucide';
import { compare, chartPoints, outcome } from './math.js';
import { examples, fetchPools, prettyProject, filterPools, poolLink, poolWarnings } from './data.js';
import './style.css';

const iconSet = { ArrowUpRight, ArrowRight, ArrowLeftRight, ChevronDown, RefreshCw, Search, Check, X, Clock3, Info, ExternalLink, Leaf, SlidersHorizontal, CircleDollarSign, TrendingUp, LoaderCircle, Layers, TriangleAlert };
const $ = (selector) => document.querySelector(selector);
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icon = (name, cls='') => `<i data-lucide="${name}" class="${cls}" aria-hidden="true"></i>`;
const money = value => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:2}).format(value);
const compact = value => new Intl.NumberFormat('en-US',{notation:'compact',maximumFractionDigits:1}).format(value);
const pct = value => `${value.toFixed(2)}%`;
const PAGE_SIZE = 40;
const DEFAULT_INPUTS = {amount:5000,currentApy:4.2,days:30,cost:18};

const state = {
  view:'markets', inputs:{...DEFAULT_INPUTS}, selected:examples[1], excludeRewards:false, selectedFetchedAt:null,
  pools:[], fetchedAt:null, loading:false, dataError:'', search:'', chain:'All networks', sort:'tvl', marketPage:0,
  modal:null, toast:null,
};
let toastTimeout, announceTimer, modalOpener=null, marketsInFlight=false;
const MARKET_REFRESH_MS=5*60*1000;
document.body.insertAdjacentHTML('beforeend','<div id="modal-root"></div><div id="toast" aria-live="polite"></div>');

function decorate() { createIcons({icons:iconSet,attrs:{'stroke-width':1.65}}); }
function targetApy() { return state.excludeRewards&&state.selected.base!=null?state.selected.base:state.selected.apy; }
function inputs() { return {...state.inputs,targetApy:targetApy()}; }
function sourceLabel() {
  if(state.selected.example) return 'Illustrative rates';
  return `Retrieved ${new Date(state.selectedFetchedAt).toLocaleString([], {month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})} · ${Math.max(0,Math.floor((Date.now()-state.selectedFetchedAt)/60000))}m ago`;
}
function notify(message, type='success') {
  state.toast={message,type}; clearTimeout(toastTimeout); renderToast();
  toastTimeout=setTimeout(()=>{state.toast=null;renderToast();},6500);
}
function renderToast() {
  const node=$('#toast'); if(!node)return;
  node.innerHTML=state.toast?`<div class="toast ${state.toast.type}" role="status">${icon(state.toast.type==='error'?'info':'check')}<span>${esc(state.toast.message)}</span><button class="icon-button" id="dismiss-toast" aria-label="Dismiss notification">${icon('x')}</button></div>`:'';
  $('#dismiss-toast')?.addEventListener('click',()=>{state.toast=null;renderToast();}); decorate();
}

function render({focus}={}) {
  const active=document.activeElement;
  const focusSelector=focus??(active?.id?`#${CSS.escape(active.id)}`:active?.dataset?.amount?`[data-amount="${active.dataset.amount}"]`:active?.dataset?.days?`[data-days="${active.dataset.days}"]`:active?.dataset?.view?`.nav [data-view="${active.dataset.view}"]`:null);
  $('#app').innerHTML=`
    <header class="header"><div class="header-inner">
      <a class="brand" href="#" aria-label="Thehro home"><span class="brand-icon">${icon('arrow-up-right')}</span>thehro<span class="brand-dot">.</span></a>
      <nav class="nav" aria-label="Main navigation">
        ${[['compare','Compare'],['markets','Markets']].map(([v,label])=>`<button data-view="${v}" class="${state.view===v?'active':''}" ${state.view===v?'aria-current="page"':''}>${label}${v==='markets'?' <span class="nav-dot"></span>':''}</button>`).join('')}
      </nav>
      <span></span>
    </div></header>
    <main class="shell" id="main">
      ${state.view==='compare'?comparePage():marketsPage()}
      <footer class="footer"><span><span class="footer-mark">✳</span> Built for a little more clarity.</span><div><button id="methodology">How the math works ${icon('arrow-up-right')}</button></div></footer>
    </main>`;
  decorate(); bind(); renderToast();
  if(focusSelector&&!state.modal)$(focusSelector)?.focus({preventScroll:true});
}

function poolDetails() {
  const p=state.selected, rows=[];
  if(p.meta)rows.push(`<span><b>Pool</b> ${esc(p.meta)}</span>`);
  if(Number.isFinite(p.tvl))rows.push(`<span><b>TVL</b> $${compact(p.tvl)}</span>`);
  if(p.mean30d!=null)rows.push(`<span><b>30-day mean</b> ${pct(p.mean30d)}</span>`);
  const warnings=poolWarnings(p), link=poolLink(p);
  return `${rows.length||link?`<div class="pool-details">`:'<div hidden>'}${rows.join('')}${link?`<a href="${esc(link)}" target="_blank" rel="noopener noreferrer">Pool page ${icon('external-link')}</a>`:''}</div>${warnings.length?`<div class="pool-warning">${icon('triangle-alert')}<span>${warnings.map(esc).join(' ')}</span></div>`:''}`;
}

function comparePage() {
  const s=state.selected;
  return `<section class="page-intro"><div><div class="eyebrow"><span></span> THE YIELD REALITY CHECK</div><h1 tabindex="-1">Is the higher APY<br>worth the <em>move?</em></h1><p>A bigger percentage is only half the story.<br class="desktop-br"> Find out what switching actually adds to your balance.</p></div><div class="intro-note"><span class="note-doodle">↗</span><p>Small fees.<br>Big difference.</p><span class="note-line"></span></div></section>
    <div class="scenario-strip"><div>${icon('info')}<span>${s.example?'You’re exploring an illustrative scenario. Try real USDC markets instead.':`USDC comparison · ${esc(sourceLabel())} · rates can change after retrieval.`}</span></div><button data-view="markets">Explore markets ${icon('arrow-right')}</button></div>
    <div class="workspace"><aside class="inputs-panel">
      <div class="panel-heading"><h2>Your starting point</h2>${icon('sliders-horizontal')}</div>
      <label class="field-label" for="amount">Amount to compare <span>USDC</span></label>
      <div class="amount-input"><span>$</span><input id="amount" type="number" min="0.01" max="1000000000" step="any" value="${state.inputs.amount}" inputmode="decimal" aria-describedby="amount-note"></div>
      <div class="amount-presets">${[1000,5000,10000,25000].map(n=>`<button data-amount="${n}" class="${state.inputs.amount===n?'selected':''}">$${compact(n)}</button>`).join('')}</div>
      <p class="field-note" id="amount-note">A scenario amount, not your wallet balance.</p>
      <div class="input-separator"></div>
      <label class="field-label" for="current-apy">Your current APY</label><div class="standard-input"><input id="current-apy" type="number" min="0" max="1000" step="0.1" value="${state.inputs.currentApy}"><span>%</span></div>
      <div class="field-label horizon-label"><label for="days">How long will you stay?</label><strong id="days-label">${state.inputs.days} days</strong></div>
      <input class="range" id="days" type="range" min="1" max="3650" value="${state.inputs.days}"><div class="range-labels"><span>1 day</span><span>10 years</span></div>
      <div class="horizon-presets">${[7,30,90,365].map(n=>`<button data-days="${n}" class="${state.inputs.days===n?'selected':''}">${n===365?'1 year':n+' days'}</button>`).join('')}</div>
      <div class="input-separator"></div>
      <label class="field-label" for="cost">All-in switching cost ${icon('arrow-left-right')}</label><div class="standard-input"><span>$</span><input id="cost" type="number" min="0" step="any" value="${state.inputs.cost}" inputmode="decimal"></div>
      <p class="field-note">Your estimate for withdrawal, gas, bridging, entry fees and slippage. Deducted upfront.</p>
      <div class="mini-callout">${icon('leaf')}<span>Your funds stay where they are.<br>This is a comparison, not a transaction.</span></div>
    </aside><section class="comparison-column">
      <div class="target-panel"><div class="target-heading"><span class="section-label">THE POTENTIAL MOVE</span><button class="text-button" data-view="markets">Change pool ${icon('arrow-up-right')}</button></div><div class="target-row"><span class="protocol-icon">${icon('layers')}</span><div class="target-name"><h2>${esc(prettyProject(s.project))}</h2><p><span class="token-dot">$</span> USDC <span class="small-dot">·</span> ${esc(s.chain)} ${s.example?'<span class="example-tag">EXAMPLE</span>':''}</p></div><div class="target-apy"><strong id="target-apy">${pct(s.apy)}</strong><span>reported APY</span></div></div>
      ${poolDetails()}
      <div class="target-bottom"><div id="rate-breakdown"><span class="legend-dot base"></span>Base ${s.base==null?'unknown':pct(s.base)} <span class="legend-dot reward"></span>Rewards ${s.reward==null?'unknown':pct(s.reward)}</div><label class="toggle"><input id="exclude-rewards" type="checkbox" ${state.excludeRewards?'checked':''} ${s.base==null?'disabled':''}><span class="toggle-track"></span>Exclude rewards</label></div></div>
      <div id="results">${resultsMarkup()}</div><div id="result-announcement" class="sr-only" aria-live="polite" aria-atomic="true"></div>
    </section></div>`;
}

function verdictCopy(advantage) {
  const verdict=outcome(advantage);
  return {verdict, caption:verdict==='tie'?'The two options are effectively even.':verdict==='move'?'Switching comes out ahead.':'Staying comes out ahead.', unit:verdict==='tie'?'difference':verdict==='move'?'extra after costs':'more by staying'};
}
function resultsMarkup() {
  let result; try { result=compare(inputs()); } catch(error) { return `<div class="validation-error" role="alert">${icon('info')}${esc(error.message)}</div>`; }
  const {verdict,caption,unit}=verdictCopy(result.advantage),wins=verdict==='move',tie=verdict==='tie';
  return `<div class="verdict-panel ${wins?'move-wins':'stay-wins'}"><div class="verdict-top"><span>${icon(wins?'trending-up':'leaf')}${tie?'A CLOSE CALL':wins?'THE MOVE ADDS UP':'PATIENCE PAYS'}</span><span class="horizon-tag">OVER ${state.inputs.days} DAYS</span></div><div class="verdict-main"><div><h2>${caption}</h2><p><strong>${money(Math.abs(result.advantage))}</strong><span>${unit}</span></p></div><div class="verdict-art" aria-hidden="true"><span class="art-circle"></span><span class="art-arrow">${wins?'↗':'↔'}</span></div></div><div class="verdict-bottom"><span>At the assumed rates below. Before taxes and changes in risk.</span></div></div>
    <div class="metric-grid"><div><span>Stay where you are ${icon('info')}</span><strong>${money(result.stay)}</strong><small>projected earnings</small></div><div><span>Make the move ${icon('arrow-up-right')}</span><strong>${money(result.move)}</strong><small>projected earnings after costs</small></div><div><span>Break-even ${icon('clock-3')}</span><strong>${result.breakEven===null?'Never':result.breakEven>3650?'10+ years':result.breakEven===0?'Immediate':`${Math.ceil(result.breakEven)} <em>days</em>`}</strong><small>${result.breakEven===null?'at these assumed rates':'until moving catches up'}</small></div></div>
    <div class="chart-panel"><div class="chart-heading"><div><h3>Let time tell the story</h3><p>Projected earnings, after switching costs</p></div><div class="chart-legend"><span><i class="stay-line"></i>Stay</span><span><i class="move-line"></i>Move</span></div></div>${chartMarkup(result)}<div class="chart-footnote">${icon('info')}Effective target ${pct(targetApy())}. ${state.excludeRewards?'Reward incentives excluded.':'Reward incentives included when reported.'} USDC assumed to hold $1.</div></div>`;
}

function chartMarkup(result) {
  const points=chartPoints(inputs()); const width=720,height=220,left=54,right=15,top=18,bottom=34;
  const values=points.flatMap(p=>[p.stay,p.move]); let low=Math.min(0,...values), high=Math.max(...values,1); const margin=(high-low)*0.12;low-=margin;high+=margin;
  const x=day=>left+day/state.inputs.days*(width-left-right), y=v=>top+(high-v)/(high-low)*(height-top-bottom);
  const path=field=>points.map((p,i)=>`${i?'L':'M'}${x(p.day).toFixed(2)},${y(p[field]).toFixed(2)}`).join(' ');
  const ticks=Array.from({length:4},(_,i)=>low+(high-low)*i/3);
  const marker=result.breakEven!==null&&result.breakEven>0&&result.breakEven<state.inputs.days;
  return `<svg class="earnings-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="Over ${state.inputs.days} days, staying earns ${esc(money(result.stay))}; moving earns ${esc(money(result.move))} after costs.">
    <defs><linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#b6cf85" stop-opacity=".26"/><stop offset="100%" stop-color="#b6cf85" stop-opacity="0"/></linearGradient></defs>
    ${ticks.map(v=>`<line x1="${left}" x2="${width-right}" y1="${y(v)}" y2="${y(v)}" stroke="#eceee7" stroke-dasharray="3 5"/><text x="${left-12}" y="${y(v)+4}" text-anchor="end">$${Math.abs(v)<100?v.toFixed(0):compact(v)}</text>`).join('')}
    <path d="${path('move')} L${x(state.inputs.days)},${height-bottom} L${x(0)},${height-bottom} Z" fill="url(#chart-fill)"/>
    ${marker?`<line x1="${x(result.breakEven)}" x2="${x(result.breakEven)}" y1="${top}" y2="${height-bottom}" stroke="#abb4a4" stroke-dasharray="4 4"/><text x="${Math.min(x(result.breakEven)+6,width-110)}" y="${top+5}" fill="#476441">Break-even · day ${Math.ceil(result.breakEven)}</text>`:''}
    <path d="${path('stay')}" fill="none" stroke="#b1b8ab" stroke-width="2.5" stroke-dasharray="5 5"/><path d="${path('move')}" fill="none" stroke="#547b37" stroke-width="3"/>
    <circle cx="${x(state.inputs.days)}" cy="${y(result.move)}" r="4.5" fill="#547b37" stroke="white" stroke-width="2"/>
    ${[0,.25,.5,.75,1].map(f=>`<text x="${x(state.inputs.days*f)}" y="${height-8}" text-anchor="${f===0?'start':f===1?'end':'middle'}">Day ${Math.round(state.inputs.days*f)}</text>`).join('')}
    </svg>`;
}

function marketsPage() {
  const chains=[...new Set(state.pools.map(p=>p.chain))].sort();
  return `<section class="page-intro compact-intro"><div><div class="eyebrow"><span></span> A CLEARER VIEW OF YIELD</div><h1 tabindex="-1">Find your next <em>comparison.</em></h1><p>Single-asset USDC pools with at least $1M TVL. Search, sort and page through every match.</p></div><button class="primary-button" id="load-markets" ${state.loading?'disabled':''}>${icon(state.loading?'loader-circle':'refresh-cw',state.loading?'spin':'')}${state.loading?'Fetching markets…':state.pools.length?'Refresh rates':'Load live markets'}</button></section>
    <div class="market-notice" id="market-notice">${marketNoticeMarkup()}</div>
    ${state.dataError?`<div class="error-banner" role="alert">${icon('info')}${esc(state.dataError)} You can still explore the labeled examples.</div>`:''}
    <div class="market-toolbar"><div class="search-field">${icon('search')}<input id="market-search" type="search" placeholder="Search a protocol, network or pool" value="${esc(state.search)}" aria-label="Search markets"></div><div class="market-selects"><label class="network-select">Network<select id="chain-filter"><option>All networks</option>${chains.map(c=>`<option ${state.chain===c?'selected':''}>${esc(c)}</option>`).join('')}</select>${icon('chevron-down')}</label><label class="network-select">Sort<select id="market-sort">${[['tvl','Largest TVL'],['apy','Highest APY'],['base','Highest base APY'],['name','Protocol A–Z']].map(([v,label])=>`<option value="${v}" ${state.sort===v?'selected':''}>${label}</option>`).join('')}</select>${icon('chevron-down')}</label></div></div>
    <div id="market-list">${marketListMarkup()}</div>
    <div class="example-section"><div class="section-heading"><h2>A few ways to test the math</h2><span>ILLUSTRATIVE SCENARIOS</span></div><div class="example-grid">${examples.map((p,i)=>`<button class="example-card" data-example="${p.id}"><span class="example-number">0${i+1}</span><h3>${esc(p.project)}</h3><p>${['A modest bump in base yield.','A mix of base yield and incentives.','A high headline rate. Toggle rewards off.'][i]}</p><div><strong>${pct(p.apy)} <small>APY</small></strong>${icon('arrow-up-right')}</div></button>`).join('')}</div></div>`;
}
function marketNoticeMarkup() {
  return `${icon('info')}<p>${state.pools.length?`Retrieved ${esc(new Date(state.fetchedAt).toLocaleString())} from DeFiLlama. Rates refresh automatically every 5 minutes. The feed does not provide an observation timestamp per pool; retrieval time is not proof of a fresh rate.`:'Live rates are fetched directly from DeFiLlama. No API key required for this endpoint. Availability depends on the provider.'} Pool inclusion is not an endorsement or a risk rating. Check eligibility, lockups and withdrawal terms with the protocol before acting.</p>`;
}
function marketListMarkup() {
  if(!state.pools.length)return `<div class="empty-markets">${icon(state.loading?'loader-circle':'circle-dollar-sign',state.loading?'spin':'')}<h3>${state.loading?'Getting the lay of the land…':'Real rates. Your assumptions.'}</h3><p>${state.loading?'The public feed is large. This can take up to 45 seconds.':'Load markets to compare reported USDC yields, or start with an example below.'}</p></div>`;
  const filtered=filterPools(state.pools,state), pages=Math.max(1,Math.ceil(filtered.length/PAGE_SIZE));
  state.marketPage=Math.min(state.marketPage,pages-1);
  const start=state.marketPage*PAGE_SIZE;
  if(!filtered.length)return '<div class="empty-markets"><h3>No matching pools</h3><p>Try another network or a broader search.</p></div>';
  return `<div class="market-table-wrap"><table class="market-table"><thead><tr><th>POOL / NETWORK</th><th>REPORTED APY</th><th>BASE / REWARD</th><th>TVL</th><th><span class="sr-only">Compare</span></th></tr></thead><tbody>${filtered.slice(start,start+PAGE_SIZE).map(p=>`<tr><td><div class="pool-cell"><span class="pool-initial">${esc(prettyProject(p.project).slice(0,1))}</span><div><strong>${esc(prettyProject(p.project))}</strong><small>${esc(p.chain)} · USDC${p.meta?` · ${esc(p.meta)}`:''}</small>${poolWarnings(p).length?`<small class="pool-flag">${icon('triangle-alert')}Check restrictions</small>`:''}</div></div></td><td><strong class="apy-cell">${pct(p.apy)}</strong>${p.mean30d!==null?`<small>30d mean ${pct(p.mean30d)}</small>`:''}</td><td>${p.base===null?'—':pct(p.base)} <span class="muted">/ ${p.reward===null?'—':pct(p.reward)}</span></td><td>$${compact(p.tvl)}</td><td><div class="row-actions"><button class="market-compare" data-pool="${esc(p.id)}" aria-label="Compare ${esc(prettyProject(p.project))} on ${esc(p.chain)}${p.meta?` (${esc(p.meta)})`:''}">Compare ${icon('arrow-up-right')}</button><a class="icon-button" href="${esc(poolLink(p))}" target="_blank" rel="noopener noreferrer" aria-label="Open ${esc(prettyProject(p.project))} pool page on DeFiLlama">${icon('external-link')}</a></div></td></tr>`).join('')}</tbody></table></div>
    <div class="pagination"><button class="outline-button" data-market-page="${state.marketPage-1}" ${state.marketPage===0?'disabled':''}>Previous</button><span>Showing ${start+1}–${Math.min(filtered.length,start+PAGE_SIZE)} of ${filtered.length} · Page ${state.marketPage+1} of ${pages}</span><button class="outline-button" data-market-page="${state.marketPage+1}" ${state.marketPage>=pages-1?'disabled':''}>Next</button></div>
    <p class="table-note"><span>${filtered.length===state.pools.length?`All ${state.pools.length} matching pools.`:`${filtered.length} of ${state.pools.length} pools match your filters.`}</span><a href="https://defillama.com/yields" target="_blank" rel="noopener noreferrer">Source: DeFiLlama ${icon('external-link')}</a></p>`;
}

function bind() {
  $('.brand').addEventListener('click',e=>{e.preventDefault();navigate('compare');});
  document.querySelectorAll('[data-view]').forEach(el=>el.addEventListener('click',()=>navigate(el.dataset.view)));
  $('#methodology')?.addEventListener('click',e=>openModal('methodology',e.currentTarget));
  for(const [id,key] of [['amount','amount'],['current-apy','currentApy'],['cost','cost'],['days','days']]) {
    $(`#${id}`)?.addEventListener('input',event=>{
      state.inputs[key]=event.target.value===''?NaN:Number(event.target.value);
      if(key==='days')$('#days-label').textContent=`${state.inputs.days} days`;
      document.querySelectorAll('[data-amount]').forEach(e=>e.classList.toggle('selected',Number(e.dataset.amount)===state.inputs.amount));
      document.querySelectorAll('[data-days]').forEach(e=>e.classList.toggle('selected',Number(e.dataset.days)===state.inputs.days));
      updateResults();
    });
  }
  document.querySelectorAll('[data-amount]').forEach(el=>el.addEventListener('click',()=>{state.inputs.amount=Number(el.dataset.amount);render();}));
  document.querySelectorAll('[data-days]').forEach(el=>el.addEventListener('click',()=>{state.inputs.days=Number(el.dataset.days);render();}));
  $('#exclude-rewards')?.addEventListener('change',e=>{state.excludeRewards=e.target.checked;render();});
  $('#load-markets')?.addEventListener('click',loadMarkets);
  $('#market-search')?.addEventListener('input',e=>{state.search=e.target.value;state.marketPage=0;refreshMarketList();});
  $('#chain-filter')?.addEventListener('change',e=>{state.chain=e.target.value;state.marketPage=0;refreshMarketList();});
  $('#market-sort')?.addEventListener('change',e=>{state.sort=e.target.value;state.marketPage=0;refreshMarketList();});
  bindMarkets();
  document.querySelectorAll('[data-example]').forEach(el=>el.addEventListener('click',()=>selectPool(examples.find(p=>p.id===el.dataset.example))));
}
function bindMarkets() {
  document.querySelectorAll('[data-pool]').forEach(el=>el.addEventListener('click',()=>selectPool(state.pools.find(p=>p.id===el.dataset.pool))));
  document.querySelectorAll('[data-market-page]').forEach(el=>el.addEventListener('click',()=>{state.marketPage=Number(el.dataset.marketPage);refreshMarketList();$('#market-list')?.scrollIntoView({block:'start',behavior:'smooth'});}));
}
function refreshMarketList() { const node=$('#market-list');if(!node)return;node.innerHTML=marketListMarkup();decorate();bindMarkets(); }
function updateResults() {
  if(!$('#results'))return;
  $('#results').innerHTML=resultsMarkup();decorate();
  clearTimeout(announceTimer);
  announceTimer=setTimeout(()=>{const node=$('#result-announcement');if(!node)return;try{const r=compare(inputs()),v=verdictCopy(r.advantage);node.textContent=`${v.caption} ${money(Math.abs(r.advantage))} ${v.unit} over ${state.inputs.days} days.`;}catch(e){node.textContent=e.message;}},900);
}
function selectPool(pool) {
  if(!pool)return;
  state.selected=pool;state.selectedFetchedAt=pool.example?null:state.fetchedAt;state.excludeRewards=false;state.view='compare';
  render({focus:'h1'});window.scrollTo({top:0,behavior:'smooth'});
}
function navigate(view) {
  state.view=view;render({focus:'h1'});window.scrollTo({top:0,behavior:'smooth'});
}

function marketError(error) {
  return error.name==='TimeoutError'?'The yield feed took too long to respond. Try again.':/429/.test(error.message)?'The yield feed is rate limiting requests. Wait a minute and try again.':error instanceof TypeError?'The yield feed could not be reached. Check your connection.':error.message||'The yield feed could not be reached.';
}
async function loadMarkets({manual=true}={}) {
  if(state.loading||marketsInFlight)return;
  if(!manual&&state.pools.length)return refreshMarketsInBackground();
  state.loading=true;state.dataError='';render(manual?{}:undefined);
  try{const data=await fetchPools({force:state.pools.length>0});state.pools=data.pools;state.fetchedAt=data.fetchedAt;state.marketPage=0;if(manual)notify(`Loaded ${data.pools.length} USDC pools. Select one to compare.`);}
  catch(error){state.dataError=marketError(error);}
  finally{state.loading=false;render(manual?{focus:'#load-markets'}:undefined);}
}
async function refreshMarketsInBackground() {
  marketsInFlight=true;
  try{
    const data=await fetchPools({force:true});
    state.pools=data.pools;state.fetchedAt=data.fetchedAt;state.dataError='';
    if(state.view==='markets'&&!state.modal){const notice=$('#market-notice');if(notice){notice.innerHTML=marketNoticeMarkup();refreshMarketList();}else render();}
  }catch(error){
    if(state.view==='markets')notify(`Automatic refresh failed. Showing rates retrieved ${new Date(state.fetchedAt).toLocaleTimeString()}. ${marketError(error)}`,'error');
  }finally{marketsInFlight=false;}
}

function openModal(name,opener) { modalOpener=opener??null;state.modal=name;renderModal(); }
function closeModal() {
  if(!state.modal)return;
  state.modal=null;$('#modal-root').innerHTML='';document.body.classList.remove('modal-open');
  (modalOpener?.isConnected?modalOpener:$('h1'))?.focus({preventScroll:true});modalOpener=null;
}
function renderModal() {
  $('#modal-root').innerHTML=`<div class="modal-overlay"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><button class="modal-close icon-button" aria-label="Close dialog">${icon('x')}</button>
    <span class="modal-kicker">TRANSPARENT BY DESIGN</span><h2 id="modal-title">The math, without the magic.</h2><p>APY is an effective annual rate. For a holding period of <b>d</b> days:</p><div class="formula">Stay = P × (1 + current APY)<sup>d/365</sup><br>Move = (P − cost) × (1 + target APY)<sup>d/365</sup><br>Extra gain = Move − Stay</div><p>Rates are converted from percentages. Break-even is when those two balances match. A lower or equal rate never recovers a positive switching cost.</p><ul class="assumption-list"><li>Switching costs are user-entered estimates, paid upfront.</li><li>Rates stay constant over the holding period.</li><li>Reward APY is treated as equally reinvestable. Excluding rewards uses the base APY; base yield may also contain subsidies.</li><li>Taxes, lockups, liquidity limits, smart-contract risk and depegs are not modeled.</li><li>DeFiLlama retrieval time is not an onchain quote or a pool observation timestamp.</li></ul><p class="small-print">This is a scenario calculator, not a deposit recommendation.</p></section></div>`;
  document.body.classList.add('modal-open');decorate();
  $('.modal-close').addEventListener('click',closeModal);
  $('.modal-overlay').addEventListener('click',e=>{if(e.target===e.currentTarget)closeModal();});
  $('.modal-close').focus();
}
document.addEventListener('keydown',event=>{ if(event.key==='Escape'&&state.modal)closeModal(); });
setInterval(()=>{if(!document.hidden)loadMarkets({manual:false});},MARKET_REFRESH_MS);
document.addEventListener('visibilitychange',()=>{
  if(!document.hidden&&state.fetchedAt&&Date.now()-state.fetchedAt>=MARKET_REFRESH_MS)loadMarkets({manual:false});
});

render();
loadMarkets({manual:false});
