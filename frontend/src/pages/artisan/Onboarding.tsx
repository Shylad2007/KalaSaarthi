import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import { apiCall } from "../../api";
import { CheckCircle, ArrowRight } from "lucide-react";

const CRAFTS = ["Handloom Weaving", "Embroidery", "Pottery / Terracotta", "Woodcarving", "Metal Craft", "Jewelry Making", "Leather Work", "Painting / Miniature", "Block Printing", "Bamboo / Cane Craft", "Stone Carving", "Carpet Weaving", "Other"];
const STATES = ["Andhra Pradesh", "Assam", "Bihar", "Chhattisgarh", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi"];

export default function ArtisanOnboarding() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "", craft: "", materials: "", state: "", district: "", region: "",
    experience_years: 1, production_capacity: "", language: "Hindi, English", phone: "", bio: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { refreshUser } = useAuth();
  const navigate = useNavigate();

  const update = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setLoading(true); setError("");
    try {
      await apiCall("/artisan/onboarding", { method: "POST", body: JSON.stringify(form) });
      refreshUser();
      navigate("/artisan/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to save. Try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <span className="text-3xl font-extrabold text-primary">KalaSaarthi</span>
          <p className="text-gray-600 mt-2">Let's set up your artisan profile</p>
        </div>

        {/* Step indicator */}
        <div className="flex justify-center mb-8 space-x-2">
          {[1, 2, 3].map(s => (
            <div key={s} className={`h-2 w-16 rounded-full transition-all ${step >= s ? 'bg-primary' : 'bg-gray-200'}`} />
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm font-medium">{error}</div>}

          {step === 1 && (
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Tell us about yourself</h2>
              <p className="text-gray-500 mb-8">This helps us personalise KalaSaarthi for you.</p>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Your Full Name</label>
                  <input type="text" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-primary focus:outline-none transition" value={form.name} onChange={e => update("name", e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                  <input type="tel" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-primary focus:outline-none transition" value={form.phone} onChange={e => update("phone", e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">State</label>
                    <select className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-primary focus:outline-none transition bg-white" value={form.state} onChange={e => update("state", e.target.value)}>
                      <option value="">Select state</option>
                      {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">District / City</label>
                    <input type="text" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-primary focus:outline-none transition" value={form.district} onChange={e => update("district", e.target.value)} placeholder="e.g. Varanasi" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Your Craft</h2>
              <p className="text-gray-500 mb-8">Tell us about what you create. This helps us show you relevant tools, pricing, and opportunities.</p>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Type of Craft</label>
                  <div className="grid grid-cols-2 gap-2">
                    {CRAFTS.map(c => (
                      <button key={c} type="button" onClick={() => update("craft", c)}
                        className={`text-left px-4 py-3 rounded-xl text-sm font-medium border-2 transition ${form.craft === c ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 hover:border-gray-300'}`}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Materials You Use</label>
                  <input type="text" placeholder="e.g. Cotton, Silk, Natural dyes" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-primary focus:outline-none transition" value={form.materials} onChange={e => update("materials", e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Years of Experience</label>
                    <input type="number" min={0} max={60} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-primary focus:outline-none transition" value={form.experience_years} onChange={e => update("experience_years", parseInt(e.target.value))} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Monthly Production</label>
                    <input type="text" placeholder="e.g. 20 sarees/month" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-primary focus:outline-none transition" value={form.production_capacity} onChange={e => update("production_capacity", e.target.value)} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-2">About Your Work</h2>
              <p className="text-gray-500 mb-8">A short bio helps buyers connect with your story.</p>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Preferred Languages</label>
                  <input type="text" placeholder="e.g. Hindi, English, Telugu" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-primary focus:outline-none transition" value={form.language} onChange={e => update("language", e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Your Story (optional)</label>
                  <textarea rows={5} placeholder="Tell buyers about yourself, your craft tradition, and what makes your work unique..." className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-primary focus:outline-none transition resize-none" value={form.bio} onChange={e => update("bio", e.target.value)} />
                </div>
              </div>

              <div className="mt-8 p-5 bg-green-50 rounded-2xl border border-green-200">
                <div className="flex items-start space-x-4">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-green-900">Profile Preview</p>
                    <p className="text-sm text-green-700 mt-1">
                      <strong>{form.name || "Your Name"}</strong> • {form.craft || "Craft"} • {form.district && form.state ? `${form.district}, ${form.state}` : "Location"} • {form.experience_years} years experience
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8">
            {step > 1 ? (
              <button onClick={() => setStep(s => s - 1)} className="px-6 py-3 border-2 border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition">
                Back
              </button>
            ) : <div />}

            {step < 3 ? (
              <button onClick={() => setStep(s => s + 1)} disabled={step === 1 && !form.name} className="bg-primary text-white font-bold px-8 py-3 rounded-xl hover:bg-secondary disabled:opacity-50 transition flex items-center shadow-lg shadow-primary/20">
                Continue <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading} className="bg-primary text-white font-bold px-8 py-3 rounded-xl hover:bg-secondary disabled:opacity-50 transition flex items-center shadow-lg shadow-primary/20">
                {loading ? "Saving..." : "Complete Setup"} <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
