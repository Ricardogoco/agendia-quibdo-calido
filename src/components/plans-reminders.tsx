import { useEffect, useState } from "react";
import { Bell, BellRing, Lock, X, Check, Crown, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export type Plan = "Gratis" | "Básico" | "Premium";
export type Feature = "presupuestos" | "lectura" | "acuerdos" | "actas" | "whatsapp" | "mapas" | "preguntar" | "reportes" | "negocio";
export const featureInfo: Record<Feature, { label: string; plan: Plan }> = {
  presupuestos: { label: "Presupuestos por categoría", plan: "Básico" }, lectura: { label: "Lectura automática de facturas", plan: "Básico" },
  acuerdos: { label: "Acuerdos de reuniones", plan: "Básico" }, actas: { label: "Actas para compartir", plan: "Básico" }, whatsapp: { label: "AgendIA en WhatsApp", plan: "Básico" },
  mapas: { label: "Mapas mentales", plan: "Premium" }, preguntar: { label: "Preguntar a la grabación", plan: "Premium" }, reportes: { label: "Reportes inteligentes", plan: "Premium" }, negocio: { label: "Modo negocio o fundación", plan: "Premium" },
};
const rank: Record<Plan, number> = { Gratis: 0, "Básico": 1, Premium: 2 };
export const hasFeature = (plan: Plan, f: Feature) => rank[plan] >= rank[featureInfo[f].plan];
export const limits: Record<Plan, { voice: number; questions: number; recordings: number }> = {
  Gratis: { voice: 30, questions: 10, recordings: 1 }, "Básico": { voice: 300, questions: 50, recordings: 10 }, Premium: { voice: Infinity, questions: Infinity, recordings: Infinity },
};
const prices: Record<Plan, { m: number; y: number }> = { Gratis: { m: 0, y: 0 }, "Básico": { m: 19900, y: 199000 }, Premium: { m: 29900, y: 299000 } };
const money = (n: number) => `$${Math.round(n).toLocaleString("es-CO")}`;

export const ALERT_OPTIONS = ["A la hora", "15 min antes", "30 min antes", "1 hora antes", "2 horas antes", "1 día antes", "1 semana antes"];
export const PAY_OPTIONS = [7, 5, 3, 1, 0];
export type AlertCfg = { mode: "Notificación" | "Alarma que suena"; alerts: string[]; repeat: boolean };

export function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return <div className="modal-backdrop" onClick={onClose}><div className="modal-sheet" role="dialog" aria-modal="true" aria-label={title} onClick={e => e.stopPropagation()}><div className="modal-head"><h2>{title}</h2><Button variant="ghost" size="icon" aria-label="Cerrar" onClick={onClose}><X /></Button></div>{children}</div></div>;
}

export function ReminderSheet({ title, subtitle, initial, onSave, onClose, onTest }: { title: string; subtitle: string; initial: AlertCfg; onSave: (c: AlertCfg) => void; onClose: () => void; onTest: () => void }) {
  const [c, setC] = useState<AlertCfg>(initial);
  const toggle = (a: string) => setC(p => ({ ...p, alerts: p.alerts.includes(a) ? p.alerts.filter(x => x !== a) : [...p.alerts, a] }));
  return <Sheet title="Recordatorio" onClose={onClose}>
    <p className="sheet-sub"><strong>{title}</strong><br />{subtitle}</p>
    <label className="sheet-label">Tipo de aviso</label>
    <div className="segmented">{(["Notificación", "Alarma que suena"] as const).map(m => <Button key={m} variant="ghost" className={c.mode === m ? "selected" : ""} onClick={() => setC({ ...c, mode: m })}>{m === "Notificación" ? <Bell /> : <BellRing />}{m}</Button>)}</div>
    <label className="sheet-label">Avisarme</label>
    <div className="chip-row">{ALERT_OPTIONS.map(a => <Button key={a} variant="outline" className={`choice-chip ${c.alerts.includes(a) ? "active" : ""}`} onClick={() => toggle(a)}>{c.alerts.includes(a) && <Check className="size-3" />}{a}</Button>)}</div>
    <div className="setting-toggle mt-4"><span>Repetir cada 5 minutos hasta que lo confirme</span><Switch checked={c.repeat} onCheckedChange={repeat => setC({ ...c, repeat })} /></div>
    <div className="finance-actions"><Button variant="outline" onClick={onTest}><BellRing /> Probar</Button><Button onClick={() => { if (!c.alerts.length) return; onSave(c); }} disabled={!c.alerts.length}>Guardar <Check /></Button></div>
  </Sheet>;
}

export function PaymentReminderSheet({ title, initial, onSave, onClose, onTest }: { title: string; initial: number[]; onSave: (d: number[]) => void; onClose: () => void; onTest: () => void }) {
  const [d, setD] = useState(initial);
  return <Sheet title="Avisos de pago" onClose={onClose}>
    <p className="sheet-sub"><strong>{title}</strong><br />Elige cuántos días antes quieres que te avise.</p>
    <div className="chip-row">{PAY_OPTIONS.map(n => <Button key={n} variant="outline" className={`choice-chip ${d.includes(n) ? "active" : ""}`} onClick={() => setD(p => p.includes(n) ? p.filter(x => x !== n) : [...p, n].sort((a, b) => b - a))}>{d.includes(n) && <Check className="size-3" />}{n === 0 ? "El mismo día" : `${n} día${n > 1 ? "s" : ""} antes`}</Button>)}</div>
    <div className="finance-actions"><Button variant="outline" onClick={onTest}><BellRing /> Probar</Button><Button onClick={() => onSave(d)}>Guardar <Check /></Button></div>
  </Sheet>;
}

export function AlarmScreen({ title, subtitle, onSnooze, onOk }: { title: string; subtitle: string; onSnooze: () => void; onOk: () => void }) {
  useEffect(() => {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const ring = () => [0, 0.25, 0.5].forEach(t => { const o = ctx.createOscillator(); const g = ctx.createGain(); o.type = "sine"; o.frequency.value = t === 0.25 ? 1046 : 880; g.gain.setValueAtTime(0.0001, ctx.currentTime + t); g.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t + 0.22); o.connect(g).connect(ctx.destination); o.start(ctx.currentTime + t); o.stop(ctx.currentTime + t + 0.24); });
    ring(); const iv = setInterval(ring, 1500);
    return () => { clearInterval(iv); void ctx.close(); };
  }, []);
  return <div className="alarm-screen" role="alertdialog" aria-label={`Alarma: ${title}`}>
    <div className="alarm-bell"><BellRing /></div>
    <span className="eyebrow">ES HORA</span>
    <h2>{title}</h2><p>{subtitle}</p>
    <div className="alarm-actions"><Button variant="outline" className="h-12" onClick={onSnooze}>Posponer 5 minutos</Button><Button className="h-12" onClick={onOk}>Entendido</Button></div>
  </div>;
}

export function Locked({ feature, onUpgrade, compact = false }: { feature: Feature; onUpgrade: (f: Feature) => void; compact?: boolean }) {
  const f = featureInfo[feature];
  return <button type="button" className={`locked-card ${compact ? "compact" : ""}`} onClick={() => onUpgrade(feature)}><Lock /><div><strong>{f.label}</strong><small>Disponible desde el plan {f.plan}</small></div><span>Mejorar</span></button>;
}

export function UpgradeSheet({ feature, current, onChoose, onClose }: { feature: Feature | "limite"; current: Plan; onChoose: (p: Plan) => void; onClose: () => void }) {
  const need: Plan = feature === "limite" ? (current === "Gratis" ? "Básico" : "Premium") : featureInfo[feature].plan;
  return <Sheet title="Mejorar plan" onClose={onClose}>
    <div className="upgrade-hero"><Crown /><h3>{feature === "limite" ? "Llegaste al límite de tu plan" : featureInfo[feature].label}</h3><p>{feature === "limite" ? `Tu plan ${current} ya usó todo lo de este periodo.` : `Esta función está incluida desde el plan ${need}.`}</p></div>
    {(["Básico", "Premium"] as Plan[]).filter(p => rank[p] >= rank[need]).map(p => <button key={p} type="button" className="upgrade-option" onClick={() => onChoose(p)}><div><strong>{p}</strong><small>{money(prices[p].m)}/mes · {money(prices[p].y)}/año</small></div><span>Elegir</span></button>)}
    <p className="fine-print">Modo de prueba: al elegir, el plan se activa sin cobro.</p>
  </Sheet>;
}

export function PlansView({ plan, setPlan, usage }: { plan: Plan; setPlan: (p: Plan) => void; usage: { voice: number; questions: number; recordings: number } }) {
  const [yearly, setYearly] = useState(false);
  const L = limits[plan];
  const bars = [{ k: "Comandos de voz este mes", used: usage.voice, max: L.voice }, { k: "Preguntas al asistente hoy", used: usage.questions, max: L.questions }, { k: "Grabaciones este mes", used: usage.recordings, max: L.recordings }];
  const lists: Record<Plan, string[]> = {
    Gratis: ["30 comandos de voz al mes", "10 preguntas al asistente por día", "1 grabación al mes", "Agenda, finanzas y recordatorios"],
    "Básico": ["300 comandos de voz al mes", "50 preguntas al asistente por día", "10 grabaciones al mes", "Presupuestos", "Lectura automática de facturas", "Acuerdos de reuniones y actas", "AgendIA en WhatsApp"],
    Premium: ["Comandos de voz ilimitados", "Preguntas ilimitadas", "Grabaciones ilimitadas", "Todo lo de Básico", "Mapas mentales", "Preguntar a la grabación", "Reportes inteligentes", "Modo negocio o fundación"],
  };
  return <>
    <div className="detail-card"><span className="pill-label">TU USO · PLAN {plan.toUpperCase()}</span>
      {bars.map(b => { const pct = b.max === Infinity ? 8 : Math.min(100, b.used / b.max * 100); return <div key={b.k} className="budget-item"><div><strong>{b.k}</strong><span>{b.used} / {b.max === Infinity ? "ilimitado" : b.max}</span></div><div className="budget-track"><div className={pct >= 90 ? "over" : ""} style={{ width: `${pct}%` }} /></div></div>; })}
    </div>
    <label className="sheet-label">Probar como</label>
    <div className="segmented three">{(["Gratis", "Básico", "Premium"] as Plan[]).map(p => <Button key={p} variant="ghost" className={plan === p ? "selected" : ""} onClick={() => setPlan(p)}>{p}</Button>)}</div>
    <div className="segmented mt-5">{["Mensual", "Anual"].map(t => <Button key={t} variant="ghost" className={(t === "Anual") === yearly ? "selected" : ""} onClick={() => setYearly(t === "Anual")}>{t}{t === "Anual" && <small className="save-tag">Ahorra 2 meses</small>}</Button>)}</div>
    <div className="plan-list">{(["Gratis", "Básico", "Premium"] as Plan[]).map(p => <div key={p} className={`plan-card ${plan === p ? "current" : ""} ${p === "Premium" ? "premium" : ""}`}>
      <div className="plan-top"><h3>{p}</h3>{plan === p && <span className="pill-label">ACTUAL</span>}</div>
      <strong className="plan-price">{money(yearly ? prices[p].y : prices[p].m)}<small>{p === "Gratis" ? "" : yearly ? "/año" : "/mes"}</small></strong>
      <ul>{lists[p].map(i => <li key={i}><Check />{i}</li>)}</ul>
      <Button className="w-full h-11" variant={plan === p ? "outline" : "default"} disabled={plan === p} onClick={() => setPlan(p)}>{plan === p ? "Plan actual" : `Elegir ${p}`}</Button>
    </div>)}</div>
    <p className="fine-print">Modo de prueba: cambiar de plan no genera cobros.</p>
  </>;
}

export function OfflineBanner({ pending }: { pending: number }) {
  return <div className="offline-banner" role="status"><WifiOff /> Sin internet{pending ? ` · ${pending} pendiente${pending > 1 ? "s" : ""}` : ""}</div>;
}
