"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function verificarPin(formData: FormData) {
  const pin         = formData.get("pin") as string;
  const redirectTo  = formData.get("redirect") as string || "/admin";
  const pinCorrecto = process.env.ADMIN_VERIFY_PIN;

  if (!pinCorrecto) throw new Error("ADMIN_VERIFY_PIN no está configurado.");

  if (pin !== pinCorrecto) {
    redirect(`/admin/verificar?redirect=${encodeURIComponent(redirectTo)}&error=1`);
  }

  const jar = await cookies();
  jar.set("admin_verified", pinCorrecto, {
    httpOnly: true,
    secure:   true,
    sameSite: "strict",
    path:     "/admin",
    maxAge:   60 * 60 * 4, // 4 horas
  });

  redirect(redirectTo.startsWith("/admin") ? redirectTo : "/admin");
}
