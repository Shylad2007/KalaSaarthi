import { Link, Navigate } from "react-router-dom";
import { Palette, ShoppingBag, Sparkles, Mic, Camera, TrendingUp, ArrowRight, MapPin, Award } from "lucide-react";
import { useAuth } from "../AuthContext";

export default function Landing() {
  const { user, loading } = useAuth();

  // Redirect already-authenticated users to their respective home pages
  if (!loading && user) {
    if (user.role === "artisan") {
      return <Navigate to={user.onboarding_complete ? "/artisan/dashboard" : "/artisan/onboarding"} replace />;
    }
    return <Navigate to="/marketplace" replace />;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="border-b border-gray-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <span className="text-2xl font-extrabold text-primary">KalaSaarthi</span>
          <div className="flex items-center gap-3">
            <Link to="/marketplace" className="text-gray-600 hover:text-primary font-medium text-sm">Marketplace</Link>
            <Link to="/artisan/login" className="text-primary font-bold text-sm hover:underline">Artisan Portal</Link>
            <Link to="/buyer/login" className="bg-primary text-white font-bold px-4 py-2 rounded-xl text-sm hover:bg-secondary transition">Sign In</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-green-50 via-white to-amber-50 px-6 py-24">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center bg-primary/10 text-primary px-4 py-2 rounded-full font-bold text-sm mb-8">
            <Sparkles className="w-4 h-4 mr-2" /> AI-Powered Artisan Platform
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
            Connecting India's<br /><span className="text-primary">Master Artisans</span><br />to the World
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12 leading-relaxed">
            KalaSaarthi uses AI to help traditional craftspeople create professional catalogues, price their work fairly, and reach buyers across India and beyond.
          </p>

          {/* Two CTAs */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <div className="bg-white border-2 border-primary rounded-3xl p-8 max-w-xs w-full shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20 transition group">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-primary group-hover:text-white transition">
                <Palette className="w-7 h-7 text-primary group-hover:text-white" />
              </div>
              <h3 className="text-xl font-extrabold text-gray-900 mb-2">I'm an Artisan</h3>
              <p className="text-gray-500 text-sm mb-6">Digitize your craft, get AI-powered catalogues, and sell across India.</p>
              <div className="flex flex-col gap-2">
                <Link to="/artisan/register" className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-secondary text-center transition">Create Artisan Account</Link>
                <Link to="/artisan/login" className="w-full text-primary font-bold py-2 rounded-xl hover:bg-primary/5 text-center transition text-sm">Sign in</Link>
              </div>
            </div>

            <div className="bg-white border-2 border-blue-300 rounded-3xl p-8 max-w-xs w-full shadow-lg shadow-blue-200/50 hover:shadow-xl hover:shadow-blue-200 transition group">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-blue-600 group-hover:text-white transition">
                <ShoppingBag className="w-7 h-7 text-blue-600 group-hover:text-white" />
              </div>
              <h3 className="text-xl font-extrabold text-gray-900 mb-2">I'm a Buyer</h3>
              <p className="text-gray-500 text-sm mb-6">Discover authentic handcrafted products and support skilled artisans.</p>
              <div className="flex flex-col gap-2">
                <Link to="/buyer/register" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 text-center transition">Create Buyer Account</Link>
                <Link to="/marketplace" className="w-full text-blue-600 font-bold py-2 rounded-xl hover:bg-blue-50 text-center transition text-sm">Browse without signing in</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Artisan features */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-primary font-bold uppercase tracking-wider text-sm mb-3">For Artisans</p>
            <h2 className="text-4xl font-extrabold text-gray-900">Your complete digital business toolkit</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Mic, title: "Voice-to-Catalogue", desc: "Speak about your product in Hindi or English. Our AI instantly converts it into a professional, searchable product listing.", color: "bg-green-100 text-green-700" },
              { icon: Camera, title: "Image Intelligence", desc: "Upload a photo and get instant quality feedback. Poor lighting, blur, and composition issues are flagged with improvement tips.", color: "bg-purple-100 text-purple-700" },
              { icon: TrendingUp, title: "Smart Pricing", desc: "Get AI-powered price recommendations based on your materials, craft type, and current market rates — so you always earn fairly.", color: "bg-orange-100 text-orange-700" },
              { icon: Sparkles, title: "Revival Engine", desc: "Identify underperforming products with actionable improvement tips to bring them back to life in the marketplace.", color: "bg-yellow-100 text-yellow-700" },
              { icon: Award, title: "Government Schemes", desc: "Personalised scheme recommendations based on your craft and location — PM Vishwakarma Yojana, MUDRA loans, GeM, and more.", color: "bg-blue-100 text-blue-700" },
              { icon: MapPin, title: "Personalised Experience", desc: "Complete your onboarding once. Get a dashboard that knows your craft, location, and needs — not a generic page.", color: "bg-pink-100 text-pink-700" },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="p-6 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition bg-white">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-extrabold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="px-6 py-20 bg-primary text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-extrabold mb-4">Start your journey today</h2>
          <p className="text-green-200 text-xl mb-10">Join thousands of artisans already using KalaSaarthi to grow their craft businesses.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/artisan/register" className="bg-white text-primary font-extrabold px-8 py-4 rounded-xl hover:bg-green-50 transition flex items-center justify-center shadow-lg">
              I'm an Artisan <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link to="/marketplace" className="bg-primary border-2 border-white text-white font-extrabold px-8 py-4 rounded-xl hover:bg-green-700 transition flex items-center justify-center">
              Browse Marketplace <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-gray-100">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="text-xl font-extrabold text-primary">KalaSaarthi</span>
          <p className="text-gray-400 text-sm">AI-Driven Market Linkage for Indian Artisans</p>
          <div className="flex gap-4 text-sm text-gray-500">
            <Link to="/marketplace" className="hover:text-primary">Marketplace</Link>
            <Link to="/artisan/register" className="hover:text-primary">Join as Artisan</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
