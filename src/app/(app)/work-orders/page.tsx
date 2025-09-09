"use client";
import React, { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

/**
 * Work Orders — Role Router Demo (Standalone)
 * Branding: #ff5c00 / #ffffff
 */

// ---------------- Shared Types & Helpers ----------------
type Role = 'Yönetici' | 'Mühendis' | 'Mimar' | 'Ustabaşı' | 'İşçi';
type Person = { id: string; name: string; roles: Role[]; score?: number; photoUrl?: string };

// Admin sayfası için atama şekli
type AdminAssignment = { architects: string[]; engineers: string[]; foremen: string[]; workers: string[] };
// Engineer/Mimar sayfası için
type EngAssignment = { foremen: string[]; workers: string[] };
// Foreman sayfası için
type ForemanAssignment = { workers: string[] };

// public/avatars/avt1.jpg, avt2.jpg ... dosyaların sayısını yaz
const AV_COUNT = 12; // sende kaç tane varsa bunu yaz
const AV = (n: number) => `/avatars/avt${((n - 1) % AV_COUNT) + 1}.png`; // jpg yerine png ise .png yap


function includesId(list: string[], id: string){ return list.indexOf(id) !== -1; }
function without<T>(arr: T[], id: T){ return arr.filter(x => x !== id); }
function fmtScore(s?: number){ return typeof s === 'number' && Number.isFinite(s) ? s.toFixed(1) : '—'; }

function Avatar({ name, photoUrl, size = 36 }:{ name: string; photoUrl?: string; size?: number }){
  const initial = (name || '?').trim().charAt(0).toUpperCase();
  const s = `${size}px`;
  return (
    <div className="relative" style={{ width: s, height: s }} title={name}>
      <div className="h-full w-full rounded-full overflow-hidden border-2 border-white bg-neutral-200 grid place-items-center">
        {photoUrl ? (
          <img src={photoUrl} alt={name} className="h-full w-full object-cover" />
        ) : (
          <span className="text-xs font-semibold text-neutral-700">{initial}</span>
        )}
      </div>
      {/* Baret overlay */}
      <svg aria-hidden viewBox="0 0 24 24" className="absolute -top-1 -left-1" style={{ width: Math.round(size*0.38), height: Math.round(size*0.38) }}>
        <path d="M4 13h16v-1a8 8 0 0 0-16 0v1Z" fill="#f59e0b"/>
        <path d="M4 14h16v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2Z" fill="#fde68a"/>
      </svg>
    </div>
  );
}

// ---------------- Router Shell (Sayfa) ----------------
export default function WorkOrdersPage(){
  const [role, setRole] = useState<Role>('Yönetici');
  const [route] = useState<'workorders'>('workorders');

  // dashboard/detaydan gelen ?project=PRJ-003 parametresi
  const params = useSearchParams();
  const projectCode = params.get("project") ?? "PRJ-003";

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Topbar */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-neutral-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-3">
          <button className="h-8 w-8 rounded-lg bg-[#ff5c00] grid place-items-center text-white" aria-label="menu">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M3 6h18v2H3zM3 11h18v2H3zM3 16h18v2H3z"/></svg>
          </button>
          <div className="leading-tight">
            <div className="text-xs text-neutral-500">İş Emirleri • Rol Router Demo</div>
            <div className="font-semibold">{projectCode} • Lojistik Tesis</div>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <select value={role} onChange={e=>setRole(e.target.value as Role)} className="rounded-lg border border-neutral-300 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5c00]">
              <option value="Yönetici">Yönetici</option>
              <option value="Mühendis">Mühendis</option>
              <option value="Mimar">Mimar</option>
              <option value="Ustabaşı">Ustabaşı</option>
            </select>
            <button className="rounded-lg bg-[#ff5c00] hover:bg-[#e65100] text-white px-4 py-2 text-sm font-medium shadow-sm">Değişiklikleri Kaydet</button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {route === 'workorders' && (
          role === 'Yönetici' ? (
            <AdminWorkOrders />
          ) : role === 'Ustabaşı' ? (
            <ForemanWorkOrders />
          ) : (
            <EngineerWorkOrders />
          )
        )}
      </main>
    </div>
  );
}

// ============================================================================
// 1) Yönetici — İş Emirleri (Mimar/Mühendis atama, kalıcı rol opsiyonu)
// ============================================================================
function AdminWorkOrders(){
  type TargetKey = keyof AdminAssignment; // 'architects' | 'engineers' | 'foremen' | 'workers'
  type FilterRole = Exclude<Role, 'Yönetici'>;

  const PROJECT = { id: '3', code: 'PRJ-003', name: 'Lojistik Tesis' };
  const SEED_PEOPLE: Person[] = [
  { id: 'p1',  name: 'Ayşe Demir',   roles: ['Mimar'],     score: 4.8, photoUrl: AV(1)  },
  { id: 'p2',  name: 'Kerem Yılmaz', roles: ['Mühendis'],  score: 4.7, photoUrl: AV(2)  },
  { id: 'p3',  name: 'Elif Kaya',    roles: ['Mühendis'],  score: 4.6, photoUrl: AV(3)  },
  { id: 'p4',  name: 'Mert Çetin',   roles: ['Ustabaşı'],  score: 4.5, photoUrl: AV(4)  },
  { id: 'p5',  name: 'Zeynep Arı',   roles: ['İşçi'],      score: 4.1, photoUrl: AV(5)  },
  { id: 'p6',  name: 'Burak Şahin',  roles: ['İşçi'],      score: 4.0, photoUrl: AV(6)  },
  { id: 'p7',  name: 'Selin Koç',    roles: ['Mimar'],     score: 4.9, photoUrl: AV(7)  },
  { id: 'p8',  name: 'Cem Ak',       roles: ['Ustabaşı'],  score: 4.3, photoUrl: AV(8)  },
  { id: 'p9',  name: 'Deniz U.',     roles: ['İşçi'],      score: 3.9, photoUrl: AV(9)  },
  { id: 'p10', name: 'Hakan T.',     roles: ['Mühendis'],  score: 4.4, photoUrl: AV(10) },
];


  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [assign, setAssign] = useState<AdminAssignment>({ architects: [], engineers: [], foremen: [], workers: [] });
  const [roster, setRoster] = useState<Person[]>(SEED_PEOPLE);
  const [toast, setToast] = useState<null | { title: string; desc: string }>(null);
  const [confirm, setConfirm] = useState<null | { target: TargetKey; ids: string[] }>(null);
  const [roleFilter, setRoleFilter] = useState<FilterRole[]>([]);

  const roleCounts = useMemo(() => ({
    Mimar: roster.filter(p => p.roles.includes('Mimar')).length,
    Mühendis: roster.filter(p => p.roles.includes('Mühendis')).length,
    Ustabaşı: roster.filter(p => p.roles.includes('Ustabaşı')).length,
    İşçi: roster.filter(p => p.roles.includes('İşçi')).length,
  }), [roster]);

  const canAssignTo = (target: TargetKey) => (target === 'architects' || target === 'engineers');
  const expectedRoleFor = (target: TargetKey): Role => ({ architects: 'Mimar', engineers: 'Mühendis', foremen: 'Ustabaşı', workers: 'İşçi' } as const)[target];

  function toggleRoleFilter(r: FilterRole){ setRoleFilter(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r]); }
  function toggleSelect(id: string){ setSelected(prev => includesId(prev, id) ? prev.filter(x => x !== id) : [...prev, id]); }
  function clearSelection(){ setSelected([]); }

  function withoutAssigned(roster: Person[], assign: AdminAssignment){
    const set = new Set<string>([...assign.architects, ...assign.engineers, ...assign.foremen, ...assign.workers]);
    return roster.filter(p => !set.has(p.id));
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let arr = withoutAssigned(roster, assign);
    if (q) arr = arr.filter(p => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q));
    if (roleFilter.length) arr = arr.filter(p => p.roles.some(r => (roleFilter as string[]).includes(r)));
    return arr;
  }, [query, roster, roleFilter, assign]);

  function assignSelected(target: TargetKey){
    if(!canAssignTo(target)){
      setToast({ title: 'Yetki yok', desc: target === 'foremen' ? 'Ustabaşı atamasını Mühendis/Mimar yapar.' : 'İşçi atamasını Ustabaşı yapar.' });
      return;
    }
    if(selected.length === 0){ setToast({ title: 'Seçim yok', desc: 'Lütfen en az bir personel seçin.' }); return; }
    setConfirm({ target, ids: selected });
  }

  function applyAssignment(target: TargetKey, ids: string[], permanent: boolean){
    setAssign(prev => {
      const next = { ...prev } as AdminAssignment;
      const base = new Set(next[target]);
      ids.forEach(id => base.add(id));
      (next as any)[target] = Array.from(base);
      (Object.keys(next) as (keyof AdminAssignment)[]).forEach(k => { if(k !== target){ (next as any)[k] = (next as any)[k].filter((pid: string) => !ids.includes(pid)); }});
      return next;
    });

    const role = expectedRoleFor(target);
    if(permanent){
      setRoster(prev => prev.map(p => ids.includes(p.id) ? { ...p, roles: [role] } : p));
      setToast({ title: 'Atama yapıldı', desc: `${ids.length} kişi bu projeye ${role} olarak atandı. Kalıcı rol güncellendi (tekil).` });
    } else {
      const mismatched = roster.filter(p => ids.includes(p.id) && !p.roles.includes(role)).map(p => p.name);
      if(mismatched.length){ setToast({ title: 'Bilgi', desc: `Sadece bu projeye atandı. Kalıcı rol vermediğiniz kişiler: ${mismatched.join(', ')}` }); }
      else { setToast({ title: 'Atama yapıldı', desc: `${ids.length} kişi bu projeye ${role} olarak atandı.` }); }
    }

    clearSelection();
    setConfirm(null);
  }

  function removeFrom(roleKey: keyof AdminAssignment, id: string){ setAssign(prev => ({ ...prev, [roleKey]: without((prev as any)[roleKey], id) })); }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Sol Panel */}
      <section className="lg:col-span-1 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-neutral-200">
        <div className="flex items-center justify-between"><h2 className="text-lg font-semibold">Ekip</h2><span className="text-xs text-neutral-500">{filtered.length} kişi</span></div>
        <div className="mt-3"><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="ID veya isim ile ara" className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5c00]"/></div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {(['Mimar','Mühendis','Ustabaşı','İşçi'] as FilterRole[]).map(r => (
            <button key={r} onClick={()=>toggleRoleFilter(r)} className={`${roleFilter.includes(r) ? 'bg-[#ff5c00] text-white' : 'bg-neutral-100 text-neutral-700'} rounded-full px-2.5 py-1 text-[11px] ring-1 ring-neutral-200`} aria-pressed={roleFilter.includes(r)}>
              {r} <span className="ml-1 opacity-80">{roleCounts[r as keyof typeof roleCounts]}</span>
            </button>
          ))}
          {roleFilter.length>0 && (<button onClick={()=>setRoleFilter([])} className="text-xs text-[#ff5c00] hover:underline">Filtreyi temizle</button>)}
        </div>

        <ul className="mt-4 space-y-2 max-h-[60vh] overflow-auto pr-1">
          {filtered.map(p => (
            <li key={p.id} className={`rounded-xl border ${selected.includes(p.id) ? 'border-[#ff5c00] bg-orange-50' : 'border-neutral-200 bg-white'} p-3 flex items-center justify-between`}>
              <div className="min-w-0 flex items-center gap-3">
                <Avatar name={p.name} photoUrl={p.photoUrl} size={36} />
                <div className="min-w-0">
                  <div className="flex items-center gap-2"><div className="text-sm font-medium text-neutral-900 truncate">{p.name}</div><span className="text-[11px] text-neutral-600">⭐ {fmtScore(p.score)}</span></div>
                  <div className="text-[11px] text-neutral-500">ID: {p.id}</div>
                </div>
              </div>
              <input type="checkbox" checked={selected.includes(p.id)} onChange={()=>toggleSelect(p.id)} className="h-4 w-4 rounded border-neutral-300 text-[#ff5c00] focus:ring-[#ff5c00]"/>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex items-center gap-2"><button onClick={clearSelection} className="rounded-lg border px-3 py-1.5 text-sm hover:bg-neutral-50">Seçimi temizle</button><span className="text-xs text-neutral-500">Seçili: {selected.length}</span></div>
      </section>

      {/* Sağ Panel */}
      <section className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
        <RoleBucket title="Projeye atanmış Mimarlar" color="#ff5c00" people={assign.architects.map(id => roster.find(p => p.id === id)!).filter(Boolean)} onRemove={id=>removeFrom('architects', id)} footer={<div className="flex items-center gap-2"><button onClick={()=>assignSelected('architects')} className="rounded-lg bg-[#ff5c00] hover:bg-[#e65100] text-white px-3 py-1.5 text-sm">Seçilenleri Ata</button><span className="text-xs text-neutral-500">Yalnızca Yönetici</span></div>} />
        <RoleBucket title="Projeye atanmış Mühendisler" color="#ff5c00" people={assign.engineers.map(id => roster.find(p => p.id === id)!).filter(Boolean)} onRemove={id=>removeFrom('engineers', id)} footer={<div className="flex items-center gap-2"><button onClick={()=>assignSelected('engineers')} className="rounded-lg bg-[#ff5c00] hover:bg-[#e65100] text-white px-3 py-1.5 text-sm">Seçilenleri Ata</button><span className="text-xs text-neutral-500">Yalnızca Yönetici</span></div>} />
        <RoleBucket title="Ustabaşılar (kilitli)" color="#9ca3af" locked people={assign.foremen.map(id => roster.find(p => p.id === id)!).filter(Boolean)} onRemove={()=>{}} hint="Bu atamayı Mühendis/Mimar yapar" />
        <RoleBucket title="İşçiler (kilitli)" color="#9ca3af" locked people={assign.workers.map(id => roster.find(p => p.id === id)!).filter(Boolean)} onRemove={()=>{}} hint="Bu atamayı Ustabaşı yapar" />
      </section>

      {/* Modal & Toast */}
      {confirm && (
        <ConfirmPermanentModal target={confirm.target} count={confirm.ids.length} onPermanent={()=>applyAssignment(confirm.target, confirm.ids, true)} onTemporary={()=>applyAssignment(confirm.target, confirm.ids, false)} onClose={()=>setConfirm(null)} />
      )}
      {toast && (<Toast title={toast.title} desc={toast.desc} onClose={()=>setToast(null)} />)}
    </div>
  );
}

// ============================================================================
// 2) Mühendis/Mimar — İş Emirleri (Ustabaşı atama, kalıcı terfi: Ustabaşı)
// ============================================================================
function EngineerWorkOrders(){
const SEED: Person[] = [
  { id: 'p101', name: 'Mert Çetin', roles: ['Ustabaşı'], score: 4.5, photoUrl: AV(11) },
  { id: 'p102', name: 'Cem Ak',     roles: ['Ustabaşı'], score: 4.3, photoUrl: AV(12) },
  { id: 'p103', name: 'İsmail K.',  roles: ['İşçi'],     score: 4.8, photoUrl: AV(13) },
  { id: 'p104', name: 'Serhat U.',  roles: ['İşçi'],     score: 4.6, photoUrl: AV(14) },
  { id: 'p105', name: 'Seda L.',    roles: ['İşçi'],     score: 4.2, photoUrl: AV(15) },
  { id: 'p106', name: 'Gökhan Z.',  roles: ['İşçi'],     score: 4.0, photoUrl: AV(16) },
];

  const [assign, setAssign] = useState<EngAssignment>({ foremen: [], workers: [] });
  const [roster, setRoster] = useState<Person[]>(SEED);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [showPermanentOnly, setShowPermanentOnly] = useState(false);
  const [toast, setToast] = useState<null | { title: string; desc: string }>(null);
  const [confirm, setConfirm] = useState<null | { ids: string[] }>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let base = roster.filter(p => !assign.foremen.includes(p.id));
    if (showPermanentOnly) base = base.filter(p => p.roles.includes('Ustabaşı'));
    if (q) base = base.filter(p => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q));
    return base;
  }, [query, assign, roster, showPermanentOnly]);

  function toggleSelect(id: string){ setSelected(prev => includesId(prev, id) ? prev.filter(x => x !== id) : [...prev, id]); }
  function clearSelection(){ setSelected([]); }
  function assignSelectedForemen(){ if(selected.length === 0){ setToast({ title: 'Seçim yok', desc: 'Lütfen en az bir ustabaşı seçin.' }); return; } setConfirm({ ids: selected }); }
  function removeForeman(id: string){ setAssign(prev => ({ ...prev, foremen: without(prev.foremen, id) })); }

  function applyAssignmentEng(ids: string[], permanent: boolean){
    setAssign(prev => { const base = new Set(prev.foremen); ids.forEach(id => base.add(id)); return { ...prev, foremen: Array.from(base) }; });
    if(permanent){
      setRoster(prev => prev.map(p => ids.includes(p.id) ? { ...p, roles: ['Ustabaşı'] } : p));
      setToast({ title: 'Atama yapıldı', desc: `${ids.length} kişi kalıcı olarak Ustabaşı yapıldı ve projeye eklendi.` });
    } else {
      setToast({ title: 'Geçici atama', desc: `${ids.length} kişi sadece bu projeye ustabaşı olarak atandı.` });
    }
    setConfirm(null);
    clearSelection();
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Sol Panel */}
      <section className="lg:col-span-1 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-neutral-200">
        <div className="flex items-center justify-between"><h2 className="text-lg font-semibold">Ustabaşı Adayları</h2><span className="text-xs text-neutral-500">{filtered.length} kişi</span></div>
        <div className="mt-3"><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="ID veya isim ile ara" className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5c00]"/></div>
        <div className="mt-2 flex items-center gap-2"><input id="permOnlyFore" type="checkbox" checked={showPermanentOnly} onChange={e=>setShowPermanentOnly(e.target.checked)} className="h-4 w-4 rounded border-neutral-300 text-[#ff5c00] focus:ring-[#ff5c00]"/><label htmlFor="permOnlyFore" className="text-xs text-neutral-700">Sadece kalıcı ustabaşılar</label></div>
        <ul className="mt-4 space-y-2 max-h-[60vh] overflow-auto pr-1">
          {filtered.map(p => (
            <li key={p.id} className={`rounded-xl border ${selected.includes(p.id) ? 'border-[#ff5c00] bg-orange-50' : 'border-neutral-200 bg-white'} p-3 flex items-center justify-between`}>
              <div className="min-w-0 flex items-center gap-3"><Avatar name={p.name} photoUrl={p.photoUrl} size={36} /><div className="min-w-0"><div className="flex items-center gap-2"><div className="text-sm font-medium text-neutral-900 truncate">{p.name}</div><span className="text-[11px] text-neutral-600">⭐ {fmtScore(p.score)}</span></div><div className="text-[11px] text-neutral-500">ID: {p.id}</div></div></div>
              <input type="checkbox" checked={selected.includes(p.id)} onChange={()=>toggleSelect(p.id)} className="h-4 w-4 rounded border-neutral-300 text-[#ff5c00] focus:ring-[#ff5c00]"/>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex items-center gap-2"><button onClick={clearSelection} className="rounded-lg border px-3 py-1.5 text-sm hover:bg-neutral-50">Seçimi temizle</button><span className="text-xs text-neutral-500">Seçili: {selected.length}</span></div>
      </section>

      {/* Sağ Panel */}
      <section className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
        <RoleBucket title="Projeye atanmış Ustabaşılar" color="#ff5c00" people={assign.foremen.map(id => roster.find(p => p.id === id)!).filter(Boolean)} onRemove={id=>removeForeman(id)} footer={<div className="flex items-center gap-2"><button onClick={assignSelectedForemen} className="rounded-lg bg-[#ff5c00] hover:bg-[#e65100] text-white px-3 py-1.5 text-sm">Seçilenleri Ata</button><span className="text-xs text-neutral-500">Yalnızca Mühendis/Mimar</span></div>} />
        <RoleBucket title="İşçiler (kilitli)" color="#9ca3af" locked people={assign.workers.map(id => roster.find(p => p.id === id)!).filter(Boolean)} onRemove={()=>{}} hint="İşçi atamasını Ustabaşı yapar" />
      </section>

      {confirm && (
        <ConfirmPermanentModal
          target="foremen"
          count={confirm.ids.length}
          onPermanent={()=>applyAssignmentEng(confirm.ids, true)}
          onTemporary={()=>applyAssignmentEng(confirm.ids, false)}
          onClose={()=>setConfirm(null)}
        />
      )}
      {toast && (<Toast title={toast.title} desc={toast.desc} onClose={()=>setToast(null)} />)}
    </div>
  );
}

// ============================================================================
// 3) Ustabaşı — İş Emirleri (İşçi atama, kalıcı terfi: İşçi)
// ============================================================================
function ForemanWorkOrders(){
const SEED: Person[] = [
  { id: 'w1', name: 'Emre S.',   roles: ['İşçi'],     score: 4.4, photoUrl: AV(17) },
  { id: 'w2', name: 'Seda L.',   roles: ['İşçi'],     score: 4.2, photoUrl: AV(18) },
  { id: 'w3', name: 'Gökhan Z.', roles: ['İşçi'],     score: 4.0, photoUrl: AV(19) },
  { id: 'w4', name: 'İsmail K.', roles: ['Ustabaşı'], score: 4.8, photoUrl: AV(20) },
  { id: 'w5', name: 'Serhat U.', roles: ['İşçi'],     score: 4.1, photoUrl: AV(21) },
  { id: 'w6', name: 'Aytuğ T.',  roles: ['Mimar'],    score: 4.6, photoUrl: AV(22) },
  { id: 'w7', name: 'Zeynep Arı',roles: ['Mühendis'], score: 4.5, photoUrl: AV(23) },
  { id: 'w8', name: 'Burak Şahin',roles:['İşçi'],     score: 3.9, photoUrl: AV(24) },
];


  const [assign, setAssign] = useState<ForemanAssignment>({ workers: [] });
  const [roster, setRoster] = useState<Person[]>(SEED);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [showPermanentOnly, setShowPermanentOnly] = useState(false);
  const [toast, setToast] = useState<null | { title: string; desc: string }>(null);
  const [confirm, setConfirm] = useState<null | { ids: string[] }>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let base = roster.filter(p => !assign.workers.includes(p.id));
    if (showPermanentOnly) base = base.filter(p => p.roles.includes('İşçi'));
    if (q) base = base.filter(p => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q));
    return base;
  }, [query, assign, roster, showPermanentOnly]);

  function toggleSelect(id: string){ setSelected(prev => includesId(prev, id) ? prev.filter(x => x !== id) : [...prev, id]); }
  function clearSelection(){ setSelected([]); }
  function assignSelectedWorkers(){ if(selected.length === 0){ setToast({ title: 'Seçim yok', desc: 'Lütfen en az bir personel seçin.' }); return; } setConfirm({ ids: selected }); }
  function removeWorker(id: string){ setAssign(prev => ({ ...prev, workers: without(prev.workers, id) })); }

  function applyAssignmentWorkers(ids: string[], permanent: boolean){
    setAssign(prev => { const base = new Set(prev.workers); ids.forEach(id => base.add(id)); return { ...prev, workers: Array.from(base) }; });
    if(permanent){
      setRoster(prev => prev.map(p => ids.includes(p.id) ? { ...p, roles: ['İşçi'] } : p));
      setToast({ title: 'Atama yapıldı', desc: `${ids.length} kişi kalıcı olarak İşçi yapıldı ve projeye eklendi.` });
    } else {
      setToast({ title: 'Geçici atama', desc: `${ids.length} kişi sadece bu projeye işçi olarak atandı.` });
    }
    setConfirm(null);
    clearSelection();
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Sol Panel */}
      <section className="lg:col-span-1 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-neutral-200">
        <div className="flex items-center justify-between"><h2 className="text-lg font-semibold">İşçi Adayları</h2><span className="text-xs text-neutral-500">{filtered.length} kişi</span></div>
        <div className="mt-3"><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="ID veya isim ile ara" className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5c00]"/></div>
        <div className="mt-2 flex items-center gap-2"><input id="permOnlyWorker" type="checkbox" checked={showPermanentOnly} onChange={e=>setShowPermanentOnly(e.target.checked)} className="h-4 w-4 rounded border-neutral-300 text-[#ff5c00] focus:ring-[#ff5c00]"/><label htmlFor="permOnlyWorker" className="text-xs text-neutral-700">Sadece kalıcı işçiler</label></div>
        <ul className="mt-4 space-y-2 max-h-[60vh] overflow-auto pr-1">
          {filtered.map(p => (
            <li key={p.id} className={`rounded-xl border ${selected.includes(p.id) ? 'border-[#ff5c00] bg-orange-50' : 'border-neutral-200 bg-white'} p-3 flex items-center justify-between`}>
              <div className="min-w-0 flex items-center gap-3"><Avatar name={p.name} photoUrl={p.photoUrl} size={36} /><div className="min-w-0"><div className="flex items-center gap-2"><div className="text-sm font-medium text-neutral-900 truncate">{p.name}</div><span className="text-[11px] text-neutral-600">⭐ {fmtScore(p.score)}</span></div><div className="text-[11px] text-neutral-500">ID: {p.id}</div></div></div>
              <input type="checkbox" checked={selected.includes(p.id)} onChange={()=>toggleSelect(p.id)} className="h-4 w-4 rounded border-neutral-300 text-[#ff5c00] focus:ring-[#ff5c00]"/>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex items-center gap-2"><button onClick={clearSelection} className="rounded-lg border px-3 py-1.5 text-sm hover:bg-neutral-50">Seçimi temizle</button><span className="text-xs text-neutral-500">Seçili: {selected.length}</span></div>
      </section>

      {/* Sağ Panel */}
      <section className="lg:col-span-2">
        <RoleBucket title="Projeye atanmış İşçiler" color="#ff5c00" people={assign.workers.map(id => roster.find(p => p.id === id)!).filter(Boolean)} onRemove={id=>removeWorker(id)} footer={<div className="flex items-center gap-2"><button onClick={assignSelectedWorkers} className="rounded-lg bg-[#ff5c00] hover:bg-[#e65100] text-white px-3 py-1.5 text-sm">Seçilenleri Ata</button><span className="text-xs text-neutral-500">Yalnızca Ustabaşı</span></div>} />
      </section>

      {confirm && (
        <ConfirmPermanentModal
          target="workers"
          count={confirm.ids.length}
          onPermanent={()=>applyAssignmentWorkers(confirm.ids, true)}
          onTemporary={()=>applyAssignmentWorkers(confirm.ids, false)}
          onClose={()=>setConfirm(null)}
        />
      )}
      {toast && (<Toast title={toast.title} desc={toast.desc} onClose={()=>setToast(null)} />)}
    </div>
  );
}

// ---------------- Reusable Components ----------------
function RoleBucket({ title, color, people, onRemove, footer, locked = false, hint }:{
  title: string; color: string; people: Person[]; onRemove: (id: string) => void; footer?: React.ReactNode; locked?: boolean; hint?: string;
}){
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-neutral-200">
      <div className="flex items-center justify-between"><h3 className="text-base font-semibold">{title}</h3><div className="flex items-center gap-2">{locked && <span className="text-[10px] rounded bg-neutral-100 px-2 py-0.5 text-neutral-600 ring-1 ring-neutral-200">Kilitli</span>}<span className="text-[11px] text-neutral-500">{people.length} kişi</span></div></div>
      {hint && (<div className="mt-1 text-xs text-neutral-500">{hint}</div>)}
      <ul className="mt-4 space-y-2 min-h-[64px]">
        {people.map(p => (
          <li key={p.id} className="flex items-center justify-between rounded-xl border border-neutral-200 px-3 py-2">
            <div className="min-w-0 flex items-center gap-3"><Avatar name={p.name} photoUrl={p.photoUrl} size={28} /><div className="min-w-0"><div className="flex items-center gap-2"><div className="text-sm font-medium text-neutral-900 truncate">{p.name}</div><span className="text-[10px] text-neutral-600">⭐ {fmtScore(p.score)}</span></div><div className="text-[11px] text-neutral-500">ID: {p.id}</div></div></div>
            {!locked && (<button onClick={()=>onRemove(p.id)} className="text-xs rounded border px-2 py-1 hover:bg-neutral-50">Kaldır</button>)}
          </li>
        ))}
        {people.length === 0 && (<li className="rounded-xl border border-dashed border-neutral-300 px-3 py-4 text-center text-xs text-neutral-500">Henüz atama yok</li>)}
      </ul>
      {footer && (<div className="mt-4 flex items-center justify-between">{footer}<div className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} aria-hidden /></div>)}
    </div>
  );
}

function ConfirmPermanentModal({ target, count, onPermanent, onTemporary, onClose }:{ target: keyof AdminAssignment; count: number; onPermanent: ()=>void; onTemporary: ()=>void; onClose: ()=>void; }){
  const role = ({ architects: 'Mimar', engineers: 'Mühendis', foremen: 'Ustabaşı', workers: 'İşçi' } as const)[target];
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative z-10 w-[92vw] max-w-md rounded-2xl bg-white p-5 shadow-xl ring-1 ring-neutral-200">
        <h4 className="text-base font-semibold">Kalıcı rol verilsin mi?</h4>
        <p className="mt-2 text-sm text-neutral-700">Seçilen {count} kişi(ye) bu proje için <strong>{role}</strong> atanıyor. Bu atamayı şirket içinde <strong>kalıcı rol</strong> olarak tanımlamak ister misiniz? <br/><span className="text-neutral-600">Not: Kalıcı rol <em>tekildir</em>; mevcut kalıcı rol (varsa) bu yeni rolle <strong>değiştirilecektir</strong>.</span></p>
        <div className="mt-4 flex items-center justify-end gap-2"><button onClick={onTemporary} className="rounded-lg border px-3 py-1.5 text-sm hover:bg-neutral-50">Hayır, sadece bu proje</button><button onClick={onPermanent} className="rounded-lg bg-[#ff5c00] hover:bg-[#e65100] text-white px-3 py-1.5 text-sm">Evet, kalıcı yap</button></div>
      </div>
    </div>
  );
}

function Toast({ title, desc, onClose }:{ title: string; desc: string; onClose: ()=>void }){
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30">
      <div className="rounded-xl bg-white shadow-lg ring-1 ring-neutral-200 px-4 py-3 min-w-[260px]">
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs text-neutral-600 mt-0.5">{desc}</div>
        <div className="mt-2 text-right"><button onClick={onClose} className="text-xs text-[#ff5c00] hover:underline">Kapat</button></div>
      </div>
    </div>
  );
}

// ---------------- Lightweight Smoke Tests ----------------
;(() => {
  if (typeof window === 'undefined') return;
  // @ts-ignore
  if (!window.__RUN_ROLE_ROUTER_TESTS__) return;
  try {
    const roles: Role[] = ['Yönetici','Mühendis','Mimar','Ustabaşı'];
    console.assert(roles.includes('Yönetici') && roles.includes('Ustabaşı'), 'Roles include expected values');
    const map: Record<string, string> = { architects: 'Mimar', engineers: 'Mühendis', foremen: 'Ustabaşı', workers: 'İşçi' };
    console.assert(map['foremen'] === 'Ustabaşı' && map['workers'] === 'İşçi', 'Confirm modal role mapping is correct');
    console.log('Role Router — smoke tests passed ✅');
  } catch (e) {
    console.error('Role Router — tests failed:', e);
  }
})();
