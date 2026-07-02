"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function LogoutPage() {
  const router = useRouter();
  const { logout } = useAuth();

  useEffect(() => {
    logout();
    router.replace("/login");
  }, [logout, router]);

  return (
    <main className="min-h-screen grid place-items-center">
      <p className="text-slate-600">Cerrando sesión…</p>
    </main>
  );
}