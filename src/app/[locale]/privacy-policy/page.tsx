'use client';

import { use } from 'react';
import { motion } from "framer-motion";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";

type Props = {
  params: Promise<{ locale: string }>;
};

export default function PrivacyPage({ params }: Props) {
  const t = useTranslations("privacy");
  const { locale } = use(params);

  // Variants para fade up
  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }, // sempre objeto
  };

  // Array de todas as seções de privacy
  const sectionKeys = [
    "introduction",
    "scope",
    "definitions",
    "collection",
    "dataCollected",
    "use",
    "legalBasis",
    "sharing",
    "retention",
    "thirdParties",
    "cookies",
    "security",
    "rights",
    "changes"
  ];

  // Verifica se a tradução existe
  const checkKey = (key: string) => {
    try {
      const translated = t(key);
      return translated && translated !== key;
    } catch {
      return false;
    }
  };

  return (
    <main className="bg-gray-100 min-h-screen py-24">
      <motion.div
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0, y: 20 },
          show: { opacity: 1, y: 0, transition: { staggerChildren: 0.05 } },
        }}
        className="flex flex-col p-6 md:p-10 max-w-4xl mx-auto bg-white rounded-xl shadow-lg font-[HandoRegular]"
      >
        {/* Title */}
        <motion.h1
          variants={fadeUp}
          custom={0}
          initial="hidden"
          animate="show"
          transition={{ delay: 0 * 0.05, duration: 0.45, ease: "easeOut" }}
          className="text-3xl md:text-4xl font-[HandoBold] mb-8 text-center"
        >
          {t("title")}
        </motion.h1>

        {sectionKeys.map((sectionKey, index) => (
          <motion.section
            key={sectionKey}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={index + 1}
            transition={{ delay: (index + 1) * 0.05, duration: 0.45, ease: "easeOut" }}
            className="mb-10"
          >
            <h2 className="text-xl font-[HandoBold] mb-4">
              {checkKey(`${sectionKey}.title`) ? t(`${sectionKey}.title`) : sectionKey}
            </h2>

            {/* Introduction / Scope / Definitions */}
            {['introduction', 'scope', 'definitions'].includes(sectionKey) && (
              <div className="space-y-4">
                {checkKey(`${sectionKey}.p1`) && <p>{t(`${sectionKey}.p1`)}</p>}
              </div>
            )}

            {/* Collection */}
            {sectionKey === "collection" && (
              <>
                {checkKey("collection.p1") && <p className="mb-4">{t("collection.p1")}</p>}
                {checkKey("collection.methods.title") && (
                  <h3 className="text-lg font-[HandoBold] mt-6 mb-2">
                    {t("collection.methods.title")}
                  </h3>
                )}
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  {checkKey("collection.sources.direct") && <li>{t("collection.sources.direct")}</li>}
                  {checkKey("collection.sources.others") && <li>{t("collection.sources.others")}</li>}
                  {checkKey("collection.sources.public") && <li>{t("collection.sources.public")}</li>}
                  {checkKey("collection.sources.cookies") && <li>{t("collection.sources.cookies")}</li>}
                </ul>
              </>
            )}

            {/* Data Collected */}
            {sectionKey === "dataCollected" && (
              <dl className="space-y-4">
                {['identifiers', 'payment', 'account', 'professional', 'network', 'communication', 'social'].map((itemKey) => (
                  checkKey(`dataCollected.${itemKey}.title`) && (
                    <div key={itemKey}>
                      <dt className="font-[HandoBold] text-gray-700">{t(`dataCollected.${itemKey}.title`)}</dt>
                      <dd className="ml-4">{t(`dataCollected.${itemKey}.text`)}</dd>
                    </div>
                  )
                ))}
              </dl>
            )}

            {/* Use */}
            {sectionKey === "use" && (
              <div className="space-y-6">
                <ol className="list-decimal pl-6 space-y-2">
                  {Array.from({ length: 13 }, (_, i) => i + 1).map((i) => (
                    checkKey(`use.list.${i}`) ? <li key={`use-list-${i}`}>{t(`use.list.${i}`)}</li> : null
                  ))}
                </ol>
                {checkKey("use.candidates.title") && (
                  <h3 className="text-md font-[HandoBold] mt-4">{t("use.candidates.title")}</h3>
                )}
                <ul className="list-disc pl-6 space-y-2">
                  {Array.from({ length: 5 }, (_, i) => i + 1).map((i) => (
                    checkKey(`use.candidates.${i}`) ? <li key={`use-candidates-${i}`}>{t(`use.candidates.${i}`)}</li> : null
                  ))}
                </ul>
              </div>
            )}

            {/* Legal Basis */}
            {sectionKey === "legalBasis" && (
              <dl className="space-y-4">
                {checkKey("legalBasis.consent") && (
                  <>
                    <dt className="font-[HandoBold] text-gray-700">Consentimento:</dt>
                    <dd className="ml-4 mb-2">{t("legalBasis.consent")}</dd>
                  </>
                )}
                {checkKey("legalBasis.contract") && (
                  <>
                    <dt className="font-[HandoBold] text-gray-700">Contrato:</dt>
                    <dd className="ml-4 mb-2">{t("legalBasis.contract")}</dd>
                  </>
                )}
                {checkKey("legalBasis.legal") && (
                  <>
                    <dt className="font-[HandoBold] text-gray-700">Obrigação Legal:</dt>
                    <dd className="ml-4 mb-2">{t("legalBasis.legal")}</dd>
                  </>
                )}
                {checkKey("legalBasis.legitimate") && (
                  <>
                    <dt className="font-[HandoBold] text-gray-700">Interesse Legítimo:</dt>
                    <dd className="ml-4 mb-2">{t("legalBasis.legitimate")}</dd>
                  </>
                )}
                {checkKey("legalBasis.obligation") && <p className="mt-4">{t("legalBasis.obligation")}</p>}
              </dl>
            )}

            {/* Sharing */}
            {sectionKey === "sharing" && (
              <div className="space-y-4">
                <ul className="list-disc pl-6 space-y-2">
                  {Array.from({ length: 4 }, (_, i) => i + 1).map((i) => (
                    checkKey(`sharing.list.${i}`) ? <li key={`sharing-list-${i}`}>{t(`sharing.list.${i}`)}</li> : null
                  ))}
                </ul>
                {checkKey("sharing.consent") && <p>{t("sharing.consent")}</p>}
              </div>
            )}

            {/* Retention */}
            {sectionKey === "retention" && checkKey("retention.text") && (
              <p>{t("retention.text")}</p>
            )}

            {/* Third Parties */}
            {sectionKey === "thirdParties" && (
              <div className="space-y-4">
                {checkKey("thirdParties.intro") && <p className="font-[HandoBold]">{t("thirdParties.intro")}</p>}
                <ul className="list-disc pl-6 space-y-2">
                  {['payment', 'shipping', 'hosting', 'marketing', 'recruitment', 'fraud', 'services', 'authorities', 'advisors', 'legal'].map((itemKey) => (
                    checkKey(`thirdParties.list.${itemKey}`) ? <li key={itemKey}>{t(`thirdParties.list.${itemKey}`)}</li> : null
                  ))}
                </ul>
                {checkKey("thirdParties.controls") && <p className="font-semibold">{t("thirdParties.controls")}</p>}
                {checkKey("thirdParties.international") && <p>{t("thirdParties.international")}</p>}
                {checkKey("thirdParties.links") && <p>{t("thirdParties.links")}</p>}
              </div>
            )}

            {/* Cookies */}
            {sectionKey === "cookies" && (
              <>
                {checkKey("cookies.intro") && <p className="mb-4">{t("cookies.intro")}</p>}
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  {checkKey("cookies.types.essential.title") && <li><strong>{t("cookies.types.essential.title")}:</strong> {t("cookies.types.essential.text")}</li>}
                  {checkKey("cookies.types.functional.title") && <li><strong>{t("cookies.types.functional.title")}:</strong> {t("cookies.types.functional.text")}</li>}
                  {checkKey("cookies.types.analytics.title") && <li><strong>{t("cookies.types.analytics.title")}:</strong> {t("cookies.types.analytics.text")}</li>}
                </ul>
                {checkKey("cookies.thirdParty") && <p>{t("cookies.thirdParty")}</p>}
              </>
            )}

            {/* Security */}
            {sectionKey === "security" && (
              <div className="space-y-4">
                {checkKey("security.measures") && <p>{t("security.measures")}</p>}
                {checkKey("security.user") && <p className="italic">{t("security.user")}</p>}
              </div>
            )}

            {/* Rights */}
            {sectionKey === "rights" && (
              <div className="space-y-4">
                {checkKey("rights.exercise") && <p>{t("rights.exercise")}</p>}
                <p className="font-semibold mt-2">
                  {checkKey("rights.contact") ? (
                    <>
                      {t("rights.contact").replace("privacy@lineembroidery.com", "")}
                      <Link href="mailto:privacy@lineembroidery.com" className="text-blue-600 hover:underline">privacy@lineembroidery.com</Link>
                      .
                    </>
                  ) : (
                    <Link href="mailto:privacy@lineembroidery.com" className="text-blue-600 hover:underline">privacy@lineembroidery.com</Link>
                  )}
                </p>
                {checkKey("rights.response") && <p>{t("rights.response")}</p>}
                {checkKey("rights.complaint") && <p>{t("rights.complaint")}</p>}
              </div>
            )}

            {/* Changes */}
            {sectionKey === "changes" && checkKey("changes.text") && (
              <p>{t("changes.text")}</p>
            )}

          </motion.section>
        ))}

        {/* Logo */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={20}
          transition={{ delay: 20 * 0.05, duration: 0.45, ease: "easeOut" }}
          className="flex justify-center mt-8"
        >
          <Image
            src="/logo/line-embroidery-logo.png"
            alt="Line Embroidery Logo"
            width={80}
            height={80}
            className="max-w-[80px]"
            priority
          />
        </motion.div>
      </motion.div>
    </main>
  );
}
