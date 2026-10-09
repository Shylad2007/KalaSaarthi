import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import { useLanguage } from "../../i18n/LanguageContext";
import { LanguageSelector } from "../../components/LanguageSelector";
import { apiCall } from "../../api";
import { ShoppingCart, ArrowLeft, MapPin, CheckCircle, Package, Star, Minus, Plus } from "lucide-react";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const { user } = useAuth();
  const { t, formatCurrency } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    apiCall(`/products/${id}`).then(setProduct).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  const addToCart = async () => {
    if (!user) { navigate("/buyer/login"); return; }
    if (user.role !== "buyer") { alert(t("common.error", "Please sign in as a buyer to add items to cart.")); return; }
    setAdding(true);
    try {
      await apiCall("/cart", { method: "POST", body: JSON.stringify({ product_id: product.id, quantity }) });
      setAdded(true);
      setTimeout(() => setAdded(false), 3000);
    } catch (err: any) {
      alert(t("common.error", "Could not add to cart: ") + err.message);
    } finally {
      setAdding(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#E8E6E1] border-t-[#7CE25B] rounded-full animate-spin" />
    </div>
  );

  if (!product) return (
    <div className="min-h-screen bg-[#F7F5F0] flex flex-col items-center justify-center gap-3">
      <p className="text-5xl">🧶</p>
      <p style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700 }} className="text-xl text-[#0B0B0F]">
        {t("market.noProducts", "Product not found")}
      </p>
      <Link to="/marketplace" className="text-sm text-[#6B6860] hover:text-[#0B0B0F] underline transition">
        {t("detail.backToMarket", "Back to Marketplace")}
      </Link>
    </div>
  );

  const tags = product.tags ? product.tags.split(",").map((tStr: string) => tStr.trim()).filter(Boolean) : [];

  return (
    <div className="min-h-screen bg-[#F7F5F0]">
      {/* Navbar */}
      <header className="bg-white border-b border-[#E8E6E1] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <Link
            to="/marketplace"
            className="flex items-center gap-1.5 text-sm font-medium text-[#6B6860] hover:text-[#0B0B0F] transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t("detail.backToMarket", "Marketplace")}</span>
          </Link>
          <Link
            to="/"
            style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, letterSpacing: "-0.02em" }}
            className="text-[#0B0B0F] text-lg"
          >
            {t("brand.name", "KalaSaarthi")}
          </Link>
          <div className="flex items-center gap-2.5">
            <LanguageSelector variant="light" compact={false} />
            {user?.role === "buyer" && (
              <Link to="/cart" className="text-[#6B6860] hover:text-[#0B0B0F] transition p-1.5" title={t("nav.cart", "Cart")}>
                <ShoppingCart className="w-5 h-5" />
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="bg-white rounded-2xl border border-[#E8E6E1] overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Image — 40% on desktop */}
            <div className="w-full lg:w-[40%] min-h-[320px] sm:min-h-[480px] bg-[#F7F5F0] relative flex-shrink-0">
              {product.images?.[0]?.url ? (
                <img
                  src={product.images[0].url}
                  alt={product.name}
                  className="w-full h-full object-cover absolute inset-0"
                />
              ) : (
                <div className="flex items-center justify-center h-full absolute inset-0 text-[#E8E6E1]">
                  <Package className="w-20 h-20" />
                </div>
              )}
              {/* Quality score badge */}
              {product.quality_score != null && (
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm border border-[#E8E6E1] rounded-xl px-3 py-1.5 shadow-xs">
                  <p className="text-[10px] font-semibold text-[#6B6860] uppercase tracking-wider">{t("detail.qualityScore", "Quality")}</p>
                  <p style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700 }} className="text-[#0B0B0F] text-sm">
                    {product.quality_score}/10
                  </p>
                </div>
              )}
            </div>

            {/* Details — 60% on desktop */}
            <div className="w-full lg:w-[60%] p-6 sm:p-10 flex flex-col">
              {/* Category badge */}
              {product.category && (
                <span className="inline-block border border-[#E8E6E1] text-[#6B6860] text-xs font-semibold px-3 py-1 rounded-full mb-4 w-fit">
                  {product.category}
                </span>
              )}

              {/* Product name */}
              <h1
                style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, letterSpacing: "-0.03em" }}
                className="text-2xl sm:text-3xl text-[#0B0B0F] mb-2 leading-tight"
              >
                {product.name}
              </h1>

              {/* Stars & Verified */}
              <div className="flex items-center gap-1.5 mb-3">
                <div className="flex text-[#7CE25B]">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <span className="text-xs text-[#6B6860] font-medium">{t("detail.verifiedArtisan", "Verified Artisan")}</span>
              </div>

              {/* Artisan credit */}
              {product.artisan && (
                <p className="text-sm text-[#6B6860] mb-4 flex items-center gap-1">
                  <span>{t("market.by", "by")} <span className="font-semibold text-[#0B0B0F]">{product.artisan.name}</span></span>
                  {product.artisan.state && (
                    <span className="flex items-center gap-0.5 ml-1">
                      <MapPin className="w-3 h-3" />
                      {product.artisan.state}
                    </span>
                  )}
                </p>
              )}

              {/* Price */}
              <p
                style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, letterSpacing: "-0.02em" }}
                className="text-3xl text-[#0B0B0F] mb-5"
              >
                {product.final_price ? formatCurrency(product.final_price) : "—"}
              </p>

              {/* Description */}
              {product.description && (
                <p className="text-sm text-[#6B6860] leading-relaxed mb-6">{product.description}</p>
              )}

              {/* Spec chips */}
              {(product.materials || product.color || tags.length > 0) && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {product.materials && (
                    <span className="px-3 py-1 bg-[#F7F5F0] border border-[#E8E6E1] rounded-full text-xs font-medium text-[#0B0B0F]">
                      {t("detail.materials", "Materials")}: {product.materials}
                    </span>
                  )}
                  {product.color && (
                    <span className="px-3 py-1 bg-[#F7F5F0] border border-[#E8E6E1] rounded-full text-xs font-medium text-[#0B0B0F]">
                      {t("detail.color", "Color")}: {product.color}
                    </span>
                  )}
                  {tags.map((tag: string) => (
                    <span key={tag} className="px-3 py-1 bg-[#F7F5F0] border border-[#E8E6E1] rounded-full text-xs font-medium text-[#6B6860]">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Production time */}
              {product.production_time && (
                <p className="text-xs text-[#6B6860] mb-6">
                  <span className="font-semibold text-[#0B0B0F]">{t("detail.productionTime", "Crafting Time")}:</span> {product.production_time}
                </p>
              )}

              {/* Quantity + CTA */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-auto">
                {/* Quantity selector */}
                <div className="flex items-center border border-[#E8E6E1] rounded-xl overflow-hidden bg-[#F7F5F0] flex-shrink-0">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="px-4 py-3 text-[#0B0B0F] hover:bg-[#E8E6E1] transition font-bold"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span
                    style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700 }}
                    className="px-4 py-3 text-[#0B0B0F] border-x border-[#E8E6E1] min-w-[3rem] text-center text-sm"
                  >
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(q => q + 1)}
                    className="px-4 py-3 text-[#0B0B0F] hover:bg-[#E8E6E1] transition font-bold"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Add to Cart */}
                <button
                  onClick={addToCart}
                  disabled={adding}
                  className={`flex-1 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                    added
                      ? "bg-[#7CE25B] text-[#0B0B0F]"
                      : "bg-[#7CE25B] text-[#0B0B0F] hover:brightness-95 disabled:opacity-60"
                  }`}
                  style={{ fontFamily: "Space Grotesk, sans-serif" }}
                >
                  {adding ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#0B0B0F]/30 border-t-[#0B0B0F] rounded-full animate-spin" />
                      {t("detail.addingToCart", "Adding…")}
                    </>
                  ) : added ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      {t("detail.addedToCart", "Added to Cart!")}
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      {t("detail.addToCart", "Add to Cart")}
                    </>
                  )}
                </button>
              </div>

              {/* Delivery notice */}
              <p className="text-[11px] text-[#6B6860] mt-3">
                {t("detail.estimatedDelivery", "Estimated Delivery: 4-7 business days across India")}
              </p>

              {/* Artisan card */}
              {product.artisan && (
                <div className="mt-6 pt-6 border-t border-[#E8E6E1] flex items-center gap-4">
                  <div
                    style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700 }}
                    className="w-12 h-12 bg-[#0B0B0F] text-white rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                  >
                    {product.artisan.name?.charAt(0) || "A"}
                  </div>
                  <div>
                    <p className="text-[10px] text-[#6B6860] uppercase tracking-widest font-semibold mb-0.5">
                      {t("detail.aboutArtisan", "Meet the Artisan")}
                    </p>
                    <p style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700 }} className="text-[#0B0B0F]">
                      {product.artisan.name}
                    </p>
                    {product.artisan.craft && (
                      <p className="text-xs text-[#6B6860] mt-0.5">{product.artisan.craft}</p>
                    )}
                    {product.artisan.state && (
                      <p className="text-xs text-[#6B6860] flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" />{product.artisan.state}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
