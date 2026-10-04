const menu=document.querySelector('.menu');menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));document.querySelector('#menu').classList.toggle('open',open)});document.querySelectorAll('nav a').forEach(a=>a.addEventListener('click',()=>{menu.setAttribute('aria-expanded','false');document.querySelector('#menu').classList.remove('open')}));
const entrada=document.querySelector('#entrada'),saida=document.querySelector('#saida');const today=new Date();const localDate=new Date(today.getTime()-today.getTimezoneOffset()*60000).toISOString().slice(0,10);entrada.min=localDate;saida.min=localDate;entrada.addEventListener('change',()=>{if(entrada.value){let d=new Date(entrada.value+'T12:00:00');d.setDate(d.getDate()+1);const next=new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10);saida.min=next;if(saida.value&&saida.value<next)saida.value=''}});
const formatDate=s=>s.split('-').reverse().join('/');document.querySelector('#reservation').addEventListener('submit',e=>{e.preventDefault();const error=document.querySelector('#error');error.textContent='';if(entrada.value<localDate||saida.value<=entrada.value){error.textContent='Escolha uma saída posterior à entrada e datas a partir de hoje.';return}const hora=document.querySelector('#hora').value;const text=`Olá! Gostaria de consultar disponibilidade nas Suítes Caminho da Praia.\nEntrada: ${formatDate(entrada.value)}\nSaída: ${formatDate(saida.value)}\n${hora?'Horário previsto de chegada: '+hora+'\n':''}Adultos: ${document.querySelector('#adultos').value}\nCrianças: ${document.querySelector('#criancas').value}`;window.location.href='https://wa.me/5522999284179?text='+encodeURIComponent(text)});
const dialog=document.querySelector('#lightbox');document.querySelectorAll('.zoom').forEach(b=>b.addEventListener('click',()=>{dialog.querySelector('img').src=b.dataset.image;dialog.querySelector('img').alt=b.dataset.caption;dialog.querySelector('p').textContent=b.dataset.caption;dialog.showModal()}));document.querySelector('#close').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
// Content stays visible if animation support or JavaScript is unavailable.
const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
if('IntersectionObserver' in window&&!reduceMotion.matches){
 const targets=document.querySelectorAll('.section-intro,.benefits>h2,.benefit-grid article,.rooms figure,.terrace-grid .zoom,.booking,.destination-inner>div,.destination-inner>figure,.final-cta,.location>div');
 const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}}),{threshold:.08,rootMargin:'0px 0px -25px 0px'});
 targets.forEach((element,i)=>{element.classList.add('reveal');element.style.setProperty('--delay',element.closest('.benefit-grid')?`${i%4*65}ms`:'0ms');observer.observe(element)});
 document.documentElement.classList.add('motion-ready');
 reduceMotion.addEventListener('change',e=>{if(e.matches){document.documentElement.classList.remove('motion-ready');observer.disconnect()}});
}

// Accommodation galleries: classification comes from the reviewed originals.
// Never infer suite numbers, merge groups, or display ac-unidentified-data.
(()=>{
 const source=document.querySelector('#ac-accommodations-data');if(!source)return;
 const acomodacoes=JSON.parse(source.textContent);
 const naoIdentificadas=JSON.parse(document.querySelector('#ac-unidentified-data').textContent);
 // Future maintenance: edit only the appropriate imagens array in the model.
 // naoIdentificadas stays separate until a photo can be confirmed visually.
 acomodacoes.forEach(acomodacao=>{
  const article=document.querySelector(`[data-ac-id="${acomodacao.id}"]`);if(!article)return;
  article.querySelector('h3').textContent=acomodacao.tipo;
  article.querySelector('.ac-config span').textContent=acomodacao.configuracao;
  article.querySelector('.ac-capacity strong').textContent=acomodacao.capacidade;
  const gallery=article.querySelector('.ac-gallery'),track=gallery.querySelector('.ac-gallery-track');
  const fragment=document.createDocumentFragment();
  (acomodacao.imagens||[]).forEach((foto,i)=>{
   const src=typeof foto==='string'?foto:foto.src;if(!src)return;
   const alt=typeof foto==='string'?`${acomodacao.tipo} — foto ${i+1}`:(foto.alt||`${acomodacao.tipo} — foto ${i+1}`);
   const slide=document.createElement('div');slide.className='ac-gallery-slide';slide.setAttribute('role','group');slide.setAttribute('aria-roledescription','slide');slide.setAttribute('aria-label',`${i+1} de ${acomodacao.imagens.length}`);
   const button=document.createElement('button');button.type='button';button.className='ac-image-button zoom';button.setAttribute('aria-label',`Ampliar foto ${i+1}`);
   const img=document.createElement('img');img.src=src;img.alt=alt;img.loading='lazy';img.decoding='async';
   if(foto.width)img.width=foto.width;if(foto.height)img.height=foto.height;
   button.append(img);slide.append(button);fragment.append(slide);
   // Keep native swiping from also opening the enlarged image on touch-up.
   let startX=0,startY=0,dragged=false;
   button.addEventListener('pointerdown',event=>{startX=event.clientX;startY=event.clientY;dragged=false});
   button.addEventListener('pointermove',event=>{if(Math.abs(event.clientX-startX)>10||Math.abs(event.clientY-startY)>10)dragged=true},{passive:true});
   button.addEventListener('pointercancel',()=>{dragged=true});
   button.addEventListener('click',()=>{if(dragged){dragged=false;return}dialog.querySelector('img').src=src;dialog.querySelector('img').alt=alt;dialog.querySelector('p').textContent=alt;dialog.showModal()});
  });
  track.replaceChildren(fragment);
  const slides=Array.from(track.children),prev=gallery.querySelector('.ac-prev'),next=gallery.querySelector('.ac-next');
  const counter=gallery.querySelector('.ac-gallery-counter'),progress=gallery.querySelector('.ac-gallery-progress span');
  let current=0,frame=0,target=0,navigating=false;
  const behavior=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth';
  const update=()=>{
   if(!slides.length){counter.textContent='0 / 0';prev.disabled=true;next.disabled=true;gallery.hidden=true;return}
   const width=track.clientWidth;if(!width)return;
   const index=Math.max(0,Math.min(slides.length-1,Math.round(track.scrollLeft/width)));
   current=index;if(Math.abs(track.scrollLeft-target*width)<2)navigating=false;
   const text=`${index+1} / ${slides.length}`;if(counter.textContent!==text)counter.textContent=text;
   prev.disabled=index===0;next.disabled=index===slides.length-1;
   progress.style.width=`${((index+1)/slides.length)*100}%`;
  };
  const goTo=index=>{target=Math.max(0,Math.min(slides.length-1,index));navigating=true;track.scrollTo({left:target*track.clientWidth,behavior:behavior()})};
  prev.addEventListener('click',()=>goTo((navigating?target:current)-1));next.addEventListener('click',()=>goTo((navigating?target:current)+1));
  track.addEventListener('pointerdown',()=>{navigating=false},{passive:true});
  track.addEventListener('scroll',()=>{if(frame)cancelAnimationFrame(frame);frame=requestAnimationFrame(update)},{passive:true});
  track.addEventListener('scrollend',()=>{navigating=false;update()},{passive:true});
  track.addEventListener('keydown',event=>{const index=navigating?target:current;if(event.key==='ArrowLeft'){event.preventDefault();goTo(index-1)}if(event.key==='ArrowRight'){event.preventDefault();goTo(index+1)}if(event.key==='Home'){event.preventDefault();goTo(0)}if(event.key==='End'){event.preventDefault();goTo(slides.length-1)}});
  const realign=()=>{navigating=false;target=current;track.scrollTo({left:current*track.clientWidth,behavior:'auto'});update()};
  if('ResizeObserver' in window)new ResizeObserver(realign).observe(track);else window.addEventListener('resize',realign);
  update();
 });
})();
