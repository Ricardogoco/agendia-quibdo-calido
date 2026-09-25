export type VoiceKind = "evento" | "retiro" | "gasto" | "ingreso" | "abono" | "prestamo" | "natillera" | "meta" | "compra" | "tarea";
export type VoiceAction = {
  id: string; kind: VoiceKind; title: string; amount?: number | undefined; method?: string | undefined; person?: string | undefined; category?: string | undefined;
  day?: "hoy" | "manana" | "pasado" | null | undefined; time?: string | undefined; place?: string | undefined; debtId?: number | undefined; newBalance?: number | undefined;
  store?: string | undefined; item?: string | undefined; quota?: number | undefined;
};
export type DebtRef = { id: number; title: string; balance: number; incoming?: boolean };

export const sectionLabel: Record<VoiceKind, string> = {
  evento: "Agenda · Evento", retiro: "Finanzas · Retiro", gasto: "Finanzas · Gasto", ingreso: "Finanzas · Ingreso",
  abono: "Deudas · Abono", prestamo: "Deudas · Me deben", natillera: "Ahorro · Natillera", meta: "Ahorro · Meta nueva",
  compra: "Agenda · Lista de compras", tarea: "Agenda · Tarea",
};

const cap = (s: string) => s.trim().split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
const family: Record<string, string> = { madre: "Mamá", "mamá": "Mamá", mama: "Mamá", mami: "Mamá", padre: "Papá", "papá": "Papá", papa: "Papá", hermano: "Hermano", hermana: "Hermana", hijo: "Hijo", hija: "Hija", esposa: "Esposa", esposo: "Esposo", abuela: "Abuela", abuelo: "Abuelo" };
const numWords: Record<string, number> = { un: 1, una: 1, uno: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10 };
const TIME_RE = /(?:a\s+las?\s+)?(?<![\d.])(\d{1,2})(?::(\d{2}))?\s*(am\b|pm\b|a\.\s?m\.|p\.\s?m\.|de la tarde|de la mañana|de la noche)|a\s+las?\s+(\d{1,2})(?::(\d{2}))?/i;

function parseTime(s: string): { time?: string; rest: string } {
  const m = s.match(TIME_RE);
  if (!m) return { rest: s };
  let h = Number(m[1]! ?? m[4]!); const min = m[2]! ?? m[5]! ?? "00"; const suf = (m[3]! ?? "").toLowerCase().replace(/[\s.]/g, "");
  if ((suf === "pm" || suf.includes("tarde") || suf.includes("noche")) && h < 12) h += 12;
  if (suf === "am" && h === 12) h = 0;
  if (!suf && h >= 1 && h < 7) h += 12;
  return { time: `${String(h).padStart(2, "0")}:${min}`, rest: s.replace(m[0]!, " ") };
}

export function parseAmount(s: string): number | undefined {
  if (/medio\s+palo/i.test(s)) return 500000;
  let m = s.match(/(\d+(?:[.,]\d+)?)\s*(millones|mill[oó]n|palos?)\b/i);
  if (m) return Math.round(parseFloat(m[1]!.replace(",", ".")) * 1_000_000);
  m = s.match(/\b(un|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)\s+(millones|mill[oó]n|palos?)\b/i);
  if (m) return (numWords[m[1]!.toLowerCase()] ?? 1) * 1_000_000;
  m = s.match(/(\d+)\s*mil\b/i);
  if (m) return Number(m[1]!) * 1000;
  m = s.match(/\$?\s*(\d{1,3}(?:\.\d{3})+|\d{4,})/);
  if (m) return Number(m[1]!.replace(/\./g, ""));
  m = s.match(/\$\s*(\d+)/);
  if (m) return Number(m[1]!);
  return undefined;
}

function method(s: string): string | undefined {
  if (/nequi/i.test(s)) return "Nequi";
  if (/bre-?\s?b|llave/i.test(s)) return "Bre-B";
  if (/bancolombia|transferencia/i.test(s)) return "Bancolombia";
  if (/tarjeta/i.test(s)) return "Tarjeta de crédito";
  if (/efectivo/i.test(s)) return "Efectivo";
  return undefined;
}

function category(s: string, person?: string): string {
  if (person && Object.values(family).includes(person)) return "Familia";
  if (/mercado|almuerzo|comida|desayuno|cena|restaurante|legumbr|fruta|pan\b|caf[eé]|onces/i.test(s)) return "Alimentación";
  if (/mototaxi|taxi|bus|transporte|gasolina|pasaje|moto\b|uber/i.test(s)) return "Transporte";
  if (/luz|agua|servicio|gas\b|internet|arriendo|hogar/i.test(s)) return "Hogar";
  return "Otros";
}

function personAfterA(s: string): string | undefined {
  const m = s.match(/\ba\s+(?:mi\s+|la\s+|el\s+)?([A-Za-zÁÉÍÓÚÑáéíóúñ]+)/);
  if (!m) return undefined;
  const w = m[1]!; const f = family[w.toLowerCase()];
  if (f) return f;
  if (/^[A-ZÁÉÍÓÚÑ]/.test(w)) return w;
  return undefined;
}

function dayOf(s: string): VoiceAction["day"] {
  if (/pasado\s+ma[ñn]ana/i.test(s)) return "pasado";
  if (/ma[ñn]ana/i.test(s) && !/de la ma[ñn]ana/i.test(s)) return "manana";
  if (/\bhoy\b|esta (tarde|noche)/i.test(s)) return "hoy";
  return null;
}

export function parseVoice(text: string, debts: DebtRef[]): VoiceAction[] {
  const clean = text.replace(/[.¡!¿?]+$/g, "").replace(/\s+/g, " ").trim();
  const clauses = clean.split(/\s*(?:,|;|\s+y\s+|\s+tambi[eé]n\s+|\s+adem[aá]s\s+)\s*/i).map(c => c.trim()).filter(Boolean);
  const out: VoiceAction[] = [];
  let hadWithdrawal = false; let prevKind: VoiceKind | undefined;
  clauses.forEach((raw, i) => {
    const id = `${Date.now()}-${i}`;
    let c = raw.replace(/^(anota que|recu[eé]rdame que|recu[eé]rdame|necesito que|por favor)\s+/i, "");
    const { time, rest } = parseTime(c);
    const amount = parseAmount(rest);
    let pay = method(c);
    const payFor = () => pay ?? (hadWithdrawal ? "Efectivo" : "Nequi");
    let a: VoiceAction | null = null;

    if (/natillera/i.test(c)) {
      a = { id, kind: "natillera", title: "Cuota de la natillera", amount: amount ?? 20000, method: payFor() };
    } else if (/retir/i.test(c)) {
      a = { id, kind: "retiro", title: "Retiro de efectivo", amount, method: "Bancolombia" };
      hadWithdrawal = true;
    } else if (/ahorr/i.test(c) && amount) {
      const m = c.match(/para\s+(?:la|el|mi|una|un|los|las)?\s*(.+)$/i);
      const name = m ? cap(m[1]!) : "Nueva meta";
      a = { id, kind: "meta", title: name, amount, quota: Math.round(amount / 12) };
    } else if (/prest[eé]/i.test(c)) {
      const m = c.match(/\ba\s+([A-Za-zÁÉÍÓÚÑáéíóúñ]+)/);
      const who = m ? (family[m[1]!.toLowerCase()] ?? cap(m[1]!)) : "Alguien";
      a = { id, kind: "prestamo", title: `${who} me debe`, person: who, amount, method: pay ?? "Nequi" };
    } else if (/abon|cr[eé]dito|deuda|cuota del|tarjeta de cr[eé]dito/i.test(c) && !/^(compr|gast)/i.test(c)) {
      const low = c.toLowerCase();
      const debt = debts.filter(d => !d.incoming).find(d => d.title.toLowerCase().split(/\s+/).filter(w => w.length > 3 && !["crédito", "credito"].includes(w)).some(w => low.includes(w) || low.includes(w.normalize("NFD").replace(/[\u0300-\u036f]/g, "")))) ?? debts.find(d => !d.incoming);
      const p = /tarjeta/i.test(c) && debt?.title.toLowerCase().includes("tarjeta") ? (hadWithdrawal ? "Efectivo" : pay && pay !== "Tarjeta de crédito" ? pay : "Nequi") : payFor();
      a = { id, kind: "abono", title: `Abono a ${debt?.title ?? "deuda"}`, amount, method: p, debtId: debt?.id, newBalance: debt && amount ? Math.max(0, debt.balance - amount) : undefined, category: "Deudas" };
    } else if (/compr/i.test(c) && !amount) {
      const m = c.match(/compr\w*\s*(.*?)\s*\ben\s+(?:la|el|los|las)\s+(.+)$/i);
      const store = m ? cap(m[2]!) : "Mi lista";
      const item = m ? m[1]!.trim() : c.replace(/^.*?compr\w*\s*/i, "").trim();
      a = { id, kind: "compra", title: `Lista ${store}`, store, item };
    } else if (!amount && (time || /reuni[oó]n|cita|programar|agendar|evento|fiesta|visita|encuentro/i.test(c))) {
      const withM = c.match(/con\s+(?:el\s+|la\s+)?([A-ZÁÉÍÓÚÑ][A-Za-zÁÉÍÓÚÑáéíóúñ]+)/);
      const typeM = c.match(/(reuni[oó]n|cita|visita|fiesta|evento)/i);
      const kindWord = typeM ? cap(typeM[1]!.toLowerCase().replace("reunion", "reunión")) : "Compromiso";
      const title = withM ? `${kindWord} con ${withM[1]!}` : kindWord;
      const pm = rest.match(/\ben\s+(?:el|la|los|las)?\s*(.+?)\s*(?:\b(?:hoy|ma[ñn]ana|pasado)\b.*)?$/i);
      const place = pm ? cap(pm[1]!) : undefined;
      a = { id, kind: "evento", title, time: time ?? "09:00", place, day: dayOf(c) };
    } else if (/recib|me pagaron|me consignaron|cobr[eé]|ingres|me entr/i.test(c) || (amount && !/pag|gast|compr/i.test(c) && prevKind === "ingreso")) {
      a = { id, kind: "ingreso", title: "Ingreso", amount, method: pay ?? "Bancolombia", category: "Trabajo" };
    } else if (amount) {
      const person = personAfterA(c);
      const m = c.match(/\b(?:de|en)\s+(?:el\s+|la\s+|un\s+|una\s+)?([A-Za-zÁÉÍÓÚÑáéíóúñ]+)/);
      const what = m && !/^(nequi|efectivo|tarjeta|bancolombia)$/i.test(m[1]!) ? cap(m[1]!.toLowerCase()) : undefined;
      const title = person ? `Pago a ${person}` : what ?? "Gasto";
      if (!pay && /tarjeta/i.test(c)) pay = "Tarjeta de crédito";
      a = { id, kind: "gasto", title, amount, person, method: payFor(), category: category(c, person) };
    } else if (c.length > 2) {
      a = { id, kind: "tarea", title: cap(c.charAt(0) + c.slice(1)) };
    }
    if (a) { out.push(a); prevKind = a.kind; }
  });
  return out;
}
