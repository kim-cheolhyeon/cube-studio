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
const listeners={};sandbox.window={addEventListener:(key,fn)=>(listeners[key]??=[]).push(fn)};sandbox.document.body={dataset:{}};
const priorQuery=sandbox.document.querySelector;sandbox.document.querySelector=s=>{const el=priorQuery(s);el.setAttribute??=function(k,v){this[k]=v};return el};
run("const titleField={value:''},algorithmField={value:''},noteField={value:''}");
for(const file of ['src/modes.js','src/practice.js'])vm.runInContext(fs.readFileSync(''+file,'utf8'),sandbox);
assert.equal(run('currentMode'),'learn');assert.equal(sandbox.document.body.dataset.mode,'learn');
function type(text,extras={}){for(const char of text){const event={code:char==='0'?'Digit0':'Key'+char.toUpperCase(),target:{tagName:'BODY'},preventDefault(){},...extras};sandbox.inputEvent=event;run("handleFreeModeCode(inputEvent)")}}
type('test0000');assert.equal(run('currentMode'),'learn');run("setMode('practice')");type('test0000');assert.equal(run('currentMode'),'free');assert.equal(run('practiceRound.status'),'idle');assert.equal(run('practiceRound.start'),0);
for(const status of ['ready','running','complete','shuffling']){run(`setMode('practice');practiceRound.status='${status}'`);type('test0000');assert.equal(run('currentMode'),'practice')}
run("practiceRound.status='idle'");type('test0000',{target:{tagName:'INPUT'}});assert.equal(run('currentMode'),'practice');type('test0000',{repeat:true});assert.equal(run('currentMode'),'practice');type('test0000',{ctrlKey:true});assert.equal(run('currentMode'),'practice');type('test');run("setMode('learn');setMode('practice')");type('0000');assert.equal(run('currentMode'),'practice');type('test');for(const fn of listeners.blur)fn();type('0000');assert.equal(run('currentMode'),'practice');type('test0000');assert.equal(run('currentMode'),'free');
const html=fs.readFileSync('index.html','utf8');assert(html.includes('id="mode-free" hidden'));assert(html.includes('id="to-free" hidden'));
console.log('PASS: default learning, hidden free entries, idle practice unlock, no unlock during rounds or text input, mode/blur reset, no timer start');
