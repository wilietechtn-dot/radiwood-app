
import "server-only";

import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = "radiwood_admin_session";

export async function isAdminAuthenticated():
  Promise<boolean> {
  const secret = process.env.AUTH_SECRET;
  const email = process.env.ADMIN_EMAIL;

  if (!secret || secret.length < 32 || !email) {
    return false;
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return false;
  }

  try {
    const verified = await jwtVerify(
      token,
      new TextEncoder().encode(secret),
      {
        algorithms: ["HS256"],
      }
    );

    return (
      verified.payload.role === "admin" &&
      verified.payload.sub === email
    );
  } catch {
    return false;
  }
}
