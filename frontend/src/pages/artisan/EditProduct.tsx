import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, CheckCircle, UploadCloud, Image as ImageIcon } from "lucide-react";
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
        // Pre-populate existing image
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
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </ArtisanLayout>
    );

  return (
    <ArtisanLayout>
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate("/artisan/products")}
          className="mb-6 flex items-center text-gray-500 hover:text-primary transition font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Catalogue
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Edit Product</h1>
          <p className="text-gray-500 text-sm mb-8">Update details and save. Changes appear immediately in the marketplace once published.</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm font-medium">
              {error}
            </div>
          )}

          <div className="space-y-5">
            {/* Image Section */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Product Image</label>
              <div className="flex items-start gap-4">
                <div className="w-28 h-28 rounded-xl border-2 border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center flex-shrink-0">
                  {imgUrl
                    ? <img src={imgUrl} alt="Product" className="w-full h-full object-cover" />
                    : <ImageIcon className="w-8 h-8 text-gray-300" />
                  }
                </div>
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
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-dashed border-gray-300 text-gray-600 hover:border-primary hover:text-primary transition text-sm font-medium disabled:opacity-50"
                  >
                    <UploadCloud className="w-4 h-4" />
                    {imgUploading ? "Uploading…" : imgUrl ? "Replace Image" : "Upload Image"}
                  </button>
                  <p className="text-xs text-gray-400 mt-2">JPEG, PNG, WebP, GIF · max 10 MB</p>
                  {imgError && <p className="text-xs text-red-600 mt-1 font-medium">{imgError}</p>}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Product Name</label>
              <input
                type="text"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-primary focus:outline-none transition"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
              <select
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-primary focus:outline-none transition"
                value={form.category}
                onChange={(e) => handleChange("category", e.target.value)}
              >
                <option value="">Select category</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
              <textarea
                rows={4}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-primary focus:outline-none transition resize-none"
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Materials</label>
                <input
                  type="text"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-primary focus:outline-none transition"
                  placeholder="e.g. Cotton, Silk"
                  value={form.materials}
                  onChange={(e) => handleChange("materials", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Color</label>
                <input
                  type="text"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-primary focus:outline-none transition"
                  placeholder="e.g. Red, Blue"
                  value={form.color}
                  onChange={(e) => handleChange("color", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Production Time</label>
                <input
                  type="text"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-primary focus:outline-none transition"
                  placeholder="e.g. 3 days, 1 week"
                  value={form.production_time}
                  onChange={(e) => handleChange("production_time", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Price (₹)</label>
                <input
                  type="number"
                  min="0"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-primary focus:outline-none transition"
                  value={form.final_price}
                  onChange={(e) => handleChange("final_price", e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Tags</label>
              <input
                type="text"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-primary focus:outline-none transition"
                placeholder="e.g. handmade, artisan, traditional"
                value={form.tags}
                onChange={(e) => handleChange("tags", e.target.value)}
              />
            </div>

            <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4 border border-gray-200">
              <input
                type="checkbox"
                id="is_published"
                className="w-4 h-4 accent-primary"
                checked={form.is_published}
                onChange={(e) => handleChange("is_published", e.target.checked)}
              />
              <label htmlFor="is_published" className="text-sm font-medium text-gray-700 cursor-pointer">
                Published — visible in the marketplace
              </label>
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <button
              onClick={handleSave}
              disabled={saving}
              className={`flex-1 flex items-center justify-center py-4 rounded-xl font-bold transition shadow-lg disabled:opacity-60 ${
                saved
                  ? "bg-green-600 text-white shadow-green-600/25"
                  : "bg-primary text-white hover:bg-secondary shadow-primary/25"
              }`}
            >
              {saving ? (
                "Saving…"
              ) : saved ? (
                <><CheckCircle className="w-5 h-5 mr-2" /> Saved!</>
              ) : (
                <><Save className="w-5 h-5 mr-2" /> Save Changes</>
              )}
            </button>
            <button
              onClick={() => navigate("/artisan/products")}
              className="px-6 py-4 rounded-xl font-bold border-2 border-gray-200 text-gray-600 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </ArtisanLayout>
  );
}
