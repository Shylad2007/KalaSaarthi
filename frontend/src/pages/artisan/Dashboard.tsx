import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import { apiCall } from "../../api";
import ArtisanLayout from "../../components/ArtisanLayout";
import { Package, TrendingUp, AlertCircle, Sparkles, ArrowRight, ShoppingBag, Zap } from "lucide-react";

export default function ArtisanDashboard() {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [revival, setRevival] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const profile = user?.profile;
  const displayName = profile?.name?.split(" ")[0] || "Artisan";

  useEffect(() => {
    Promise.all([
      apiCall("/products/my"),
      apiCall("/opportunities"),
      apiCall("/artisan/revival"),
      apiCall("/artisan/orders"),
    ]).then(([p, o, r, ord]) => {
      setProducts(p);
      setOpportunities(o.slice(0, 3));
      setRevival(r.slice(0, 3));
      setOrders(ord);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const published = products.filter(p => p.is_published).length;
  const drafts = products.filter(p => !p.is_published).length;
  const pendingOrders = orders.filter(o => o.status === "Placed").length;

  return (
    <ArtisanLayout>
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-1">
          Welcome back, {displayName}! 👋
        </h1>
        <p className="text-gray-500">
          {profile?.craft ? `${profile.craft} • ` : ""}
          {profile?.district && profile?.state ? `${profile.district}, ${profile.state}` : ""}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Products", value: products.length, icon: Package, color: "primary" },
          { label: "Published", value: published, icon: TrendingUp, color: "green-600" },
          { label: "Drafts", value: drafts, icon: AlertCircle, color: "yellow-600" },
          { label: "New Orders", value: pendingOrders, icon: ShoppingBag, color: "blue-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl mb-3 ${
              color === "primary" ? "bg-primary/10 text-primary" :
              color === "green-600" ? "bg-green-100 text-green-600" :
              color === "yellow-600" ? "bg-yellow-100 text-yellow-600" :
              "bg-blue-100 text-blue-600"
            }`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-extrabold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 font-medium">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Products */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-extrabold text-gray-900">Recent Products</h2>
            <Link to="/artisan/products" className="text-primary text-sm font-bold hover:underline">View all</Link>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-gray-100">
              <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="font-bold text-gray-900 mb-1">No products yet</p>
              <p className="text-gray-500 text-sm mb-4">Start adding your handcrafted products</p>
              <Link to="/artisan/add-product" className="bg-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-secondary inline-block text-sm">Add First Product</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {products.slice(0, 4).map(p => (
                <div key={p.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 mr-4">
                    {p.images?.[0]?.url ? (
                      <img src={p.images[0].url} className="w-full h-full object-cover" alt={p.name} />
                    ) : <div className="flex items-center justify-center h-full text-gray-300"><Package className="w-6 h-6" /></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 truncate">{p.name || "Untitled"}</p>
                    <p className="text-sm text-gray-500">{p.category || "Uncategorized"}</p>
                  </div>
                  <div className="flex-shrink-0 ml-4 text-right">
                    {p.final_price && <p className="font-bold text-primary">₹{p.final_price}</p>}
                    <span className={`text-xs px-2 py-1 rounded-full font-bold ${p.is_published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {p.is_published ? "Live" : "Draft"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Revival alerts */}
          {revival.length > 0 && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-extrabold text-gray-900 flex items-center"><Zap className="w-5 h-5 mr-2 text-yellow-500" /> Needs Attention</h2>
                <Link to="/artisan/revival" className="text-primary text-sm font-bold hover:underline">View all</Link>
              </div>
              {revival.map(item => (
                <div key={item.product.id} className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex items-center mb-3">
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">{item.product.name || "Untitled"}</p>
                    <p className="text-sm text-yellow-700">Health: {item.health.score}/100 • {item.health.label}</p>
                    <p className="text-xs text-gray-500 mt-1">{item.health.recommendations?.[0]?.text}</p>
                  </div>
                  <Link to="/artisan/revival" className="ml-4 text-yellow-700 hover:text-yellow-900">
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar: Opportunities */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-extrabold text-gray-900 flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-primary" /> For You
            </h2>
            <Link to="/artisan/opportunities" className="text-primary text-sm font-bold hover:underline">All</Link>
          </div>

          <div className="space-y-4">
            {opportunities.map(opp => (
              <a key={opp.id} href={opp.url} target="_blank" rel="noreferrer"
                className="block bg-white p-5 rounded-2xl border border-gray-100 hover:border-primary/40 hover:shadow-md transition">
                <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-1 rounded-full">{opp.type}</span>
                <h4 className="font-bold text-gray-900 mt-2 mb-1 text-sm leading-snug">{opp.title}</h4>
                {opp.relevance_reasons?.[0] && (
                  <p className="text-xs text-green-600 font-medium">✓ {opp.relevance_reasons[0]}</p>
                )}
              </a>
            ))}
            <Link to="/artisan/opportunities" className="block text-center bg-primary/10 text-primary font-bold py-3 rounded-xl hover:bg-primary/20 transition text-sm">
              View All Opportunities
            </Link>
          </div>
        </div>
      </div>
    </ArtisanLayout>
  );
}
