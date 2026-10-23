const canvas=document.querySelector('#scene');let ctx=canvas.getContext('2d');
const mv=(m,v)=>m.map(r=>r.reduce((s,x,i)=>s+x*v[i],0));
const baseView=(()=>{const a=.48,b=-Math.PI/4,c=Math.cos,s=Math.sin;return [[c(b),0,s(b)],[s(a)*s(b),c(a),-s(a)*c(b)],[-c(a)*s(b),s(a),c(a)*c(b)]]})();
let view=baseView;
const mm=(a,b)=>a.map(r=>b[0].map((_,j)=>r.reduce((sum,x,k)=>sum+x*b[k][j],0)));
function rotation(axis,a){const c=Math.cos(a),s=Math.sin(a);return axis==='x'?[[1,0,0],[0,c,-s],[0,s,c]]:axis==='y'?[[c,0,s],[0,1,0],[-s,0,c]]:[[c,-s,0],[s,c,0],[0,0,1]]}
const definitions=[
 {n:[0,0,1],u:[1,0,0],v:[0,1,0],color:'#e85250'},
 {n:[0,0,-1],u:[-1,0,0],v:[0,1,0],color:'#ff9e40'},
 {n:[1,0,0],u:[0,0,-1],v:[0,1,0],color:'#f5df26'},
 {n:[-1,0,0],u:[0,0,1],v:[0,1,0],color:'#f8fafb'},
 {n:[0,1,0],u:[1,0,0],v:[0,0,-1],color:'#2855e8'},
 {n:[0,-1,0],u:[1,0,0],v:[0,0,1],color:'#50b98d'}];
function solved(){return definitions.flatMap(f=>Array.from({length:9},(_,i)=>({...f,n:[...f.n],u:[...f.u],v:[...f.v],p:f.n.map((n,k)=>1.5*n+f.u[k]*(i%3-1)+f.v[k]*(Math.floor(i/3)-1))})))}
let stickers=solved(),width=1000,height=600,animation=null,active=null,useMask=true;
const queue=[];
function polygon(points,fill,stroke){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke()}}
function label(text,x,y,size){ctx.save();ctx.font=`700 ${size}px system-ui`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineWidth=3;ctx.strokeStyle='#ffffffc0';ctx.strokeText(text,x,y);ctx.fillStyle='#17263e';ctx.fillText(text,x,y);ctx.restore()}
function selected(sticker,axis,layer){if(layer==='all')return true;const p=sticker.p[{x:0,y:1,z:2}[axis]];if(layer==='wide+')return p>-.5;if(layer==='wide-')return p<.5;return layer===0?Math.abs(p)<.5:layer===1?p>.5:p<-.5}
function transformed(){return stickers.map((s,i)=>{if(!active||!active.indices.has(i))return s;const m=rotation(active.axis,active.angle*active.progress);return {...s,p:mv(m,s.p),n:mv(m,s.n),u:mv(m,s.u),v:mv(m,s.v)}})}
function corners(s,half=.48){return [[-half,-half],[half,-half],[half,half],[-half,half]].map(([u,v])=>s.p.map((p,i)=>p+s.u[i]*u+s.v[i]*v))}
function paintStickers(items,project,depth,visible){items.filter(s=>visible(s.n)).sort((a,b)=>depth(a.p)-depth(b.p)).forEach(s=>{
 polygon(corners(s,.5).map(project),'#263141','#263141');
 polygon(corners(s,.455).map(project),useMask&&s.protected===false&&!s.focus?'#171b24':s.color);
})}
function cube(cx,cy,scale,items){
 const project=p=>{const w=mv(view,p);return[cx+w[0]*scale/1.5,cy-w[1]*scale/1.5]};
 paintStickers(items,project,p=>mv(view,p)[2],n=>mv(view,n)[2]>1e-7);
 if(showGuides())for(const [text,n]of[['F',[0,0,1]],['R',[1,0,0]],['U',[0,1,0]]]){const p=mv(view,n);label(text,cx+p[0]*scale,cy-p[1]*scale,scale*.26)}
}
function drawAxes(cx,cy,scale){
 ctx.save();ctx.lineWidth=2;ctx.setLineDash([6,4]);
 for(const [name,axis,color] of [['x',[1,0,0],'#ac6174'],['y',[0,1,0],'#548f7a'],['z',[0,0,1],'#647ea8']]){
  const p=mv(view,axis),dx=p[0]*scale*2.35,dy=-p[1]*scale*2.35;
  ctx.globalAlpha=.72;ctx.strokeStyle=color;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+dx,cy+dy);ctx.stroke();
  ctx.setLineDash([]);const angle=Math.atan2(dy,dx),end=[cx+dx,cy+dy];
  ctx.beginPath();ctx.moveTo(end[0]-7*Math.cos(angle-.45),end[1]-7*Math.sin(angle-.45));ctx.lineTo(...end);ctx.lineTo(end[0]-7*Math.cos(angle+.45),end[1]-7*Math.sin(angle+.45));ctx.stroke();
  ctx.globalAlpha=.95;ctx.fillStyle=color;ctx.font='700 15px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(name,end[0]+12*Math.cos(angle),end[1]+12*Math.sin(angle));ctx.setLineDash([6,4]);
 }
 ctx.restore();
}
function mirror(axis,cx,cy,scale,items){
 // A translated, scaled projection of the opposite face is exactly parallel to it.
 const bases=axis===0?{n:[-1,0,0],u:[0,0,1],v:[0,1,0]}:axis===2?{n:[0,0,-1],u:[-1,0,0],v:[0,1,0]}:{n:[0,-1,0],u:[1,0,0],v:[0,0,1]};
 const projectFrame=(u,v)=>{const p=mv(view,bases.u.map((x,i)=>x*u+bases.v[i]*v));return[cx+p[0]*scale,cy-p[1]*scale]};
 const frame=[[-1,-1],[1,-1],[1,1],[-1,1]].map(([u,v])=>projectFrame(u,v));
 polygon(frame,'#dce8f4','#91a8c3');
 ctx.save();ctx.beginPath();frame.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();ctx.clip();
 const dot=(a,b)=>a.reduce((sum,x,i)=>sum+x*b[i],0);
 const project=p=>projectFrame(dot(p,bases.u)/1.5,dot(p,bases.v)/1.5);
 paintStickers(items,project,p=>-p[axis],n=>n[axis]<-1e-7);
 ctx.restore();
 label(['L','D','B'][axis],cx,cy,scale*.37);
}
function draw(){ctx.clearRect(0,0,width,height);const scale=Math.min(width/7.4,height/6.6),cx=width/2,cy=height*.34,items=transformed();
 if(typeof updateKeyboardColors==='function')updateKeyboardColors();
 if(!drag && returnAnimation===null){mirror(0,cx-2.65*scale,cy,scale,items);
 mirror(2,cx+2.65*scale,cy,scale,items);
 mirror(1,cx,cy+2.8*scale,scale,items);}
 cube(cx,cy,scale,items);
 if(showGuides())drawAxes(cx,cy,scale);
}
function resize(){const r=canvas.getBoundingClientRect(),d=devicePixelRatio||1;width=r.width;height=r.height;canvas.width=Math.round(width*d);canvas.height=Math.round(height*d);ctx.setTransform(d,0,0,d,0,0);draw()}
let drag=null,lookX=0,lookY=0,returnAnimation=null;
const returnToggle=document.querySelector('#return-toggle');
function showGuides(){return returnToggle.checked||(!drag&&returnAnimation===null)}
returnToggle.addEventListener('change',()=>draw());
const transpose=m=>m[0].map((_,i)=>m.map(r=>r[i]));
const orientations=(()=>{const result=[],pending=[[[1,0,0],[0,1,0],[0,0,1]]],seen=new Set();while(pending.length){const m=pending.shift(),key=JSON.stringify(m);if(seen.has(key))continue;seen.add(key);result.push(m);for(const axis of ['x','y'])pending.push(mm(rotation(axis,Math.PI/2),m).map(r=>r.map(v=>Math.round(v)||0)))}return result})();
function nearestOrientation(camera){const relative=mm(transpose(baseView),camera);return orientations.reduce((best,m)=>{const score=m.flat().reduce((s,v,i)=>s+v*relative.flat()[i],0);return score>best.score?{m,score}:best},{m:orientations[0],score:-Infinity}).m}
function quaternion(m){const q=[0,0,0,0],trace=m[0][0]+m[1][1]+m[2][2];if(trace>0){const s=Math.sqrt(trace+1)*2;q[3]=s/4;q[0]=(m[2][1]-m[1][2])/s;q[1]=(m[0][2]-m[2][0])/s;q[2]=(m[1][0]-m[0][1])/s}else{let i=0;if(m[1][1]>m[i][i])i=1;if(m[2][2]>m[i][i])i=2;const j=(i+1)%3,k=(i+2)%3,s=Math.sqrt(1+m[i][i]-m[j][j]-m[k][k])*2;q[i]=s/4;q[3]=(m[k][j]-m[j][k])/s;q[j]=(m[j][i]+m[i][j])/s;q[k]=(m[k][i]+m[i][k])/s}return q}
function interpolateView(a,b,t){const qa=quaternion(a),qb=quaternion(b);let dot=qa.reduce((s,v,i)=>s+v*qb[i],0);if(dot<0){for(let i=0;i<4;i++)qb[i]*=-1;dot=-dot}dot=Math.min(1,dot);let q;if(dot>.9995)q=qa.map((v,i)=>v+(qb[i]-v)*t);else{const angle=Math.acos(dot),s=Math.sin(angle);q=qa.map((v,i)=>(v*Math.sin((1-t)*angle)+qb[i]*Math.sin(t*angle))/s)}const len=Math.hypot(...q);const [x,y,z,w]=q.map(v=>v/len);return [[1-2*(y*y+z*z),2*(x*y-z*w),2*(x*z+y*w)],[2*(x*y+z*w),1-2*(x*x+z*z),2*(y*z-x*w)],[2*(x*z-y*w),2*(y*z+x*w),1-2*(x*x+y*y)]]}
function updateLook(){view=mm(rotation('x',lookX),mm(rotation('y',lookY),baseView));draw()}
function cancelReturn(){if(returnAnimation!==null)cancelAnimationFrame(returnAnimation);returnAnimation=null}
function restoreLook(){
 cancelReturn();const startView=view,start=performance.now(),snap=returnToggle.checked?null:nearestOrientation(view),target=snap?mm(baseView,snap):baseView;
 function frame(now){const t=Math.min(Math.max((now-start)/280,0),1);view=interpolateView(startView,target,1-(1-t)**3);draw();
  if(t<1)returnAnimation=requestAnimationFrame(frame);else{
   if(snap){const apply=v=>mv(snap,v).map(x=>Math.round(x*2)/2||0);stickers=stickers.map(s=>({...s,p:apply(s.p),n:apply(s.n),u:apply(s.u),v:apply(s.v)}))}
   lookX=lookY=0;view=baseView;returnAnimation=null;draw();if(queue.length&&animation===null)playNext();
  }
 }returnAnimation=requestAnimationFrame(frame);
}
canvas.addEventListener('pointerdown',e=>{if((typeof tutorialState!=='undefined'&&tutorialState.active)||e.button!==0||drag||animation!==null||returnAnimation!==null||(typeof practiceRound!=='undefined'&&typeof currentMode!=='undefined'&&currentMode==='practice'&&practiceRound.status==='complete'))return;drag={id:e.pointerId,x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);canvas.classList.add('dragging');draw()});
canvas.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;lookX+=(e.clientY-drag.y)*.008;lookY+=(e.clientX-drag.x)*.008;drag.x=e.clientX;drag.y=e.clientY;updateLook()});
function endDrag(e){if(!drag||e.pointerId!==drag.id)return;const id=drag.id;drag=null;canvas.classList.remove('dragging');if(canvas.hasPointerCapture(id))canvas.releasePointerCapture(id);restoreLook()}
for(const event of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(event,endDrag);
function playNext(){if(!queue.length){active=null;animation=null;return}
 const {axis,angle,layer,onDone,duration=360}=queue.shift(),indices=new Set(stickers.map((s,i)=>selected(s,axis,layer)?i:-1).filter(i=>i>=0)),start=performance.now();
 active={axis,angle,indices,progress:0};
 function frame(now){const t=Math.max(0,Math.min((now-start)/duration,1));active.progress=t*t*(3-2*t);draw();
  if(t<1){animation=requestAnimationFrame(frame);return}
  const m=rotation(axis,angle),snap=v=>mv(m,v).map(x=>Math.round(x*2)/2||0);
  stickers=stickers.map((s,i)=>indices.has(i)?{...s,p:snap(s.p),n:snap(s.n),u:snap(s.u),v:snap(s.v)}:s);
  active=null;draw();if(onDone)onDone();playNext();
 }animation=requestAnimationFrame(frame);
}
function turn(axis,angle,layer='all',onDone=null,duration=360){queue.push({axis,angle,layer,onDone,duration});if(animation===null&&!drag&&returnAnimation===null)playNext()}
const moves={
 R:{axis:'x',sign:-1,layer:1},L:{axis:'x',sign:1,layer:-1},
 U:{axis:'y',sign:-1,layer:1},D:{axis:'y',sign:1,layer:-1},
 F:{axis:'z',sign:-1,layer:1},B:{axis:'z',sign:1,layer:-1},
 r:{axis:'x',sign:-1,layer:'wide+'},l:{axis:'x',sign:1,layer:'wide-'},
 u:{axis:'y',sign:-1,layer:'wide+'},d:{axis:'y',sign:1,layer:'wide-'},
 f:{axis:'z',sign:-1,layer:'wide+'},b:{axis:'z',sign:1,layer:'wide-'},
 M:{axis:'x',sign:1,layer:0},E:{axis:'y',sign:1,layer:0},S:{axis:'z',sign:-1,layer:0},
 x:{axis:'x',sign:-1,layer:'all'},y:{axis:'y',sign:-1,layer:'all'},z:{axis:'z',sign:-1,layer:'all'}
};
function performMove(name,variant,onDone=null,duration=360){const m=moves[name],angle=m.sign*Math.PI/2;
 if(variant==='2'){turn(m.axis,angle,m.layer,null,duration);turn(m.axis,angle,m.layer,onDone,duration)}
 else turn(m.axis,variant==="'"?-angle:angle,m.layer,onDone,duration);
}
const controls=document.querySelector('#rotations');
for(const group of [{title:'바깥층',subtitle:'FACE',names:['R','L','U','D','F','B']},{title:'두 층 회전',subtitle:'WIDE',names:['r','l','u','d','f','b']},{title:'중앙층',subtitle:'SLICE',names:['M','E','S']},{title:'전체 회전',subtitle:'CUBE',names:['x','y','z']}]){
 const card=document.createElement('div');card.className='move-card';
 const heading=document.createElement('h2');heading.textContent=group.title;const subtitle=document.createElement('small');subtitle.textContent=group.subtitle;heading.append(subtitle);card.append(heading);
 for(const name of group.names){const row=document.createElement('div');row.className='move-row';
  for(const variant of ['',"'",'2']){const b=document.createElement('button');b.textContent=name+variant;b.setAttribute('aria-label',`${name+variant} 회전`);b.title=variant==='2'?`${name} → ${name}`:name+variant;b.addEventListener('click',()=>performMove(name,variant));row.append(b)}
  card.append(row);
 }controls.append(card);
}
document.querySelector('#reset').addEventListener('click',()=>{if(animation!==null)cancelAnimationFrame(animation);cancelReturn();drag=null;canvas.classList.remove('dragging');lookX=lookY=0;view=baseView;animation=null;active=null;queue.length=0;stickers=solved();draw()});
new ResizeObserver(resize).observe(canvas);resize();










