/* Bounded v11 visual draft. v10, music, native product internal geometry unchanged; endcard only extends to69.5s. */
const V11_NATIVE_ORDER=['midnight','sakura','duskAmber','sandGold','rouge','mistViolet','white','black'];
const V11_EXCLUDED=['celadon','moss','aurora','deepSea','inkBlue','moonGrey','smoke','liuli','followCover','system','zhuqing'];
const v11Pairs={coral:['#ff5a30','#ffcca3'],pink:['#f72c7a','#ffc0da'],amber:['#ff9d16','#ffe3a1'],violet:['#9b38f2','#efc4ff'],blue:['#19b9ff','#c7f3ff']};
let v11Time=0;
function v11Segment(t){return window.V7_PLAN.segments.find(x=>t>=x.start&&t<x.end)||window.V7_PLAN.segments.at(-1)}
function v11Kind(t){let z=v11Segment(t);return z.type==='title'?window.V7_PLAN.segments[window.V7_PLAN.segments.indexOf(z)+1].type:z.type}
function v11ArtIndex(t){let q=Math.max(0,(t-9)*.9);return q<1.05?5:q<1.85?3:q<2.65?0:4}
/* Fixed pair and direction per chapter, including EQ. Bright blue is NOT blue-gray. */
function v11Pair(t){let k=v11Kind(t);return v11Pairs[k==='appreciation'?'violet':k==='mini'?'amber':['speed','eq','video'].includes(k)?'blue':'coral']}
function v11Gradient(t){let p=v11Pair(t);return `linear-gradient(122deg,${p[0]} 8%,${p[1]} 92%)`}
v10Theme=function(t){return V11_NATIVE_ORDER[Math.floor(Math.max(0,v10Roll(t)-4)+1e-9)%V11_NATIVE_ORDER.length]};
v5Palette=function(){let t=v11Time,k=v11Kind(t),id=k==='intro'?'midnight':k==='mini'||k==='ab'?'duskAmber':k==='speed'||k==='video'?'sakura':k==='eq'?(t<31.2?'sakura':t<33.6?'duskAmber':'rouge'):k==='climax'?v10Theme(t):'mistViolet';if(k==='video'&&t>=46.4){let n=Math.min(7,Math.floor((t-46.4)/5*8));id=V11_NATIVE_ORDER[n]}let p=themeById[id];return {item:{theme:id,name:p.name},from:p,to:p,k:1,colors:p.palette.map(c=>'#'+c.replace(/^#/,''))}};
/* Only existing self-authored warm/purple DIY assets are provisional draft selections.
 Early1200px artwork is reference-only, never enlarged/claimed native4K. Track names stay unchanged. */
const v11CoverSelection=['assets/01-diy-vector.svg','assets/04-diy-vector.svg','assets/01-diy-vector.svg','assets/04-diy-vector.svg','assets/04-diy-vector.svg','assets/01-diy-vector.svg'];
covers.splice(0,6,...v11CoverSelection);window.V7_TRACKS.forEach((x,i)=>{x.cover=covers[i];let card=$('#cover-'+i);if(card)card.querySelectorAll('img').forEach(im=>im.src=covers[i])});
/* Replacement is original procedural demo footage, not a player feature or stock video. */
drawOriginalVideo=function(t){const can=$('#glass-video'),c=can.getContext('2d'),w=can.width,h=can.height;c.reset();const a='#ff684f',b='#ff4388',g=c.createLinearGradient(0,0,w,h);g.addColorStop(0,a);g.addColorStop(1,b);c.fillStyle=g;c.fillRect(0,0,w,h);for(let i=0;i<7;i++){let y=h*(.13+i*.15)+Math.sin(t*1.45+i*.62)*h*.14,flow=Math.sin(t*1.15+i*.49)*w*.13;c.save();c.globalAlpha=.14+i*.018;let q=c.createLinearGradient(0,y,w,y+h*.22);q.addColorStop(0,b);q.addColorStop(1,a);c.fillStyle=q;c.beginPath();c.moveTo(-w*.12,y);c.bezierCurveTo(w*.25+flow,y-h*.36,w*.60-flow,y+h*.38,w*1.12,y-h*.13);c.lineTo(w*1.12,y+h*.10);c.bezierCurveTo(w*.60-flow,y+h*.58,w*.25+flow,y-h*.16,-w*.12,y+h*.23);c.closePath();c.fill();c.restore()}};
const v11Entries=[{t:9,dx:-420,dy:100},{t:14.8,dx:0,dy:0},{t:19.1,dx:-350,dy:90},{t:23.2,dx:350,dy:70},{t:28.8,dx:0,dy:230},{t:38,dx:0,dy:-220}];
function v111MiniPresentation(t){
 const m=$('#mini-window'),u=(a,b)=>{let q=clamp((t-a)/(b-a));return q*q*(3-2*q)},scale=1.65+.9*u(14.8,15.4)-.9*u(16.85,17.55);
 Object.assign(m.style,{left:(960-m.offsetWidth/2)+'px',top:(540-m.offsetHeight/2)+'px',transformOrigin:'50% 50%',transform:`scale(${scale})`});
 const q=(t-14.8)*.9;if(q>1.15&&q<2.1)showCursor(q,point('#mini-window .mini-progress',mix(.2,.6,tween(q,1.25,1.95)),.5),[1.25]);
 window.__filmState={...window.__filmState,miniPresentation:{scale,phase:t<15.4?'centered-enlarge':t<16.85?'large-readable-operation':t<17.55?'centered-shrink':'readable-small-hold',nativeInternalLayoutUnchanged:true,center:[1920,1080],dragOffset:[0,0]}};
}
function v111EndFade(t){
 const u=clamp((t-69)/.5),fade=t>=69.5-1/60-1e-7?0:1-u*u*(3-2*u),text=clamp(t-64.5),textAlpha=text*text*(3-2*text);
 v91End.style.backgroundColor='#000';$('#v91-end-mesh').style.opacity=String(fade);v10EndGrain.style.opacity=String(fade);v91End.querySelector('svg').style.opacity=String(textAlpha*fade);
 window.__filmState={...window.__filmState,endcardFade:[64.5,65.5],fullTextHold:[65.5,69],endcardFadeOut:[69,69.5],endcardWholeFrameOpacity:fade,finalFrameBlackFrom:69.5-1/60};
}
const v11Underlying=v10Render;
function v11Render(t){v11Time=t;v11Underlying(t);let main=$('#main'),entry=v11Entries.find(e=>t>=e.t&&t<e.t+.6);if(t<64.5){$('#v10-stage').style.background=v11Gradient(t);if(v7Seg.type==='title'){main.style.display='none';main.style.visibility='hidden';main.style.opacity=0;}else if(entry){const u=clamp((t-entry.t)/.6),k=u*u*(3-2*u),s=.72+.28*k,dx=entry.dx*(1-k),dy=entry.dy*(1-k);main.style.transform=`translate(${1920*(1-s)+dx}px,${1080*(1-s)+dy}px) scale(${2*s})`;main.style.clipPath='none';main.style.opacity=String(tween(t,entry.t,entry.t+.16));window.__filmState.entry={start:entry.t,end:entry.t+.6,progress:k,uniformScale:s,dx,dy,opacity:main.style.opacity,method:'whole-native-target materializes then travels/scales continuously, no early0.16s wipe'}}else main.style.clipPath='none';}else {$('#v91-end-mesh').style.background=`linear-gradient(122deg,${v11Pairs.coral[0]} 8%,${v11Pairs.coral[1]} 92%)`;v111EndFade(t);}if(t>=14.8&&t<18.1)v111MiniPresentation(t);
window.__filmState={...window.__filmState,version:'v11.1-draft',duration:69.5,stageBaseColors:v11Pair(t),stageColorCount:2,nativeTheme:v5Palette().item.theme,excludedNativeThemes:V11_EXCLUDED,coverSelectionProvisional:true,fullMovieNotRendered:true};}
renderAt=v11Render;v7Render=v11Render;const v11Clock={time:0};window.__timelines.main=gsap.timeline({paused:true}).to(v11Clock,{time:69.5,duration:69.5,ease:'none',onUpdate:()=>v11Render(v11Clock.time)});window.seek=t=>{window.__timelines.main.time(t,true);v11Render(t)};window.ready=Promise.resolve(window.ready).then(()=>{seek(0);return true});
