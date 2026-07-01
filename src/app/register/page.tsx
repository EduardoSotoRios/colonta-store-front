"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import type { Address } from "@/lib/api";
import { REGIONES, COMUNAS_POR_REGION } from "@/lib/chile-geo";

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatRutInput(raw: string): string {
  const clean = raw.replace(/[^0-9kK]/g, "").toUpperCase();
  if (clean.length < 2) return clean;
  const body = clean.slice(0, -1);
  const dv   = clean.slice(-1);
  const formatted = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${formatted}-${dv}`;
}

function isValidRut(rut: string): boolean {
  const clean = rut.replace(/[.-]/g, "").toUpperCase();
  if (!/^[0-9]+[0-9K]$/.test(clean) || clean.length < 2) return false;
  const body = clean.slice(0, -1);
  const dv   = clean.slice(-1);
  let sum = 0, multiplier = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  const dvNumber = 11 - (sum % 11);
  const expected = dvNumber === 11 ? "0" : dvNumber === 10 ? "K" : dvNumber.toString();
  return dv === expected;
}

function formatPhoneInput(raw: string): string {
  const withoutCode = raw.replace(/^\+?56\s*/, "");
  const digits = withoutCode.replace(/\D/g, "").slice(0, 9);
  if (!digits) return "";
  // 1 dígito de área: 9 (móvil) y 2 (Santiago); resto son 2 dígitos
  const areaLen = digits[0] === "9" || digits[0] === "2" ? 1 : 2;
  const area = digits.slice(0, areaLen);
  const number = digits.slice(areaLen);
  return number ? `+56 ${area} ${number}` : `+56 ${area}`;
}

function getPasswordStrength(pwd: string) {
  if (!pwd) return null;
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (pwd.length < 6) return { label: "Muy débil", color: "bg-red-400",   width: "w-1/4" };
  if (score <= 1)     return { label: "Débil",     color: "bg-red-400",   width: "w-1/4" };
  if (score === 2)    return { label: "Media",     color: "bg-yellow-400", width: "w-2/4" };
  if (score === 3)    return { label: "Buena",     color: "bg-blue-400",  width: "w-3/4" };
  return              { label: "Fuerte",    color: "bg-green-500", width: "w-full" };
}

// ── Componente ───────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const router = useRouter();
  const { register, loading, error } = useAuth();

  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
    confirmPassword: "",
    rut: "",
    telefono: "",
    direccion: {
      street: "",
      number: "",
      comuna: "",
      region: "",
      postalCode: "",
    } as Address,
  });

  const [sinNumero, setSinNumero]     = useState(false);
  const [localError, setLocalError]   = useState<string | null>(null);
  const [rutTouched, setRutTouched]   = useState(false);

  const comunasDisponibles = formData.direccion.region
    ? COMUNAS_POR_REGION[formData.direccion.region] ?? []
    : [];

  const rutValido  = isValidRut(formData.rut);
  const pwdStrength = getPasswordStrength(formData.password);

  function handleRutChange(e: React.ChangeEvent<HTMLInputElement>) {
    const formatted = formatRutInput(e.target.value);
    setFormData({ ...formData, rut: formatted });
  }

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    const formatted = formatPhoneInput(e.target.value);
    setFormData({ ...formData, telefono: formatted });
  }

  function handleRegionChange(region: string) {
    setFormData({
      ...formData,
      direccion: { ...formData.direccion, region, comuna: "" },
    });
  }

  function handleSinNumero(checked: boolean) {
    setSinNumero(checked);
    setFormData({
      ...formData,
      direccion: { ...formData.direccion, number: checked ? "S/N" : "" },
    });
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLocalError(null);

    if (!rutValido) {
      setLocalError("El RUT ingresado no es válido");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setLocalError("Las contraseñas no coinciden");
      return;
    }
    if (formData.password.length < 6) {
      setLocalError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    try {
      await register({
        nombre:   formData.nombre,
        email:    formData.email,
        password: formData.password,
        rut:      formData.rut,
        telefono: formData.telefono,
        direccion: formData.direccion,
      });
      router.push("/mochilas");
    } catch (err: any) {
      setLocalError(err?.message ?? "Error al registrar");
    }
  }

  const inputClass = "w-full border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-colonta-primary focus:outline-none";
  const selectClass = inputClass + " bg-white";

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-2xl space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-extrabold text-colonta-primary">Crear cuenta</h1>
          <p className="text-slate-500 text-sm mt-1">Regístrate en Colonta</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Nombre */}
            <div>
              <label className="text-sm font-semibold block mb-1">Nombre completo *</label>
              <input
                type="text" required className={inputClass}
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Juan Pérez"
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-semibold block mb-1">Email *</label>
              <input
                type="email" required className={inputClass}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="tu@email.com"
              />
            </div>

            {/* RUT con validación en tiempo real */}
            <div>
              <label className="text-sm font-semibold block mb-1">RUT *</label>
              <div className="relative">
                <input
                  type="text" required className={inputClass}
                  value={formData.rut}
                  onChange={handleRutChange}
                  onBlur={() => setRutTouched(true)}
                  placeholder="11.111.111-1"
                  maxLength={12}
                />
                {rutTouched && formData.rut.length >= 3 && (
                  <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold ${rutValido ? "text-green-500" : "text-red-500"}`}>
                    {rutValido ? "✓" : "✗"}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">Con puntos y guión, ej: 11.111.111-1</p>
            </div>

            {/* Teléfono con prefijo +56 fijo */}
            <div>
              <label className="text-sm font-semibold block mb-1">Teléfono *</label>
              <div className="flex items-center border rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-colonta-primary">
                <span className="px-3 py-2 bg-slate-100 text-slate-600 text-sm border-r select-none">+56</span>
                <input
                  type="tel"
                  required
                  className="flex-1 px-3 py-2 text-sm outline-none"
                  value={formData.telefono.replace(/^\+56\s*/, "")}
                  onChange={handlePhoneChange}
                  placeholder="9 12345678"
                  maxLength={10}
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">Móvil: 9 XXXXXXXX · Fijo: 2 XXXXXXXX (Santiago) · 32 XXXXXX (regiones)</p>
            </div>

            {/* Contraseña con indicador de fortaleza */}
            <div>
              <label className="text-sm font-semibold block mb-1">Contraseña *</label>
              <input
                type="password" required className={inputClass}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
              />
              {pwdStrength && (
                <div className="mt-1.5 space-y-0.5">
                  <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${pwdStrength.color} ${pwdStrength.width}`} />
                  </div>
                  <p className="text-xs text-slate-400">{pwdStrength.label}</p>
                </div>
              )}
            </div>

            {/* Confirmar contraseña */}
            <div>
              <label className="text-sm font-semibold block mb-1">Confirmar contraseña *</label>
              <input
                type="password" required className={inputClass}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="••••••••"
              />
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">Las contraseñas no coinciden</p>
              )}
            </div>
          </div>

          {/* Dirección */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold mb-3">Dirección de envío</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Calle */}
              <div className="md:col-span-2">
                <label className="text-sm font-semibold block mb-1">Calle *</label>
                <input
                  type="text" required className={inputClass}
                  value={formData.direccion.street}
                  onChange={(e) => setFormData({ ...formData, direccion: { ...formData.direccion, street: e.target.value } })}
                  placeholder="Av. Providencia"
                />
              </div>

              {/* Número + S/N */}
              <div>
                <label className="text-sm font-semibold block mb-1">Número *</label>
                <input
                  type="text"
                  required={!sinNumero}
                  disabled={sinNumero}
                  className={inputClass + (sinNumero ? " bg-slate-50 text-slate-400" : "")}
                  value={formData.direccion.number}
                  onChange={(e) => setFormData({ ...formData, direccion: { ...formData.direccion, number: e.target.value } })}
                  placeholder="123"
                />
                <label className="flex items-center gap-1.5 mt-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sinNumero}
                    onChange={(e) => handleSinNumero(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-xs text-slate-500">Sin número (S/N)</span>
                </label>
              </div>

              {/* Región */}
              <div>
                <label className="text-sm font-semibold block mb-1">Región *</label>
                <select
                  required className={selectClass}
                  value={formData.direccion.region}
                  onChange={(e) => handleRegionChange(e.target.value)}
                >
                  <option value="">Selecciona una región</option>
                  {REGIONES.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>

              {/* Comuna — filtrada por región */}
              <div>
                <label className="text-sm font-semibold block mb-1">Comuna *</label>
                <select
                  required className={selectClass}
                  value={formData.direccion.comuna}
                  disabled={comunasDisponibles.length === 0}
                  onChange={(e) => setFormData({ ...formData, direccion: { ...formData.direccion, comuna: e.target.value } })}
                >
                  <option value="">
                    {comunasDisponibles.length === 0 ? "Selecciona primero una región" : "Selecciona una comuna"}
                  </option>
                  {comunasDisponibles.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Código postal — opcional */}
              <div>
                <label className="text-sm font-semibold block mb-1">
                  Código postal <span className="text-slate-400 font-normal">(opcional)</span>
                </label>
                <input
                  type="text" className={inputClass}
                  value={formData.direccion.postalCode}
                  onChange={(e) => setFormData({ ...formData, direccion: { ...formData.direccion, postalCode: e.target.value } })}
                  placeholder="7500000"
                />
              </div>
            </div>
          </div>

          {(error || localError) && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error || localError}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-colonta-primary text-white font-semibold hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Registrando..." : "Crear cuenta"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500">
          ¿Ya tienes cuenta?{" "}
          <a href="/login" className="text-colonta-primary font-semibold">Inicia sesión</a>
        </p>
      </div>
    </main>
  );
}
