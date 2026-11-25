/* Latest t290–292: only independent chapter/zero-claim typography. */
const v112ApprovedRender=v11Render;
v11Render=function(t){v112ApprovedRender(t);const stage=$('#v7-title-stage');if(t<64.5&&stage.style.display!=='none'){stage.querySelectorAll('.v9-type').forEach(e=>{Object.assign(e.style,{fontSize:(parseFloat(e.style.fontSize)*1.18)+'px',fontWeight:'700',color:'#fff',textShadow:'0 3px 20px #7c32582b'});});}window.__filmState={...window.__filmState,version:'v11.2-final',independentTypography:{color:'#ffffff',sizeMultiplier:1.18,fontWeight:700},brandTypographyUnchanged:true};};
renderAt=v11Render;v7Render=v11Render;window.seek=t=>{window.__timelines.main.time(t,true);v11Render(t)};window.ready=Promise.resolve(window.ready).then(()=>{seek(0);return true});
