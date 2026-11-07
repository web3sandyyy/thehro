<<<<<<< Updated upstream
import { createIcons, ArrowUpRight, ArrowRight, ArrowLeftRight, ChevronDown, RefreshCw, Search, Check, X, Clock3, Info, ExternalLink, Leaf, SlidersHorizontal, CircleDollarSign, TrendingUp, Download, LoaderCircle, Layers, Share2, Upload, Pencil, RotateCcw, TriangleAlert } from 'lucide';
import { compare, chartPoints, outcome, FEE_KEYS } from './math.js';
import { examples, fetchPools, prettyProject, filterPools, manualPool, poolLink, poolWarnings } from './data.js';
import { effectiveRate, cleanScenario, restoreScenario, parseScenario, encodeScenario, decodeScenario } from './scenario.js';
import { readDraft, writeDraft, clearDraft } from './storage.js';
import './style.css';

const iconSet = { ArrowUpRight, ArrowRight, ArrowLeftRight, ChevronDown, RefreshCw, Search, Check, X, Clock3, Info, ExternalLink, Leaf, SlidersHorizontal, CircleDollarSign, TrendingUp, Download, LoaderCircle, Layers, Share2, Upload, Pencil, RotateCcw, TriangleAlert };
=======
import { createIcons, ArrowUpRight, ArrowRight, ArrowLeftRight, Wallet, ChevronDown, RefreshCw, Search, Check, X, Clock3, Info, ExternalLink, Bookmark, Leaf, SlidersHorizontal, FileClock, CircleDollarSign, TrendingUp, Download, Trash2, Copy, LoaderCircle, Layers, Share2, Upload, Pencil, RotateCcw, Smartphone, TriangleAlert } from 'lucide';
import { compare, chartPoints, outcome, FEE_KEYS, LIFETIMES } from './math.js';
import { examples, fetchPools, prettyProject, filterPools, manualPool, poolLink, poolWarnings } from './data.js';
import { connectWallet, saveReceipt, readReceiptPage, removeReceipt, explorer, chain, RECEIPT_SCHEMA } from './arkiv.js';
import { effectiveRate, cleanScenario, restoreScenario, parseScenario, encodeScenario, decodeScenario } from './scenario.js';
import { discoverWallets, mobileWalletLinks, isMobile } from './wallets.js';
import { readDraft, writeDraft, clearDraft } from './storage.js';
import './style.css';

const iconSet = { ArrowUpRight, ArrowRight, ArrowLeftRight, Wallet, ChevronDown, RefreshCw, Search, Check, X, Clock3, Info, ExternalLink, Bookmark, Leaf, SlidersHorizontal, FileClock, CircleDollarSign, TrendingUp, Download, Trash2, Copy, LoaderCircle, Layers, Share2, Upload, Pencil, RotateCcw, Smartphone, TriangleAlert };
>>>>>>> Stashed changes
const $ = (selector) => document.querySelector(selector);
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icon = (name, cls='') => `<i data-lucide="${name}" class="${cls}" aria-hidden="true"></i>`;
const money = value => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:2}).format(value);
const compact = value => new Intl.NumberFormat('en-US',{notation:'compact',maximumFractionDigits:1}).format(value);
const pct = value => `${value.toFixed(2)}%`;
<<<<<<< Updated upstream
const PAGE_SIZE = 40;
const FEE_LABELS = {withdrawal:'Withdrawal',gas:'Gas',bridge:'Bridge',entry:'Entry / deposit',slippage:'Slippage'};
=======
const shortAddress = value => `${value.slice(0,6)}…${value.slice(-4)}`;
const PAGE_SIZE = 40, RECEIPT_PAGE = 24;
const FEE_LABELS = {withdrawal:'Withdrawal',gas:'Gas',bridge:'Bridge',entry:'Entry / deposit',slippage:'Slippage'};
const LIFETIME_LABELS = {2:'2 minutes — quick expiry demo',15:'15 minutes',30:'30 minutes',60:'1 hour',1440:'1 day',10080:'7 days'};
>>>>>>> Stashed changes
const DEFAULT_INPUTS = {amount:5000,currentApy:4.2,days:30,cost:18};

const state = {
  view:'markets', inputs:{...DEFAULT_INPUTS}, selected:examples[1],
  excludeRewards:false, rateMode:'reported', rateHaircut:0, fees:null,
  pools:[], fetchedAt:null, loading:false, dataError:'', search:'', chain:'All networks', sort:'tvl', marketPage:0,
<<<<<<< Updated upstream
  modal:null, toast:null, restoredSource:null, selectedFetchedAt:null,
  remember:false, importError:'',
};
let toastTimeout, announceTimer, persistTimer, modalOpener=null, marketsInFlight=false;
const MARKET_REFRESH_MS=5*60*1000;
=======
  wallet:null, provider:null, connecting:false, receipts:[], receiptsLoading:false, receiptError:'', receiptsLoadedAt:null,
  receiptOffset:0, receiptsMore:false, receiptsSkipped:0,
  busy:false, modal:null, toast:null, lastTx:null, lastSaved:null, restoredSource:null, selectedFetchedAt:null,
  remember:false, saveDraft:{name:'',minutes:30}, saveError:'', importError:'',
};
let toastTimeout, announceTimer, persistTimer, pendingHint, readEpoch=0, connectionEpoch=0, modalEpoch=0, modalOpener=null, providerCleanup=()=>{}, lastAutoRefresh=0, marketsInFlight=false;
const MARKET_REFRESH_MS=5*60*1000;
const walletDiscovery=discoverWallets();
>>>>>>> Stashed changes
document.body.insertAdjacentHTML('beforeend','<div id="modal-root"></div><div id="toast" aria-live="polite"></div>');

function decorate() { createIcons({icons:iconSet,attrs:{'stroke-width':1.65}}); }
function targetApy() { return effectiveRate(state.selected,state.excludeRewards,state.rateMode,state.rateHaircut); }
function inputs() { return {...state.inputs,targetApy:targetApy()}; }
function provenance() {
  if (state.restoredSource) return state.restoredSource;
  const s=state.selected, type=s.manual?'manual':s.example?'example':'defillama';
  return { type, fetchedAt:type==='defillama'?state.selectedFetchedAt:null, poolId:s.id, provider:type==='defillama'?'DeFiLlama':null, observationTime:null };
}
function sourceLabel() {
  const source=provenance();
  if(source.type==='example') return 'Illustrative rates';
  if(source.type==='manual') return 'Your own target rate';
  return `Retrieved ${new Date(source.fetchedAt).toLocaleString([], {month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})} · ${Math.max(0,Math.floor((Date.now()-source.fetchedAt)/60000))}m ago`;
}
function defaultName() { return `${state.selected.manual?'My target':prettyProject(state.selected.project)} · ${state.inputs.days} days`; }
<<<<<<< Updated upstream
function buildScenario(name=defaultName()) {
  return cleanScenario({ version:2, name, inputs:inputs(), source:provenance(), pool:{...state.selected},
    excludeRewards:state.excludeRewards, rateMode:state.rateMode, rateHaircut:state.rateHaircut, fees:state.fees,
    savedAt:Date.now(), lifetimeMinutes:30 });
=======
function buildScenario(name=defaultName(), minutes=state.saveDraft.minutes) {
  return cleanScenario({ version:2, name, inputs:inputs(), source:provenance(), pool:{...state.selected},
    excludeRewards:state.excludeRewards, rateMode:state.rateMode, rateHaircut:state.rateHaircut, fees:state.fees,
    savedAt:Date.now(), lifetimeMinutes:minutes });
>>>>>>> Stashed changes
}
function applyScenario(scenario) {
  const r=restoreScenario(scenario);
  Object.assign(state,{inputs:r.inputs,selected:r.selected,excludeRewards:r.excludeRewards,rateMode:r.rateMode,rateHaircut:r.rateHaircut,fees:r.fees,restoredSource:r.restoredSource,selectedFetchedAt:r.selectedFetchedAt});
}
function persist() {
  clearTimeout(persistTimer);
  if(!state.remember)return;
  persistTimer=setTimeout(()=>{try{writeDraft(localStorage,buildScenario());}catch{}},300);
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
    <a class="skip-link" href="#main">Skip to content</a>
    <header class="header"><div class="header-inner">
      <a class="brand" href="#" aria-label="Thehro home"><span class="brand-icon">${icon('arrow-up-right')}</span>thehro<span class="brand-dot">.</span></a>
      <nav class="nav" aria-label="Main navigation">
<<<<<<< Updated upstream
        ${[['compare','Compare'],['markets','Markets']].map(([v,label])=>`<button data-view="${v}" class="${state.view===v?'active':''}" ${state.view===v?'aria-current="page"':''}>${label}${v==='markets'?' <span class="nav-dot"></span>':''}</button>`).join('')}
      </nav>
      <span></span>
    </div></header>
    <main class="shell" id="main">
      ${state.view==='compare'?comparePage():marketsPage()}
      <footer class="footer"><span><span class="footer-mark">✳</span> Built for a little more clarity.</span><div><button id="methodology">How the math works ${icon('arrow-up-right')}</button></div></footer>
=======
        ${[['compare','Compare'],['markets','Markets'],['receipts','My receipts']].map(([v,label])=>`<button data-view="${v}" class="${state.view===v?'active':''}" ${state.view===v?'aria-current="page"':''}>${label}${v==='markets'?' <span class="nav-dot"></span>':''}</button>`).join('')}
      </nav>
      <button class="wallet-button" id="connect" ${state.connecting?'aria-busy="true"':''}>${icon(state.connecting?'loader-circle':'wallet',state.connecting?'spin':'')}<span>${state.wallet?esc(shortAddress(state.wallet)):state.connecting?'Check your wallet…':'Connect wallet'}</span></button>
    </div></header>
    <main class="shell" id="main">
      ${state.view==='compare'?comparePage():state.view==='markets'?marketsPage():receiptsPage()}
      <footer class="footer"><span><span class="footer-mark">✳</span> Built for a little more clarity.</span><div><button id="methodology">How the math works ${icon('arrow-up-right')}</button><span class="footer-divider"></span><span>Receipts on <a href="https://arkiv.network" target="_blank" rel="noopener noreferrer">[ ARKIV ]</a></span></div></footer>
>>>>>>> Stashed changes
    </main>`;
  decorate(); bind(); renderToast();
  if(focusSelector&&!state.modal)$(focusSelector)?.focus({preventScroll:true});
}

function scenarioToolbar() {
  return `<div class="scenario-toolbar" role="group" aria-label="Scenario tools">
    <button id="manual-target" class="chip-button ${state.selected.manual?'selected':''}">${icon('pencil')}Enter my own target APY</button>
    <button id="share-link" class="chip-button">${icon('share-2')}Copy share link</button>
    <button id="export-scenario" class="chip-button">${icon('download')}Export JSON</button>
    <button id="import-scenario" class="chip-button">${icon('upload')}Import</button>
    <button id="reset-scenario" class="chip-button">${icon('rotate-ccw')}Reset</button>
    <label class="remember"><input id="remember" type="checkbox" ${state.remember?'checked':''}><span>Remember on this device</span></label>
  </div>`;
}
function feeFields() {
  if(!state.fees)return `<button id="itemize-fees" class="text-button itemize">${icon('arrow-left-right')}Itemize costs</button>`;
  return `<fieldset class="fee-breakdown"><legend>Cost breakdown</legend>${FEE_KEYS.map(k=>`<label for="fee-${k}"><span>${FEE_LABELS[k]}</span><span class="fee-input">$<input id="fee-${k}" data-fee="${k}" type="number" min="0" step="any" inputmode="decimal" value="${state.fees[k]}"></span></label>`).join('')}<button id="clear-fees" class="text-button">Use a single total instead</button></fieldset>`;
}
function poolDetails() {
  const p=state.selected;
  if(p.manual)return `<div class="manual-rates"><label for="manual-base">Base APY<span class="standard-input"><input id="manual-base" type="number" min="0" max="1000" step="0.1" value="${p.base}"><span>%</span></span></label><label for="manual-reward">Reward APY<span class="standard-input"><input id="manual-reward" type="number" min="0" max="1000" step="0.1" value="${p.reward}"><span>%</span></span></label><p>Use the rate you were quoted elsewhere. Split out incentives so you can stress-test them.</p></div>`;
  const rows=[];
  if(p.meta)rows.push(`<span><b>Pool</b> ${esc(p.meta)}</span>`);
  if(Number.isFinite(p.tvl))rows.push(`<span><b>TVL</b> $${compact(p.tvl)}</span>`);
  if(p.mean30d!=null)rows.push(`<span><b>30-day mean</b> ${pct(p.mean30d)}</span>`);
  const warnings=poolWarnings(p), link=poolLink(p);
  return `${rows.length||link?`<div class="pool-details">`:'<div hidden>'}${rows.join('')}${link?`<a href="${esc(link)}" target="_blank" rel="noopener noreferrer">Pool page ${icon('external-link')}</a>`:''}</div>${warnings.length?`<div class="pool-warning">${icon('triangle-alert')}<span>${warnings.map(esc).join(' ')}</span></div>`:''}`;
}
function rateControls() {
  const meanOk=state.selected.mean30d!=null&&!state.excludeRewards;
  return `<div class="rate-controls"><label for="rate-mode">Target rate basis<select id="rate-mode" class="modal-input"><option value="reported" ${state.rateMode==='reported'?'selected':''}>${state.excludeRewards?'Base APY only':'Current reported APY'}</option><option value="mean" ${state.rateMode==='mean'?'selected':''} ${meanOk?'':'disabled'}>30-day mean APY${meanOk?` (${pct(state.selected.mean30d)})`:' — unavailable'}</option></select></label><label for="rate-haircut">Assume the target rate falls by<span class="standard-input"><input id="rate-haircut" type="number" min="0" max="100" step="5" value="${state.rateHaircut}"><span>%</span></span></label></div>`;
}

function comparePage() {
  const s=state.selected;
  return `<section class="page-intro"><div><div class="eyebrow"><span></span> THE YIELD REALITY CHECK</div><h1 tabindex="-1">Is the higher APY<br>worth the <em>move?</em></h1><p>A bigger percentage is only half the story.<br class="desktop-br"> Find out what switching actually adds to your balance.</p></div><div class="intro-note"><span class="note-doodle">↗</span><p>Small fees.<br>Big difference.</p><span class="note-line"></span></div></section>
    <div class="scenario-strip"><div>${icon('info')}<span>${s.example?'You’re exploring an illustrative scenario. Try real USDC markets or enter your own target rate.':`USDC comparison · ${esc(sourceLabel())}${s.manual?'':' · rates can change after retrieval.'}`}</span></div><button data-view="markets">Explore markets ${icon('arrow-right')}</button></div>
    ${scenarioToolbar()}
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
      <label class="field-label exact-days" for="custom-days">Exact number of days</label><div class="standard-input"><input id="custom-days" type="number" min="1" max="3650" step="1" value="${state.inputs.days}"><span>days</span></div>
      <div class="input-separator"></div>
      <label class="field-label" for="cost">All-in switching cost ${icon('arrow-left-right')}</label><div class="standard-input"><span>$</span><input id="cost" type="number" min="0" step="any" ${state.fees?'readonly aria-readonly="true"':''} value="${state.inputs.cost}" inputmode="decimal"></div>
      <p class="field-note">${state.fees?'Total of the itemized costs below.':'Your estimate for withdrawal, gas, bridging, entry fees and slippage. Deducted upfront.'}</p>
      ${feeFields()}<div class="mini-callout">${icon('leaf')}<span>Your funds stay where they are.<br>This is a comparison, not a transaction.</span></div>
    </aside><section class="comparison-column">
      <div class="target-panel"><div class="target-heading"><span class="section-label">THE POTENTIAL MOVE</span><button class="text-button" data-view="markets">Change pool ${icon('arrow-up-right')}</button></div><div class="target-row"><span class="protocol-icon">${icon(s.manual?'pencil':'layers')}</span><div class="target-name"><h2>${esc(s.manual?'Your target rate':prettyProject(s.project))}</h2><p><span class="token-dot">$</span> USDC <span class="small-dot">·</span> ${esc(s.chain)} ${s.example?'<span class="example-tag">EXAMPLE</span>':s.manual?'<span class="example-tag">MANUAL</span>':s.snapshot?'<span class="example-tag">SNAPSHOT</span>':''}</p></div><div class="target-apy"><strong id="target-apy">${pct(s.apy)}</strong><span>${s.manual?'your target APY':s.snapshot?'saved effective APY':'reported APY'}</span></div></div>
      ${poolDetails()}
      <div class="target-bottom"><div id="rate-breakdown"><span class="legend-dot base"></span>Base ${s.base==null?'unknown':pct(s.base)} <span class="legend-dot reward"></span>Rewards ${s.reward==null?'unknown':pct(s.reward)}</div><label class="toggle"><input id="exclude-rewards" type="checkbox" ${state.excludeRewards?'checked':''} ${s.base==null?'disabled':''}><span class="toggle-track"></span>Exclude rewards</label></div>${rateControls()}</div>
      <div id="results">${resultsMarkup()}</div><div id="result-announcement" class="sr-only" aria-live="polite" aria-atomic="true"></div>
<<<<<<< Updated upstream
    </section></div>`;
=======
    </section></div>
    <div class="bottom-note"><span class="pill-icon">${icon('file-clock')}</span><div><h3>Good decisions deserve a timestamp.</h3><p>Save your inputs and rates as a wallet-owned receipt on Arkiv, or export them as a file without a wallet.</p></div><button id="save-bottom" class="outline-button">Save comparison ${icon('bookmark')}</button></div>`;
>>>>>>> Stashed changes
}

function verdictCopy(advantage) {
  const verdict=outcome(advantage);
  return {verdict, caption:verdict==='tie'?'The two options are effectively even.':verdict==='move'?'Switching comes out ahead.':'Staying comes out ahead.', unit:verdict==='tie'?'difference':verdict==='move'?'extra after costs':'more by staying'};
}
function breakEvenLabel(value) { return value===null?'Never':value>3650?'10+ years':value===0?'Immediate':`${Math.ceil(value)} days`; }
function sensitivityMarkup() {
  const rows=[0,25,50].map(cut=>{
    const rate=effectiveRate(state.selected,state.excludeRewards,state.rateMode,cut), r=compare({...state.inputs,targetApy:rate}), v=verdictCopy(r.advantage);
    return `<tr class="${cut===state.rateHaircut?'current':''}"><td>${cut===0?'Rate holds':`Falls ${cut}%`}</td><td>${pct(rate)}</td><td class="${v.verdict}">${v.verdict==='tie'?'Even':`${v.verdict==='move'?'Move':'Stay'} +${money(Math.abs(r.advantage))}`}</td><td>${breakEvenLabel(r.breakEven)}</td></tr>`;
  });
  if(state.selected.reward>0&&!state.excludeRewards&&state.selected.base!=null){
    const r=compare({...state.inputs,targetApy:effectiveRate(state.selected,true,'reported',state.rateHaircut)}),v=verdictCopy(r.advantage);
    rows.push(`<tr><td>Rewards end</td><td>${pct(effectiveRate(state.selected,true,'reported',state.rateHaircut))}</td><td class="${v.verdict}">${v.verdict==='tie'?'Even':`${v.verdict==='move'?'Move':'Stay'} +${money(Math.abs(r.advantage))}`}</td><td>${breakEvenLabel(r.breakEven)}</td></tr>`);
  }
  return `<div class="sensitivity-panel"><div class="chart-heading"><div><h3>What if the rate changes?</h3><p>Same inputs, lower target rates over ${state.inputs.days} days</p></div></div><table class="sensitivity-table"><thead><tr><th>Scenario</th><th>Target APY</th><th>Result</th><th>Break-even</th></tr></thead><tbody>${rows.join('')}</tbody></table></div>`;
}
function resultsMarkup() {
  let result; try { result=compare(inputs()); } catch(error) { return `<div class="validation-error" role="alert">${icon('info')}${esc(error.message)}</div>`; }
  const {verdict,caption,unit}=verdictCopy(result.advantage),wins=verdict==='move',tie=verdict==='tie';
  return `<div class="verdict-panel ${wins?'move-wins':'stay-wins'}"><div class="verdict-top"><span>${icon(wins?'trending-up':'leaf')}${tie?'A CLOSE CALL':wins?'THE MOVE ADDS UP':'PATIENCE PAYS'}</span><span class="horizon-tag">OVER ${state.inputs.days} DAYS</span></div><div class="verdict-main"><div><h2>${caption}</h2><p><strong>${money(Math.abs(result.advantage))}</strong><span>${unit}</span></p></div><div class="verdict-art" aria-hidden="true"><span class="art-circle"></span><span class="art-arrow">${wins?'↗':'↔'}</span></div></div><div class="verdict-bottom"><span>At the assumed rates below. Before taxes and changes in risk.</span><button id="save-result">${icon('bookmark')} Save receipt</button></div></div>
    <div class="metric-grid"><div><span>Stay where you are ${icon('info')}</span><strong>${money(result.stay)}</strong><small>projected earnings</small></div><div><span>Make the move ${icon('arrow-up-right')}</span><strong>${money(result.move)}</strong><small>projected earnings after costs</small></div><div><span>Break-even ${icon('clock-3')}</span><strong>${result.breakEven===null?'Never':result.breakEven>3650?'10+ years':result.breakEven===0?'Immediate':`${Math.ceil(result.breakEven)} <em>days</em>`}</strong><small>${result.breakEven===null?'at these assumed rates':'until moving catches up'}</small></div></div>
    <div class="chart-panel"><div class="chart-heading"><div><h3>Let time tell the story</h3><p>Projected earnings, after switching costs</p></div><div class="chart-legend"><span><i class="stay-line"></i>Stay</span><span><i class="move-line"></i>Move</span></div></div>${chartMarkup(result)}<div class="chart-footnote">${icon('info')}Effective target ${pct(targetApy())}${state.rateMode==='mean'?' (30-day mean)':''}${state.rateHaircut?`, after a ${state.rateHaircut}% assumed decline`:''}. ${state.excludeRewards?'Reward incentives excluded.':'Reward incentives included when reported.'} USDC assumed to hold $1.</div></div>
    ${sensitivityMarkup()}`;
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
    ${state.dataError?`<div class="error-banner" role="alert">${icon('info')}${esc(state.dataError)} You can still explore the labeled examples or enter your own target rate.</div>`:''}
    <div class="market-toolbar"><div class="search-field">${icon('search')}<input id="market-search" type="search" placeholder="Search a protocol, network or pool" value="${esc(state.search)}" aria-label="Search markets"></div><div class="market-selects"><label class="network-select">Network<select id="chain-filter"><option>All networks</option>${chains.map(c=>`<option ${state.chain===c?'selected':''}>${esc(c)}</option>`).join('')}</select>${icon('chevron-down')}</label><label class="network-select">Sort<select id="market-sort">${[['tvl','Largest TVL'],['apy','Highest APY'],['base','Highest base APY'],['name','Protocol A–Z']].map(([v,label])=>`<option value="${v}" ${state.sort===v?'selected':''}>${label}</option>`).join('')}</select>${icon('chevron-down')}</label></div></div>
    <div id="market-list">${marketListMarkup()}</div>
    <div class="example-section"><div class="section-heading"><h2>A few ways to test the math</h2><span>ILLUSTRATIVE SCENARIOS</span></div><div class="example-grid">${examples.map((p,i)=>`<button class="example-card" data-example="${p.id}"><span class="example-number">0${i+1}</span><h3>${esc(p.project)}</h3><p>${['A modest bump in base yield.','A mix of base yield and incentives.','A high headline rate. Toggle rewards off.'][i]}</p><div><strong>${pct(p.apy)} <small>APY</small></strong>${icon('arrow-up-right')}</div></button>`).join('')}<button class="example-card" id="manual-card"><span class="example-number">04</span><h3>Your own rate</h3><p>Got a quote from somewhere else? Enter base and reward APY yourself.</p><div><strong>…% <small>APY</small></strong>${icon('pencil')}</div></button></div></div>`;
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

<<<<<<< Updated upstream
function bind() {
  $('.brand').addEventListener('click',e=>{e.preventDefault();navigate('compare');});
  document.querySelectorAll('[data-view]').forEach(el=>el.addEventListener('click',()=>navigate(el.dataset.view)));
=======
function expiryLabel(r) {
  if(r.estimatedExpiresAt==null)return `Expires at block ${r.expiresAtBlock}`;
  const left=r.estimatedExpiresAt-Date.now();
  if(left<=0)return 'Expiring now…';
  const m=Math.ceil(left/60000);
  return m<60?`~${m}m left`:m<1440?`~${Math.floor(m/60)}h ${m%60}m left`:`~${Math.floor(m/1440)}d ${Math.floor(m%1440/60)}h left`;
}
function receiptsPage() {
  const active=state.receipts;
  return `<section class="page-intro compact-intro"><div><div class="eyebrow"><span></span> WALLET-OWNED. TIME-BOUND.</div><h1 tabindex="-1">A receipt for your <em>reasoning.</em></h1><p>Your inputs, rates and assumptions. Saved on Arkiv, until their time is up.</p></div><button class="outline-button" id="refresh-receipts" ${!state.wallet||state.receiptsLoading||state.busy?'disabled':''}>${icon('refresh-cw',state.receiptsLoading?'spin':'')}Refresh receipts</button></section>
    <div class="receipt-explainer"><span class="receipt-explainer-icon">${icon('file-clock')}</span><div><h3>Financial assumptions shouldn’t live forever.</h3><p>Receipts last 2 minutes to 7 days and leave Arkiv’s query results when the network expires them. Countdowns are estimates from block timing; the chain decides. Receipts are public, signed records of your scenario—not verified market quotes. Expiry does not erase historical blockchain data.</p></div><span class="network-badge"><i></i> Arkiv Rabdi</span></div>
    ${state.receiptError?`<div class="error-banner" role="alert">${icon('info')}${esc(state.receiptError)}</div>`:''}
    ${state.lastSaved&&state.lastSaved.owner===state.wallet?`<div class="receipt-evidence"><div>${icon('check')}<strong>Confirmed on Arkiv</strong></div><p>Entity <code>${esc(state.lastSaved.entityKey)}</code> · expires at block ${esc(state.lastSaved.expiresAtBlock)} · <a href="${explorer}/tx/${esc(state.lastSaved.txHash)}" target="_blank" rel="noopener noreferrer">transaction ${esc(shortAddress(state.lastSaved.txHash))} ${icon('external-link')}</a></p>${state.lastSaved.readBack?'':'<p class="muted-note">Waiting for the receipt to appear in query results…</p>'}<button class="outline-button" id="export-confirmed">${icon('download')}Download receipt + transaction evidence</button></div>`:''}
    ${!state.wallet?`<div class="receipts-empty"><div class="empty-symbol">${icon('wallet')}</div><h2>Your comparisons, in your hands.</h2><p>Connect a wallet to save and read receipts.<br>The calculator, drafts and JSON export work without one.</p><button class="primary-button" id="connect-receipts">${icon('wallet')}Connect wallet</button><a href="https://hub.arkiv.network/faucet" target="_blank" rel="noopener noreferrer">Get test tGLM for saving ${icon('arrow-up-right')}</a></div>`:state.receiptsLoading&&!active.length?`<div class="receipts-empty">${icon('loader-circle','spin')}<h3>Reading your receipts from Arkiv…</h3></div>`:!active.length?`<div class="receipts-empty"><div class="empty-symbol">${icon('file-clock')}</div><h2>A clean slate.</h2><p>${state.receiptError?'The network could not be reached. Retry to check your receipts.':'No active receipts found for this wallet. Save a comparison to create one.'}</p><button class="primary-button" data-view="compare">Make a comparison ${icon('arrow-right')}</button></div>`:`<div class="receipt-grid">${active.map(receiptMarkup).join('')}</div><p class="table-note">Read directly from Arkiv for ${esc(state.wallet)} · Last queried ${esc(new Date(state.receiptsLoadedAt).toLocaleTimeString())}</p>`}
    ${state.wallet&&state.receiptsMore?`<button class="outline-button full" id="more-receipts" ${state.receiptsLoading?'disabled':''}>${state.receiptsLoading?'Reading…':'Load more receipts'}</button>`:''}${state.receiptsSkipped?`<p class="table-note">${state.receiptsSkipped} receipt(s) failed validation and were skipped.</p>`:''}
    ${state.lastTx&&!state.lastSaved?`<div class="transaction-note">${icon('check')}Last confirmed transaction <a href="${explorer}/tx/${esc(state.lastTx)}" target="_blank" rel="noopener noreferrer">${shortAddress(state.lastTx)} ${icon('external-link')}</a></div>`:''}`;
}
function receiptMarkup(r) {
  const result=compare(r.inputs),{verdict}=verdictCopy(result.advantage);
  return `<article class="receipt-card"><div class="receipt-top"><span>${r.source.type==='example'?'EXAMPLE SCENARIO':r.source.type==='manual'?'MANUAL SCENARIO':'REPORTED RATES'}</span><span>${icon('clock-3')}<span data-countdown="${esc(r.key)}">${esc(expiryLabel(r))}</span></span></div><h3>${esc(r.name)}</h3><p>${money(r.inputs.amount)} · ${r.inputs.days} days · ${money(r.inputs.cost)} costs</p><div class="receipt-number">${money(Math.abs(result.advantage))}<span>${verdict==='tie'?'difference · effectively even':verdict==='move'?'more by moving':'more by staying'}</span></div><div class="receipt-rates">${pct(r.inputs.currentApy)} ${icon('arrow-right')} ${pct(r.inputs.targetApy)}${r.pool?.reward>0&&!r.excludeRewards?` <span class="muted">incl. ${pct(r.pool.reward)} rewards</span>`:''}</div><div class="receipt-actions"><button data-restore="${esc(r.key)}">Reopen ${icon('arrow-up-right')}</button><button data-export="${esc(r.key)}" aria-label="Download receipt">${icon('download')}</button><button data-copy="${esc(r.key)}" aria-label="Copy entity key">${icon('copy')}</button><button data-delete="${esc(r.key)}" aria-label="Delete receipt" ${state.busy?'disabled':''}>${icon('trash-2')}</button></div></article>`;
}

function bind() {
  $('.brand').addEventListener('click',e=>{e.preventDefault();navigate('compare');});
  document.querySelectorAll('[data-view]').forEach(el=>el.addEventListener('click',()=>navigate(el.dataset.view)));
  $('#connect')?.addEventListener('click',e=>connect(e.currentTarget));
  $('#connect-receipts')?.addEventListener('click',e=>connect(e.currentTarget));
>>>>>>> Stashed changes
  $('#methodology')?.addEventListener('click',e=>openModal('methodology',e.currentTarget));
  for(const [id,key] of [['amount','amount'],['current-apy','currentApy'],['cost','cost'],['days','days'],['custom-days','days']]) {
    $(`#${id}`)?.addEventListener('input',event=>{
      state.inputs[key]=event.target.value===''?NaN:Number(event.target.value);
      if(key==='days'){$('#days-label').textContent=`${state.inputs.days} days`;if(id==='days')$('#custom-days').value=state.inputs.days;else if(Number.isFinite(state.inputs.days))$('#days').value=state.inputs.days;}
      document.querySelectorAll('[data-amount]').forEach(e=>e.classList.toggle('selected',Number(e.dataset.amount)===state.inputs.amount));
      document.querySelectorAll('[data-days]').forEach(e=>e.classList.toggle('selected',Number(e.dataset.days)===state.inputs.days));
      updateResults();
    });
  }
  document.querySelectorAll('[data-amount]').forEach(el=>el.addEventListener('click',()=>{state.inputs.amount=Number(el.dataset.amount);render();persist();}));
  document.querySelectorAll('[data-days]').forEach(el=>el.addEventListener('click',()=>{state.inputs.days=Number(el.dataset.days);render();persist();}));
  $('#exclude-rewards')?.addEventListener('change',e=>{state.excludeRewards=e.target.checked;if(state.excludeRewards)state.rateMode='reported';render();persist();});
<<<<<<< Updated upstream
=======
  $('#save-bottom')?.addEventListener('click',e=>openSave(e.currentTarget));
  bindResults();
>>>>>>> Stashed changes
  $('#load-markets')?.addEventListener('click',loadMarkets);
  $('#market-search')?.addEventListener('input',e=>{state.search=e.target.value;state.marketPage=0;refreshMarketList();});
  $('#chain-filter')?.addEventListener('change',e=>{state.chain=e.target.value;state.marketPage=0;refreshMarketList();});
  $('#market-sort')?.addEventListener('change',e=>{state.sort=e.target.value;state.marketPage=0;refreshMarketList();});
  bindMarkets();
  document.querySelectorAll('[data-example]').forEach(el=>el.addEventListener('click',()=>selectPool(examples.find(p=>p.id===el.dataset.example))));
  $('#manual-card')?.addEventListener('click',()=>selectPool(manualPool(state.selected.base??state.selected.apy,state.selected.reward??0)));
<<<<<<< Updated upstream
=======
  $('#refresh-receipts')?.addEventListener('click',()=>loadReceipts());
  $('#more-receipts')?.addEventListener('click',()=>loadReceipts({append:true}));
  $('#export-confirmed')?.addEventListener('click',()=>downloadJSON(state.lastSaved,`thehro-evidence-${state.lastSaved.entityKey.slice(2,10)}.json`));
  document.querySelectorAll('[data-restore]').forEach(el=>el.addEventListener('click',()=>restoreReceipt(el.dataset.restore)));
  document.querySelectorAll('[data-export]').forEach(el=>el.addEventListener('click',()=>{const r=state.receipts.find(r=>r.key===el.dataset.export);if(r)downloadJSON(r,`thehro-receipt-${r.key.slice(2,10)}.json`);}));
  document.querySelectorAll('[data-copy]').forEach(el=>el.addEventListener('click',()=>copyText(el.dataset.copy,'Entity key copied.')));
  document.querySelectorAll('[data-delete]').forEach(el=>el.addEventListener('click',()=>deleteSaved(el.dataset.delete)));
>>>>>>> Stashed changes
  bindScenarioControls();
}
function bindScenarioControls() {
  $('#manual-target')?.addEventListener('click',()=>{if(state.selected.manual)return;selectPool(manualPool(state.selected.base??state.selected.apy,state.selected.reward??0),{focus:'#manual-base'});});
  $('#share-link')?.addEventListener('click',shareLink);
  $('#export-scenario')?.addEventListener('click',()=>{try{const s=buildScenario();downloadJSON(s,'thehro-scenario.json');notify('Scenario exported. Import it later or share the file.');}catch(e){notify(e.message,'error');}});
  $('#import-scenario')?.addEventListener('click',e=>{state.importError='';openModal('import',e.currentTarget);});
  $('#reset-scenario')?.addEventListener('click',()=>{Object.assign(state,{inputs:{...DEFAULT_INPUTS},selected:examples[1],excludeRewards:false,rateMode:'reported',rateHaircut:0,fees:null,restoredSource:null,selectedFetchedAt:null});clearShareHash();render({focus:'#reset-scenario'});persist();notify('Scenario reset to the example.');});
  $('#remember')?.addEventListener('change',e=>{state.remember=e.target.checked;if(state.remember){persist();notify('Inputs will be kept in this browser only.');}else{clearTimeout(persistTimer);clearDraft(localStorage);notify('Saved draft cleared from this browser.');}});
  $('#itemize-fees')?.addEventListener('click',()=>{const total=Number.isFinite(state.inputs.cost)?state.inputs.cost:0;state.fees={withdrawal:0,gas:total,bridge:0,entry:0,slippage:0};state.inputs.cost=total;render({focus:'#fee-withdrawal'});persist();});
  $('#clear-fees')?.addEventListener('click',()=>{state.fees=null;render({focus:'#cost'});persist();});
  document.querySelectorAll('[data-fee]').forEach(el=>el.addEventListener('input',()=>{
    const v=el.value===''?0:Number(el.value);state.fees[el.dataset.fee]=Number.isFinite(v)&&v>=0?v:0;
    state.inputs.cost=FEE_KEYS.reduce((n,k)=>n+state.fees[k],0);
    $('#cost').value=state.inputs.cost;updateResults();
  }));
  for(const id of ['manual-base','manual-reward'])$(`#${id}`)?.addEventListener('input',()=>{
    const base=Number($('#manual-base').value),reward=Number($('#manual-reward').value);
    if(!Number.isFinite(base)||!Number.isFinite(reward)||base<0||reward<0||base+reward>1000)return;
    state.selected=manualPool(base,reward);
    $('#target-apy').textContent=pct(state.selected.apy);
    $('#rate-breakdown').innerHTML=`<span class="legend-dot base"></span>Base ${pct(base)} <span class="legend-dot reward"></span>Rewards ${pct(reward)}`;
    updateResults();
  });
  $('#rate-mode')?.addEventListener('change',e=>{state.rateMode=e.target.value;updateResults();persist();});
  $('#rate-haircut')?.addEventListener('input',e=>{const v=Number(e.target.value);if(e.target.value===''||!Number.isFinite(v)||v<0||v>100)return;state.rateHaircut=v;updateResults();});
}
function bindMarkets() {
  document.querySelectorAll('[data-pool]').forEach(el=>el.addEventListener('click',()=>selectPool(state.pools.find(p=>p.id===el.dataset.pool))));
  document.querySelectorAll('[data-market-page]').forEach(el=>el.addEventListener('click',()=>{state.marketPage=Number(el.dataset.marketPage);refreshMarketList();$('#market-list')?.scrollIntoView({block:'start',behavior:'smooth'});}));
}
function refreshMarketList() { const node=$('#market-list');if(!node)return;node.innerHTML=marketListMarkup();decorate();bindMarkets(); }
<<<<<<< Updated upstream
function updateResults() {
  if(!$('#results'))return;
  $('#results').innerHTML=resultsMarkup();decorate();persist();
=======
function bindResults() { $('#save-result')?.addEventListener('click',e=>openSave(e.currentTarget)); }
function updateResults() {
  if(!$('#results'))return;
  $('#results').innerHTML=resultsMarkup();decorate();bindResults();persist();
>>>>>>> Stashed changes
  clearTimeout(announceTimer);
  announceTimer=setTimeout(()=>{const node=$('#result-announcement');if(!node)return;try{const r=compare(inputs()),v=verdictCopy(r.advantage);node.textContent=`${v.caption} ${money(Math.abs(r.advantage))} ${v.unit} over ${state.inputs.days} days.`;}catch(e){node.textContent=e.message;}},900);
}
function selectPool(pool,{focus}={}) {
  if(!pool)return;
  state.selected=pool;state.selectedFetchedAt=pool.example||pool.manual?null:state.fetchedAt;state.restoredSource=null;state.excludeRewards=false;state.rateMode='reported';state.view='compare';
  clearShareHash();render({focus:focus??'h1'});persist();window.scrollTo({top:0,behavior:'smooth'});
}
function navigate(view) {
<<<<<<< Updated upstream
  state.view=view;render({focus:'h1'});window.scrollTo({top:0,behavior:'smooth'});
=======
  state.view=view;render({focus:'h1'});if(view==='receipts'&&state.wallet)loadReceipts();window.scrollTo({top:0,behavior:'smooth'});
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
function openModal(name,opener) {
  modalOpener=opener?.id?`#${CSS.escape(opener.id)}`:opener??null;
  state.modal=name;renderModal();
}
function closeModal() {
  if(!state.modal)return;
  state.modal=null;$('#modal-root').innerHTML='';document.body.classList.remove('modal-open');
=======
function setWallet(address,provider) {
  providerCleanup();providerCleanup=()=>{};
  Object.assign(state,{wallet:address,provider:address?provider:null,receipts:[],receiptError:'',receiptsLoading:false,receiptOffset:0,receiptsMore:false,receiptsSkipped:0,lastTx:null,lastSaved:null});
  ++readEpoch;
  if(address&&provider?.on){
    const onAccounts=accounts=>{const next=accounts?.[0]??null;if(next?.toLowerCase()===state.wallet?.toLowerCase())return;if(state.modal&&!state.busy)closeModal();setWallet(next,provider);render();if(next)notify('Wallet account changed. Showing receipts for the new account.');if(next&&state.view==='receipts')loadReceipts();};
    provider.on('accountsChanged',onAccounts);
    providerCleanup=()=>provider.removeListener?.('accountsChanged',onAccounts);
  }
}
async function connectWith(provider) {
  const epoch=++connectionEpoch;
  state.connecting=true;render();
  clearTimeout(pendingHint);
  pendingHint=setTimeout(()=>{if(epoch===connectionEpoch&&state.connecting)notify('Waiting for your wallet. Open or unlock it to approve the connection, or click the wallet button to cancel.');},4000);
  try{
    const address=await connectWallet(provider);
    if(epoch!==connectionEpoch)return null;
    setWallet(address,provider);notify('Wallet connected. Only Arkiv testnet writes require a transaction.');
    return address;
  }catch(error){if(epoch===connectionEpoch)notify(friendlyError(error),'error');return null;}
  finally{if(epoch===connectionEpoch){clearTimeout(pendingHint);state.connecting=false;render();if(state.wallet&&state.view==='receipts')loadReceipts();}}
}
async function connect(opener) {
  if(state.connecting){++connectionEpoch;clearTimeout(pendingHint);state.connecting=false;render();notify('Connection request cancelled here. Dismiss any pending prompt in your wallet.');return null;}
  if(state.wallet){openModal('wallet',opener);return state.wallet;}
  const wallets=walletDiscovery.list();
  if(!wallets.length){openModal('no-wallet',opener);return null;}
  if(wallets.length>1){openModal('wallet-picker',opener);return null;}
  return connectWith(wallets[0].provider);
}
async function loadReceipts({append=false}={}) {
  if(!state.wallet)return;const address=state.wallet,epoch=++readEpoch;
  state.receiptsLoading=true;state.receiptError='';render();
  try{
    const page=await readReceiptPage(address,{offset:append?state.receiptOffset:0,limit:RECEIPT_PAGE});
    if(epoch!==readEpoch||state.wallet!==address)return;
    state.receipts=append?[...state.receipts,...page.receipts.filter(r=>!state.receipts.some(x=>x.key===r.key))]:page.receipts;
    state.receiptOffset=page.nextOffset;state.receiptsMore=page.hasMore;state.receiptsSkipped=(append?state.receiptsSkipped:0)+page.skipped;state.receiptsLoadedAt=Date.now();
    if(state.lastSaved&&state.receipts.some(r=>r.key===state.lastSaved.entityKey))state.lastSaved.readBack=true;
  }
  catch(error){if(epoch===readEpoch){state.receiptError=friendlyError(error);if(!append)state.receipts=[];}}
  finally{if(epoch===readEpoch){state.receiptsLoading=false;render();}}
}
async function readBackSaved(entityKey) {
  for(const delay of [0,3000,6000,12000]){
    if(delay)await new Promise(r=>setTimeout(r,delay));
    if(state.lastSaved?.entityKey!==entityKey)return;
    await loadReceipts();
    if(state.lastSaved?.readBack){notify('Receipt read back from Arkiv.');return;}
  }
  if(state.lastSaved?.entityKey===entityKey)notify('The receipt is confirmed but not yet visible in query results. Refresh in a moment.','error');
}
function openSave(opener) {
  try{compare(inputs());}catch(e){notify(e.message,'error');return;}
  state.saveDraft={name:defaultName(),minutes:state.saveDraft.minutes||30};state.saveError='';
  openModal('save',opener);
}
function friendlyError(error) {
  const message=`${error?.shortMessage??''} ${error?.message??''}`;
  if(error?.code===4001||/rejected|denied|cancel/i.test(message))return 'Request cancelled in your wallet. Nothing was saved.';
  if(error?.code===-32002||/already pending/i.test(message))return 'Your wallet already has a pending request. Open your wallet to finish or reject it.';
  if(/insufficient funds/i.test(message))return 'Your wallet needs test tGLM on Arkiv Rabdi. Use the faucet link and try again.';
  if(/429|rate limit/i.test(message))return 'Arkiv is rate limiting requests. Wait a minute and try again.';
  if(/timeout|timed out/i.test(message))return 'Arkiv took too long to respond. Check your connection and try again.';
  return (error?.shortMessage||error?.message||'Something went wrong. Please try again.').slice(0,260);
}

function openModal(name,opener) {
  modalOpener=opener?.id?`#${CSS.escape(opener.id)}`:opener??null;
  ++modalEpoch;state.modal=name;renderModal();
}
function closeModal() {
  if(state.busy||!state.modal)return;
  ++modalEpoch;state.modal=null;$('#modal-root').innerHTML='';document.body.classList.remove('modal-open');
>>>>>>> Stashed changes
  const target=typeof modalOpener==='string'?$(modalOpener):modalOpener?.isConnected?modalOpener:null;
  (target??$('h1'))?.focus({preventScroll:true});modalOpener=null;
}
function modalContent() {
<<<<<<< Updated upstream
  switch(state.modal){
    case 'methodology': return `<span class="modal-kicker">TRANSPARENT BY DESIGN</span><h2 id="modal-title">The math, without the magic.</h2><p>APY is an effective annual rate. For a holding period of <b>d</b> days:</p><div class="formula">Stay = P × (1 + current APY)<sup>d/365</sup><br>Move = (P − cost) × (1 + target APY)<sup>d/365</sup><br>Extra gain = Move − Stay</div><p>Rates are converted from percentages. Break-even is when those two balances match. A lower or equal rate never recovers a positive switching cost.</p><ul class="assumption-list"><li>All switching costs are user-entered estimates, paid upfront. Itemized costs are summed.</li><li>Rates stay at the chosen basis (reported, 30-day mean, or your own) minus any assumed decline. The “What if” table re-runs the math at lower rates.</li><li>Reward APY is treated as equally reinvestable. Excluding rewards uses the base APY; base yield may also contain subsidies.</li><li>Taxes, lockups, liquidity limits, smart-contract risk and depegs are not modeled.</li><li>DeFiLlama retrieval time is not an onchain quote or a pool observation timestamp.</li></ul><p class="small-print">This is a scenario calculator, not a deposit recommendation.</p>`;
    case 'import': return `<span class="modal-kicker">BRING A SCENARIO BACK</span><h2 id="modal-title">Import a comparison.</h2><p>Choose a Thehro JSON file exported earlier, or paste its contents. Everything is validated before it is used.</p><label class="field-label" for="import-file">JSON file</label><input class="modal-input" id="import-file" type="file" accept="application/json,.json"><label class="field-label" for="import-text">Or paste JSON</label><textarea class="modal-input" id="import-text" rows="6" spellcheck="false"></textarea><button id="import-submit" class="primary-button full">${icon('upload')}Import scenario</button><p id="import-error" class="inline-error" role="alert">${esc(state.importError)}</p>`;
=======
  const here=encodeURIComponent(location.href);
  switch(state.modal){
    case 'methodology': return `<span class="modal-kicker">TRANSPARENT BY DESIGN</span><h2 id="modal-title">The math, without the magic.</h2><p>APY is an effective annual rate. For a holding period of <b>d</b> days:</p><div class="formula">Stay = P × (1 + current APY)<sup>d/365</sup><br>Move = (P − cost) × (1 + target APY)<sup>d/365</sup><br>Extra gain = Move − Stay</div><p>Rates are converted from percentages. Break-even is when those two balances match. A lower or equal rate never recovers a positive switching cost.</p><ul class="assumption-list"><li>All switching costs are user-entered estimates, paid upfront. Itemized costs are summed.</li><li>Rates stay at the chosen basis (reported, 30-day mean, or your own) minus any assumed decline. The “What if” table re-runs the math at lower rates.</li><li>Reward APY is treated as equally reinvestable. Excluding rewards uses the base APY; base yield may also contain subsidies.</li><li>Taxes, lockups, liquidity limits, smart-contract risk and depegs are not modeled.</li><li>DeFiLlama retrieval time is not an onchain quote or a pool observation timestamp.</li></ul><p class="small-print">This is a scenario calculator, not a deposit recommendation. Saved receipts preserve assumptions, not guarantees.</p>`;
    case 'wallet': return `<span class="modal-kicker">CONNECTED WALLET</span><h2 id="modal-title">Your wallet. Your receipts.</h2><p class="address-text">${esc(state.wallet)}</p><p>Writes use test tGLM on Arkiv Rabdi. Your private keys stay in your wallet.</p><a class="primary-button full" href="https://hub.arkiv.network/faucet" target="_blank" rel="noopener noreferrer">Open testnet faucet ${icon('external-link')}</a><button id="disconnect" class="outline-button full">Disconnect from Thehro</button>`;
    case 'wallet-picker': return `<span class="modal-kicker">CHOOSE A WALLET</span><h2 id="modal-title">Which wallet should sign?</h2><p>Several wallets are installed in this browser. Thehro only asks for your address and, when you save, an Arkiv testnet transaction.</p><div class="wallet-list">${walletDiscovery.list().map(w=>`<button class="outline-button full" data-wallet="${esc(w.id)}">${w.icon?`<img src="${esc(w.icon)}" alt="" width="20" height="20">`:icon('wallet')}${esc(w.name)}</button>`).join('')}</div>`;
    case 'no-wallet': return `<span class="modal-kicker">NO WALLET FOUND</span><h2 id="modal-title">${isMobile()?'Open Thehro in your wallet app.':'Install a browser wallet.'}</h2><p>${isMobile()?'Mobile browsers don’t include a wallet. Open this page inside a wallet’s built-in browser to save receipts.':'Saving receipts needs an EVM wallet extension such as MetaMask, Rabby or Coinbase Wallet. The calculator and JSON export work without one.'}</p>${isMobile()?`<div class="wallet-list">${mobileWalletLinks(location).map(l=>`<a class="outline-button full" href="${esc(l.href)}">${icon('smartphone')}Open in ${esc(l.name)}</a>`).join('')}</div>`:`<a class="primary-button full" href="https://ethereum.org/en/wallets/find-wallet/" target="_blank" rel="noopener noreferrer">Find a wallet ${icon('external-link')}</a>`}<button id="copy-page-link" class="outline-button full" data-link="${esc(decodeURIComponent(here))}">${icon('copy')}Copy this page’s link</button>`;
    case 'import': return `<span class="modal-kicker">BRING A SCENARIO BACK</span><h2 id="modal-title">Import a comparison.</h2><p>Choose a Thehro JSON file (a draft export or a downloaded receipt), or paste its contents. Everything is validated before it is used.</p><label class="field-label" for="import-file">JSON file</label><input class="modal-input" id="import-file" type="file" accept="application/json,.json"><label class="field-label" for="import-text">Or paste JSON</label><textarea class="modal-input" id="import-text" rows="6" spellcheck="false"></textarea><button id="import-submit" class="primary-button full">${icon('upload')}Import scenario</button><p id="import-error" class="inline-error" role="alert">${esc(state.importError)}</p>`;
    case 'save': {
      const d=state.saveDraft,busy=state.busy,connecting=state.connecting;
      return `<span class="modal-kicker">AN EXPIRING DECISION RECEIPT</span><h2 id="modal-title">Keep the reasoning.</h2><p>Save this scenario to Arkiv Rabdi. Reopen it from My receipts while it is active.</p><form id="receipt-form"><label class="field-label" for="receipt-name">Name this comparison</label><input class="modal-input" id="receipt-name" maxlength="100" required value="${esc(d.name)}" ${busy?'readonly':''}><label class="field-label" for="receipt-lifetime">Available for</label><select class="modal-input" id="receipt-lifetime" ${busy?'disabled':''}>${LIFETIMES.map(m=>`<option value="${m}" ${d.minutes===m?'selected':''}>${LIFETIME_LABELS[m]}</option>`).join('')}</select><div class="save-summary"><span>Rate source <strong>${esc(sourceLabel())}</strong></span><span>Target <strong>${pct(targetApy())}${state.excludeRewards?' (base only)':''}</strong></span><span>Network <strong>Arkiv Rabdi testnet</strong></span><span>Wallet <strong>${state.wallet?esc(shortAddress(state.wallet)):'Not connected'}</strong></span></div><p class="public-notice">${icon('info')}This publishes your scenario amount, inputs and wallet address. The lifetime starts when the transaction lands, not when you open your wallet. Expiry removes it from queries; it does not erase blockchain history.</p><button class="primary-button full" type="submit" ${busy||connecting?'disabled':''}>${icon(busy||connecting?'loader-circle':state.wallet?'bookmark':'wallet',busy||connecting?'spin':'')}${busy?'Confirm in your wallet, then wait…':connecting?'Waiting for your wallet…':state.wallet?'Save on Arkiv':'Connect wallet to continue'}</button><button type="button" id="save-local" class="outline-button full" ${busy?'disabled':''}>${icon('download')}Download as JSON instead</button><a class="faucet-link" href="https://hub.arkiv.network/faucet" target="_blank" rel="noopener noreferrer">Need test tGLM? Open the faucet ${icon('external-link')}</a><p id="save-error" class="inline-error" role="alert">${esc(state.saveError)}</p></form>`;
    }
>>>>>>> Stashed changes
  }
  return '';
}
function renderModal() {
  if(!state.modal)return;
  const hadFocus=document.activeElement?.closest?.('.modal')?document.activeElement.id:null;
<<<<<<< Updated upstream
  $('#modal-root').innerHTML=`<div class="modal-overlay"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><button class="modal-close icon-button" aria-label="Close dialog">${icon('x')}</button>${modalContent()}</section></div>`;
  document.body.classList.add('modal-open');decorate();
  $('.modal-close').addEventListener('click',closeModal);
  $('.modal-overlay').addEventListener('click',e=>{if(e.target===e.currentTarget)closeModal();});
  $('#import-submit')?.addEventListener('click',importScenario);
  const focusTarget=(hadFocus&&$(`#${CSS.escape(hadFocus)}`))||$('.modal input:not([readonly]), .modal select, .modal textarea, .modal button:not(.modal-close):not([disabled]), .modal a')||$('.modal-close');
  focusTarget?.focus();
=======
  $('#modal-root').innerHTML=`<div class="modal-overlay"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><button class="modal-close icon-button" aria-label="Close dialog" ${state.busy?'disabled':''}>${icon('x')}</button>${modalContent()}</section></div>`;
  document.body.classList.add('modal-open');decorate();
  $('.modal-close').addEventListener('click',closeModal);
  $('.modal-overlay').addEventListener('click',e=>{if(e.target===e.currentTarget)closeModal();});
  $('#disconnect')?.addEventListener('click',()=>{setWallet(null,null);closeModal();render();notify('Disconnected. Your receipts remain on Arkiv until they expire.');});
  $('#receipt-name')?.addEventListener('input',e=>{state.saveDraft.name=e.target.value;});
  $('#receipt-lifetime')?.addEventListener('change',e=>{state.saveDraft.minutes=Number(e.target.value);});
  $('#receipt-form')?.addEventListener('submit',submitReceipt);
  $('#save-local')?.addEventListener('click',()=>{try{downloadJSON(buildScenario(state.saveDraft.name.trim()||defaultName()),'thehro-scenario.json');notify('Scenario downloaded. Import it any time; nothing was published.');}catch(e){state.saveError=e.message;renderModal();}});
  document.querySelectorAll('[data-wallet]').forEach(el=>el.addEventListener('click',()=>{const w=walletDiscovery.list().find(w=>w.id===el.dataset.wallet);closeModal();if(w)connectWith(w.provider);}));
  $('#copy-page-link')?.addEventListener('click',e=>copyText(e.currentTarget.dataset.link,'Link copied. Paste it into your wallet’s browser.'));
  $('#import-submit')?.addEventListener('click',importScenario);
  const focusTarget=(hadFocus&&$(`#${CSS.escape(hadFocus)}`))||$('.modal input:not([readonly]), .modal select, .modal textarea, .modal button:not(.modal-close):not([disabled]), .modal a')||$('.modal-close');
  focusTarget?.focus();
}
async function submitReceipt(event) {
  event.preventDefault();if(state.busy||state.connecting)return;
  const name=state.saveDraft.name.trim(), minutes=state.saveDraft.minutes, token=modalEpoch;
  if(!name){state.saveError='Give this comparison a name.';renderModal();return;}
  state.saveError='';
  if(!state.wallet){
    const wallets=walletDiscovery.list();
    if(wallets.length!==1){closeModal();openModal(wallets.length?'wallet-picker':'no-wallet');return;}
    const connecting=connectWith(wallets[0].provider);renderModal();
    await connecting;
    if(token===modalEpoch&&state.modal==='save')renderModal();
    return;
  }
  let receipt;
  try{receipt=buildScenario(name,minutes);}catch(e){state.saveError=e.message;renderModal();return;}
  const owner=state.wallet,provider=state.provider;
  state.busy=true;renderModal();
  try{
    const result=await saveReceipt(provider,owner,receipt,minutes);
    if(state.wallet!==owner){notify('Receipt confirmed for your previous wallet account.');return;}
    state.lastTx=result.txHash;
    state.lastSaved={owner,entityKey:result.entityKey,txHash:result.txHash,expiresAtBlock:String(result.expiresAt),chainId:chain.id,schema:RECEIPT_SCHEMA,explorerTx:`${explorer}/tx/${result.txHash}`,confirmedAt:Date.now(),receipt,readBack:false};
    state.busy=false;closeModal();state.view='receipts';render({focus:'h1'});
    notify('Receipt confirmed on Arkiv. Reading it back from the network…');
    readBackSaved(result.entityKey);
  }
  catch(error){if(token===modalEpoch&&state.modal==='save'){state.saveError=friendlyError(error);}else notify(friendlyError(error),'error');}
  finally{if(state.busy){state.busy=false;if(state.modal==='save')renderModal();render();}}
}
function restoreReceipt(key) {
  const receipt=state.receipts.find(r=>r.key===key);
  if(!receipt){notify('That receipt is no longer loaded. Refresh your receipts.','error');return;}
  try{applyScenario(receipt);}catch(e){notify(`This receipt could not be reopened: ${e.message}`,'error');return;}
  state.view='compare';render({focus:'h1'});persist();window.scrollTo({top:0,behavior:'smooth'});
  notify(state.selected.snapshot?'Restored the saved rate. This older receipt has no rate breakdown.':'Restored saved assumptions. These are not freshly fetched rates.');
}
async function deleteSaved(key) {
  if(state.busy||!state.wallet)return;
  if(!confirm('Delete this receipt from active Arkiv state? This needs one wallet transaction. Blockchain history is not erased.'))return;
  const owner=state.wallet;state.busy=true;render();
  try{const result=await removeReceipt(state.provider,owner,key);if(state.wallet===owner){state.lastTx=result.txHash;if(state.lastSaved?.entityKey===key)state.lastSaved=null;state.receipts=state.receipts.filter(r=>r.key!==key);notify('Receipt deleted from active Arkiv state.');}}
  catch(error){notify(friendlyError(error),'error');}
  finally{state.busy=false;render();if(state.wallet===owner)loadReceipts();}
>>>>>>> Stashed changes
}

async function importScenario() {
  try{
    const file=$('#import-file')?.files?.[0];
    const text=file?await file.text():$('#import-text').value;
    if(!text.trim())throw new Error('Choose a file or paste scenario JSON.');
    const parsed=JSON.parse(text);
    applyScenario(parseScenario(JSON.stringify(parsed.receipt??parsed)));
    closeModal();state.view='compare';clearShareHash();render({focus:'h1'});persist();notify('Scenario imported.');
  }catch(e){state.importError=e instanceof SyntaxError?'This is not valid JSON.':e.message;renderModal();}
}
async function shareLink() {
  try{
    const url=`${location.origin}${location.pathname}#s=${encodeScenario(buildScenario())}`;
    history.replaceState(null,'',url);
    await copyText(url,'Share link copied. It contains your amounts and rates, but no wallet data.');
  }catch(e){notify(e.message,'error');}
}
function clearShareHash() { if(location.hash.startsWith('#s='))history.replaceState(null,'',location.pathname+location.search); }
async function copyText(text,message) { try{await navigator.clipboard.writeText(text);notify(message);}catch{notify('Clipboard is unavailable in this browser.','error');} }
function downloadJSON(value,filename) {
<<<<<<< Updated upstream
  const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'}));
=======
  const url=URL.createObjectURL(new Blob([JSON.stringify(value,(k,v)=>typeof v==='bigint'?String(v):v,2)],{type:'application/json'}));
>>>>>>> Stashed changes
  const a=document.createElement('a');a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}

document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&state.modal){closeModal();return;}
  if(event.key==='Tab'&&state.modal){const els=[...document.querySelectorAll('.modal button:not([disabled]),.modal input:not([disabled]),.modal select:not([disabled]),.modal textarea,.modal a[href]')];const first=els[0],last=els.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}}
});
<<<<<<< Updated upstream
=======
setInterval(()=>{
  if(state.view!=='receipts'||!state.receipts.length)return;
  for(const r of state.receipts){const node=document.querySelector(`[data-countdown="${CSS.escape(r.key)}"]`);if(node)node.textContent=expiryLabel(r);}
  const due=state.receipts.some(r=>r.estimatedExpiresAt!=null&&r.estimatedExpiresAt<Date.now()-5000);
  if(due&&!state.receiptsLoading&&!state.busy&&Date.now()-lastAutoRefresh>20000){lastAutoRefresh=Date.now();loadReceipts();}
},1000);
>>>>>>> Stashed changes
setInterval(()=>{if(!document.hidden)loadMarkets({manual:false});},MARKET_REFRESH_MS);
document.addEventListener('visibilitychange',()=>{
  if(!document.hidden&&state.fetchedAt&&Date.now()-state.fetchedAt>=MARKET_REFRESH_MS)loadMarkets({manual:false});
});

function boot() {
  const shared=location.hash.startsWith('#s=')?location.hash.slice(3):null;
  if(shared){state.view='compare';try{applyScenario(decodeScenario(shared));setTimeout(()=>notify('Opened a shared scenario. Its rates are a saved snapshot, not live data.'),0);}catch(e){setTimeout(()=>notify(`This share link is invalid: ${e.message}`,'error'),0);}}
  try{const draft=readDraft(localStorage);if(draft){state.remember=true;if(!shared)applyScenario(draft);}}catch{}
  render();
  loadMarkets({manual:false});
}
boot();
