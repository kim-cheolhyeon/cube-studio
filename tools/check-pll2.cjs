process.chdir(require('node:path').resolve(__dirname,'..'));
const fs=require('fs'),vm=require('vm'),assert=require('assert');let now=0,id=0,reset;const pending=new Map(),rows=[];
const ctx=new Proxy({createRadialGradient:()=>({addColorStop(){}})},{get:(t,k)=>t[k]||(()=>{})});
const make=()=>({dataset:{},children:[],append(...c){this.children.push(...c)},setAttribute(){},addEventListener(k,f){this.click=f}});
const events={};const canvas={getContext:()=>ctx,getBoundingClientRect:()=>({width:1000,height:600}),addEventListener:(k,f)=>events[k]=f,classList:{add(){},remove(){}},setPointerCapture(){},hasPointerCapture:()=>false};const controls={append:r=>rows.push(r)};
const toggle={checked:true,addEventListener(){}};const sandbox={document:{querySelector:s=>s==='#scene'?canvas:s==='#rotations'?controls:s==='#return-toggle'?toggle:{addEventListener:(k,f)=>reset=f},createElement:make},devicePixelRatio:1,ResizeObserver:class{observe(){}},Math,Set,performance:{now:()=>now},requestAnimationFrame:f=>{pending.set(++id,f);return id},cancelAnimationFrame:i=>pending.delete(i)};
vm.createContext(sandbox);vm.runInContext(fs.readFileSync('src/app.js','utf8'),sandbox);const run=s=>vm.runInContext(s,sandbox);
function tick(ms=360){now+=ms;const jobs=[...pending.values()];pending.clear();jobs.forEach(f=>f(now))}
const elements={};const get=s=>elements[s]||(elements[s]={value:'',textContent:'',children:[],classList:{add(){},remove(){}},append(c){this.children.push(c)},replaceChildren(){this.children=[]},addEventListener(k,f){this[k]=f}});
const originalQuery=sandbox.document.querySelector;sandbox.document.querySelector=s=>['#scene','#return-toggle','#rotations','#reset'].includes(s)?originalQuery(s):get(s);
sandbox.document.querySelectorAll=()=>[];
vm.runInContext(fs.readFileSync('src/algorithm.js','utf8'),sandbox);
for(const file of ['data/beginner/cases.bundle.js','data/f2l/cases.bundle.js','data/oll2/cases.bundle.js','data/pll2/cases.bundle.js','data/oll/cases.bundle.js','data/pll/cases.bundle.js','src/cases.js'])vm.runInContext(fs.readFileSync(''+file,'utf8'),sandbox);
function drain(){for(let n=0;pending.size&&n<500;n++)tick(800);assert.equal(pending.size,0)}
run(`const pllPos=s=>s.p.map(v=>Math.max(-1,Math.min(1,Math.round(v))));
const pllTransform=(s,m)=>({...s,p:mv(m,s.p).map(v=>Math.round(v*2)/2||0),n:mv(m,s.n).map(v=>Math.round(v)||0)});
const pllApply=(state,alg)=>{if(!alg.trim())return state;let a=state;for(const t of parseAlgorithm(alg)){const m=moves[t.name],r=rotation(m.axis,m.sign*Math.PI/2*(t.variant==='2'?2:t.variant==="'"?-1:1));a=a.map(s=>selected(s,m.axis,m.layer)?pllTransform(s,r):s)}return a};
const pllInverse=alg=>parseAlgorithm(alg).reverse().map(t=>t.name+(t.variant==='2'?'2':t.variant==="'"?'':"'")).join(' ');
const pllLowKey=state=>state.filter(s=>pllPos(s)[1]<=0||pllPos(s).filter(Boolean).length===1).map(s=>s.color+':'+s.p+':'+s.n).sort().join('|');
const pllCornerKey=state=>state.filter(s=>pllPos(s)[1]>0&&pllPos(s).filter(Boolean).length===3).map(s=>s.color+':'+s.p+':'+s.n).sort().join('|');
const pllFocusKey=state=>state.filter(s=>s.focus).map(s=>s.color+':'+s.p+':'+s.n).sort().join('|');
const pllUp=state=>state.filter(s=>s.n[1]===1&&s.color===colorCodes.Y).length===9;
const pllCornersDone=state=>state.filter(s=>pllPos(s)[1]>0&&pllPos(s).filter(Boolean).length===3).every(s=>s.color===state.find(c=>Math.abs(Math.hypot(...c.p)-1.5)<1e-6&&c.n.every((v,k)=>v===s.n[k])).color);
const pllSolved=state=>definitions.every(f=>new Set(state.filter(s=>s.n.every((v,k)=>v===f.n[k])).map(s=>s.color)).size===1);
const pllMoved=state=>{const centers=state.filter(s=>Math.abs(Math.hypot(...s.p)-1.5)<1e-6),groups=new Map();for(const s of state.filter(s=>s.focus)){const key=pllPos(s).join(',');if(!groups.has(key))groups.set(key,[]);groups.get(key).push(s)}return [...groups.values()].map(piece=>{const from=pllPos(piece[0]),to=[0,0,0];for(const s of piece){const normal=centers.find(c=>c.color===s.color).n;normal.forEach((v,k)=>to[k]+=v)}return from.reduce((sum,v,k)=>sum+Math.abs(v-to[k]),0)}).filter(Boolean)};`);
assert.equal(run('caseLibrary.length'),244);assert.equal(get('#case-tree').children.length,6);assert(get('#case-tree').children.every(c=>c.open===false));
const cases=JSON.parse(run("JSON.stringify(caseLibrary.map((c,i)=>({...c,index:i})).filter(c=>c.collection==='2-look PLL'))"));assert.equal(cases.length,6);
const edgeAlgs=cases.filter(c=>c.id.startsWith('pll2-edge-')).map(c=>c.solutions[0].algorithm);
for(const c of cases){get('#case-select').value=String(c.index);run('chooseCase();loadSelectedCase()');const corner=c.id.startsWith('pll2-corner-');assert.equal(run('stickers.filter(s=>s.focus).length'),corner?12:8);assert.equal(run('stickers.filter(s=>s.protected).length'),corner?38:46);assert(run('pllUp(stickers)'));if(!corner)assert(run('pllCornersDone(stickers)'));
 const distances=JSON.parse(run('JSON.stringify(pllMoved(stickers))'));assert.equal(distances.length,corner?2:c.id.includes('edge-u')?3:4);if(corner)assert(distances.every(n=>n===(c.id.includes('diagonal')?4:2)));
 const initial=run('JSON.stringify(stickers)'),low=run('pllLowKey(stickers)'),corners=run('pllCornerKey(stickers)');
 get('#case-next').click();drain();get('#case-prev').click();drain();assert.equal(run('JSON.stringify(stickers)'),initial);
 get('#case-solve').click();drain();assert(run('casePlayback.index===casePlayback.tokens.length'));assert.equal(run('pllLowKey(stickers)'),low);assert(run('pllUp(stickers)'));assert(run('pllCornersDone(stickers)'));if(!corner){assert(run('pllSolved(stickers)'));assert.equal(run('pllCornerKey(stickers)'),corners)}
 const final=run('JSON.stringify(stickers)');
 if(corner)for(const algorithm of edgeAlgs){sandbox.permutation=algorithm;run(`stickers=JSON.parse(${JSON.stringify(final)});stickers=pllApply(stickers,permutation);stickers=pllApply(stickers,pllInverse(casePlayback.item.solutions[0].algorithm))`);assert(run('pllUp(stickers)'));assert.equal(run('pllLowKey(stickers)'),low);assert.equal(run('pllFocusKey(stickers)'),run(`pllFocusKey(JSON.parse(${JSON.stringify(initial)}))`));run('stickers=pllApply(stickers,casePlayback.item.solutions[0].algorithm)');assert(run('pllCornersDone(stickers)'));assert(run('pllUp(stickers)'));assert.equal(run('pllLowKey(stickers)'),low)}
 run(`stickers=JSON.parse(${JSON.stringify(final)})`);for(let n=run('casePlayback.index');n>0;n--){get('#case-prev').click();drain()}assert.equal(run('JSON.stringify(stickers)'),initial);get('#case-restart').click();assert.equal(run('JSON.stringify(stickers)'),initial);
}
console.log('PASS: 6 PLL permutations and mask roles, exact adjacent/diagonal swaps, F2L/OLL preservation, solved goals, playback/undo/reset and 8 corner variants');
