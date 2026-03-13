"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

const ModelInstance = dynamic(() => import("@/components/Design/ModelInstance"), { ssr: false });

type Item = {
  key: string;
  titleKey: string;
  subtitleKey: string;
};

const items: Item[] = [
  { key: "snapback", titleKey: "showcase.snapback.title", subtitleKey: "showcase.snapback.subtitle" },
  { key: "panel", titleKey: "showcase.panel.title", subtitleKey: "showcase.panel.subtitle" },
  { key: "trucker", titleKey: "showcase.trucker.title", subtitleKey: "showcase.trucker.subtitle" },
  { key: "hat", titleKey: "showcase.hat.title", subtitleKey: "showcase.hat.subtitle" },
];


function RotatingModel({ modelKey, texture, decals }: any) {
  const meshRef = useRef<any>(null);
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group ref={meshRef} position={[0, 0, 0]}>
      <ModelInstance modelKey={modelKey} />
    </group>
  );
}

export default function ShowcaseCarousel() {
  const t = useTranslations();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "center" });
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
  }, [emblaApi]);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  return (
    <section className="relative w-full h-[47vh] sm:h-[60vh]  text-white overflow-hidden bg-black">
      {/* Background video */}
      <video
        className="absolute inset-0 w-full h-full object-contain sm:object-cover"
        autoPlay
        loop
        muted
        playsInline
        src="https://res.cloudinary.com/dmenn07uc/video/upload/v1764248945/line-embroidery-video_l1uona.mp4"
      />
      <div className="absolute inset-0 bg-[#131313]/60" />

      {/* Carousel */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-7xl flex flex-col items-center gap-4">
          
          {/* Navigation Arrows */}
          <div className="relative w-full max-w-6xl flex items-center justify-between">
            <button
              onClick={scrollPrev}
              className="absolute left-0 z-20 p-3 rounded-full  transition-all  -translate-x-4"
              aria-label="Previous slide"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div ref={emblaRef as any} className="w-full ">
              <div className="flex">
                {items.map((item) => (
                  <div key={item.key} className="flex-[0_0_100%] min-w-0 flex flex-col items-center gap-4">
                    
                    {/* 3D Model - Centered with rotation */}
                    <div className="w-full max-w-4xl h-40 sm:h-[260px] rounded-xl pointer-events-none">
                      <Canvas camera={{ position: [5, 3, 2], fov: 55 }}>
                        <ambientLight intensity={0.7} />
                        <directionalLight position={[5, 5, 5]} intensity={1} />
                        <Environment preset="studio" />
                        {/* Centered and rotating model */}
                        <RotatingModel modelKey={item.key} texture={null} decals={[]} />
                      </Canvas>
                    </div>

                    {/* Title and Subtitle */}
                    <div className="text-center">
                      <motion.h2
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-3xl sm:text-5xl font-[HandoBold] tracking-tighter "
                      >
                        {t(item.titleKey)}
                      </motion.h2>
                      <motion.p
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-white/85 font-[HandoRegular] tracking-tighter  sm:text-lg"
                      >
                        {t(item.subtitleKey)}
                      </motion.p>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-2">
                      <motion.a
                       initial={{ opacity: 0}}
                        whileInView={{ opacity: 1}}
                        transition={{ duration: 1}}
                        href="/products"
                        className="px-2 py-1 tracking-tighter rounded-sm bg-white/60 text-black font-[HandoBold] hover:bg-gray-100 flex justify-center items-center"
                      >
                        {t("ProductPage.labels.designNow")}
                      </motion.a>
                      <motion.a
                      initial={{ opacity: 0}}
                        whileInView={{ opacity: 1}}
                        transition={{ duration: 1, delay: 0.1 }}
                        href="/register"
                        className="px-2 py-1 tracking-tighter rounded-sm bg-white/10 border border-white/30 text-white font-[HandoBold] hover:bg-white/20 flex justify-center items-center"
                      >
                        {t("ProductPage.labels.see_more")}
                      </motion.a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={scrollNext}
              className="absolute right-0 z-20 p-3 rounded-full  transition-all  translate-x-4"
              aria-label="Next slide"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Dots */}
          <div className="flex gap-2 mt-4">
            {items.map((_, idx) => (
              <button
                key={idx}
                onClick={() => emblaApi && emblaApi.scrollTo(idx)}
                className={`h-0.5 w-8 rounded-full transition ${idx === selectedIndex ? "bg-white" : "bg-white/40"}`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
