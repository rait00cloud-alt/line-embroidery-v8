"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const CustomSolutionsContainer: React.FC = () => {
  const t = useTranslations();

  return (
    <section className="relative flex flex-col sm:flex-row items-center justify-center w-full py-32 px-8 bg-gray-50">
      <motion.div
        className="flex flex-col sm:flex-row items-start gap-16 w-full max-w-6xl justify-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
      >
      

        {/* Text */}
        <div className="w-full sm:w-1/2 flex flex-col justify-center items-center gap-4 text-center sm:text-left">
          <motion.h2
            className="font-[HandoBold] text-3xl sm:text-5xl text-black"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {t("enterprise.custom_solutions_title")}
          </motion.h2>

          <motion.p
            className="font-[HandoRegular] text-md sm:text-lg text-black/70"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            {t("enterprise.custom_solutions_subtitle")}
          </motion.p>
           <motion.a
                                 initial={{ backgroundColor: "#000000", scale:0 }}
                                 animate={{ scale:1}}
                                 whileHover={{ backgroundColor: "#ffffff" }}
                                 transition={{ duration: 0.2, ease: "easeIn" }}
                                 
                                 href="#get_in_touch"
                                 className="border border-black rounded-xl px-4 py-1 flex justify-center items-center max-w-max"
                               >
                                 <motion.span
                                   initial={{ color: "#ffffff" }}
                                   whileHover={{ color: "#000000" }}
                                   transition={{ duration: 0.3, ease: "easeIn" }}
                                   className="font-[HandoBold] text-lg flex justify-center items-center gap-2"
                                 >
                              {t("enterprise.start-now")} <span className="text-xs">↗</span>
                          </motion.span>
                      </motion.a>
        </div>
      </motion.div>
    </section>
  );
};

export default CustomSolutionsContainer;
