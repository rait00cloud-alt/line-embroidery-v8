"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from 'next-intl';
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay"; 
import Link from "next/link";

const mediaSlides = [
  { type: "video", src: "/videos/line-embroidery-video.mp4" }
];

const CreateContainer: React.FC = () => {
  const t = useTranslations();
  
  // 2. Remove 'autoplay: true' from options
  // 3. Add [Autoplay()] as the second argument
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "center" }, 
    [Autoplay({ delay: 3000 })] 
  );

  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
  }, [emblaApi]);

  // ... rest of your code remains the same ...
  return (
    <section className="relative flex flex-col sm:flex-row items-center justify-center w-full py-8 px-8 ">
      <div className="flex flex-col sm:justify-start justify-center items-center sm:items-start gap-8 w-full max-w-2xl">
        <div className="flex flex-col items-center sm:text-left sm:justify-start justify-center gap-4 px-2 text-center w-full ">
          <motion.h1 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 1 }} className="font-[HandoBold] text-5xl text-white text-center  tracking-tight ">
            {t("home.title")}
          </motion.h1>

          <motion.h1 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 1 }} className="font-[HandoRegular] text-xl text-white/70 tracking-tight ">
            {t("home.subtitle")}
          </motion.h1>
        </div>

        <div className="flex flex-row items-center justify-center gap-4 px-2 text-center w-full py-8">
          <Link href="/register" className="bg-black px-4 py-2 border-white border rounded-sm flex justify-center items-center">
            <span className="font-[HandoBold] text-lg text-white">{t("see_more")}</span>
          </Link>

          <Link href="/products" className="border border-white rounded-sm px-4 py-2 flex justify-center items-center">
            <span className="font-[HandoBold] text-lg text-white">{t("products.title")}</span>
          </Link>
        </div>
      </div>

      {/* <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex flex-col max-w-md w-full">
        <div className="overflow-hidden rounded-2xl shadow-lg border border-white" ref={emblaRef as any}>
          <div className="flex ">
            {mediaSlides.map((item, idx) => (
              <div className="flex-[0_0_100%] min-w-0 " key={idx}>
                {item.type === "image" ? (
                  <img src={item.src} alt={`slide-${idx}`} className="w-full h-auto object-cover" />
                ) : (
                  <video src={item.src} autoPlay muted playsInline className="w-full h-auto object-cover" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center mt-4 gap-2">
          {mediaSlides.map((_, idx) => (
            <button key={idx} onClick={() => emblaApi && emblaApi.scrollTo(idx)} className={`h-2 w-2 rounded-full transition ${idx === selectedIndex ? "bg-black" : "bg-gray-400/50"}`} />
          ))}
        </div>
      </motion.div> */}
    </section>
  );
};

export default CreateContainer;