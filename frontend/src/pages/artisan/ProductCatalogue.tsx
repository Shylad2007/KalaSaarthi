import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../i18n/LanguageContext";
import { apiCall } from "../../api";
import ArtisanLayout from "../../components/ArtisanLayout";
import { Plus, Package, Edit, Eye, EyeOff, Activity } from "lucide-react";

type Filter = "all" | "published" | "drafts";

export default function ProductCatalogue() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const { t, formatCurrency } = useLanguage();

  useEffect(() => {
    apiCall("/products/my").then(setProducts).catch(console.error).finally(() => setLoading(false));
  }, []);

  const togglePublish = async (p: any) => {
    await apiCall(`/products/${p.id}`, { method: "PUT", body: JSON.stringify({ is_published: !p.is_published }) });
    setProducts(prev => prev.map(x => x.id === p.id ? { ...x, is_published: !x.is_published } : x));
  };

  const healthColor = (score: number | null) => {
    if (!score) return "text-[#6B6860]";
    if (score >= 80) return "text-[#7CE25B]";
    if (score >= 60) return "text-[#3FC7E9]";
    if (score >= 40) return "text-amber-500";
    return "text-red-500";
  };

  const filtered = filter === "published"
    ? products.filter(p => p.is_published)
    : filter === "drafts"
    ? products.filter(p => !p.is_published)
    : products;

  const tabs: { key: Filter; label: string }[] = [
    { key: "all", label: t("catalogue.filterAll", "All") },
    { key: "published", label: t("catalogue.filterPublished", "Published") },
    { key: "drafts", label: t("catalogue.filterDrafts", "Drafts") },
  ];

  return (
    <ArtisanLayout>
      {/* Header */}
      <div className="flex flex-wrap justify-between items-start gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1
              className="text-2xl font-bold text-[#0B0B0F]"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {t("catalogue.title", "My Catalogue")}
            </h1>
            <span className="text-xs font-bold bg-[#0B0B0F] text-white px-2.5 py-1 rounded-full">
              {products.length}
            </span>
          </div>
          <p className="text-sm text-[#6B6860] mt-1">
            {products.filter(p => p.is_published).length} {t("artisan.statPublished", "published")} · {products.filter(p => !p.is_published).length} {t("artisan.statDrafts", "drafts")}
          </p>
        </div>
        <Link
          to="/artisan/add-product"
          className="flex items-center gap-2 bg-[#7CE25B] text-[#0B0B0F] font-semibold px-5 py-2.5 rounded-xl text-sm hover:brightness-95 transition"
        >
          <Plus className="w-4 h-4" /> {t("nav.addProduct", "Add Product")}
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map(tTab => (
          <button
            key={tTab.key}
            onClick={() => setFilter(tTab.key)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
              filter === tTab.key
                ? "bg-[#0B0B0F] text-white"
                : "bg-white border border-[#E8E6E1] text-[#6B6860] hover:border-[#0B0B0F] hover:text-[#0B0B0F]"
            }`}
          >
            {tTab.label}
            {tTab.key !== "all" && (
              <span className={`ml-1.5 text-xs ${filter === tTab.key ? "opacity-70" : "opacity-50"}`}>
                {tTab.key === "published" ? products.filter(p => p.is_published).length : products.filter(p => !p.is_published).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white border border-[#E8E6E1] rounded-2xl overflow-hidden animate-pulse">
              <div className="aspect-[4/3] bg-[#F7F5F0]" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-[#E8E6E1] rounded w-3/4" />
                <div className="h-3 bg-[#E8E6E1] rounded w-1/2" />
                <div className="h-8 bg-[#E8E6E1] rounded-xl mt-2" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-[#E8E6E1] rounded-2xl p-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#F7F5F0] flex items-center justify-center mx-auto mb-4">
            <Package className="w-7 h-7 text-[#6B6860]" />
          </div>
          <h3
            className="text-lg font-bold text-[#0B0B0F] mb-2"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {filter === "all" ? t("artisan.noProducts", "No products yet") : filter === "published" ? "No published products" : "No draft products"}
          </h3>
          <p className="text-sm text-[#6B6860] mb-6">
            {filter === "all" ? t("artisan.addFirstProduct", "Add your first product to start selling.") : filter === "published" ? "Publish a product to see it here." : "Save a draft to see it here."}
          </p>
          {filter === "all" && (
            <Link
              to="/artisan/add-product"
              className="inline-flex items-center gap-2 bg-[#7CE25B] text-[#0B0B0F] font-semibold px-5 py-2.5 rounded-xl text-sm hover:brightness-95 transition"
            >
              <Plus className="w-4 h-4" /> {t("artisan.addFirstProduct", "Add First Product")}
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(p => (
            <div
              key={p.id}
              className="bg-white border border-[#E8E6E1] rounded-2xl overflow-hidden group hover:shadow-lg hover:shadow-black/5 transition"
            >
              {/* Image */}
              <div className="aspect-[4/3] bg-[#F7F5F0] relative overflow-hidden">
                {p.images?.[0]?.url ? (
                  <img
                    src={p.images[0].url}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Package className="w-10 h-10 text-[#E8E6E1]" />
                  </div>
                )}
                {/* Status chip */}
                <span
                  className={`absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    p.is_published
                      ? "bg-[#7CE25B]/90 text-[#0B0B0F]"
                      : "bg-white/90 text-[#6B6860] border border-[#E8E6E1]"
                  }`}
                >
                  {p.is_published ? t("artisan.published", "Published") : t("artisan.draft", "Draft")}
                </span>
              </div>

              {/* Body */}
              <div className="p-5">
                <h3
                  className="font-bold text-[#0B0B0F] truncate mb-1 text-sm"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {p.name || "Untitled"}
                </h3>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-medium bg-[#F7F5F0] text-[#6B6860] px-2 py-0.5 rounded-full">
                    {p.category || "Uncategorized"}
                  </span>
                  {p.final_price && (
                    <span className="text-sm font-bold text-[#0B0B0F]">{formatCurrency(p.final_price)}</span>
                  )}
                </div>

                {p.image_quality_score != null && (
                  <div className="flex items-center text-xs mb-3 gap-1">
                    <Activity className={`w-3.5 h-3.5 ${healthColor(p.image_quality_score)}`} />
                    <span className={`font-medium ${healthColor(p.image_quality_score)}`}>
                      {t("detail.qualityScore", "Image score")}: {p.image_quality_score}/100
                    </span>
                  </div>
                )}

                <div className="flex gap-2">
                  <Link
                    to={`/artisan/edit-product/${p.id}`}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#F7F5F0] text-[#0B0B0F] hover:bg-[#E8E6E1] transition"
                  >
                    <Edit className="w-3.5 h-3.5" /> {t("common.edit", "Edit")}
                  </Link>
                  <button
                    onClick={() => togglePublish(p)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition ${
                      p.is_published
                        ? "bg-[#F7F5F0] text-[#6B6860] hover:bg-[#E8E6E1]"
                        : "bg-[#7CE25B]/15 text-[#2a7a10] hover:bg-[#7CE25B]/25"
                    }`}
                  >
                    {p.is_published ? (
                      <><EyeOff className="w-3.5 h-3.5" /> {t("artisan.unpublish", "Unpublish")}</>
                    ) : (
                      <><Eye className="w-3.5 h-3.5" /> {t("artisan.publish", "Publish")}</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </ArtisanLayout>
  );
}
