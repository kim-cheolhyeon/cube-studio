let tutorialAdvanceTimer=null;
const tutorialState={active:false,index:0,completed:0,accepted:0,pending:0,phase:'idle',snapshot:null};
const tutorialLessons=['KeyJ','KeyK','KeyF','KeyD','KeyG','KeyH','KeyU','KeyR','KeyX','Period','KeyL','KeyS','KeyM','Comma','KeyC','KeyV','KeyB','KeyN','KeyI','KeyE','KeyZ','Slash','Semicolon','KeyA','ArrowLeft','ArrowRight'];
const keyName=code=>({Period:'.',Comma:',',Slash:'/',Semicolon:';',ArrowLeft:'←',ArrowRight:'→'}[code]||code.replace('Key',''));
const tutorialInstruction=document.querySelector('#tutorial-instruction'),tutorialNext=document.querySelector('#tutorial-next');
function tutorialLocks(locked){document.querySelector('#practice-shuffle').disabled=locked;document.querySelector('#reset').disabled=locked;document.querySelector('#tutorial-start').disabled=locked;document.querySelectorAll('[data-practice-move]').forEach(b=>b.disabled=locked||!['ready','running'].includes(practiceRound.status))}
function tutorialLesson(){
 const code=tutorialLessons[tutorialState.index],[name,variant]=practiceKeyMap[code];
 if(typeof highlightTutorialKey==='function')highlightTutorialKey(code);
 Object.assign(tutorialState,{completed:0,accepted:0,pending:0,phase:'demo'});tutorialNext.disabled=true;
 stickers=solved();view=baseView;lookX=lookY=0;useMask=false;heldPracticeKeys.clear();draw();
 document.querySelector('#tutorial-progress').textContent=`${tutorialState.index+1} / ${tutorialLessons.length} · ${name+variant}`;
 document.querySelector('#tutorial-key').textContent='시범';tutorialInstruction.textContent=`${name+variant} 회전을 먼저 보세요.`;
 performMove(name,variant,()=>{if(!tutorialState.active)return;tutorialState.phase='input';document.querySelector('#tutorial-key').textContent=keyName(code);tutorialInstruction.textContent=`${keyName(code)} 키를 세 번 누르세요. 0 / 3`},650);
}
function tutorialKey(code){
 if(!tutorialState.active||tutorialState.phase!=='input')return;
 const expected=tutorialLessons[tutorialState.index];
 if(code!==expected){tutorialInstruction.textContent=`${keyName(expected)} 키를 눌러 주세요. ${tutorialState.completed} / 3`;return}
 if(tutorialState.accepted>=3)return;
 tutorialState.accepted++;tutorialState.pending++;
 if(!practiceRound.moving)runTutorialTurn();
}
function runTutorialTurn(){
 if(!tutorialState.active||!tutorialState.pending)return;
 tutorialState.pending--;practiceRound.moving=true;
 const [name,variant]=practiceKeyMap[tutorialLessons[tutorialState.index]];
 performMove(name,variant,()=>{
  if(!tutorialState.active)return;practiceRound.moving=false;tutorialState.completed++;
  if(tutorialState.completed===3){tutorialState.phase='passed';tutorialInstruction.textContent='통과! 한 바퀴 돌아 처음 상태가 되었습니다.';tutorialNext.textContent=tutorialState.index===tutorialLessons.length-1?'튜토리얼 마치기':'다음 키';tutorialNext.disabled=false;tutorialAdvanceTimer=setTimeout(()=>{tutorialAdvanceTimer=null;if(!tutorialState.active||tutorialState.phase!=='passed')return;if(tutorialState.index===tutorialLessons.length-1){endTutorial();return}tutorialState.index++;tutorialLesson()},500);return}
  tutorialInstruction.textContent=`${keyName(tutorialLessons[tutorialState.index])} 키를 세 번 누르세요. ${tutorialState.completed} / 3`;
  runTutorialTurn();
 },360);
}
function endTutorial(){
 if(!tutorialState.active)return;
 if(tutorialAdvanceTimer!==null)clearTimeout(tutorialAdvanceTimer);tutorialAdvanceTimer=null;
 if(animation!==null)cancelAnimationFrame(animation);animation=null;active=null;queue.length=0;practiceRound.moving=false;
 const saved=tutorialState.snapshot;stickers=cloneCube(saved.stickers);useMask=saved.useMask;view=baseView;lookX=lookY=0;
 tutorialState.active=false;tutorialState.phase='idle';tutorialState.pending=0;heldPracticeKeys.clear();document.querySelector('#tutorial-panel').hidden=true;tutorialLocks(false);refreshPracticeControls();draw();
 if(typeof highlightTutorialKey==='function')highlightTutorialKey(null);
}
document.querySelector('#tutorial-start').addEventListener('click',()=>{
 if(currentMode!=='practice'||modeBusy()||practiceRound.status==='running'){practiceStatus.textContent='현재 도전을 마치거나 초기화한 뒤 튜토리얼을 시작하세요.';return}
 tutorialState.snapshot={stickers:cloneCube(stickers),useMask};tutorialState.active=true;tutorialState.index=0;
 document.querySelector('#tutorial-panel').hidden=false;tutorialLocks(true);tutorialLesson();
});
tutorialNext.addEventListener('click',()=>{if(!tutorialState.active||tutorialState.phase!=='passed')return;if(tutorialState.index===tutorialLessons.length-1){endTutorial();return}tutorialState.index++;tutorialLesson()});
document.querySelector('#tutorial-exit').addEventListener('click',endTutorial);

