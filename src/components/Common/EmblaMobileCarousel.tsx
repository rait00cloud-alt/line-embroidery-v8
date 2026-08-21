"use client";

import React, { useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";

interface Props {
  slides: string[];
  startIndex?: number;
  onSelectIndex?: (index: number) => void;
}

export default function EmblaMobileCarousel({ slides, startIndex = 0, onSelectIndex }: Props) {
  const [emblaRef, emblaApiRaw] = useEmblaCarousel({ loop: false });
  const emblaApi = emblaApiRaw as any;

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.scrollTo(startIndex);
  }, [emblaApi, startIndex]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => onSelectIndex && onSelectIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    return () => emblaApi.off("select", onSelect);
  }, [emblaApi, onSelectIndex]);

  return (
    <div className="embla" ref={emblaRef as any}>
      <div className="embla__container flex">
        {slides.map((src, idx) => (
          <div key={idx} className="embla__slide min-w-full">
            <img src={src} alt={`slide-${idx}`} className="w-full h-[420px] object-cover rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}
