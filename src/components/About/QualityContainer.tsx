"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface VideoFeature {
  number: string;
  title: string;
  description: string;
  videoUrl: string;
}

const VideoFeatureContainer = () => {
  const t = useTranslations();
  const [activeFeature, setActiveFeature] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const features: VideoFeature[] = [
    {
      number: "01",
      title: t("features.printing.title"),
      description: t("features.printing.description"),
      videoUrl: "/videos/machines.mp4",
    },
    {
      number: "02",
      title: t("features.sustainability.title"),
      description: t("features.sustainability.description"),
      videoUrl: "/videos/embroidery-care.mp4",
    },
    {
      number: "03",
      title: t("features.packaging.title"),
      description: t("features.packaging.description"),
      videoUrl: "/videos/packaging.mp4",
    },
  ];

  // Force video to play when activeFeature changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      const playPromise = videoRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.log("Autoplay prevented:", error);
        });
      }
    }
  }, [activeFeature]);

  return (
    <section className="w-full py-16 px-4 md:px-16 ">
      <div className="max-w-2xl mx-auto justify-center items-center flex gap-12 text-white">
        {/* Left Side - Text Content */}
        <div className="flex flex-col gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col gap-6"
          >
            <h2 className="font-[HandoBold] sm:text-5xl text-3xl leading-tight">
              {t("features.mainTitle")}
            </h2>
            <p className="font-[HandoRegular] text-white/60 text-base md:text-lg leading-relaxed">
              {t("features.description")}
            </p>
            <Link href='/register'>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-black text-white px-6 py-3 rounded-full font-[HandoBold] text-sm flex items-center gap-2 w-fit"
            >
              {t("features.cta")}
              <span>→</span>
            </motion.button>
            </Link>
          </motion.div>

          {/* Feature List */}
          <div className="flex flex-col gap-4 mt-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                onClick={() => setActiveFeature(index)}
                className={`cursor-pointer transition-all duration-300 ${
                  activeFeature === index ? "opacity-100" : "opacity-50"
                }`}
                whileHover={{ opacity: 1 }}
              >
                <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
                  <div className="bg-black text-white px-3 py-1 rounded font-[HandoBold] text-sm min-w-[40px] text-center">
                    {feature.number}
                  </div>
                  <h3 className="font-[HandoBold] text-xl md:text-2xl">
                    {feature.title}
                  </h3>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        
        {/* <motion.div
          key={activeFeature}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          viewport={{ once: false }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative w-full h-[600px] lg:h-[600px] rounded-3xl overflow-hidden bg-gray-200 shadow-2xl border border-black"
        >
          
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            src={features[activeFeature].videoUrl}
          />

          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8"
          >
            <div className="flex flex-col gap-4">
              <div className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded font-[HandoBold] text-xs w-fit border border-white/30">
                {features[activeFeature].number}
              </div>
              <h3 className="font-[HandoBold] text-white text-2xl md:text-3xl uppercase tracking-wide">
                {features[activeFeature].title}
              </h3>
              <p className="font-[HandoRegular] text-white/90 text-sm md:text-base leading-relaxed">
                {features[activeFeature].description}
              </p>
            </div>
          </motion.div>
        </motion.div> */}

      </div>
    </section>
  );
};

export default VideoFeatureContainer;