import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, CheckCircle, UploadCloud, Image as ImageIcon, Loader } from "lucide-react";
import { apiCall, uploadCall } from "../../api";
import ArtisanLayout from "../../components/ArtisanLayout";

const CATEGORIES = ["Textiles", "Pottery", "Jewelry", "Woodwork", "Metalwork", "Painting", "Weaving", "Embroidery", "Leather", "Other"];

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [imgUrl, setImgUrl] = useState("");
  const [imgUploading, setImgUploading] = useState(false);
  const [imgError, setImgError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: "",
    category: "",
    description: "",
    materials: "",
    color: "",
    production_time: "",
    tags: "",
    final_price: "" as string | number,
    is_published: false,
  });

  useEffect(() => {
    apiCall(`/products/${id}`)
      .then((p) => {
        setForm({
          name: p.name || "",
          category: p.category || "",
          description: p.description || "",
          materials: p.materials || "",
          color: p.color || "",
          production_time: p.production_time || "",
          tags: p.tags || "",
          final_price: p.final_price ?? "",
          is_published: p.is_published || false,
        });
        if (p.images?.[0]?.url) setImgUrl(p.images[0].url);
      })
      .catch(() => setError("Could not load product."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (field: string, value: string | boolean) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImgUploading(true);
    setImgError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await uploadCall(`/products/${id}/image`, fd);
      setImgUrl(res.url);
    } catch (err: any) {
      setImgError(err.message || "Image upload failed.");
    } finally {
      setImgUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      await apiCall(`/products/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          ...form,
          final_price: form.final_price === "" ? null : Number(form.final_price),
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <ArtisanLayout>
        <div className="flex items-center justify-center py-24">
          <Loader className="w-7 h-7 animate-spin text-[#7CE25B]" />
        </div>
      </ArtisanLayout>
    );

  const inputClass = "w-full border border-[#E8E6E1] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0B0B0F] transition bg-white text-[#0B0B0F] placeholder-[#6B6860]";
  const labelClass = "block text-xs font-semibold text-[#6B6860] uppercase tracking-wider mb-1.5";

  return (
    <ArtisanLayout>
      <div className="max-w-2xl mx-auto px-2 pb-16">
        {/* Back */}
        <button
          onClick={() => navigate("/artisan/products")}
          className="mb-6 flex items-center gap-1.5 text-[#6B6860] hover:text-[#0B0B0F] transition text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> My Catalogue
        </button>

        {/* Heading */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#0B0B0F]" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
            Edit Product
          </h1>
          <p className="text-[#6B6860] text-sm mt-1">
            Update details and save. Changes appear immediately once published.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-5 text-sm font-medium">
            {error}
          </div>
        )}

        <div className="bg-white border border-[#E8E6E1] rounded-2xl p-6 sm:p-8 space-y-6">

          {/* ── Image Section ── */}
          <div>
            <label className={labelClass}>Product Image</label>
            <div className="flex items-start gap-5">
              {/* Thumbnail */}
              <div className="w-28 h-28 rounded-xl border border-[#E8E6E1] overflow-hidden bg-[#F7F5F0] flex items-center justify-center flex-shrink-0">
                {imgUrl
                  ? <img src={imgUrl} alt="Product" className="w-full h-full object-cover" />
                  : <ImageIcon className="w-8 h-8 text-[#6B6860]" />}
              </div>
              {/* Upload trigger */}
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={imgUploading}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-[#E8E6E1] text-[#6B6860] hover:border-[#0B0B0F] hover:text-[#0B0B0F] transition text-sm font-medium disabled:opacity-50"
                >
                  {imgUploading ? <Loader className="w-4 h-4 animate-spin text-[#7CE25B]" /> : <UploadCloud className="w-4 h-4" />}
                  {imgUploading ? "Uploading…" : imgUrl ? "Replace Image" : "Upload Image"}
                </button>
                <p className="text-xs text-[#6B6860] mt-2">JPEG, PNG, WebP, GIF · max 10 MB</p>
                {imgError && <p className="text-xs text-red-600 mt-1 font-medium">{imgError}</p>}
              </div>
            </div>
          </div>

          {/* ── Name & Category ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Product Name</label>
              <input
                type="text"
                className={inputClass}
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="e.g. Banarasi Silk Saree"
              />
            </div>
            <div>
              <label className={labelClass}>Category</label>
              <select
                className={inputClass}
                value={form.category}
                onChange={(e) => handleChange("category", e.target.value)}
              >
                <option value="">Select category</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* ── Description ── */}
          <div>
            <label className={labelClass}>Description</label>
            <textarea
              rows={4}
              className={`${inputClass} resize-none`}
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Describe the product, its story, and what makes it special…"
            />
          </div>

          {/* ── Materials & Color ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Materials</label>
              <input
                type="text"
                className={inputClass}
                placeholder="e.g. Cotton, Silk"
                value={form.materials}
                onChange={(e) => handleChange("materials", e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Color</label>
              <input
                type="text"
                className={inputClass}
                placeholder="e.g. Red, Blue"
                value={form.color}
                onChange={(e) => handleChange("color", e.target.value)}
              />
            </div>
          </div>

          {/* ── Production Time & Price ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Production Time</label>
              <input
                type="text"
                className={inputClass}
                placeholder="e.g. 3 days, 1 week"
                value={form.production_time}
                onChange={(e) => handleChange("production_time", e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Price (₹)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B6860] font-medium text-sm">₹</span>
                <input
                  type="number"
                  min="0"
                  className={`${inputClass} pl-8`}
                  value={form.final_price}
                  onChange={(e) => handleChange("final_price", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* ── Tags ── */}
          <div>
            <label className={labelClass}>Tags</label>
            <input
              type="text"
              className={inputClass}
              placeholder="e.g. handmade, artisan, traditional"
              value={form.tags}
              onChange={(e) => handleChange("tags", e.target.value)}
            />
            <p className="text-xs text-[#6B6860] mt-1.5">Separate tags with commas</p>
          </div>

          {/* ── Published toggle ── */}
          <div className={`flex items-center gap-3 p-4 rounded-xl border transition-colors ${
            form.is_published ? "bg-[#7CE25B]/10 border-[#7CE25B]/30" : "bg-[#F7F5F0] border-[#E8E6E1]"
          }`}>
            <button
              type="button"
              onClick={() => handleChange("is_published", !form.is_published)}
              className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                form.is_published ? "bg-[#7CE25B]" : "bg-[#E8E6E1]"
              }`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                form.is_published ? "translate-x-5" : "translate-x-0"
              }`} />
            </button>
            <div>
              <p className="text-sm font-semibold text-[#0B0B0F]">
                {form.is_published ? "Published" : "Draft"}
              </p>
              <p className="text-xs text-[#6B6860]">
                {form.is_published ? "Visible in the marketplace" : "Not yet visible to buyers"}
              </p>
            </div>
          </div>

          {/* ── Actions ── */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition text-sm ${
                saved
                  ? "bg-[#7CE25B] text-[#0B0B0F]"
                  : "bg-[#0B0B0F] text-white hover:bg-[#1a1a1f]"
              } disabled:opacity-60`}
            >
              {saving ? (
                <><Loader className="w-4 h-4 animate-spin" /> Saving…</>
              ) : saved ? (
                <><CheckCircle className="w-4 h-4" /> Saved!</>
              ) : (
                <><Save className="w-4 h-4" /> Save Changes</>
              )}
            </button>
            <button
              onClick={() => navigate("/artisan/products")}
              className="px-5 py-3 rounded-xl font-semibold border border-[#E8E6E1] text-[#6B6860] hover:bg-[#F7F5F0] transition text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </ArtisanLayout>
  );
}
