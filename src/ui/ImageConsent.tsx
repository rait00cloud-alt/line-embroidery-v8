  "use client";

  import { useEffect, useState, useRef } from "react";
  import { motion, AnimatePresence } from "framer-motion";
  import { X } from "lucide-react";
  import { useTranslations } from "next-intl";
  import { supabase } from "@/components/lib/supabase";

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
    exit: { opacity: 0, transition: { duration: 0.5 } },
  };

  export default function ImgConsentPopup() {
    const [isVisible, setIsVisible] = useState(false);
    const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);
    const [accepted, setAccepted] = useState(false);

    const [formData, setFormData] = useState({
      client_name: "",
      address: "",
      city_state: "",
      phone: "",
      email: "",
      project_reference: "",
    });

    const contentRef = useRef<HTMLDivElement>(null);
    const t = useTranslations("");

    const currentDate = new Date().toISOString().split("T")[0];

    useEffect(() => {
      const showPopup = async () => {
        setIsVisible(true);

        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { data: user, error } = await supabase
            .from("users")
            .select("client_name,address,city_state,phone,email,project_reference")
            .eq("id", session.user.id)
            .single();
          if (!error && user) {
            setFormData({
              client_name: user.client_name || "",
              address: user.address || "",
              city_state: user.city_state || "",
              phone: user.phone || "",
              email: user.email || "",
              project_reference: user.project_reference || "",
            });
          }
        }
      };

      showPopup();
    }, []);

    useEffect(() => {
      document.body.style.overflow = isVisible ? "hidden" : "";
      return () => { document.body.style.overflow = ""; };
    }, [isVisible]);

    const handleScroll = () => {
      if (!contentRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 5) setIsScrolledToBottom(true);
    };

    const handleClose = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      // Save form data if logged in
      if (session) {
        await supabase
          .from("users")
          .update({ ...formData })
          .eq("id", session.user.id);
      }

      setIsVisible(false);
    };

    const handleChange = (field: string, value: string) => {
      setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={fadeIn}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          >
            <motion.div
              className="relative bg-white border border-black/70 max-w-lg w-full p-6 rounded-md flex flex-col"
              initial="hidden"
              animate="visible"
            >
              <button
                onClick={handleClose}
                className="absolute top-2 right-2 text-white hover:text-[#c9f711]"
                aria-label="Close"
              >
                <X size={20} />
              </button>

              <h2 className="text-lg font-[HandoBold] text-center mb-4">
                {t("img_consent.title")}
              </h2>

              <div
                ref={contentRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto border border-black/70 p-4 rounded-md mb-4 max-h-80 text-black space-y-3"
              >
                {Object.entries(formData).map(([key, value]) => (
                  <div key={key} className="flex flex-col">
                    <label className="font-[HandoRegular] text-sm mb-1">
                      {t(`img_consent.fields.${key}`)}
                    </label>
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => handleChange(key, e.target.value)}
                      className="border border-black/50 rounded-md p-2 text-sm"
                    />
                  </div>
                ))}

                <div className="flex flex-col">
                  <label className="font-[HandoRegular] text-sm mb-1">
                    {t("img_consent.fields.date")}
                  </label>
                  <input
                    type="date"
                    value={currentDate}
                    readOnly
                    className="border border-black/50 rounded-md p-2 text-sm bg-gray-100 cursor-not-allowed"
                  />
                </div>
                <div className="mt-3 space-y-2">
  <p className="font-[HandoRegular] text-sm whitespace-pre-line">
    {t("img_consent.body.description_1")}
  </p>
  <p className="font-[HandoRegular] text-sm whitespace-pre-line">
    {t("img_consent.body.description_2")}
  </p>
  <p className="font-[HandoRegular] text-sm whitespace-pre-line">
    {t("img_consent.body.description_3")}
  </p>
  <p className="font-[HandoRegular] text-sm whitespace-pre-line">
    {t("img_consent.body.description_4")}
  </p>
  <p className="font-[HandoRegular] text-sm whitespace-pre-line">
    {t("img_consent.body.description_5")}
  </p>
</div>

                
              </div>

              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-2 font-[HandoRegular] text-sm">
                  <input
                    type="checkbox"
                    checked={accepted}
                    onChange={(e) => setAccepted(e.target.checked)}
                    className="accent-[#59ff00]"
                  />
                  {t("img_consent.accept_checkbox")}
                </label>

                <button
                  onClick={handleClose}
                  disabled={!accepted || !isScrolledToBottom}
                  className={`w-full py-2 rounded-md font-[HandoBold] tracking-tight ${
                    accepted && isScrolledToBottom
                      ? "bg-[#131313] text-white hover:bg-[#59ff00] hover:text-black transition"
                      : "bg-gray-600 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {t("img_consent.submit_button")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
