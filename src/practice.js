const practiceRound={status:'idle',moving:false,start:0,elapsed:0,count:0,scramble:[]};
const practiceTime=document.querySelector('#practice-time'),practiceStatus=document.querySelector('#practice-status');
let practiceClock=null;
const practicePending=[];
function formatPracticeTime(ms){const cs=Math.floor(ms/10);return String(Math.floor(cs/6000)).padStart(2,'0')+':'+String(Math.floor(cs/100)%60).padStart(2,'0')+'.'+String(cs%100).padStart(2,'0')}
function updatePracticeClock(){practiceTime.textContent=formatPracticeTime(practiceRound.status==='running'?performance.now()-practiceRound.start:practiceRound.elapsed);if(practiceRound.status==='running')practiceClock=requestAnimationFrame(updatePracticeClock);else practiceClock=null}
function practiceSolved(){return definitions.every(face=>{const cells=stickers.filter(s=>s.n.every((n,i)=>Math.abs(n-face.n[i])<1e-6));return cells.length===9&&cells.every(s=>s.color===cells[0].color)})}
function refreshPracticeControls(){document.querySelectorAll('[data-practice-move]').forEach(b=>b.disabled=practiceRound.moving||!['ready','running'].includes(practiceRound.status));document.querySelector('#practice-shuffle').disabled=practiceRound.moving}
function practiceMove(name,variant){
 if((typeof tutorialState!=='undefined'&&tutorialState.active)||currentMode!=='practice'||drag||returnAnimation!==null||algorithmSession||caseSession||!['ready','running'].includes(practiceRound.status))return;
 if(animation!==null&&!practiceRound.moving)return;
 practicePending.push({name,variant});if(practiceRound.moving)return;runPracticeMove();
}
function runPracticeMove(){
 const next=practicePending.shift();if(!next)return;const {name,variant}=next;
 if(practiceRound.status==='ready'){practiceRound.status='running';practiceRound.start=performance.now();practiceRound.elapsed=0;updatePracticeClock()}
 practiceRound.moving=true;practiceRound.count++;document.querySelector('#practice-count').textContent=practiceRound.count+'수';practiceStatus.textContent='맞추는 중';refreshPracticeControls();
 performMove(name,variant,()=>{practiceRound.moving=false;if(practiceSolved()){
  practiceRound.elapsed=performance.now()-practiceRound.start;practiceRound.status='complete';freeModeCodeBuffer='';if(practiceClock!==null)cancelAnimationFrame(practiceClock);practiceClock=null;updatePracticeClock();practiceStatus.textContent='완성! 새 셔플로 다시 도전하세요.';
  practicePending.length=0;
 }else if(practicePending.length){runPracticeMove();return}refreshPracticeControls()});
}
document.querySelector('#practice-shuffle').addEventListener('click',()=>{
 if((typeof tutorialState!=='undefined'&&tutorialState.active)||currentMode!=='practice'||modeBusy()||practiceRound.moving)return;
 if(practiceClock!==null)cancelAnimationFrame(practiceClock);practiceClock=null;
 stickers=solved();view=baseView;lookX=lookY=0;useMask=false;
 practicePending.length=0;
 const names=['R','L','U','D','F','B'],variants=['',"'",'2'],scramble=[];
 for(let i=0;i<20;i++){const previous=scramble[i-1],choices=names.filter(n=>!previous||moves[n].axis!==moves[previous.name].axis);scramble.push({name:choices[Math.floor(Math.random()*choices.length)],variant:variants[Math.floor(Math.random()*3)]})}
 Object.assign(practiceRound,{status:'shuffling',moving:true,start:0,elapsed:0,count:0,scramble});document.querySelector('#practice-count').textContent='0수';updatePracticeClock();practiceStatus.textContent='섞는 중';refreshPracticeControls();draw();
 scramble.forEach((token,i)=>performMove(token.name,token.variant,i===scramble.length-1?()=>{practiceRound.status='ready';practiceRound.moving=false;practiceStatus.textContent='준비 완료 · 키보드나 버튼의 첫 회전부터 시작됩니다.';refreshPracticeControls()}:null,120));
});
for(const group of [{title:'바깥층',names:['R','L','U','D','F','B']},{title:'두 층 회전',names:['r','l','u','d','f','b']},{title:'중앙층',names:['M','E','S']},{title:'전체 회전',names:['x','y','z']}]){
 const card=document.createElement('div');card.className='move-card';const title=document.createElement('h2');title.textContent=group.title;card.append(title);
 for(const name of group.names){const row=document.createElement('div');row.className='move-row';for(const variant of ['',"'",'2']){const b=document.createElement('button');b.type='button';b.textContent=name+variant;b.dataset.practiceMove=name+variant;b.setAttribute('aria-label',name+variant+' 회전');b.addEventListener('click',()=>practiceMove(name,variant));row.append(b)}card.append(row)}document.querySelector('#practice-controls').append(card);
}
document.querySelector('#reset').addEventListener('click',()=>{if(currentMode!=='practice')return;if(practiceClock!==null)cancelAnimationFrame(practiceClock);practiceClock=null;practicePending.length=0;Object.assign(practiceRound,{status:'idle',moving:false,start:0,elapsed:0,count:0,scramble:[]});document.querySelector('#practice-count').textContent='0수';practiceStatus.textContent='셔플을 눌러 준비하세요.';updatePracticeClock();refreshPracticeControls()});
const practiceKeyMap={KeyZ:['d',''],Slash:['d',"'"],KeyC:['l',''],KeyV:['l',"'"],KeyM:['r',''],Comma:['r',"'"],KeyA:['b',"'"],Semicolon:['b',''],ArrowLeft:['y',''],ArrowRight:['y',"'"],KeyF:['L',"'"],KeyD:['L',''],KeyJ:['R',''],KeyK:['R',"'"],KeyG:['F',''],KeyH:['F',"'"],KeyR:['U',"'"],KeyU:['U',''],KeyB:['f',''],KeyN:['f',"'"],KeyE:['u',"'"],KeyI:['u',''],KeyX:['D',''],Period:['D',"'"],KeyS:['B',"'"],KeyL:['B','']};
const heldPracticeKeys=new Set();
function handleFreeModeCode(e){
 const target=e.target;
 if(currentMode!=='practice'||practiceRound.status!=='idle'||modeBusy()||(typeof tutorialState!=='undefined'&&tutorialState.active)||e.ctrlKey||e.altKey||e.metaKey||e.shiftKey||target?.isContentEditable||['INPUT','TEXTAREA','SELECT'].includes(target?.tagName)||target?.closest?.('dialog')||(typeof exportDialog!=='undefined'&&exportDialog.open)){freeModeCodeBuffer='';return false}
 if(e.repeat)return false;
 const key=e.code?.startsWith('Key')?e.code.slice(3).toLowerCase():['Digit0','Numpad0'].includes(e.code)?'0':'';
 freeModeCodeBuffer=key?(freeModeCodeBuffer+key).slice(-8):'';
 if(freeModeCodeBuffer!=='test0000')return false;
 freeModeCodeBuffer='';e.preventDefault();return setMode('free');
}

window.addEventListener('keydown',e=>{
 if(handleFreeModeCode(e))return;
 if(currentMode!=='practice'||!practiceKeyMap[e.code]||e.ctrlKey||e.altKey||e.metaKey)return;
 const target=e.target;if(target?.isContentEditable||['INPUT','TEXTAREA','SELECT'].includes(target?.tagName)||target?.closest?.('dialog')||(typeof exportDialog!=='undefined'&&exportDialog.open))return;
 e.preventDefault();if(e.repeat||heldPracticeKeys.has(e.code))return;heldPracticeKeys.add(e.code);if(typeof tutorialState!=='undefined'&&tutorialState.active){tutorialKey(e.code);return}practiceMove(...practiceKeyMap[e.code]);
});
window.addEventListener('keyup',e=>heldPracticeKeys.delete(e.code));
window.addEventListener('blur',()=>{heldPracticeKeys.clear();freeModeCodeBuffer=''});
refreshPracticeControls();


















// Start in learning mode; practice remains available from its tab.



