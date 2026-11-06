import { createIcons, ArrowUpRight, ArrowRight, ArrowLeftRight, X, Clock3, Info, Leaf, SlidersHorizontal, TrendingUp, Layers } from 'lucide';
import { compare, chartPoints, outcome } from './math.js';
import { examples } from './data.js';
import './style.css';

const iconSet = { ArrowUpRight, ArrowRight, ArrowLeftRight, X, Clock3, Info, Leaf, SlidersHorizontal, TrendingUp, Layers };
const $ = (selector) => document.querySelector(selector);
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icon = (name, cls='') => `<i data-lucide="${name}" class="${cls}" aria-hidden="true"></i>`;
const money = value => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:2}).format(value);
const compact = value => new Intl.NumberFormat('en-US',{notation:'compact',maximumFractionDigits:1}).format(value);
const pct = value => `${value.toFixed(2)}%`;
const DEFAULT_INPUTS = {amount:5000,currentApy:4.2,days:30,cost:18};

const state = { inputs:{...DEFAULT_INPUTS}, selected:examples[1], excludeRewards:false, modal:null };
let announceTimer, modalOpener=null;
document.body.insertAdjacentHTML('beforeend','<div id="modal-root"></div>');

function decorate() { createIcons({icons:iconSet,attrs:{'stroke-width':1.65}}); }
function targetApy() { return state.excludeRewards&&state.selected.base!=null?state.selected.base:state.selected.apy; }
function inputs() { return {...state.inputs,targetApy:targetApy()}; }

function render({focus}={}) {
  const active=document.activeElement;
  const focusSelector=focus??(active?.id?`#${CSS.escape(active.id)}`:active?.dataset?.amount?`[data-amount="${active.dataset.amount}"]`:active?.dataset?.days?`[data-days="${active.dataset.days}"]`:null);
  $('#app').innerHTML=`
    <header class="header"><div class="header-inner">
      <a class="brand" href="#" aria-label="Thehro home"><span class="brand-icon">${icon('arrow-up-right')}</span>thehro<span class="brand-dot">.</span></a>
    </div></header>
    <main class="shell" id="main">
      ${comparePage()}
      <footer class="footer"><span><span class="footer-mark">✳</span> Built for a little more clarity.</span><div><button id="methodology">How the math works ${icon('arrow-up-right')}</button></div></footer>
    </main>`;
  decorate(); bind();
  if(focusSelector&&!state.modal)$(focusSelector)?.focus({preventScroll:true});
}

function comparePage() {
  const s=state.selected;
  return `<section class="page-intro"><div><div class="eyebrow"><span></span> THE YIELD REALITY CHECK</div><h1 tabindex="-1">Is the higher APY<br>worth the <em>move?</em></h1><p>A bigger percentage is only half the story.<br class="desktop-br"> Find out what switching actually adds to your balance.</p></div><div class="intro-note"><span class="note-doodle">↗</span><p>Small fees.<br>Big difference.</p><span class="note-line"></span></div></section>
    <div class="scenario-strip"><div>${icon('info')}<span>You’re exploring an illustrative scenario. Pick another example below to compare.</span></div></div>
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
      <div class="target-panel"><div class="target-heading"><span class="section-label">THE POTENTIAL MOVE</span></div><div class="target-row"><span class="protocol-icon">${icon('layers')}</span><div class="target-name"><h2>${esc(s.project)}</h2><p><span class="token-dot">$</span> USDC <span class="small-dot">·</span> ${esc(s.chain)} <span class="example-tag">EXAMPLE</span></p></div><div class="target-apy"><strong id="target-apy">${pct(s.apy)}</strong><span>reported APY</span></div></div>
      <div class="target-bottom"><div id="rate-breakdown"><span class="legend-dot base"></span>Base ${pct(s.base)} <span class="legend-dot reward"></span>Rewards ${pct(s.reward)}</div><label class="toggle"><input id="exclude-rewards" type="checkbox" ${state.excludeRewards?'checked':''}><span class="toggle-track"></span>Exclude rewards</label></div></div>
      <div id="results">${resultsMarkup()}</div><div id="result-announcement" class="sr-only" aria-live="polite" aria-atomic="true"></div>
    </section></div>
    <div class="example-section"><div class="section-heading"><h2>A few ways to test the math</h2><span>ILLUSTRATIVE SCENARIOS</span></div><div class="example-grid">${examples.map((p,i)=>`<button class="example-card" data-example="${p.id}"><span class="example-number">0${i+1}</span><h3>${esc(p.project)}</h3><p>${['A modest bump in base yield.','A mix of base yield and incentives.','A high headline rate. Toggle rewards off.'][i]}</p><div><strong>${pct(p.apy)} <small>APY</small></strong>${icon('arrow-up-right')}</div></button>`).join('')}</div></div>`;
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
    <div class="chart-panel"><div class="chart-heading"><div><h3>Let time tell the story</h3><p>Projected earnings, after switching costs</p></div><div class="chart-legend"><span><i class="stay-line"></i>Stay</span><span><i class="move-line"></i>Move</span></div></div>${chartMarkup(result)}<div class="chart-footnote">${icon('info')}Effective target ${pct(targetApy())}. ${state.excludeRewards?'Reward incentives excluded.':'Reward incentives included.'} USDC assumed to hold $1.</div></div>`;
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

function bind() {
  $('.brand').addEventListener('click',e=>{e.preventDefault();window.scrollTo({top:0,behavior:'smooth'});});
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
  document.querySelectorAll('[data-example]').forEach(el=>el.addEventListener('click',()=>{
    state.selected=examples.find(p=>p.id===el.dataset.example);state.excludeRewards=false;
    render({focus:'h1'});window.scrollTo({top:0,behavior:'smooth'});
  }));
}
function updateResults() {
  $('#results').innerHTML=resultsMarkup();decorate();
  clearTimeout(announceTimer);
  announceTimer=setTimeout(()=>{const node=$('#result-announcement');if(!node)return;try{const r=compare(inputs()),v=verdictCopy(r.advantage);node.textContent=`${v.caption} ${money(Math.abs(r.advantage))} ${v.unit} over ${state.inputs.days} days.`;}catch(e){node.textContent=e.message;}},900);
}

function openModal(name,opener) { modalOpener=opener??null;state.modal=name;renderModal(); }
function closeModal() {
  if(!state.modal)return;
  state.modal=null;$('#modal-root').innerHTML='';document.body.classList.remove('modal-open');
  (modalOpener?.isConnected?modalOpener:$('h1'))?.focus({preventScroll:true});modalOpener=null;
}
function renderModal() {
  $('#modal-root').innerHTML=`<div class="modal-overlay"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><button class="modal-close icon-button" aria-label="Close dialog">${icon('x')}</button>
    <span class="modal-kicker">TRANSPARENT BY DESIGN</span><h2 id="modal-title">The math, without the magic.</h2><p>APY is an effective annual rate. For a holding period of <b>d</b> days:</p><div class="formula">Stay = P × (1 + current APY)<sup>d/365</sup><br>Move = (P − cost) × (1 + target APY)<sup>d/365</sup><br>Extra gain = Move − Stay</div><p>Rates are converted from percentages. Break-even is when those two balances match. A lower or equal rate never recovers a positive switching cost.</p><ul class="assumption-list"><li>Switching costs are user-entered estimates, paid upfront.</li><li>Rates stay constant over the holding period.</li><li>Reward APY is treated as equally reinvestable. Excluding rewards uses the base APY; base yield may also contain subsidies.</li><li>Taxes, lockups, liquidity limits, smart-contract risk and depegs are not modeled.</li></ul><p class="small-print">This is a scenario calculator, not a deposit recommendation.</p></section></div>`;
  document.body.classList.add('modal-open');decorate();
  $('.modal-close').addEventListener('click',closeModal);
  $('.modal-overlay').addEventListener('click',e=>{if(e.target===e.currentTarget)closeModal();});
  $('.modal-close').focus();
}
document.addEventListener('keydown',event=>{ if(event.key==='Escape'&&state.modal)closeModal(); });

render();
