const keyboardKeys=new Map();
const keyboardBoard=document.querySelector('#keyboard-guide');
const keyboardCaption=document.createElement('p');keyboardCaption.className='keyboard-caption';keyboardCaption.textContent='키보드 배치 · F와 J에 검지 · 금색 테두리는 튜토리얼 키';keyboardBoard.append(keyboardCaption);
const keyboardRows=[
 ['Q','W','E','R','T','Y','U','I','O','P'].map(k=>['Key'+k,k]),
 [...['A','S','D','F','G','H','J','K','L'].map(k=>['Key'+k,k]),['Semicolon',';']],
 [...['Z','X','C','V','B','N','M'].map(k=>['Key'+k,k]),['Comma',','],['Period','.'],['Slash','/']],
 [['ArrowLeft','←'],['ArrowDown','↓'],['ArrowUp','↑'],['ArrowRight','→']]
];
keyboardRows.forEach((keys,i)=>{const row=document.createElement('div');row.className='keyboard-row'+(i===3?' arrows':'');
 for(const [code,name]of keys){const move=practiceKeyMap[code],key=document.createElement('div');key.className='guide-key '+(move?'mapped':'unmapped')+(['KeyF','KeyJ'].includes(code)?' home':'');key.dataset.keyCode=code;key.setAttribute('aria-label',name+(move?' 키: '+move.join(''):' 키: 미지정'));const cap=document.createElement('span');cap.className='key-name';cap.textContent=name;const action=document.createElement('span');action.className='key-move';action.textContent=move?move.join(''):'—';key.append(cap,action);row.append(key);keyboardKeys.set(code,key)}keyboardBoard.append(row);
});
function highlightTutorialKey(code){for(const [key,element]of keyboardKeys)element.classList.toggle('expected',key===code)}
window.addEventListener('keydown',e=>{if(currentMode!=='practice'||e.ctrlKey||e.altKey||e.metaKey||e.target?.isContentEditable||['INPUT','TEXTAREA','SELECT'].includes(e.target?.tagName))return;keyboardKeys.get(e.code)?.classList.add('pressed')});
window.addEventListener('keyup',e=>keyboardKeys.get(e.code)?.classList.remove('pressed'));
window.addEventListener('blur',()=>keyboardKeys.forEach(key=>key.classList.remove('pressed')));
function updateKeyboardColors(){
 const directions={R:[1,0,0],L:[-1,0,0],U:[0,1,0],D:[0,-1,0],F:[0,0,1],B:[0,0,-1]};
 const pastel=hex=>{const rgb=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));return 'rgb('+rgb.map(v=>Math.round(v*.32+255*.68)).join(',')+')'};
 for(const [code,key]of keyboardKeys){const move=practiceKeyMap[code],normal=move&&directions[move[0].toUpperCase()];
  const center=normal&&stickers.find(s=>Math.abs(Math.hypot(...s.p)-1.5)<1e-6&&s.n.every((n,i)=>n===normal[i]));
  key.style.setProperty('--key-face',center?pastel(center.color):'#ffffff');
 }
}
updateKeyboardColors();
