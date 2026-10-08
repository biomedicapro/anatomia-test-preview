import {toggle,revealNext,setPage} from './study-core.mjs';
const $=id=>document.getElementById(id);
let pages, pageIndex=0, revealed=new Set(), zoom=100;
function announce(message){$('announcement').textContent=message;}
function setZoom(value){zoom=Math.max(100,Math.min(200,value));const canvas=$('canvas');canvas.style.width=`${zoom}%`;$('zoom-value').textContent=`${zoom}%`;$('zoom-out').disabled=zoom===100;$('zoom-in').disabled=zoom===200;updateFont();}
function updateFont(){const width=$('canvas').getBoundingClientRect().width;$('canvas').style.setProperty('--label-font',`${width/595*10.5}px`);}
function revealLabel(label){revealed=toggle(revealed,label.id);render();announce(revealed.has(label.id)?`Estructura ${label.id}: ${label.name}`:`Estructura ${label.id} oculta.`);}
function render(){
 const page=pages[pageIndex];
 $('specimen').src=page.image;$('specimen').alt=`Espécimen de la lámina ${page.page}, con flechas que señalan estructuras por identificar.`;
 $('panel-title').textContent=`Lámina 0${page.page}`;
 pages.forEach((_,i)=>{$(`tab-${i}`).classList.toggle('active',i===pageIndex);$(`tab-${i}`).setAttribute('aria-pressed',i===pageIndex);});
 $('labels').replaceChildren();$('answer-list').replaceChildren();
 for(const label of page.labels){
  const show=revealed.has(label.id),[x0,y0,x1,y1]=label.bbox;
  const overlay=document.createElement('button');overlay.className=`label${show?' revealed':''}`;
  Object.assign(overlay.style,{left:`${x0/page.width*100}%`,top:`${y0/page.height*100}%`,width:`${(x1-x0)/page.width*100}%`,height:`${(y1-y0)/page.height*100}%`});
  overlay.setAttribute('aria-label',show?`Ocultar ${label.name}`:`Revelar estructura ${label.id}`);overlay.setAttribute('aria-pressed',show);
  if(show)overlay.textContent=label.name;else{const badge=document.createElement('span');badge.className='number';badge.textContent=label.id;overlay.append(badge);}
  overlay.addEventListener('click',()=>revealLabel(label));$('labels').append(overlay);
  const row=document.createElement('button');row.className=`answer-row${show?' revealed':''}`;row.setAttribute('aria-pressed',show);row.setAttribute('aria-label',show?`Ocultar ${label.name}`:`Revelar estructura ${label.id}`);
  const badge=document.createElement('span');badge.className='badge';badge.textContent=label.id;
  const name=document.createElement('span');name.textContent=show?label.name:`Estructura ${label.id}`;row.append(badge,name);row.addEventListener('click',()=>revealLabel(label));$('answer-list').append(row);
 }
 const count=page.labels.filter(item=>revealed.has(item.id)).length;
 $('page-progress').textContent=`${count} de ${page.labels.length} revelados`;
 $('total-count').innerHTML=`${revealed.size} <span>/ 8</span>`;$('meter').style.width=`${revealed.size/8*100}%`;
 $('next').disabled=count===page.labels.length;$('next').innerHTML=count===page.labels.length?'Lámina completada ✓':'Revelar siguiente <span aria-hidden="true">↗</span>';
 $('hide-page').disabled=count===0;$('show-page').disabled=count===page.labels.length;updateFont();
}
function changePage(index){pageIndex=Math.max(0,Math.min(pages.length-1,index));render();$('image-scroll').scrollLeft=0;announce(`Lámina ${pageIndex+1}.`);}
function next(){const result=revealNext(revealed,pages[pageIndex].labels);revealed=result.revealed;render();if(result.label)announce(`Estructura ${result.label.id}: ${result.label.name}`);}
async function init(){
 const response=await fetch('data.json');if(!response.ok)throw new Error('No se pudieron cargar las láminas.');pages=await response.json();
 $('tab-0').addEventListener('click',()=>changePage(0));$('tab-1').addEventListener('click',()=>changePage(1));$('next').addEventListener('click',next);
 $('hide-page').addEventListener('click',()=>{revealed=setPage(revealed,pages[pageIndex].labels,false);render();announce('Nombres de esta lámina ocultos.');});
 $('show-page').addEventListener('click',()=>{revealed=setPage(revealed,pages[pageIndex].labels,true);render();announce('Todos los nombres de esta lámina visibles.');});
 $('reset').addEventListener('click',()=>{revealed=new Set();render();announce('Las ocho estructuras están ocultas.');});
 $('zoom-out').addEventListener('click',()=>setZoom(zoom-25));$('zoom-in').addEventListener('click',()=>setZoom(zoom+25));
 document.addEventListener('keydown',event=>{if(event.altKey||event.ctrlKey||event.metaKey||event.repeat||event.target.closest('button,a,input,textarea,select'))return;if(event.code==='Space'){event.preventDefault();next();}else if(event.key==='ArrowRight'){event.preventDefault();changePage(pageIndex+1);}else if(event.key==='ArrowLeft'){event.preventDefault();changePage(pageIndex-1);}else if(event.key.toLowerCase()==='h'){revealed=setPage(revealed,pages[pageIndex].labels,false);render();announce('Nombres de esta lámina ocultos.');}});
 new ResizeObserver(updateFont).observe($('canvas'));render();setZoom(100);
}
init().catch(error=>{$('panel-title').textContent='No se pudo cargar';$('panel-title').after(Object.assign(document.createElement('p'),{textContent:'Recarga la página para volver a intentarlo.'}));$('next').disabled=true;console.error(error);});
