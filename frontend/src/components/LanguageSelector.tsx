import React, { useState, useRef, useEffect } from "react";
import { useLanguage } from "../i18n/LanguageContext";
import { Globe, ChevronDown, Check } from "lucide-react";

interface LanguageSelectorProps {
  className?: string;
  variant?: "light" | "dark";
  compact?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  className = "",
  variant = "light",
  compact = false,
}) => {
  const { language, setLanguage, languages, currentLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isDark = variant === "dark";

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
          isDark
            ? "bg-white/10 text-white border-white/20 hover:bg-white/15"
            : "bg-white text-[#0B0B0F] border-[#E8E6E1] hover:border-[#0B0B0F]/40 shadow-xs"
        }`}
        aria-expanded={isOpen}
        aria-haspopup="true"
        title="Select Language / भाषा चुनें"
      >
        <Globe className={`w-3.5 h-3.5 ${isDark ? "text-[#7CE25B]" : "text-[#0B0B0F]"}`} />
        <span className="font-medium">
          {compact ? currentLanguage.code.toUpperCase() : currentLanguage.nativeName}
        </span>
        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-1.5 w-48 rounded-2xl bg-white border border-[#E8E6E1] shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
          role="menu"
        >
          <div className="px-3 py-1.5 border-b border-[#E8E6E1]/60 text-[10px] font-bold text-[#6B6860] uppercase tracking-wider">
            Select Language
          </div>
          {languages.map((lang) => {
            const isSelected = lang.code === language;
            return (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2 text-left text-xs transition-colors ${
                  isSelected
                    ? "bg-[#7CE25B]/15 text-[#0B0B0F] font-bold"
                    : "text-[#0B0B0F] hover:bg-[#F7F5F0]"
                }`}
                role="menuitem"
              >
                <div className="flex flex-col">
                  <span className="font-semibold text-[13px]">{lang.nativeName}</span>
                  <span className="text-[10px] text-[#6B6860]">{lang.name}</span>
                </div>
                {isSelected && <Check className="w-4 h-4 text-[#2a7a10]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
