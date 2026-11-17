
import Link from "next/link";

import {
  MapPin,
  Mail,
  Phone,
} from "lucide-react";

import {
  FaWhatsapp,
  FaInstagram,
  FaFacebookF,
  FaPinterestP,
  FaYoutube,
} from "react-icons/fa6";

const links = [
  { label: "Accueil", href: "/" },
  { label: "Nos Créations", href: "/creations" },
  { label: "Sur Mesure", href: "/sur-mesure" },
  { label: "Notre Histoire", href: "/histoire" },
  { label: "Contact", href: "/contact" },
];

const whatsappUrl =
  "https://wa.me/?text=" +
  encodeURIComponent(
    "Bonjour RadiWood, je souhaite vous contacter."
  );

export default function Footer() {
  return (
    <footer className="bg-[#28391F] text-[#F7F2E8]">

      <div className="mx-auto grid max-w-[1450px] grid-cols-1 gap-8 px-6 py-10 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1.4fr_1fr] lg:gap-0 lg:px-12">

        {/* BRAND */}

        <div className="lg:pr-8">

          <Link
            href="/"
            className="mb-4 flex items-center gap-3"
          >
            <div className="h-[58px] w-[58px] shrink-0 overflow-hidden rounded-full border border-[#d9ceaa]">
              <img
                src="/logo-radiwood.jpg"
                alt="Logo RadiWood"
                className="h-full w-full object-cover"
              />
            </div>

            <div className="flex flex-col leading-none">
              <span className="font-serif text-[25px] tracking-[-1px] text-[#f2e7c7]">
                RadiWood
              </span>
              <span className="mt-1 font-serif text-[10px] italic tracking-[1px] text-[#d7cda9]">
                BOIS D'OLIVIER
              </span>
            </div>
          </Link>

          <p className="max-w-[330px] text-[12px] leading-6 text-[#dedbcf]">
            La beauté de la nature, façonnée à la main.
            Des créations artisanales en bois d'olivier,
            issues d'un savoir-faire tunisien authentique.
          </p>

        </div>

        {/* NAVIGATION */}

        <div className="lg:border-l lg:border-white/15 lg:px-7">
          <h3 className="mb-4 font-sans text-[13px] font-semibold">
            Navigation
          </h3>

          <div className="flex flex-col gap-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[12px] text-[#dedbcf] transition hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* CONTACT */}

        <div className="lg:border-l lg:border-white/15 lg:px-7">
          <h3 className="mb-4 font-sans text-[13px] font-semibold">
            Contact
          </h3>

          <div className="flex flex-col gap-3 text-[12px] text-[#dedbcf]">

            <div className="flex items-center gap-2">
              <MapPin size={15} />
              <span>Tunisie</span>
            </div>

            <Link
              href="/contact"
              className="flex items-center gap-2 hover:text-white"
            >
              <Phone size={15} />
              <span>Nous contacter</span>
            </Link>

            <Link
              href="/contact"
              className="flex items-center gap-2 hover:text-white"
            >
              <Mail size={15} />
              <span>Formulaire de contact</span>
            </Link>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-white"
            >
              <FaWhatsapp size={16} />
              <span>Nous écrire sur WhatsApp</span>
            </a>

          </div>
        </div>

        {/* SOCIAL */}

        <div className="lg:border-l lg:border-white/15 lg:pl-7">
          <h3 className="mb-4 font-sans text-[13px] font-semibold">
            Suivez-nous
          </h3>

          <div className="flex items-center gap-2.5">

            <span
              aria-label="Instagram"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#b9b18d] text-[#efe8d2]"
            >
              <FaInstagram size={17} />
            </span>

            <span
              aria-label="Facebook"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#b9b18d] text-[#efe8d2]"
            >
              <FaFacebookF size={15} />
            </span>

            <span
              aria-label="Pinterest"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#b9b18d] text-[#efe8d2]"
            >
              <FaPinterestP size={16} />
            </span>

            <span
              aria-label="YouTube"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#b9b18d] text-[#efe8d2]"
            >
              <FaYoutube size={17} />
            </span>

          </div>

          <div className="mt-6 h-px w-12 bg-[#b9b18d]/60" />

          <div className="mt-4 flex flex-wrap gap-3 text-[10px] text-[#b8b6a8]">
            <span>Mentions légales</span>
            <span>|</span>
            <span>Confidentialité</span>
          </div>
        </div>

      </div>

      {/* COPYRIGHT */}

      <div className="border-t border-white/10">
        <div className="mx-auto max-w-[1450px] px-6 py-4 text-[11px] text-[#cdcaba] lg:px-12">
          © 2026 RadiWood — Bois d'Olivier.
          Tous droits réservés.
        </div>
      </div>

    </footer>
  );
}
