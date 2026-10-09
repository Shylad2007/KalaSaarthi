import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../AuthContext";
import { apiCall } from "../../api";
import { ShoppingBag } from "lucide-react";

export default function BuyerLogin() {
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  const { login } = useAuth(); const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError("");
    try {
      const res = await apiCall("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
      if (res.role !== "buyer") { setError("This account is not a buyer account."); return; }
      login(res.access_token);
      navigate("/marketplace");
    } catch (err: any) { setError(err.message || "Login failed"); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="text-2xl font-extrabold text-primary block text-center mb-8">KalaSaarthi</Link>
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <div className="flex items-center justify-center w-14 h-14 bg-blue-100 rounded-2xl mx-auto mb-6">
            <ShoppingBag className="w-7 h-7 text-blue-600" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 text-center mb-1">Buyer Login</h1>
          <p className="text-gray-500 text-center mb-8">Discover authentic Indian handicrafts</p>
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm font-medium">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
              <input type="email" required className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none transition" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
              <input type="password" required className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none transition" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-600/20 disabled:opacity-60">
              {loading ? "Signing in..." : "Sign In as Buyer"}
            </button>
          </form>
          <p className="text-center mt-6 text-gray-500 text-sm">New buyer? <Link to="/buyer/register" className="text-blue-600 font-bold hover:underline">Create account</Link></p>
          <p className="text-center mt-2 text-gray-400 text-xs">Are you an artisan? <Link to="/artisan/login" className="text-gray-500 hover:underline">Artisan login</Link></p>
        </div>
      </div>
    </div>
  );
}
