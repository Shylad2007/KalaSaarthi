import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiCall } from "../../api";
import { Package, Clock, Truck, CheckCircle, ArrowLeft, ShoppingBag } from "lucide-react";

const STATUS_CONFIG: Record<string, { color: string; textColor: string; icon: any; step: number }> = {
  Placed:    { color: "bg-[#3FC7E9]/10 border-[#3FC7E9]/30", textColor: "text-[#0B8FAA]", icon: Clock, step: 1 },
  Confirmed: { color: "bg-[#7CE25B]/10 border-[#7CE25B]/30", textColor: "text-[#3a8a20]", icon: CheckCircle, step: 2 },
  Preparing: { color: "bg-[#3FC7E9]/10 border-[#3FC7E9]/30", textColor: "text-[#0B8FAA]", icon: Package, step: 3 },
  Shipped:   { color: "bg-[#E6429B]/10 border-[#E6429B]/30", textColor: "text-[#b02070]", icon: Truck, step: 4 },
  Delivered: { color: "bg-[#0B0B0F]/8 border-[#0B0B0F]/20", textColor: "text-[#0B0B0F]", icon: CheckCircle, step: 5 },
};
const STEPS = ["Placed", "Confirmed", "Preparing", "Shipped", "Delivered"];

function OrderProgress({ status }: { status: string }) {
  const currentStep = STATUS_CONFIG[status]?.step || 1;
  return (
    <div className="flex items-center w-full">
      {STEPS.map((s, i) => (
        <div key={s} className="flex flex-col items-center flex-1 relative">
          {/* Connector line */}
          {i < STEPS.length - 1 && (
            <div
              className={`absolute h-0.5 top-3.5 left-1/2 w-full transition-colors ${
                i + 1 < currentStep ? "bg-[#7CE25B]" : "bg-[#E8E6E1]"
              }`}
            />
          )}
          {/* Dot */}
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center z-10 transition-colors ${
              i + 1 <= currentStep
                ? "bg-[#7CE25B] text-[#0B0B0F]"
                : "bg-white border border-[#E8E6E1] text-[#6B6860]"
            }`}
          >
            {i + 1 <= currentStep
              ? <CheckCircle className="w-3.5 h-3.5" />
              : <span className="text-[10px] font-bold">{i + 1}</span>
            }
          </div>
          <span className={`text-[10px] mt-1.5 font-medium hidden sm:block ${
            i + 1 <= currentStep ? "text-[#0B0B0F]" : "text-[#6B6860]"
          }`}>
            {s}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function BuyerOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { apiCall("/orders").then(setOrders).catch(console.error).finally(() => setLoading(false)); }, []);

  return (
    <div className="min-h-screen bg-[#F7F5F0]">
      {/* Navbar */}
      <header className="bg-white border-b border-[#E8E6E1] sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link
            to="/marketplace"
            style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, letterSpacing: "-0.02em" }}
            className="text-[#0B0B0F] text-lg"
          >
            KalaSaarthi
          </Link>
          <Link
            to="/cart"
            className="text-sm font-medium text-[#6B6860] hover:text-[#0B0B0F] transition flex items-center gap-1.5"
          >
            <ShoppingBag className="w-4 h-4" />
            Cart
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Page title */}
        <div className="flex items-center gap-3 mb-8">
          <Link to="/marketplace" className="text-[#6B6860] hover:text-[#0B0B0F] transition p-1 -ml-1">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1
            style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, letterSpacing: "-0.03em" }}
            className="text-2xl sm:text-3xl text-[#0B0B0F]"
          >
            My Orders
          </h1>
          {orders.length > 0 && (
            <span className="text-sm text-[#6B6860] font-medium">{orders.length} order{orders.length !== 1 ? "s" : ""}</span>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 border-2 border-[#E8E6E1] border-t-[#7CE25B] rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E8E6E1] p-16 text-center">
            <div className="w-16 h-16 bg-[#F7F5F0] rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Package className="w-8 h-8 text-[#E8E6E1]" />
            </div>
            <p
              style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700 }}
              className="text-xl text-[#0B0B0F] mb-2"
            >
              No orders yet
            </p>
            <p className="text-sm text-[#6B6860] mb-6">Start browsing and support Indian artisans.</p>
            <Link
              to="/marketplace"
              style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700 }}
              className="bg-[#0B0B0F] text-white px-6 py-3 rounded-xl hover:bg-[#1a1a1f] inline-block transition text-sm"
            >
              Explore Marketplace
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map(order => {
              const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG["Placed"];
              const Icon = cfg.icon;
              return (
                <div key={order.id} className="bg-white rounded-2xl border border-[#E8E6E1] overflow-hidden">
                  {/* Order header */}
                  <div className="px-5 sm:px-6 py-4 border-b border-[#E8E6E1] flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-5 flex-wrap">
                      <div>
                        <p className="text-[10px] text-[#6B6860] uppercase tracking-widest font-semibold">Order</p>
                        <p style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700 }} className="text-[#0B0B0F] text-sm">
                          #{order.id}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[#6B6860] uppercase tracking-widest font-semibold">Date</p>
                        <p className="text-sm font-medium text-[#0B0B0F]">
                          {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[#6B6860] uppercase tracking-widest font-semibold">Total</p>
                        <p style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700 }} className="text-[#0B0B0F] text-sm">
                          ₹{Number(order.total_amount).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Status badge */}
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${cfg.color} ${cfg.textColor}`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {order.status}
                    </span>
                  </div>

                  {/* Progress tracker */}
                  <div className="px-5 sm:px-6 py-5 border-b border-[#E8E6E1]">
                    <p className="text-[10px] text-[#6B6860] uppercase tracking-widest font-semibold mb-4">Order Progress</p>
                    <OrderProgress status={order.status} />
                  </div>

                  {/* Items + delivery */}
                  <div className="p-5 sm:p-6 flex flex-col md:flex-row gap-5">
                    <div className="flex-1">
                      <p className="text-[10px] text-[#6B6860] uppercase tracking-widest font-semibold mb-3">Items</p>
                      <div className="space-y-2">
                        {order.items.map((item: any, i: number) => (
                          <div key={i} className="flex items-center gap-3">
                            <span
                              style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700 }}
                              className="w-7 h-7 bg-[#F7F5F0] border border-[#E8E6E1] text-[#0B0B0F] rounded-lg flex items-center justify-center text-[10px] flex-shrink-0"
                            >
                              {item.quantity}×
                            </span>
                            <span className="text-sm text-[#0B0B0F] font-medium">{item.product_name}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {order.estimated_delivery && (
                      <div className="md:w-52 bg-[#7CE25B]/10 rounded-xl p-4 border border-[#7CE25B]/20 flex flex-col justify-center">
                        <Truck className="w-5 h-5 text-[#3a8a20] mb-2" />
                        <p className="text-[10px] text-[#3a8a20] uppercase tracking-widest font-semibold">Estimated Delivery</p>
                        <p
                          style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700 }}
                          className="text-[#0B0B0F] text-base mt-1"
                        >
                          {new Date(order.estimated_delivery).toLocaleDateString("en-IN", {
                            weekday: "short",
                            day: "numeric",
                            month: "short"
                          })}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
