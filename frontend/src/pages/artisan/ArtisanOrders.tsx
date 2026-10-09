import { useEffect, useState } from "react";
import { apiCall } from "../../api";
import ArtisanLayout from "../../components/ArtisanLayout";
import { Package, MapPin, Clock, Phone, ChevronDown, Check } from "lucide-react";

const STATUSES = ["Placed", "Confirmed", "Preparing", "Shipped", "Delivered"];

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  Placed:    { bg: "bg-[#3FC7E9]/20", text: "text-[#0e7a92]" },
  Confirmed: { bg: "bg-[#7CE25B]/20", text: "text-[#2a7a10]" },
  Preparing: { bg: "bg-amber-100",    text: "text-amber-800"  },
  Shipped:   { bg: "bg-[#E6429B]/15", text: "text-[#a01565]"  },
  Delivered: { bg: "bg-[#0B0B0F]",    text: "text-white"      },
};

export default function ArtisanOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingStatus, setPendingStatus] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState<Record<number, boolean>>({});

  const load = () => apiCall("/artisan/orders").then(setOrders).catch(console.error).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const updateStatus = async (orderId: number, status: string) => {
    setSaving(prev => ({ ...prev, [orderId]: true }));
    await apiCall(`/orders/${orderId}/status`, { method: "PUT", body: JSON.stringify({ status }) });
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    setPendingStatus(prev => { const n = { ...prev }; delete n[orderId]; return n; });
    setSaving(prev => ({ ...prev, [orderId]: false }));
  };

  return (
    <ArtisanLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <h1
            className="text-2xl font-bold text-[#0B0B0F]"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Orders
          </h1>
          {!loading && (
            <span className="text-xs font-bold bg-[#0B0B0F] text-white px-2.5 py-1 rounded-full">
              {orders.length}
            </span>
          )}
        </div>
        <p className="text-sm text-[#6B6860] mt-1">
          {orders.filter(o => o.status === "Placed").length} new · manage all your buyer orders here
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white border border-[#E8E6E1] rounded-2xl p-6 animate-pulse">
              <div className="flex justify-between mb-4">
                <div className="h-5 bg-[#E8E6E1] rounded w-24" />
                <div className="h-6 bg-[#E8E6E1] rounded-full w-20" />
              </div>
              <div className="space-y-2">
                <div className="h-3.5 bg-[#E8E6E1] rounded w-1/2" />
                <div className="h-3.5 bg-[#E8E6E1] rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white border border-[#E8E6E1] rounded-2xl p-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#F7F5F0] flex items-center justify-center mx-auto mb-4">
            <Package className="w-7 h-7 text-[#6B6860]" />
          </div>
          <h3
            className="text-lg font-bold text-[#0B0B0F] mb-2"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            No orders yet
          </h3>
          <p className="text-sm text-[#6B6860]">When buyers purchase your products, they'll appear here.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map(order => {
            const style = STATUS_STYLES[order.status] || { bg: "bg-[#E8E6E1]", text: "text-[#6B6860]" };
            const selected = pendingStatus[order.id] ?? order.status;
            return (
              <div key={order.id} className="bg-white border border-[#E8E6E1] rounded-2xl overflow-hidden">
                {/* Card header */}
                <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b border-[#E8E6E1]">
                  <div className="flex items-center gap-5">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B6860]">Order</p>
                      <p
                        className="font-bold text-[#0B0B0F] text-sm"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                      >
                        #{order.id}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B6860]">Date</p>
                      <p className="font-semibold text-[#0B0B0F] text-sm flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#6B6860]" />
                        {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B6860]">Buyer</p>
                      <p className="font-semibold text-[#0B0B0F] text-sm">{order.buyer_name || "—"}</p>
                    </div>
                  </div>
                  {/* Status badge */}
                  <span className={`text-xs font-bold px-3.5 py-1.5 rounded-full ${style.bg} ${style.text}`}>
                    {order.status}
                  </span>
                </div>

                {/* Card body */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Items */}
                  <div>
                    <p className="text-xs font-bold text-[#6B6860] uppercase tracking-wider mb-3">Items</p>
                    <div className="space-y-2">
                      {order.items.map((item: any, i: number) => (
                        <div
                          key={i}
                          className="flex items-center justify-between bg-[#F7F5F0] px-4 py-3 rounded-xl"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-7 h-7 bg-[#0B0B0F] text-white rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0">
                              {item.quantity}×
                            </span>
                            <span className="text-sm font-medium text-[#0B0B0F]">{item.product_name}</span>
                          </div>
                          {item.price && (
                            <span className="text-sm font-bold text-[#0B0B0F]">
                              ₹{(item.price * item.quantity).toFixed(0)}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Address + Status update */}
                  <div className="space-y-4">
                    <div className="bg-[#F7F5F0] rounded-xl p-4 border border-[#E8E6E1]">
                      <p className="text-xs font-bold text-[#6B6860] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" /> Delivery Address
                      </p>
                      <p className="text-sm text-[#0B0B0F] leading-relaxed whitespace-pre-wrap">
                        {order.address || "Not provided"}
                      </p>
                      {order.phone && (
                        <p className="text-sm text-[#6B6860] mt-2 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5" /> {order.phone}
                        </p>
                      )}
                    </div>

                    {/* Status update */}
                    <div>
                      <p className="text-xs font-bold text-[#6B6860] uppercase tracking-wider mb-2">Update Status</p>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <select
                            value={selected}
                            onChange={e => setPendingStatus(prev => ({ ...prev, [order.id]: e.target.value }))}
                            className="w-full appearance-none bg-white border border-[#E8E6E1] rounded-xl px-3 pr-8 py-2.5 text-sm font-semibold text-[#0B0B0F] focus:outline-none focus:border-[#0B0B0F] transition cursor-pointer"
                          >
                            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                          <ChevronDown className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#6B6860]" />
                        </div>
                        <button
                          onClick={() => updateStatus(order.id, selected)}
                          disabled={saving[order.id] || selected === order.status}
                          className="flex items-center gap-1.5 bg-[#0B0B0F] text-white font-semibold px-4 py-2.5 rounded-xl text-sm disabled:opacity-40 hover:opacity-90 transition"
                        >
                          <Check className="w-4 h-4" />
                          {saving[order.id] ? "..." : "Save"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </ArtisanLayout>
  );
}
