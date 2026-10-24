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
run(`const ollPos=s=>s.p.map(v=>Math.max(-1,Math.min(1,Math.round(v))));
const ollTransform=(s,m)=>({...s,p:mv(m,s.p).map(v=>Math.round(v*2)/2||0),n:mv(m,s.n).map(v=>Math.round(v)||0)});
const ollApply=(state,alg)=>{if(!alg.trim())return state;let a=state;for(const t of parseAlgorithm(alg)){const m=moves[t.name],r=rotation(m.axis,m.sign*Math.PI/2*(t.variant==='2'?2:t.variant==="'"?-1:1));a=a.map(s=>selected(s,m.axis,m.layer)?ollTransform(s,r):s)}return a};
const ollInverse=alg=>parseAlgorithm(alg).reverse().map(t=>t.name+(t.variant==='2'?'2':t.variant==="'"?'':"'")).join(' ');
const ollLowKey=state=>state.filter(s=>ollPos(s)[1]<=0||ollPos(s).filter(Boolean).length===1).map(s=>s.color+':'+s.p+':'+s.n).sort().join('|');
const ollEdgeCount=state=>state.filter(s=>s.n[1]===1&&ollPos(s).filter(Boolean).length===2&&s.color===colorCodes.Y).length;
const ollTopCount=state=>state.filter(s=>s.n[1]===1&&s.color===colorCodes.Y).length;
const ollOrientationKey=state=>{const keys=[];let a=state;for(let i=0;i<4;i++){keys.push(a.filter(s=>s.focus&&s.color===colorCodes.Y).map(s=>s.p+':'+s.n).sort().join('|'));a=a.map(s=>ollTransform(s,rotation('y',Math.PI/2)))}return keys.sort()[0]};`);
assert.equal(run('caseLibrary.length'),244);assert.equal(get('#case-tree').children.length,6);assert(get('#case-tree').children.every(c=>c.open===false));
const cases=JSON.parse(run("JSON.stringify(caseLibrary.map((c,i)=>({...c,index:i})).filter(c=>c.collection==='2-look OLL'))"));assert.equal(cases.length,10);const edgeKeys=new Set(),cornerKeys=new Set();
for(const c of cases){get('#case-select').value=String(c.index);run('chooseCase();loadSelectedCase()');const edge=c.id.startsWith('oll2-edge-');assert.equal(run('stickers.filter(s=>s.focus).length'),edge?8:12);assert.equal(run('stickers.filter(s=>s.protected).length'),edge?34:42);
 const initial=run('JSON.stringify(stickers)'),low=run('ollLowKey(stickers)');(edge?edgeKeys:cornerKeys).add(run('ollOrientationKey(stickers)'));if(!edge)assert.equal(run('ollEdgeCount(stickers)'),4);
 get('#case-next').click();drain();assert.equal(run('casePlayback.index'),1);get('#case-prev').click();drain();assert.equal(run('JSON.stringify(stickers)'),initial);
 get('#case-solve').click();drain();assert(run('casePlayback.index===casePlayback.tokens.length'));assert.equal(run('ollLowKey(stickers)'),low);assert.equal(run('ollEdgeCount(stickers)'),4);if(!edge)assert.equal(run('ollTopCount(stickers)'),9);
 const solvedSnapshot=run('JSON.stringify(stickers)');
 for(const perm of ['', 'U', 'U2', "U'", "R U R' U' R' F R2 U' R' U' R U R' F'"]){sandbox.permutation=perm;run(`stickers=JSON.parse(${JSON.stringify(solvedSnapshot)});stickers=ollApply(stickers,permutation);stickers=ollApply(stickers,ollInverse(casePlayback.item.solutions[0].algorithm))`);assert.equal(run('ollLowKey(stickers)'),low);if(!edge)assert.equal(run('ollEdgeCount(stickers)'),4);assert.equal(run('ollOrientationKey(stickers)'),run(`ollOrientationKey(JSON.parse(${JSON.stringify(initial)}))`));run('stickers=ollApply(stickers,casePlayback.item.solutions[0].algorithm)');assert.equal(run('ollLowKey(stickers)'),low);assert.equal(run('ollEdgeCount(stickers)'),4);if(!edge)assert.equal(run('ollTopCount(stickers)'),9);}
 run(`stickers=JSON.parse(${JSON.stringify(solvedSnapshot)})`);for(let n=run('casePlayback.index');n>0;n--){get('#case-prev').click();drain()}assert.equal(run('JSON.stringify(stickers)'),initial);get('#case-restart').click();assert.equal(run('JSON.stringify(stickers)'),initial);
}
assert.equal(edgeKeys.size,3);assert.equal(cornerKeys.size,7);
console.log('PASS: 10 distinct OLL orientation cases, mask roles, F2L preservation, cross/corner goals, playback/undo/reset, and 50 permutation variants');
