const faceOrder=['F','B','R','L','U','D'];
const colorCodes={W:'#f8fafb',Y:'#f5df26',R:'#e85250',O:'#ff9e40',G:'#50b98d',B:'#2855e8',K:'#171b24'};
const caseSelect=document.querySelector('#case-select'),solutionSelect=document.querySelector('#solution-select'),caseStatus=document.querySelector('#case-status');
let caseLibrary=[],casePlayback=null,caseSpeed=1;
function checkText(value,label,limit=2000){if(typeof value!=='string'||value.length>limit)throw Error(`${label}: 문자열 길이를 확인해 주세요.`)}
function validateCaseLibrary(data){
 if(!data||![1,2,3].includes(data.formatVersion)||!Array.isArray(data.cases)||!data.cases.length||data.cases.length>10000)throw Error('formatVersion: 1, 2 또는 3과 1~10,000개의 cases가 필요합니다.');
 const ids=new Set();
 for(const [index,item] of data.cases.entries()){
  const prefix=`케이스 ${index+1}`;if(!item||typeof item!=='object')throw Error(`${prefix}: 항목 형식이 잘못되었습니다.`);
  checkText(item.id,`${prefix} id`,200);checkText(item.name,`${prefix} 이름`,200);
  if(!item.id.trim()||!item.name.trim()||ids.has(item.id))throw Error(`${prefix}: 이름과 중복되지 않는 id가 필요합니다.`);ids.add(item.id);
  for(const key of ['category','description'])if(item[key]!==undefined)checkText(item[key],`${prefix} ${key}`,10000);
  if(item.tags!==undefined&&(!Array.isArray(item.tags)||item.tags.length>100||item.tags.some(t=>typeof t!=='string'||t.length>200)))throw Error(`${prefix}: tags는 문자열 목록이어야 합니다.`);
  const counts=Object.fromEntries(Object.keys(colorCodes).map(k=>[k,0])),centers=[];
  for(const face of faceOrder){const cells=item.state?.[face];if(!Array.isArray(cells)||cells.length!==9||cells.some(c=>!Object.hasOwn(colorCodes,c)))throw Error(`${prefix}: ${face}면은 W Y R O G B 코드 9개로 작성해 주세요.`);cells.forEach(c=>counts[c]++);centers.push(cells[4])}
  if(!counts.K&&(Object.entries(counts).some(([c,n])=>c!=='K'&&n!==9)||new Set(centers).size!==6))throw Error(`${prefix}: 색은 각각 9개, 여섯 중앙 칸은 서로 다른 색이어야 합니다.`);
  if(counts.K&&Object.entries(counts).some(([c,n])=>c!=='K'&&n>9))throw Error(`${prefix}: 한 색은 9칸을 넘을 수 없습니다.`);
  if(item.focus!==undefined)for(const face of faceOrder){const flags=item.focus[face];if(!Array.isArray(flags)||flags.length!==9||flags.some(v=>typeof v!=='boolean'))throw Error(`${prefix}: focus.${face}에는 true/false 9개가 필요합니다.`)}
  if(item.protected!==undefined)for(const face of faceOrder){const flags=item.protected[face];if(!Array.isArray(flags)||flags.length!==9||flags.some(v=>typeof v!=='boolean'))throw Error(`${prefix}: protected.${face}에는 true/false 9개가 필요합니다.`)}
  if(!Array.isArray(item.solutions)||item.solutions.length>100)throw Error(`${prefix}: solutions는 해법 목록이어야 합니다. 공식이 없으면 빈 배열을 사용하세요.`);
  for(const solution of item.solutions){if(!solution||typeof solution!=='object')throw Error(`${prefix}: 해결 공식 형식을 확인해 주세요.`);checkText(solution.name,`${prefix} 해법 이름`,200);checkText(solution.algorithm,`${prefix} 공식`);if(solution.note!==undefined)checkText(solution.note,`${prefix} 해법 메모`,10000);try{parseAlgorithm(solution.algorithm)}catch(error){throw Error(`${prefix} 공식: ${error.message}`)}}
 }
 return data.cases;
}
function stateToStickers(state,protectedCells,focusCells){return definitions.flatMap((face,f)=>Array.from({length:9},(_,i)=>({...face,n:[...face.n],u:[...face.u],v:[...face.v],color:colorCodes[state[faceOrder[f]][i]],protected:protectedCells?.[faceOrder[f]]?.[i]!==false,focus:focusCells?.[faceOrder[f]]?.[i]===true,p:face.n.map((n,k)=>1.5*n+face.u[k]*(i%3-1)+face.v[k]*(1-Math.floor(i/3)))})))}
function showCaseInfo(){const item=caseLibrary[Number(caseSelect.value)];if(!item)return;const solution=(item.solutions[Number(solutionSelect.value)||0]||{name:'',algorithm:'',note:''});document.querySelector('#case-info').textContent=[item.category,item.tags?.length?item.tags.map(t=>`#${t}`).join(' '):'',item.description,solution?.note].filter(Boolean).join('\n');document.querySelector('#playback-case-title').textContent=item.name;if(!caseSession){const steps=document.querySelector('#case-steps');steps.replaceChildren();for(const token of (solution.algorithm?parseAlgorithm(solution.algorithm):[])){const chip=document.createElement('span');chip.textContent=token.text;steps.append(chip)}}}
function chooseCase(){const item=caseLibrary[Number(caseSelect.value)];solutionSelect.hidden=item.solutions.length<=1;solutionSelect.replaceChildren();item.solutions.forEach((s,i)=>{const option=document.createElement('option');option.value=String(i);option.textContent=s.name||`해법 ${i+1}`;solutionSelect.append(option)});solutionSelect.value='0';showCaseInfo()}
function renderCaseOptions(){
 const tree=document.querySelector('#case-tree');tree.replaceChildren();
 const collections=[...new Set(caseLibrary.map(item=>item.collection||'초급 해법'))];
 for(const collection of collections){const root=document.createElement('details');root.className='case-collection';root.open=false;const title=document.createElement('summary');title.textContent=collection;root.append(title);const body=document.createElement('div');body.className='case-collection-body';
  const categories=[...new Set(caseLibrary.filter(item=>(item.collection||'초급 해법')===collection).map(item=>item.category||'기타'))];
  for(const category of categories){const folder=document.createElement('details');folder.open=false;const heading=document.createElement('summary');heading.textContent=category;folder.append(heading);const leaves=document.createElement('div');leaves.className='case-leaves';
   caseLibrary.forEach((item,i)=>{if((item.collection||'초급 해법')!==collection||(item.category||'기타')!==category)return;const button=document.createElement('button');button.type='button';button.dataset.caseIndex=String(i);button.textContent=item.name;button.setAttribute('aria-pressed',String(i===0));button.addEventListener('click',()=>{
    if(algorithmSession||caseSession||animation!==null||drag||returnAnimation!==null||queue.length)return;
    caseSelect.value=String(i);chooseCase();document.querySelectorAll('[data-case-index]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));loadSelectedCase();
   });leaves.append(button)});folder.append(leaves);body.append(folder);
  }root.append(body);tree.append(root);
 }
}
function setCaseLibrary(data){caseLibrary=validateCaseLibrary(data);caseSelect.value='0';renderCaseOptions();chooseCase();document.querySelector('#case-details').hidden=false}
document.querySelector('#case-mask').addEventListener('change',e=>{useMask=e.target.checked;draw()});
caseSelect.addEventListener('change',chooseCase);solutionSelect.addEventListener('change',showCaseInfo);
function loadSelectedCase(){
 if(animation!==null||drag||returnAnimation!==null||queue.length||algorithmSession||caseSession){caseStatus.textContent='현재 회전이 끝난 뒤 불러와 주세요.';return false}
 const item=caseLibrary[Number(caseSelect.value)];if(!item)return false;const solution=(item.solutions[Number(solutionSelect.value)||0]||{name:'',algorithm:'',note:''}),next=stateToStickers(item.state,item.protected,item.focus);
 stickers=next;view=baseView;lookX=lookY=0;active=null;
 if(typeof titleField!=='undefined'){titleField.value=item.name;algorithmField.value=solution.algorithm;noteField.value=[item.description,solution.note].filter(Boolean).join('\n')}
 initCasePlayback(item,solution);caseStatus.classList.remove('error');caseStatus.textContent=`${item.name} 상태를 불러왔습니다.`;draw();return true;
}
function initCasePlayback(item,solution){
 const steps=document.querySelector('#case-steps'),tokens=solution.algorithm?parseAlgorithm(solution.algorithm):[];steps.replaceChildren();
 const chips=tokens.map(token=>{const chip=document.createElement('span');chip.textContent=token.text;steps.append(chip);return chip});
 casePlayback={key:caseSelect.value+':'+solutionSelect.value,item,tokens,chips,index:0,snapshot:JSON.stringify(stickers)};
}
function prepareCasePlayback(replay){
 if(animation!==null||drag||returnAnimation!==null||queue.length||algorithmSession||caseSession)return false;
 const key=caseSelect.value+':'+solutionSelect.value;
 if(!casePlayback||casePlayback.key!==key||casePlayback.snapshot!==JSON.stringify(stickers)||(replay&&casePlayback.index===casePlayback.tokens.length))return loadSelectedCase();
 return true;
}
function playCase(continuous){
 if(!prepareCasePlayback(continuous))return;const playback=casePlayback;
 if(playback.index===playback.tokens.length){caseStatus.textContent='풀이 완료 · 문제 상태로 초기화를 누르면 다시 연습할 수 있습니다.';return}
 const session={stopped:false};caseSession=session;lockAlgorithm(false);
 function finish(message){caseSession=null;lockAlgorithm(false);caseStatus.textContent=message}
 function next(){if(caseSession!==session)return;
  if(playback.index===playback.tokens.length){finish('해법 실행 완료 · '+playback.tokens.length+'수');return}
  const i=playback.index,token=playback.tokens[i];playback.chips[i].className='current';caseStatus.textContent=`케이스 풀이 ${i+1}/${playback.tokens.length} · ${token.text}`;
  const speed=caseSpeed;
  performMove(token.name,token.variant,()=>{if(caseSession!==session)return;playback.chips[i].className='done';playback.index++;playback.snapshot=JSON.stringify(stickers);
   if(playback.index===playback.tokens.length){finish('해법 실행 완료 · '+playback.tokens.length+'수');return}
   if(!continuous||session.stopped){finish(`${playback.index}/${playback.tokens.length}수 · 다음: ${playback.tokens[playback.index].text}`);return}
   next();
  },720/speed);
 }next();
}
document.querySelector('#case-solve').addEventListener('click',()=>playCase(true));
document.querySelector('#case-pause').addEventListener('click',()=>{if(!caseSession)return;caseSession.stopped=true;document.querySelector('#case-pause').disabled=true;caseStatus.textContent='현재 수를 마친 뒤 일시정지합니다.'});
document.querySelector('#case-next').addEventListener('click',()=>playCase(false));
document.querySelector('#case-prev').addEventListener('click',()=>{
 if(!prepareCasePlayback(false))return;const playback=casePlayback;
 if(playback.index===0){caseStatus.textContent='첫 상태입니다.';return}
 const i=playback.index-1,token=playback.tokens[i],session={stopped:false};caseSession=session;lockAlgorithm(false);
 playback.chips[i].className='current';caseStatus.textContent=`이전 수로 이동 · ${token.text} 되돌리기`;
 const inverse=token.variant==='2'?'2':token.variant==="'"?'':"'";
 performMove(token.name,inverse,()=>{if(caseSession!==session)return;playback.index=i;playback.chips[i].className='';playback.snapshot=JSON.stringify(stickers);caseSession=null;lockAlgorithm(false);caseStatus.textContent=`${i}/${playback.tokens.length}수 · 다음: ${token.text}`},720/caseSpeed);
});
document.querySelector('#case-restart').addEventListener('click',()=>{
 if(algorithmSession||drag||returnAnimation!==null||(!caseSession&&(animation!==null||queue.length)))return;
 if(caseSession){if(animation!==null)cancelAnimationFrame(animation);animation=null;active=null;queue.length=0;caseSession=null;lockAlgorithm(false)}
 loadSelectedCase();
});
document.querySelector('#reset').addEventListener('click',()=>{if(typeof currentMode!=='undefined'&&currentMode!=='learn')return;caseSession=null;casePlayback=null;lockAlgorithm(false);document.querySelector('#case-steps').replaceChildren();caseStatus.textContent='큐브를 초기화했습니다. 케이스를 다시 불러올 수 있습니다.'});
if(typeof beginnerCaseLibrary!=='undefined'){setCaseLibrary({formatVersion:3,cases:[...beginnerCaseLibrary.cases.map(item=>({...item,collection:'초급 해법'})),...(typeof f2lCaseLibrary!=='undefined'?f2lCaseLibrary.cases.map(item=>({...item,collection:'F2L'})):[])]});caseStatus.textContent='왼쪽에서 케이스를 클릭한 뒤 재생 또는 다음 수를 누르세요.';}



document.querySelectorAll('[data-speed]').forEach(button=>button.addEventListener('click',()=>{caseSpeed=Number(button.dataset.speed);document.querySelectorAll('[data-speed]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)))}));














