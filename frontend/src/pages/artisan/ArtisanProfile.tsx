import { useEffect, useState } from "react";
import { useAuth } from "../../AuthContext";
import { useLanguage } from "../../i18n/LanguageContext";
import { apiCall } from "../../api";
import ArtisanLayout from "../../components/ArtisanLayout";
import { Save, CheckCircle } from "lucide-react";

const CRAFTS = [
  "Handloom Weaving", "Embroidery", "Pottery / Terracotta", "Woodcarving",
  "Metal Craft", "Jewelry Making", "Leather Work", "Painting / Miniature",
  "Block Printing", "Bamboo / Cane Craft", "Stone Carving", "Carpet Weaving", "Other",
];
const STATES = [
  "Andhra Pradesh", "Assam", "Bihar", "Chhattisgarh", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha",
  "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi",
];

export default function ArtisanProfile() {
  const { user, refreshUser } = useAuth();
  const { t } = useLanguage();
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user?.profile) setForm({ ...user.profile });
  }, [user]);

  const update = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true); setSaved(false);
    try {
      await apiCall("/artisan/profile", { method: "PUT", body: JSON.stringify(form) });
      refreshUser();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      alert(t("common.error", "Save failed: ") + err.message);
    } finally {
      setSaving(false);
    }
  };

  const initials = (form.name || user?.email || "A").charAt(0).toUpperCase();

  const inputClass =
    "w-full border border-[#E8E6E1] rounded-xl px-4 py-3 text-sm text-[#0B0B0F] placeholder-[#6B6860] bg-white focus:outline-none focus:border-[#0B0B0F] transition";

  const Field = ({ label, keyName, type = "text", placeholder = "" }: { label: string; keyName: string; type?: string; placeholder?: string }) => (
    <div>
      <label className="block text-xs font-bold text-[#6B6860] uppercase tracking-wider mb-2">{label}</label>
      <input
        type={type}
        className={inputClass}
        value={form[keyName] || ""}
        onChange={e => update(keyName, e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );

  return (
    <ArtisanLayout>
      <div className="max-w-2xl mx-auto">
        {/* Profile card */}
        <div className="bg-white border border-[#E8E6E1] rounded-2xl p-6 mb-6 flex items-center gap-5">
          {/* Gradient avatar */}
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #7CE25B, #3FC7E9)" }}
          >
            {initials}
          </div>
          <div>
            <h1
              className="text-xl font-bold text-[#0B0B0F]"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {form.name || t("profile.title", "Artisan Profile")}
            </h1>
            {form.craft && (
              <p className="text-sm text-[#6B6860] mt-0.5">{form.craft}</p>
            )}
            {(form.district || form.state) && (
              <p className="text-xs text-[#6B6860] mt-0.5">
                {[form.district, form.state].filter(Boolean).join(", ")}
              </p>
            )}
            {form.bio && (
              <p className="text-xs text-[#6B6860] mt-1.5 line-clamp-2 max-w-sm">{form.bio}</p>
            )}
          </div>
        </div>

        {/* Success notice */}
        {saved && (
          <div className="flex items-center gap-3 bg-[#7CE25B]/15 border border-[#7CE25B]/40 text-[#2a7a10] px-5 py-4 rounded-2xl mb-6 text-sm font-medium">
            <CheckCircle className="w-5 h-5 flex-shrink-0" /> {t("profile.savedSuccess", "Profile updated successfully!")}
          </div>
        )}

        {/* Edit form */}
        <div className="bg-white border border-[#E8E6E1] rounded-2xl p-8 space-y-8">
          {/* Personal */}
          <section>
            <h2
              className="text-base font-bold text-[#0B0B0F] mb-5 pb-3 border-b border-[#E8E6E1]"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {t("profile.personalInfo", "Personal Information")}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label={t("auth.fullName", "Full Name")} keyName="name" placeholder="Your name" />
              <Field label={t("cart.phone", "Phone Number")} keyName="phone" type="tel" placeholder="+91 XXXXX XXXXX" />
              <div>
                <label className="block text-xs font-bold text-[#6B6860] uppercase tracking-wider mb-2">State</label>
                <select
                  className={inputClass}
                  value={form.state || ""}
                  onChange={e => update("state", e.target.value)}
                >
                  <option value="">Select state</option>
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <Field label="District / City" keyName="district" placeholder="e.g. Varanasi" />
              <Field label="Region" keyName="region" placeholder="e.g. Eastern UP" />
              <Field label="Languages" keyName="language" placeholder="e.g. Hindi, English" />
            </div>
          </section>

          {/* Craft */}
          <section>
            <h2
              className="text-base font-bold text-[#0B0B0F] mb-5 pb-3 border-b border-[#E8E6E1]"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {t("profile.craftDetails", "Craft Details")}
            </h2>
            <div className="mb-5">
              <label className="block text-xs font-bold text-[#6B6860] uppercase tracking-wider mb-3">
                {t("profile.craftType", "Type of Craft")}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {CRAFTS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => update("craft", c)}
                    className={`text-left px-4 py-2.5 rounded-xl text-sm font-medium border transition ${
                      form.craft === c
                        ? "border-[#0B0B0F] bg-[#0B0B0F] text-white"
                        : "border-[#E8E6E1] text-[#6B6860] hover:border-[#0B0B0F] hover:text-[#0B0B0F]"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label={t("addProduct.materials", "Materials Used")} keyName="materials" placeholder="e.g. Cotton, Silk, Bamboo" />
              <div>
                <label className="block text-xs font-bold text-[#6B6860] uppercase tracking-wider mb-2">
                  {t("profile.experience", "Years of Experience")}
                </label>
                <input
                  type="number"
                  min={0}
                  max={60}
                  className={inputClass}
                  value={form.experience_years || 0}
                  onChange={e => update("experience_years", parseInt(e.target.value))}
                />
              </div>
              <Field label={t("profile.capacity", "Monthly Production Capacity")} keyName="production_capacity" placeholder="e.g. 20 sarees/month" />
            </div>
          </section>

          {/* Bio */}
          <section>
            <h2
              className="text-base font-bold text-[#0B0B0F] mb-5 pb-3 border-b border-[#E8E6E1]"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {t("profile.yourStory", "Your Story")}
            </h2>
            <div>
              <label className="block text-xs font-bold text-[#6B6860] uppercase tracking-wider mb-2">Bio</label>
              <textarea
                rows={5}
                placeholder="Tell buyers about yourself, your craft tradition, and what makes your work special..."
                className={`${inputClass} resize-none`}
                value={form.bio || ""}
                onChange={e => update("bio", e.target.value)}
              />
            </div>
          </section>

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-[#7CE25B] text-[#0B0B0F] font-bold py-4 rounded-xl text-sm hover:brightness-95 disabled:opacity-60 transition cursor-pointer"
          >
            <Save className="w-5 h-5" />
            {saving ? t("common.saving", "Saving...") : t("common.save", "Save Profile")}
          </button>
        </div>
      </div>
    </ArtisanLayout>
  );
}
