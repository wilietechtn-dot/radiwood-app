
"use client";

import Link from "next/link";
import {
  ArrowRight,
  Leaf,
  Hand,
  Gem,
  Truck,
  MessageCircle,
} from "lucide-react";

const collections = [
  {
    title: "Plateaux & Planches",
    description: "Élégance pour vos repas",
    image: "/images/plateau.jpg",
    href: "/creations?categorie=plateaux",
  },
  {
    title: "Miroirs",
    description: "Une touche naturelle à votre intérieur",
    image: "/images/miroir.jpg",
    href: "/creations?categorie=miroirs",
  },
  {
    title: "Décoration",
    description: "Pièces uniques et modernes",
    image: "/images/decoration.jpg",
    href: "/creations?categorie=decoration",
  },
  {
    title: "Art de la table",
    description: "Pour des moments conviviaux",
    image: "/images/table.jpg",
    href: "/creations?categorie=art-de-la-table",
  },
];

const advantages = [
  {
    icon: Leaf,
    title: "Bois d'olivier naturel",
    text: "Une matière noble et durable",
  },
  {
    icon: Hand,
    title: "Fait main en Tunisie",
    text: "Un savoir-faire authentique",
  },
  {
    icon: Gem,
    title: "Pièces uniques",
    text: "Chaque création est unique",
  },
  {
    icon: Truck,
    title: "Livraison en Tunisie",
    text: "Emballage soigné et sécurisé",
  },
];

const gallery = [
  "/images/plateau.jpg",
  "/images/miroir.jpg",
  "/images/decoration.jpg",
];

export default function Home() {
  return (
    <>
      {/* ================= HERO ================= */}

      <section
        id="accueil"
        className="relative flex min-h-[590px] items-center overflow-hidden bg-[#322719] bg-cover bg-center"
        style={{
          backgroundImage: `
            linear-gradient(
              90deg,
              rgba(28, 22, 15, 0.90) 0%,
              rgba(31, 24, 16, 0.70) 33%,
              rgba(31, 24, 16, 0.20) 70%,
              rgba(31, 24, 16, 0.05) 100%
            ),
            url('/images/hero.jpg')
          `,
        }}
      >
        <div className="relative mx-auto w-full max-w-7xl px-6 py-20 lg:px-12">
          <div className="max-w-[550px] text-white">

            <p className="mb-4 text-xs font-semibold tracking-[0.45em] text-[#DCC4A0]">
              ARTISANAT TUNISIEN
            </p>

            <h1 className="mb-5 font-serif text-5xl leading-[1.03] tracking-tight sm:text-6xl lg:text-[76px]">
              L'Art du
              <br />
              Bois d'Olivier
            </h1>

            <p className="mb-5 font-serif text-2xl leading-snug sm:text-[29px]">
              La beauté de la nature,
              <br />
              façonnée à la main.
            </p>

            <p className="mb-8 max-w-[420px] text-sm leading-7 text-[#f0e8de]">
              Des créations uniques en bois d'olivier,
              alliant tradition, élégance et modernité.
              Chaque pièce raconte une histoire, celle
              d'un savoir-faire tunisien authentique.
            </p>

            <div className="flex flex-wrap gap-3">

              <Link
                href="/creations"
                className="inline-flex items-center gap-3 rounded-full border border-[#d7c6a6] bg-[#405033] px-6 py-3.5 text-xs font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-[#536845]"
              >
                Découvrir nos créations
                <ArrowRight size={17} />
              </Link>

              <Link
                href="/contact"
                className="inline-flex items-center gap-3 rounded-full border border-white/75 bg-white/10 px-6 py-3.5 text-xs font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:bg-white/20"
              >
                <MessageCircle size={17} />
                Commander sur WhatsApp
              </Link>

            </div>

            <div className="mt-10 flex flex-wrap gap-7">

              <div className="flex items-center gap-3 text-xs">
                <div className="rounded-full border border-[#d6c39e] p-2">
                  <Leaf size={20} className="text-[#d6c39e]" />
                </div>
                <span>
                  Bois d'olivier
                  <br />
                  naturel
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <div className="rounded-full border border-[#d6c39e] p-2">
                  <Hand size={20} className="text-[#d6c39e]" />
                </div>
                <span>
                  Fait main
                  <br />
                  en Tunisie
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <div className="rounded-full border border-[#d6c39e] p-2">
                  <Gem size={20} className="text-[#d6c39e]" />
                </div>
                <span>
                  Pièces uniques
                  <br />
                  et durables
                </span>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ================= COLLECTIONS ================= */}

      <section className="bg-[#F7F2E8] py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">

          <div className="mb-10 text-center">

            <p className="mb-4 text-xs font-semibold tracking-[0.4em] text-[#526442]">
              NOS COLLECTIONS
            </p>

            <h2 className="mb-4 font-serif text-3xl text-[#29271F] md:text-4xl">
              Des créations authentiques pour tous les styles
            </h2>

            <p className="mx-auto max-w-2xl text-sm leading-7 text-[#7b766c]">
              Découvrez notre sélection d'objets en bois
              d'olivier, alliant tradition, élégance et modernité.
              Chaque pièce est unique, réalisée avec soin
              par des artisans passionnés.
            </p>

          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

            {collections.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group overflow-hidden rounded-xl border border-[#e8dfd3] bg-[#FFFCF5] shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
              >
                <div className="overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-[220px] w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>

                <div className="flex items-center gap-3 p-4">

                  <div className="rounded-full bg-[#efe7d9] p-2.5">
                    <Leaf size={19} className="text-[#405033]" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-serif text-sm font-semibold text-[#29271F]">
                      {item.title}
                    </h3>

                    <p className="mt-1 text-[11px] text-[#817b71]">
                      {item.description}
                    </p>
                  </div>

                  <div className="rounded-full bg-[#405033] p-2 text-white transition group-hover:bg-[#60764b]">
                    <ArrowRight size={16} />
                  </div>

                </div>

              </Link>
            ))}

          </div>
        </div>
      </section>

      {/* ================= NOTRE HISTOIRE ================= */}

      <section className="grid grid-cols-1 bg-[#405033] lg:grid-cols-2">

        <div className="min-h-[380px] overflow-hidden">
          <img
            src="/images/artisan.jpg"
            alt="Artisan travaillant le bois d'olivier"
            className="h-full min-h-[380px] w-full object-cover"
          />
        </div>

        <div className="flex items-center px-8 py-16 text-[#F7F2E8] lg:px-16">

          <div className="max-w-xl">

            <p className="mb-4 text-xs font-semibold tracking-[0.4em] text-[#DCC4A0]">
              NOTRE HISTOIRE
            </p>

            <h2 className="mb-5 font-serif text-4xl md:text-5xl">
              Un savoir-faire tunisien
            </h2>

            <p className="mb-8 text-sm leading-8 text-[#ebe6da]">
              Chaque création est le fruit d'un travail
              artisanal minutieux, hérité d'une tradition
              transmise de génération en génération.
              Nous valorisons un héritage tunisien unique,
              où la beauté naturelle du bois d'olivier
              rencontre le design contemporain.
            </p>

            <Link
              href="/histoire"
              className="inline-flex items-center gap-3 rounded-full border border-[#DCC4A0] px-6 py-3 text-xs font-semibold transition hover:bg-white/10"
            >
              En savoir plus
              <ArrowRight size={16} />
            </Link>

          </div>
        </div>
      </section>

      {/* ================= AVANTAGES ================= */}

      <section className="border-b border-[#e7dece] bg-[#FFFCF5] py-9">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-7 px-6 sm:grid-cols-2 lg:grid-cols-4 lg:px-12">

          {advantages.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="flex items-center justify-center gap-4"
              >
                <Icon
                  size={33}
                  strokeWidth={1.4}
                  className="shrink-0 text-[#796348]"
                />

                <div>
                  <h3 className="font-serif text-sm font-semibold">
                    {item.title}
                  </h3>

                  <p className="mt-1 text-xs text-[#817c72]">
                    {item.text}
                  </p>
                </div>
              </div>
            );
          })}

        </div>
      </section>

      {/* ================= GALERIE ================= */}

      <section className="bg-[#F7F2E8] py-12">

        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-6 sm:grid-cols-2 lg:grid-cols-4 lg:px-12">

          <div className="flex flex-col justify-center rounded-xl bg-[#eee7da] p-7">

            <Leaf
              size={38}
              strokeWidth={1.2}
              className="mb-5 text-[#637650]"
            />

            <h2 className="mb-4 font-serif text-3xl leading-tight">
              L'élégance
              <br />
              au naturel
            </h2>

            <p className="mb-6 text-xs leading-6 text-[#777166]">
              Des pièces uniques qui subliment
              votre intérieur et vos moments
              de partage.
            </p>

            <Link
              href="/sur-mesure"
              className="flex items-center gap-2 text-xs font-semibold text-[#405033]"
            >
              Créations sur mesure
              <ArrowRight size={16} />
            </Link>

          </div>

          {gallery.map((image) => (
            <div
              key={image}
              className="group h-[260px] overflow-hidden rounded-xl"
            >
              <img
                src={image}
                alt="Création artisanale RadiWood"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
          ))}

        </div>
      </section>

      {/* ================= CONTACT CTA ================= */}

      <section className="bg-[#34442a] px-6 py-16 text-center text-white">

        <div className="mx-auto max-w-3xl">

          <p className="mb-4 text-xs font-semibold tracking-[0.4em] text-[#DCC4A0]">
            CRÉATIONS SUR MESURE
          </p>

          <h2 className="mb-5 font-serif text-3xl md:text-4xl">
            Votre idée, notre savoir-faire
          </h2>

          <p className="mx-auto mb-8 max-w-xl text-sm leading-7 text-[#e6e2d8]">
            Vous souhaitez créer une pièce unique
            en bois d'olivier ? Contactez-nous pour
            imaginer ensemble votre prochaine création.
          </p>

          <Link
            href="/contact"
            className="inline-flex items-center gap-3 rounded-full border border-[#DCC4A0] bg-[#F7F2E8] px-7 py-3.5 text-sm font-semibold text-[#34442a] transition hover:bg-[#e9ddc9]"
          >
            <MessageCircle size={18} />
            Contactez-nous
            <ArrowRight size={16} />
          </Link>

        </div>
      </section>

    </>
  );
}
