"use client";
import React, { useMemo, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

// Project Detail — Canvas Ready (Pages + Role Permissions)
// - "Detayları gör" ayrı sayfada (SubtasksView)
// - "Tüm işçiler" ayrı sayfada (WorkersView)
// - Sağ üstte turuncu "İş emirleri" butonu
// - ROLLER (demo seçimli): Yönetici, Mühendis, Mimar, Ustabaşı, İşçi
//   * Fotoğraf YÜKLE/SİL: sadece Ustabaşı
//   * Onayla/Reddet: sadece Mühendis veya Mimar (personel)
//   * Kural: En az 1 **ONAYLI** fotoğraf yoksa görev tamamlanamaz (Ustabaşı işaretleyemez)
//   * Ek: İlk onayla birlikte görev otomatik tamamlanır
//   * Ek-2: Tüm onaylı kanıt(lar) silinir veya reddedilirse görev otomatik yeniden AÇILIR (done=false)
// - Fotoğraflar ileride API ile kalıcı olacak, şu an URL.createObjectURL ile önizleme
// - Renkler: #ff5c00 / #ffffff

// Types
type Person = { id: string; name: string; score: number; photoUrl?: string };
type Evidence = { id: string; url: string; name: string; size: number; uploadedBy: 'Ustabaşı' | 'Personel'; uploadedAt: string; status: 'pending' | 'approved' | 'rejected' };
type SubTask = { id: string; title: string; done: boolean; evidence?: Evidence[] };
type ElementItem = { id: string; name: string; progress: number; updatedAt?: string; foreman: Person; workers: Person[]; subTasks?: SubTask[] };
type Project = { id: string; code: string; name: string; elements: ElementItem[]; lastUpdated: string; location: string; status: "Devam ediyor" | "Planlama" | "Teslime yakın" | "İleri seviye" };
type Role = 'Yönetici' | 'Mühendis' | 'Mimar' | 'Ustabaşı' | 'İşçi';

const AV_COUNT = 12; // sende kaç tane varsa bunu yaz
const AV = (n: number) => `/avatars/avt${((n - 1) % AV_COUNT) + 1}.png`; // jpg yerine png ise .png yap
// Mock data
const PROJECT: Project = {
  id: '3', code: 'PRJ-003', name: 'Lojistik Tesis', lastUpdated: '20.08.2025', location: 'İstanbul / Tuzla', status: 'Devam ediyor',
  elements: [
    {
      id: 'e5', name: 'Zemin beton dökümü', progress: 85, updatedAt: '20.08.2025',
      foreman: { id:'f5', name:'Ustabaşı: İsmail K.', score: 4.9, photoUrl: AV(1) },
      workers: [
        { id:'w10', name:'Ahmet Y.',  score:4.9, photoUrl: AV(2) },
        { id:'w11', name:'Mehmet K.', score:4.8, photoUrl: AV(3) },
        { id:'w12', name:'Elif D.',   score:4.7, photoUrl: AV(4) },
        { id:'w13', name:'Berk O.',   score:4.6, photoUrl: AV(5) },
        { id:'w14', name:'Cem P.',    score:4.2, photoUrl: AV(6) },
        { id:'w15', name:'Nisa T.',   score:4.4, photoUrl: AV(7) },
      ],
      subTasks: [
        { id: 't1', title: 'Kalıp hazırlığı tamamlandı', done: true },
        { id: 't2', title: 'Beton siparişi ve sevkiyat onayı', done: true },
        { id: 't3', title: 'Döküm uygulaması', done: true },
        { id: 't4', title: 'Kürleme ve yüzey düzeltme', done: false },
        { id: 't5', title: 'Numune küpleri alındı', done: true }
      ],
    },
    {
      id: 'e6', name: 'Duvar örme', progress: 60, updatedAt: '18.08.2025',
      foreman: { id:'f6', name:'Ustabaşı: Serhat U.', score: 4.7, photoUrl: AV(8) },
      workers: [
        { id:'w16', name:'Kerem A.', score:4.8, photoUrl: AV(9)  },
        { id:'w17', name:'Miraç E.', score:4.6, photoUrl: AV(10) },
        { id:'w18', name:'Deniz U.', score:4.5, photoUrl: AV(11) },
      ],
      subTasks: [
        { id: 't6', title: 'Tuğla malzeme teslimi', done: true },
        { id: 't7', title: 'Harç hazırlık alanı kuruldu', done: true },
        { id: 't8', title: 'İlk sıra duvar terazisi', done: true },
        { id: 't9', title: 'Kapı-Pencere lentoları', done: false },
        { id: 't10', title: 'Elektrik kutu boşlukları', done: false },
      ],
    },
    {
      id: 'e7', name: 'Elektrik tesisatı', progress: 75, updatedAt: '19.08.2025',
      foreman: { id:'f7', name:'Ustabaşı: Sefa B.', score: 4.9, photoUrl: AV(12) },
      workers: [
        { id:'w19', name:'Yunus P.', score:4.9, photoUrl: AV(13) },
        { id:'w20', name:'Eren B.',  score:4.7, photoUrl: AV(14) },
        { id:'w21', name:'Selin K.', score:4.6, photoUrl: AV(15) },
      ],
      subTasks: [
        { id: 't11', title: 'Kablo kanalları açıldı', done: true },
        { id: 't12', title: 'Kablo çekimi', done: true },
        { id: 't13', title: 'Pano montajı', done: false },
        { id: 't14', title: 'Topraklama testi', done: false }
      ],
    },
    {
      id: 'e8', name: 'Mekanik / HVAC', progress: 60, updatedAt: '17.08.2025',
      foreman: { id:'f8', name:'Ustabaşı: Burak Ş.', score: 4.6, photoUrl: AV(16) },
      workers: [
        { id:'w22', name:'Gökhan Z.', score:4.8, photoUrl: AV(17) },
        { id:'w23', name:'Halil İ.',  score:4.6, photoUrl: AV(18) },
        { id:'w24', name:'Seda L.',   score:4.5, photoUrl: AV(19) },
      ],
      subTasks: [
        { id: 't15', title: 'Şaft montajı', done: true },
        { id: 't16', title: 'Ana hat borulama', done: true },
        { id: 't17', title: 'Fan-coil yerleşim', done: false },
        { id: 't18', title: 'Basınç testi', done: false }
      ],
    },
  ],
};


// UI helpers
function ProgressBar({ value, label }: { value: number; label?: string }) {
  const v = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div className="w-full" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={v} aria-label={label || "İlerleme"}>
      <div className="h-2.5 w-full rounded-full bg-neutral-200 overflow-hidden">
        <div className="h-full bg-[#ff5c00] transition-all" style={{ width: `${v}%` }} />
      </div>
    </div>
  );
}

function WorkerAvatar({ name, score, photoUrl }: { name: string; score: number; photoUrl?: string }) {
  const initial = (name || '?').trim().charAt(0).toUpperCase();
  return (
    <div className="relative" title={`${name} • ⭐ ${score.toFixed(1)}`}>
      <div className="h-9 w-9 rounded-full border-2 border-white overflow-hidden bg-neutral-200 grid place-items-center">
        {photoUrl ? <img src={photoUrl} alt={name} className="h-full w-full object-cover" /> : <span className="text-xs font-semibold text-neutral-700">{initial}</span>}
      </div>
      <svg aria-hidden viewBox="0 0 24 24" className="absolute -top-1 -left-1 h-3.5 w-3.5">
        <path d="M4 13h16v-1a8 8 0 0 0-16 0v1Z" fill="#f59e0b"/>
        <path d="M4 14h16v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2Z" fill="#fde68a"/>
      </svg>
      <div className="absolute -bottom-1 -right-1 h-5 min-w-[1.25rem] px-1 rounded-full bg-white ring-1 ring-neutral-200 text-[10px] grid place-items-center text-neutral-700">
        ⭐ {score.toFixed(1)}
      </div>
    </div>
  );
}

function getTop3(workers: Person[]) {
  return [...workers].sort((a,b)=> (b.score!==a.score ? b.score-a.score : a.name.localeCompare(b.name))).slice(0,3);
}

// --------------------------------------
// App with simple in-file routing + role
// --------------------------------------
type Route = { name: 'project' } | { name: 'subtasks'; el: ElementItem } | { name: 'workers'; el: ElementItem };

export default function InsaatOgeDetaylariPage(){
  const router = useRouter();
  const [route, setRoute] = useState<Route>({ name: 'project' });
  const [role, setRole] = useState<Role>('Ustabaşı'); // demo amacıyla rol seçimi

  // Genel ilerleme (ortalama)
  const overall = useMemo(()=> {
    const xs = PROJECT.elements.map(e=>e.progress);
    return xs.length ? Math.round(xs.reduce((a,b)=>a+b,0)/xs.length) : 0;
  }, []);

  // Top 3'te yer alan farklı işçi sayısı
  const distinctTop3 = useMemo(()=>{
    const ids = new Set<string>();
    PROJECT.elements.forEach(el => getTop3(el.workers).forEach(w => ids.add(w.id)));
    return ids.size;
  }, []);

  const isMain = route.name === 'project';

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-neutral-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-3">
          {!isMain && (
            <button onClick={()=>setRoute({ name:'project' })} className="rounded-md px-2 py-1 text-sm border border-neutral-300 hover:bg-neutral-50">← Geri</button>
          )}
          <div className="h-8 w-8 rounded-lg bg-[#ff5c00]" aria-hidden />
          <div className="leading-tight">
            <div className="text-xs text-neutral-500">Proje Kodu</div>
            <div className="font-semibold">{PROJECT.code} • {PROJECT.name}</div>
          </div>

          {/* Rol seçici (demo) */}
          <div className="ml-auto flex items-center gap-2">
            <label className="text-xs text-neutral-500">Rol (demo):</label>
            <select value={role} onChange={(e)=>setRole(e.target.value as Role)} className="rounded-lg border border-neutral-300 bg-white px-2 py-1 text-sm">
              <option>Yönetici</option>
              <option>Mühendis</option>
              <option>Mimar</option>
              <option>Ustabaşı</option>
              <option>İşçi</option>
            </select>
            <button
              type="button"
              aria-label="İş emirleri"
              className="rounded-lg bg-[#ff5c00] hover:bg-[#e65100] text-white px-4 py-2 text-sm font-medium shadow-sm"
              onClick={() => router.push(`/work-orders?project=${PROJECT.code}`)}
            >
              İş emirleri
            </button>
          </div>
        </div>
      </header>

      {isMain ? (
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {/* ÜST KARTLAR */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Genel İlerleme */}
            <div className="lg:col-span-2 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-neutral-200">
              <h2 className="text-lg font-semibold">Genel İlerleme</h2>
              <p className="text-sm text-neutral-600 mt-1">Alt kalemlerin ortalaması</p>
              <div className="mt-4">
                <ProgressBar value={overall} />
                <div className="mt-2 text-sm font-medium">%{overall}</div>
              </div>
              {/* Alt metrik kutuları */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-neutral-200 p-4">
                  <div className="text-xs text-neutral-500">Alt kalem sayısı</div>
                  <div className="mt-1 text-2xl font-semibold">{PROJECT.elements.length}</div>
                </div>
                <div className="rounded-xl border border-neutral-200 p-4">
                  <div className="text-xs text-neutral-500">Top 3'te yer alan farklı işçi</div>
                  <div className="mt-1 text-2xl font-semibold">{distinctTop3}</div>
                </div>
              </div>
            </div>

            {/* Özet */}
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-neutral-200">
              <h3 className="text-lg font-semibold">Özet</h3>
              <dl className="mt-3 text-sm">
                <div className="flex items-center justify-between py-1">
                  <dt className="text-neutral-600">Son güncelleme</dt>
                  <dd className="font-medium">{PROJECT.lastUpdated}</dd>
                </div>
                <div className="flex items-center justify-between py-1">
                  <dt className="text-neutral-600">Konum</dt>
                  <dd className="font-medium">{PROJECT.location}</dd>
                </div>
                <div className="flex items-center justify-between py-1">
                  <dt className="text-neutral-600">Durum</dt>
                  <dd>
                    <span className="rounded-md px-2 py-1 bg-orange-100 text-[#ff5c00] text-xs">{PROJECT.status}</span>
                  </dd>
                </div>
              </dl>
            </div>
          </section>

          {/* ÖĞELER LİSTESİ */}
          <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-neutral-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">İnşaat Öğeleri</h2>
              <div className="flex items-center gap-2">
                <button className="rounded-lg border px-3 py-1.5 text-sm hover:bg-neutral-50">Sırala: İlerleme ↓</button>
                <button className="rounded-lg border px-3 py-1.5 text-sm hover:bg-neutral-50">Filtreler</button>
              </div>
            </div>
            <div className="mt-4 divide-y divide-neutral-200">
              {PROJECT.elements.map(el => (
                <ElementRow
                  key={el.id}
                  element={el}
                  onOpenWorkers={() => setRoute({ name: 'workers', el })}
                  onOpenSubtasks={() => setRoute({ name: 'subtasks', el })}
                />
              ))}
            </div>
          </section>
        </main>
      ) : route.name === 'subtasks' ? (
        <SubtasksView el={route.el} onBack={() => setRoute({ name:'project' })} role={role} />
      ) : (
        <WorkersView el={route.el} onBack={() => setRoute({ name:'project' })} />
      )}
    </div>
  );
}

function ElementRow({ element, onOpenWorkers, onOpenSubtasks }: { element: ElementItem; onOpenWorkers: () => void; onOpenSubtasks: () => void }){
  const top3 = getTop3(element.workers);
  const extra = Math.max(0, element.workers.length - top3.length);

  return (
    <article className="py-4 cursor-pointer" onClick={onOpenSubtasks}>
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex items-start gap-3 md:w-1/3">
          <div className="mt-1 h-9 w-9 rounded-lg bg-orange-100 grid place-items-center" aria-hidden>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 3h18v2H3V3Zm2 4h14l2 6H3l2-6Zm-2 8h18v2H3v-2Zm2 4h14v2H5v-2Z" fill="#ff5c00"/></svg>
          </div>
          <div>
            <h3 className="font-medium text-neutral-900">{element.name}</h3>
            <div className="text-xs text-neutral-500">Son güncelleme: {element.updatedAt || '-'}</div>
          </div>
        </div>

        {/* Orta alan: progress bar (tıklanır: SUBTASKS PAGE) */}
        <div className="md:w-1/2">
          <button onClick={onOpenSubtasks} className="group w-full text-left rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff5c00]">
            <ProgressBar value={element.progress} label={`${element.name} ilerlemesi`} />
          </button>
          <div className="mt-2 text-sm font-medium text-neutral-900 flex items-center justify-between">
            <span>%{element.progress}</span>
            <button
              onClick={(e)=>{ e.stopPropagation(); onOpenSubtasks(); }}
              className="inline-flex items-center gap-1 text-[#ff5c00] text-xs hover:underline"
            >
              Detayları gör
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="transition">
                <path d="M7 10l5 5 5-5H7z" fill="#ff5c00"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="md:w-1/3 flex items-center justify-between md:justify-end gap-3">
          <div className="flex -space-x-2" aria-label="En yüksek puanlı işçiler">
            {top3.map((w,i)=> (
              <div key={w.id} style={{ zIndex: 9 - i }}>
                <WorkerAvatar name={w.name} score={w.score} photoUrl={w.photoUrl} />
              </div>
            ))}
            {extra>0 && <div className="h-9 w-9 rounded-full border-2 border-white bg-neutral-200 grid place-items-center text-sm font-medium text-neutral-700">+{extra}</div>}
          </div>
          <button onClick={(e)=>{ e.stopPropagation(); onOpenWorkers(); }} className="text-sm text-[#ff5c00] hover:underline">Tüm işçiler</button>
        </div>
      </div>
    </article>
  );
}

// ---------------- Subtasks Page ----------------
function autoCompleteOnFirstApproval(task: SubTask, evidenceId: string): SubTask {
  const hadApproved = (task.evidence || []).some(ev => ev.status === 'approved');
  const evs = (task.evidence || []).map(ev => ev.id === evidenceId ? { ...ev, status: 'approved' } : ev);
  const nowHasApproved = hadApproved || evs.some(ev => ev.status === 'approved');
  const done = task.done || (!hadApproved && nowHasApproved);
  return { ...task, evidence: evs, done };
}

function SubtasksView({ el, onBack, role }: { el: ElementItem; onBack: () => void; role: Role }){
  const [tasks, setTasks] = useState<SubTask[]>(() => (el.subTasks || []).map(t => ({...t, evidence: t.evidence || []})));
  const createdUrlsRef = useRef<string[]>([]);
  const canUpload = role === 'Ustabaşı';
  const canApprove = role === 'Mühendis' || role === 'Mimar';

  useEffect(() => () => { createdUrlsRef.current.forEach(u => URL.revokeObjectURL(u)); }, []);

  function handleFiles(taskId: string, files: FileList | null){
    if(!files || !files.length || !canUpload) return;
    const now = new Date().toLocaleString('tr-TR');
    const newEvs: Evidence[] = Array.from(files).map((f, idx) => {
      const url = URL.createObjectURL(f);
      createdUrlsRef.current.push(url);
      return { id: `${taskId}-${Date.now()}-${idx}`, url, name: f.name, size: f.size, uploadedBy: 'Ustabaşı', uploadedAt: now, status: 'pending' };
    });
    setTasks(prev => prev.map(t => t.id === taskId ? {...t, evidence: [ ...(t.evidence || []), ...newEvs ]} : t));
  }

  function handleRemove(taskId: string, evidenceId: string){
    if(!canUpload) return;
    setTasks(prev => prev.map(t => {
      if(t.id !== taskId) return t;
      const evs = (t.evidence || []).filter(ev => ev.id !== evidenceId);
      const stillApproved = evs.some(ev => ev.status === 'approved');
      return { ...t, evidence: evs, done: stillApproved ? t.done : false };
    }));
  }

  function handleApprove(taskId: string, evidenceId: string){
    if(!canApprove) return;
    setTasks(prev => prev.map(t => t.id === taskId ? autoCompleteOnFirstApproval(t, evidenceId) : t));
  }

  function handleReject(taskId: string, evidenceId: string){
    if(!canApprove) return;
    setTasks(prev => prev.map(t => {
      if(t.id !== taskId) return t;
      const evs = (t.evidence || []).map(ev => ev.id === evidenceId ? { ...ev, status: 'rejected' } : ev);
      const stillApproved = evs.some(ev => ev.status === 'approved');
      return { ...t, evidence: evs, done: stillApproved ? t.done : false };
    }));
  }

  function toggleDone(taskId: string, next: boolean){
    setTasks(prev => prev.map(t => {
      if(t.id !== taskId) return t;
      const hasApproved = (t.evidence || []).some(ev => ev.status === 'approved');
      if(next && !hasApproved) return t;
      return {...t, done: next};
    }));
  }

  return (
    <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{el.name} — Alt Görevler</h1>
        <button onClick={onBack} className="rounded-lg border px-3 py-1.5 text-sm hover:bg-neutral-50">Geri</button>
      </div>

      <div className="mt-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-neutral-200">
        <div className="flex items-center justify-between">
          <div className="text-sm text-neutral-600">Tamamlanma</div>
          <div className="text-sm font-medium">%{el.progress}</div>
        </div>
        <div className="mt-2"><ProgressBar value={el.progress} /></div>

        <h2 className="mt-6 text-base font-semibold">Checklist</h2>
        <ul className="mt-3 space-y-3">
          {tasks.map(item => (
            <SubtaskRow
              key={item.id}
              item={item}
              role={role}
              onToggle={(next)=>toggleDone(item.id, next)}
              onFiles={(files)=>handleFiles(item.id, files)}
              onRemove={(evId)=>handleRemove(item.id, evId)}
              onApprove={(evId)=>handleApprove(item.id, evId)}
              onReject={(evId)=>handleReject(item.id, evId)}
            />
          ))}
          {(!tasks || tasks.length === 0) && (
            <li className="text-sm text-neutral-600">Bu öğe için alt görev tanımlı değil.</li>
          )}
        </ul>
      </div>
    </main>
  );
}

function SubtaskRow({ item, role, onToggle, onFiles, onRemove, onApprove, onReject }:{ item: SubTask; role: Role; onToggle:(next:boolean)=>void; onFiles:(files: FileList|null)=>void; onRemove:(evId:string)=>void; onApprove:(evId:string)=>void; onReject:(evId:string)=>void }){
  const inputRef = useRef<HTMLInputElement>(null);
  const canUpload = role === 'Ustabaşı';
  const canApprove = role === 'Mühendis' || role === 'Mimar';
  const hasApproved = !!(item.evidence && item.evidence.some(ev => ev.status === 'approved'));

  return (
    <li className="rounded-xl border border-neutral-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={!!item.done}
            onChange={(e)=> onToggle(e.target.checked)}
            disabled={!canUpload || (!hasApproved && !item.done)}
            className="mt-1 h-4 w-4 rounded border-neutral-300 text-[#ff5c00] focus:ring-[#ff5c00] disabled:opacity-60"
          />
          <span className={item.done ? 'text-neutral-700 line-through' : 'text-neutral-800'}>{item.title}</span>
        </label>
        <div className="flex items-center gap-2">
          {canUpload && (
            <>
              <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e)=>onFiles(e.target.files)} />
              <button onClick={()=>inputRef.current?.click()} className="rounded-lg border px-3 py-1.5 text-sm hover:bg-neutral-50">Fotoğraf yükle</button>
            </>
          )}
          {item.evidence && item.evidence.length > 0 && (
            <span className="text-xs text-neutral-600">{item.evidence.length} görsel</span>
          )}
        </div>
      </div>

      {!hasApproved && canUpload && (
        <div className="mt-2 text-xs text-[#b45309]">Bu görevi tamamlamak için en az bir onaylı fotoğraf kanıtı gereklidir.</div>
      )}

      {item.evidence && item.evidence.length > 0 && (
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {item.evidence.map(ev => (
            <div key={ev.id} className="relative rounded-lg overflow-hidden border border-neutral-200">
              <img src={ev.url} alt={ev.name} className="h-28 w-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 bg-black/50 text-white px-2 py-1 text-[11px] flex items-center justify-between gap-2">
                <span className="truncate">{ev.uploadedBy} • {ev.uploadedAt}</span>
                <span className={`ml-2 rounded px-1 ${ev.status==='approved' ? 'bg-green-500' : ev.status==='rejected' ? 'bg-rose-500' : 'bg-yellow-500'}`}>
                  {ev.status==='approved' ? 'Onaylı' : ev.status==='rejected' ? 'Reddedildi' : 'Bekliyor'}
                </span>
              </div>
              <div className="absolute top-1 right-1 flex gap-1">
                {canApprove && ev.status !== 'approved' && (
                  <button onClick={()=>onApprove(ev.id)} className="rounded bg-white/90 text-[10px] px-2 py-0.5">Onayla</button>
                )}
                {canApprove && ev.status !== 'rejected' && (
                  <button onClick={()=>onReject(ev.id)} className="rounded bg-white/90 text-[10px] px-2 py-0.5">Reddet</button>
                )}
                {canUpload && (
                  <button onClick={()=>onRemove(ev.id)} className="rounded bg-white/90 text-[10px] px-2 py-0.5">Sil</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </li>
  );
}

// ---------------- Workers Page ----------------
function WorkersView({ el, onBack }: { el: ElementItem; onBack: () => void }){
  const ordered = useMemo(()=> [el.foreman, ...[...el.workers].sort((a,b)=> (b.score!==a.score ? b.score-a.score : a.name.localeCompare(b.name)))], [el]);
  return (
    <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{el.name} — Personel Hiyerarşisi</h1>
        <button onClick={onBack} className="rounded-lg border px-3 py-1.5 text-sm hover:bg-neutral-50">Geri</button>
      </div>

      <div className="mt-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-neutral-200">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-neutral-50 text-neutral-600">
            <tr className="border-b border-neutral-200">
              <th className="text-left font-medium px-6 py-2">Personel</th>
              <th className="text-left font-medium px-6 py-2">Rol</th>
              <th className="text-right font-medium px-6 py-2">Puan</th>
            </tr>
          </thead>
          <tbody>
            {ordered.map((p, idx) => (
              <tr key={p.id} className="border-b border-neutral-100 hover:bg-neutral-50/60">
                <td className="px-6 py-2">
                  <div className="flex items-center gap-3">
                    <WorkerAvatar name={p.name} score={p.score} photoUrl={p.photoUrl} />
                    <div className="leading-tight">
                      <div className="font-medium text-neutral-900">{p.name}</div>
                      {idx === 0 && <div className="text-xs text-[#ff5c00]">Ustabaşı</div>}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-2 text-neutral-700">{idx === 0 ? 'Ustabaşı' : 'İşçi'}</td>
                <td className="px-6 py-2 text-right font-medium">{p.score.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

// ---------------------------------------------------------------
// Optional: lightweight runtime smoke tests
// Run in console: window.__RUN_PROJECT_DETAIL_TESTS__ = true; location.reload();
// ---------------------------------------------------------------
;(() => {
  if (typeof window === 'undefined') return;
  // @ts-ignore
  if (!window.__RUN_PROJECT_DETAIL_TESTS__) return;
  try {
    console.assert(PROJECT.elements.length >= 3, 'Should have at least 3 elements');
    const avg = Math.round(PROJECT.elements.reduce((a, b) => a + b.progress, 0) / PROJECT.elements.length);
    console.assert(avg > 0 && avg <= 100, 'Average progress in range');

    const canComplete = (evidence: any[]) => Array.isArray(evidence) && evidence.some((ev: any) => ev && ev.status === 'approved');
    console.assert(canComplete([{status:'approved'}]) === true, 'Approved evidence allows completion');
    console.assert(canComplete([{status:'pending'}]) === false, 'Pending-only evidence blocks completion');
    console.assert(canComplete([{status:'rejected'}]) === false, 'Rejected-only evidence blocks completion');
    console.assert(canComplete([]) === false, 'No evidence blocks completion');

    const baseTask1: any = { id:'T1', title:'x', done:false, evidence:[{ id:'E1', status:'pending' }] };
    const after1 = (autoCompleteOnFirstApproval as any)(baseTask1, 'E1');
    console.assert(after1.done === true, 'Auto-complete on first approval works');

    const baseTask2: any = { id:'T2', title:'y', done:false, evidence:[{ id:'E2', status:'rejected' }] };
    const after2 = (autoCompleteOnFirstApproval as any)(baseTask2, 'E2');
    console.assert(after2.done === false, 'Rejected evidence should not complete');

    const sampleRemove: any = { id:'R', title:'r', done:true, evidence:[{ id:'A', status:'approved' }] };
    const afterRemove = (function(){
      const t: any = { ...sampleRemove };
      const evs = (t.evidence || []).filter((ev:any) => ev.id !== 'A');
      const stillApproved = evs.some((ev:any) => ev.status === 'approved');
      return { ...t, evidence: evs, done: stillApproved ? t.done : false };
    })();
    console.assert(afterRemove.done === false, 'Auto-reopen on removing last approved');

    const sampleReject: any = { id:'RJ', title:'rj', done:true, evidence:[{ id:'B', status:'approved' }] };
    const evsRJ = (sampleReject.evidence || []).map((ev:any) => ev.id === 'B' ? { ...ev, status: 'rejected' } : ev);
    const stillApprovedRJ = evsRJ.some((ev:any) => ev.status === 'approved');
    const afterReject: any = { ...sampleReject, evidence: evsRJ, done: stillApprovedRJ ? sampleReject.done : false };
    console.assert(afterReject.done === false, 'Auto-reopen on rejecting last approved');

    console.log('Project Detail smoke tests passed ✅');
  } catch (e) {
    console.error('Project Detail smoke tests failed:', e);
  }
})();
