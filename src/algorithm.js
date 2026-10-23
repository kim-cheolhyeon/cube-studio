const algorithmInput=document.querySelector('#algorithm-input'),algorithmStatus=document.querySelector('#algorithm-status'),algorithmSteps=document.querySelector('#algorithm-steps');
const runButton=document.querySelector('#algorithm-run'),stopButton=document.querySelector('#algorithm-stop');
let algorithmSession=null,caseSession=null;
function parseAlgorithm(source){
 const text=source.replace(/[’‘′]/g,"'");const result=[];let i=0;
 while(i<text.length){if(/\s/.test(text[i])){i++;continue}
  const at=i;let name=text[i++],display=name;
  if(/[RLUDFB]/.test(name)&&text[i]==='w'){i++;display+='w';name=name.toLowerCase()}
  if(!Object.hasOwn(moves,name))throw Error(`${at+1}번째 문자 '${name}'를 확인해 주세요.`);
  let variant='';if(text[i]==="'"||text[i]==='2')variant=text[i++];
  if(text[i]==="'"||text[i]==='2')throw Error(`${i+1}번째 문자: 프라임 또는 2는 한 번만 붙여 주세요.`);
  result.push({name,variant,text:display+variant});if(result.length>300)throw Error('공식은 한 번에 300수까지 실행할 수 있습니다.');
 }
 if(!result.length)throw Error('실행할 공식을 입력해 주세요.');return result;
}
function lockAlgorithm(locked){algorithmInput.disabled=locked;runButton.disabled=locked||caseSession!==null;stopButton.disabled=!locked;const busy=locked||caseSession!==null;document.querySelectorAll('.move-row button, [data-case-index]').forEach(b=>b.disabled=busy);for(const id of ['#case-solve','#case-prev','#case-next','#case-select','#solution-select'])document.querySelector(id).disabled=busy;document.querySelector('#case-restart').disabled=locked;document.querySelector('#case-pause').disabled=caseSession===null||caseSession.stopped;}
function finishAlgorithm(session,message){if(algorithmSession!==session)return;algorithmSession=null;lockAlgorithm(false);algorithmStatus.textContent=message}
document.querySelector('#algorithm-form').addEventListener('submit',e=>{
 e.preventDefault();if(algorithmSession||caseSession)return;algorithmStatus.classList.remove('error');
 let tokens;try{tokens=parseAlgorithm(algorithmInput.value)}catch(error){algorithmStatus.textContent=error.message;algorithmStatus.classList.add('error');return}
 if(animation!==null||drag||returnAnimation!==null||queue.length){algorithmStatus.textContent='현재 회전이 끝난 뒤 실행해 주세요.';return}
 algorithmSteps.replaceChildren();const chips=tokens.map(token=>{const chip=document.createElement('span');chip.textContent=token.text;algorithmSteps.append(chip);return chip});
 const session={stopped:false,index:0};algorithmSession=session;lockAlgorithm(true);
 function next(){if(algorithmSession!==session)return;
  if(session.stopped){finishAlgorithm(session,`${session.index}/${tokens.length}수 실행 후 중지했습니다.`);return}
  if(session.index===tokens.length){finishAlgorithm(session,`${tokens.length}수 실행 완료`);return}
  const i=session.index,token=tokens[i];chips[i].className='current';algorithmStatus.textContent=`${i+1}/${tokens.length} · ${token.text}`;
  performMove(token.name,token.variant,()=>{if(algorithmSession!==session)return;chips[i].className='done';session.index++;next()});
 }next();
});
stopButton.addEventListener('click',()=>{if(!algorithmSession)return;algorithmSession.stopped=true;stopButton.disabled=true;algorithmStatus.textContent='현재 수를 마친 뒤 중지합니다.'});
document.querySelector('#reset').addEventListener('click',()=>{algorithmSession=null;lockAlgorithm(false);algorithmSteps.replaceChildren();algorithmStatus.classList.remove('error');algorithmStatus.textContent='큐브를 초기화했습니다.'});







