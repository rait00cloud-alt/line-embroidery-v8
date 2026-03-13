"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

interface TagCardProps {
  paragraphs: string[]; // Array of paragraph texts
  bottomContent?: React.ReactNode; // Anything you want to render at the bottom
  ctaText: string; // CTA button text
  onCtaClick?: () => void; // Optional CTA click handler
}

const TagCard: React.FC<TagCardProps> = ({ paragraphs, bottomContent, ctaText, onCtaClick }) => {
  const t = useTranslations();
  return (
    <section className="flex flex-col items-center justify-center w-full  px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full border-2 border-dashed border-gray-400 rounded-xl p-8 flex flex-col items-center bg-white shadow-lg"
      >
        {/* Paragraphs */}
        <div className="flex flex-col max-w-md justify-center items-start gap-4">
          {paragraphs.map((text, index) => (
            <p key={index} className="text-gray-700 text-left font-[HandoRegular] tracking-tight">
              {text}
            </p>
          ))}
        </div>

        {/* Bottom Content (React Node) */}
        {bottomContent && <div className="w-full justify-end items-end flex gap-6 text-gray-600">{bottomContent}</div>}

      
      </motion.div>
    </section>
  );
};

export default TagCard;
