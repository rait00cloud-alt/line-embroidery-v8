"use client";

import React, { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";

const mediaSlides = [
  { type: "video", src: "/videos/line-embroidery-video.mp4" },
  { type: "image", src: "/photos/line-embroidery-photo-01.jpg" },
  { type: "image", src: "/photos/line-embroidery-photo-02.jpg" },
  { type: "image", src: "/photos/line-embroidery-photo-03.jpg" },
  { type: "image", src: "/photos/line-embroidery-photo-04.jpg" },
];

export default function MediaHero() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "center" });
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
  }, [emblaApi]);

  return (
    <section className="relative w-full h-[60vh] sm:h-[70vh] overflow-hidden">
      {/* Background video */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        src="/videos/line-embroidery-video.mp4"
      />
      <div className="absolute inset-0 bg-black/40" />

      {/* Foreground carousel */}
      <div className="relative z-10 h-full flex items-end justify-center pb-8">
        <div className="w-full max-w-4xl px-4">
          <div className="overflow-hidden rounded-xl border border-white/20 backdrop-blur-sm bg-white/5" ref={emblaRef as any}>
            <div className="flex">
              {mediaSlides.map((item, idx) => (
                <div key={idx} className="flex-[0_0_100%] min-w-0 relative h-[40vh]">
                  {item.type === "image" ? (
                    <img src={item.src} alt={`slide-${idx}`} className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <video src={item.src} autoPlay muted playsInline loop className="absolute inset-0 w-full h-full object-cover" />
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-center mt-4 gap-2">
            {mediaSlides.map((_, idx) => (
              <button key={idx} onClick={() => emblaApi && emblaApi.scrollTo(idx)} className={`h-2 w-2 rounded-full transition ${idx === selectedIndex ? "bg-white" : "bg-white/40"}`} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}





