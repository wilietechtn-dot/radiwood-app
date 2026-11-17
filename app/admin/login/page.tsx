
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  ArrowRight,
  Eye,
  EyeOff,
  Leaf,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      if (!response.ok) {
        setError(
          response.status === 429
            ? "Trop de tentatives. Réessayez plus tard."
            : "E-mail ou mot de passe incorrect."
        );
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch {
      setError(
        "Impossible de contacter le serveur."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen bg-[#F9F6EF] lg:grid-cols-2">

      {/* PARTIE GAUCHE */}

      <section
        className="relative hidden min-h-screen bg-[#26371F] bg-cover bg-center lg:flex"
        style={{
          backgroundImage: `
            linear-gradient(
              180deg,
              rgba(22,35,20,.58),
              rgba(22,35,20,.88)
            ),
            url('/images/hero.jpg')
          `,
        }}
      >
        <div className="flex w-full flex-col justify-between p-12 xl:p-16">

          {/* LOGO */}

          <Link
            href="/"
            className="inline-flex items-center gap-4 self-start text-white"
          >
            <Leaf
              size={36}
              strokeWidth={1.6}
              className="text-[#E2D7B5]"
            />

            <div>
              <p className="font-serif text-4xl font-semibold">
                RadiWood
              </p>

              <p className="mt-1 text-[10px] uppercase tracking-[0.35em] text-[#E6D9B7]">
                Bois d&apos;Olivier
              </p>
            </div>
          </Link>

          {/* PRÉSENTATION */}

          <div className="max-w-[570px] text-white">
            <p className="mb-6 text-xs font-semibold uppercase tracking-[0.4em] text-[#E2CEA3]">
              Espace professionnel
            </p>

            <h1 className="mb-7 font-serif text-5xl leading-[1.12] xl:text-6xl">
              L&apos;art de gérer
              <br />
              vos créations.
            </h1>

            <p className="max-w-[440px] text-sm leading-8 text-[#F0EBDD]">
              Retrouvez votre espace d&apos;administration
              RadiWood pour organiser votre catalogue,
              suivre vos commandes et consulter les
              demandes de vos clients.
            </p>

            <div className="mt-10 h-[1px] w-32 bg-[#DCCBA4]" />
          </div>

          <div className="flex items-center gap-3 text-xs text-[#EBE3CE]">
            <ShieldCheck size={20} />
            Accès réservé aux administrateurs RadiWood
          </div>

        </div>
      </section>

      {/* PARTIE DROITE */}

      <section className="flex min-h-screen flex-col bg-[#F9F6EF]">

        {/* RETOUR */}

        <div className="flex items-center justify-between px-7 py-7 md:px-12">

          <Link
            href="/"
            className="font-serif text-2xl font-semibold text-[#405033] lg:hidden"
          >
            RadiWood
          </Link>

          <Link
            href="/"
            className="ml-auto inline-flex items-center gap-2 text-xs font-semibold text-[#68775B] transition hover:text-[#405033]"
          >
            Retour au site
            <ArrowRight size={16} />
          </Link>

        </div>

        {/* FORMULAIRE */}

        <div className="flex flex-1 items-center justify-center px-6 py-12 sm:px-10">

          <div className="w-full max-w-[440px]">

            <div className="mb-9 flex h-[76px] w-[76px] items-center justify-center rounded-2xl bg-[#E7EBDC] text-[#405033]">
              <LockKeyhole
                size={33}
                strokeWidth={1.5}
              />
            </div>

            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.32em] text-[#758368]">
              Bienvenue sur RadiWood
            </p>

            <h2 className="mb-5 font-serif text-4xl font-semibold text-[#252A20] sm:text-[48px]">
              Connexion Admin
            </h2>

            <p className="mb-10 text-sm leading-8 text-[#898278]">
              Connectez-vous pour accéder à votre espace
              de gestion et administrer votre boutique.
            </p>

            <form
              onSubmit={handleLogin}
              className="space-y-6"
            >

              {/* EMAIL */}

              <div>
                <label
                  htmlFor="admin-email"
                  className="mb-3 block text-sm font-semibold text-[#383A31]"
                >
                  Adresse e-mail
                </label>

                <div className="flex h-[57px] items-center gap-3 rounded-xl border border-[#DDD9CF] bg-white px-4 transition focus-within:border-[#405033] focus-within:ring-2 focus-within:ring-[#405033]/10">

                  <Mail
                    size={20}
                    className="shrink-0 text-[#8B907F]"
                  />

                  <input
                    id="admin-email"
                    type="email"
                    required
                    autoComplete="username"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="admin@radiwood.tn"
                    className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                  />
                </div>
              </div>

              {/* MOT DE PASSE */}

              <div>
                <label
                  htmlFor="admin-password"
                  className="mb-3 block text-sm font-semibold text-[#383A31]"
                >
                  Mot de passe
                </label>

                <div className="flex h-[57px] items-center gap-3 rounded-xl border border-[#DDD9CF] bg-white px-4 transition focus-within:border-[#405033] focus-within:ring-2 focus-within:ring-[#405033]/10">

                  <LockKeyhole
                    size={20}
                    className="shrink-0 text-[#8B907F]"
                  />

                  <input
                    id="admin-password"
                    type={
                      showPassword ? "text" : "password"
                    }
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="Votre mot de passe"
                    className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((value) => !value)
                    }
                    aria-label={
                      showPassword
                        ? "Masquer le mot de passe"
                        : "Afficher le mot de passe"
                    }
                    className="rounded-lg p-2 text-[#737769] hover:bg-[#F0EEE7]"
                  >
                    {showPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>

                </div>
              </div>

              {/* ERREUR */}

              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {error}
                </div>
              )}

              {/* BOUTON */}

              <button
                type="submit"
                disabled={loading}
                className="flex h-[57px] w-full items-center justify-center gap-3 rounded-xl bg-[#405033] px-6 text-sm font-semibold text-white shadow-md transition duration-300 hover:bg-[#526442] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Connexion en cours..."
                  : "Se connecter"}

                {!loading && (
                  <ArrowRight size={19} />
                )}
              </button>

            </form>

            <div className="mt-9 flex items-start gap-3 rounded-xl border border-[#E4E8DA] bg-[#EFF2E9] p-4">

              <ShieldCheck
                size={21}
                className="shrink-0 text-[#405033]"
              />

              <p className="text-xs leading-6 text-[#6D765F]">
                Cet espace est réservé aux personnes
                autorisées à administrer RadiWood.
              </p>
            </div>

          </div>
        </div>

        <footer className="px-6 py-6 text-center text-xs text-[#999285]">
          RadiWood — Espace Administration
        </footer>

      </section>

    </div>
  );
}
