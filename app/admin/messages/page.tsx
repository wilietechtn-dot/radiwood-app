
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  CheckCheck,
  ChevronDown,
  Clock3,
  Inbox,
  Mail,
  MessageCircle,
  Search,
  Trash2,
  UserRound,
} from "lucide-react";

import { FaWhatsapp } from "react-icons/fa6";

import {
  type CustomerMessage,
  getMessages,
  saveMessages,
  updateMessage,
  deleteMessage,
} from "@/lib/messages";

/* ==========================================
   FONCTIONS UTILITAIRES
========================================== */

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("fr-TN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}

function getEmailLink(message: CustomerMessage): string {
  const subject = `RE: ${message.subject}`;

  const body = [
    `Bonjour ${message.name},`,
    "",
    "Merci d'avoir contacté RadiWood.",
    "",
    "Cordialement,",
    "L'équipe RadiWood",
  ].join("\n");

  return (
    `mailto:${message.email}` +
    `?subject=${encodeURIComponent(subject)}` +
    `&body=${encodeURIComponent(body)}`
  );
}

function getWhatsAppLink(
  message: CustomerMessage
): string {
  const number = message.phone.replace(/\D/g, "");

  const text = [
    `Bonjour ${message.name},`,
    "",
    `Nous vous contactons concernant votre demande : ${message.subject}.`,
    "",
    "L'équipe RadiWood",
  ].join("\n");

  return (
    `https://wa.me/${number}` +
    `?text=${encodeURIComponent(text)}`
  );
}

/* ==========================================
   COMPOSANT PAGE MESSAGES
========================================== */

export default function AdminMessagesPage() {
  const [messages, setMessages] =
    useState<CustomerMessage[]>([]);

  const [loaded, setLoaded] = useState(false);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Tous");

  const [selectedId, setSelectedId] =
    useState<string | null>(null);

  const [showDetailsMobile, setShowDetailsMobile] =
    useState(false);

  /* ==========================================
     CHARGEMENT DES MESSAGES
  ========================================== */

  const refresh = useCallback(() => {
    setMessages(getMessages());
  }, []);

  useEffect(() => {
    refresh();
    setLoaded(true);

    window.addEventListener(
      "radiwood-messages-updated",
      refresh
    );

    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener(
        "radiwood-messages-updated",
        refresh
      );

      window.removeEventListener(
        "storage",
        refresh
      );
    };
  }, [refresh]);

  /* ==========================================
     RECHERCHE ET FILTRAGE
  ========================================== */

  const filteredMessages = useMemo(() => {
    const query = search.trim().toLowerCase();

    return messages
      .filter((item) => {
        const searchableText = [
          item.name,
          item.email,
          item.phone,
          item.subject,
          item.message,
        ]
          .join(" ")
          .toLowerCase();

        const matchesSearch =
          searchableText.includes(query);

        const matchesFilter =
          filter === "Tous" ||
          (filter === "Non lus" && !item.isRead) ||
          (filter === "Lus" && item.isRead) ||
          item.source === filter;

        return matchesSearch && matchesFilter;
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      );
  }, [messages, search, filter]);

  /* ==========================================
     MESSAGE SÉLECTIONNÉ
  ========================================== */

  const selectedMessage =
    messages.find((item) => item.id === selectedId) ??
    null;

  /* ==========================================
     STATISTIQUES
  ========================================== */

  const unreadCount = messages.filter(
    (item) => !item.isRead
  ).length;

  const contactCount = messages.filter(
    (item) => item.source === "Contact"
  ).length;

  const customCount = messages.filter(
    (item) => item.source === "Sur mesure"
  ).length;

  /* ==========================================
     SÉLECTIONNER MESSAGE
  ========================================== */

  function selectMessage(item: CustomerMessage) {
    setSelectedId(item.id);
    setShowDetailsMobile(true);

    if (!item.isRead) {
      try {
        updateMessage(item.id, {
          isRead: true,
        });

        refresh();
      } catch {
        window.alert(
          "Impossible de marquer le message comme lu."
        );
      }
    }
  }

  /* ==========================================
     MARQUER LU / NON LU
  ========================================== */

  function toggleRead(item: CustomerMessage) {
    try {
      updateMessage(item.id, {
        isRead: !item.isRead,
      });

      refresh();
    } catch {
      window.alert(
        "Impossible de modifier le message."
      );
    }
  }

  /* ==========================================
     SUPPRIMER MESSAGE
  ========================================== */

  function removeMessage(item: CustomerMessage) {
    const confirmed = window.confirm(
      `Supprimer le message de ${item.name} ?`
    );

    if (!confirmed) {
      return;
    }

    try {
      deleteMessage(item.id);

      if (selectedId === item.id) {
        setSelectedId(null);
        setShowDetailsMobile(false);
      }

      refresh();
    } catch {
      window.alert(
        "Impossible de supprimer le message."
      );
    }
  }

  /* ==========================================
     TOUT MARQUER COMME LU
  ========================================== */

  function markAllAsRead() {
    try {
      const updated = getMessages().map((item) => ({
        ...item,
        isRead: true,
      }));

      saveMessages(updated);

      refresh();
    } catch {
      window.alert(
        "Impossible de modifier les messages."
      );
    }
  }

  /* ==========================================
     INTERFACE PRINCIPALE
  ========================================== */

  return (
    <div className="min-h-[calc(100vh-90px)] bg-[#F7F2E8] px-5 py-8 text-[#29271F] md:px-9">

      <div className="mx-auto max-w-[1500px]">

        {/* ======================================
            HEADER
        ====================================== */}

        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

          <div>
            <p className="mb-3 text-sm font-semibold text-[#62704E]">
              Communication
            </p>

            <h1 className="mb-2 font-serif text-4xl font-semibold md:text-[44px]">
              Messages
            </h1>

            <p className="text-sm text-[#817B70]">
              Consultez les messages et demandes
              de vos clients.
            </p>
          </div>

          <button
            type="button"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="inline-flex items-center justify-center gap-3 self-start rounded-xl bg-[#405033] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#536746] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckCheck size={19} />
            Tout marquer comme lu
          </button>

        </div>

        {/* ======================================
            STATISTIQUES
        ====================================== */}

        <div className="mb-7 grid grid-cols-2 gap-4 xl:grid-cols-4">

          {[
            {
              title: "Total messages",
              value: messages.length,
              icon: Inbox,
              color: "bg-[#405033] text-white",
            },
            {
              title: "Non lus",
              value: unreadCount,
              icon: Mail,
              color: "bg-[#F2DFC5] text-[#493A28]",
            },
            {
              title: "Contact",
              value: contactCount,
              icon: MessageCircle,
              color: "bg-[#885733] text-white",
            },
            {
              title: "Sur mesure",
              value: customCount,
              icon: UserRound,
              color: "bg-[#393A33] text-white",
            },
          ].map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className={`${stat.color} flex min-h-[115px] items-center gap-4 rounded-xl p-5 shadow-sm`}
              >

                <div className="rounded-full bg-white/15 p-3">
                  <Icon size={25} />
                </div>

                <div>
                  <p className="mb-2 text-xs font-medium sm:text-sm">
                    {stat.title}
                  </p>

                  <strong className="text-3xl">
                    {loaded ? stat.value : "—"}
                  </strong>
                </div>

              </div>
            );
          })}

        </div>

        {/* ======================================
            BOÎTE DE RÉCEPTION
        ====================================== */}

        <div className="grid min-h-[600px] grid-cols-1 overflow-hidden rounded-2xl border border-[#E7E0D5] bg-[#FFFCF8] shadow-sm lg:grid-cols-[390px_minmax(0,1fr)]">

          {/* LISTE DES MESSAGES */}

          <div
            className={`border-[#E9E2D7] lg:border-r ${
              showDetailsMobile
                ? "hidden lg:block"
                : "block"
            }`}
          >

            {/* HEADER LISTE */}

            <div className="border-b border-[#ECE5DA] p-5">

              <div className="mb-5 flex items-center justify-between gap-2">

                <h2 className="font-serif text-[23px] font-semibold">
                  Boîte de réception
                </h2>

                <span className="whitespace-nowrap rounded-full bg-[#E8EEDF] px-3 py-1 text-xs font-semibold text-[#405033]">
                  {unreadCount} non lus
                </span>

              </div>

              {/* RECHERCHE */}

              <div className="mb-3 flex h-11 items-center gap-3 rounded-lg border border-[#E0DBD1] bg-white px-3">

                <Search
                  size={18}
                  className="shrink-0 text-[#89837B]"
                />

                <input
                  type="search"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Rechercher un message..."
                  aria-label="Rechercher un message"
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                />

              </div>

              {/* FILTRE */}

              <div className="relative">

                <select
                  value={filter}
                  onChange={(event) =>
                    setFilter(event.target.value)
                  }
                  aria-label="Filtrer les messages"
                  className="h-11 w-full appearance-none rounded-lg border border-[#E0DBD1] bg-white px-4 pr-10 text-sm outline-none focus:border-[#405033]"
                >
                  <option value="Tous">
                    Tous les messages
                  </option>

                  <option value="Non lus">
                    Non lus
                  </option>

                  <option value="Lus">
                    Lus
                  </option>

                  <option value="Contact">
                    Formulaire Contact
                  </option>

                  <option value="Sur mesure">
                    Sur mesure
                  </option>
                </select>

                <ChevronDown
                  size={17}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                />

              </div>

            </div>

            {/* LISTE */}

            <div className="max-h-[650px] overflow-y-auto">

              {loaded &&
                filteredMessages.map((item) => {
                  const active =
                    selectedId === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        selectMessage(item)
                      }
                      className={`w-full border-b border-[#F0EAE0] p-4 text-left transition ${
                        active
                          ? "bg-[#E9EFE1]"
                          : "hover:bg-[#F6F2E9]"
                      }`}
                    >

                      <div className="flex items-start gap-3">

                        {/* AVATAR */}

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#E5DCC9] text-sm font-bold text-[#405033]">
                          {getInitials(item.name)}
                        </div>

                        {/* INFORMATIONS */}

                        <div className="min-w-0 flex-1">

                          <div className="mb-1 flex items-center justify-between gap-2">

                            <p
                              className={`truncate text-sm ${
                                item.isRead
                                  ? "font-medium"
                                  : "font-bold"
                              }`}
                            >
                              {item.name}
                            </p>

                            {!item.isRead && (
                              <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#405033]" />
                            )}

                          </div>

                          <p
                            className={`mb-1 truncate text-[13px] ${
                              !item.isRead
                                ? "font-semibold"
                                : ""
                            }`}
                          >
                            {item.subject}
                          </p>

                          <p className="line-clamp-2 text-xs leading-5 text-[#847E74]">
                            {item.message}
                          </p>

                          <div className="mt-3 flex items-center justify-between gap-2">

                            <span className="rounded-full bg-[#F0E7D9] px-2.5 py-1 text-[10px] text-[#655A49]">
                              {item.source}
                            </span>

                            <span className="text-[10px] text-[#91897E]">
                              {formatDate(
                                item.createdAt
                              )}
                            </span>

                          </div>

                        </div>

                      </div>

                    </button>
                  );
                })}

              {/* AUCUN MESSAGE */}

              {loaded &&
                filteredMessages.length === 0 && (
                  <div className="flex flex-col items-center justify-center p-12 text-center">

                    <Inbox
                      size={38}
                      className="mb-4 text-[#8C987F]"
                    />

                    <p className="font-serif text-xl">
                      Aucun message
                    </p>

                    <p className="mt-2 text-xs text-[#817B70]">
                      Aucun résultat pour vos filtres.
                    </p>

                  </div>
                )}

              {!loaded && (
                <p className="p-8 text-center text-sm text-[#817B70]">
                  Chargement des messages...
                </p>
              )}

            </div>

          </div>

          {/* ======================================
              DÉTAIL DU MESSAGE
          ====================================== */}

          <div
            className={`min-w-0 ${
              showDetailsMobile
                ? "block"
                : "hidden lg:block"
            }`}
          >

            {selectedMessage ? (

              <div className="flex h-full flex-col">

                {/* HEADER DÉTAIL */}

                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ECE5DA] px-6 py-5">

                  <div className="flex items-center gap-3">

                    <button
                      type="button"
                      onClick={() =>
                        setShowDetailsMobile(false)
                      }
                      aria-label="Retour aux messages"
                      className="rounded-lg p-2 hover:bg-[#F0EAE0] lg:hidden"
                    >
                      <ArrowLeft size={19} />
                    </button>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#70815D]">
                        MESSAGE CLIENT
                      </p>

                      <h2 className="mt-1 font-serif text-xl font-semibold">
                        Détails du message
                      </h2>
                    </div>

                  </div>

                  {/* ACTIONS */}

                  <div className="flex items-center gap-2">

                    <button
                      type="button"
                      onClick={() =>
                        toggleRead(
                          selectedMessage
                        )
                      }
                      title={
                        selectedMessage.isRead
                          ? "Marquer comme non lu"
                          : "Marquer comme lu"
                      }
                      aria-label={
                        selectedMessage.isRead
                          ? "Marquer comme non lu"
                          : "Marquer comme lu"
                      }
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#E5DDD2] bg-white hover:bg-[#F1EEE7]"
                    >
                      {selectedMessage.isRead ? (
                        <Mail size={18} />
                      ) : (
                        <CheckCheck size={18} />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        removeMessage(
                          selectedMessage
                        )
                      }
                      title="Supprimer"
                      aria-label="Supprimer le message"
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#E5DDD2] bg-white text-red-500 hover:bg-red-50"
                    >
                      <Trash2 size={18} />
                    </button>

                  </div>

                </div>

                {/* CONTENU */}

                <div className="flex-1 space-y-7 p-6 md:p-8">

                  <div>

                    <span className="mb-3 inline-block rounded-full bg-[#E8EEDF] px-3 py-1.5 text-xs font-semibold text-[#405033]">
                      {selectedMessage.source}
                    </span>

                    <h3 className="font-serif text-3xl font-semibold leading-tight">
                      {selectedMessage.subject}
                    </h3>

                    <div className="mt-3 flex items-center gap-2 text-xs text-[#817B70]">
                      <Clock3 size={15} />
                      {formatDate(
                        selectedMessage.createdAt
                      )}
                    </div>

                  </div>

                  {/* CLIENT */}

                  <div className="rounded-xl border border-[#E8E1D6] bg-[#F8F4EC] p-5">

                    <h4 className="mb-4 text-sm font-semibold">
                      Informations du client
                    </h4>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                      <div>
                        <p className="mb-1 text-xs text-[#898278]">
                          Nom complet
                        </p>

                        <p className="break-words text-sm font-semibold">
                          {selectedMessage.name}
                        </p>
                      </div>

                      <div>
                        <p className="mb-1 text-xs text-[#898278]">
                          Téléphone
                        </p>

                        <p className="break-words text-sm">
                          {selectedMessage.phone ||
                            "Non renseigné"}
                        </p>
                      </div>

                      <div className="sm:col-span-2">
                        <p className="mb-1 text-xs text-[#898278]">
                          Adresse e-mail
                        </p>

                        <p className="break-all text-sm">
                          {selectedMessage.email ||
                            "Non renseignée"}
                        </p>
                      </div>

                    </div>

                  </div>

                  {/* MESSAGE */}

                  <div>

                    <h4 className="mb-4 font-serif text-[22px] font-semibold">
                      Message
                    </h4>

                    <div className="min-h-[140px] rounded-xl border border-[#E8E1D6] bg-white p-5">

                      <p className="whitespace-pre-wrap break-words text-sm leading-8 text-[#655F55]">
                        {selectedMessage.message}
                      </p>

                    </div>

                  </div>

                </div>

                {/* RÉPONSE */}

                <div className="flex flex-wrap items-center gap-3 border-t border-[#EAE3D8] bg-[#FAF7F0] p-6">

                  {selectedMessage.phone.replace(/\D/g, "")
                    .length >= 8 ? (

                    <a
                      href={getWhatsAppLink(
                        selectedMessage
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-3 rounded-full bg-[#405033] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#526442]"
                    >
                      <FaWhatsapp size={19} />
                      Répondre via WhatsApp
                    </a>

                  ) : (

                    <span className="rounded-full bg-[#EFEAE0] px-5 py-3 text-xs text-[#817B70]">
                      WhatsApp : numéro indisponible
                    </span>

                  )}

                  {selectedMessage.email ? (

                    <a
                      href={getEmailLink(
                        selectedMessage
                      )}
                      className="inline-flex items-center justify-center gap-3 rounded-full border border-[#405033] bg-white px-6 py-3.5 text-sm font-semibold text-[#405033] transition hover:bg-[#EBF0E6]"
                    >
                      <Mail size={18} />
                      Répondre par e-mail
                    </a>

                  ) : (

                    <span className="text-xs text-[#817B70]">
                      E-mail indisponible
                    </span>

                  )}

                </div>

              </div>

            ) : (

              /* AUCUN MESSAGE SÉLECTIONNÉ */

              <div className="flex min-h-[600px] flex-col items-center justify-center px-8 text-center">

                <div className="mb-6 rounded-full bg-[#E8EEDF] p-7">

                  <MessageCircle
                    size={44}
                    strokeWidth={1.4}
                    className="text-[#405033]"
                  />

                </div>

                <h2 className="mb-3 font-serif text-3xl">
                  Sélectionnez un message
                </h2>

                <p className="max-w-[360px] text-sm leading-7 text-[#817B70]">
                  Choisissez un message dans la boîte de
                  réception pour consulter son contenu
                  et répondre à votre client.
                </p>

              </div>

            )}

          </div>

        </div>

      </div>

    </div>
  );
}
