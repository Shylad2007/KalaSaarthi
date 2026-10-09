import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../../i18n/LanguageContext";
import { LanguageSelector } from "../../components/LanguageSelector";
import { apiCall } from "../../api";
import { Trash2, ArrowRight, ArrowLeft, ShoppingCart, CreditCard, CheckCircle, Minus, Plus } from "lucide-react";

export default function Cart() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<"cart" | "checkout" | "success">("cart");
  const [placing, setPlacing] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const { t, formatCurrency } = useLanguage();
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
    } catch (err: any) { alert(t("common.error", "Order failed: ") + err.message); }
    finally { setPlacing(false); }
  };

  const total = items.reduce((s, i) => s + (i.product?.final_price || 0) * i.quantity, 0);

  const Header = () => (
    <header className="bg-white border-b border-[#E8E6E1] sticky top-0 z-30">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        <Link
          to="/marketplace"
          style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, letterSpacing: "-0.02em" }}
          className="text-[#0B0B0F] text-lg"
        >
          {t("brand.name", "KalaSaarthi")}
        </Link>
        <div className="flex items-center gap-3">
          <LanguageSelector variant="light" compact />
          <Link to="/orders" className="text-sm font-medium text-[#6B6860] hover:text-[#0B0B0F] transition">
            {t("nav.orders", "Orders")}
          </Link>
        </div>
      </div>
    </header>
  );

  if (loading) return (
    <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#E8E6E1] border-t-[#7CE25B] rounded-full animate-spin" />
    </div>
  );

  if (step === "success") return (
    <div className="min-h-screen bg-[#F7F5F0]">
      <Header />
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="w-20 h-20 bg-[#7CE25B]/15 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-[#7CE25B]" />
        </div>
        <h1
          style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, letterSpacing: "-0.03em" }}
          className="text-3xl text-[#0B0B0F] mb-3"
        >
          {t("cart.orderSuccess", "Order Confirmed!")} 🎉
        </h1>
        <p className="text-[#6B6860] mb-2 text-sm">{t("cart.orderSuccessDesc", "Thank you! Your order has been placed directly with the craftsperson.")}</p>
        <p className="text-[#0B0B0F] font-semibold text-sm mb-8">
          {t("cart.orderId", "Order Reference ID")}: #{orderId}
        </p>
        <Link
          to="/orders"
          style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700 }}
          className="bg-[#0B0B0F] text-white px-8 py-3.5 rounded-xl hover:bg-[#1a1a1f] inline-block transition text-sm"
        >
          {t("cart.viewMyOrders", "View My Orders")}
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F7F5F0]">
      <Header />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {step === "cart" && (
          <>
            {/* Page title */}
            <div className="flex items-center gap-3 mb-8">
              <Link to="/marketplace" className="text-[#6B6860] hover:text-[#0B0B0F] transition p-1 -ml-1">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1
                style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, letterSpacing: "-0.03em" }}
                className="text-2xl sm:text-3xl text-[#0B0B0F]"
              >
                {t("cart.title", "Your Shopping Cart")}
              </h1>
              {items.length > 0 && (
                <span className="text-sm text-[#6B6860] font-medium">({items.length})</span>
              )}
            </div>

            {items.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#E8E6E1] p-16 text-center">
                <div className="w-16 h-16 bg-[#F7F5F0] rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <ShoppingCart className="w-8 h-8 text-[#E8E6E1]" />
                </div>
                <p
                  style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700 }}
                  className="text-xl text-[#0B0B0F] mb-2"
                >
                  {t("cart.empty", "Your cart is currently empty")}
                </p>
                <p className="text-sm text-[#6B6860] mb-6">
                  {t("cart.emptyDesc", "Explore our marketplace and support skilled artisans by adding authentic handcrafted products.")}
                </p>
                <Link
                  to="/marketplace"
                  style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700 }}
                  className="bg-[#0B0B0F] text-white px-6 py-3 rounded-xl hover:bg-[#1a1a1f] inline-block transition text-sm"
                >
                  {t("cart.startShopping", "Explore Marketplace")}
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Items list */}
                <div className="lg:col-span-2 space-y-3">
                  {items.map(item => (
                    <div key={item.id} className="bg-white rounded-2xl border border-[#E8E6E1] p-4 flex items-center gap-4">
                      {/* Thumbnail */}
                      <div className="w-[60px] h-[60px] rounded-xl bg-[#F7F5F0] overflow-hidden flex-shrink-0 border border-[#E8E6E1]">
                        {item.product?.images?.[0]?.url
                          ? <img src={item.product.images[0].url} className="w-full h-full object-cover" alt="" />
                          : <div className="flex items-center justify-center h-full text-[#E8E6E1]"><ShoppingCart className="w-5 h-5" /></div>
                        }
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h4
                          style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700 }}
                          className="text-[#0B0B0F] text-sm truncate"
                        >
                          {item.product?.name}
                        </h4>
                        <p className="text-xs text-[#6B6860] mt-0.5 truncate">
                          {t("market.by", "by")} {item.product?.artisan?.name || t("nav.artisanPortal", "Artisan")}
                        </p>
                        <p
                          style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700 }}
                          className="text-[#0B0B0F] text-sm mt-1"
                        >
                          {formatCurrency((item.product?.final_price || 0) * item.quantity)}
                        </p>
                      </div>

                      {/* Qty + remove */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="flex items-center border border-[#E8E6E1] rounded-lg bg-[#F7F5F0] overflow-hidden">
                          <button
                            onClick={() => updateQty(item.id, item.quantity - 1)}
                            className="px-2.5 py-2 text-[#0B0B0F] hover:bg-[#E8E6E1] transition"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span
                            style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700 }}
                            className="px-3 py-2 text-[#0B0B0F] text-sm border-x border-[#E8E6E1] min-w-[2rem] text-center"
                          >
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQty(item.id, item.quantity + 1)}
                            className="px-2.5 py-2 text-[#0B0B0F] hover:bg-[#E8E6E1] transition"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => remove(item.id)}
                          className="p-2 text-[#6B6860] hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary panel */}
                <div>
                  <div className="bg-white rounded-2xl border border-[#E8E6E1] p-6 sticky top-[72px]">
                    <h3
                      style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700 }}
                      className="text-[#0B0B0F] text-lg mb-5"
                    >
                      {t("cart.orderSummary", "Order Summary")}
                    </h3>
                    <div className="space-y-3 text-sm mb-5">
                      <div className="flex justify-between text-[#6B6860]">
                        <span>{t("cart.subtotal", "Subtotal")} ({items.length})</span>
                        <span>{formatCurrency(total)}</span>
                      </div>
                      <div className="flex justify-between text-[#6B6860]">
                        <span>{t("cart.delivery", "Delivery Fee")}</span>
                        <span className="text-[#7CE25B] font-semibold">{t("cart.free", "FREE")}</span>
                      </div>
                      <div className="border-t border-[#E8E6E1] pt-3 flex justify-between text-[#0B0B0F]">
                        <span style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700 }}>{t("cart.total", "Total Amount")}</span>
                        <span style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700 }}>{formatCurrency(total)}</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-[#6B6860] mb-4">{t("cart.codNotice", "You will pay cash or UPI directly when your package is handed over.")}</p>
                    <button
                      onClick={() => setStep("checkout")}
                      style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700 }}
                      className="w-full bg-[#7CE25B] text-[#0B0B0F] py-3.5 rounded-xl hover:brightness-95 flex items-center justify-center gap-2 transition text-sm"
                    >
                      {t("cart.proceedToCheckout", "Proceed to Checkout")} <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {step === "checkout" && (
          <div className="max-w-xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <button
                onClick={() => setStep("cart")}
                className="text-[#6B6860] hover:text-[#0B0B0F] transition p-1 -ml-1"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1
                style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, letterSpacing: "-0.03em" }}
                className="text-2xl sm:text-3xl text-[#0B0B0F]"
              >
                {t("cart.checkoutTitle", "Delivery & Contact Details")}
              </h1>
            </div>

            <form onSubmit={placeOrder} className="bg-white rounded-2xl border border-[#E8E6E1] p-6 sm:p-8 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-[#0B0B0F] uppercase tracking-wider mb-2">
                  {t("cart.fullName", "Recipient Full Name")}
                </label>
                <input
                  required
                  type="text"
                  className="w-full border border-[#E8E6E1] rounded-xl px-4 py-3 text-sm text-[#0B0B0F] bg-[#F7F5F0] focus:border-[#0B0B0F] focus:outline-none focus:bg-white transition"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#0B0B0F] uppercase tracking-wider mb-2">
                  {t("cart.phone", "Contact Phone Number")}
                </label>
                <input
                  required
                  type="tel"
                  className="w-full border border-[#E8E6E1] rounded-xl px-4 py-3 text-sm text-[#0B0B0F] bg-[#F7F5F0] focus:border-[#0B0B0F] focus:outline-none focus:bg-white transition"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#0B0B0F] uppercase tracking-wider mb-2">
                  {t("cart.deliveryAddress", "Complete Shipping Address")}
                </label>
                <textarea
                  required
                  rows={4}
                  className="w-full border border-[#E8E6E1] rounded-xl px-4 py-3 text-sm text-[#0B0B0F] bg-[#F7F5F0] focus:border-[#0B0B0F] focus:outline-none focus:bg-white transition resize-none"
                  value={form.address}
                  onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                />
              </div>

              {/* Payment method */}
              <div className="flex items-center gap-3 bg-[#F7F5F0] rounded-xl p-4 border border-[#E8E6E1]">
                <CreditCard className="w-6 h-6 text-[#6B6860] flex-shrink-0" />
                <div>
                  <p style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700 }} className="text-sm text-[#0B0B0F]">
                    {t("cart.cod", "Cash on Delivery (Pay upon arrival)")}
                  </p>
                  <p className="text-xs text-[#6B6860]">{t("cart.codNotice", "You will pay cash or UPI directly when your package is handed over.")}</p>
                </div>
              </div>

              {/* Order total */}
              <div className="flex justify-between items-center py-3 border-t border-[#E8E6E1]">
                <span className="text-sm text-[#6B6860]">{t("cart.total", "Total Amount")}</span>
                <span style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700 }} className="text-[#0B0B0F]">
                  {formatCurrency(total)}
                </span>
              </div>

              <button
                type="submit"
                disabled={placing}
                style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700 }}
                className="w-full bg-[#7CE25B] text-[#0B0B0F] py-3.5 rounded-xl hover:brightness-95 disabled:opacity-60 flex items-center justify-center gap-2 transition text-sm"
              >
                {placing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#0B0B0F]/30 border-t-[#0B0B0F] rounded-full animate-spin" />
                    {t("cart.placingOrder", "Placing Order…")}
                  </>
                ) : (
                  `${t("cart.placeOrder", "Place Order")} · ${formatCurrency(total)}`
                )}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
