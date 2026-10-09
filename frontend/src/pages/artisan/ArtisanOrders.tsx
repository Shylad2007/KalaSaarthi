import { useEffect, useState } from "react";
import { apiCall } from "../../api";
import ArtisanLayout from "../../components/ArtisanLayout";
import { Package, MapPin, Clock, ChevronDown } from "lucide-react";

const STATUSES = ["Placed", "Confirmed", "Preparing", "Shipped", "Delivered"];
const STATUS_COLORS: Record<string, string> = {
  Placed: "bg-blue-100 text-blue-800",
  Confirmed: "bg-purple-100 text-purple-800",
  Preparing: "bg-yellow-100 text-yellow-800",
  Shipped: "bg-orange-100 text-orange-800",
  Delivered: "bg-green-100 text-green-800",
};

export default function ArtisanOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => apiCall("/artisan/orders").then(setOrders).catch(console.error).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const updateStatus = async (orderId: number, status: string) => {
    await apiCall(`/orders/${orderId}/status`, { method: "PUT", body: JSON.stringify({ status }) });
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  return (
    <ArtisanLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Orders Received</h1>
        <p className="text-gray-500 mt-1">{orders.length} order{orders.length !== 1 ? "s" : ""} from buyers</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm">
          <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h3>
          <p className="text-gray-500">When buyers purchase your products, they'll appear here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Header */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Order</p>
                    <p className="font-extrabold text-gray-900">#{order.id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Date</p>
                    <p className="font-bold text-gray-900 flex items-center"><Clock className="w-3.5 h-3.5 mr-1 text-gray-400" />{new Date(order.created_at).toLocaleDateString("en-IN")}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Buyer</p>
                    <p className="font-bold text-gray-900">{order.buyer_name || "—"}</p>
                  </div>
                </div>

                {/* Status dropdown */}
                <div className="relative">
                  <select
                    value={order.status}
                    onChange={e => updateStatus(order.id, e.target.value)}
                    className={`appearance-none pl-3 pr-8 py-2 rounded-xl text-sm font-bold border-2 border-transparent cursor-pointer focus:outline-none focus:border-primary transition ${STATUS_COLORS[order.status]}`}
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                </div>
              </div>

              {/* Body */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-bold text-gray-700 mb-3">Items to Fulfil</p>
                  <div className="space-y-2">
                    {order.items.map((item: any, i: number) => (
                      <div key={i} className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-xl">
                        <div className="flex items-center">
                          <span className="w-7 h-7 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-xs font-extrabold mr-3">{item.quantity}×</span>
                          <span className="font-medium text-gray-900">{item.product_name}</span>
                        </div>
                        {item.price && <span className="font-bold text-primary text-sm">₹{(item.price * item.quantity).toFixed(0)}</span>}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-orange-50 rounded-2xl p-5 border border-orange-100">
                  <p className="text-sm font-bold text-orange-800 mb-2 flex items-center"><MapPin className="w-4 h-4 mr-1.5" />Delivery Address</p>
                  <p className="text-orange-900 whitespace-pre-wrap text-sm leading-relaxed">{order.address || "Not provided"}</p>
                  {order.phone && <p className="text-orange-800 text-sm mt-2 font-medium">📞 {order.phone}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </ArtisanLayout>
  );
}
