"use client";

import { motion, easeOut } from "framer-motion";
import { Variants } from "framer-motion";

import { useTranslations } from "next-intl";
import Link from "next/link";

interface CaseCard {
  title: string;
  description: string;
  videoUrl: string;
  link:string;
}

const CasesContainer = () => {
  const t = useTranslations();

  const cases: CaseCard[] = [
    {
      title: t("cases.case1.title"),
      description: t("cases.case1.description"),
      videoUrl: "/videos/vitao.mp4",
      link:"https://www.youtube.com/watch?v=LHx3UyVDCQ4"
    },
    {
      title: t("cases.case2.title"),
      description: t("cases.case2.description"),
      videoUrl: "/videos/alphonzo-rawls.mp4",
      link:"https://www.instagram.com/reel/CWSPKQiAPK4/"
    },
    {
      title: t("cases.case3.title"),
      description: t("cases.case3.description"),
      videoUrl: "/videos/danny-minnick.mp4",
      link:"https://www.instagram.com/reel/CJMKFDnAj0v/"
    },
  ];

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

 
const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

  return (
    <section className="w-full py-16 px-4 md:px-16 bg-gray-50">
      <div className="max-w-6xl mx-auto flex flex-col gap-8 justify-center items-center">
        {/* Header */}
        <motion.div
          className="text-center flex flex-col gap-4 max-w-4xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h2 className="font-[HandoBold] text-4xl md:text-5xl">
            {t("cases.title")}
          </h2>
         
        </motion.div>

        {/* Case Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {cases.map((caseItem, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              viewport={{ once: false}}
              className="bg-white rounded-3xl p-4  border border-black/20 hover:shadow-2xl transition-shadow flex flex-row gap-4 justify-between"
            >
             

              {/* Text Content */}
              <div className="flex flex-col gap-4">
              

                {/* Video */}
              <video
                className="w-full aspect-square rounded-2xl object-cover border border-black object-top"
                src={caseItem.videoUrl}
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
              />
                <div className='flex flex-col gap-4'  >
                <h3 className="font-[HandoBold] text-xl md:text-3xl">
                  {caseItem.title}
                </h3>
                <p className="font-[HandoRegular] text-gray-700 text-xs leading-relaxed">
                  {caseItem.description}
                </p>
                <motion.div
                whileHover={{}}
                className="bg-black max-w-max px-2 py-1 rounded-lg">
                  <Link 
                    href={caseItem.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-[HandoRegular] text-white tracking-normal"
                  >
                    {t('see_more')} →
                  </Link>

                </motion.div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default CasesContainer;
