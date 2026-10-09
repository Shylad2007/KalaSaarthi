import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiCall } from "../../api";
import { Package, Clock, Truck, CheckCircle, ArrowLeft, ShoppingBag } from "lucide-react";

const STATUS_CONFIG: Record<string, { color: string; icon: any; step: number }> = {
  Placed:    { color: "bg-blue-100 text-blue-800", icon: Clock, step: 1 },
  Confirmed: { color: "bg-purple-100 text-purple-800", icon: CheckCircle, step: 2 },
  Preparing: { color: "bg-yellow-100 text-yellow-800", icon: Package, step: 3 },
  Shipped:   { color: "bg-orange-100 text-orange-800", icon: Truck, step: 4 },
  Delivered: { color: "bg-green-100 text-green-800", icon: CheckCircle, step: 5 },
};
const STEPS = ["Placed", "Confirmed", "Preparing", "Shipped", "Delivered"];

function OrderProgress({ status }: { status: string }) {
  const currentStep = STATUS_CONFIG[status]?.step || 1;
  return (
    <div className="flex items-center justify-between w-full">
      {STEPS.map((s, i) => (
        <div key={s} className="flex flex-col items-center flex-1 relative">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i + 1 <= currentStep ? "bg-primary text-white" : "bg-gray-200 text-gray-400"}`}>
            {i + 1 <= currentStep ? <CheckCircle className="w-4 h-4" /> : <span>{i + 1}</span>}
          </div>
          <span className={`text-xs mt-1 font-medium hidden sm:block ${i + 1 <= currentStep ? "text-primary" : "text-gray-400"}`}>{s}</span>
          {i < STEPS.length - 1 && (
            <div className={`absolute h-0.5 w-full top-4 left-1/2 ${i + 1 < currentStep ? "bg-primary" : "bg-gray-200"}`} />
          )}
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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/marketplace" className="text-2xl font-extrabold text-primary">KalaSaarthi</Link>
          <Link to="/cart" className="text-gray-600 hover:text-primary font-medium text-sm flex items-center"><ShoppingBag className="w-4 h-4 mr-1" />Cart</Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center mb-8">
          <Link to="/marketplace" className="text-gray-500 hover:text-primary mr-4"><ArrowLeft className="w-5 h-5" /></Link>
          <h1 className="text-3xl font-extrabold text-gray-900">My Orders</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm">
            <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-500 mb-6">Start browsing and support Indian artisans.</p>
            <Link to="/marketplace" className="bg-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-secondary inline-block">Explore Marketplace</Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => {
              const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG["Placed"];
              const Icon = cfg.icon;
              return (
                <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  {/* Header */}
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-6 flex-wrap">
                      <div><p className="text-xs text-gray-500 font-bold">ORDER #</p><p className="font-extrabold text-gray-900">{order.id}</p></div>
                      <div><p className="text-xs text-gray-500 font-bold">DATE</p><p className="font-bold text-gray-900">{new Date(order.created_at).toLocaleDateString("en-IN")}</p></div>
                      <div><p className="text-xs text-gray-500 font-bold">TOTAL</p><p className="font-extrabold text-primary">₹{order.total_amount}</p></div>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold ${cfg.color}`}>
                      <Icon className="w-4 h-4 mr-1.5" />{order.status}
                    </span>
                  </div>

                  {/* Tracker */}
                  <div className="px-6 py-5 border-b border-gray-100">
                    <p className="text-xs font-bold text-gray-500 mb-4">Order Progress</p>
                    <div className="flex items-start relative">
                      <OrderProgress status={order.status} />
                    </div>
                  </div>

                  {/* Items + Delivery */}
                  <div className="p-6 flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-700 mb-3">Items</p>
                      {order.items.map((item: any, i: number) => (
                        <div key={i} className="flex items-center py-2 border-b border-gray-50 last:border-0">
                          <span className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-xs font-extrabold mr-3 flex-shrink-0">{item.quantity}×</span>
                          <span className="text-gray-900 font-medium">{item.product_name}</span>
                        </div>
                      ))}
                    </div>
                    {order.estimated_delivery && (
                      <div className="md:w-56 bg-green-50 rounded-2xl p-5 border border-green-100 flex flex-col justify-center">
                        <Truck className="w-6 h-6 text-green-600 mb-2" />
                        <p className="text-xs font-bold text-green-700 uppercase tracking-wider">Estimated Delivery</p>
                        <p className="font-extrabold text-green-900 text-lg mt-1">
                          {new Date(order.estimated_delivery).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
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
