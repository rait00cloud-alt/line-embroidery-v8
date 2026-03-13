"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { useTranslations } from "next-intl";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const FormContainer: React.FC = () => {
  const t = useTranslations();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    website: "",
    phone: "",
    company: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "success" | "error" | null
  >(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    const { firstName, lastName, email } = formData;
    if (!firstName || !lastName || !email) {
      setSubmitStatus("error");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus("success");
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          website: "",
          phone: "",
          company: "",
        });
      } else {
        setSubmitStatus("error");
      }
    } catch (error) {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id='contact' className="relative flex flex-col sm:flex-row items-center justify-center  sm:items-start w-full py-32 px-8">
     {/* <div className="relative flex flex-col justify-start sm:items-start items-center sm:justify-between w-full max-w-2xl h-full px-2">
        <div className="flex flex-col sm:items-start items-center sm:text-left text-center gap-4 w-full ">
          <motion.h1
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="font-[HandoBold] text-3xl sm:text-5xl text-black"
          >
            {t("form.title")}
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="font-[HandoRegular] text-md sm:text-lg text-black/70 tracking-tight"
          >
            {t("form.subtitle")}
          </motion.h2>
        </div>

            <div className="relative py-4">
            <img
              src="/logo/line-embroidery-logo.png"
              alt="Line Embroidery Logo"
              className="w-20 sm:w-24 object-contain"
            />
          </div>
      </div> */}


     <motion.div id="get_in_touch"
        className="w-full max-w-lg border-2 border-black rounded-3xl p-8 bg-white shadow-lg"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
      >
        <h2 className="font-[HandoBold] text-3xl text-black text-center mb-6">
          {t("form.get_in_touch")}
        </h2>

        <motion.form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
          <div className="flex gap-4">
            <label className="flex flex-col w-1/2">
              <span className="font-[HandoRegular] text-sm">{t("form.first_name")}</span>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder={t("form.first_name_placeholder")}
                required
                className="border-b border-black px-4 py-2 focus:outline-none focus:border-black rounded-sm transition"
              />
            </label>

            <label className="flex flex-col w-1/2">
              <span className="font-[HandoRegular] text-sm">{t("form.last_name")}</span>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder={t("form.last_name_placeholder")}
                required
                className="border-b border-black px-4 py-2 focus:outline-none focus:border-black rounded-sm transition"
              />
            </label>
          </div>

          <label className="flex flex-col">
            <span className="font-[HandoRegular] text-sm">{t("form.business_email")}</span>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={t("form.business_email_placeholder")}
              required
              className="border-b border-black px-4 py-2 focus:outline-none focus:border-black rounded-sm transition"
            />
          </label>

        

          <label className="flex flex-col">
            <span className="font-[HandoRegular] text-sm">{t("form.phone")}</span>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder={t("form.phone_placeholder")}
              className="border-b border-black px-4 py-2 focus:outline-none focus:border-black rounded-sm transition"
            />
          </label>

          <label className="flex flex-col">
            <span className="font-[HandoRegular] text-sm">{t("form.company")}</span>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder={t("form.company_placeholder")}
              className="border-b border-black px-4 py-2 focus:outline-none focus:border-black rounded-sm transition"
            />
          </label>

          <motion.button
            type="submit"
            whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
            disabled={isSubmitting}
            className={clsx(
              "bg-black text-white px-4 py-3 rounded-full font-[HandoBold] hover:bg-gray-900 transition mt-4",
              isSubmitting && "opacity-60 cursor-not-allowed"
            )}
          >
            {isSubmitting ? t("form.sending") : t("form.submit")}
          </motion.button>

          <AnimatePresence>
            {submitStatus && (
              <motion.div
                key="status"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className={clsx(
                  "text-sm text-center px-3 py-1 rounded mt-3",
                  submitStatus === "success"
                    ? "bg-green-600/20 text-green-600 border border-green-500"
                    : "bg-red-600/20 text-red-600 border border-red-500"
                )}
              >
                {submitStatus === "success"
                  ? t("form.success_message")
                  : t("form.error_message")}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.form>
      </motion.div>
    </section>
  );
};

export default FormContainer;
