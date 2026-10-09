import { BrowserRouter, Routes, Route } from "react-router-dom";
import Cart from "./pages/buyer/Cart";
import BuyerOrders from "./pages/buyer/BuyerOrders";
import ArtisanOrders from "./pages/artisan/ArtisanOrders";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/cart" element={<Cart />} />
        <Route path="/orders" element={<BuyerOrders />} />
        <Route path="/artisan/orders" element={<ArtisanOrders />} />
        <Route path="*" element={<div className="p-8 text-center"><h1 className="text-2xl font-bold">KalaSaarthi Foundation</h1></div>} />
      </Routes>
    </BrowserRouter>
  );
}
