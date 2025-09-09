"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/auth";

export default function Sidebar() {
  const router = useRouter();
  return (
    <aside className="border-r p-4 space-y-4">
      <div className="font-semibold text-lg">MVP</div>

      <nav className="flex flex-col gap-2">
        <Link className="underline-offset-2 hover:underline" href="/dashboard">Dashboard</Link>
        <Link className="underline-offset-2 hover:underline" href="/work-orders">İş Emirleri</Link>
        <Link className="underline-offset-2 hover:underline" href="/insaat-oge-detaylari">İnşaat Öğe Detayları</Link>
      </nav>

      <button
        onClick={() => { logout(); router.replace("/login"); }}
        className="w-full rounded-md border px-3 py-2"
      >
        Çıkış yap
      </button>
    </aside>
  );
}
