'use client';
import {useEffect,useRef} from 'react';

// Progressive enhancement: content stays readable without JavaScript or animation support.
export default function Motion({scene}:{scene:string}){
 const progress=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const precise=matchMedia('(hover: hover) and (pointer: fine)');
  const animations=new Set<Animation>();
  let frame=0;
  const animate=(element:HTMLElement,frames:Keyframe[],duration:number,delay=0)=>{
   if(reduced.matches||typeof element.animate!=='function')return;
   const animation=element.animate(frames,{duration,delay,easing:'cubic-bezier(.2,.75,.25,1)',fill:'backwards'});
   animations.add(animation);animation.onfinish=()=>animations.delete(animation);
  };
  const update=()=>{frame=0;const height=document.documentElement.scrollHeight-innerHeight;const fraction=height>0?Math.min(1,Math.max(0,scrollY/height)):0;if(progress.current)progress.current.style.transform=`scaleX(${fraction})`;document.querySelector('header')?.classList.toggle('is-scrolled',scrollY>25)};
  const scroll=()=>{if(!frame)frame=requestAnimationFrame(update)};update();
  addEventListener('scroll',scroll,{passive:true});addEventListener('resize',scroll);
  const observer=new IntersectionObserver(entries=>{
   entries.forEach((entry)=>{
    const el=entry.target as HTMLElement;if(!entry.isIntersecting)return;
    observer.unobserve(el);if(el.dataset.motionSeen)return;el.dataset.motionSeen='true';
    if(el.matches('.photo,.craft-image,.about-image')){
     animate(el,[{clipPath:'inset(10% 0 10% 0)',opacity:.35},{clipPath:'inset(0% 0 0% 0)',opacity:1}],850);
     const img=el.querySelector('img');if(img)animate(img,[{transform:'scale(1.12)'},{transform:'scale(1)'}],1100);
    }else if(el.matches('.contact-grid form')){
     animate(el,[{opacity:.3,transform:'translateY(32px)'},{opacity:1,transform:'translateY(0)'}],700);
     el.querySelectorAll<HTMLElement>('label:not(.honeypot),.button').forEach((field,i)=>animate(field,[{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],450,Math.min(i*45,320)));
    }else{
     const sibling=Array.from(el.parentElement?.children||[]).indexOf(el);
     animate(el,[{opacity:0,transform:'translateY(24px)',filter:'blur(3px)'},{opacity:1,transform:'translateY(0)',filter:'blur(0px)'}],650,Math.min(Math.max(sibling,0)*55,180));
    }
   });
  },{threshold:.12,rootMargin:'0px 0px -20px 0px'});
  document.querySelectorAll<HTMLElement>('h1,h2,.page-intro>.eyebrow,.page-intro>p,.hero-content>p,.hero-content>.button,.photo,.craft-image,.about-image,.number,.principle,.area-list>a,blockquote,.contact-grid form,.contact-grid aside,.project-info>div,.materials>div').forEach(el=>observer.observe(el));
  const cards=Array.from(document.querySelectorAll<HTMLElement>('.project-card'));
  const surfaces=Array.from(document.querySelectorAll<HTMLElement>('.contact-grid form,.cta'));
  const tracking=new Map<HTMLElement,number>();
  const move=(event:PointerEvent)=>{
   if(!precise.matches||reduced.matches)return;
   const el=event.currentTarget as HTMLElement;const rect=el.getBoundingClientRect();
   const x=(event.clientX-rect.left)/rect.width,y=(event.clientY-rect.top)/rect.height;
   if(tracking.has(el))cancelAnimationFrame(tracking.get(el)!);
   tracking.set(el,requestAnimationFrame(()=>{
    tracking.delete(el);el.style.setProperty('--pointer-x',`${x*100}%`);el.style.setProperty('--pointer-y',`${y*100}%`);
    el.style.setProperty('--tilt-x',`${(0.5-y)*2}deg`);el.style.setProperty('--tilt-y',`${(x-0.5)*2}deg`);
   }));
  };
  const reset=(event:PointerEvent)=>{const el=event.currentTarget as HTMLElement;const f=tracking.get(el);if(f)cancelAnimationFrame(f);tracking.delete(el);el.style.setProperty('--tilt-x','0deg');el.style.setProperty('--tilt-y','0deg')};
  [...cards,...surfaces].forEach(el=>{el.addEventListener('pointermove',move,{passive:true});el.addEventListener('pointerleave',reset)});
  const stopMotion=()=>{if(reduced.matches){animations.forEach(a=>a.cancel());animations.clear();tracking.forEach(cancelAnimationFrame);tracking.clear();cards.forEach(el=>{el.style.setProperty('--tilt-x','0deg');el.style.setProperty('--tilt-y','0deg')})}};
  reduced.addEventListener('change',stopMotion);
  return()=>{observer.disconnect();animations.forEach(a=>a.cancel());cancelAnimationFrame(frame);tracking.forEach(cancelAnimationFrame);removeEventListener('scroll',scroll);removeEventListener('resize',scroll);reduced.removeEventListener('change',stopMotion);[...cards,...surfaces].forEach(el=>{el.removeEventListener('pointermove',move);el.removeEventListener('pointerleave',reset)})};
 },[scene]);
 return <div className="reading-progress" ref={progress} aria-hidden="true"/>;
}
