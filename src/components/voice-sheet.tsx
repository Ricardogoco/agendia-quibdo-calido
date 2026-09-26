import { useEffect, useRef, useState } from "react";
import {
  Mic,
  X,
  RotateCcw,
  Check,
  CalendarDays,
  Wallet,
  ShoppingBasket,
  PiggyBank,
  HandCoins,
  ListTodo,
  Banknote,
  ArrowDownLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  needsMethod,
  parseVoice,
  paymentMethods,
  sectionLabel,
  type DebtRef,
  type VoiceAction,
} from "@/lib/voice-parser";

const examples = [
  "Anota que debo programar una reunión con Víctor a las 3 pm en el salón Fiama",
  "Debo retirar 500.000 y pagarle 30.000 a mi madre, abonar 50.000 al crédito del teléfono",
  "Necesito comprar en la legumbrería",
  "Pagué 25 mil de mercado por Nequi",
  "Pagué la cuota de la natillera",
  "Le presté 200 mil a Andrés por Bre-B",
  "Quiero ahorrar 2 millones para la moto",
  "Gasté 18 mil en almuerzo y 12 mil en mototaxi",
];
const icons = {
  evento: CalendarDays,
  retiro: Banknote,
  gasto: Wallet,
  ingreso: ArrowDownLeft,
  abono: HandCoins,
  prestamo: HandCoins,
  natillera: PiggyBank,
  meta: PiggyBank,
  compra: ShoppingBasket,
  tarea: ListTodo,
};
const money = (n: number) => `$${Math.round(n).toLocaleString("es-CO")}`;
const clock = (t: string) =>
  new Date(`2000-01-01T${t}:00`)
    .toLocaleTimeString("es-CO", { hour: "numeric", minute: "2-digit", hour12: true })
    .toLowerCase();
const dayText = { hoy: "Hoy", manana: "Mañana", pasado: "Pasado mañana" } as const;
const moneyKinds = ["gasto", "retiro", "abono", "prestamo", "meta", "ingreso", "natillera"];
const methodLabel = (m: string) =>
  m === "Bre-B" ? "Bancolombia · Bre-B" : m === "Tarjeta de crédito" ? "Tarjeta" : m;

export function VoiceSheet({
  debts,
  natilleraQuota,
  onClose,
  onSave,
}: {
  debts: DebtRef[];
  natilleraQuota?: number | undefined;
  onClose: () => void;
  onSave: (a: VoiceAction[]) => void;
}) {
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const [actions, setActions] = useState<VoiceAction[] | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearInterval(timer.current);
    },
    [],
  );

  const understand = (phrase: string) => {
    if (phrase.trim()) setActions(parseVoice(phrase, debts, { natilleraQuota }));
  };
  const dictate = (phrase: string) => {
    if (timer.current) clearInterval(timer.current);
    setActions(null);
    setText("");
    setTyping(true);
    let i = 0;
    timer.current = setInterval(() => {
      i++;
      setText(phrase.slice(0, i));
      if (i >= phrase.length) {
        if (timer.current) clearInterval(timer.current);
        setTyping(false);
        setTimeout(() => understand(phrase), 350);
      }
    }, 32);
  };
  const micTap = () => {
    if (typing) return;
    dictate(text.trim() || examples[Math.floor(Math.random() * examples.length)]!);
  };
  const patch = (id: string, p: Partial<VoiceAction>) =>
    setActions((a) => a?.map((x) => (x.id === id ? { ...x, ...p } : x)) ?? null);
  const pending = actions?.some(
    (a) =>
      (a.kind === "evento" && !a.day) ||
      (a.kind === "compra" && !a.item?.trim()) ||
      (moneyKinds.includes(a.kind) && !a.amount) ||
      (needsMethod(a) && !a.method),
  );

  const facts = (a: VoiceAction) => {
    const f: [string, string][] = [["Sección", sectionLabel[a.kind]]];
    if (a.amount) f.push(["Monto", money(a.amount)]);
    if (a.person) f.push(["Persona", a.person]);
    if (a.category && a.kind === "gasto") f.push(["Categoría", a.category]);
    if (a.method) f.push(["Forma de pago", methodLabel(a.method)]);
    if (a.day) f.push(["Fecha", dayText[a.day]]);
    if (a.time && a.kind === "evento") f.push(["Hora", clock(a.time)]);
    if (a.place) f.push(["Lugar", a.place]);
    if (a.newBalance !== undefined) f.push(["Saldo queda en", money(a.newBalance)]);
    if (a.quota) f.push(["Cuota por quincena", `${money(a.quota)} · 6 meses`]);
    if (a.kind === "retiro" || a.kind === "natillera") f.push(["Nota", "No cuenta como gasto"]);
    return f;
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-sheet voice-sheet"
        role="dialog"
        aria-modal="true"
        aria-label="Dime qué hacer"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <h2>Dime qué hacer</h2>
          <Button variant="ghost" size="icon" aria-label="Cerrar" onClick={onClose}>
            <X />
          </Button>
        </div>
        {!actions ? (
          <>
            <div className="voice-mic-wrap">
              <button
                type="button"
                className={`voice-mic ${typing ? "listening" : ""}`}
                aria-label="Dictar"
                onClick={micTap}
              >
                <span />
                <span />
                <span />
                <Mic />
              </button>
              <p>{typing ? "Te escucho…" : "Toca el micrófono y habla, o escribe abajo"}</p>
            </div>
            <div className="voice-input">
              <Input
                value={text}
                placeholder="Ej: Pagué 25 mil de mercado por Nequi"
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && understand(text)}
                className="h-12"
              />
              <Button
                className="h-12"
                disabled={!text.trim() || typing}
                onClick={() => understand(text)}
              >
                Entender
              </Button>
            </div>
            <span className="eyebrow voice-eyebrow">PRUEBA DECIR</span>
            <div className="voice-examples">
              {examples.map((e) => (
                <button type="button" key={e} onClick={() => dictate(e)}>
                  “{e}”
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <p className="voice-heard">“{text}”</p>
            <span className="eyebrow voice-eyebrow">ESTO ENTENDÍ</span>
            <div className="voice-actions">
              {actions.map((a) => {
                const Icon = icons[a.kind];
                return (
                  <div className={`voice-card ${a.kind}`} key={a.id}>
                    <div className="voice-card-head">
                      <span className="voice-card-icon">
                        <Icon />
                      </span>
                      <strong>{a.title}</strong>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Quitar ${a.title}`}
                        onClick={() => setActions(actions.filter((x) => x.id !== a.id))}
                      >
                        <X />
                      </Button>
                    </div>
                    <dl>
                      {facts(a).map(([k, v]) => (
                        <div key={k}>
                          <dt>{k}</dt>
                          <dd>{v}</dd>
                        </div>
                      ))}
                    </dl>
                    {a.kind === "evento" && !a.day && (
                      <div className="voice-ask">
                        <p>¿Qué día?</p>
                        <div>
                          {(["hoy", "manana", "pasado"] as const).map((d) => (
                            <Button
                              key={d}
                              variant="outline"
                              onClick={() => patch(a.id, { day: d })}
                            >
                              {dayText[d]}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                    {a.kind === "compra" && (
                      <div className="voice-ask">
                        <p>¿Qué vas a comprar?</p>
                        <Input
                          value={a.item ?? ""}
                          placeholder="Ej: tomate, cebolla y cilantro"
                          onChange={(e) => patch(a.id, { item: e.target.value })}
                          className="h-11"
                        />
                      </div>
                    )}
                    {moneyKinds.includes(a.kind) && !a.amount && (
                      <div className="voice-ask">
                        <p>¿De cuánto?</p>
                        <Input
                          inputMode="numeric"
                          placeholder="Ej: 50000"
                          onChange={(e) => {
                            const n = Number(e.target.value.replace(/\D/g, ""));
                            patch(a.id, {
                              amount: n || undefined,
                              quota: a.kind === "meta" && n ? Math.round(n / 12) : a.quota,
                            });
                          }}
                          className="h-11"
                        />
                      </div>
                    )}
                    {needsMethod(a) && !a.method && (
                      <div className="voice-ask">
                        <p>{a.kind === "ingreso" ? "¿Dónde lo recibiste?" : "¿Cómo pagaste?"}</p>
                        <div>
                          {paymentMethods
                            .filter((m) => a.kind !== "ingreso" || m !== "Tarjeta de crédito")
                            .map((m) => (
                              <Button
                                key={m}
                                variant="outline"
                                onClick={() => patch(a.id, { method: m })}
                              >
                                {m === "Tarjeta de crédito" ? "Tarjeta" : m}
                              </Button>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              {!actions.length && (
                <p className="empty-state">
                  No quedó nada por guardar. Toca Repetir para intentarlo de nuevo.
                </p>
              )}
            </div>
            <div className="voice-footer">
              <Button
                variant="outline"
                className="h-12"
                onClick={() => {
                  setActions(null);
                  setText("");
                }}
              >
                <RotateCcw /> Repetir
              </Button>
              <Button
                className="h-12"
                disabled={!actions.length || !!pending}
                onClick={() => onSave(actions)}
              >
                <Check /> Guardar
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
