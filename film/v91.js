/* v9.1 draft only: centering + continuously accelerating final card scroll.
 No music actions, no new final-card design or new duration locked. */
const v91OriginalMini=v7Mini;
v7Mini=function(q,d){
 const x=v91OriginalMini(q,d),m=document.querySelector('#mini-window');
 m.style.transform='scale(1.0666666667)';
 if(q>1.15&&q<2.1)showCursor(q,point('#mini-window .mini-progress',mix(.2,.6,tween(q,1.25,1.95)),.5),[1.25]);
 return {...x,miniDragOffset:[0,0],miniStageCentered:true};
};
const v91OriginalTail=v7Climax;
v7Climax=function(q,d){
 const x=v91OriginalTail(q,d);
 if(q>=8.3){
  const rollDuration=Math.max(.1,d-8.3),u=clamp((q-8.3)/rollDuration),cur=4+8*Math.pow(u,2.6);
  layoutCards(2,geometry(),cur,1);
  return {...x,tailCarouselPosition:cur,tailCarouselSpeed:8*2.6/rollDuration*Math.pow(u,1.6),tailCarouselAcceleration:'positive until fade endpoint',brandOutroPending:true};
 }
 return {...x,brandOutroPending:true};
};

/* Position audit t227: final panel transforms must precede pointer anchoring.
 Product geometry, values, clicks, timing and native layout are untouched. */
const v91BeforePointerAlignment=v7Render;
v7Render=function(t){
 v91BeforePointerAlignment(t);
 const z=v7Seg,opq=Math.min((v7Time-z.start)*.9,(z.sourceDuration||100)-.001);let target=null;
 if(z.type==='speed'){
  const q=Math.min(opq,3.62)*1.05,s=100+25*tween(q,.20,.62)-45*tween(q,.82,1.20)+20*tween(q,1.40,1.70),k=(s/100-.5)/1.5;
  target=q<1.8?['#speed-slider',k,.5]:q<2.5?['#pitch-plus',.5,.5]:q<3.2?['#speed-panel .param-row:nth-child(2)>button:nth-of-type(1)',.5,.5]:['#speed-panel .chip',.5,.5];
 }
 if(z.type==='ab'){
  const q=filmT,drawing=tween(q,10.64,10.98);
  if(q>=10.44&&q<10.62)target=['#set-loop-a',.5,.5];
  else if(q>=10.64&&q<11.04)target=['#progress-track',mix(.4,18.2/30,drawing),.5];
  else if(q>=11.06&&q<11.3)target=['#loop-panel button:nth-of-type(4)',.5,.5];
  else if(q>=11.3&&q<11.48)target=['#seam-toggle',.5,.5];
 }
 if(target&&Number($('#cursor').style.opacity)>.01){
  const [x,y]=point(target[0],target[1],target[2]),ring=$('#click-ring'),scale=ring.style.transform.match(/scale\(([^)]+)\)/)?.[1]||'1.4';
  $('#cursor').style.transform=`translate(${x}px,${y}px) scale(.92)`;
  ring.style.transform=`translate(${x-20}px,${y-20}px) scale(${scale})`;
  window.__filmState.pointerFinalAnchor=target[0];
 }
};
renderAt=v7Render;

/* Selected option02, native vector/gradient repaint. Locked 65.4s visual only. */
const v91EndStyle=document.createElement('style');v91EndStyle.textContent=`
@font-face{font-family:V91End;src:url('assets/fonts/Pretendard-Light.otf');font-weight:300;font-display:block}
#v91-endcard{position:fixed;inset:0;width:3840px;height:2160px;overflow:hidden;z-index:99999;display:none;background:#cce0d9}
#v91-end-mesh{position:absolute;inset:-2%;background:radial-gradient(ellipse at 2% 10%,#ffa49a 0%,#ffb7a6 22%,transparent 53%),radial-gradient(ellipse at 50% 13%,#fce5b4 0%,transparent 42%),radial-gradient(ellipse at 12% 105%,#ee9ca8 0%,transparent 40%),radial-gradient(ellipse at 92% 92%,#85d6df 0%,#b3e1df 29%,transparent 60%),radial-gradient(ellipse at 41% 78%,#ecd5bd 0%,transparent 42%),linear-gradient(114deg,#f3b9aa,#e0e4c7 56%,#b7dce0)}
#v91-endcard svg{position:absolute;inset:0;width:3840px;height:2160px;overflow:visible}
#v91-endcard text{font-family:V91End;font-weight:300;font-size:220px;fill:white;font-kerning:none;filter:drop-shadow(0 0 36px #281c186b)}
`;document.head.append(v91EndStyle);
const v91End=document.createElement('section');v91End.id='v91-endcard';v91End.innerHTML='<div id="v91-end-mesh"></div><svg viewBox="0 0 3840 2160" aria-label="TANCO STUDIO"><text><tspan x="914.1953125" y="1157.5">T</tspan><tspan x="1086.3203125" y="1157.5">A</tspan><tspan x="1264.0390625" y="1157.5">N</tspan><tspan x="1462.6015625" y="1157.5">C</tspan><tspan x="1654.2890625" y="1157.5">O</tspan><tspan x="1852.8515625" y="1157.5"> </tspan><tspan x="1945.9140625" y="1157.5">S</tspan><tspan x="2117.3984375" y="1157.5">T</tspan><tspan x="2289.5234375" y="1157.5">U</tspan><tspan x="2485.0703125" y="1157.5">D</tspan><tspan x="2675.0390625" y="1157.5">I</tspan><tspan x="2767.2421875" y="1157.5">O</tspan></text></svg>';document.body.append(v91End);
const v91BeforeEndcard=v7Render;
v7Render=function(t){
 if(t<62.4){v91End.style.display='none';v91BeforeEndcard(t);return;}
 v91BeforeEndcard(62.399999);$('#main').style.display='none';$('#main').style.visibility='hidden';$('#main').style.opacity=0;$('#v7-title-stage').style.display='none';
 v91End.style.display='block';const q=Math.max(0,t-62.4),u=Math.min(1,q);v91End.querySelector('svg').style.opacity=u*u*(3-2*u);
 const s=Math.sin(q*.65);$('#v91-end-mesh').style.transform=`translate(${s*7}px,${(Math.cos(q*.5)-1)*4}px) scale(${1+q*.0007})`;
 window.__filmState={...window.__filmState,chapter:'TANCO STUDIO',titleOnly:true,uiVisible:false,endcardTextOpacity:u*u*(3-2*u),duration:65.4,endcardFade:[62.4,63.4],fullTextHold:[63.4,65.4],nativeGradient:true};
};renderAt=v7Render;
const v91CompleteClock={time:0};window.__timelines.main=gsap.timeline({paused:true}).to(v91CompleteClock,{time:65.4,duration:65.4,ease:'none',onUpdate:()=>v7Render(v91CompleteClock.time)});
window.seek=t=>{window.__timelines.main.time(t,true);v7Render(t)};
window.ready=Promise.resolve(window.ready).then(()=>document.fonts.load('300 220px V91End')).then(()=>{seek(0);return true});
