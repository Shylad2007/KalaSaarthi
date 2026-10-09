import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../AuthContext";
import { apiCall } from "../../api";
import { Palette } from "lucide-react";

export default function ArtisanRegister() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const update = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      await apiCall("/auth/register", {
        method: "POST",
        body: JSON.stringify({ ...form, role: "artisan" })
      });
      const res = await apiCall("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: form.email, password: form.password })
      });
      login(res.access_token);
      navigate("/artisan/onboarding");
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="text-2xl font-extrabold text-primary block text-center mb-8">KalaSaarthi</Link>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <div className="flex items-center justify-center w-14 h-14 bg-primary/10 rounded-2xl mx-auto mb-6">
            <Palette className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 text-center mb-1">Join as Artisan</h1>
          <p className="text-gray-500 text-center mb-8">Start digitizing your craft today</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm font-medium">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Your Name</label>
              <input type="text" required className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-primary focus:outline-none transition" value={form.name} onChange={update("name")} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
              <input type="email" required className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-primary focus:outline-none transition" value={form.email} onChange={update("email")} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Create Password</label>
              <input type="password" required minLength={6} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-primary focus:outline-none transition" value={form.password} onChange={update("password")} />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-primary text-white font-bold py-4 rounded-xl hover:bg-secondary transition shadow-lg shadow-primary/20 disabled:opacity-60">
              {loading ? "Creating account..." : "Create Artisan Account"}
            </button>
          </form>

          <p className="text-center mt-6 text-gray-500 text-sm">
            Already registered? <Link to="/artisan/login" className="text-primary font-bold hover:underline">Sign in</Link>
          </p>
          <p className="text-center mt-2 text-gray-400 text-xs">
            Are you a buyer? <Link to="/buyer/register" className="text-gray-500 hover:underline">Buyer sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
