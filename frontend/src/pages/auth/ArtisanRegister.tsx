import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../AuthContext";
import { useLanguage } from "../../i18n/LanguageContext";
import { LanguageSelector } from "../../components/LanguageSelector";
import { apiCall } from "../../api";
import { Palette, ArrowRight } from "lucide-react";

export default function ArtisanRegister() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const update = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== confirmPassword) {
      setError(t("auth.passwordsDoNotMatch", "Passwords do not match."));
      return;
    }
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
      setError(err.message || t("common.error", "Registration failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0F] flex flex-col">
      {/* Prism top stripe */}
      <div className="h-1 prism-gradient" />

      {/* Top right language selector */}
      <div className="absolute top-4 right-4 z-20">
        <LanguageSelector variant="dark" compact={false} />
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">

          {/* Brand */}
          <Link to="/" className="flex items-center justify-center mb-10 group">
            <span
              style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, letterSpacing: "-0.03em", fontSize: "1.35rem" }}
              className="text-white group-hover:opacity-80 transition-opacity"
            >
              {t("brand.name", "KalaSaarthi")}
            </span>
          </Link>

          <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-7 backdrop-blur-sm">

            {/* Icon */}
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-5"
              style={{ background: "rgba(124,226,91,0.12)" }}
            >
              <Palette className="w-5 h-5" style={{ color: "#7CE25B" }} />
            </div>

            {/* Heading */}
            <h1
              style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, letterSpacing: "-0.025em" }}
              className="text-xl text-white mb-1"
            >
              {t("auth.artisanSignUpTitle", "Create artisan account")}
            </h1>
            <p className="text-white/40 text-sm mb-6">
              {t("auth.artisanSignUpSub", "Join KalaSaarthi and showcase your handmade craft")}
            </p>

            {error && (
              <div className="bg-red-950/60 border border-red-500/25 text-red-400 px-4 py-3 rounded-xl mb-5 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-[0.1em] mb-2">
                  {t("auth.fullName", "Full Name")}
                </label>
                <input
                  type="text"
                  required
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#7CE25B]/60 focus:bg-white/[0.07] transition-all placeholder-white/20"
                  placeholder="Ram Kumar"
                  value={form.name}
                  onChange={update("name")}
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-[0.1em] mb-2">
                  {t("auth.email", "Email Address")}
                </label>
                <input
                  type="email"
                  required
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#7CE25B]/60 focus:bg-white/[0.07] transition-all placeholder-white/20"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={update("email")}
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-[0.1em] mb-2">
                  {t("auth.password", "Password")}
                </label>
                <input
                  type="password"
                  required
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#7CE25B]/60 focus:bg-white/[0.07] transition-all placeholder-white/20"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={update("password")}
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-[0.1em] mb-2">
                  {t("auth.confirmPassword", "Confirm Password")}
                </label>
                <input
                  type="password"
                  required
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#7CE25B]/60 focus:bg-white/[0.07] transition-all placeholder-white/20"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 mt-1 cursor-pointer"
                style={{ fontFamily: "Space Grotesk, sans-serif", background: "#7CE25B", color: "#0B0B0F" }}
              >
                {loading ? (
                  t("common.loading", "Creating account…")
                ) : (
                  <>
                    <span>{t("auth.signUpButton", "Create Account")}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-5 pt-5 border-t border-white/[0.08] space-y-1.5 text-center">
              <p className="text-white/40 text-sm">
                {t("auth.alreadyHaveAccount", "Already have an account?")}{" "}
                <Link
                  to="/artisan/login"
                  className="text-white/70 hover:text-white font-semibold transition-colors"
                >
                  {t("auth.signInButton", "Sign in")}
                </Link>
              </p>
              <p className="text-white/20 text-xs">
                {t("auth.areYouBuyer", "Buyer?")}{" "}
                <Link
                  to="/buyer/register"
                  className="text-white/35 hover:text-white/60 transition-colors"
                >
                  {t("auth.buyerSignUpTitle", "Buyer registration")}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
