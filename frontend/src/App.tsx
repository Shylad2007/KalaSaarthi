import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./AuthContext";

// Public pages
import Landing from "./pages/Landing";
import ArtisanLogin from "./pages/auth/ArtisanLogin";
import ArtisanRegister from "./pages/auth/ArtisanRegister";
import BuyerLogin from "./pages/auth/BuyerLogin";
import BuyerRegister from "./pages/auth/BuyerRegister";

// Artisan pages
import ArtisanOnboarding from "./pages/artisan/Onboarding";
import ArtisanDashboard from "./pages/artisan/Dashboard";
import ArtisanOrders from "./pages/artisan/ArtisanOrders";

// Buyer pages
import Marketplace from "./pages/buyer/Marketplace";
import ProductDetail from "./pages/buyer/ProductDetail";
import Cart from "./pages/buyer/Cart";
import BuyerOrders from "./pages/buyer/BuyerOrders";

function ProtectedRoute({ children, role }: { children: React.ReactNode; role?: "artisan" | "buyer" }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user) return <Navigate to="/" replace state={{ from: location }} />;
  if (role && user.role !== role) return <Navigate to="/" replace />;

  // Redirect artisans to onboarding if not complete
  if (user.role === "artisan" && !user.onboarding_complete && location.pathname !== "/artisan/onboarding") {
    return <Navigate to="/artisan/onboarding" replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/artisan/login" element={<ArtisanLogin />} />
          <Route path="/artisan/register" element={<ArtisanRegister />} />
          <Route path="/buyer/login" element={<BuyerLogin />} />
          <Route path="/buyer/register" element={<BuyerRegister />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/product/:id" element={<ProductDetail />} />

          {/* Artisan */}
          <Route path="/artisan/onboarding" element={
            <ProtectedRoute role="artisan"><ArtisanOnboarding /></ProtectedRoute>
          } />
          <Route path="/artisan/dashboard" element={
            <ProtectedRoute role="artisan"><ArtisanDashboard /></ProtectedRoute>
          } />
          <Route path="/artisan/orders" element={
            <ProtectedRoute role="artisan"><ArtisanOrders /></ProtectedRoute>
          } />

          {/* Buyer */}
          <Route path="/cart" element={<ProtectedRoute role="buyer"><Cart /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute role="buyer"><BuyerOrders /></ProtectedRoute>} />

          {/* Legacy redirects */}
          <Route path="/login" element={<Navigate to="/artisan/login" />} />
          <Route path="/register" element={<Navigate to="/artisan/register" />} />
          <Route path="/dashboard" element={<Navigate to="/artisan/dashboard" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
