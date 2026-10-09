import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { useLanguage } from "../i18n/LanguageContext";
import { LanguageSelector } from "./LanguageSelector";
import {
  LayoutDashboard, Package, Plus, Zap, Compass, ShoppingBag, User, LogOut, Menu, X
} from "lucide-react";
import { useState } from "react";

export default function ArtisanLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate("/"); };
  const profile = user?.profile;
  const displayName = profile?.name || user?.email?.split("@")[0] || t("nav.artisanPortal", "Artisan");
  const initial = displayName.charAt(0).toUpperCase();

  const NAV = [
    { to: "/artisan/dashboard", label: t("nav.dashboard", "Dashboard"), icon: LayoutDashboard },
    { to: "/artisan/products", label: t("nav.catalogue", "My Catalogue"), icon: Package },
    { to: "/artisan/add-product", label: t("nav.addProduct", "Add Product"), icon: Plus },
    { to: "/artisan/revival", label: t("nav.revivalEngine", "Revival Engine"), icon: Zap },
    { to: "/artisan/opportunities", label: t("nav.opportunities", "Opportunities"), icon: Compass },
    { to: "/artisan/orders", label: t("nav.orders", "Orders"), icon: ShoppingBag },
    { to: "/artisan/profile", label: t("nav.profile", "Profile"), icon: User },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-[#E8E6E1] flex items-center justify-between">
        <div>
          <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, letterSpacing: '-0.02em' }} className="text-lg text-[#0B0B0F]">
            {t("brand.name", "KalaSaarthi")}
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#7CE25B]"></div>
            <span className="text-xs text-[#6B6860] font-medium">{t("nav.artisanPortal", "Artisan Portal")}</span>
          </div>
        </div>
        <button className="lg:hidden text-[#6B6860] hover:text-[#0B0B0F] transition" onClick={() => setMobileOpen(false)}>
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Artisan info & Language */}
      <div className="px-5 py-3 border-b border-[#E8E6E1] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-[#0B0B0F] flex-shrink-0" style={{ background: 'linear-gradient(135deg, #7CE25B, #3FC7E9)' }}>
            {initial}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-[#0B0B0F] truncate text-xs" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{displayName}</p>
            <p className="text-[10px] text-[#6B6860] truncate">{profile?.craft || "Artisan"}</p>
          </div>
        </div>
        <LanguageSelector compact variant="light" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-semibold text-[#6B6860] uppercase tracking-wider px-3 pb-2 pt-1">{t("nav.dashboard", "Workspace")}</p>
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-[#0B0B0F] text-white"
                  : "text-[#6B6860] hover:bg-[#0B0B0F]/5 hover:text-[#0B0B0F]"
              }`
            }
          >
            <Icon className="w-4 h-4 mr-3 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-3 border-t border-[#E8E6E1]">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-3 py-2 rounded-lg text-sm font-medium text-[#6B6860] hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <LogOut className="w-4 h-4 mr-3" />
          {t("nav.logout", "Log out")}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#F7F5F0]">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-60 bg-white border-r border-[#E8E6E1] flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="relative z-50 w-64 bg-white h-full flex flex-col shadow-2xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        {/* Mobile topbar */}
        <header className="lg:hidden bg-white border-b border-[#E8E6E1] px-4 py-3 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <button onClick={() => setMobileOpen(true)} className="text-[#6B6860] hover:text-[#0B0B0F] transition p-1">
              <Menu className="w-5 h-5" />
            </button>
            <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700 }} className="text-base text-[#0B0B0F]">
              {t("brand.name", "KalaSaarthi")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSelector compact variant="light" />
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-[#0B0B0F]" style={{ background: 'linear-gradient(135deg, #7CE25B, #3FC7E9)' }}>
              {initial}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
