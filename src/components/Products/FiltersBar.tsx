"use client";

import { useState } from "react";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";



interface FiltersBarProps {
  onFilterChange: (filters: Record<string, string[]>) => void;
  productCount?: number;
  variant?: string;
  products: any[]; // <-- adicionar isso
}

export default function FiltersBar({
  onFilterChange,
  productCount = 0,
  variant,
  products
}: FiltersBarProps) {
  const t = useTranslations("products");
  const [openFilter, setOpenFilter] = useState<string | null>(null);
 const [filters, setFilters] = useState<Record<string, string[]>>({
  type: [],
  size: [],
  color: [],
  price: [],
});
  const [sortBy, setSortBy] = useState("bestseller");
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const ALL_PRODUCTS = products;

 const extractedFilterOptions = {
  type: [...new Set(ALL_PRODUCTS.map(p => p.name))],
  size: [...new Set(ALL_PRODUCTS.flatMap(p => p.sizes))],
  color: [...new Set(ALL_PRODUCTS.flatMap(p => p.colors))],
  price: ["Under $15", "$15 - $25", "$25 - $35", "Over $35"],
};

const defaultFilterOptions = extractedFilterOptions;

  // Special grouping for vintage page
const vintageTypeGroups: Record<string, string[]> = {
  "Line Embroidery": ["Line Embroidery"],
  "Blanks": ["Blanks"],
};


  const filterOptions: Record<string, any> =
    variant === "vintage"
      ? { ...defaultFilterOptions, type: vintageTypeGroups }
      : defaultFilterOptions;

  const toggleFilter = (filter: string) => {
    setOpenFilter(openFilter === filter ? null : filter);
  };

  const handleSelect = (filterName: string, value: string) => {
    const currentValues = filters[filterName] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];

    const newFilters = { ...filters, [filterName]: newValues };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilter = (filterName: string) => {
    const newFilters = { ...filters, [filterName]: [] };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const getActiveCount = (filterName: string) =>
    filters[filterName]?.length || 0;

  return (
    <div className="w-full bg-white border-t border-b border-gray-200 py-4 px-6">
      {/* Desktop Layout */}
      <div className="hidden md:flex items-center justify-between gap-4">
        {/* Filters */}
        <div className="flex items-center gap-3 flex-1">
          {Object.keys(filterOptions).map((filter) => {
            const activeCount = getActiveCount(filter);
            const isOpen = openFilter === filter;

            return (
              <div key={filter} className="relative">
                <button
                  onClick={() => toggleFilter(filter)}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-[HandoRegular] rounded-xl border transition-colors ${
                    activeCount > 0
                      ? "bg-black text-white border-black"
                      : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                  }`}
                >
                  {t(`filters.${filter}`)}
                  {activeCount > 0 && (
                    <span className="ml-1 text-xs">({activeCount})</span>
                  )}
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setOpenFilter(null)}
                    />
                    <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-20 overflow-hidden">
                      <div className="max-h-64 overflow-y-auto">
                        {Array.isArray(filterOptions[filter]) ? (
                          (filterOptions[filter] as string[]).map((option) => {
                            const isSelected = filters[filter]?.includes(option);
                            return (
                              <button
                                key={option}
                                onClick={() => handleSelect(filter, option)}
                                className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${
                                  isSelected
                                    ? "bg-gray-100 font-[HandoRegular]"
                                    : "hover:bg-gray-50"
                                }`}
                              >
                                {t(`filters.options.${option.replace(/\s+/g, "_").replace(/\./g, "_")}`)}

                                {isSelected && (
                                  <svg
                                    className="w-4 h-4 text-black"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </button>
                            );
                          })
                        ) : (
                          Object.entries(filterOptions[filter]).map(([groupName, options]) => (
                            <div key={groupName} className="px-3 py-2">
                              <div className="text-xs text-gray-500 font-[HandoBold] mb-2">{groupName}</div>
                              {options.map((option: string) => {
                                const isSelected = filters[filter]?.includes(option);
                                return (
                                  <button
                                    key={option}
                                    onClick={() => handleSelect(filter, option)}
                                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${
                                      isSelected
                                        ? "bg-gray-100 font-[HandoRegular]"
                                        : "hover:bg-gray-50"
                                    }`}
                                  >
                                    {t(`filters.options.${option.replace(/\s+/g, "_").replace(/\./g, "_")}`)}

                                    {isSelected && (
                                      <svg
                                        className="w-4 h-4 text-black"
                                        fill="none"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path d="M5 13l4 4L19 7" />
                                      </svg>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          ))
                        )}
                      </div>
                      {activeCount > 0 && (
                        <div className="border-t border-gray-200 p-2">
                          <button
                            onClick={() => clearFilter(filter)}
                            className="w-full text-sm text-gray-600 hover:text-black py-1"
                          >
                            {t("filters.clear_all")}
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Sort + count */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              onClick={() => toggleFilter("sort")}
              className="flex items-center gap-2 px-4 py-2 text-sm font-[HandoRegular] text-gray-700 border border-gray-300 rounded-xl hover:border-gray-400 transition-colors"
            >
              {t("filters.sort_by")}
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  openFilter === "sort" ? "rotate-180" : ""
                }`}
              />
            </button>

            {openFilter === "sort" && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setOpenFilter(null)}
                />
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20 overflow-hidden">
                  {[
                    "Bestseller",
                    "Price: Low to High",
                    "Price: High to Low",
                    "Newest",
                  ].map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setSortBy(option.toLowerCase());
                        setOpenFilter(null);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                        sortBy === option.toLowerCase()
                          ? "bg-gray-100 font-[HandoRegular]"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      {t(`filters.sort_options.${option.replace(/\s+/g, "_")}`)}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <span className="text-sm text-gray-600 font-[HandoRegular]">
            {productCount} {t("filters.items")}
          </span>
        </div>
      </div>

      {/* Mobile Button */}
      <div className="md:hidden flex justify-between items-center">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="flex items-center gap-2 text-sm font-[HandoRegular] px-4 py-2 rounded-xl border border-gray-300"
        >
          <SlidersHorizontal className="w-4 h-4" />
          {t("filters.filters")}
        </button>
        <span className="text-sm text-gray-600 font-[HandoRegular]">
          {productCount} {t("filters.items")}
        </span>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-30"
              onClick={() => setIsMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-[9999] p-6 flex flex-col overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-[HandoBold]">{t("filters.filters")}</h2>
                <button onClick={() => setIsMobileOpen(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              {Object.keys(filterOptions).map((filter) => (
                <div key={filter} className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-[HandoBold] capitalize">
                      {t(`filters.${filter}`)}
                    </h3>
                    {getActiveCount(filter) > 0 && (
                      <button
                        onClick={() => clearFilter(filter)}
                        className="text-xs text-gray-500 hover:text-black"
                      >
                        {t("filters.clear")}
                      </button>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    {Array.isArray(filterOptions[filter]) ? (
                      (filterOptions[filter] as string[]).map((option) => {
                        const isSelected = filters[filter]?.includes(option);
                        return (
                          <button
                            key={option}
                            onClick={() => handleSelect(filter, option)}
                            className={`text-left px-3 py-2 text-sm rounded-lg border ${
                              isSelected
                                ? "bg-black text-white border-black"
                                : "border border-gray-300 hover:border-gray-400"
                            }`}
                          >
                            {t(`filters.options.${option.replace(/\s+/g, "_").replace(/\./g, "_")}`)}

                          </button>
                        );
                      })
                    ) : (
                      Object.entries(filterOptions[filter]).map(([groupName, options]: any) => (
                        <div key={groupName} className="mb-4">
                          <div className="text-xs text-gray-500 font-[HandoBold] mb-2">{groupName}</div>
                          <div className="flex flex-col gap-2">
                            {options.map((option: string) => {
                              const isSelected = filters[filter]?.includes(option);
                              return (
                                <button
                                  key={option}
                                  onClick={() => handleSelect(filter, option)}
                                  className={`text-left px-3 py-2 text-sm rounded-lg border ${
                                    isSelected
                                      ? "bg-black text-white"
                                      : "border border-gray-300 hover:border-gray-400"
                                  }`}
                                >
                                  {t(`filters.options.${option.replace(/\s+/g, "_").replace(/\./g, "_")}`)}

                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}

              {/* Sort */}
              <div className="mt-auto">
                <h3 className="text-sm font-[HandoBold] mb-2">{t("filters.sort_by")}</h3>
                {[
                  "Bestseller",
                  "Price: Low to High",
                  "Price: High to Low",
                  "Newest",
                ].map((option) => (
                  <button
                    key={option}
                    onClick={() => setSortBy(option.toLowerCase())}
                    className={`w-full text-left px-3 py-2 text-sm rounded-lg mb-2 ${
                      sortBy === option.toLowerCase()
                        ? "bg-black text-white"
                        : "border border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    {t(`filters.sort_options.${option.replace(/\s+/g, "_")}`)}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
