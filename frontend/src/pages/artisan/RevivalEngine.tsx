import { useEffect, useState } from "react";
import { useLanguage } from "../../i18n/LanguageContext";
import { apiCall } from "../../api";
import ArtisanLayout from "../../components/ArtisanLayout";
import { Zap, CheckCircle, Camera, FileText, DollarSign, Info, Package } from "lucide-react";

const ICON_MAP: Record<string, any> = {
  "Improve image quality":   Camera,
  "Add a product description": FileText,
  "Set a selling price":     DollarSign,
  "Add a product name":      FileText,
};

function healthConfig(score: number) {
  if (score >= 80) return { color: "#7CE25B", bg: "bg-[#7CE25B]/15", text: "text-[#2a7a10]" };
  if (score >= 60) return { color: "#3FC7E9", bg: "bg-[#3FC7E9]/15", text: "text-[#0e7a92]" };
  if (score >= 40) return { color: "#F59E0B", bg: "bg-amber-50",     text: "text-amber-700" };
  return              { color: "#EF4444", bg: "bg-red-50",        text: "text-red-700" };
}

function HealthBadge({ score }: { score: number }) {
  const cfg = healthConfig(score);
  const radius = 20;
  const circ = 2 * Math.PI * radius;
  const dash = (score / 100) * circ;

  return (
    <div className="relative w-14 h-14 flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r={radius} fill="none" stroke="#E8E6E1" strokeWidth="4" />
        <circle
          cx="24" cy="24" r={radius}
          fill="none"
          stroke={cfg.color}
          strokeWidth="4"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[11px] font-bold text-[#0B0B0F]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          {score}
        </span>
      </div>
    </div>
  );
}

export default function RevivalEngine() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    apiCall("/artisan/revival").then(setItems).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <ArtisanLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#7CE25B]/20 flex items-center justify-center">
            <Zap className="w-5 h-5 text-[#7CE25B]" />
          </div>
          <div>
            <h1
              className="text-2xl font-bold text-[#0B0B0F]"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {t("revival.title", "Product Revival Engine")}
            </h1>
          </div>
        </div>
        <p className="text-sm text-[#6B6860] mt-2 ml-0">{t("revival.subtitle", "Products needing attention — improve them to boost visibility.")}</p>
        <div
          className="mt-3 h-[3px] w-20 rounded-full"
          style={{ background: "linear-gradient(90deg, #7CE25B, #3FC7E9, #E6429B)" }}
        />
      </div>

      {loading ? (
        <div className="space-y-5">
          {[1, 2].map(i => (
            <div key={i} className="bg-white border border-[#E8E6E1] rounded-2xl overflow-hidden animate-pulse">
              <div className="flex">
                <div className="w-40 h-40 bg-[#F7F5F0] flex-shrink-0" />
                <div className="flex-1 p-6 space-y-3">
                  <div className="h-5 bg-[#E8E6E1] rounded w-1/2" />
                  <div className="h-3.5 bg-[#E8E6E1] rounded w-1/4" />
                  <div className="flex gap-2 mt-4">
                    <div className="h-8 bg-[#E8E6E1] rounded-xl w-28" />
                    <div className="h-8 bg-[#E8E6E1] rounded-xl w-28" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white border border-[#E8E6E1] rounded-2xl p-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#7CE25B]/15 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-7 h-7 text-[#7CE25B]" />
          </div>
          <h3
            className="text-lg font-bold text-[#0B0B0F] mb-2"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {t("revival.allHealthy", "All products are healthy!")}
          </h3>
          <p className="text-sm text-[#6B6860]">{t("revival.allHealthyDesc", "Keep up the great work. Add more products to grow your catalogue.")}</p>
        </div>
      ) : (
        <div className="space-y-5">
          {items.map(({ product: p, health }) => {
            const cfg = healthConfig(health.score);
            return (
              <div key={p.id} className="bg-white border border-[#E8E6E1] rounded-2xl overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  {/* Image */}
                  <div className="w-full md:w-44 h-44 bg-[#F7F5F0] flex-shrink-0">
                    {p.images?.[0]?.url ? (
                      <img src={p.images[0].url} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Package className="w-10 h-10 text-[#E8E6E1]" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                      <div className="flex items-start gap-4">
                        {/* Circular health badge */}
                        <HealthBadge score={health.score} />
                        <div>
                          <h3
                            className="text-base font-bold text-[#0B0B0F]"
                            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                          >
                            {p.name || "Untitled Product"}
                          </h3>
                          <p className="text-xs text-[#6B6860] mt-0.5">{p.category || "No category"}</p>
                          <span className={`inline-block mt-2 text-[10px] font-bold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.text}`}>
                            {health.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Recommendations */}
                    {health.recommendations?.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-[#6B6860] uppercase tracking-wider mb-3">
                          {t("revival.tips", "Improvement Tips")}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {health.recommendations.map((rec: any, i: number) => {
                            const Icon = ICON_MAP[rec.text] || Info;
                            return (
                              <span
                                key={i}
                                className="flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1.5 rounded-xl text-xs font-medium"
                              >
                                <Icon className="w-3.5 h-3.5 flex-shrink-0" />{rec.text}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </ArtisanLayout>
  );
}
