import { useEffect, useRef, useState } from "react";
import { Mic, Square, Share2, MessageSquareQuote, Plus, Send, Receipt, ShieldCheck, Trash2, Check, CheckCheck, Play, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type Meeting = { id: number; title: string; date: string; duration: string; summary: string; agreements: string[]; tasks: { text: string; owner: string }[]; open: string[]; keywords: string[]; transcript: { min: string; who: string; text: string }[] };
export type Bill = { id: number; store: string; nit: string; total: number; category: string; date: string; warrantyMonths: number; image?: string | undefined; fileName?: string | undefined };

const money = (n: number) => `$${Math.round(n).toLocaleString("es-CO")}`;
const niceDate = (d: string) => new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${d}T12:00:00`));

export const sampleMeeting = (date: string, duration: string): Meeting => ({
  id: Date.now(), title: "Acuerdo con proveedor · Víctor (Distribuidora del Atrato)", date, duration,
  summary: "Ricardo y Víctor revisaron la propuesta de suministro de papelería e insumos de aseo para la oficina. Se acordó un precio fijo por tres meses, entrega quincenal y pago a 30 días. Quedó pendiente definir el transporte a Istmina.",
  agreements: ["Precio fijo de $1.250.000 mensual durante 3 meses", "Entregas cada quince días, los lunes", "Pago a 30 días por transferencia Bancolombia"],
  tasks: [{ text: "Enviar orden de compra firmada a Víctor", owner: "Ricardo" }, { text: "Mandar catálogo actualizado con precios", owner: "Víctor" }, { text: "Revisar inventario de la oficina antes del lunes", owner: "Ricardo" }],
  open: ["Costo del transporte hasta Istmina", "Descuento por pronto pago"],
  keywords: ["Proveedor", "Papelería", "Precio fijo", "Entrega quincenal", "Pago a 30 días", "Istmina"],
  transcript: [
    { min: "00:00", who: "Ricardo", text: "Buenas tardes, Víctor. Gracias por venir, revisemos la propuesta de suministro." },
    { min: "00:48", who: "Víctor", text: "Con gusto. Les puedo dejar la papelería y el aseo en $1.250.000 al mes, precio fijo por tres meses." },
    { min: "02:10", who: "Ricardo", text: "Me parece bien. ¿Cada cuánto serían las entregas?" },
    { min: "02:35", who: "Víctor", text: "Cada quince días, los lunes en la mañana." },
    { min: "04:05", who: "Ricardo", text: "Nosotros pagamos a 30 días por transferencia Bancolombia. ¿Le sirve?" },
    { min: "04:30", who: "Víctor", text: "Sí, de acuerdo. Le mando el catálogo actualizado con precios esta semana." },
    { min: "06:12", who: "Ricardo", text: "Perfecto, yo le envío la orden de compra firmada. Antes reviso el inventario." },
    { min: "07:40", who: "Víctor", text: "Lo del transporte a Istmina todavía no lo tengo claro, se lo confirmo después." },
    { min: "08:55", who: "Ricardo", text: "Listo. Y miremos si hay descuento por pronto pago más adelante." },
  ],
});

/* ---------------- Reuniones ---------------- */
export function MeetingsView({ meetings, today, onSave, onAddTask, toast }: { meetings: Meeting[]; today: string; onSave: (m: Meeting[]) => void; onAddTask: (t: string) => void; toast: (s: string) => void }) {
  const [state, setState] = useState<"idle" | "rec" | "proc">("idle");
  const [secs, setSecs] = useState(0);
  const [openId, setOpenId] = useState<number | null>(null);
  useEffect(() => { if (state !== "rec") return; const t = setInterval(() => setSecs(s => s + 1), 1000); return () => clearInterval(t); }, [state]);
  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const stop = () => { setState("proc"); const dur = fmt(Math.max(secs, 9 * 60 + 12)); setTimeout(() => { const m = sampleMeeting(today, dur); onSave([m, ...meetings]); setState("idle"); setSecs(0); setOpenId(m.id); toast("Reunión procesada"); }, 2200); };
  const open = meetings.find(m => m.id === openId);
  if (open) return <MeetingDetail m={open} onBack={() => setOpenId(null)} onAddTask={onAddTask} onDelete={() => { onSave(meetings.filter(x => x.id !== open.id)); setOpenId(null); }} toast={toast} />;
  return <>
    <div className="rec-card">
      {state === "proc" ? <><div className="rec-spinner" aria-hidden="true" /><strong>Procesando…</strong><p>Estoy organizando acuerdos, tareas y temas.</p></> : <>
        <button type="button" className={`voice-mic ${state === "rec" ? "listening" : ""}`} aria-label={state === "rec" ? "Detener grabación" : "Grabar nueva reunión"} onClick={() => state === "rec" ? stop() : setState("rec")}><span /><span /><span />{state === "rec" ? <Square /> : <Mic />}</button>
        <strong className="rec-time">{fmt(secs)}</strong>
        {state === "rec" ? <div className="rec-bars" aria-hidden="true">{Array.from({ length: 18 }).map((_, i) => <i key={i} style={{ animationDelay: `${(i % 6) * 0.12}s` }} />)}</div> : <p>Toca para grabar una nueva reunión</p>}
        <Button className="w-full h-12 mt-3" variant={state === "rec" ? "destructive" : "default"} onClick={() => state === "rec" ? stop() : setState("rec")}>{state === "rec" ? <><Square /> Detener</> : <><Mic /> Grabar nueva reunión</>}</Button>
      </>}
    </div>
    <div className="section-heading"><h2>Mis reuniones</h2></div>
    <div className="stack-list">{meetings.map(m => <button type="button" key={m.id} className="meeting-row" onClick={() => setOpenId(m.id)}><span className="quick-icon teal"><Mic /></span><div><strong>{m.title}</strong><small>{niceDate(m.date)} · {m.duration} min · {m.agreements.length} acuerdos</small></div></button>)}</div>
    {!meetings.length && <p className="empty-state">Aún no has grabado reuniones.</p>}
  </>;
}

function MeetingDetail({ m, onBack, onAddTask, onDelete, toast }: { m: Meeting; onBack: () => void; onAddTask: (t: string) => void; onDelete: () => void; toast: (s: string) => void }) {
  const [tab, setTab] = useState("Resumen");
  const [asking, setAsking] = useState(false);
  const [q, setQ] = useState("");
  const [answers, setAnswers] = useState<{ q: string; a: string }[]>([]);
  const acta = `Acta · ${m.title}\n${niceDate(m.date)}\n\nResumen: ${m.summary}\n\nAcuerdos:\n${m.agreements.map(a => `• ${a}`).join("\n")}\n\nTareas:\n${m.tasks.map(t => `• ${t.text} (${t.owner})`).join("\n")}\n\nPendientes:\n${m.open.map(a => `• ${a}`).join("\n")}`;
  const share = async () => { if (navigator.share) { try { await navigator.share({ title: "Acta de reunión", text: acta }); } catch { /* cancelado */ } } else { window.open(`https://wa.me/?text=${encodeURIComponent(acta)}`, "_blank", "noopener,noreferrer"); } };
  const ask = (question: string) => {
    if (!question.trim()) return;
    const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const words = norm(question).split(/\W+/).filter(w => w.length > 3 && !["que", "cual", "cuando", "quien", "como", "sobre", "quedo"].includes(w));
    const scored = m.transcript.map(l => ({ l, s: words.filter(w => norm(l.text).includes(w.slice(0, 5))).length })).sort((a, b) => b.s - a.s);
    const best = scored[0];
    const a = best && best.s > 0 ? `En el minuto ${best.l.min}, ${best.l.who} dijo: "${best.l.text}"` : `No encontré eso exacto. Lo más importante: ${m.agreements[0]} (minuto ${m.transcript[1]?.min ?? "00:00"}).`;
    setAnswers(prev => [...prev, { q: question, a }]); setQ("");
  };
  return <>
    <Button variant="ghost" className="px-1 mb-2 text-primary" onClick={onBack}>← Mis reuniones</Button>
    <h2 className="meeting-title">{m.title}</h2>
    <p className="meeting-meta">{niceDate(m.date)} · {m.duration} min · Ricardo y Víctor</p>
    <div className="finance-tabs">{["Resumen", "Transcripción", "Mapa mental"].map(t => <Button key={t} variant="ghost" className={tab === t ? "active" : ""} onClick={() => setTab(t)}>{t}</Button>)}</div>
    {tab === "Resumen" && <div className="meeting-sections">
      <p className="meeting-summary">{m.summary}</p>
      <h3>Acuerdos</h3><ul>{m.agreements.map(a => <li key={a}><Check className="size-4 text-success" />{a}</li>)}</ul>
      <h3>Tareas asignadas</h3><div className="stack-list">{m.tasks.map(t => <div key={t.text} className="task-assign"><div><strong>{t.text}</strong><small>{t.owner}</small></div><Button size="sm" variant="outline" onClick={() => { onAddTask(t.text); toast("Tarea agregada a tu agenda"); }}><Plus /> Agenda</Button></div>)}</div>
      <h3>Temas inconclusos</h3><ul>{m.open.map(a => <li key={a} className="pending">{a}</li>)}</ul>
      <h3>Palabras clave</h3><div className="chip-row">{m.keywords.map(k => <span key={k} className="keyword">{k}</span>)}</div>
    </div>}
    {tab === "Transcripción" && <div className="transcript">{m.transcript.map(l => <div key={l.min}><span className="mono">{l.min}</span><div><strong className={l.who === "Víctor" ? "other" : ""}>{l.who}</strong><p>{l.text}</p></div></div>)}</div>}
    {tab === "Mapa mental" && <div className="mindmap">
      <div className="mm-center">{m.title.split("·")[0]}</div>
      {[{ t: "Acuerdos", c: "blue", items: m.agreements }, { t: "Tareas", c: "teal", items: m.tasks.map(x => x.text) }, { t: "Pendientes", c: "coral", items: m.open }, { t: "Claves", c: "green", items: m.keywords.slice(0, 4) }].map(b => <div key={b.t} className={`mm-branch ${b.c}`}><strong>{b.t}</strong>{b.items.map(i => <span key={i}>{i}</span>)}</div>)}
    </div>}
    <div className="finance-actions"><Button variant="outline" onClick={share}><Share2 /> Compartir acta</Button><Button onClick={() => setAsking(true)}><MessageSquareQuote /> Pregúntale a la grabación</Button></div>
    {asking && <div className="detail-card">
      <h3>Pregúntale a la grabación</h3>
      <div className="chip-row mb-3">{["¿Cuál fue el precio?", "¿Cada cuánto son las entregas?", "¿Qué pasó con el transporte?"].map(s => <Button key={s} size="sm" variant="outline" className="choice-chip" onClick={() => ask(s)}>{s}</Button>)}</div>
      {answers.map((x, i) => <div key={i} className="rec-answer"><p className="q">{x.q}</p><p>{x.a}</p></div>)}
      <form className="voice-input mt-3" onSubmit={e => { e.preventDefault(); ask(q); }}><Input value={q} onChange={e => setQ(e.target.value)} placeholder="Escribe tu pregunta" /><Button type="submit" size="icon" aria-label="Preguntar"><Send /></Button></form>
    </div>}
    <Button variant="ghost" className="w-full text-destructive" onClick={onDelete}><Trash2 /> Eliminar reunión</Button>
  </>;
}

/* ---------------- Asistente ---------------- */
type AsstData = { name: string; today: string; events: { title: string; date: string; time: string; place: string }[]; tasks: { text: string; done: boolean }[]; movements: { amount: number; category: string; kind: string; date: string }[]; meetings: Meeting[]; debts: { title: string; balance: number; incoming?: boolean }[]; available: number };
export function AssistantView({ d }: { d: AsstData }) {
  const [msgs, setMsgs] = useState<{ me: boolean; text: string }[]>([{ me: false, text: `¡Hola, ${d.name}! Pregúntame por tu agenda, tus gastos o tus reuniones.` }]);
  const [q, setQ] = useState(""); const [typing, setTyping] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, [msgs, typing]);
  const clock = (t: string) => new Date(`2000-01-01T${t}:00`).toLocaleTimeString("es-CO", { hour: "numeric", minute: "2-digit", hour12: true });
  const answer = (raw: string) => {
    const s = raw.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const month = d.today.slice(0, 7);
    if (/usura/.test(s)) return "La tasa de usura es el interés máximo que la ley permite cobrar en Colombia por un crédito. La certifica la Superintendencia Financiera cada mes y equivale a 1,5 veces el interés bancario corriente. Cobrar por encima de ella es un delito, así que revisa que tu tarjeta de crédito y tus préstamos estén por debajo.";
    if (/arriendo|arrendador|yolanda/.test(s)) { const day = Number(d.today.slice(8, 10)); const left = 30 - day; return `Tu arriendo de $850.000 vence el día 30 de este mes${left > 0 ? `, en ${left} día${left === 1 ? "" : "s"}` : left === 0 ? ", es decir, hoy" : ""}. Se le paga a la Sra. Yolanda Mosquera.`; }
    if (/victor/.test(s)) { const m = d.meetings.find(x => /víctor|victor/i.test(x.title)); const ev = d.events.find(e => /víctor|victor/i.test(e.title)); const tk = d.tasks.filter(t => !t.done && /víctor|victor/i.test(t.text)); const parts: string[] = []; if (m) parts.push(`En la reunión del ${niceDate(m.date)} quedaron pendientes: ${m.open.join(" y ")}. Tareas: ${m.tasks.map(t => `${t.text} (${t.owner})`).join("; ")}.`); if (tk.length) parts.push(`En tu agenda tienes: ${tk.map(t => t.text).join(", ")}.`); if (ev) parts.push(`Tu próxima cita con él: ${ev.title}, ${ev.date === d.today ? "hoy" : niceDate(ev.date)} a las ${clock(ev.time)} en ${ev.place}.`); return parts.join(" ") || "No tengo pendientes registrados con Víctor."; }
    if (/gast/.test(s)) { const g = d.movements.filter(m => m.kind === "gasto" && m.date.slice(0, 7) === month); const total = g.reduce((a, m) => a + m.amount, 0); const by: Record<string, number> = {}; g.forEach(m => { by[m.category] = (by[m.category] ?? 0) + m.amount; }); const top = Object.entries(by).sort((a, b) => b[1] - a[1]); return `Este mes llevas ${money(total)} en gastos (${g.length} movimientos).${top[0] ? ` Donde más gastas: ${top.slice(0, 3).map(([c, v]) => `${c} ${money(v)}`).join(", ")}.` : ""} Tienes ${money(d.available)} disponibles.`; }
    if (/hoy|agenda|tengo/.test(s)) { const ev = d.events.filter(e => e.date === d.today).sort((a, b) => a.time.localeCompare(b.time)); const tk = d.tasks.filter(t => !t.done); return `${ev.length ? `Hoy tienes ${ev.length} compromiso${ev.length > 1 ? "s" : ""}: ${ev.map(e => `${e.title} a las ${clock(e.time)} en ${e.place}`).join("; ")}.` : "Hoy no tienes compromisos."} ${tk.length ? `Y ${tk.length} tarea${tk.length > 1 ? "s" : ""} pendiente${tk.length > 1 ? "s" : ""}: ${tk.map(t => t.text).join(", ")}.` : ""}`; }
    if (/debo|deuda|me deben/.test(s)) { return `Debes: ${d.debts.filter(x => !x.incoming).map(x => `${x.title} ${money(x.balance)}`).join(", ")}. Te deben: ${d.debts.filter(x => x.incoming).map(x => `${x.title} ${money(x.balance)}`).join(", ") || "nadie"}.`; }
    if (/disponible|saldo|plata/.test(s)) return `Tienes ${money(d.available)} disponibles entre Bancolombia, Nequi y efectivo.`;
    return "Todavía no sé responder eso. Prueba con tu agenda de hoy, tus gastos del mes, el arriendo, tus deudas o lo pendiente con Víctor.";
  };
  const send = (text: string) => { if (!text.trim() || typing) return; setMsgs(m => [...m, { me: true, text }]); setQ(""); setTyping(true); setTimeout(() => { setMsgs(m => [...m, { me: false, text: answer(text) }]); setTyping(false); }, 700); };
  return <div className="asst">
    <div className="asst-log">{msgs.map((m, i) => <div key={i} className={`asst-msg ${m.me ? "me" : ""}`}>{!m.me && <span className="asst-avatar"><Bot /></span>}<p>{m.text}</p></div>)}{typing && <div className="asst-msg"><span className="asst-avatar"><Bot /></span><p className="typing"><i /><i /><i /></p></div>}<div ref={end} /></div>
    <div className="asst-suggest">{["¿Qué tengo hoy?", "¿Cuánto gasté este mes?", "¿Qué quedó pendiente con Víctor?", "¿Cuándo vence el arriendo?", "¿Qué es la tasa de usura?"].map(s => <button type="button" key={s} onClick={() => send(s)}>{s}</button>)}</div>
    <form className="voice-input" onSubmit={e => { e.preventDefault(); send(q); }}><Input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Escribe tu pregunta" className="h-11" /><Button type="submit" size="icon" className="h-11 w-11" aria-label="Enviar"><Send /></Button></form>
  </div>;
}

/* ---------------- Facturas ---------------- */
export function InvoicesView({ bills, today, onSave, onExpense, toast }: { bills: Bill[]; today: string; onSave: (b: Bill[]) => void; onExpense: (b: Bill) => void; toast: (s: string) => void }) {
  const blank = { store: "", nit: "", total: "", category: "Alimentación", date: today, warranty: "0", asExpense: true, image: undefined as string | undefined, fileName: undefined as string | undefined };
  const [f, setF] = useState(blank);
  const onFile = (file?: File) => { if (!file) return; if (file.size > 2000000) { toast("Elige un archivo de menos de 2 MB"); return; } const r = new FileReader(); r.onload = () => { if (typeof r.result === "string") setF(p => ({ ...p, image: file.type.startsWith("image/") ? r.result as string : undefined, fileName: file.name })); }; r.readAsDataURL(file); };
  const save = () => {
    const total = Number(f.total); if (!f.store.trim()) { toast("Escribe el comercio"); return; } if (!total) { toast("Ingresa el total"); return; }
    const b: Bill = { id: Date.now(), store: f.store.trim(), nit: f.nit.trim(), total, category: f.category, date: f.date, warrantyMonths: Number(f.warranty), image: f.image, fileName: f.fileName };
    onSave([b, ...bills]); if (f.asExpense) onExpense(b); setF(blank); toast(f.asExpense ? "Factura guardada y gasto registrado" : "Factura guardada");
  };
  const until = (b: Bill) => { const d = new Date(`${b.date}T12:00:00`); d.setMonth(d.getMonth() + b.warrantyMonths); return d; };
  return <>
    <div className="detail-card invoice-form">
      <label className="invoice-drop">{f.image ? <img src={f.image} alt="Factura seleccionada" /> : <><Receipt /><span>{f.fileName ?? "Subir foto o archivo"}</span><small>JPG, PNG o PDF · máx. 2 MB</small></>}<input type="file" accept="image/*,.pdf" capture="environment" onChange={e => { onFile(e.target.files?.[0]); e.target.value = ""; }} /></label>
      <div className="modal-form">
        <label>Comercio<Input value={f.store} onChange={e => setF({ ...f, store: e.target.value })} placeholder="Ej. Almacén El Chocoano" /></label>
        <label>NIT<Input value={f.nit} onChange={e => setF({ ...f, nit: e.target.value })} placeholder="Ej. 900.123.456-7" /></label>
        <div className="two-col"><label>Total<Input type="number" inputMode="numeric" value={f.total} onChange={e => setF({ ...f, total: e.target.value })} placeholder="0" /></label><label>Fecha<Input type="date" value={f.date} onChange={e => setF({ ...f, date: e.target.value })} /></label></div>
        <div className="two-col"><label>Categoría<select value={f.category} onChange={e => setF({ ...f, category: e.target.value })}>{["Alimentación", "Hogar", "Transporte", "Tecnología", "Salud", "Otros"].map(c => <option key={c}>{c}</option>)}</select></label><label>Garantía<select value={f.warranty} onChange={e => setF({ ...f, warranty: e.target.value })}>{[["0", "Sin garantía"], ["3", "3 meses"], ["6", "6 meses"], ["12", "1 año"], ["24", "2 años"]].map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label></div>
        <label className="check-inline"><input type="checkbox" checked={f.asExpense} onChange={e => setF({ ...f, asExpense: e.target.checked })} /> Registrar también como gasto</label>
        <Button className="w-full h-12" onClick={save}>Guardar factura <Check /></Button>
      </div>
    </div>
    <div className="section-heading"><h2>Facturas guardadas</h2></div>
    {bills.length ? <div className="bill-grid">{bills.map(b => { const active = b.warrantyMonths > 0 && until(b) >= new Date(); return <div key={b.id} className="bill-card"><div className="bill-thumb">{b.image ? <img src={b.image} alt={`Factura de ${b.store}`} /> : <Receipt />}{b.warrantyMonths > 0 && <span className={`warranty ${active ? "" : "expired"}`}><ShieldCheck />{active ? `Garantía hasta ${new Intl.DateTimeFormat("es-CO", { month: "short", year: "numeric" }).format(until(b))}` : "Garantía vencida"}</span>}</div><strong>{b.store}</strong><small>{b.category} · {niceDate(b.date)}</small>{b.nit && <small>NIT {b.nit}</small>}<b className="mono">{money(b.total)}</b><button type="button" className="bill-del" aria-label={`Eliminar factura de ${b.store}`} onClick={() => onSave(bills.filter(x => x.id !== b.id))}><Trash2 /></button></div>; })}</div> : <p className="empty-state">Aún no tienes facturas guardadas.</p>}
  </>;
}

/* ---------------- WhatsApp ---------------- */
export function WhatsAppView({ name }: { name: string }) {
  return <div className="wa">
    <div className="wa-head"><span className="wa-avatar">A</span><div><strong>AgendIA-UIB</strong><small>en línea</small></div></div>
    <div className="wa-body">
      <span className="wa-day">HOY</span>
      <div className="wa-msg me"><div className="wa-voice"><Play /><div className="wa-wave">{Array.from({ length: 26 }).map((_, i) => <i key={i} style={{ height: `${6 + ((i * 7) % 16)}px` }} />)}</div><small>0:09</small></div><p className="wa-tx">“Pagué 25 mil de mercado por Nequi y recuérdame la reunión con Víctor mañana a las 3 de la tarde”</p><span className="wa-time">6:12 p. m. <CheckCheck /></span></div>
      <div className="wa-msg"><p>¡Listo, {name}! Registré esto:</p><p>🛒 <b>Gasto · Mercado</b><br />$25.000 · Nequi · Alimentación</p><p>📅 <b>Reunión con Víctor</b><br />Mañana · 3:00 p. m. · Alarma 1 hora antes</p><p>Te quedan $572.000 en Nequi.</p><span className="wa-time">6:12 p. m.</span></div>
    </div>
    <div className="wa-input"><span>Mensaje</span><span className="wa-mic"><Mic /></span></div>
    <p className="fine-print">Pantalla de muestra: así funcionará AgendIA-UIB desde WhatsApp.</p>
  </div>;
}
