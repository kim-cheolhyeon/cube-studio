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
function drain(){for(let n=0;pending.size&&n<800;n++)tick(800);assert.equal(pending.size,0)}
run(`const llPos=s=>s.p.map(v=>Math.max(-1,Math.min(1,Math.round(v))));
const llTransform=(s,m)=>({...s,p:mv(m,s.p).map(v=>Math.round(v*2)/2||0),n:mv(m,s.n).map(v=>Math.round(v)||0)});
const llApply=(state,alg)=>{if(!alg.trim())return state;let a=state;for(const t of parseAlgorithm(alg)){const m=moves[t.name],r=rotation(m.axis,m.sign*Math.PI/2*(t.variant==='2'?2:t.variant==="'"?-1:1));a=a.map(s=>selected(s,m.axis,m.layer)?llTransform(s,r):s)}return a};
const llInverse=alg=>parseAlgorithm(alg).reverse().map(t=>t.name+(t.variant==='2'?'2':t.variant==="'"?'':"'")).join(' ');
const llLowKey=state=>state.filter(s=>llPos(s)[1]<=0||llPos(s).filter(Boolean).length===1).map(s=>s.color+':'+s.p+':'+s.n).sort().join('|');
const llUp=state=>state.filter(s=>s.n[1]===1&&s.color===colorCodes.Y).length===9;
const llSolved=state=>definitions.every(f=>new Set(state.filter(s=>s.n.every((v,k)=>v===f.n[k])).map(s=>s.color)).size===1);
const llOrientationVariants=state=>{const variants=[];let a=state;for(let i=0;i<4;i++){variants.push(a.filter(s=>s.color===colorCodes.Y).map(s=>s.p+':'+s.n).sort().join('|'));a=a.map(s=>llTransform(s,rotation('y',Math.PI/2)))}return variants};
const llPermutationVariants=state=>{const groups=new Map(),centers=state.filter(s=>llPos(s).filter(Boolean).length===1);for(const s of state.filter(s=>llPos(s)[1]>0&&llPos(s).filter(Boolean).length>1)){const p=llPos(s).join(',');if(!groups.has(p))groups.set(p,[]);groups.get(p).push(s)}const pieces=[...groups.values()].map(part=>({from:llPos(part[0]),to:part.reduce((sum,s)=>sum.map((v,k)=>v+centers.find(c=>c.color===s.color).n[k]),[0,0,0])})),keys=[];for(let a=0;a<4;a++)for(let b=0;b<4;b++){const rotate=(p,n)=>mv(rotation('y',n*Math.PI/2),p).map(v=>Math.round(v)||0);keys.push(pieces.map(p=>rotate(p.from,a)+':'+rotate(p.to,b)).sort().join('|'))}return keys};`);
assert.equal(run('caseLibrary.length'),244);assert.equal(get('#case-tree').children.length,6);assert(get('#case-tree').children.every(c=>c.open===false));
const cases=JSON.parse(run("JSON.stringify(caseLibrary.map((c,i)=>({...c,index:i})).filter(c=>c.collection==='Full OLL'||c.collection==='Full PLL'))"));assert.equal(cases.length,78);
const ollClasses=new Set(),pllClasses=new Set(),ollPatterns=new Set(),pllPatterns=new Set();
const permutations=['','U',"R U' R U R U R U' R' U' R2","R U R' U' R' F R2 U' R' U' R U R' F'"];
for(const c of cases){get('#case-select').value=String(c.index);run('chooseCase();loadSelectedCase()');const oll=c.collection==='Full OLL';assert.equal(run('stickers.filter(s=>s.protected||s.focus).length'),54);assert(run('stickers.every(s=>s.focus!==s.protected)'));if(oll){assert.equal(run('stickers.filter(s=>s.focus).length'),20);assert.equal(run('stickers.filter(s=>s.protected).length'),34)}else assert(run('llUp(stickers)'));
 const variants=JSON.parse(run(oll?'JSON.stringify(llOrientationVariants(stickers))':'JSON.stringify(llPermutationVariants(stickers))'));const canonical=[...variants].sort()[0];assert(!(oll?ollClasses:pllClasses).has(canonical),c.id+' duplicate');(oll?ollClasses:pllClasses).add(canonical);for(const v of variants)(oll?ollPatterns:pllPatterns).add(v);
 const initial=run('JSON.stringify(stickers)'),low=run('llLowKey(stickers)');get('#case-next').click();drain();get('#case-prev').click();drain();assert.equal(run('JSON.stringify(stickers)'),initial);
 get('#case-solve').click();drain();assert(run('casePlayback.index===casePlayback.tokens.length'));assert.equal(run('llLowKey(stickers)'),low);assert(run('llUp(stickers)'));if(!oll)assert(run('llSolved(stickers)'));
 const final=run('JSON.stringify(stickers)');const completedVariants=JSON.parse(run(oll?'JSON.stringify(llOrientationVariants(stickers))':'JSON.stringify(llPermutationVariants(stickers))'));for(const v of completedVariants)(oll?ollPatterns:pllPatterns).add(v);
 if(oll)for(const perm of permutations){sandbox.permutation=perm;run(`stickers=JSON.parse(${JSON.stringify(final)});stickers=llApply(stickers,permutation);stickers=llApply(stickers,llInverse(casePlayback.item.solutions[0].algorithm))`);assert.equal(run('llLowKey(stickers)'),low);assert.equal(run('llOrientationVariants(stickers).sort()[0]'),canonical);run('stickers=llApply(stickers,casePlayback.item.solutions[0].algorithm)');assert(run('llUp(stickers)'));assert.equal(run('llLowKey(stickers)'),low)}
 run(`stickers=JSON.parse(${JSON.stringify(final)})`);for(let n=run('casePlayback.index');n>0;n--){get('#case-prev').click();drain()}assert.equal(run('JSON.stringify(stickers)'),initial);get('#case-restart').click();assert.equal(run('JSON.stringify(stickers)'),initial);
}
assert.equal(ollClasses.size,57);assert.equal(pllClasses.size,21);assert.equal(ollPatterns.size,216);assert.equal(pllPatterns.size,288);
console.log('PASS: 57 OLL + 21 PLL, complete 216 orientation/288 permutation coverage, F2L and goals, playback/undo/reset and 228 OLL permutation variants');
