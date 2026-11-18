import { NextRequest, NextResponse } from "next/server";

export function isValidImagePath(value: string): boolean {
  if (
    value.startsWith("/images/") &&
    !value.includes("..") &&
    !value.includes("\\")
  ) {
    return true;
  }

  if (/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(value)) {
    return value.length <= 2_500_000;
  }

  try {
    const url = new URL(value);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

export function verifySameOrigin(request: NextRequest): NextResponse | null {
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) {
    return NextResponse.json(
      { success: false, error: "Origine non autorisée." },
      { status: 403 }
    );
  }
  return null;
}