
"use client";

import { useState, type FormEvent } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Headphones,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  Truck,
  Ruler,
  ChevronDown,
} from "lucide-react";

import {
  FaWhatsapp,
  FaInstagram,
  FaFacebookF,
  FaPinterestP,
  FaYoutube,
} from "react-icons/fa6";

/* =========================================
   CONFIGURATION RADIOWOOD
   Renseigner les vraies coordonnées ici.
========================================= */

const CONTACT = {
  city: "Tunisie",
  address: "",
  phone: "",
  email: "",
  whatsapp: "",
  instagram: "",
  facebook: "",
  pinterest: "",
  youtube: "",
  googleMaps: "",
};

const subjects = [
  "Demande d'information",
  "Commande d'un produit",
  "Création sur mesure",
  "Prix et disponibilité",
  "Livraison",
  "Autre demande",
];

const benefits = [
  {
    icon: Truck,
    title: "Livraison en Tunisie",
    description: "Modalités à confirmer avec notre équipe",
  },
  {
    icon: Ruler,
    title: "Créations sur mesure",
    description: "Dimensions, gravure et demandes spécifiques",
  },
  {
    icon: Clock3,
    title: "Accompagnement",
    description: "Des réponses adaptées à votre projet",
  },
  {
    icon: Headphones,
    title: "Conseils personnalisés",
    description: "Une équipe à votre écoute",
  },
];

function whatsappUrl(message: string) {
  const number = CONTACT.whatsapp.replace(/\D/g, "");
  const base = number
    ? `https://wa.me/${number}`
    : "https://api.whatsapp.com/send";

  return `${base}?text=${encodeURIComponent(message)}`;
}

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    subject: "",
    message: "",
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSubmitted(false);

    const text = [
      `Nom : ${form.name}`,
      `Téléphone : ${form.phone}`,
      `Email : ${form.email}`,
      `Sujet : ${form.subject}`,
      "",
      form.message,
    ].join("\n");

    // Sans backend, on ouvre la messagerie du visiteur.
    // L'envoi n'est pas confirmé automatiquement.
    if (CONTACT.email) {
      const mailto =
        `mailto:${CONTACT.email}` +
        `?subject=${encodeURIComponent(
          "RadiWood - " + form.subject
        )}` +
        `&body=${encodeURIComponent(text)}`;

      window.location.href = mailto;
    } else {
      window.open(
        whatsappUrl(text),
        "_blank",
        "noopener,noreferrer"
      );
    }

    setSubmitted(true);
  }

  return (
    <div className="bg-[#F7F2E8] text-[#29271F]">

      {/* ======================================
          HERO CONTACT
      ====================================== */}

      <section
        className="relative flex min-h-[320px] items-center bg-cover bg-center md:min-h-[370px]"
        style={{
          backgroundImage: `
            linear-gradient(
              90deg,
              rgba(30,25,16,.88) 0%,
              rgba(30,25,16,.65) 38%,
              rgba(30,25,16,.08) 100%
            ),
            url('/images/table.jpg')
          `,
        }}
      >
        <div className="mx-auto w-full max-w-7xl px-6 py-16 lg:px-12">

          <div className="max-w-[530px] text-white">

            <p className="mb-4 text-xs font-semibold tracking-[0.45em] text-[#DCC4A0]">
              CONTACT
            </p>

            <h1 className="mb-5 font-serif text-5xl leading-[1.05] md:text-[67px]">
              Restons
              <br />
              en contact
            </h1>

            <p className="font-serif text-xl leading-snug md:text-[25px]">
              Une question, une commande sur mesure
              <br className="hidden sm:block" />
              ou simplement l'envie d'échanger ?
              <br />
              Notre équipe est à votre écoute.
            </p>

          </div>
        </div>
      </section>

      {/* ======================================
          CONTACT PRINCIPAL
      ====================================== */}

      <section className="py-12 md:py-16">

        <div className="mx-auto grid max-w-7xl grid-cols-1 items-stretch gap-5 px-6 lg:grid-cols-[1.2fr_.9fr] lg:px-12">

          {/* FORMULAIRE */}

          <div className="rounded-2xl border border-[#ebe3d6] bg-[#FFFCF7] p-6 shadow-sm sm:p-8">

            <h2 className="mb-3 font-serif text-3xl md:text-[36px]">
              Envoyez-nous un message
            </h2>

            <p className="mb-7 max-w-xl text-sm leading-6 text-[#77736B]">
              Remplissez le formulaire ci-dessous.
              Que ce soit pour une question,
              une commande personnalisée ou un projet
              spécifique, nous serons ravis de vous
              accompagner.
            </p>

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >

              {/* NOM + TÉLÉPHONE */}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <div>
                  <label
                    htmlFor="contact-name"
                    className="sr-only"
                  >
                    Nom complet
                  </label>

                  <input
                    id="contact-name"
                    required
                    type="text"
                    placeholder="Nom complet *"
                    value={form.name}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        name: e.target.value,
                      })
                    }
                    className="h-12 w-full rounded-lg border border-[#DED6CA] bg-[#FFFCF7] px-4 text-sm outline-none transition focus:border-[#405033] focus:ring-2 focus:ring-[#405033]/10"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-phone"
                    className="sr-only"
                  >
                    Téléphone
                  </label>

                  <input
                    id="contact-phone"
                    required
                    type="tel"
                    placeholder="Téléphone *"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        phone: e.target.value,
                      })
                    }
                    className="h-12 w-full rounded-lg border border-[#DED6CA] bg-[#FFFCF7] px-4 text-sm outline-none transition focus:border-[#405033] focus:ring-2 focus:ring-[#405033]/10"
                  />
                </div>

              </div>

              {/* EMAIL */}

              <div>
                <label
                  htmlFor="contact-email"
                  className="sr-only"
                >
                  Adresse e-mail
                </label>

                <input
                  id="contact-email"
                  type="email"
                  required
                  placeholder="Adresse e-mail *"
                  value={form.email}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      email: e.target.value,
                    })
                  }
                  className="h-12 w-full rounded-lg border border-[#DED6CA] bg-[#FFFCF7] px-4 text-sm outline-none transition focus:border-[#405033] focus:ring-2 focus:ring-[#405033]/10"
                />
              </div>

              {/* SUBJECT */}

              <div>
                <label
                  htmlFor="contact-subject"
                  className="mb-2 block text-xs text-[#706B62]"
                >
                  Sujet de votre message *
                </label>

                <div className="relative">

                  <select
                    id="contact-subject"
                    required
                    value={form.subject}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        subject: e.target.value,
                      })
                    }
                    className="h-12 w-full appearance-none rounded-lg border border-[#DED6CA] bg-[#FFFCF7] px-4 pr-12 text-sm outline-none transition focus:border-[#405033]"
                  >
                    <option value="">
                      Sélectionnez un sujet
                    </option>

                    {subjects.map((subject) => (
                      <option
                        key={subject}
                        value={subject}
                      >
                        {subject}
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    size={18}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#666157]"
                  />

                </div>
              </div>

              {/* MESSAGE */}

              <div>
                <label
                  htmlFor="contact-message"
                  className="sr-only"
                >
                  Votre message
                </label>

                <textarea
                  id="contact-message"
                  required
                  rows={5}
                  placeholder="Votre message *&#10;Décrivez votre demande en détail..."
                  value={form.message}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      message: e.target.value,
                    })
                  }
                  className="w-full resize-y rounded-lg border border-[#DED6CA] bg-[#FFFCF7] px-4 py-4 text-sm outline-none transition focus:border-[#405033] focus:ring-2 focus:ring-[#405033]/10"
                />
              </div>

              {/* SEND BUTTON */}

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-3 rounded-full bg-[#405033] px-6 py-4 text-sm font-semibold text-white transition duration-300 hover:bg-[#526442]"
              >
                <Send size={19} />
                Préparer le message
              </button>

              {submitted && (
                <div
                  role="status"
                  className="flex items-start gap-2 rounded-lg bg-[#e9efe3] p-3 text-xs leading-5 text-[#405033]"
                >
                  <CheckCircle2
                    size={17}
                    className="shrink-0"
                  />
                  Votre application de messagerie a été
                  sollicitée. Vérifiez la fenêtre ouverte
                  et confirmez l'envoi.
                </div>
              )}

              <p className="text-center text-xs text-[#8b857b]">
                Ce formulaire ouvre votre application
                de messagerie pour finaliser l'envoi.
              </p>

            </form>

          </div>

          {/* ======================================
              COORDONNÉES
          ====================================== */}

          <div className="relative overflow-hidden rounded-2xl bg-[#405033] p-7 text-[#F7F2E8] shadow-sm sm:p-9">

            {/* BRANCHE DÉCORATIVE */}

            <div className="pointer-events-none absolute -right-10 top-10 rotate-[-25deg] text-[190px] leading-none text-[#C9D0B3]/10">
              ❧
            </div>

            <div className="relative z-10">

              <h2 className="mb-3 font-serif text-3xl md:text-[36px]">
                Nos coordonnées
              </h2>

              <p className="mb-9 max-w-sm text-sm leading-6 text-[#ece8d9]">
                Retrouvez-nous ou contactez-nous
                directement via les différents canaux.
              </p>

              <div className="space-y-7">

                {/* LOCATION */}

                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#F7F2E8] text-[#405033]">
                    <MapPin size={23} />
                  </div>

                  <div>
                    <h3 className="mb-1 text-sm font-semibold">
                      {CONTACT.city}
                    </h3>

                    <p className="text-xs leading-5 text-[#dddcca]">
                      {CONTACT.address ||
                        "Adresse de l'atelier à préciser"}
                    </p>
                  </div>
                </div>

                {/* PHONE */}

                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#F7F2E8] text-[#405033]">
                    <Phone size={22} />
                  </div>

                  <div>
                    <h3 className="mb-1 text-sm font-semibold">
                      Téléphone
                    </h3>

                    {CONTACT.phone ? (
                      <a
                        href={`tel:${CONTACT.phone}`}
                        className="text-xs text-[#dddcca] hover:text-white"
                      >
                        {CONTACT.phone}
                      </a>
                    ) : (
                      <p className="text-xs text-[#dddcca]">
                        Numéro à renseigner
                      </p>
                    )}
                  </div>
                </div>

                {/* EMAIL */}

                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#F7F2E8] text-[#405033]">
                    <Mail size={22} />
                  </div>

                  <div>
                    <h3 className="mb-1 text-sm font-semibold">
                      Adresse e-mail
                    </h3>

                    {CONTACT.email ? (
                      <a
                        href={`mailto:${CONTACT.email}`}
                        className="break-all text-xs text-[#dddcca] hover:text-white"
                      >
                        {CONTACT.email}
                      </a>
                    ) : (
                      <p className="text-xs text-[#dddcca]">
                        E-mail à renseigner
                      </p>
                    )}
                  </div>
                </div>

                {/* WHATSAPP */}

                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#F7F2E8] text-[#405033]">
                    <FaWhatsapp size={24} />
                  </div>

                  <div>
                    <h3 className="mb-1 text-sm font-semibold">
                      Contacter sur WhatsApp
                    </h3>

                    <p className="text-xs leading-5 text-[#dddcca]">
                      Échangez directement avec notre équipe
                    </p>
                  </div>
                </div>

              </div>

              {/* WHATSAPP BUTTON */}

              <a
                href={whatsappUrl(
                  "Bonjour RadiWood, je souhaite vous contacter."
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-9 flex items-center justify-center gap-3 rounded-full border border-[#E3D7B8] px-6 py-4 text-sm font-semibold transition hover:bg-white/10"
              >
                <FaWhatsapp size={20} />
                Commander sur WhatsApp
                <ArrowRight size={17} />
              </a>

              <div className="my-8 h-px bg-white/25" />

              {/* SOCIAL MEDIA */}

              <h3 className="mb-4 text-sm font-semibold">
                Suivez-nous
              </h3>

              <div className="mb-5 flex items-center gap-3">

                {[
                  { icon: FaInstagram, url: CONTACT.instagram, label: "Instagram" },
                  { icon: FaFacebookF, url: CONTACT.facebook, label: "Facebook" },
                  { icon: FaPinterestP, url: CONTACT.pinterest, label: "Pinterest" },
                  { icon: FaYoutube, url: CONTACT.youtube, label: "YouTube" },
                ].map(({ icon: Icon, url, label }) =>
                  url ? (
                    <a
                      key={label}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d6cda8] transition hover:bg-white/15"
                    >
                      <Icon size={18} />
                    </a>
                  ) : (
                    <span
                      key={label}
                      title={`${label} : lien à renseigner`}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d6cda8]/60 opacity-60"
                    >
                      <Icon size={18} />
                    </span>
                  )
                )}

              </div>

              <p className="text-xs leading-6 text-[#dddcca]">
                Découvrez nos dernières créations,
                les coulisses de l'atelier et nos inspirations.
              </p>

            </div>
          </div>

        </div>
      </section>

      {/* ======================================
          INFORMATIONS UTILES
      ====================================== */}

      <section className="pb-16 pt-6">

        <div className="mx-auto max-w-7xl px-6 lg:px-12">

          <div className="mb-10 text-center">

            <p className="mb-3 text-xs font-semibold tracking-[0.45em] text-[#526442]">
              INFORMATIONS UTILES
            </p>

            <h2 className="mb-3 font-serif text-3xl md:text-4xl">
              Une expérience simple et sereine
            </h2>

            <p className="text-sm text-[#77736B]">
              Tout ce qu'il faut savoir avant de nous contacter.
            </p>

          </div>

          <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-4">

            {benefits.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="flex items-start gap-4"
                >
                  <Icon
                    size={34}
                    strokeWidth={1.5}
                    className="shrink-0 text-[#51432F]"
                  />

                  <div>
                    <h3 className="mb-2 text-sm font-semibold">
                      {item.title}
                    </h3>

                    <p className="text-xs leading-5 text-[#77736B]">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}

          </div>
        </div>
      </section>

      {/* ======================================
          ATELIER ET LOCALISATION
      ====================================== */}

      <section className="pb-16">

        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-5 px-6 lg:grid-cols-[1.3fr_.9fr] lg:px-12">

          {/* ATELIER */}

          <div
            className="relative flex min-h-[320px] items-center overflow-hidden rounded-xl bg-cover bg-center"
            style={{
              backgroundImage: `
                linear-gradient(
                  90deg,
                  rgba(35,26,17,.83),
                  rgba(35,26,17,.15)
                ),
                url('/images/miroir.jpg')
              `,
            }}
          >

            <div className="relative max-w-[360px] p-8 text-white">

              <p className="mb-4 text-xs font-semibold tracking-[0.4em] text-[#DCC4A0]">
                NOTRE ATELIER
              </p>

              <h2 className="mb-4 font-serif text-4xl">
                Venez nous
                <br />
                rencontrer
              </h2>

              <p className="mb-6 text-sm leading-6 text-[#f0e7d9]">
                Découvrez nos créations et discutons
                ensemble de vos projets sur mesure.
                Les visites se font sur rendez-vous.
              </p>

              <a
                href="#coordonnees"
                onClick={(event) => {
                  if (!CONTACT.googleMaps) {
                    event.preventDefault();
                  }
                }}
                className="inline-flex items-center gap-3 rounded-full border border-white/80 px-6 py-3 text-xs font-semibold transition hover:bg-white/10"
              >
                <MapPin size={17} />
                Nous contacter pour une visite
                <ArrowRight size={16} />
              </a>

            </div>
          </div>

          {/* LOCALISATION */}

          <div className="relative flex min-h-[320px] items-center justify-center overflow-hidden rounded-xl border border-[#e1d9cd] bg-[#e9e5d8]">

            <div className="pointer-events-none absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  "linear-gradient(30deg, transparent 47%, #aaa990 48%, #aaa990 49%, transparent 50%), linear-gradient(120deg, transparent 47%, #bcb9a5 48%, #bcb9a5 49%, transparent 50%)",
                backgroundSize: "95px 95px",
              }}
            />

            <div className="relative z-10 mx-6 w-full max-w-xs rounded-xl bg-white/95 p-6 text-center shadow-lg">

              <MapPin
                size={32}
                className="mx-auto mb-4 text-[#405033]"
              />

              <h3 className="mb-2 font-serif text-xl">
                RadiWood — Bois d'Olivier
              </h3>

              <p className="mb-4 text-sm text-[#77736B]">
                {CONTACT.address || "Adresse à préciser"}
              </p>

              {CONTACT.googleMaps ? (
                <a
                  href={CONTACT.googleMaps}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-[#405033]"
                >
                  Voir sur Google Maps
                  <ArrowRight size={16} />
                </a>
              ) : (
                <p className="text-xs text-[#77736B]">
                  Localisation exacte disponible prochainement.
                </p>
              )}

            </div>

          </div>

        </div>
      </section>

    </div>
  );
}
