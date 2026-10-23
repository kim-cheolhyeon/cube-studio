const exportDialog=document.querySelector('#export-dialog');
const titleField=document.querySelector('#card-title'),algorithmField=document.querySelector('#card-algorithm'),noteField=document.querySelector('#card-note');
const exportStatus=document.querySelector('#export-status');
let cardSnapshot=null,cardImage=null;
let exportMetadata={category:'직접 저장',tags:[]};
function cardFields(){return {title:titleField.value.trim()||'큐브 상태',algorithm:algorithmField.value.trim(),note:noteField.value.trim()}}
function wrappedLines(context,text,maxWidth){const lines=[];for(const paragraph of text.split('\n')){let line='';for(const char of paragraph){if(line&&context.measureText(line+char).width>maxWidth){lines.push(line);line=char}else line+=char}lines.push(line)}return lines}
function makeCard(){
 if(!cardSnapshot)return;
 const fields=cardFields(),image=document.createElement('canvas'),c=image.getContext('2d');image.width=1200;
 c.font='600 32px system-ui';const titleLines=wrappedLines(c,fields.title,1080);
 c.font='24px Consolas,monospace';const algorithmLines=fields.algorithm?wrappedLines(c,fields.algorithm,1060):[];
 c.font='23px system-ui';const noteLines=fields.note?wrappedLines(c,fields.note,1060):[];
 const headingHeight=52+titleLines.length*42;
 image.height=headingHeight+760+(algorithmLines.length?64+algorithmLines.length*35:0)+(noteLines.length?64+noteLines.length*33:0)+50;
 c.fillStyle='#ffffff';c.fillRect(0,0,image.width,image.height);
 c.fillStyle='#23324a';c.font='600 32px system-ui';titleLines.forEach((line,i)=>c.fillText(line,60,58+i*42));
 const oldContext=ctx,oldView=view;ctx=c;view=baseView;
 try{
  const cy=headingHeight+285,scale=168,items=cardSnapshot;
  mirror(0,600-2.45*scale,cy,scale*.72,items);mirror(2,600+2.45*scale,cy,scale*.72,items);mirror(1,600,cy+2.3*scale,scale*.72,items);
  cube(600,cy,scale,items);
 }finally{ctx=oldContext;view=oldView}
 let y=headingHeight+760;
 function block(caption,lines,font,lineHeight){if(!lines.length)return;c.fillStyle='#8090a7';c.font='600 16px system-ui';c.fillText(caption,60,y);y+=34;c.fillStyle='#23324a';c.font=font;lines.forEach(line=>{c.fillText(line,60,y);y+=lineHeight});y+=30}
 block('공식',algorithmLines,'24px Consolas,monospace',35);block('메모',noteLines,'23px system-ui',33);
 cardImage=image;document.querySelector('#card-preview').src=image.toDataURL('image/png');exportStatus.textContent='';
}
function cardText(){const {title,algorithm,note}=cardFields();return [title,algorithm?`공식: ${algorithm}`:'',note?`메모: ${note}`:''].filter(Boolean).join('\n\n')}
document.querySelector('#notion-card').addEventListener('click',()=>{
 if(animation!==null||drag||returnAnimation!==null){alert('회전이 끝난 뒤 카드를 만들어 주세요.');return}
 cardSnapshot=stickers.map(s=>({...s,p:[...s.p],n:[...s.n],u:[...s.u],v:[...s.v]}));const item=typeof currentMode!=='undefined'&&currentMode==='learn'?caseLibrary[Number(caseSelect.value)]:null;exportMetadata={category:item?.category||'직접 저장',tags:[...(item?.tags||[])]};makeCard();exportDialog.showModal();
});

function exportCaseJSON(){
 if(!cardSnapshot)throw Error('먼저 Export를 열어 주세요.');
 const fields=cardFields();if(fields.algorithm)parseAlgorithm(fields.algorithm);
 const encode=get=>Object.fromEntries(definitions.map((face,f)=>[faceOrder[f],Array.from({length:9},(_,i)=>{const p=face.n.map((n,k)=>n*1.5+face.u[k]*(i%3-1)+face.v[k]*(1-Math.floor(i/3)));const sticker=cardSnapshot.find(s=>s.n.every((n,k)=>n===face.n[k])&&s.p.every((v,k)=>Math.abs(v-p[k])<1e-6));if(!sticker)throw Error('정렬된 큐브 상태에서 저장해 주세요.');return get(sticker)})]));
 const state=encode(s=>{const color=Object.keys(colorCodes).find(c=>colorCodes[c]===s.color);if(!color)throw Error('저장할 수 없는 색입니다.');return color});
 const id=globalThis.crypto?.randomUUID?.()||'case-'+Date.now();
 const data={formatVersion:3,displayRule:'protected-and-current-target',cases:[{id,name:fields.title,category:exportMetadata.category,tags:exportMetadata.tags,description:fields.note,state,protected:encode(s=>s.protected!==false),focus:encode(s=>s.focus===true),solutions:fields.algorithm?[{name:'해법',algorithm:fields.algorithm,note:''}]:[]}]};
 validateCaseLibrary(data);return data;
}
document.querySelector('#download-json').addEventListener('click',()=>{try{
 const data=exportCaseJSON(),blob=new Blob([JSON.stringify(data,null,2)+'\n'],{type:'application/json;charset=utf-8'}),url=URL.createObjectURL(blob),link=document.createElement('a');
 link.href=url;link.download=cardFields().title.replace(/[\\/:*?"<>|]/g,'-')+'.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);exportStatus.textContent='실제 색과 보존·목표 표시를 JSON으로 저장했습니다.';
 }catch(error){exportStatus.textContent=error.message}
});
document.querySelector('#export-close').addEventListener('click',()=>exportDialog.close());
for(const field of [titleField,algorithmField,noteField])field.addEventListener('input',makeCard);
document.querySelector('#download-card').addEventListener('click',()=>{if(!cardImage)return;const link=document.createElement('a');link.download=cardFields().title.replace(/[\\/:*?"<>|]/g,'-')+'.png';link.href=cardImage.toDataURL('image/png');link.click();exportStatus.textContent='PNG 이미지를 저장했습니다.'});
document.querySelector('#copy-card').addEventListener('click',async()=>{try{
 if(!navigator.clipboard?.write||typeof ClipboardItem==='undefined')throw Error('unsupported');
 const blob=new Promise((resolve,reject)=>cardImage.toBlob(b=>b?resolve(b):reject(Error('PNG')), 'image/png'));
 await navigator.clipboard.write([new ClipboardItem({'image/png':blob})]);exportStatus.textContent='이미지를 복사했습니다. 원하는 곳에 붙여 넣으세요.';
 }catch{exportStatus.textContent='이 브라우저에서는 그림 복사가 제한됩니다. PNG 저장을 이용해 주세요.'}
});

