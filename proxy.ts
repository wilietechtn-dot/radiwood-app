import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "radiwood_admin_session";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isLoginPage = pathname === "/admin/login";
  const isLoginApi = pathname === "/api/admin/login";
  const isApiAdmin = pathname.startsWith("/api/admin");

  // Laisser passer la route API de connexion
  if (isLoginApi) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;
  const secret = process.env.AUTH_SECRET;
  const adminEmail = process.env.ADMIN_EMAIL;

  let authenticated = false;

  if (token && secret && secret.length >= 32 && adminEmail) {
    try {
      const result = await jwtVerify(
        token,
        new TextEncoder().encode(secret),
        { algorithms: ["HS256"] }
      );

      authenticated =
        result.payload.role === "admin" &&
        result.payload.sub === adminEmail;
    } catch {
      authenticated = false;
    }
  }

  // Page de login : rediriger vers /admin si déjà connecté
  if (isLoginPage) {
    if (authenticated) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  // Routes API Admin non authentifiées -> 401 JSON
  if (isApiAdmin && !authenticated) {
    const response = NextResponse.json(
      { success: false, error: "Non autorisé." },
      { status: 401 }
    );
    response.cookies.delete(COOKIE_NAME);
    return response;
  }

  // Pages Admin non authentifiées -> redirection /admin/login
  if (!authenticated) {
    const response = NextResponse.redirect(
      new URL("/admin/login", request.url)
    );
    response.cookies.delete(COOKIE_NAME);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};