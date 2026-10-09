import { useEffect, useState } from "react";
import { apiCall } from "../../api";
import ArtisanLayout from "../../components/ArtisanLayout";
import { Zap, CheckCircle, Camera, FileText, DollarSign, Info, Package } from "lucide-react";

const ICON_MAP: Record<string, any> = {
  "Improve image quality": Camera,
  "Add a product description": FileText,
  "Set a selling price": DollarSign,
  "Add a product name": FileText,
};

function HealthBar({ score }: { score: number }) {
  const color = score >= 80 ? "bg-green-500" : score >= 60 ? "bg-blue-500" : score >= 40 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-sm font-bold text-gray-700 w-12 text-right">{score}/100</span>
    </div>
  );
}

export default function RevivalEngine() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { apiCall("/artisan/revival").then(setItems).catch(console.error).finally(() => setLoading(false)); }, []);

  return (
    <ArtisanLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center"><Zap className="w-8 h-8 mr-3 text-yellow-500" />Revival Engine</h1>
        <p className="text-gray-500 mt-2">Products that could perform better with a few improvements.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">All products look healthy!</h3>
          <p className="text-gray-500">Keep up the great work. Add more products to grow your catalogue.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {items.map(({ product: p, health }) => (
            <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-48 h-48 bg-gray-100 flex-shrink-0">
                  {p.images?.[0]?.url ? (
                    <img src={p.images[0].url} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-300"><Package className="w-10 h-10" /></div>
                  )}
                </div>
                <div className="flex-1 p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-xl font-extrabold text-gray-900">{p.name || "Untitled Product"}</h3>
                      <p className="text-gray-500 text-sm mt-1">{p.category || "No category"}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-bold ${health.score >= 80 ? "bg-green-100 text-green-800" : health.score >= 60 ? "bg-blue-100 text-blue-800" : health.score >= 40 ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`}>
                      {health.label}
                    </div>
                  </div>

                  <div className="mb-5">
                    <p className="text-sm font-bold text-gray-700 mb-2">Health Score</p>
                    <HealthBar score={health.score} />
                  </div>

                  {health.recommendations?.length > 0 && (
                    <div>
                      <p className="text-sm font-bold text-gray-700 mb-3">Recommended Actions</p>
                      <div className="flex flex-wrap gap-2">
                        {health.recommendations.map((rec: any, i: number) => {
                          const Icon = ICON_MAP[rec.text] || Info;
                          return (
                            <span key={i} className="flex items-center bg-orange-50 text-orange-800 border border-orange-200 px-3 py-1.5 rounded-xl text-sm font-medium">
                              <Icon className="w-4 h-4 mr-1.5 flex-shrink-0" />{rec.text}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </ArtisanLayout>
  );
}
