"use client";

import React, { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

interface Slide {
  src: string;
  href?: string;
  type?: "img" | "video";
}

export default function CustomCarousel() {
  const t = useTranslations();
  const [isClient, setIsClient] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const slideWidth = 216; // base size for each tile

  const slides: Slide[] = [
    { src: "/images/keychains.jpg", href: "/products/keychain1" },
    { src: "/images/custom-pieces.jpg", href: "/products/keychain2" },
    { src: "https://res.cloudinary.com/dmenn07uc/video/upload/v1764249248/embroidery-care_lr9oou.mp4", href: "/videos/embroidery", type: "video" },
    { src: "/images/custom-pieces-02.jpg", href: "/products/keychain3" },
    { src: "https://res.cloudinary.com/dmenn07uc/video/upload/v1764249256/stiching-hat-embroidery_q8dfci.mp4", href: "/videos/embroidery", type: "video" },
  ];

  // Only render after mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    const update = () => {
      if (scrollRef.current) setContainerWidth(scrollRef.current.clientWidth);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [isClient]);

  useEffect(() => {
    if (!isClient || !containerWidth) return;
    const sc = scrollRef.current;
    if (!sc) return;

    const totalWidth = slides.length * slideWidth;
    sc.scrollLeft = totalWidth;

    let raf: number;
    const animate = () => {
      if (!isPaused && sc) {
        sc.scrollLeft += 1;
        if (sc.scrollLeft >= totalWidth * 2) sc.scrollLeft = totalWidth;
      }
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [isClient, isPaused, containerWidth]);

  if (!isClient) {
    return (
      <section className="relative w-full overflow-hidden py-16 bg-[#f5f5f5]">
        <div className="flex gap-4">
          {Array(5)
            .fill(null)
            .map((_, i) => (
              <div
                key={i}
                className="w-[200px] h-[260px] rounded-2xl bg-gray-200 animate-pulse"
              />
            ))}
        </div>
      </section>
    );
  }

  const totalClones = Math.ceil((window.innerWidth * 3) / slideWidth);
  const duplicatedSlides = Array(totalClones)
    .fill(null)
    .flatMap(() => slides);

  
  const VideoSlide = ({ src }: { src: string }) => (
    <video
      src={src}
      className="w-full h-full object-cover rounded-2xl"
      autoPlay
      muted
      loop
      playsInline
    />
  );

  return (
    <section className="relative w-full overflow-hidden py-6 px-4 bg-[#f5f5f5]">
  <div
    className="bg-white rounded-xl shadow-xl px-4 py-4 sm:max-w-7xl mx-auto"
    onMouseEnter={() => setIsPaused(true)}
    onMouseLeave={() => setIsPaused(false)}
  >
    <div className="relative overflow-hidden">
      <div
        className={`flex gap-6 w-max ${
          isPaused ? "pause-marquee" : "marquee"
        }`}
      >
        {[...slides, ...slides].map((slide, idx) => {
          const isVideo =
            slide.type === "video" || slide.src.endsWith(".mp4");

          return (
            <div
              key={idx}
              className="relative w-40 sm:w-60 aspect-square shrink-0 rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-md hover:shadow-lg transition"
            >
              {isVideo ? (
                <video
                  src={slide.src}
                  preload="none"
                  muted
                  autoPlay
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <Image
                  src={slide.src}
                  alt=""
                  fill
                  loading="lazy"
                  className="object-cover"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>

    <motion.h2
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="mt-4 text-center text-md sm:text-xl font-[HandoRegular] uppercase tracking-tighter text-gray-800"
    >
      {t("DesignPage.customCreations")}
    </motion.h2>
  </div>
</section>

);
}



