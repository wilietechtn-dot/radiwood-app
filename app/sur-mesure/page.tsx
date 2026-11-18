"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Hand,
  Leaf,
  MessageCircle,
  Pencil,
  Send,
  Settings,
  Truck,
} from "lucide-react";

import { FaWhatsapp } from "react-icons/fa6";

// ===========================================
// CONFIGURATION RADIOWOOD
// ===========================================

const WHATSAPP_NUMBER = "";

// ===========================================
// TYPES
// ===========================================

type QuoteForm = {
  name: string;
  phone: string;
  type: string;
  resinColor: string;
  dimensions: string;
  message: string;
};

// ===========================================
// DONNÉES
// ===========================================

const initialForm: QuoteForm = {
  name: "",
  phone: "",
  type: "",
  resinColor: "",
  dimensions: "",
  message: "",
};

const creationTypes = [
  "Plateau",
  "Miroir",
  "Table",
  "Planche",
  "Décoration",
  "Autre création",
];

const processSteps = [
  {
    number: "01",
    title: "Échange",
    description:
      "Vous partagez votre idée, vos besoins et vos préférences.",
    icon: MessageCircle,
  },
  {
    number: "02",
    title: "Conception",
    description:
      "Nous échangeons sur les dimensions, les formes et les finitions.",
    icon: Pencil,
  },
  {
    number: "03",
    title: "Fabrication",
    description:
      "Votre création prend forme grâce au savoir-faire artisanal.",
    icon: Settings,
  },
  {
    number: "04",
    title: "Livraison",
    description:
      "Nous organisons la livraison selon les modalités convenues.",
    icon: Truck,
  },
];

const galleryImages = [
  {
    title: "Table personnalisée",
    image: "/images/table.jpg",
  },
  {
    title: "Miroir sur mesure",
    image: "/images/miroir.jpg",
  },
  {
    title: "Plateau personnalisé",
    image: "/images/plateau.jpg",
  },
  {
    title: "Décoration artisanale",
    image: "/images/decoration.jpg",
  },
];

// ===========================================
// WHATSAPP
// ===========================================

function createWhatsAppUrl(message: string): string {
  const number = WHATSAPP_NUMBER.replace(/\D/g, "");
  const encodedMessage = encodeURIComponent(message);

  if (number) {
    return `https://wa.me/${number}?text=${encodedMessage}`;
  }

  return `https://api.whatsapp.com/send?text=${encodedMessage}`;
}

// ===========================================
// COMPOSANT PRINCIPAL
// ===========================================

export default function SurMesurePage() {
  const [form, setForm] = useState<QuoteForm>(initialForm);
  const [loading, setLoading] = useState(false);
  const [messagePrepared, setMessagePrepared] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [lastWhatsAppUrl, setLastWhatsAppUrl] = useState("");

  function updateField(field: keyof QuoteForm, value: string): void {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setMessagePrepared(false);
    setErrorMsg("");
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setMessagePrepared(false);

    const formattedDetails = [
      `Type de création : ${form.type}`,
      `Couleur de résine : ${form.resinColor.trim() || "À définir"}`,
      `Dimensions : ${form.dimensions.trim() || "À définir"}`,
      "",
      "Description du projet :",
      form.message.trim(),
    ].join("\n");

    const whatsappText = [
      "Bonjour RadiWood !",
      "",
      "Je souhaite demander un devis pour une création sur mesure.",
      "",
      `Nom : ${form.name.trim()}`,
      `Téléphone : ${form.phone.trim()}`,
      formattedDetails,
    ].join("\n");

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: "",
          subject: `Devis sur mesure — ${form.type}`,
          message: formattedDetails,
          source: "Sur mesure",
        }),
      });

      const data = (await res.json()) as {
        success?: boolean;
        error?: string;
      };

      if (!res.ok || !data.success) {
        setErrorMsg(
          data.error || "Impossible d'enregistrer votre demande."
        );
        return;
      }

      setLastWhatsAppUrl(createWhatsAppUrl(whatsappText));
      setMessagePrepared(true);
      setForm(initialForm);
    } catch {
      setErrorMsg(
        "Erreur de connexion. Vous pouvez aussi nous écrire directement sur WhatsApp."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F7F2E8] text-[#29271F]">
      {/* =========================================
          SECTION 1 : BANNIÈRE
      ========================================= */}

      <section
        className="relative flex min-h-[480px] items-center bg-[#35291C] bg-cover bg-center md:min-h-[530px]"
        style={{
          backgroundImage: `
            linear-gradient(
              90deg,
              rgba(27, 20, 13, 0.92) 0%,
              rgba(33, 24, 15, 0.72) 40%,
              rgba(33, 24, 15, 0.12) 100%
            ),
            url('/images/hero.jpg')
          `,
        }}
      >
        <div className="mx-auto w-full max-w-7xl px-6 py-16 lg:px-12">
          <div className="max-w-[580px] text-white">
            <p className="mb-4 text-xs font-semibold tracking-[0.45em] text-[#DCC4A0]">
              SUR MESURE
            </p>

            <h1 className="mb-5 font-serif text-5xl leading-[1.05] sm:text-6xl lg:text-[74px]">
              Créations
              <br />
              sur mesure
            </h1>

            <p className="mb-5 font-serif text-2xl md:text-[29px]">
              Vos idées, notre savoir-faire.
            </p>

            <p className="mb-8 max-w-[460px] text-sm leading-7 text-[#F0E8DC]">
              Des pièces uniques réalisées selon vos envies : dimensions
              personnalisées, gravures, couleurs de résine et demandes
              spéciales. Ensemble, imaginons une création qui vous ressemble.
            </p>

            <div className="flex flex-wrap gap-3">
              <a
                href="#demande-devis"
                className="inline-flex items-center gap-3 rounded-full border border-[#DCC4A0] bg-[#405033] px-7 py-3.5 text-xs font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-[#536746]"
              >
                Demander un devis
                <ArrowRight size={17} />
              </a>

              <a
                href={createWhatsAppUrl(
                  "Bonjour RadiWood, je souhaite discuter d'une création sur mesure."
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 rounded-full border border-white/75 bg-white/10 px-6 py-3.5 text-xs font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/20"
              >
                <FaWhatsapp size={18} />
                Discuter sur WhatsApp
              </a>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-7">
              <div className="flex items-center gap-3">
                <Leaf
                  size={32}
                  className="rounded-full border border-[#DCC4A0] p-1.5 text-[#DCC4A0]"
                />

                <span className="text-[11px] leading-4">
                  Bois d&apos;olivier
                  <br />
                  naturel
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Hand
                  size={32}
                  className="rounded-full border border-[#DCC4A0] p-1.5 text-[#DCC4A0]"
                />

                <span className="text-[11px] leading-4">
                  Fait main
                  <br />
                  en Tunisie
                </span>
              </div>

              <div className="flex items-center gap-3">
                <CheckCircle2
                  size={32}
                  className="rounded-full border border-[#DCC4A0] p-1.5 text-[#DCC4A0]"
                />

                <span className="text-[11px] leading-4">
                  Création unique
                  <br />
                  personnalisée
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          SECTION 2 : PRÉSENTATION + FORMULAIRE
      ========================================= */}

      <section id="demande-devis" className="scroll-mt-28 py-14 md:py-20">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-stretch gap-10 px-6 lg:grid-cols-2 lg:px-12">
          {/* IMAGE */}

          <div className="group min-h-[480px] overflow-hidden rounded-2xl bg-[#E5D8C6] shadow-sm">
            <img
              src="/images/miroir.jpg"
              alt="Miroir artisanal en bois d'olivier"
              className="h-full min-h-[480px] w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>

          {/* CONTENU */}

          <div className="flex flex-col justify-center">
            <p className="mb-4 text-xs font-semibold tracking-[0.4em] text-[#60714E]">
              VOTRE PROJET, NOTRE EXPERTISE
            </p>

            <h2 className="mb-5 font-serif text-4xl leading-tight md:text-[45px]">
              Une création unique,
              <br />
              comme vous l&apos;imaginez
            </h2>

            <p className="mb-8 text-sm leading-7 text-[#77736B]">
              Que ce soit pour une table, un plateau, un miroir, une planche ou
              tout autre objet, nous vous accompagnons dans la conception
              d&apos;une pièce entièrement personnalisée. Choisissez les
              dimensions, la forme et les finitions pour un résultat unique.
            </p>

            {/* FORMULAIRE */}

            <div className="rounded-2xl border border-[#E2DCCD] bg-[#EEEDE4] p-5 shadow-sm sm:p-7">
              <h3 className="mb-6 flex items-center gap-3 font-serif text-xl font-semibold">
                <Leaf size={24} className="text-[#405033]" />
                Demandez votre création sur mesure
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* CHAMPS */}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* NOM */}

                  <div>
                    <label
                      htmlFor="rw-name"
                      className="mb-2 block text-xs font-medium"
                    >
                      Nom complet *
                    </label>

                    <input
                      id="rw-name"
                      type="text"
                      required
                      minLength={2}
                      value={form.name}
                      onChange={(event) =>
                        updateField("name", event.target.value)
                      }
                      placeholder="Votre nom"
                      className="h-11 w-full rounded-lg border border-[#D7D4CC] bg-[#FFFCF7] px-4 text-xs outline-none focus:border-[#405033]"
                    />
                  </div>

                  {/* TÉLÉPHONE */}

                  <div>
                    <label
                      htmlFor="rw-phone"
                      className="mb-2 block text-xs font-medium"
                    >
                      Téléphone *
                    </label>

                    <input
                      id="rw-phone"
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(event) =>
                        updateField("phone", event.target.value)
                      }
                      placeholder="+216 ..."
                      className="h-11 w-full rounded-lg border border-[#D7D4CC] bg-[#FFFCF7] px-4 text-xs outline-none focus:border-[#405033]"
                    />
                  </div>

                  {/* TYPE */}

                  <div>
                    <label
                      htmlFor="rw-type"
                      className="mb-2 block text-xs font-medium"
                    >
                      Type de création *
                    </label>

                    <div className="relative">
                      <select
                        id="rw-type"
                        required
                        value={form.type}
                        onChange={(event) =>
                          updateField("type", event.target.value)
                        }
                        className="h-11 w-full appearance-none rounded-lg border border-[#D7D4CC] bg-[#FFFCF7] px-4 pr-10 text-xs outline-none focus:border-[#405033]"
                      >
                        <option value="">Sélectionnez une création</option>

                        {creationTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>

                      <ChevronDown
                        size={16}
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#756D61]"
                      />
                    </div>
                  </div>

                  {/* RÉSINE */}

                  <div>
                    <label
                      htmlFor="rw-resin"
                      className="mb-2 block text-xs font-medium"
                    >
                      Couleur de résine
                    </label>

                    <input
                      id="rw-resin"
                      type="text"
                      value={form.resinColor}
                      onChange={(event) =>
                        updateField("resinColor", event.target.value)
                      }
                      placeholder="Bleu, vert, noire..."
                      className="h-11 w-full rounded-lg border border-[#D7D4CC] bg-[#FFFCF7] px-4 text-xs outline-none focus:border-[#405033]"
                    />
                  </div>
                </div>

                {/* DIMENSIONS */}

                <div>
                  <label
                    htmlFor="rw-dimensions"
                    className="mb-2 block text-xs font-medium"
                  >
                    Dimensions souhaitées
                  </label>

                  <input
                    id="rw-dimensions"
                    type="text"
                    value={form.dimensions}
                    onChange={(event) =>
                      updateField("dimensions", event.target.value)
                    }
                    placeholder="Ex. 60 x 40 cm"
                    className="h-11 w-full rounded-lg border border-[#D7D4CC] bg-[#FFFCF7] px-4 text-xs outline-none focus:border-[#405033]"
                  />
                </div>

                {/* MESSAGE */}

                <div>
                  <label
                    htmlFor="rw-message"
                    className="mb-2 block text-xs font-medium"
                  >
                    Description du projet *
                  </label>

                  <textarea
                    id="rw-message"
                    required
                    rows={4}
                    minLength={10}
                    value={form.message}
                    onChange={(event) =>
                      updateField("message", event.target.value)
                    }
                    placeholder="Décrivez votre création idéale..."
                    className="w-full resize-y rounded-lg border border-[#D7D4CC] bg-[#FFFCF7] px-4 py-3 text-xs leading-6 outline-none focus:border-[#405033]"
                  />
                </div>

                {/* BOUTONS */}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-3 rounded-full bg-[#405033] px-6 py-3.5 text-xs font-semibold text-white transition hover:bg-[#536746] disabled:opacity-60"
                >
                  <Send size={17} />
                  {loading
                    ? "Envoi de votre demande..."
                    : "Envoyer ma demande de devis"}
                  <ArrowRight size={16} />
                </button>

                <a
                  href={createWhatsAppUrl(
                    "Bonjour RadiWood, je souhaite discuter d'un projet sur mesure."
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-2 text-center text-xs font-medium text-[#405033] hover:underline"
                >
                  <FaWhatsapp size={18} />
                  Ou discuter directement sur WhatsApp
                </a>

                {errorMsg && (
                  <div
                    role="alert"
                    className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs leading-5 text-red-700"
                  >
                    {errorMsg}
                  </div>
                )}

                {messagePrepared && (
                  <div
                    role="status"
                    className="space-y-2 rounded-lg bg-[#DCE9D5] p-4 text-xs leading-6 text-[#405033]"
                  >
                    <p className="font-semibold">
                      Votre demande de devis a bien été transmise à notre
                      atelier !
                    </p>
                    {lastWhatsAppUrl && (
                      <a
                        href={lastWhatsAppUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 font-semibold underline"
                      >
                        <FaWhatsapp size={16} />
                        Envoyer également une copie sur WhatsApp
                      </a>
                    )}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          SECTION 3 : NOTRE PROCESSUS
      ========================================= */}

      <section className="bg-[#FFFCF7] py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="mb-12 grid grid-cols-1 items-end gap-6 md:grid-cols-2">
            <div>
              <p className="mb-3 text-xs font-semibold tracking-[0.4em] text-[#60714E]">
                NOTRE PROCESSUS
              </p>

              <h2 className="font-serif text-3xl md:text-[42px]">
                De votre idée à une pièce unique
              </h2>
            </div>

            <p className="max-w-[380px] text-sm leading-7 text-[#817B70]">
              Un accompagnement simple et personnalisé pour donner vie à votre
              projet, de la première idée à la création finale.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-4">
            {processSteps.map((step) => {
              const Icon = step.icon;

              return (
                <div
                  key={step.number}
                  className="rounded-xl border border-[#E9E2D7] bg-[#F7F2E8] p-6 transition duration-300 hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="mb-5 flex items-center justify-between">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#405033] text-xs font-bold text-white">
                      {step.number}
                    </span>

                    <Icon
                      size={29}
                      strokeWidth={1.5}
                      className="text-[#405033]"
                    />
                  </div>

                  <h3 className="mb-3 font-serif text-xl font-semibold">
                    {step.title}
                  </h3>

                  <p className="text-xs leading-6 text-[#77736B]">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================
          SECTION 4 : GALERIE
      ========================================= */}

      <section className="bg-[#F7F2E8] py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="mb-9 text-center">
            <p className="mb-3 text-xs font-semibold tracking-[0.4em] text-[#60714E]">
              NOS INSPIRATIONS
            </p>

            <h2 className="font-serif text-3xl md:text-[42px]">
              Des créations sur mesure
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#817B70]">
              Inspirez-vous de nos différentes créations en bois d&apos;olivier
              pour imaginer votre prochain projet personnalisé.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {galleryImages.map((item) => (
              <div
                key={item.title}
                className="group relative h-[290px] overflow-hidden rounded-xl bg-[#E5D8C6]"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-5 pb-5 pt-16">
                  <h3 className="font-serif text-lg text-white">
                    {item.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-9 text-center">
            <Link
              href="/creations"
              className="inline-flex items-center gap-3 rounded-full border border-[#405033] px-7 py-3 text-xs font-semibold text-[#405033] transition hover:bg-[#405033] hover:text-white"
            >
              Découvrir toutes nos créations
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================
          SECTION 5 : CONTACT
      ========================================= */}

      <section className="bg-[#34442A] px-6 py-16 text-center text-white">
        <div className="mx-auto max-w-3xl">
          <p className="mb-4 text-xs font-semibold tracking-[0.4em] text-[#DCC4A0]">
            RADIOWOOD
          </p>

          <h2 className="mb-5 font-serif text-3xl md:text-4xl">
            Votre idée mérite une création unique
          </h2>

          <p className="mx-auto mb-8 max-w-xl text-sm leading-7 text-[#E9E4D9]">
            Partagez votre projet avec RadiWood et découvrez les possibilités
            de personnalisation du bois d&apos;olivier.
          </p>

          <Link
            href="/contact"
            className="inline-flex items-center gap-3 rounded-full border border-[#DCC4A0] bg-[#F7F2E8] px-7 py-3.5 text-sm font-semibold text-[#34442A] transition hover:-translate-y-1 hover:bg-[#E9DDC9]"
          >
            Nous contacter
            <ArrowRight size={17} />
          </Link>
        </div>
      </section>
    </div>
  );
}