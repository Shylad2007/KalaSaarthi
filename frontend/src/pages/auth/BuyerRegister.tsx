import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../AuthContext";
import { apiCall } from "../../api";
import { ShoppingBag, ArrowRight } from "lucide-react";

export default function BuyerRegister() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const update = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true); setError("");
    try {
      await apiCall("/auth/register", { method: "POST", body: JSON.stringify({ ...form, role: "buyer" }) });
      const res = await apiCall("/auth/login", { method: "POST", body: JSON.stringify({ email: form.email, password: form.password }) });
      login(res.access_token);
      navigate("/marketplace");
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0F] flex flex-col">
      {/* Prism top stripe */}
      <div className="h-1 prism-gradient" />

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">

          {/* Brand */}
          <Link to="/" className="flex items-center justify-center mb-10 group">
            <span
              style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, letterSpacing: "-0.03em", fontSize: "1.35rem" }}
              className="text-white group-hover:opacity-80 transition-opacity"
            >
              KalaSaarthi
            </span>
          </Link>

          <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-7 backdrop-blur-sm">

            {/* Icon */}
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-5"
              style={{ background: "rgba(63,199,233,0.12)" }}
            >
              <ShoppingBag className="w-5 h-5" style={{ color: "#3FC7E9" }} />
            </div>

            {/* Heading */}
            <h1
              style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, letterSpacing: "-0.025em" }}
              className="text-xl text-white mb-1"
            >
              Create buyer account
            </h1>
            <p className="text-white/40 text-sm mb-6" style={{ fontFamily: "Inter, sans-serif" }}>
              Find and support authentic Indian artisans
            </p>

            {error && (
              <div className="bg-red-950/60 border border-red-500/25 text-red-400 px-4 py-3 rounded-xl mb-5 text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  className="block text-[10px] font-semibold text-white/40 uppercase tracking-[0.1em] mb-2"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#3FC7E9]/60 focus:bg-white/[0.07] transition-all placeholder-white/20"
                  style={{ fontFamily: "Inter, sans-serif" }}
                  placeholder="Arjun Mehta"
                  value={form.name}
                  onChange={update("name")}
                />
              </div>
              <div>
                <label
                  className="block text-[10px] font-semibold text-white/40 uppercase tracking-[0.1em] mb-2"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  Email
                </label>
                <input
                  type="email"
                  required
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#3FC7E9]/60 focus:bg-white/[0.07] transition-all placeholder-white/20"
                  style={{ fontFamily: "Inter, sans-serif" }}
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={update("email")}
                />
              </div>
              <div>
                <label
                  className="block text-[10px] font-semibold text-white/40 uppercase tracking-[0.1em] mb-2"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#3FC7E9]/60 focus:bg-white/[0.07] transition-all placeholder-white/20"
                  style={{ fontFamily: "Inter, sans-serif" }}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={update("password")}
                />
              </div>
              <div>
                <label
                  className="block text-[10px] font-semibold text-white/40 uppercase tracking-[0.1em] mb-2"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#3FC7E9]/60 focus:bg-white/[0.07] transition-all placeholder-white/20"
                  style={{ fontFamily: "Inter, sans-serif" }}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 mt-1"
                style={{ fontFamily: "Space Grotesk, sans-serif", background: "#3FC7E9", color: "#0B0B0F" }}
              >
                {loading ? (
                  "Creating account…"
                ) : (
                  <>
                    <span>Create account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-5 pt-5 border-t border-white/[0.08] space-y-1.5 text-center">
              <p className="text-white/40 text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
                Already registered?{" "}
                <Link
                  to="/buyer/login"
                  className="text-white/70 hover:text-white font-semibold transition-colors"
                >
                  Sign in
                </Link>
              </p>
              <p className="text-white/20 text-xs" style={{ fontFamily: "Inter, sans-serif" }}>
                Are you an artisan?{" "}
                <Link
                  to="/artisan/register"
                  className="text-white/35 hover:text-white/60 transition-colors"
                >
                  Artisan sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
