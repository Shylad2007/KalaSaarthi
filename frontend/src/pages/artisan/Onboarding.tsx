import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import { useLanguage } from "../../i18n/LanguageContext";
import { LanguageSelector } from "../../components/LanguageSelector";
import { apiCall } from "../../api";
import { CheckCircle, ArrowRight, ArrowLeft, Loader } from "lucide-react";

const CRAFTS = [
  "Handloom Weaving", "Embroidery", "Pottery / Terracotta", "Woodcarving",
  "Metal Craft", "Jewelry Making", "Leather Work", "Painting / Miniature",
  "Block Printing", "Bamboo / Cane Craft", "Stone Carving", "Carpet Weaving", "Other"
];
const STATES = [
  "Andhra Pradesh", "Assam", "Bihar", "Chhattisgarh", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha",
  "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi"
];

export default function ArtisanOnboarding() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "", craft: "", materials: "", state: "", district: "", region: "",
    experience_years: 1, production_capacity: "", language: "Hindi, English", phone: "", bio: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { refreshUser } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const STEP_LABELS = [
    t("onboarding.step1", "About You"),
    t("onboarding.step2", "Your Craft"),
    t("onboarding.step3", "Your Story")
  ];

  const update = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setLoading(true); setError("");
    try {
      await apiCall("/artisan/onboarding", { method: "POST", body: JSON.stringify(form) });
      refreshUser();
      navigate("/artisan/dashboard");
    } catch (err: any) {
      setError(err.message || t("common.error", "Failed to save. Try again."));
      setLoading(false);
    }
  };

  const inputClass = "w-full border border-[#E8E6E1] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0B0B0F] transition bg-white text-[#0B0B0F] placeholder-[#6B6860]";
  const labelClass = "block text-xs font-semibold text-[#6B6860] uppercase tracking-wider mb-1.5";

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex flex-col">

      {/* ── Dark hero header ── */}
      <div className="bg-[#0B0B0F] px-4 pt-10 pb-8 relative">
        <div className="absolute top-4 right-4 z-20">
          <LanguageSelector variant="dark" compact={false} />
        </div>

        <div className="max-w-lg mx-auto text-center">
          <span
            className="text-2xl font-bold text-white tracking-tight"
            style={{ fontFamily: "Space Grotesk, sans-serif" }}
          >
            {t("brand.name", "KalaSaarthi")}
          </span>
          <p className="text-[#6B6860] text-sm mt-2">{t("brand.tagline", "Your guide to selling handcrafted art online")}</p>

          <h1
            className="text-white text-xl font-bold mt-6 mb-1"
            style={{ fontFamily: "Space Grotesk, sans-serif" }}
          >
            {t("onboarding.welcome", "Let's set up your artisan profile")}
          </h1>
          <p className="text-[#6B6860] text-sm">
            Step {step} of {STEP_LABELS.length} — {STEP_LABELS[step - 1]}
          </p>

          {/* Step dots */}
          <div className="flex items-center justify-center gap-3 mt-6">
            {STEP_LABELS.map((label, i) => {
              const isCompleted = step > i + 1;
              const isActive = step === i + 1;
              return (
                <div key={i} className="flex flex-col items-center gap-1.5">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isCompleted
                      ? "bg-[#7CE25B] text-[#0B0B0F]"
                      : isActive
                      ? "bg-white text-[#0B0B0F] ring-4 ring-white/20"
                      : "bg-white/10 text-white/40 border border-white/20"
                  }`}>
                    {isCompleted ? <CheckCircle size={14} /> : <span>{i + 1}</span>}
                  </div>
                  <span className={`text-xs hidden sm:block ${isActive ? "text-white" : "text-[#6B6860]"}`}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Progress bar */}
          <div className="mt-5 h-1 bg-white/10 rounded-full overflow-hidden max-w-xs mx-auto">
            <div
              className="h-full bg-[#7CE25B] rounded-full transition-all duration-500"
              style={{ width: `${((step - 1) / (STEP_LABELS.length - 1)) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Form card ── */}
      <div className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-lg">
          <div className="bg-white border border-[#E8E6E1] rounded-2xl p-6 sm:p-8 shadow-sm">

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm font-medium">
                {error}
              </div>
            )}

            {/* ── Step 1: About You ── */}
            {step === 1 && (
              <div>
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-[#0B0B0F]" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                    {t("profile.personalInfo", "Tell us about yourself")}
                  </h2>
                  <p className="text-[#6B6860] text-sm mt-1">This helps us personalise KalaSaarthi for you.</p>
                </div>
                <div className="space-y-5">
                  <div>
                    <label className={labelClass}>{t("auth.fullName", "Your Full Name")}</label>
                    <input
                      type="text"
                      className={inputClass}
                      placeholder="e.g. Ramesh Kumar"
                      value={form.name}
                      onChange={e => update("name", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t("cart.phone", "Phone Number")}</label>
                    <input
                      type="tel"
                      className={inputClass}
                      placeholder="e.g. 9876543210"
                      value={form.phone}
                      onChange={e => update("phone", e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>State</label>
                      <select
                        className={inputClass}
                        value={form.state}
                        onChange={e => update("state", e.target.value)}
                      >
                        <option value="">Select state</option>
                        {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>District / City</label>
                      <input
                        type="text"
                        className={inputClass}
                        placeholder="e.g. Varanasi"
                        value={form.district}
                        onChange={e => update("district", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 2: Your Craft ── */}
            {step === 2 && (
              <div>
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-[#0B0B0F]" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                    {t("profile.craftDetails", "Your Craft")}
                  </h2>
                  <p className="text-[#6B6860] text-sm mt-1">
                    Tell us what you create. This helps us show relevant tools, pricing, and opportunities.
                  </p>
                </div>
                <div className="space-y-5">
                  <div>
                    <label className={labelClass}>{t("profile.craftType", "Type of Craft")}</label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      {CRAFTS.map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => update("craft", c)}
                          className={`text-left px-3 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                            form.craft === c
                              ? "border-[#0B0B0F] bg-[#0B0B0F] text-white"
                              : "border-[#E8E6E1] text-[#0B0B0F] hover:border-[#0B0B0F]/40 hover:bg-[#F7F5F0]"
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>{t("addProduct.materials", "Materials You Use")}</label>
                    <input
                      type="text"
                      className={inputClass}
                      placeholder="e.g. Cotton, Silk, Natural dyes"
                      value={form.materials}
                      onChange={e => update("materials", e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>{t("profile.experience", "Years of Experience")}</label>
                      <input
                        type="number"
                        min={0}
                        max={60}
                        className={inputClass}
                        value={form.experience_years}
                        onChange={e => update("experience_years", parseInt(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t("profile.capacity", "Monthly Production")}</label>
                      <input
                        type="text"
                        className={inputClass}
                        placeholder="e.g. 20 sarees/month"
                        value={form.production_capacity}
                        onChange={e => update("production_capacity", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 3: Your Story ── */}
            {step === 3 && (
              <div>
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-[#0B0B0F]" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                    {t("profile.yourStory", "About Your Work")}
                  </h2>
                  <p className="text-[#6B6860] text-sm mt-1">A short bio helps buyers connect with your story.</p>
                </div>
                <div className="space-y-5">
                  <div>
                    <label className={labelClass}>Preferred Languages</label>
                    <input
                      type="text"
                      className={inputClass}
                      placeholder="e.g. Hindi, English, Marathi, Tamil"
                      value={form.language}
                      onChange={e => update("language", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Your Story <span className="normal-case font-normal text-[#6B6860]">(optional)</span></label>
                    <textarea
                      rows={5}
                      className={`${inputClass} resize-none`}
                      placeholder="Tell buyers about yourself, your craft tradition, and what makes your work unique..."
                      value={form.bio}
                      onChange={e => update("bio", e.target.value)}
                    />
                  </div>
                </div>

                {/* Preview card */}
                <div className="mt-6 p-5 bg-[#7CE25B]/10 border border-[#7CE25B]/30 rounded-2xl">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#4caf30] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-[#0B0B0F] text-sm" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                        Profile Preview
                      </p>
                      <p className="text-sm text-[#6B6860] mt-1">
                        <strong className="text-[#0B0B0F]">{form.name || "Your Name"}</strong>
                        {" · "}{form.craft || "Craft"}
                        {" · "}{form.district && form.state ? `${form.district}, ${form.state}` : "Location"}
                        {" · "}{form.experience_years} yrs experience
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Navigation ── */}
            <div className="flex justify-between mt-8">
              {step > 1 ? (
                <button
                  onClick={() => setStep(s => s - 1)}
                  className="flex items-center gap-1.5 px-4 py-2.5 border border-[#E8E6E1] rounded-xl font-medium text-[#6B6860] hover:text-[#0B0B0F] hover:bg-[#F7F5F0] transition text-sm cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> {t("common.back", "Back")}
                </button>
              ) : (
                <div />
              )}

              {step < 3 ? (
                <button
                  onClick={() => setStep(s => s + 1)}
                  disabled={step === 1 && !form.name}
                  className="bg-[#7CE25B] text-[#0B0B0F] font-semibold px-5 py-2.5 rounded-xl hover:bg-[#6dd44f] disabled:opacity-40 transition flex items-center gap-2 text-sm cursor-pointer"
                >
                  {t("common.continue", "Continue")} <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-[#7CE25B] text-[#0B0B0F] font-semibold px-5 py-2.5 rounded-xl hover:bg-[#6dd44f] disabled:opacity-40 transition flex items-center gap-2 text-sm cursor-pointer"
                >
                  {loading
                    ? <><Loader className="w-4 h-4 animate-spin" /> {t("common.saving", "Saving…")}</>
                    : <>{t("onboarding.complete", "Complete Setup")} <ArrowRight className="w-4 h-4" /></>}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
