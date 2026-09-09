"use client";

import {useCallback, useEffect, useState} from "react";
import {ArrowLeft, ArrowRight} from "lucide-react";
import {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

const slides=Array.from({length:10},(_,index)=>`/committee/${index+1}.jpg`);

export function CommitteeCarousel(){
  const [api,setApi]=useState<CarouselApi>();
  const [current,setCurrent]=useState(0);
  const [count,setCount]=useState(slides.length);

  const sync=useCallback((carousel:CarouselApi)=>{
    if(!carousel)return;
    setCurrent(carousel.selectedScrollSnap());
    setCount(carousel.scrollSnapList().length);
  },[]);

  useEffect(()=>{
    if(!api)return;
    sync(api);
    api.on("select",sync);
    api.on("reInit",sync);
    return()=>{api.off("select",sync);api.off("reInit",sync)};
  },[api,sync]);

  return <div className="committee-carousel">
    <Carousel setApi={setApi} opts={{align:"center"}} aria-label="Meet the committee">
      <CarouselContent>
        {slides.map((src,index)=><CarouselItem key={src}>
          <img src={src} alt={index===0?"Meet the ULISOC committee":"ULISOC committee profile"} width="1080" height="1350" loading={index<2?"eager":"lazy"}/>
        </CarouselItem>)}
      </CarouselContent>
    </Carousel>
    <div className="carousel-controls">
      <button type="button" onClick={()=>api?.scrollPrev()} disabled={!api?.canScrollPrev()} aria-label="Previous committee slide"><ArrowLeft aria-hidden="true"/></button>
      <div className="carousel-dots" aria-label={`Slide ${current+1} of ${count}`}>
        {slides.map((_,index)=><button key={index} type="button" className={index===current?"active":""} onClick={()=>api?.scrollTo(index)} aria-label={`Go to slide ${index+1}`} aria-current={index===current?"true":undefined}/>) }
      </div>
      <span>{String(current+1).padStart(2,"0")} / {String(count).padStart(2,"0")}</span>
      <button type="button" onClick={()=>api?.scrollNext()} disabled={!api?.canScrollNext()} aria-label="Next committee slide"><ArrowRight aria-hidden="true"/></button>
    </div>
  </div>
}
