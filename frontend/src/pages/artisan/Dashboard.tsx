import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import { apiCall } from "../../api";
import ArtisanLayout from "../../components/ArtisanLayout";
import { Package, ArrowRight, Zap, Plus, ShoppingBag, Eye } from "lucide-react";

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

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <ArtisanLayout>
      {/* Greeting */}
      <div className="mb-8">
        <h1
          className="text-2xl font-bold text-[#0B0B0F] mb-1"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {greeting}, {displayName}.
        </h1>
        <p className="text-[#6B6860] text-sm">
          {profile?.craft ? `${profile.craft}` : ""}
          {profile?.craft && (profile?.district || profile?.state) ? " · " : ""}
          {profile?.district && profile?.state
            ? `${profile.district}, ${profile.state}`
            : profile?.state || ""}
        </p>
        {/* Prism accent stripe */}
        <div
          className="mt-3 h-[3px] w-24 rounded-full"
          style={{ background: "linear-gradient(90deg, #7CE25B, #3FC7E9, #E6429B)" }}
        />
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Products */}
        <div className="bg-white border border-[#E8E6E1] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#7CE25B]" />
            <span className="text-xs text-[#6B6860] font-medium">Total Products</span>
          </div>
          <p className="text-3xl font-bold text-[#0B0B0F]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {loading ? "—" : products.length}
          </p>
        </div>
        {/* Published */}
        <div className="bg-white border border-[#E8E6E1] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#7CE25B]" />
            <span className="text-xs text-[#6B6860] font-medium">Published</span>
          </div>
          <p className="text-3xl font-bold text-[#0B0B0F]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {loading ? "—" : published}
          </p>
        </div>
        {/* Drafts */}
        <div className="bg-white border border-[#E8E6E1] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#6B6860]" />
            <span className="text-xs text-[#6B6860] font-medium">Drafts</span>
          </div>
          <p className="text-3xl font-bold text-[#0B0B0F]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {loading ? "—" : drafts}
          </p>
        </div>
        {/* New Orders */}
        <div className="bg-white border border-[#E8E6E1] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3FC7E9]" />
            <span className="text-xs text-[#6B6860] font-medium">New Orders</span>
          </div>
          <p className="text-3xl font-bold text-[#0B0B0F]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {loading ? "—" : pendingOrders}
          </p>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Recent Products */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-[#E8E6E1] rounded-2xl p-6">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h2
                  className="text-lg font-bold text-[#0B0B0F]"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Recent Products
                </h2>
                <p className="text-xs text-[#6B6860] mt-0.5">Your latest catalogue entries</p>
              </div>
              <Link
                to="/artisan/products"
                className="text-xs font-semibold text-[#6B6860] hover:text-[#0B0B0F] flex items-center gap-1 transition-colors"
              >
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-4 animate-pulse">
                    <div className="w-12 h-12 rounded-lg bg-[#E8E6E1] flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 bg-[#E8E6E1] rounded w-2/3" />
                      <div className="h-3 bg-[#E8E6E1] rounded w-1/3" />
                    </div>
                    <div className="h-5 w-14 bg-[#E8E6E1] rounded-full" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 rounded-2xl bg-[#F7F5F0] flex items-center justify-center mx-auto mb-3">
                  <Package className="w-6 h-6 text-[#6B6860]" />
                </div>
                <p className="font-semibold text-[#0B0B0F] mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  No products yet
                </p>
                <p className="text-sm text-[#6B6860] mb-4">Start adding your handcrafted products</p>
                <Link
                  to="/artisan/add-product"
                  className="inline-flex items-center gap-2 bg-[#7CE25B] text-[#0B0B0F] font-semibold px-5 py-2.5 rounded-xl text-sm hover:brightness-95 transition"
                >
                  <Plus className="w-4 h-4" /> Add your first product
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {products.slice(0, 4).map(p => (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#F7F5F0] transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#F7F5F0] flex-shrink-0">
                      {p.images?.[0]?.url ? (
                        <img src={p.images[0].url} className="w-full h-full object-cover" alt={p.name} />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Package className="w-5 h-5 text-[#6B6860]" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#0B0B0F] truncate text-sm">{p.name || "Untitled"}</p>
                      <span className="inline-block text-[10px] font-medium bg-[#F7F5F0] text-[#6B6860] px-2 py-0.5 rounded-full mt-0.5">
                        {p.category || "Uncategorized"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {p.final_price && (
                        <span className="text-sm font-bold text-[#0B0B0F]">₹{p.final_price}</span>
                      )}
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                          p.is_published
                            ? "bg-[#7CE25B]/20 text-[#2a7a10]"
                            : "bg-[#E8E6E1] text-[#6B6860]"
                        }`}
                      >
                        {p.is_published ? "Published" : "Draft"}
                      </span>
                      <Link
                        to={`/artisan/edit-product/${p.id}`}
                        className="text-[10px] font-semibold text-[#6B6860] hover:text-[#0B0B0F] opacity-0 group-hover:opacity-100 transition"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Revival Alerts */}
          {revival.length > 0 && (
            <div className="bg-white border border-[#E8E6E1] rounded-2xl p-6">
              <div className="flex justify-between items-center mb-5">
                <div>
                  <h2
                    className="text-lg font-bold text-[#0B0B0F] flex items-center gap-2"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    <Zap className="w-4 h-4 text-[#7CE25B]" />
                    Revival Alerts
                  </h2>
                  <p className="text-xs text-[#6B6860] mt-0.5">Products needing your attention</p>
                </div>
                <Link
                  to="/artisan/revival"
                  className="text-xs font-semibold text-[#6B6860] hover:text-[#0B0B0F] flex items-center gap-1 transition-colors"
                >
                  View all <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="space-y-2">
                {revival.map(item => (
                  <div
                    key={item.product.id}
                    className="flex items-center gap-3 p-4 rounded-xl border border-amber-100 bg-amber-50/50"
                  >
                    <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#0B0B0F] text-sm truncate">{item.product.name || "Untitled"}</p>
                      <p className="text-xs text-amber-700 mt-0.5">
                        Health score: {item.health.score}/100 · {item.health.label}
                      </p>
                      {item.health.recommendations?.[0]?.text && (
                        <p className="text-xs text-[#6B6860] mt-0.5 truncate">{item.health.recommendations[0].text}</p>
                      )}
                    </div>
                    <Link to="/artisan/revival" className="flex-shrink-0 text-amber-600 hover:text-amber-800 transition">
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white border border-[#E8E6E1] rounded-2xl p-6">
            <h2
              className="text-lg font-bold text-[#0B0B0F] mb-1"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Quick Actions
            </h2>
            <p className="text-xs text-[#6B6860] mb-5">Jump right in</p>
            <div className="space-y-3">
              <Link
                to="/artisan/add-product"
                className="flex items-center justify-center gap-2 w-full bg-[#7CE25B] text-[#0B0B0F] font-semibold py-3 rounded-xl text-sm hover:brightness-95 transition"
              >
                <Plus className="w-4 h-4" /> Add New Product
              </Link>
              <Link
                to="/artisan/orders"
                className="flex items-center justify-center gap-2 w-full border border-[#0B0B0F] text-[#0B0B0F] font-semibold py-3 rounded-xl text-sm hover:bg-[#0B0B0F] hover:text-white transition"
              >
                <ShoppingBag className="w-4 h-4" /> View Orders
              </Link>
              <Link
                to="/artisan/opportunities"
                className="flex items-center justify-center gap-2 w-full border border-[#0B0B0F] text-[#0B0B0F] font-semibold py-3 rounded-xl text-sm hover:bg-[#0B0B0F] hover:text-white transition"
              >
                <Eye className="w-4 h-4" /> Browse Opportunities
              </Link>
            </div>
          </div>

          {/* Opportunities teaser */}
          {opportunities.length > 0 && (
            <div className="bg-white border border-[#E8E6E1] rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h2
                  className="text-lg font-bold text-[#0B0B0F]"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  For You
                </h2>
                <Link
                  to="/artisan/opportunities"
                  className="text-xs font-semibold text-[#6B6860] hover:text-[#0B0B0F] transition-colors"
                >
                  All
                </Link>
              </div>
              <div className="space-y-3">
                {opportunities.map(opp => (
                  <a
                    key={opp.id}
                    href={opp.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block p-4 rounded-xl border border-[#E8E6E1] hover:border-[#7CE25B]/60 hover:bg-[#F7F5F0] transition-colors"
                  >
                    <span className="inline-block text-[10px] font-bold bg-[#3FC7E9]/15 text-[#1a8fa8] px-2 py-0.5 rounded-full mb-1.5">
                      {opp.type}
                    </span>
                    <p className="text-sm font-semibold text-[#0B0B0F] leading-snug">{opp.title}</p>
                    {opp.relevance_reasons?.[0] && (
                      <p className="text-xs text-[#7CE25B] font-medium mt-1">✓ {opp.relevance_reasons[0]}</p>
                    )}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </ArtisanLayout>
  );
}
