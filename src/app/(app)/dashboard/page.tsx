"use client";
import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";


/**
 * Dashboard — Projeler (Güncel)
 * - Hamburger toggle (menü: Ana sayfa)
 * - "+ Yeni Proje": sadece Kod+Ad+Konum → yeni proje %0 (Planlama)
 * - Kart formatı korunur; yüzde değeri "İş emirleri" üstünde
 * - Kart tıklanınca sadece YENİ eklenen proje için PROJE DETAY ekranı açılır; mevcut projeler şu an tıklanamaz.
 *   • Yeni projede alt kalemler/satırlar yok → yalnız Genel İlerleme (0%), metrikler 0, sağda Özet, sağ üstte turuncu "İş emirleri"
 */

// ---------------- Types ----------------
type Status = "Planlama" | "Devam ediyor" | "İleri seviye" | "Teslime yakın";
type Project = {
  id: string;
  code: string;
  name: string;
  progress: number;
  status: Status;
  lastUpdate: string;
  isNew?: boolean;
  location?: string;
};

// ---------------- Utils ----------------
function clampPct(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}
function uid() {
  return Math.random().toString(36).slice(2, 9);
}
function todayTR() {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}
function deriveStatus(pct: number): Status {
  const p = clampPct(pct);
  if (p >= 85) return "Teslime yakın";
  if (p >= 60) return "İleri seviye";
  if (p > 25) return "Devam ediyor";
  return "Planlama";
}

// ---------------- Page ----------------
export default function DashboardPage() {
  const router = useRouter();  
  const [projects, setProjects] = useState<Project[]>([
    { id: "p4", code: "PRJ-004", name: "AVM Yenileme", progress: 92, status: "Teslime yakın", lastUpdate: "12.08.2025" },
    { id: "p3", code: "PRJ-003", name: "Lojistik Tesis", progress: 67, status: "İleri seviye", lastUpdate: "12.08.2025" },
    { id: "p2", code: "PRJ-002", name: "B Blok Ofis", progress: 42, status: "Devam ediyor", lastUpdate: "12.08.2025" },
    { id: "p1", code: "PRJ-001", name: "A Blok Konut", progress: 18, status: "Planlama", lastUpdate: "12.08.2025" },
  ]);

  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<"progress" | "code" | "name">("progress");
  const [newOpen, setNewOpen] = useState(false);
  const [form, setForm] = useState({ code: "", name: "", location: "" });
  const [formErr, setFormErr] = useState<string | null>(null);
  const [toast, setToast] = useState<null | { title: string; desc: string }>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState<Project | null>(null);

  const codeExists = useMemo(() => {
    const c = form.code.trim().toLowerCase();
    if (!c) return false;
    return projects.some((p) => p.code.trim().toLowerCase() === c);
  }, [form.code, projects]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let arr = projects.filter((p) => p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q));
    if (sortKey === "progress") arr = arr.slice().sort((a, b) => b.progress - a.progress);
    if (sortKey === "code") arr = arr.slice().sort((a, b) => a.code.localeCompare(b.code));
    if (sortKey === "name") arr = arr.slice().sort((a, b) => a.name.localeCompare(b.name));
    return arr;
  }, [projects, query, sortKey]);

  function openNew() {
    setForm({ code: "", name: "", location: "" });
    setFormErr(null);
    setNewOpen(true);
  }
    function handleCardClick(p: Project) {
    // "Lojistik Tesis" kartına tıklanınca detay rotasına git
    if (p.code === "PRJ-003" || p.name === "Lojistik Tesis") {
      router.push("/insaat-oge-detaylari");
      return;
    }
    // Yalnız "yeni eklenen" projede yerel detay ekranını aç
    if (p.isNew) setActive(p);
  }

  function submitNew(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const code = form.code.trim();
    const name = form.name.trim();
    const location = form.location.trim();
    const prog = 0; // yeni proje %0
    if (!code || !name) {
      setFormErr("Kod ve proje adı zorunludur.");
      return;
    }
    if (codeExists) {
      setFormErr("Bu proje kodu zaten kullanımda.");
      return;
    }
    const proj: Project = {
      id: uid(),
      code,
      name,
      progress: prog,
      status: deriveStatus(prog),
      lastUpdate: todayTR(),
      isNew: true,
      location,
    };
    setProjects((prev) => [proj, ...prev]);
    setNewOpen(false);
    setToast({ title: "Yeni proje eklendi", desc: `${proj.code} • ${proj.name}` });
    setActive(proj); // yeni eklenen proje detayına geç
  }

  function onWorkOrders(p: Project) {
    console.log("İş emirleri:", p.code);
  }

  // ---------- Detail Page ----------
  if (active) {
    return (
      <div className="min-h-screen bg-neutral-50">
        {/* Header of Detail */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-neutral-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
            <button onClick={() => setActive(null)} className="h-8 px-3 rounded-lg border border-neutral-300 bg-white text-sm">
              ← Geri
            </button>
            <div className="h-8 w-8 rounded-lg bg-[#ff5c00]" aria-hidden />
            <div className="text-lg font-semibold">
              Proje Kodu <span className="ml-2 font-normal text-neutral-500">{active.code} • {active.name}</span>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <div className="text-sm text-neutral-500">
                Rol (demo): <span className="font-medium">Yönetici</span>
              </div>
              <button
                onClick={() => onWorkOrders(active)}
                className="rounded-lg bg-[#ff5c00] hover:bg-[#e65100] text-white px-4 py-2 text-sm font-medium shadow-sm"
              >
                İş emirleri
              </button>
            </div>
          </div>
        </header>

        {/* Body */}
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Genel İlerleme card */}
            <section className="lg:col-span-2 rounded-3xl bg-white ring-1 ring-neutral-200 shadow-sm p-6">
              <h2 className="text-2xl font-bold">Genel İlerleme</h2>
              <p className="text-neutral-600 mt-1">Alt kalemlerin ortalaması</p>
              <div className="mt-4 h-3 rounded-full bg-neutral-200 overflow-hidden">
                <div className="h-full bg-[#ff5c00]" style={{ width: `${clampPct(active.progress)}%` }} />
              </div>
              <div className="mt-2 text-lg font-semibold">%{clampPct(active.progress)}</div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl ring-1 ring-neutral-200 p-5">
                  <div className="text-neutral-500">Alt kalem sayısı</div>
                  <div className="mt-2 text-3xl font-bold">0</div>
                </div>
                <div className="rounded-2xl ring-1 ring-neutral-200 p-5">
                  <div className="text-neutral-500">Top 3'te yer alan farklı işçi</div>
                  <div className="mt-2 text-3xl font-bold">0</div>
                </div>
              </div>
            </section>

            {/* Özet card */}
            <aside className="rounded-3xl bg-white ring-1 ring-neutral-200 shadow-sm p-6">
              <h3 className="text-2xl font-bold">Özet</h3>
              <dl className="mt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <dt className="text-neutral-600">Son güncelleme</dt>
                  <dd className="font-medium">{active.lastUpdate}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-neutral-600">Konum</dt>
                  <dd className="font-medium">{active.location || "-"}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-neutral-600">Durum</dt>
                  <dd>
                    <span className="inline-flex items-center rounded-lg px-2.5 py-1 text-xs ring-1 bg-orange-50 text-[#ff5c00] ring-orange-200">
                      {active.status}
                    </span>
                  </dd>
                </div>
              </dl>
            </aside>
          </div>
        </main>
      </div>
    );
  }

  // ---------- List Page ----------
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-neutral-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="h-8 w-8 rounded-lg border border-neutral-300 bg-white grid place-items-center text-neutral-600"
              aria-label="menü"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M3 6h18v2H3zM3 11h18v2H3zM3 16h18v2H3z" />
              </svg>
            </button>
            {menuOpen && (
              <div className="absolute left-0 mt-2 w-44 rounded-lg bg-white text-neutral-800 shadow-lg ring-1 ring-black/10 overflow-hidden">
                <button className="block w-full text-left px-3 py-2 text-sm hover:bg-neutral-50">Ana sayfa</button>
              </div>
            )}
          </div>
          <div className="h-8 w-8 rounded-lg bg-[#ff5c00]" aria-hidden />
          <div className="text-lg font-semibold">
            İnşaat Platformu <span className="ml-2 text-sm text-neutral-500 font-normal">Yönetici</span>
          </div>
          <button
            onClick={openNew}
            className="ml-auto rounded-lg bg-white ring-1 ring-neutral-300 hover:bg-neutral-50 px-3 py-1.5 text-sm font-medium"
          >
            + Yeni Proje
          </button>
          <div className="h-8 w-8 rounded-full bg-neutral-200" aria-hidden />
        </div>
      </header>

      {/* Body */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold">Projelerim</h1>
        <p className="text-sm text-neutral-600 mt-1">Devam eden inşaatların ilerleme durumu</p>

        {/* Ara + Sırala */}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <div className="relative">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Kod veya proje adı ara"
              className="w-72 rounded-lg border border-neutral-300 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5c00]"
            />
            <svg className="absolute left-2 top-2.5" viewBox="0 0 24 24" width="18" height="18" fill="#9ca3af">
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79L20 21.5 21.5 20l-6-6zM9.5 14C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            </svg>
          </div>
          <div className="ml-auto flex items-center gap-2 text-sm">
            <span className="text-neutral-600">Sırala</span>
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as any)}
              className="rounded-lg border border-neutral-300 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5c00]"
            >
              <option value="progress">İlerleme ↓</option>
              <option value="code">Kod A→Z</option>
              <option value="name">Ad A→Z</option>
            </select>
          </div>
        </div>

        {/* Cards */}
        <ul className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((p) => (
            <li
              key={p.id}
            onClick={() => handleCardClick(p)}
            className={`rounded-2xl bg-white p-5 shadow-sm ring-1 ring-neutral-200 transition ${
                (p.isNew || p.code === "PRJ-003" || p.name === "Lojistik Tesis")
                ? "cursor-pointer hover:shadow-md"
                : "cursor-default"
            }`}
            >
              {/* üst satır: kod + durum */}
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-lg bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-700 ring-1 ring-neutral-200">{p.code}</span>
                <span className={badgeClass(p.status)}>{p.status}</span>
              </div>

              {/* başlık */}
              <h3 className="mt-3 text-lg font-semibold text-neutral-900">{p.name}</h3>

              {/* progress bar */}
              <div className="mt-3">
                <div className="h-2 rounded bg-neutral-200 overflow-hidden">
                  <div className="h-full bg-[#ff5c00]" style={{ width: `${clampPct(p.progress)}%` }} />
                </div>
              </div>

              {/* alt satır: tamamlanma & sağda yüzde + İş emirleri */}
              <div className="mt-2 flex items-start justify-between">
                <div className="text-sm text-neutral-700">Tamamlanma</div>
                <div className="flex flex-col items-end">
                  <div className="text-sm font-semibold text-neutral-800">%{clampPct(p.progress)}</div>
                  <button onClick={(e) => { e.stopPropagation(); onWorkOrders(p); }} className="text-sm text-[#ff5c00] hover:underline">
                    İş emirleri
                  </button>
                </div>
              </div>

              {/* footer: son güncelleme */}
              <div className="mt-1 text-xs text-neutral-500">Son güncelleme: {p.lastUpdate}</div>
            </li>
          ))}
        </ul>
      </main>

      {/* Yeni Proje Modal */}
      {newOpen && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/30" onClick={() => setNewOpen(false)} />
          <div className="absolute inset-0 grid place-items-center p-4">
            <form onSubmit={submitNew} className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl ring-1 ring-neutral-200">
              <h2 className="text-base font-semibold">Yeni Proje</h2>
              <div className="mt-3">
                <label className="text-xs text-neutral-700">Proje Kodu</label>
                <input
                  value={form.code}
                  onChange={(e) => setForm((s) => ({ ...s, code: e.target.value }))}
                  placeholder="örn. PRJ-005"
                  className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none ${codeExists ? "border-red-300 focus:ring-2 focus:ring-red-400" : "border-neutral-300 focus:ring-2 focus:ring-[#ff5c00]"}`}
                />
                {codeExists && <div className="mt-1 text-xs text-red-600">Bu kod kullanımda.</div>}
              </div>
              <div className="mt-3">
                <label className="text-xs text-neutral-700">Proje Adı</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                  placeholder="örn. Depo Binası"
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5c00]"
                />
              </div>
              <div className="mt-3">
                <label className="text-xs text-neutral-700">Konum</label>
                <input
                  value={form.location}
                  onChange={(e) => setForm((s) => ({ ...s, location: e.target.value }))}
                  placeholder="İstanbul / Tuzla"
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5c00]"
                />
              </div>
              {formErr && <div className="mt-3 text-xs text-red-600">{formErr}</div>}
              <div className="mt-4 flex items-center justify-end gap-2">
                <button type="button" onClick={() => setNewOpen(false)} className="rounded-lg border px-3 py-1.5 text-sm hover:bg-neutral-50">
                  Vazgeç
                </button>
                <button type="submit" className="rounded-lg bg-[#ff5c00] hover:bg-[#e65100] text-white px-3 py-1.5 text-sm">
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30">
          <div className="rounded-xl bg-white shadow-lg ring-1 ring-neutral-200 px-4 py-3 min-w-[260px]">
            <div className="text-sm font-medium">{toast.title}</div>
            <div className="text-xs text-neutral-600 mt-0.5">{toast.desc}</div>
            <div className="mt-2 text-right">
              <button onClick={() => setToast(null)} className="text-xs text-[#ff5c00] hover:underline">
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------- UI Helpers ----------------
function badgeClass(status: Status) {
  const base = "inline-flex items-center rounded-lg px-2.5 py-1 text-xs ring-1";
  switch (status) {
    case "Planlama":
      return `${base} bg-orange-50 text-[#ff5c00] ring-orange-200`;
    case "Devam ediyor":
      return `${base} bg-neutral-100 text-neutral-700 ring-neutral-200`;
    case "İleri seviye":
      return `${base} bg-orange-100 text-[#e65100] ring-orange-200`;
    case "Teslime yakın":
      return `${base} bg-orange-200 text-[#8a2c00] ring-orange-300`;
    default:
      return `${base} bg-neutral-100 text-neutral-700 ring-neutral-200`;
  }
}

// ---------------- Lightweight Smoke Tests ----------------
(() => {
  if (typeof window === "undefined") return;
  // @ts-ignore
  if (!window.__RUN_DASHBOARD_CLASSIC_TESTS__) return;
  try {
    const s0 = deriveStatus(0),
      s20 = deriveStatus(20),
      s40 = deriveStatus(40),
      s70 = deriveStatus(70),
      s90 = deriveStatus(90);
    console.assert(s0 === "Planlama" && s20 === "Planlama", "0-25 => Planlama");
    console.assert(s40 === "Devam ediyor", "26-59 => Devam ediyor");
    console.assert(s70 === "İleri seviye", "60-84 => İleri seviye");
    console.assert(s90 === "Teslime yakın", "85-100 => Teslime yakın");

    const proj: Project = { id: "x", code: "PRJ-005", name: "Depo", progress: 0, status: deriveStatus(0), lastUpdate: todayTR() };
    console.assert(proj.progress === 0 && proj.status === "Planlama", "Yeni projede progress 0 ve durum Planlama");

    console.log("Dashboard + Detail — smoke tests passed");
  } catch (e) {
    console.error("Dashboard + Detail — tests failed:", e);
  }
})();
