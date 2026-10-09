import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import { apiCall } from "../../api";
import { Search, ShoppingCart, Star, LogOut } from "lucide-react";

const CATEGORIES = ["All", "Handloom", "Pottery", "Jewelry", "Woodcraft", "Embroidery", "Painting", "Metal Craft", "Other"];

export default function Marketplace() {
  const [products, setProducts] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    apiCall("/products").then(data => { setProducts(data); setFiltered(data); }).catch(console.error).finally(() => setLoading(false));
    if (user?.role === "buyer") {
      apiCall("/cart").then(data => setCartCount(data.length)).catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    let result = [...products];
    if (search) result = result.filter(p =>
      (p.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.description || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.tags || "").toLowerCase().includes(search.toLowerCase())
    );
    if (category !== "All") result = result.filter(p => (p.category || "").toLowerCase().includes(category.toLowerCase()));
    setFiltered(result);
  }, [search, category, products]);

  return (
    <div className="min-h-screen bg-[#F7F5F0]">
      {/* Navbar */}
      <header className="bg-white border-b border-[#E8E6E1] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <Link
            to="/"
            style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, letterSpacing: "-0.02em" }}
            className="text-[#0B0B0F] text-lg flex-shrink-0"
          >
            KalaSaarthi
          </Link>

          {/* Search */}
          <div className="flex-1 max-w-lg relative mx-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6860]" />
            <input
              type="text"
              placeholder="Search handcrafted products…"
              className="w-full pl-9 pr-4 py-2 bg-[#F7F5F0] border border-[#E8E6E1] rounded-full text-sm focus:outline-none focus:border-[#0B0B0F] transition"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
            {user?.role === "buyer" && (
              <>
                <Link to="/orders" className="text-sm font-medium text-[#6B6860] hover:text-[#0B0B0F] transition hidden sm:block">
                  Orders
                </Link>
                <Link to="/cart" className="relative text-[#6B6860] hover:text-[#0B0B0F] transition p-1.5">
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#E6429B] text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <button
                  onClick={() => { logout(); navigate("/"); }}
                  className="text-[#6B6860] hover:text-[#0B0B0F] p-1.5 transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            )}
            {!user && (
              <>
                <Link to="/buyer/login" className="text-sm font-medium text-[#6B6860] hover:text-[#0B0B0F] transition">
                  Sign in
                </Link>
                <Link
                  to="/buyer/register"
                  className="text-sm font-bold bg-[#0B0B0F] text-white px-4 py-2 rounded-lg hover:bg-[#1a1a1f] transition"
                >
                  Join
                </Link>
              </>
            )}
            {user?.role === "artisan" && (
              <Link to="/artisan/dashboard" className="text-sm font-bold text-[#6B6860] hover:text-[#0B0B0F] transition">
                Artisan Portal →
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-[#0B0B0F] text-white py-12 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-0.5 prism-gradient" />
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/40 mb-3">
            {products.length} products available
          </p>
          <h1
            style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, letterSpacing: "-0.04em" }}
            className="text-3xl sm:text-5xl text-white mb-3"
          >
            Discover Authentic<br />
            <span className="prism-text">Indian Handicrafts</span>
          </h1>
          <p className="text-white/50 text-base max-w-xl">
            Every purchase directly supports a skilled artisan and their family.
          </p>
        </div>
      </section>

      {/* Category filters */}
      <div className="bg-white border-b border-[#E8E6E1] sticky top-[56px] z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex gap-2 overflow-x-auto scrollbar-none">
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                category === c
                  ? "bg-[#0B0B0F] text-white border-[#0B0B0F]"
                  : "bg-white text-[#6B6860] border-[#E8E6E1] hover:border-[#0B0B0F] hover:text-[#0B0B0F]"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <p className="text-sm text-[#6B6860] mb-6 font-medium">
          {filtered.length} {category !== "All" ? category : ""} product{filtered.length !== 1 ? "s" : ""}
          {search ? ` matching "${search}"` : ""}
        </p>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 border-2 border-[#E8E6E1] border-t-[#7CE25B] rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-4xl mb-4">🧶</p>
            <p
              style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700 }}
              className="text-xl text-[#0B0B0F] mb-2"
            >
              No products found
            </p>
            <p className="text-[#6B6860]">Try a different search term or category</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {filtered.map(p => (
              <Link
                to={`/product/${p.id}`}
                key={p.id}
                className="bg-white rounded-2xl border border-[#E8E6E1] overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group block"
              >
                <div className="aspect-[4/3] bg-[#F7F5F0] overflow-hidden relative">
                  <img
                    src={
                      p.images?.[0]?.url ||
                      "https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?auto=format&fit=crop&w=500&q=70"
                    }
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  {p.category && (
                    <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full text-[10px] font-semibold text-[#0B0B0F] shadow-sm">
                      {p.category}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h3
                    style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700 }}
                    className="text-[#0B0B0F] text-sm mb-0.5 truncate"
                  >
                    {p.name}
                  </h3>
                  <p className="text-xs text-[#6B6860] mb-3 truncate">
                    by {p.artisan?.name || "Artisan"}{p.artisan?.state ? ` · ${p.artisan.state}` : ""}
                  </p>
                  <div className="flex items-center justify-between">
                    <p
                      style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700 }}
                      className="text-[#0B0B0F]"
                    >
                      ₹{p.final_price || "—"}
                    </p>
                    <div className="flex text-[#7CE25B] gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
