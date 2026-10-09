import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiCall } from "../../api";
import ArtisanLayout from "../../components/ArtisanLayout";
import { Plus, Package, Edit, Eye, EyeOff, Activity } from "lucide-react";

export default function ProductCatalogue() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { apiCall("/products/my").then(setProducts).catch(console.error).finally(() => setLoading(false)); }, []);

  const togglePublish = async (p: any) => {
    await apiCall(`/products/${p.id}`, { method: "PUT", body: JSON.stringify({ is_published: !p.is_published }) });
    setProducts(prev => prev.map(x => x.id === p.id ? { ...x, is_published: !x.is_published } : x));
  };

  const healthColor = (score: number | null) => {
    if (!score) return "text-gray-400";
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <ArtisanLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">My Catalogue</h1>
          <p className="text-gray-500 mt-1">{products.length} products • {products.filter(p => p.is_published).length} published</p>
        </div>
        <Link to="/artisan/add-product" className="bg-primary text-white font-bold px-5 py-3 rounded-xl flex items-center hover:bg-secondary shadow-lg shadow-primary/20 transition">
          <Plus className="w-5 h-5 mr-2" /> Add Product
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm">
          <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No products yet</h3>
          <p className="text-gray-500 mb-6">Add your first product to start selling.</p>
          <Link to="/artisan/add-product" className="bg-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-secondary inline-block">Add First Product</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(p => (
            <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition">
              <div className="h-48 bg-gray-100 relative overflow-hidden">
                {p.images?.[0]?.url ? (
                  <img src={p.images[0].url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-300"><Package className="w-10 h-10" /></div>
                )}
                <span className={`absolute top-3 right-3 text-xs px-3 py-1 rounded-full font-bold ${p.is_published ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                  {p.is_published ? "Live" : "Draft"}
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-extrabold text-gray-900 truncate mb-1">{p.name || "Untitled"}</h3>
                <p className="text-sm text-gray-500 mb-1">{p.category || "Uncategorized"}</p>
                {p.final_price && <p className="text-primary font-bold text-lg mb-3">₹{p.final_price}</p>}

                {p.image_quality_score != null && (
                  <div className="flex items-center text-xs mb-3">
                    <Activity className={`w-3.5 h-3.5 mr-1 ${healthColor(p.image_quality_score)}`} />
                    <span className={`font-medium ${healthColor(p.image_quality_score)}`}>Image score: {p.image_quality_score}/100</span>
                  </div>
                )}

                <div className="flex gap-2">
                  <Link to={`/artisan/edit-product/${p.id}`}
                    className="flex items-center justify-center px-3 py-2 rounded-xl text-sm font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition">
                    <Edit className="w-4 h-4 mr-1" />Edit
                  </Link>
                  <button onClick={() => togglePublish(p)}
                    className={`flex-1 flex items-center justify-center py-2 rounded-xl text-sm font-bold transition ${p.is_published ? "bg-gray-100 text-gray-600 hover:bg-gray-200" : "bg-primary/10 text-primary hover:bg-primary/20"}`}>
                    {p.is_published ? <><EyeOff className="w-4 h-4 mr-1" />Unpublish</> : <><Eye className="w-4 h-4 mr-1" />Publish</>}
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
