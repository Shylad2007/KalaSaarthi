import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import { apiCall } from "../../api";
import { Search, ShoppingCart, Star, LogOut, Filter } from "lucide-react";

const CATEGORIES = ["All", "Handloom", "Pottery", "Jewelry", "Woodcraft", "Embroidery", "Painting", "Metal Craft", "Other"];

export default function Marketplace() {
  const [products, setProducts] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const { user, logout } = useAuth();

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
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <Link to="/" className="text-2xl font-extrabold text-primary flex-shrink-0">KalaSaarthi</Link>

          {/* Search */}
          <div className="flex-1 max-w-xl relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search handcrafted products..."
              className="w-full pl-11 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition text-sm"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            {user?.role === "buyer" && (
              <>
                <Link to="/cart" className="relative text-gray-600 hover:text-primary transition p-2">
                  <ShoppingCart className="w-6 h-6" />
                  {cartCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center font-bold">{cartCount}</span>}
                </Link>
                <Link to="/orders" className="text-gray-600 hover:text-primary font-medium text-sm">Orders</Link>
                <button onClick={() => { logout(); }} className="text-gray-400 hover:text-gray-700 p-2"><LogOut className="w-5 h-5" /></button>
              </>
            )}
            {!user && (
              <div className="flex gap-2">
                <Link to="/buyer/login" className="bg-primary text-white font-bold px-4 py-2 rounded-xl text-sm hover:bg-secondary transition">Sign In</Link>
              </div>
            )}
            {user?.role === "artisan" && (
              <Link to="/artisan/dashboard" className="text-primary font-bold text-sm hover:underline">Artisan Portal →</Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-r from-primary to-green-700 text-white py-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Discover Authentic Indian Handicrafts</h1>
          <p className="text-green-100 text-xl">Every purchase directly supports a skilled artisan and their family.</p>
        </div>
      </section>

      {/* Category filters */}
      <div className="bg-white border-b border-gray-100 sticky top-[73px] z-20">
        <div className="max-w-7xl mx-auto px-6 py-3 flex gap-2 overflow-x-auto scrollbar-none">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all ${category === c ? "bg-primary text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600 font-medium">{filtered.length} products {category !== "All" ? `in ${category}` : ""} {search ? `matching "${search}"` : ""}</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl font-bold text-gray-900 mb-2">No products found</p>
            <p className="text-gray-500">Try a different search term or category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map(p => (
              <Link to={`/product/${p.id}`} key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group block">
                <div className="h-56 bg-gray-100 overflow-hidden relative">
                  <img
                    src={p.images?.[0]?.url || "https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?auto=format&fit=crop&w=500&q=70"}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  {p.category && (
                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs font-bold text-gray-800 shadow-sm">
                      {p.category}
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-extrabold text-gray-900 mb-1 truncate">{p.name}</h3>
                  <p className="text-sm text-gray-500 mb-3">
                    by {p.artisan?.name || "Artisan"}{p.artisan?.state ? ` • ${p.artisan.state}` : ""}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-xl font-extrabold text-primary">₹{p.final_price || "—"}</p>
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}
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
