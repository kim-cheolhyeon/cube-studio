let currentMode='learn';
const cloneCube=state=>state.map(s=>({...s,p:[...s.p],n:[...s.n],u:[...s.u],v:[...s.v]}));
function captureMode(){return {stickers:cloneCube(stickers),useMask,returnView:returnToggle.checked,title:titleField.value,formula:algorithmField.value,note:noteField.value}}
const modeStates={learn:captureMode(),free:{stickers:solved(),useMask:false,returnView:true,title:'자유조작 큐브',formula:'',note:''},practice:{stickers:solved(),useMask:false,returnView:true,title:'실전 큐브',formula:'',note:''}};
function modeBusy(){return animation!==null||returnAnimation!==null||drag!==null||algorithmSession!==null||caseSession!==null||queue.length>0}
function setMode(next){
 if(next===currentMode)return true;if(typeof tutorialState!=='undefined'&&tutorialState.active){document.querySelector('#mode-status').textContent='튜토리얼을 종료한 뒤 모드를 바꿔 주세요.';return false;}
 if(modeBusy()){document.querySelector('#mode-status').textContent='현재 회전이 끝난 뒤 모드를 바꿔 주세요.';return false}
 modeStates[currentMode]=captureMode();currentMode=next;const saved=modeStates[next];
 stickers=cloneCube(saved.stickers);useMask=saved.useMask;returnToggle.checked=saved.returnView;
 titleField.value=saved.title;algorithmField.value=saved.formula;noteField.value=saved.note;
 view=baseView;lookX=lookY=0;document.body.dataset.mode=next;
 for(const mode of ['learn','free','practice'])document.querySelector('#mode-'+mode).setAttribute('aria-pressed',String(next===mode));document.querySelector('#mode-status').textContent='';resize();return true;
}
document.querySelector('#mode-learn').addEventListener('click',()=>setMode('learn'));
document.querySelector('#mode-free').addEventListener('click',()=>setMode('free'));
document.querySelector('#mode-practice').addEventListener('click',()=>setMode('practice'));
document.querySelector('#to-free').addEventListener('click',()=>{
 if(currentMode!=='learn'||modeBusy()){document.querySelector('#mode-status').textContent='현재 회전이 끝난 뒤 복사해 주세요.';return}
 const copy=captureMode();copy.useMask=false;modeStates.free=copy;setMode('free');
});
document.body.dataset.mode='learn';

