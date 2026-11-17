
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import {
  Search,
  ShoppingCart,
  Menu,
  X,
  ChevronDown,
  Leaf,
  Truck,
} from "lucide-react";

import {
  FaWhatsapp,
  FaInstagram,
  FaFacebookF,
} from "react-icons/fa6";

const navLinks = [
  { label: "Accueil", href: "/" },
  { label: "Nos Créations", href: "/creations" },
  { label: "Sur Mesure", href: "/sur-mesure" },
  { label: "Notre Histoire", href: "/histoire" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");

  function handleSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    router.push(
      `/creations?q=${encodeURIComponent(search.trim())}`
    );
    setSearchOpen(false);
    setMenuOpen(false);
  }

  const whatsappUrl =
    "https://wa.me/?text=" +
    encodeURIComponent(
      "Bonjour RadiWood, je souhaite commander une création."
    );

  return (
    <>
      {/* TOP BAR */}

      <div className="bg-[#405033] text-[#F7F2E8]">
        <div className="mx-auto flex min-h-[30px] max-w-[1450px] items-center justify-between px-5 text-[11px] lg:px-12">

          <div className="flex items-center gap-3">
            <Leaf size={13} />
            <span>Artisanat tunisien</span>
            <span>✦</span>
            <span>Bois d'olivier naturel</span>
            <span className="hidden sm:inline">✦</span>
            <span className="hidden sm:inline">
              Pièces uniques
            </span>
          </div>

          <div className="hidden items-center gap-4 md:flex">
            <Truck size={15} />
            <span>Livraison partout en Tunisie</span>
            <span className="opacity-40">|</span>
            <span>Suivez-nous</span>
            <FaInstagram size={15} />
            <FaFacebookF size={13} />
          </div>

        </div>
      </div>

      {/* MAIN NAVBAR */}

      <header className="sticky top-0 z-50 border-b border-[#e8e0d2] bg-[#FFFCF5]/95 shadow-sm backdrop-blur-md">

        <div className="mx-auto flex h-[88px] max-w-[1450px] items-center justify-between gap-5 px-5 lg:px-12">

          {/* LOGO */}

          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className="flex shrink-0 items-center gap-2.5"
          >
            <div className="flex h-[64px] w-[64px] items-center justify-center overflow-hidden rounded-full bg-[#405033]">
              <img
                src="/logo-radiwood.jpg"
                alt="Emblème RadiWood"
                className="h-full w-full object-cover"
              />
            </div>

            <div className="flex flex-col items-center justify-center leading-none">
              <span
                className="font-serif text-[30px] font-semibold tracking-[-1px] text-[#302d22]"
              >
                RadiWood
              </span>
              <span className="mt-1 font-serif text-[11px] italic tracking-[2px] text-[#705d43]">
                BOIS D'OLIVIER
              </span>
            </div>
          </Link>

          {/* NAVIGATION DESKTOP */}

          <nav className="hidden items-center gap-7 lg:flex">
            {navLinks.map((link) => {
              const active = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative flex items-center gap-1 py-3 text-[13px] transition-colors ${
                    active
                      ? "font-semibold text-[#405033]"
                      : "text-[#332e26] hover:text-[#63724c]"
                  }`}
                >
                  {link.label}

                  {link.label === "Nos Créations" && (
                    <ChevronDown size={13} />
                  )}

                  {active && (
                    <span className="absolute bottom-1 left-0 h-[2px] w-full bg-[#405033]" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* ACTIONS */}

          <div className="flex items-center gap-5">

            <button
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Rechercher"
              aria-expanded={searchOpen}
              className="text-[#3f392f] hover:text-[#405033]"
            >
              <Search size={20} strokeWidth={1.7} />
            </button>

            <Link
              href="/creations"
              className="relative hidden text-[#3f392f] hover:text-[#405033] sm:block"
              aria-label="Voir les créations"
            >
              <ShoppingCart size={21} strokeWidth={1.7} />
            </Link>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-2 rounded-full bg-[#405033] px-6 py-3 text-xs font-semibold text-white shadow-sm transition hover:bg-[#526442] md:flex"
            >
              <FaWhatsapp size={18} />
              Commander
            </a>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
              aria-expanded={menuOpen}
              className="lg:hidden"
            >
              {menuOpen ? <X size={23} /> : <Menu size={23} />}
            </button>

          </div>
        </div>

        {/* RECHERCHE */}

        {searchOpen && (
          <form
            onSubmit={handleSearch}
            className="mx-auto flex max-w-3xl items-center gap-3 px-5 pb-4"
          >
            <Search size={19} />
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une création..."
              className="w-full rounded-lg border border-[#e6dccd] bg-white px-4 py-3 text-sm outline-[#405033]"
            />
            <button
              type="submit"
              className="rounded-lg bg-[#405033] px-5 py-3 text-sm text-white"
            >
              Rechercher
            </button>
          </form>
        )}

        {/* MENU MOBILE */}

        {menuOpen && (
          <nav className="flex flex-col border-t border-[#e8e0d2] bg-[#FFFCF5] px-6 py-4 lg:hidden">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`rounded-lg px-4 py-3 text-sm ${
                  pathname === link.href
                    ? "bg-[#e9eadf] font-semibold text-[#405033]"
                    : "hover:bg-[#f1ece2]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}

      </header>
    </>
  );
}
