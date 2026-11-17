
"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  ChevronDown,
  ExternalLink,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  Search,
  ShoppingCart,
  X,
} from "lucide-react";

const menuItems = [
  { label: "Tableau de bord", href: "/admin", icon: LayoutDashboard },
  { label: "Produits", href: "/admin/produits", icon: Package },
  { label: "Catégories", href: "/admin/categories", icon: FolderOpen },
  { label: "Commandes", href: "/admin/commandes", icon: ShoppingCart },
  { label: "Messages", href: "/admin/messages", icon: MessageSquare },
];

function Sidebar({ close }: { close: () => void }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full flex-col bg-gradient-to-b from-[#25381E] via-[#1E301B] to-[#192819] text-[#F4F0E2]">
      <Link
        href="/admin"
        onClick={close}
        className="flex min-h-[220px] flex-col items-center justify-center px-5 py-7"
      >
        <div className="mb-3 h-[108px] w-[108px] overflow-hidden rounded-full border border-[#CFC4A0]/60">
          <img
            src="/logo-radiwood.jpg"
            alt="RadiWood"
            className="h-full w-full object-cover"
          />
        </div>
        <span className="font-serif text-[29px] font-bold text-[#EDE3C6]">
          RadiWood
        </span>
        <span className="mt-1 font-serif text-[10px] italic tracking-[2px] text-[#D7C9A6]">
          BOIS D&apos;OLIVIER
        </span>
      </Link>

      <nav className="flex-1 space-y-2 px-3" aria-label="Administration">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            (item.href !== "/admin" &&
              pathname.startsWith(item.href + "/"));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={close}
              className={`flex items-center gap-4 rounded-xl px-5 py-4 text-sm transition ${
                active
                  ? "bg-[#526743] font-semibold text-white"
                  : "text-[#E0E4D7] hover:bg-white/10"
              }`}
            >
              <Icon size={21} strokeWidth={1.8} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/15 px-3 py-5">
        <Link
          href="/"
          onClick={close}
          className="flex items-center gap-4 rounded-xl px-5 py-3 text-sm hover:bg-white/10"
        >
          <ExternalLink size={20} />
          Voir le site
        </Link>
      </div>
    </aside>
  );
}

export default function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  function searchProducts(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = query.trim();

    router.push(
      value
        ? `/admin/produits?q=${encodeURIComponent(value)}`
        : "/admin/produits"
    );
  }

  async function logout() {
    setLoggingOut(true);

    try {
      const response = await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "same-origin",
      });

      if (!response.ok) throw new Error("Déconnexion impossible");

      window.location.assign("/admin/login");
    } catch {
      window.alert("La déconnexion a échoué.");
      setLoggingOut(false);
    }
  }

  // Sur la page de connexion, aucun menu ni en-tête Admin.
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#F7F2E8] text-[#29271F]">

      {/* SIDEBAR DESKTOP */}
      <div className="fixed inset-y-0 left-0 z-40 hidden w-[255px] lg:block">
        <Sidebar close={() => setMobileOpen(false)} />
      </div>

      {/* SIDEBAR MOBILE */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <button
            type="button"
            aria-label="Fermer le menu"
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative h-full w-[255px]">
            <Sidebar close={() => setMobileOpen(false)} />
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Fermer"
              className="absolute right-3 top-3 rounded-full bg-white/15 p-2 text-white"
            >
              <X size={19} />
            </button>
          </div>
        </div>
      )}

      <div className="min-h-screen lg:ml-[255px]">

        {/* NAVBAR ADMIN */}
        <header className="relative z-30 flex min-h-[90px] items-center justify-between gap-4 border-b border-[#E7DFD1] bg-[#FFFCF7] px-5 md:px-9">
          <div className="flex flex-1 items-center gap-4">
            <button
              type="button"
              aria-label="Ouvrir le menu"
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 hover:bg-[#F0EADD] lg:hidden"
            >
              <Menu size={24} />
            </button>

            <form
              onSubmit={searchProducts}
              className="flex h-[49px] w-full max-w-[385px] items-center gap-3 rounded-xl border border-[#EAE3D8] bg-white px-4"
            >
              <Search size={20} className="text-[#9B998F]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                type="search"
                placeholder="Rechercher un produit..."
                aria-label="Rechercher un produit"
                className="min-w-0 flex-1 bg-transparent text-sm outline-none"
              />
            </form>
          </div>

          <div className="flex items-center gap-4">
            {/* NOTIFICATIONS */}
            <div className="relative">
              <button
                type="button"
                aria-label="Notifications"
                aria-expanded={notificationsOpen}
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setProfileOpen(false);
                }}
                className="rounded-full p-2 text-[#556349] hover:bg-[#EEF0E9]"
              >
                <Bell size={22} />
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 top-12 z-50 w-[265px] rounded-xl border border-[#E8E0D4] bg-white p-5 shadow-xl">
                  <h3 className="mb-3 text-sm font-semibold">
                    Notifications
                  </h3>
                  <p className="text-xs leading-6 text-[#817B70]">
                    Les notifications seront connectées
                    aux données de RadiWood ultérieurement.
                  </p>
                </div>
              )}
            </div>

            {/* PROFIL */}
            <div className="relative">
              <button
                type="button"
                aria-label="Profil administrateur"
                aria-expanded={profileOpen}
                onClick={() => {
                  setProfileOpen(!profileOpen);
                  setNotificationsOpen(false);
                }}
                className="flex items-center gap-3 rounded-full bg-[#F2EBDD] px-2 py-1.5 hover:bg-[#EAE2D4]"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#405033] text-sm font-semibold text-white">
                  A
                </span>
                <span className="hidden text-sm font-semibold sm:inline">
                  Admin
                </span>
                <ChevronDown size={16} className="hidden sm:block" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-14 z-50 w-[230px] rounded-xl border border-[#E8E0D4] bg-white p-2 shadow-xl">
                  <div className="border-b border-[#EEE8DE] px-3 py-3">
                    <p className="text-sm font-semibold">Administrateur</p>
                    <p className="mt-1 text-xs text-[#817B70]">
                      Espace RadiWood
                    </p>
                  </div>

                  <Link
                    href="/admin"
                    onClick={() => setProfileOpen(false)}
                    className="mt-2 flex items-center gap-3 rounded-lg px-3 py-3 text-sm hover:bg-[#F4F0E8]"
                  >
                    <LayoutDashboard size={17} />
                    Tableau de bord
                  </Link>

                  <Link
                    href="/"
                    className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm hover:bg-[#F4F0E8]"
                  >
                    <ExternalLink size={17} />
                    Voir le site
                  </Link>

                  <div className="my-2 border-t border-[#EEE8DE]" />

                  <button
                    type="button"
                    onClick={logout}
                    disabled={loggingOut}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    <LogOut size={17} />
                    {loggingOut ? "Déconnexion..." : "Se déconnecter"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* PAGES ADMIN */}
        <main className="min-h-[calc(100vh-90px)]">
          {children}
        </main>
      </div>
    </div>
  );
}
