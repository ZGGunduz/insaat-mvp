"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { loginFake } from "@/lib/auth";

function clsx(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}
function getSafeRole(v: string): "admin" | "staff" {
  return v === "admin" || v === "staff" ? v : "admin";
}

export default function LoginPage() {
  const router = useRouter();

  const [role, setRole] = useState<"admin" | "staff">("admin");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [ok, setOk] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});

  const tabIds = useMemo(
    () => ({
      admin: { tab: "tab-admin", panel: "panel-admin" },
      staff: { tab: "tab-staff", panel: "panel-staff" },
    }),
    []
  );

  const safeRole = getSafeRole(role);
  const ids = tabIds[safeRole];

  function validate() {
    const e: { username?: string; password?: string } = {};
    if (!username.trim()) e.username = "Kullanıcı adı zorunludur";
    if (!password.trim()) e.password = "Şifre zorunludur";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function onSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    if (!validate()) return;

    loginFake(username);
    setOk(true);
    router.replace("/dashboard");
  }

  return (
    <div className="min-h-screen w-full bg-neutral-50 flex items-center justify-center p-4 sm:p-6 overflow-auto">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 rounded-2xl bg-white shadow-xl ring-1 ring-black/5 overflow-hidden">

        <section className="hidden md:flex flex-col justify-between p-8 bg-[#ff5c00] text-white">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/15 px-3 py-1 rounded-full text-sm font-medium">
              <div className="h-2 w-2 rounded-full bg-white" />
              İnşaat Saha Yönetimi
            </div>
            <h1 className="mt-6 text-3xl font-semibold leading-tight">Platform Giriş</h1>
            <p className="mt-3 text-white/90">
              Yönetici ve personel için tek ekrandan ekip, görev ve evrak akışını yönetin.
            </p>
            <ul className="mt-6 space-y-3 text-white/95">
              <li className="flex items-start gap-3"><span className="mt-2 h-2.5 w-2.5 rounded-full bg-white"></span><span>İş emirlerini dağıt, ilerlemeyi takip et</span></li>
              <li className="flex items-start gap-3"><span className="mt-2 h-2.5 w-2.5 rounded-full bg-white"></span><span>Fotoğraf ve raporları anında topla</span></li>
              <li className="flex items-start gap-3"><span className="mt-2 h-2.5 w-2.5 rounded-full bg-white"></span><span>İzinler, vardiyalar ve hakediş tek yerde</span></li>
            </ul>
          </div>
          <div className="text-xs text-white/80">© {new Date().getFullYear()} — Tüm hakları saklıdır</div>
        </section>

 
        <section className="md:hidden p-4 text-center text-sm text-neutral-600">
          <strong>İnşaat Saha Yönetimi</strong> — Giriş yaparak iş süreçlerinizi yönetin.
        </section>
        <section className="p-4 sm:p-6 md:p-8">
          {ok && (
            <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
              Giriş başarılı (simülasyon). /dashboard'a yönlendiriliyorsunuz…
            </div>
          )}

          {/* Tabs */}
          <div role="tablist" aria-label="Giriş Tipi" className="grid grid-cols-2 rounded-xl bg-neutral-100 p-1">
            <button
              id={tabIds.admin.tab}
              role="tab"
              aria-selected={safeRole === "admin"}
              aria-controls={tabIds.admin.panel}
              onClick={() => setRole("admin")}
              className={clsx(
                "px-4 py-2.5 text-sm font-medium rounded-lg",
                safeRole === "admin" ? "bg-white shadow" : "text-neutral-600 hover:text-neutral-900"
              )}
            >
              Yönetici Girişi
            </button>
            <button
              id={tabIds.staff.tab}
              role="tab"
              aria-selected={safeRole === "staff"}
              aria-controls={tabIds.staff.panel}
              onClick={() => setRole("staff")}
              className={clsx(
                "px-4 py-2.5 text-sm font-medium rounded-lg",
                safeRole === "staff" ? "bg-white shadow" : "text-neutral-600 hover:text-neutral-900"
              )}
            >
              Personel Girişi
            </button>
          </div>

          <div role="tabpanel" id={ids.panel} aria-labelledby={ids.tab} className="mt-6">
            <h2 className="text-xl font-semibold">{safeRole === "admin" ? "Yönetici" : "Personel"} Girişi</h2>

            <form className="mt-6 space-y-4" onSubmit={onSubmit}>
              <div>
                <label htmlFor="username" className="block text-sm font-medium">Kullanıcı Adı</label>
                <input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={clsx(
                    "mt-1 w-full rounded-lg border px-3 py-2.5 text-sm",
                    errors.username ? "border-red-500" : "border-neutral-300"
                  )}
                  placeholder="ornek@firma.com"
                />
                {errors.username && (
                  <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium">Şifre</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={clsx(
                    "mt-1 w-full rounded-lg border px-3 py-2.5 text-sm",
                    errors.password ? "border-red-500" : "border-neutral-300"
                  )}
                  placeholder="••••••••"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-[#ff5c00] hover:bg-[#e65100] text-white px-4 py-3 text-sm font-semibold"
              >
                Giriş Yap
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
