
import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Diamond,
  Hand,
  Leaf,
  TreeDeciduous,
  Sparkles,
  MoveRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Notre Histoire | RadiWood",
  description:
    "Découvrez l'univers RadiWood, l'art du bois d'olivier, l'artisanat tunisien et les étapes de création de nos pièces uniques.",
};

const values = [
  {
    icon: Leaf,
    title: "Un artisanat local",
    description:
      "Des créations inspirées par le savoir-faire artisanal tunisien.",
  },
  {
    icon: TreeDeciduous,
    title: "Une matière noble",
    description:
      "Le bois d'olivier, symbole de longévité et d'authenticité.",
  },
  {
    icon: Diamond,
    title: "Des créations durables",
    description:
      "Des pièces uniques pensées pour traverser le temps.",
  },
];

const steps = [
  {
    number: "01",
    title: "Sélection du bois",
    description:
      "Une attention particulière portée aux formes, aux veinures et à la qualité du bois.",
    image: "/images/olivier.jpg",
  },
  {
    number: "02",
    title: "Façonnage",
    description:
      "Chaque pièce est travaillée avec soin pour révéler le caractère naturel du bois.",
    image: "/images/artisane.jpg",
  },
  {
    number: "03",
    title: "Finition",
    description:
      "Le ponçage et les finitions mettent en valeur les nuances du bois d'olivier.",
    image: "/images/decoration.jpg",
  },
  {
    number: "04",
    title: "Pièce finale",
    description:
      "Une création singulière, prête à embellir les moments du quotidien.",
    image: "/images/plateau.jpg",
  },
];

export default function HistoirePage() {
  return (
    <div className="overflow-hidden bg-[#F7F2E8] text-[#29271F]">

      {/* ==========================================
          HERO — NOTRE HISTOIRE
      ========================================== */}

      <section
        className="relative flex min-h-[430px] items-center bg-[#34291e] bg-cover bg-center md:min-h-[470px]"
        style={{
          backgroundImage: `
            linear-gradient(
              90deg,
              rgba(26, 21, 14, 0.91) 0%,
              rgba(32, 23, 14, 0.75) 34%,
              rgba(32, 23, 14, 0.15) 80%
            ),
            url('/images/artisan.jpg')
          `,
        }}
      >
        <div className="mx-auto w-full max-w-7xl px-6 py-16 lg:px-12">

          <div className="max-w-[600px] text-white">

            <p className="mb-4 text-xs font-semibold tracking-[0.45em] text-[#DCC4A0]">
              NOTRE HISTOIRE
            </p>

            <h1 className="mb-5 font-serif text-5xl leading-[1.03] sm:text-6xl lg:text-[69px]">
              Une passion née
              <br />
              de notre terre
            </h1>

            <p className="mb-5 max-w-[530px] font-serif text-xl leading-snug md:text-[25px]">
              L'art du bois d'olivier, entre tradition
              tunisienne et création contemporaine.
            </p>

            <p className="mb-7 max-w-[440px] text-sm leading-7 text-[#f0e7d9]">
              Chez RadiWood, chaque pièce raconte une
              histoire : celle d'un arbre ancestral,
              d'un savoir-faire artisanal et de notre
              passion pour les matières naturelles.
            </p>

            <a
              href="#vision"
              className="inline-flex items-center gap-4 rounded-full border border-[#d8c99e] bg-[#405033] px-7 py-3.5 text-xs font-semibold text-white transition duration-300 hover:-translate-y-1 hover:bg-[#536746]"
            >
              Découvrir notre univers
              <ArrowRight size={17} />
            </a>

          </div>
        </div>
      </section>

      {/* ==========================================
          NOTRE VISION
      ========================================== */}

      <section
        id="vision"
        className="scroll-mt-28 bg-[#F7F2E8] py-14 md:py-18"
      >
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-6 lg:grid-cols-2 lg:gap-14 lg:px-12">

          {/* IMAGE OLIVIER */}

          <div className="group relative h-[360px] overflow-hidden rounded-xl shadow-sm md:h-[415px]">

            <img
              src="/images/olivier.jpg"
              alt="Olivier ancien, symbole du patrimoine naturel"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1c2418]/15 to-transparent" />

          </div>

          {/* CONTENU */}

          <div>

            <p className="mb-3 text-xs font-semibold tracking-[0.42em] text-[#7B8259]">
              NOTRE VISION
            </p>

            <h2 className="mb-5 font-serif text-4xl leading-tight md:text-[45px]">
              Valoriser un
              <br className="hidden lg:block" />
              patrimoine vivant
            </h2>

            <p className="mb-9 max-w-[590px] text-sm leading-7 text-[#77736B]">
              Nous croyons en la beauté intemporelle
              du bois d'olivier et en la richesse du
              savoir-faire artisanal tunisien.
              Notre ambition est de créer des objets
              du quotidien qui allient utilité,
              esthétique et authenticité, tout en
              mettant en valeur un héritage naturel unique.
            </p>

            {/* VALEURS */}

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 sm:gap-0">

              {values.map((value, index) => {
                const Icon = value.icon;

                return (
                  <div
                    key={value.title}
                    className={`text-center ${
                      index > 0
                        ? "sm:border-l sm:border-[#ded5c8]"
                        : ""
                    } px-3`}
                  >

                    <Icon
                      size={34}
                      strokeWidth={1.3}
                      className="mx-auto mb-4 text-[#405033]"
                    />

                    <h3 className="mb-2 font-serif text-[15px] font-semibold">
                      {value.title}
                    </h3>

                    <p className="text-[11px] leading-5 text-[#807B70]">
                      {value.description}
                    </p>

                  </div>
                );
              })}

            </div>

          </div>
        </div>
      </section>

      {/* ==========================================
          LE SAVOIR-FAIRE
      ========================================== */}

      <section className="grid grid-cols-1 bg-[#405033] lg:grid-cols-2">

        {/* TEXTE */}

        <div className="relative flex min-h-[370px] items-center overflow-hidden px-8 py-16 text-[#F7F2E8] md:px-14 lg:px-20">

          <div className="pointer-events-none absolute -bottom-20 -right-10 rotate-[-18deg] text-[300px] leading-none text-white/10">
            ❧
          </div>

          <div className="relative z-10 max-w-[510px]">

            <p className="mb-4 text-xs font-semibold tracking-[0.45em] text-[#DCC4A0]">
              LE SAVOIR-FAIRE
            </p>

            <h2 className="mb-5 font-serif text-4xl leading-[1.1] md:text-[48px]">
              Des gestes
              <br />
              transmis par le temps
            </h2>

            <p className="mb-7 text-sm leading-7 text-[#eee8dc]">
              Chaque création est le fruit d'un travail
              minutieux, inspiré d'une tradition
              artisanale profondément enracinée en
              Tunisie. Le façonnage du bois d'olivier
              révèle des formes naturelles singulières
              qui rencontrent le design contemporain.
            </p>

            <Link
              href="/creations"
              className="inline-flex items-center gap-4 rounded-full border border-[#DCC4A0] px-6 py-3.5 text-xs font-semibold transition duration-300 hover:bg-white/10"
            >
              En savoir plus sur nos créations
              <ArrowRight size={17} />
            </Link>

          </div>
        </div>

        {/* IMAGE */}

        <div className="group h-[360px] overflow-hidden lg:h-auto lg:min-h-[390px]">

          <img
            src="/images/artisan.jpg"
            alt="Travail artisanal du bois d'olivier"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />

        </div>

      </section>

      {/* ==========================================
          CITATION RADIOWOOD
      ========================================== */}

      <section className="relative overflow-hidden bg-[#FFFCF5] py-14">

        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 px-6 md:grid-cols-2 md:gap-14">

          <div className="relative text-center">

            <span className="absolute -left-1 -top-5 font-serif text-[75px] leading-none text-[#C9B893] md:left-0">
              “
            </span>

            <blockquote className="relative font-serif text-3xl italic leading-snug md:text-[37px]">
              La beauté de la nature,
              <br />
              façonnée à la main.
            </blockquote>

            <div className="mx-auto mt-6 flex max-w-[290px] items-center justify-center gap-3">

              <span className="h-px flex-1 bg-[#C7B99D]" />

              <Leaf
                size={19}
                className="text-[#899375]"
              />

              <span className="h-px flex-1 bg-[#C7B99D]" />

            </div>

          </div>

          <div className="border-[#e3d9c9] md:border-l md:pl-10">

            <p className="text-sm leading-7 text-[#77736B]">
              Plus qu'un simple matériau, le bois
              d'olivier est un symbole de paix, de
              force et de longévité.
              À travers les créations RadiWood,
              nous partageons un morceau de notre
              terre, de notre culture et de notre histoire.
            </p>

          </div>

        </div>

      </section>

      {/* ==========================================
          PROCESSUS DE FABRICATION
      ========================================== */}

      <section
        id="processus"
        className="bg-[#F7F2E8] pb-20 pt-10"
      >

        <div className="mx-auto max-w-7xl px-6 lg:px-12">

          {/* SECTION HEADER */}

          <div className="mb-10 text-center">

            <p className="mb-3 text-xs font-semibold tracking-[0.45em] text-[#526442]">
              DE LA NATURE À LA CRÉATION
            </p>

            <h2 className="mb-3 font-serif text-3xl md:text-[40px]">
              Un processus artisanal et authentique
            </h2>

            <p className="text-sm text-[#817B70]">
              De la sélection du bois à la pièce finale,
              chaque étape est réalisée avec attention.
            </p>

          </div>

          {/* PROCESS GRID */}

          <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-4">

            {steps.map((step, index) => (

              <article
                key={step.number}
                className="group relative"
              >

                {/* IMAGE */}

                <div className="relative mb-5 h-[180px] overflow-hidden rounded-lg bg-[#e4d9c7]">

                  <img
                    src={step.image}
                    alt={step.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />

                  <div className="absolute -bottom-0 left-3 flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#F7F2E8] bg-[#405033] text-sm font-semibold text-white shadow-md">
                    {step.number}
                  </div>

                </div>

                {/* TITLE */}

                <h3 className="mb-2 font-serif text-[18px] font-semibold">
                  {step.title}
                </h3>

                {/* DESCRIPTION */}

                <p className="max-w-[260px] text-[12px] leading-6 text-[#77736B]">
                  {step.description}
                </p>

                {/* ARROW */}

                {index < steps.length - 1 && (
                  <MoveRight
                    size={24}
                    strokeWidth={1.3}
                    className="absolute -right-5 top-[72px] z-10 hidden text-[#6C765A] lg:block"
                  />
                )}

              </article>

            ))}

          </div>

        </div>

      </section>

      {/* ==========================================
          CALL TO ACTION
      ========================================== */}

      <section className="bg-[#34442A] px-6 py-14 text-center text-white">

        <div className="mx-auto max-w-3xl">

          <Sparkles
            size={27}
            className="mx-auto mb-5 text-[#DCC4A0]"
          />

          <p className="mb-3 text-xs font-semibold tracking-[0.4em] text-[#DCC4A0]">
            DÉCOUVREZ RADIOWOOD
          </p>

          <h2 className="mb-5 font-serif text-3xl md:text-4xl">
            Chaque pièce raconte une histoire
          </h2>

          <p className="mx-auto mb-8 max-w-xl text-sm leading-7 text-[#ebe6d9]">
            Découvrez des créations en bois d'olivier
            inspirées par la nature et le savoir-faire
            artisanal tunisien.
          </p>

          <Link
            href="/creations"
            className="inline-flex items-center gap-3 rounded-full border border-[#DCC4A0] bg-[#F7F2E8] px-7 py-3.5 text-sm font-semibold text-[#34442A] transition duration-300 hover:-translate-y-1 hover:bg-[#e9ddc9]"
          >
            Explorer nos créations
            <ArrowRight size={17} />
          </Link>

        </div>

      </section>

    </div>
  );
}
