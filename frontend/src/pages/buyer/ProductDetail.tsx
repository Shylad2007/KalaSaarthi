import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import { apiCall } from "../../api";
import { ShoppingCart, ArrowLeft, MapPin, CheckCircle, Package, Star } from "lucide-react";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    apiCall(`/products/${id}`).then(setProduct).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  const addToCart = async () => {
    if (!user) { navigate("/buyer/login"); return; }
    if (user.role !== "buyer") { alert("Please sign in as a buyer to add items to cart."); return; }
    setAdding(true);
    try {
      await apiCall("/cart", { method: "POST", body: JSON.stringify({ product_id: product.id, quantity }) });
      setAdded(true);
      setTimeout(() => setAdded(false), 3000);
    } catch (err: any) {
      alert("Could not add to cart: " + err.message);
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center text-red-500 font-bold">Product not found</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/marketplace" className="flex items-center text-gray-600 hover:text-primary font-bold transition">
            <ArrowLeft className="w-5 h-5 mr-2" /> Back to Marketplace
          </Link>
          {user?.role === "buyer" && (
            <Link to="/cart" className="text-gray-600 hover:text-primary transition p-2"><ShoppingCart className="w-6 h-6" /></Link>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Image */}
            <div className="w-full lg:w-1/2 min-h-[400px] bg-gray-100 relative">
              {product.images?.[0]?.url ? (
                <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover absolute inset-0" />
              ) : (
                <div className="flex items-center justify-center h-full absolute inset-0 text-gray-300"><Package className="w-20 h-20" /></div>
              )}
            </div>

            {/* Details */}
            <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
              {product.category && (
                <span className="inline-block bg-primary/10 text-primary font-bold text-xs px-3 py-1.5 rounded-full mb-4 w-fit">{product.category}</span>
              )}
              <h1 className="text-3xl font-extrabold text-gray-900 mb-3">{product.name}</h1>
              <div className="flex text-yellow-400 mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
                <span className="ml-2 text-gray-500 text-sm font-medium">(Verified Artisan)</span>
              </div>
              <p className="text-3xl font-extrabold text-primary mb-6">₹{product.final_price}</p>
              <p className="text-gray-600 leading-relaxed mb-8">{product.description}</p>

              {/* Spec grid */}
              <div className="grid grid-cols-2 gap-4 mb-8 bg-gray-50 rounded-2xl p-5 border border-gray-100">
                {product.materials && <div><p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Materials</p><p className="font-bold text-gray-900 mt-1">{product.materials}</p></div>}
                {product.color && <div><p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Color</p><p className="font-bold text-gray-900 mt-1">{product.color}</p></div>}
                {product.production_time && <div><p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Production Time</p><p className="font-bold text-gray-900 mt-1">{product.production_time}</p></div>}
                {product.views != null && <div><p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Views</p><p className="font-bold text-gray-900 mt-1">{product.views}</p></div>}
              </div>

              {/* Quantity + CTA */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-4 py-3 text-gray-600 hover:bg-gray-50 font-bold text-lg">−</button>
                  <span className="px-4 py-3 font-extrabold text-gray-900 border-x-2 border-gray-200 min-w-[3rem] text-center">{quantity}</span>
                  <button onClick={() => setQuantity(q => q + 1)} className="px-4 py-3 text-gray-600 hover:bg-gray-50 font-bold text-lg">+</button>
                </div>
                <button
                  onClick={addToCart}
                  disabled={adding}
                  className={`flex-1 py-4 rounded-xl font-bold flex items-center justify-center transition-all shadow-lg ${added ? "bg-green-600 text-white shadow-green-600/25" : "bg-primary text-white hover:bg-secondary shadow-primary/25"}`}
                >
                  {adding ? "Adding…" : added ? <><CheckCircle className="w-5 h-5 mr-2" />Added to Cart!</> : <><ShoppingCart className="w-5 h-5 mr-2" />Add to Cart</>}
                </button>
              </div>

              {/* Artisan */}
              {product.artisan && (
                <div className="border-t border-gray-100 pt-6 flex items-center gap-4">
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary text-2xl font-extrabold flex-shrink-0">
                    {product.artisan.name?.charAt(0) || "A"}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Crafted by</p>
                    <p className="font-extrabold text-gray-900 text-lg">{product.artisan.name}</p>
                    {product.artisan.craft && <p className="text-sm text-primary font-medium">{product.artisan.craft}</p>}
                    {product.artisan.state && (
                      <p className="text-sm text-gray-500 flex items-center mt-1"><MapPin className="w-3.5 h-3.5 mr-1" />{product.artisan.state}</p>
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
