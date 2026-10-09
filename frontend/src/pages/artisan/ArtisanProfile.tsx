import { useEffect, useState } from "react";
import { useAuth } from "../../AuthContext";
import { apiCall } from "../../api";
import ArtisanLayout from "../../components/ArtisanLayout";
import { Save, CheckCircle, User } from "lucide-react";

const CRAFTS = ["Handloom Weaving", "Embroidery", "Pottery / Terracotta", "Woodcarving", "Metal Craft", "Jewelry Making", "Leather Work", "Painting / Miniature", "Block Printing", "Bamboo / Cane Craft", "Stone Carving", "Carpet Weaving", "Other"];
const STATES = ["Andhra Pradesh", "Assam", "Bihar", "Chhattisgarh", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi"];

export default function ArtisanProfile() {
  const { user, refreshUser } = useAuth();
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
      alert("Save failed: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const field = (label: string, key: string, type = "text", placeholder = "") => (
    <div>
      <label className="block text-sm font-bold text-gray-700 mb-2">{label}</label>
      <input type={type} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-primary focus:outline-none transition" value={form[key] || ""} onChange={e => update(key, e.target.value)} placeholder={placeholder} />
    </div>
  );

  return (
    <ArtisanLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 flex items-center gap-4">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary text-2xl font-extrabold">
            {(form.name || user?.email || "A").charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">My Profile</h1>
            <p className="text-gray-500">{user?.email}</p>
          </div>
        </div>

        {saved && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-5 py-4 rounded-2xl mb-6 flex items-center font-medium">
            <CheckCircle className="w-5 h-5 mr-2" /> Profile saved successfully!
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-8">
          {/* Personal */}
          <section>
            <h2 className="text-lg font-extrabold text-gray-900 mb-5 pb-3 border-b border-gray-100">Personal Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {field("Full Name", "name", "text", "Your name")}
              {field("Phone Number", "phone", "tel", "+91 XXXXX XXXXX")}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">State</label>
                <select className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-primary focus:outline-none transition bg-white" value={form.state || ""} onChange={e => update("state", e.target.value)}>
                  <option value="">Select state</option>
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              {field("District / City", "district", "text", "e.g. Varanasi")}
              {field("Region", "region", "text", "e.g. Eastern UP")}
              {field("Languages", "language", "text", "e.g. Hindi, English")}
            </div>
          </section>

          {/* Craft */}
          <section>
            <h2 className="text-lg font-extrabold text-gray-900 mb-5 pb-3 border-b border-gray-100">Craft Details</h2>
            <div className="mb-5">
              <label className="block text-sm font-bold text-gray-700 mb-3">Type of Craft</label>
              <div className="grid grid-cols-2 gap-2">
                {CRAFTS.map(c => (
                  <button key={c} type="button" onClick={() => update("craft", c)}
                    className={`text-left px-4 py-2.5 rounded-xl text-sm font-medium border-2 transition ${form.craft === c ? "border-primary bg-primary/5 text-primary" : "border-gray-200 hover:border-gray-300"}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {field("Materials Used", "materials", "text", "e.g. Cotton, Silk, Bamboo")}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Years of Experience</label>
                <input type="number" min={0} max={60} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-primary focus:outline-none transition" value={form.experience_years || 0} onChange={e => update("experience_years", parseInt(e.target.value))} />
              </div>
              {field("Monthly Production Capacity", "production_capacity", "text", "e.g. 20 sarees/month")}
            </div>
          </section>

          {/* Bio */}
          <section>
            <h2 className="text-lg font-extrabold text-gray-900 mb-5 pb-3 border-b border-gray-100">Your Story</h2>
            <textarea
              rows={5}
              placeholder="Tell buyers about yourself, your craft tradition, and what makes your work special..."
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-primary focus:outline-none transition resize-none"
              value={form.bio || ""}
              onChange={e => update("bio", e.target.value)}
            />
          </section>

          <button onClick={handleSave} disabled={saving} className="w-full bg-primary text-white font-bold py-4 rounded-xl hover:bg-secondary disabled:opacity-60 flex items-center justify-center shadow-lg shadow-primary/20 transition">
            <Save className="w-5 h-5 mr-2" />{saving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </div>
    </ArtisanLayout>
  );
}
