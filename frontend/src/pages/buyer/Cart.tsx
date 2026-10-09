import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiCall } from "../../api";
import { Trash2, ArrowRight, ArrowLeft, ShoppingCart, CreditCard, CheckCircle } from "lucide-react";

export default function Cart() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<"cart" | "checkout" | "success">("cart");
  const [placing, setPlacing] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const navigate = useNavigate();

  useEffect(() => { apiCall("/cart").then(setItems).catch(console.error).finally(() => setLoading(false)); }, []);

  const updateQty = async (id: number, qty: number) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, quantity: Math.max(1, qty) } : i));
    await apiCall(`/cart/${id}`, { method: "PUT", body: JSON.stringify({ quantity: Math.max(1, qty) }) });
  };

  const remove = async (id: number) => {
    setItems(prev => prev.filter(i => i.id !== id));
    await apiCall(`/cart/${id}`, { method: "DELETE" });
  };

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setPlacing(true);
    try {
      const res = await apiCall("/checkout", { method: "POST", body: JSON.stringify(form) });
      setOrderId(res.order_id);
      setItems([]);
      setStep("success");
    } catch (err: any) { alert("Order failed: " + err.message); }
    finally { setPlacing(false); }
  };

  const total = items.reduce((s, i) => s + (i.product?.final_price || 0) * i.quantity, 0);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  const Header = () => (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/marketplace" className="text-2xl font-extrabold text-primary">KalaSaarthi</Link>
        <Link to="/orders" className="text-gray-600 hover:text-primary font-medium text-sm">My Orders</Link>
      </div>
    </header>
  );

  if (step === "success") return (
    <div className="min-h-screen bg-gray-50"><Header />
      <div className="max-w-lg mx-auto px-6 py-20 text-center">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle className="w-12 h-12 text-green-600" /></div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-3">Order Placed! 🎉</h1>
        <p className="text-gray-500 mb-2">Thank you for supporting Indian artisans.</p>
        <p className="text-gray-700 font-bold mb-8">Order #{orderId} is confirmed. Estimated delivery in 5 days.</p>
        <Link to="/orders" className="bg-primary text-white font-bold px-8 py-4 rounded-xl hover:bg-secondary inline-block shadow-lg shadow-primary/20">View My Orders</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50"><Header />
      <main className="max-w-5xl mx-auto px-6 py-10">

        {step === "cart" && (
          <>
            <div className="flex items-center mb-8">
              <Link to="/marketplace" className="text-gray-500 hover:text-primary mr-4"><ArrowLeft className="w-5 h-5" /></Link>
              <h1 className="text-3xl font-extrabold text-gray-900">Your Cart</h1>
            </div>

            {items.length === 0 ? (
              <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm">
                <ShoppingCart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Cart is empty</h3>
                <p className="text-gray-500 mb-6">Explore the marketplace and add some beautiful handicrafts.</p>
                <Link to="/marketplace" className="bg-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-secondary inline-block">Browse Marketplace</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                  {items.map(item => (
                    <div key={item.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
                      <div className="w-20 h-20 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                        {item.product?.images?.[0]?.url
                          ? <img src={item.product.images[0].url} className="w-full h-full object-cover" alt="" />
                          : <div className="flex items-center justify-center h-full text-gray-300"><ShoppingCart className="w-6 h-6" /></div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-extrabold text-gray-900 truncate">{item.product?.name}</h4>
                        <p className="text-primary font-bold mt-1">₹{item.product?.final_price}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center border-2 border-gray-200 rounded-xl">
                          <button onClick={() => updateQty(item.id, item.quantity - 1)} className="px-3 py-2 text-gray-600 hover:bg-gray-50 font-bold">−</button>
                          <span className="px-3 py-2 font-bold border-x-2 border-gray-200">{item.quantity}</span>
                          <button onClick={() => updateQty(item.id, item.quantity + 1)} className="px-3 py-2 text-gray-600 hover:bg-gray-50 font-bold">+</button>
                        </div>
                        <button onClick={() => remove(item.id)} className="text-red-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm sticky top-24">
                    <h3 className="text-lg font-extrabold text-gray-900 mb-5">Order Summary</h3>
                    <div className="space-y-3 text-sm mb-5">
                      <div className="flex justify-between text-gray-600"><span>Subtotal ({items.length} items)</span><span>₹{total}</span></div>
                      <div className="flex justify-between text-gray-600"><span>Delivery</span><span className="text-green-600 font-bold">Free</span></div>
                      <div className="border-t border-gray-100 pt-3 flex justify-between font-extrabold text-gray-900 text-lg"><span>Total</span><span className="text-primary">₹{total}</span></div>
                    </div>
                    <button onClick={() => setStep("checkout")} className="w-full bg-primary text-white font-bold py-4 rounded-xl hover:bg-secondary flex items-center justify-center shadow-lg shadow-primary/20 transition">
                      Checkout <ArrowRight className="w-5 h-5 ml-2" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {step === "checkout" && (
          <div className="max-w-xl mx-auto">
            <div className="flex items-center mb-8">
              <button onClick={() => setStep("cart")} className="text-gray-500 hover:text-primary mr-4"><ArrowLeft className="w-5 h-5" /></button>
              <h1 className="text-3xl font-extrabold text-gray-900">Delivery Details</h1>
            </div>
            <form onSubmit={placeOrder} className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                <input required type="text" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-primary focus:outline-none transition" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                <input required type="tel" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-primary focus:outline-none transition" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Complete Address</label>
                <textarea required rows={4} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-primary focus:outline-none transition resize-none" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 flex items-center">
                <CreditCard className="w-7 h-7 text-gray-400 mr-3 flex-shrink-0" />
                <div>
                  <p className="font-bold text-gray-900 text-sm">Cash on Delivery</p>
                  <p className="text-xs text-gray-500">Pay directly to the artisan on delivery</p>
                </div>
              </div>
              <button type="submit" disabled={placing} className="w-full bg-primary text-white font-bold py-4 rounded-xl hover:bg-secondary disabled:opacity-60 shadow-lg shadow-primary/20 transition">
                {placing ? "Placing Order…" : `Place Order • ₹${total}`}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
