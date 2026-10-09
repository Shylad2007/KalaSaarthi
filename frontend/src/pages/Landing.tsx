import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { Navigate } from "react-router-dom";
import {
  Mic, Camera, TrendingUp, Sparkles, Award, MapPin,
  ArrowRight, Palette, ShoppingBag, Star, Zap
} from "lucide-react";

const CRAFTS = ["Handloom", "Pottery", "Jewelry", "Woodcraft", "Embroidery", "Metalwork", "Painting", "Leather"];

export default function Landing() {
  const { user } = useAuth();
  if (user?.role === "buyer") return <Navigate to="/marketplace" replace />;
  if (user?.role === "artisan") return <Navigate to="/artisan/dashboard" replace />;

  return (
    <div className="min-h-screen bg-[#F7F5F0]">

      {/* ── Nav ── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#E8E6E1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, letterSpacing: '-0.03em', fontSize: '1.2rem' }} className="text-[#0B0B0F]">
            KalaSaarthi
          </span>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/marketplace" className="text-sm font-medium text-[#6B6860] hover:text-[#0B0B0F] transition hidden sm:block">Marketplace</Link>
            <Link to="/artisan/login" className="text-sm font-medium text-[#6B6860] hover:text-[#0B0B0F] transition">Sign in</Link>
            <Link to="/artisan/register" className="text-sm font-bold bg-[#0B0B0F] text-white px-4 py-2 rounded-lg hover:bg-[#1a1a1f] transition">Get started</Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="bg-[#0B0B0F] text-white pt-16 pb-20 px-4 sm:px-6 overflow-hidden relative">
        {/* Prism gradient stripe */}
        <div className="absolute top-0 left-0 right-0 h-1 prism-gradient" />

        <div className="max-w-5xl mx-auto text-center">
          {/* Craft chips */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {CRAFTS.map(c => (
              <span key={c} className="text-xs font-medium px-3 py-1 rounded-full border border-white/10 text-white/50">{c}</span>
            ))}
          </div>

          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1.05 }}
            className="text-4xl sm:text-6xl lg:text-7xl mb-6">
            Handmade India,<br />
            <span className="prism-text">Sold Worldwide.</span>
          </h1>

          <p className="text-white/60 text-lg sm:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
            KalaSaarthi uses AI to help traditional craftspeople create professional catalogues,
            price their work fairly, and reach buyers across India and beyond.
          </p>

          {/* Role cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {/* Artisan card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left hover:bg-white/8 transition group">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: 'rgba(124,226,91,0.15)' }}>
                <Palette className="w-5 h-5" style={{ color: '#7CE25B' }} />
              </div>
              <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700 }} className="text-lg text-white mb-1">I'm an Artisan</h3>
              <p className="text-white/50 text-sm mb-5">Digitize your craft, get AI-powered catalogues, and sell across India.</p>
              <div className="space-y-2">
                <Link to="/artisan/register"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-bold text-sm transition"
                  style={{ background: '#7CE25B', color: '#0B0B0F' }}>
                  Create artisan account <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/artisan/login" className="flex items-center justify-center w-full py-2 text-white/50 hover:text-white text-sm font-medium transition">
                  Sign in
                </Link>
              </div>
            </div>

            {/* Buyer card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left hover:bg-white/8 transition group">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: 'rgba(63,199,233,0.15)' }}>
                <ShoppingBag className="w-5 h-5" style={{ color: '#3FC7E9' }} />
              </div>
              <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700 }} className="text-lg text-white mb-1">I'm a Buyer</h3>
              <p className="text-white/50 text-sm mb-5">Discover authentic handcrafted products and support skilled artisans.</p>
              <div className="space-y-2">
                <Link to="/buyer/register"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-bold text-sm transition"
                  style={{ background: '#3FC7E9', color: '#0B0B0F' }}>
                  Create buyer account <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/marketplace" className="flex items-center justify-center w-full py-2 text-white/50 hover:text-white text-sm font-medium transition">
                  Browse without signing in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <section className="bg-white border-y border-[#E8E6E1]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-2 sm:grid-cols-4 gap-6">
          {[
            { value: '10,000+', label: 'Artisans Empowered' },
            { value: '50+', label: 'Craft Categories' },
            { value: '₹2Cr+', label: 'Revenue Generated' },
            { value: '28', label: 'States Covered' },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1.5rem' }} className="text-[#0B0B0F]">{value}</p>
              <p className="text-[#6B6860] text-sm mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="px-4 sm:px-6 py-16 sm:py-20">
        <div className="max-w-5xl mx-auto">
          <div className="mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#6B6860] mb-3">For Artisans</p>
            <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, letterSpacing: '-0.03em' }}
              className="text-3xl sm:text-4xl text-[#0B0B0F] max-w-xl">
              Your complete digital
              <span className="prism-text"> business toolkit</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Mic, title: "Voice-to-Catalogue", desc: "Speak about your product in Hindi or English. AI instantly creates a professional listing.", dot: '#7CE25B' },
              { icon: Camera, title: "Image Intelligence", desc: "Upload a photo and get instant quality feedback with improvement tips.", dot: '#3FC7E9' },
              { icon: TrendingUp, title: "Smart Pricing", desc: "AI-powered price recommendations based on materials, craft type, and market rates.", dot: '#E6429B' },
              { icon: Sparkles, title: "Revival Engine", desc: "Identify underperforming products with actionable tips to bring them back to life.", dot: '#7CE25B' },
              { icon: Award, title: "Government Schemes", desc: "Personalised scheme recommendations — PM Vishwakarma, MUDRA loans, GeM, and more.", dot: '#3FC7E9' },
              { icon: MapPin, title: "Local Personalisation", desc: "Your dashboard knows your craft, location, and needs. Not a generic page.", dot: '#E6429B' },
            ].map(({ icon: Icon, title, desc, dot }) => (
              <div key={title} className="bg-white border border-[#E8E6E1] rounded-2xl p-6 hover:shadow-sm transition">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: dot }}></div>
                  <Icon className="w-4 h-4 text-[#6B6860]" />
                </div>
                <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700 }} className="text-[#0B0B0F] mb-2">{title}</h3>
                <p className="text-[#6B6860] text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-4 sm:px-6 py-16" style={{ background: '#7CE25B' }}>
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, letterSpacing: '-0.03em' }}
              className="text-3xl sm:text-4xl text-[#0B0B0F] mb-2">Start your journey today</h2>
            <p className="text-[#0B0B0F]/60 text-lg">Join thousands of artisans growing their craft business.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/artisan/register"
              className="flex items-center gap-2 font-bold px-6 py-3 rounded-xl transition text-sm"
              style={{ background: '#0B0B0F', color: '#F7F5F0' }}>
              Join as Artisan <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/marketplace"
              className="flex items-center gap-2 font-bold px-6 py-3 rounded-xl border-2 border-[#0B0B0F]/30 hover:border-[#0B0B0F] text-[#0B0B0F] transition text-sm">
              Browse Marketplace
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="px-4 sm:px-6 py-8 bg-white border-t border-[#E8E6E1]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700 }} className="text-[#0B0B0F]">
            KalaSaarthi
          </span>
          <p className="text-[#6B6860] text-sm">AI-Driven Market Linkage for Indian Artisans © 2025</p>
          <div className="flex gap-4 text-sm text-[#6B6860]">
            <Link to="/marketplace" className="hover:text-[#0B0B0F] transition">Marketplace</Link>
            <Link to="/artisan/register" className="hover:text-[#0B0B0F] transition">Join as Artisan</Link>
            <Link to="/buyer/register" className="hover:text-[#0B0B0F] transition">Join as Buyer</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
