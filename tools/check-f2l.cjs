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
for(const file of ['data/beginner/cases.bundle.js','data/f2l/cases.bundle.js','src/cases.js'])vm.runInContext(fs.readFileSync(''+file,'utf8'),sandbox);
assert.equal(run('caseLibrary.length'),150);
const roots=get('#case-tree').children;assert.equal(roots.length,2);assert(roots.every(r=>r.open===false));assert.equal(roots[1].children[0].textContent,'F2L');
function drain(){for(let n=0;pending.size&&n<500;n++)tick(800);assert.equal(pending.size,0)}
const actualKey="stickers.filter(s=>s.focus).map(s=>s.color+':'+s.p+':'+s.n).sort().join('|')";
for(let i=109;i<150;i++){
 get('#case-select').value=String(i);run('chooseCase();loadSelectedCase()');
 assert.equal(run('stickers.filter(s=>s.protected).length'),29);assert.equal(run('stickers.filter(s=>s.focus).length'),5);
 const start=run('JSON.stringify(stickers)'),preserved=run("stickers.filter(s=>s.protected).map(s=>s.color+':'+s.p+':'+s.n).sort().join('|')");
 get('#case-next').click();drain();assert.equal(run('casePlayback.index'),1);get('#case-prev').click();drain();assert.equal(run('casePlayback.index'),0);assert.equal(run('JSON.stringify(stickers)'),start);
 const ends=JSON.parse(run('JSON.stringify(casePlayback.segments)'));
 for(let j=0;j<ends.length;j++){
  get('#case-solve').click();drain();assert.equal(run('casePlayback.index'),ends[j].end);
  assert.equal(run("stickers.filter(s=>s.protected).map(s=>s.color+':'+s.p+':'+s.n).sort().join('|')"),preserved);
  const dest=run(`casePlayback.item.solutions[0].segments[${j}].targetCaseId`);
  if(dest){const expected=run(`(()=>{const c=caseLibrary.find(c=>c.id===${JSON.stringify(dest)});return stateToStickers(c.state,c.protected,c.focus).filter(s=>s.focus).map(s=>s.color+':'+s.p+':'+s.n).sort().join('|')})()`);assert.equal(run(actualKey),expected)}
 }
 assert(run('casePlayback.index===casePlayback.tokens.length'));assert.equal(ends.length,1);if(run("casePlayback.item.basicCase?.kind==='A'")){assert(run('stickers.filter(s=>s.protected||s.focus).every(s=>{const c=stickers.find(t=>Math.abs(Math.hypot(...t.p)-1.5)<1e-6&&t.n.every((v,k)=>v===s.n[k]));return c.color===s.color})'));}else{assert(run("!!casePlayback.item.solutions[0].segments[0].targetCaseId"));if(run('!!casePlayback.item.basicCase'))assert(run("caseLibrary.find(c=>c.id===casePlayback.item.solutions[0].segments[0].targetCaseId).basicCase.kind==='A'"));}
 for(let n=run('casePlayback.index');n>0;n--){get('#case-prev').click();drain()}
 assert.equal(run('JSON.stringify(stickers)'),start);
}
assert.equal(run('caseLibrary.filter(c=>c.basicCase).length'),8);
assert.throws(()=>run("validateCaseLibrary({formatVersion:3,cases:[{...f2lCaseLibrary.cases[0],solutions:[{name:'bad',algorithm:'R',segments:[{label:'bad',algorithm:'U'}]}]}]})"));
console.log('PASS: 39 induction-only cases + 2 A insertions, exact basic destination, preserved pieces, playback end, and all previous moves');
