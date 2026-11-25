/* V9 visual-only refinement. No score, music, or product behavior changes. */
const V9_TYPE_LAYOUTS={
 '沉浸欣赏':[['沉浸',346,296,60,520],['欣赏',330,392,188,700]],
 '小窗播放':[['小窗',1010,318,162,700],['播放',1190,530,65,520]],
 '精确选段':[['精确',360,366,62,520],['选段',680,408,178,700]],
 '变速变调':[['变速',362,298,133,700],['变调',1010,548,133,700]],
 '精细调音':[['精细',370,504,62,520],['调音',970,346,182,700]],
 '画面与字幕':[['画面',352,304,119,650],['与',873,475,49,450],['字幕',1030,514,157,700]]
};
function v9Type(stage,z,q){
 const h=stage.querySelector('h1'),a=tween(q,0,.08)*(1-tween(q,z.duration-.07,z.duration));
 stage.classList.remove('claim');h.style.cssText='opacity:1;transform:none;position:absolute;inset:0;display:block;width:1920px;height:1080px';
 h.innerHTML=(V9_TYPE_LAYOUTS[z.text]||[[z.text,400,430,120,650]]).map((v,i)=>{
  const k=tween(q,.025+i*.07,.19+i*.07),exit=tween(q,z.duration-.11,z.duration);
  return `<span class="v9-type" style="left:${v[1]}px;top:${v[2]}px;font-size:${v[3]}px;font-weight:${v[4]};letter-spacing:${v[3]>100?'-.045em':'-.015em'};opacity:${a};transform:translate(${(1-k)*(i%2?-28:28)}px,${(1-k)*14-exit*9}px)">${v[0]}</span>`;
 }).join('');
}
const v9OldClimax=v7Climax;
function v9Bezier(a,b,c,d,u){const w=1-u;return w*w*w*a+3*w*w*u*b+3*w*u*u*c+u*u*u*d;}
v7Climax=function(q,d){
 v9OldClimax(q,d); // reuse the established original bat, nine cards, and native complete UI.
 const main=$('#main'),stage=$('#v7-title-stage'),root=$('#v8-annoyances'),h=stage.querySelector('h1');
 const claim=q<1.65,ui=q>=8.0,contact=q>=5.25&&q<5.35;
 Object.assign(main.style,{display:ui?'block':'none',opacity:ui?'1':'0',visibility:ui?'visible':'hidden'});
 Object.assign(stage.style,{display:ui?'none':'flex',background:v7Gradient(themeById.zhuqing.palette,contact?56.65:v7Time,false)});
 stage.classList.remove('claim');root.style.display=claim||ui?'none':'block';root.style.transform='none';
 h.style.cssText='opacity:0;transform:none;position:absolute;inset:0;width:1920px;height:1080px;display:block';
 if(claim){
  h.style.opacity=1;const fade=1-tween(q,1.55,1.65);
  h.innerHTML=['0广告','0社交','0打扰'].map((text,i)=>{
   const k=tween(q,.04+i*.15,.16+i*.15),left=[262,783,1304][i];
   return `<span class="v9-type" style="left:${left}px;top:${365+i*62}px;font-size:106px;font-weight:700;letter-spacing:-.045em;opacity:${k*fade};transform:translateY(${(1-k)*25}px)">${text}${i<2?' · ':''}</span>`;
  }).join('');
 }else h.innerHTML='';
 const xs=[-495,-10,460,-565,0,535,-465,20,490],ys=[-245,-290,-225,-12,-15,28,230,245,222],starts=[0,.29,.55,.78,.98,1.16,1.33,1.49,1.63];
 const gather=tween(q,4.60,5.12),cq=q-1.65,shake=q>=5.35&&q<5.57?11*Math.sin((q-5.35)*91)*Math.exp(-(q-5.35)*14):0;
 root.style.transform=`translate(${shake}px,${shake*.35}px)`;
 const cards=root.querySelectorAll('.nuisance');cards.forEach((e,i)=>{
  const born=tween(cq,starts[i],starts[i]+.10),age=Math.max(0,(contact?5.25:q)-1.65-starts[i]),pressure=(.5+.5*Math.cos(age*11+i))*(1-gather),flightStart=5.35+i*.012,flightEnd=5.75+i*.125,u=clamp((q-flightStart)/(flightEnd-flightStart));
  let x=mix(xs[i],-20+i*5,gather),y=mix(ys[i],20+i*3,gather),spin=(i-4)*2*(1-gather),sc=(.90+.16*born+.07*pressure),alpha=born;
  if(q<5.25){x+=(Math.floor(age*3.7+i)%2?9:-9)*(1-gather);y+=Math.sin(age*7+i)*3*(1-gather);if(i===2)spin+=Math.sin(age*15)*7*(1-gather);}
  if(q>=flightStart){
   x=v9Bezier(x,x+340+(i%3-1)*150,570+(i%2?-280:210),570,u);
   y=v9Bezier(y,y-450-i*15,290-390-i*17,290,u);
   spin+=(i%2?1:-1)*(430+i*80)*u;sc*=1-.95*Math.pow(u,.65);alpha*=1-tween(u,.90,1);
  }
  e.style.opacity=claim?'0':String(alpha);e.style.transform=`translate(${x}px,${y}px) rotate(${spin}deg) scale(${sc})`;
  e.style.zIndex=String(10+i+(Math.floor(age*3+i)%3)*4);
  e.querySelector('.escaping-close').style.transform=`translate(${Math.floor(age*4+i)%2?38:-12}px,${Math.floor(age*3+i)%2?10:-5}px)`;
  e.querySelector('.nag-progress').style.width=(18+((age*.55+i*.13)%1)*80)+'%';
  const detail=e.querySelector('.nuisance-detail');
  if(i===0)detail.textContent='必须更新 · '+Math.max(1,9-Math.floor(age))+' 秒';
  if(i===1)detail.textContent='跳过需等待 '+Math.max(1,5-Math.floor(age%4))+' 秒';
  if(i===3)detail.textContent='关闭后再次弹出';
  if(i===4)detail.textContent='立即借款';
  if(i===5)detail.textContent=age<1.4?'自动扣费 ¥68':'已扣费 ¥98';
  if(i===6)detail.textContent=age<1.0?'还差 1 积分':'差一点，再来一次';
  if(i===7)detail.textContent='连续任务 · 还差 1 天';
  if(i===8)detail.textContent=age<1?'优惠 ¥39 → 结算 ¥59':'优惠 ¥39 → 结算 ¥79';
 });
 let bin=root.querySelector('.v8-bin');bin.style.opacity='1';bin.querySelector('.bin-filled').style.opacity=q>=6.75?'1':'0';bin.style.transform=`translate(570px,290px) rotate(${q>5.7&&q<6.75?Math.sin(q*43)*1.5:0}deg)`;
 let lid=bin.querySelector('.v9-bin-lid');if(!lid){lid=document.createElement('div');lid.className='v9-bin-lid';bin.appendChild(lid);}lid.style.opacity=q>=7.25?'1':'0';lid.style.transform=`translateY(${-28*(1-tween(q,7.25,7.38))}px) rotate(${-48*(1-tween(q,7.25,7.38))}deg)`;
 const bat=root.querySelector('.baseball-bat'),wind=tween(q,4.05,5.10),swing=Math.pow(clamp((q-5.10)/.15),2.6),follow=tween(q,5.35,5.59),angle=q<5.25?-24-130*wind+154*swing:q<5.35?0:132*follow;
 bat.style.opacity=tween(q,4.05,4.13)*(1-tween(q,5.64,5.83));bat.style.transform=`translate(-700px,10px) rotate(${angle}deg)`;
 const flare=root.querySelector('.contact-flare');flare.style.opacity=contact?'1':'0';flare.style.transform='translate(-15px,30px) scale(1.65)';
 let shadow=stage.querySelector('.v9-mass-shadow');if(!shadow){shadow=document.createElement('div');shadow.className='v9-mass-shadow';stage.appendChild(shadow);}shadow.style.display=q>=7.25&&!ui?'block':'none';shadow.style.opacity=String(.14+.5*tween(q,7.25,8.2));shadow.style.transform=`scale(${.7+.3*tween(q,7.25,8.2)})`;
 if(ui){
  let g=geometry(),u=clamp((q-8.0)/.20),after=q-8.2,moveAfter=Math.max(0,after-.10),dy=-1180*(1-Math.pow(u,1.35)),hitShake=after>=.10&&after<.34?12*Math.sin((after-.10)*86)*Math.exp(-(after-.10)*15):0;
  const zoom=1+.06*tween(moveAfter,0,2.30)+.23*tween(q,10.6,11);
  main.style.transform=`translate(${1920*(1-zoom)+hitShake*.38}px,${1080*(1-zoom)+hitShake}px) scale(${2*zoom})`;main.style.opacity=1-tween(q,10.6,11);
  if(after>=0&&after<.10)main.style.background=v7Gradient(themeById.zhuqing.palette,59.6,false);
  const app=$('#app');Object.assign(app.style,{opacity:1,clipPath:'none',left:g.x+'px',top:(g.y+dy)+'px',width:g.w+'px',height:g.h+'px',transform:`scale(${g.scale})`,boxShadow:after>=0?`0 ${16+10*Math.exp(-moveAfter*5)}px ${38+15*tween(moveAfter,0,.5)}px #16383f88`:'0 45px 70px #12343b55'});
  ['#ambient','#vignette','#tabs','#theme-button','#eq-entry','#playbar','#now-pill','#progress-track','#volume','#repeat','#previous','#next'].forEach(sel=>$(sel).style.opacity=1);
  $('#playbar').style.clipPath='none';$('#playbar').style.top=(g.h-82)+'px';$('#playbar').style.transform='translateX(-50%)';$('#carousel').style.opacity=1;$('#carousel').style.transform='none';layoutCards(2,g,4+1.65*tween(moveAfter,0,2.7),1);
  $('#traffic').style.opacity=1;$('#traffic').style.top=(g.y+15*g.scale+dy)+'px';$('#cursor').style.opacity=0;$('#click-ring').style.opacity=0;
  ['#mini-window','#morph-art','#eq-panel','#loop-panel','#speed-panel','#headphone-panel','#playlist-panel','#original-video-stage'].forEach(sel=>$(sel).style.opacity=0);$('#appreciation-v7').style.display='none';
 }
 return {tailPhase:claim?'zero-claim-before-cards':q<4.05?'oppressive-nine-cards':q<5.25?'baseball-loaded-windup':contact?'contact-freeze':q<6.75?'hard-hit-nine-cards-into-bin':q<7.25?'filled-bin-hold':q<8?'overhead-weight-anticipation':q<8.2?'fast-heavy-whole-player-fall':q<10.6?'whole-product-dynamic-rise':'zoom-fade-to-future-outro',claimRange:[51.4,53.05],cardsFirstVisible:53.05,baseballContactTime:56.65,contactFreezeSeconds:.1,allCardsInTrashAt:58.15,trashHoldSeconds:.5,productFall:[59.4,59.6],productImpact:59.6,productImpactFreezeSeconds:.1,finalWindowIsComplete:true};
};
const v9BaseRender=v7Render;
v7Render=function(t){v9BaseRender(t);const z=v7Seg,q=clamp(t-z.start,0,z.duration);if(z.type!=='climax'){let n=$('#v8-annoyances');if(n)n.style.display='none';let shadow=$('.v9-mass-shadow');if(shadow)shadow.style.display='none';}if(z.type==='title')v9Type($('#v7-title-stage'),z,q);window.__filmState.actualV9Time=t;window.__filmState.visualOnly=true;window.__filmState.v9Typography=z.type==='title'?z.text:null;window.__filmState.claimsBeforeNuisances=true;};
renderAt=v7Render;
