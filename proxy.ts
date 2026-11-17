
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "radiwood_admin_session";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const loginPage = pathname === "/admin/login";

  const token = request.cookies.get(COOKIE_NAME)?.value;
  const secret = process.env.AUTH_SECRET;
  const adminEmail = process.env.ADMIN_EMAIL;

  let authenticated = false;

  if (
    token &&
    secret &&
    secret.length >= 32 &&
    adminEmail
  ) {
    try {
      const result = await jwtVerify(
        token,
        new TextEncoder().encode(secret),
        {
          algorithms: ["HS256"],
        }
      );

      authenticated =
        result.payload.role === "admin" &&
        result.payload.sub === adminEmail;
    } catch {
      authenticated = false;
    }
  }

  // Login accessible sans connexion
  if (loginPage) {
    if (authenticated) {
      return NextResponse.redirect(
        new URL("/admin", request.url)
      );
    }

    return NextResponse.next();
  }

  // Pages Admin protégées
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
  matcher: ["/admin/:path*"],
};
