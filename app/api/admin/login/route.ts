
import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { SignJWT } from "jose";

/*
  RADIOWOOD - AUTHENTIFICATION ADMIN

  Compatible Next.js 16.4.3 avec cacheComponents.

  Ne pas déclarer :
  export const runtime = "nodejs";
*/

const COOKIE_NAME = "radiwood_admin_session";

export async function POST(request: NextRequest) {
  // ==========================================
  // 1. CONFIGURATION ADMIN
  // ==========================================

  const adminEmail = process.env.ADMIN_EMAIL;
  const hashBase64 = process.env.ADMIN_PASSWORD_HASH_B64;
  const secret = process.env.AUTH_SECRET;

  if (
    !adminEmail ||
    !hashBase64 ||
    !secret ||
    secret.length < 32
  ) {
    console.error(
      "RadiWood : configuration administrateur manquante."
    );

    return NextResponse.json(
      {
        success: false,
        error: "Configuration administrateur manquante.",
      },
      { status: 500 }
    );
  }

  // ==========================================
  // 2. VÉRIFICATION DE L'ORIGINE
  // ==========================================

  const origin = request.headers.get("origin");

  if (origin !== request.nextUrl.origin) {
    return NextResponse.json(
      {
        success: false,
        error: "Origine non autorisée.",
      },
      { status: 403 }
    );
  }

  // ==========================================
  // 3. LECTURE DES IDENTIFIANTS
  // ==========================================

  try {
    const body: unknown = await request.json();

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Requête invalide.",
        },
        { status: 400 }
      );
    }

    const credentials = body as Record<string, unknown>;

    const email = credentials.email;
    const password = credentials.password;

    // ==========================================
    // 4. VALIDATION DES CHAMPS
    // ==========================================

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      email.length === 0 ||
      email.length > 254 ||
      password.length === 0 ||
      password.length > 1024
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Identifiants invalides.",
        },
        { status: 400 }
      );
    }

    // ==========================================
    // 5. DÉCODAGE DU HASH BCRYPT
    // ==========================================

    const passwordHash = Buffer.from(
      hashBase64,
      "base64"
    ).toString("utf8");

    // ==========================================
    // 6. VÉRIFICATION EMAIL
    // ==========================================

    const normalizedEmail = email.trim().toLowerCase();

    const normalizedAdminEmail =
      adminEmail.trim().toLowerCase();

    const validEmail =
      normalizedEmail === normalizedAdminEmail;

    // ==========================================
    // 7. VÉRIFICATION MOT DE PASSE
    // ==========================================

    const validPassword = await compare(
      password,
      passwordHash
    );

    if (!validEmail || !validPassword) {
      return NextResponse.json(
        {
          success: false,
          error: "E-mail ou mot de passe incorrect.",
        },
        { status: 401 }
      );
    }

    // ==========================================
    // 8. CRÉATION DU TOKEN JWT
    // ==========================================

    const secretKey = new TextEncoder().encode(secret);

    const token = await new SignJWT({
      role: "admin",
    })
      .setProtectedHeader({
        alg: "HS256",
      })
      .setSubject(adminEmail)
      .setIssuedAt()
      .setExpirationTime("8h")
      .sign(secretKey);

    // ==========================================
    // 9. RÉPONSE
    // ==========================================

    const response = NextResponse.json(
      {
        success: true,
        message: "Connexion réussie.",
        redirectTo: "/admin",
      },
      { status: 200 }
    );

    // ==========================================
    // 10. COOKIE DE SESSION
    // ==========================================

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,

      secure:
        process.env.NODE_ENV === "production",

      sameSite: "lax",

      path: "/",

      maxAge: 60 * 60 * 8,
    });

    return response;
  } catch (error) {
    console.error(
      "RadiWood : erreur lors de la connexion.",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Impossible de traiter la connexion.",
      },
      { status: 400 }
    );
  }
}
