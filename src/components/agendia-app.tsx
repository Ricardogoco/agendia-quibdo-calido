import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  CalendarDays,
  Wallet,
  Mic,
  Menu,
  MapPin,
  Bell,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronRight,
  Plus,
  RefreshCw,
  Bookmark,
  Share2,
  Video,
  Bot,
  Receipt,
  MessageCircle,
  CreditCard,
  Settings,
  Moon,
  Sun,
  Check,
  ShoppingBasket,
  Clock3,
  TrendingUp,
  TrendingDown,
  Pencil,
  X,
  Send,
  Trash2,
  CircleDollarSign,
  PiggyBank,
  Home,
  ChevronLeft,
  NotebookPen,
  ClipboardList,
  Target,
  Coins,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import mark from "@/assets/agendia-mark.webp";
import logo from "@/assets/agendia-logo.webp";
import { VoiceSheet } from "@/components/voice-sheet";
import type { VoiceAction } from "@/lib/voice-parser";
import {
  ReminderSheet,
  PaymentReminderSheet,
  AlarmScreen,
  UpgradeSheet,
  PlansView,
  OfflineBanner,
  Locked,
  hasFeature,
  limits,
  type Plan,
  type Feature,
  type AlertCfg,
} from "@/components/plans-reminders";
import {
  MeetingsView,
  AssistantView,
  InvoicesView,
  WhatsAppView,
  sampleMeeting,
  type Meeting,
  type Bill,
} from "@/components/more-views";

type View =
  | "inicio"
  | "agenda"
  | "finanzas"
  | "mas"
  | "reuniones"
  | "asistente"
  | "facturas"
  | "whatsapp"
  | "planes"
  | "ajustes"
  | "notas"
  | "pqrs";
type Event = {
  id: number;
  title: string;
  date: string;
  time: string;
  place: string;
  reminder: string;
};
type Movement = {
  id: number;
  title: string;
  amount: number;
  method: string;
  category: string;
  kind: "ingreso" | "gasto" | "retiro" | "prestamo";
  date: string;
};
type DebtItem = {
  id: number;
  title: string;
  detail: string;
  balance: number;
  original: number;
  incoming?: boolean;
};
type Goal = { id: number; name: string; target: number; saved: number; quota: number };
type Note = { id: number; title: string; body: string; updatedAt: string };
type Pqrs = {
  id: number;
  type: "Petición" | "Queja" | "Reclamo" | "Sugerencia";
  subject: string;
  message: string;
  contact: string;
  createdAt: string;
};
type SavingsContribution = {
  id: number;
  goalId: number;
  amount: number;
  method: string;
  date: string;
};
type StoredFile = { name: string; url: string };
type AppData = {
  name: string;
  tone: string;
  categories: string[];
  frequency: string;
  dark: boolean;
  offline: boolean;
  onboarded: boolean;
  reminders: string;
  events: Event[];
  tasks: { id: number; text: string; done: boolean }[];
  groceries: { id: number; store: string; item: string; done: boolean }[];
  movements: Movement[];
  quoteQueue: number[];
  quoteIndex: number;
  lastQuoteAt: number;
  savedQuotes: number[];
  recordings: StoredFile[];
  invoices: StoredFile[];
  natilleraPayments: number;
  debts: DebtItem[];
  goals: Goal[];
  notes: Note[];
  pqrs: Pqrs[];
  savingsContributions: SavingsContribution[];
  meetings: Meeting[];
  bills: Bill[];
  plan: Plan;
  usage: { voice: number; questions: number; recordings: number };
  pendingSync: number;
  eventAlerts: Record<number, AlertCfg>;
  payAlerts: number[];
};
const today = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
const addDays = (date: string, n: number) => {
  const d = new Date(`${date}T12:00:00`);
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const money = (n: number) => `$${Math.round(n).toLocaleString("es-CO")}`;
const clock = (time: string) =>
  new Date(`2000-01-01T${time}:00`)
    .toLocaleTimeString("es-CO", { hour: "numeric", minute: "2-digit", hour12: true })
    .toLowerCase();
const formatDate = (date: string, options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("es-CO", { timeZone: "America/Bogota", ...options }).format(
    new Date(`${date}T12:00:00`),
  );
const initialData = (): AppData => ({
  name: "Ricardo",
  tone: "Cercano",
  categories: ["Finanzas", "Bíblicas", "Filosofía"],
  frequency: "Una vez al día",
  dark: false,
  offline: false,
  onboarded: false,
  reminders: "1 día, 1 hora y 15 min antes",
  events: [
    {
      id: 1,
      title: "Reunión con Víctor",
      date: today(),
      time: "15:00",
      place: "Salón Fiama",
      reminder: "1 día, 1 hora y 15 min antes",
    },
    {
      id: 2,
      title: "Fiestas de San Pacho con la familia",
      date: addDays(today(), 2),
      time: "17:00",
      place: "Malecón de Quibdó",
      reminder: "1 día antes",
    },
  ],
  tasks: [
    { id: 1, text: "Revisar propuesta para Víctor", done: false },
    { id: 2, text: "Llamar a Juan Carlos", done: false },
    { id: 3, text: "Organizar documentos", done: true },
  ],
  groceries: [
    { id: 1, store: "Supermercado", item: "Arroz y aceite", done: false },
    { id: 2, store: "Plaza de mercado", item: "Frutas y verduras", done: false },
  ],
  movements: [
    {
      id: 1,
      title: "Pago de proyecto",
      amount: 3200000,
      method: "Bancolombia",
      category: "Trabajo",
      kind: "ingreso",
      date: today(),
    },
    {
      id: 2,
      title: "Mercado de la semana",
      amount: 185000,
      method: "Nequi",
      category: "Alimentación",
      kind: "gasto",
      date: today(),
    },
    {
      id: 3,
      title: "Transporte",
      amount: 68000,
      method: "Bre-B",
      category: "Transporte",
      kind: "gasto",
      date: today(),
    },
    {
      id: 4,
      title: "Servicios del hogar",
      amount: 312000,
      method: "Bancolombia",
      category: "Hogar",
      kind: "gasto",
      date: addDays(today(), -1),
    },
    {
      id: 5,
      title: "Café de la tarde",
      amount: 16000,
      method: "Efectivo",
      category: "Otros",
      kind: "gasto",
      date: addDays(today(), -1),
    },
  ],
  quoteQueue: [],
  quoteIndex: 0,
  lastQuoteAt: Date.now(),
  savedQuotes: [],
  recordings: [],
  invoices: [],
  natilleraPayments: 0,
  debts: [
    {
      id: 1,
      title: "Crédito del teléfono",
      detail: "Cuota mensual · $100.000",
      balance: 400000,
      original: 1000000,
    },
    {
      id: 2,
      title: "Tarjeta de crédito",
      detail: "Pago pendiente",
      balance: 650000,
      original: 1000000,
    },
    {
      id: 3,
      title: "Juan Carlos",
      detail: "Préstamo personal",
      balance: 100000,
      original: 100000,
      incoming: true,
    },
  ],
  goals: [
    { id: 1, name: "Moto nueva", target: 4000000, saved: 1000000, quota: 125000 },
    { id: 2, name: "Fondo de emergencias", target: 2000000, saved: 500000, quota: 62500 },
  ],
  meetings: [{ ...sampleMeeting(addDays(today(), -3), "09:12"), id: 1 }],
  bills: [],
  notes: [],
  pqrs: [],
  savingsContributions: [],
  plan: "Gratis",
  usage: { voice: 4, questions: 2, recordings: 0 },
  pendingSync: 0,
  eventAlerts: {},
  payAlerts: [7, 3, 1, 0],
});
const quotes = [
  {
    text: "Encomienda a Jehová tus obras, y tus pensamientos serán afirmados.",
    author: "Proverbios 16:3 · Reina-Valera 1909",
    category: "Bíblicas",
  },
  {
    text: "Jehová es mi pastor; nada me faltará.",
    author: "Salmos 23:1 · Reina-Valera 1909",
    category: "Bíblicas",
  },
  {
    text: "No ahorres lo que queda después de gastar; gasta lo que queda después de ahorrar.",
    author: "Warren Buffett",
    category: "Finanzas",
  },
  { text: "Cuentas claras, amistades largas.", author: "Refrán popular", category: "Finanzas" },
  {
    text: "No es que tengamos poco tiempo, sino que perdemos mucho.",
    author: "Séneca",
    category: "Filosofía",
  },
  { text: "Nadie se baña dos veces en el mismo río.", author: "Heráclito", category: "Filosofía" },
];
const paths: Record<View, string> = {
  inicio: "/",
  agenda: "/agenda",
  finanzas: "/finanzas",
  mas: "/mas",
  reuniones: "/reuniones",
  asistente: "/asistente",
  facturas: "/facturas",
  whatsapp: "/whatsapp",
  planes: "/planes",
  ajustes: "/ajustes",
  notas: "/notas",
  pqrs: "/pqrs",
};
const moreItems = [
  {
    view: "notas" as View,
    label: "Bloc de notas",
    icon: NotebookPen,
    detail: "Ideas y apuntes al instante",
  },
  {
    view: "reuniones" as View,
    label: "Reuniones",
    icon: Video,
    detail: "Graba y organiza tus encuentros",
  },
  {
    view: "asistente" as View,
    label: "Asistente",
    icon: Bot,
    detail: "Una mano con tus pendientes",
  },
  {
    view: "facturas" as View,
    label: "Facturas",
    icon: Receipt,
    detail: "Tus comprobantes en un lugar",
  },
  {
    view: "whatsapp" as View,
    label: "WhatsApp",
    icon: MessageCircle,
    detail: "Comparte tus recordatorios",
  },
  {
    view: "pqrs" as View,
    label: "PQRS",
    icon: ClipboardList,
    detail: "Peticiones, quejas, reclamos y sugerencias",
  },
  { view: "planes" as View, label: "Planes", icon: CreditCard, detail: "Tu espacio, a tu ritmo" },
  { view: "ajustes" as View, label: "Ajustes", icon: Settings, detail: "Hazla tuya" },
];

function SectionTitle({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="section-heading">
      <h2>{title}</h2>
      {action && (
        <Button variant="ghost" className="text-primary h-8 px-1" onClick={onAction}>
          {action}
          <ChevronRight />
        </Button>
      )}
    </div>
  );
}
function BrandCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`brand-card ${className}`}>
      <div className="brand-wave" aria-hidden="true" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
function Empty({ children }: { children: React.ReactNode }) {
  return <p className="empty-state">{children}</p>;
}

export function AgendiaApp({ view }: { view: View }) {
  const navigate = useNavigate();
  const [data, setData] = useState<AppData>(initialData);
  const [ready, setReady] = useState(false);
  const [selectedDate, setSelectedDate] = useState(today());
  const [financeTab, setFinanceTab] = useState("Gastos");
  const [noteDraft, setNoteDraft] = useState<{
    id: number | null;
    title: string;
    body: string;
  } | null>(null);
  const [goalDraft, setGoalDraft] = useState<{
    name: string;
    target: string;
    amount: string;
    method: string;
  } | null>(null);
  const [contributionDraft, setContributionDraft] = useState<{
    goalId: number;
    amount: string;
    method: string;
  } | null>(null);
  const [pqrsDraft, setPqrsDraft] = useState({
    type: "Petición" as Pqrs["type"],
    subject: "",
    message: "",
    contact: "",
  });
  const [dialog, setDialog] = useState<
    "evento" | "gasto" | "ingreso" | "tarea" | "compra" | "voz" | null
  >(null);
  const [form, setForm] = useState({
    title: "",
    amount: "",
    date: today(),
    time: "15:00",
    place: "",
    method: "Nequi",
    category: "Alimentación",
    store: "",
  });
  const [toast, setToast] = useState("");
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [undo, setUndo] = useState<{ snapshot: AppData; message: string } | null>(null);
  useEffect(() => {
    if (!undo) return;
    const t = setTimeout(() => setUndo(null), 10000);
    return () => clearTimeout(t);
  }, [undo]);
  const [reminderFor, setReminderFor] = useState<number | "arriendo" | null>(null);
  const [alarm, setAlarm] = useState<{ title: string; subtitle: string } | null>(null);
  const [upgrade, setUpgrade] = useState<Feature | "limite" | null>(null);
  const [listening, setListening] = useState(false);
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);
  useEffect(() => {
    try {
      const stored = localStorage.getItem("agendia-data-v1");
      if (stored) {
        const saved = { ...initialData(), ...JSON.parse(stored) } as AppData;
        const elapsed = Date.now() - saved.lastQuoteAt;
        const shouldChange =
          saved.frequency === "Cada vez que abro la app" ||
          (saved.frequency === "Cada 6 horas" && elapsed >= 21600000) ||
          (saved.frequency === "Una vez al día" && elapsed >= 86400000);
        if (shouldChange) {
          const eligible = quotes
            .map((q, i) => (saved.categories.includes(q.category) ? i : -1))
            .filter((i) => i >= 0);
          const remaining = saved.quoteQueue.filter((i) => eligible.includes(i));
          const queue = remaining.length
            ? remaining
            : [...eligible].filter((i) => i !== saved.quoteIndex).sort(() => Math.random() - 0.5);
          const next = queue[0];
          if (next !== undefined) {
            saved.quoteIndex = next;
            saved.quoteQueue = queue.slice(1);
            saved.lastQuoteAt = Date.now();
          }
        }
        setData(saved);
      }
    } catch {
      /* Datos guardados ilegibles o almacenamiento bloqueado: se usan los datos iniciales. */
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) {
      try {
        localStorage.setItem("agendia-data-v1", JSON.stringify(data));
      } catch {
        setToast("Espacio lleno: no se pudo guardar este archivo.");
      }
    }
    document.documentElement.classList.toggle("dark", data.dark);
  }, [data, ready]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(t);
  }, [toast]);
  const update = (patch: Partial<AppData>) => setData((prev) => ({ ...prev, ...patch }));
  const go = (v: View) => navigate({ to: paths[v] });
  const openDialog = (type: typeof dialog) => {
    setForm({
      title: "",
      amount: "",
      date: today(),
      time: "15:00",
      place: "",
      method: "Nequi",
      category: "Alimentación",
      store: "",
    });
    setDialog(type);
  };
  const submit = () => {
    if (!dialog || (!form.title.trim() && dialog !== "voz")) {
      setToast("Escribe un nombre para continuar");
      return;
    }
    const id = Date.now();
    if (dialog === "evento")
      update({
        events: [
          ...data.events,
          {
            id,
            title: form.title,
            date: form.date,
            time: form.time,
            place: form.place || "Sin lugar",
            reminder: data.reminders,
          },
        ],
      });
    if (dialog === "tarea")
      update({ tasks: [...data.tasks, { id, text: form.title, done: false }] });
    if (dialog === "compra")
      update({
        groceries: [
          ...data.groceries,
          { id, store: form.store || "Mi lista", item: form.title, done: false },
        ],
      });
    if (dialog === "gasto" || dialog === "ingreso") {
      const amount = Number(form.amount);
      if (!amount || amount < 0) {
        setToast("Ingresa un monto válido");
        return;
      }
      update({
        movements: [
          {
            id,
            title: form.title,
            amount,
            method: form.method,
            category: dialog === "ingreso" ? "Trabajo" : form.category,
            kind: dialog,
            date: form.date,
          },
          ...data.movements,
        ],
      });
    }
    setDialog(null);
    setToast("¡Listo! Quedó guardado.");
  };
  const saveVoice = (actions: VoiceAction[]) => {
    const snapshot = data;
    const base = Date.now();
    const d = {
      ...data,
      events: [...data.events],
      groceries: [...data.groceries],
      tasks: [...data.tasks],
      movements: [...data.movements],
      debts: [...data.debts],
      goals: [...data.goals],
    };
    const dayDate = (k?: string | null) =>
      addDays(today(), k === "manana" ? 1 : k === "pasado" ? 2 : 0);
    actions.forEach((a, i) => {
      const id = base + i;
      const mv = (kind: Movement["kind"], category: string) =>
        d.movements.unshift({
          id,
          title: a.title,
          amount: a.amount ?? 0,
          method: a.method ?? "Nequi",
          category,
          kind,
          date: today(),
        });
      if (a.kind === "evento")
        d.events.push({
          id,
          title: a.title,
          date: dayDate(a.day),
          time: a.time ?? "09:00",
          place: a.place ?? "Sin lugar",
          reminder: d.reminders,
        });
      if (a.kind === "tarea") d.tasks.push({ id, text: a.title, done: false });
      if (a.kind === "compra")
        (a.item ?? "")
          .split(/,| y /)
          .map((x) => x.trim())
          .filter(Boolean)
          .forEach((item, j) =>
            d.groceries.push({
              id: id * 10 + j,
              store: a.store ?? "Mi lista",
              item: item.charAt(0).toUpperCase() + item.slice(1),
              done: false,
            }),
          );
      if (a.kind === "gasto") mv("gasto", a.category ?? "Otros");
      if (a.kind === "ingreso") mv("ingreso", a.category ?? "Trabajo");
      if (a.kind === "retiro") mv("retiro", "Retiro");
      if (a.kind === "abono") {
        mv("gasto", "Deudas");
        d.debts = d.debts.map((x) =>
          x.id === a.debtId ? { ...x, balance: Math.max(0, x.balance - (a.amount ?? 0)) } : x,
        );
      }
      if (a.kind === "prestamo") {
        mv("prestamo", "Préstamo");
        const ex = d.debts.find(
          (x) => x.incoming && x.title.toLowerCase() === (a.person ?? "").toLowerCase(),
        );
        d.debts = ex
          ? d.debts.map((x) =>
              x === ex
                ? {
                    ...x,
                    balance: x.balance + (a.amount ?? 0),
                    original: x.original + (a.amount ?? 0),
                  }
                : x,
            )
          : [
              ...d.debts,
              {
                id,
                title: a.person ?? "Alguien",
                detail: `Préstamo por ${a.method === "Bre-B" ? "Bre-B" : a.method}`,
                balance: a.amount ?? 0,
                original: a.amount ?? 0,
                incoming: true,
              },
            ];
      }
      if (a.kind === "natillera") d.natilleraPayments += 1;
      if (a.kind === "meta")
        d.goals.push({ id, name: a.title, target: a.amount ?? 0, saved: 0, quota: a.quota ?? 0 });
    });
    setData(d);
    setVoiceOpen(false);
    setToast("");
    setUndo({
      snapshot,
      message:
        actions.length === 1
          ? "¡Listo! Quedó guardado."
          : `¡Listo! Guardé ${actions.length} acciones.`,
    });
  };
  const saveGoal = () => {
    if (!goalDraft) return;
    const amount = Number(goalDraft.amount),
      target = Number(goalDraft.target);
    if (
      !goalDraft.name.trim() ||
      !Number.isSafeInteger(target) ||
      target <= 0 ||
      !Number.isSafeInteger(amount) ||
      amount < 0 ||
      amount > target
    ) {
      setToast("Escribe un motivo, una meta válida y un aporte inicial no mayor a la meta");
      return;
    }
    const id = Date.now();
    setData((p) => ({
      ...p,
      goals: [
        ...p.goals,
        {
          id,
          name: goalDraft.name.trim().slice(0, 80),
          target,
          saved: amount,
          quota: Math.ceil((target - amount) / 12),
        },
      ],
      savingsContributions: amount
        ? [
            { id, goalId: id, amount, method: goalDraft.method, date: today() },
            ...p.savingsContributions,
          ]
        : p.savingsContributions,
    }));
    setGoalDraft(null);
    setToast("Nuevo motivo de ahorro guardado");
  };
  const contribute = (goalId: number) => {
    if (!contributionDraft || contributionDraft.goalId !== goalId) return;
    const amount = Number(contributionDraft.amount);
    if (!Number.isSafeInteger(amount) || amount <= 0) {
      setToast("Ingresa un monto válido");
      return;
    }
    const goal = data.goals.find((g) => g.id === goalId);
    if (!goal) return;
    if (amount > goal.target - goal.saved) {
      setToast(`Puedes aportar máximo ${money(goal.target - goal.saved)}`);
      return;
    }
    const method = contributionDraft.method;
    if (!["Nequi", "Bancolombia", "Efectivo"].includes(method)) {
      setToast("Elige Nequi, Bancolombia o Efectivo");
      return;
    }
    setData((p) => ({
      ...p,
      goals: p.goals.map((g) => (g.id === goalId ? { ...g, saved: g.saved + amount } : g)),
      savingsContributions: [
        { id: Date.now(), goalId, amount, method, date: today() },
        ...p.savingsContributions,
      ],
    }));
    setContributionDraft(null);
    setToast("Aporte registrado");
  };
  const saveNote = () => {
    if (!noteDraft) return;
    const title = noteDraft.title.trim().slice(0, 100),
      body = noteDraft.body.trim().slice(0, 5000);
    if (!title && !body) {
      setToast("Escribe algo en tu nota");
      return;
    }
    const note: Note = {
      id: noteDraft.id ?? Date.now(),
      title: title || "Sin título",
      body,
      updatedAt: today(),
    };
    setData((p) => ({
      ...p,
      notes: noteDraft.id
        ? p.notes.map((n) => (n.id === noteDraft.id ? note : n))
        : [note, ...p.notes],
    }));
    setNoteDraft(null);
    setToast("Nota guardada");
  };
  const savePqrs = () => {
    const subject = pqrsDraft.subject.trim().slice(0, 120),
      message = pqrsDraft.message.trim().slice(0, 3000),
      contact = pqrsDraft.contact.trim().slice(0, 255);
    if (!subject || !message) {
      setToast("Completa el asunto y el mensaje");
      return;
    }
    if (contact && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)) {
      setToast("Escribe un correo válido o deja el campo vacío");
      return;
    }
    setData((p) => ({
      ...p,
      pqrs: [
        { id: Date.now(), type: pqrsDraft.type, subject, message, contact, createdAt: today() },
        ...p.pqrs,
      ],
    }));
    setPqrsDraft({ type: "Petición", subject: "", message: "", contact: "" });
    setToast("PQRS guardada en este dispositivo; no se ha enviado");
  };
  const nextQuote = () => {
    const eligible = quotes
      .map((q, i) => (data.categories.includes(q.category) ? i : -1))
      .filter((i) => i >= 0);
    let queue = data.quoteQueue.filter((i) => eligible.includes(i));
    if (!queue.length)
      queue = [...eligible].filter((i) => i !== data.quoteIndex).sort(() => Math.random() - 0.5);
    const next = queue[0];
    if (next !== undefined)
      update({ quoteIndex: next, quoteQueue: queue.slice(1), lastQuoteAt: Date.now() });
  };
  const startRecording = async () => {
    if (listening && recorder) {
      recorder.stop();
      setListening(false);
      setRecorder(null);
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setToast("La grabación no está disponible en este navegador");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const chunks: BlobPart[] = [];
      const r = new MediaRecorder(stream);
      r.ondataavailable = (e) => chunks.push(e.data);
      r.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunks, { type: r.mimeType });
        if (blob.size > 1500000) {
          setToast("Grabación demasiado grande para guardarla aquí");
          return;
        }
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === "string") {
            update({
              recordings: [
                {
                  name: `Reunión ${formatDate(today(), { day: "numeric", month: "long" })} · ${new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}`,
                  url: reader.result,
                },
                ...data.recordings,
              ],
            });
            setToast("Grabación guardada");
          }
        };
        reader.readAsDataURL(blob);
      };
      r.start();
      setRecorder(r);
      setListening(true);
    } catch {
      setToast("Permite el acceso al micrófono para continuar");
    }
  };
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      hourCycle: "h23",
      timeZone: "America/Bogota",
    }).format(new Date()),
  );
  const greeting = hour < 12 ? "Buenos días" : hour < 18 ? "Buenas tardes" : "Buenas noches";
  const bal = (acc: string, start: number) =>
    start +
    data.movements
      .filter((m) => m.id > 1000000000)
      .reduce((s, m) => {
        if (m.kind === "retiro")
          return s + (acc === "Bancolombia" ? -m.amount : acc === "Efectivo" ? m.amount : 0);
        const a = m.method === "Bre-B" ? "Bancolombia" : m.method;
        if (a !== acc) return s;
        return s + (m.kind === "ingreso" ? m.amount : -m.amount);
      }, 0);
  const savedFrom = (method: string) =>
    data.savingsContributions.reduce((sum, c) => sum + (c.method === method ? c.amount : 0), 0);
  const balBanco = bal("Bancolombia", 1800000) - savedFrom("Bancolombia"),
    balNequi = bal("Nequi", 597000) - data.natilleraPayments * 20000 - savedFrom("Nequi"),
    balCash = bal("Efectivo", 200000) - savedFrom("Efectivo");
  const available = balBanco + balNequi + balCash;
  const sortedEvents = [...data.events].sort((a, b) =>
    (a.date + a.time).localeCompare(b.date + b.time),
  );
  const currentQuote = quotes[data.quoteIndex] ?? {
    text: "Cuentas claras, amistades largas.",
    author: "Refrán popular",
    category: "Finanzas",
  };
  const monthTotal = (kind: "ingreso" | "gasto") =>
    data.movements
      .filter((m) => m.kind === kind && m.date.slice(0, 7) === today().slice(0, 7))
      .reduce((sum, m) => sum + m.amount, 0);
  const navigateBack = () => go("mas");
  const L = limits[data.plan];
  const takeQuota = (k: "voice" | "questions" | "recordings") => {
    if (data.usage[k] >= L[k]) {
      setUpgrade("limite");
      return false;
    }
    setData((p) => ({ ...p, usage: { ...p.usage, [k]: p.usage[k] + 1 } }));
    return true;
  };
  const gate = {
    plan: data.plan,
    offline: data.offline,
    locked: (f: Feature | "limite") => setUpgrade(f),
    pending: () => setData((p) => ({ ...p, pendingSync: p.pendingSync + 1 })),
  };
  const cfgOf = (e: Event): AlertCfg =>
    data.eventAlerts[e.id] ?? {
      mode: "Alarma que suena",
      alerts: e.reminder.includes("1 día")
        ? ["1 día antes", "1 hora antes", "15 min antes"]
        : ["1 hora antes"],
      repeat: false,
    };
  const alertText = (e: Event) => {
    const c = data.eventAlerts[e.id];
    return c
      ? `${c.mode === "Alarma que suena" ? "Alarma" : "Notificación"} ${c.alerts.join(", ")}${c.repeat ? " · repite cada 5 min" : ""}`
      : `Alarma ${e.reminder}`;
  };
  const setOffline = (offline: boolean) => {
    if (!offline && data.offline && data.pendingSync > 0) {
      const n = data.pendingSync;
      update({ offline, pendingSync: 0 });
      setToast(n > 1 ? `Se sincronizaron ${n} pendientes` : "Se sincronizó 1 pendiente");
    } else {
      update({ offline });
      if (offline) setToast("Modo sin internet activado");
    }
  };
  const isMore = !["inicio", "agenda", "finanzas"].includes(view);
  if (!ready) return <div className="phone-shell" />;
  return (
    <div className="desktop-stage">
      <div className="phone-shell">
        {!data.onboarded ? (
          <main className="welcome-screen">
            <div className="welcome-art">
              <img src={logo} alt="AgendIA-UIB · Tu agenda y asistente personal" />
            </div>
            <div className="welcome-copy">
              <span className="eyebrow">TU ESPACIO, A TU RITMO</span>
              <h1>
                Bienvenido a<br />
                <span>AgendIA</span>
              </h1>
              <p>Tu agenda y asistente personal, para que cada día fluya mejor.</p>
            </div>
            <div className="welcome-form">
              <label htmlFor="name">¿Cómo quieres que te llame?</label>
              <Input
                id="name"
                value={data.name}
                onChange={(e) => update({ name: e.target.value })}
                placeholder="Tu nombre"
                className="h-12"
              />
              <label>¿Cómo prefieres que te salude?</label>
              <div className="segmented">
                {["Cercano", "Formal"].map((t) => (
                  <Button
                    key={t}
                    variant="ghost"
                    className={data.tone === t ? "selected" : ""}
                    onClick={() => update({ tone: t })}
                  >
                    {t}
                  </Button>
                ))}
              </div>
              <label>Frases que te inspiran</label>
              <div className="chip-row">
                {["Finanzas", "Bíblicas", "Filosofía"].map((c) => (
                  <Button
                    key={c}
                    variant="outline"
                    className={`choice-chip ${data.categories.includes(c) ? "active" : ""}`}
                    onClick={() =>
                      update({
                        categories: data.categories.includes(c)
                          ? data.categories.filter((x) => x !== c)
                          : [...data.categories, c],
                      })
                    }
                  >
                    {data.categories.includes(c) && <Check className="size-3" />}
                    {c}
                  </Button>
                ))}
              </div>
              <Button
                className="h-12 w-full mt-5 text-base"
                onClick={() => {
                  if (!data.name.trim()) {
                    setToast("Cuéntame cómo te llamas");
                    return;
                  }
                  if (!data.categories.length) {
                    setToast("Elige al menos un tipo de frase");
                    return;
                  }
                  update({ onboarded: true });
                }}
              >
                Empezar <ArrowUpRight />
              </Button>
            </div>
          </main>
        ) : (
          <>
            <header className="app-header">
              <div className="brand-lockup">
                <img src={mark} alt="" />
                <div>
                  <strong>
                    Agend<span>IA</span>
                    <small>-UIB</small>
                  </strong>
                  <p>Tu agenda y asistente personal</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                aria-label={data.dark ? "Activar modo claro" : "Activar modo oscuro"}
                title={data.dark ? "Modo claro" : "Modo oscuro"}
                onClick={() => update({ dark: !data.dark })}
              >
                {data.dark ? <Sun className="size-5" /> : <Moon className="size-5" />}
              </Button>
            </header>
            {data.offline && <OfflineBanner pending={data.pendingSync} />}
            <main className="app-content" key={view}>
              {view === "inicio" && (
                <>
                  <div className="date-line">
                    <span>
                      <MapPin className="size-3.5" /> Quibdó, Chocó
                    </span>
                    <span>
                      {formatDate(today(), { weekday: "long", day: "numeric", month: "long" })}
                    </span>
                  </div>
                  <div className="intro">
                    <span className="eyebrow">UN DÍA A LA VEZ</span>
                    <h1>
                      ¡{greeting},<br />
                      {data.name}! <span className="sun-dot">✳</span>
                    </h1>
                    <p>
                      Hoy tienes {data.events.filter((e) => e.date === today()).length} compromiso
                      {data.events.filter((e) => e.date === today()).length === 1 ? "" : "s"} y 1
                      pago en camino.{" "}
                      {data.tone === "Cercano" ? "Vamos con toda." : "Que tengas un excelente día."}
                    </p>
                  </div>
                  <BrandCard>
                    <div className="card-topline">
                      <span>LO PRÓXIMO</span>
                      <CalendarDays className="size-4" />
                    </div>
                    <h2>{sortedEvents[0]?.title || "Tu agenda está libre"}</h2>
                    <div className="next-detail">
                      <span>
                        <Clock3 className="size-4" />{" "}
                        {sortedEvents[0]
                          ? `${formatDate(sortedEvents[0].date, { weekday: "long", day: "numeric", month: "short" })} · ${clock(sortedEvents[0].time)}`
                          : "Disfruta tu tiempo"}
                      </span>
                      <span>
                        <MapPin className="size-4" /> {sortedEvents[0]?.place || "Quibdó"}
                      </span>
                    </div>
                  </BrandCard>
                  <div className="stat-grid">
                    <div>
                      <span>CITAS</span>
                      <strong>
                        {data.events
                          .filter((e) => e.date === today())
                          .length.toString()
                          .padStart(2, "0")}
                      </strong>
                      <CalendarDays />
                    </div>
                    <div>
                      <span>PAGOS</span>
                      <strong>01</strong>
                      <CreditCard />
                    </div>
                    <div>
                      <span>TAREAS</span>
                      <strong>
                        {data.tasks
                          .filter((t) => !t.done)
                          .length.toString()
                          .padStart(2, "0")}
                      </strong>
                      <Check />
                    </div>
                    <div>
                      <span>DISPONIBLE</span>
                      <strong className="stat-money">{money(available)}</strong>
                      <Wallet />
                    </div>
                  </div>
                  <section className="quote-section">
                    <div className="section-heading">
                      <h2>Frase del día</h2>
                      <span className="pill-label">PARA INSPIRARTE</span>
                    </div>
                    <div className="quote-card">
                      <span className="quote-mark">“</span>
                      <blockquote>{currentQuote.text}</blockquote>
                      <p>— {currentQuote.author}</p>
                      <div className="quote-actions">
                        <Button variant="ghost" onClick={nextQuote}>
                          <RefreshCw /> Otra frase
                        </Button>
                        <Button
                          variant="ghost"
                          aria-label="Guardar frase"
                          title="Guardar frase"
                          onClick={() => {
                            update({
                              savedQuotes: data.savedQuotes.includes(data.quoteIndex)
                                ? data.savedQuotes.filter((i) => i !== data.quoteIndex)
                                : [...data.savedQuotes, data.quoteIndex],
                            });
                            setToast(
                              data.savedQuotes.includes(data.quoteIndex)
                                ? "Frase quitada de guardadas"
                                : "Frase guardada",
                            );
                          }}
                        >
                          <Bookmark
                            className={
                              data.savedQuotes.includes(data.quoteIndex) ? "fill-current" : ""
                            }
                          />
                        </Button>
                        <Button
                          variant="ghost"
                          aria-label="Compartir frase"
                          title="Compartir frase"
                          onClick={async () => {
                            try {
                              await navigator.share({
                                text: `“${currentQuote.text}” — ${currentQuote.author}`,
                              });
                            } catch {
                              await navigator.clipboard?.writeText(
                                `“${currentQuote.text}” — ${currentQuote.author}`,
                              );
                              setToast("Frase copiada para compartir");
                            }
                          }}
                        >
                          <Share2 />
                        </Button>
                      </div>
                    </div>
                  </section>
                  <section>
                    <SectionTitle title="A un toque" />
                    <div className="quick-grid">
                      <Button variant="ghost" onClick={() => go("reuniones")}>
                        <span className="quick-icon teal">
                          <Video />
                        </span>
                        <span>
                          Grabar reunión<small>Captura acuerdos</small>
                        </span>
                      </Button>
                      <Button variant="ghost" onClick={() => go("asistente")}>
                        <span className="quick-icon blue">
                          <Bot />
                        </span>
                        <span>
                          Preguntar al asistente<small>Resuelve tus dudas</small>
                        </span>
                      </Button>
                      <Button variant="ghost" onClick={() => go("facturas")}>
                        <span className="quick-icon coral">
                          <Receipt />
                        </span>
                        <span>
                          Guardar factura<small>Guarda comprobantes</small>
                        </span>
                      </Button>
                      <Button variant="ghost" onClick={() => openDialog("gasto")}>
                        <span className="quick-icon green">
                          <CircleDollarSign />
                        </span>
                        <span>
                          Registrar gasto<small>Lleva tus cuentas</small>
                        </span>
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => setNoteDraft({ id: null, title: "", body: "" })}
                      >
                        <span className="quick-icon blue">
                          <NotebookPen />
                        </span>
                        <span>
                          Apunte rápido<small>No pierdas la idea</small>
                        </span>
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() =>
                          setGoalDraft({ name: "", target: "", amount: "", method: "Nequi" })
                        }
                      >
                        <span className="quick-icon green">
                          <Target />
                        </span>
                        <span>
                          Nueva meta<small>Ahorra para lo tuyo</small>
                        </span>
                      </Button>
                    </div>
                  </section>
                  <section>
                    <SectionTitle
                      title="Tu día de hoy"
                      action="Ver agenda"
                      onAction={() => go("agenda")}
                    />
                    <div className="plain-list">
                      {data.events
                        .filter((e) => e.date === today())
                        .map((e) => (
                          <div className="timeline-item" key={e.id}>
                            <div className="timeline-time">{clock(e.time)}</div>
                            <div className="timeline-dot" />
                            <div>
                              <strong>{e.title}</strong>
                              <span>{e.place}</span>
                            </div>
                          </div>
                        ))}
                      {data.tasks
                        .filter((t) => !t.done)
                        .slice(0, 2)
                        .map((t) => (
                          <div className="timeline-item" key={t.id}>
                            <div className="timeline-time">Tarea</div>
                            <div className="timeline-dot muted-dot" />
                            <div>
                              <strong>{t.text}</strong>
                              <span>Pendiente</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </section>
                  <section>
                    <SectionTitle
                      title="Pagos que vienen"
                      action="Ver finanzas"
                      onAction={() => go("finanzas")}
                    />
                    <div className="payment-row">
                      <div className="payment-icon">
                        <Home />
                      </div>
                      <div>
                        <strong>Arriendo</strong>
                        <span>Próximo día 30 · Sra. Yolanda Mosquera</span>
                        <button
                          type="button"
                          className="pay-alerts"
                          onClick={() => setReminderFor("arriendo")}
                        >
                          <Bell className="size-3" /> Avisos{" "}
                          {data.payAlerts.map((n) => (n === 0 ? "el día" : `${n}d`)).join(" · ")}
                        </button>
                      </div>
                      <strong>{money(850000)}</strong>
                    </div>
                  </section>
                </>
              )}
              {view === "agenda" && (
                <>
                  <div className="page-heading">
                    <span className="eyebrow">HAZ ESPACIO PARA LO IMPORTANTE</span>
                    <h1>
                      Mi agenda<span>.</span>
                    </h1>
                    <p>Todo lo que tienes por delante, en orden.</p>
                  </div>
                  <div className="section-heading">
                    <h2>{formatDate(selectedDate, { month: "long", year: "numeric" })}</h2>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label="Ir a hoy"
                      title="Ir a hoy"
                      onClick={() => setSelectedDate(today())}
                    >
                      <RefreshCw />
                    </Button>
                  </div>
                  <div className="week-strip">
                    {Array.from({ length: 7 }, (_, i) => {
                      const d = addDays(today(), i);
                      return (
                        <Button
                          key={d}
                          variant="ghost"
                          className={`day-button ${selectedDate === d ? "active" : ""}`}
                          onClick={() => setSelectedDate(d)}
                        >
                          <span>{formatDate(d, { weekday: "short" }).replace(".", "")}</span>
                          <strong>{formatDate(d, { day: "numeric" })}</strong>
                          <i />
                        </Button>
                      );
                    })}
                  </div>
                  <SectionTitle
                    title="Compromisos"
                    action="Agregar"
                    onAction={() => openDialog("evento")}
                  />
                  <div className="event-list">
                    {data.events
                      .filter((e) => e.date === selectedDate)
                      .map((e) => (
                        <div className="event-card" key={e.id}>
                          <div className="event-time">{clock(e.time)}</div>
                          <div
                            className="event-body clickable"
                            role="button"
                            tabIndex={0}
                            aria-label={`Recordatorios de ${e.title}`}
                            onClick={() => setReminderFor(e.id)}
                            onKeyDown={(k) => {
                              if (k.key === "Enter") setReminderFor(e.id);
                            }}
                          >
                            <strong>{e.title}</strong>
                            <span>
                              <MapPin className="size-3.5" /> {e.place}
                            </span>
                            <small>
                              <Bell className="size-3" /> {alertText(e)}
                            </small>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Eliminar ${e.title}`}
                            title="Eliminar evento"
                            onClick={() =>
                              update({ events: data.events.filter((x) => x.id !== e.id) })
                            }
                          >
                            <X />
                          </Button>
                        </div>
                      ))}
                    {!data.events.some((e) => e.date === selectedDate) && (
                      <Empty>Sin compromisos para este día.</Empty>
                    )}
                  </div>
                  <SectionTitle
                    title="Mis tareas"
                    action="Nueva tarea"
                    onAction={() => openDialog("tarea")}
                  />
                  <div className="stack-list">
                    {data.tasks.map((t) => (
                      <div className="check-row" key={t.id}>
                        <input
                          type="checkbox"
                          checked={t.done}
                          aria-label={t.text}
                          onChange={() =>
                            update({
                              tasks: data.tasks.map((x) =>
                                x.id === t.id ? { ...x, done: !x.done } : x,
                              ),
                            })
                          }
                        />
                        <span className={t.done ? "completed" : ""}>{t.text}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Eliminar ${t.text}`}
                          onClick={() => update({ tasks: data.tasks.filter((x) => x.id !== t.id) })}
                        >
                          <X />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <SectionTitle
                    title="Listas de compras"
                    action="Agregar"
                    onAction={() => openDialog("compra")}
                  />
                  <div className="stack-list">
                    {data.groceries.map((g) => (
                      <div className="check-row" key={g.id}>
                        <input
                          type="checkbox"
                          checked={g.done}
                          aria-label={g.item}
                          onChange={() =>
                            update({
                              groceries: data.groceries.map((x) =>
                                x.id === g.id ? { ...x, done: !x.done } : x,
                              ),
                            })
                          }
                        />
                        <div>
                          <strong className={g.done ? "completed" : ""}>{g.item}</strong>
                          <small>{g.store}</small>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Eliminar ${g.item}`}
                          onClick={() =>
                            update({ groceries: data.groceries.filter((x) => x.id !== g.id) })
                          }
                        >
                          <X />
                        </Button>
                      </div>
                    ))}
                  </div>
                </>
              )}
              {view === "finanzas" && (
                <>
                  <div className="page-heading">
                    <span className="eyebrow">CADA PESO CUENTA</span>
                    <h1>
                      Mis finanzas<span>.</span>
                    </h1>
                    <p>Claridad para decidir con tranquilidad.</p>
                  </div>
                  <BrandCard className="balance-card">
                    <div className="card-topline">
                      <span>DINERO DISPONIBLE</span>
                      <Wallet className="size-5" />
                    </div>
                    <strong className="balance-amount">{money(available)}</strong>
                    <span className="balance-caption">Entre tus cuentas y efectivo</span>
                    <div className="account-grid">
                      <div>
                        <small>Bancolombia</small>
                        <b>{money(Math.max(0, balBanco))}</b>
                      </div>
                      <div>
                        <small>Nequi</small>
                        <b>{money(Math.max(0, balNequi))}</b>
                      </div>
                      <div>
                        <small>Efectivo</small>
                        <b>{money(Math.max(0, balCash))}</b>
                      </div>
                    </div>
                  </BrandCard>
                  <div className="finance-summary">
                    <div>
                      <ArrowDownLeft />
                      <span>Ingresos del mes</span>
                      <strong>{money(monthTotal("ingreso"))}</strong>
                    </div>
                    <div>
                      <ArrowUpRight />
                      <span>Gastos del mes</span>
                      <strong>{money(monthTotal("gasto"))}</strong>
                    </div>
                  </div>
                  <div className="finance-actions">
                    <Button onClick={() => openDialog("gasto")}>
                      <Plus /> Gasto
                    </Button>
                    <Button variant="outline" onClick={() => openDialog("ingreso")}>
                      <Plus /> Ingreso
                    </Button>
                  </div>
                  <div className="finance-tabs">
                    {["Gastos", "Ingresos", "Deudas", "Ahorro", "Arriendo", "Compras"].map(
                      (tab) => (
                        <Button
                          key={tab}
                          variant="ghost"
                          className={financeTab === tab ? "active" : ""}
                          onClick={() => setFinanceTab(tab)}
                        >
                          {tab}
                        </Button>
                      ),
                    )}
                  </div>
                  {financeTab === "Gastos" && (
                    <>
                      <SectionTitle title="Presupuesto del mes" />
                      {!hasFeature(data.plan, "presupuestos") && (
                        <Locked feature="presupuestos" onUpgrade={setUpgrade} />
                      )}
                      <div
                        className={`budget-list ${hasFeature(data.plan, "presupuestos") ? "" : "hidden"}`}
                      >
                        {[
                          { name: "Alimentación", limit: 500000 },
                          { name: "Hogar", limit: 350000 },
                          { name: "Transporte", limit: 200000 },
                          { name: "Otros", limit: 250000 },
                        ].map((c) => {
                          const spent = data.movements
                            .filter(
                              (m) =>
                                m.kind === "gasto" &&
                                m.category === c.name &&
                                m.date.slice(0, 7) === today().slice(0, 7),
                            )
                            .reduce((s, m) => s + m.amount, 0);
                          const pct = Math.round((spent / c.limit) * 100);
                          return (
                            <div className="budget-item" key={c.name}>
                              <div>
                                <strong>{c.name}</strong>
                                <span>
                                  {money(spent)} / {money(c.limit)}
                                </span>
                              </div>
                              <div className="budget-track">
                                <div
                                  className={pct >= 90 ? "over" : ""}
                                  style={{ width: `${Math.min(pct, 100)}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <SectionTitle title="Movimientos recientes" />
                      <MovementList items={data.movements.filter((m) => m.kind === "gasto")} />
                    </>
                  )}
                  {financeTab === "Ingresos" && (
                    <>
                      <SectionTitle
                        title="Entradas de dinero"
                        action="Agregar"
                        onAction={() => openDialog("ingreso")}
                      />
                      <MovementList items={data.movements.filter((m) => m.kind === "ingreso")} />
                    </>
                  )}
                  {financeTab === "Deudas" && (
                    <>
                      <SectionTitle title="Lo que debo" />
                      {data.debts
                        .filter((x) => !x.incoming)
                        .map((x) => (
                          <Debt
                            key={x.id}
                            title={x.title}
                            detail={x.detail}
                            amount={x.balance}
                            progress={Math.round((1 - x.balance / x.original) * 100)}
                          />
                        ))}
                      <SectionTitle title="Lo que me deben" />
                      {data.debts
                        .filter((x) => x.incoming)
                        .map((x) => (
                          <Debt
                            key={x.id}
                            title={x.title}
                            detail={x.detail}
                            amount={x.balance}
                            progress={Math.round((1 - x.balance / x.original) * 100)}
                            incoming
                          />
                        ))}
                    </>
                  )}
                  {financeTab === "Ahorro" && (
                    <>
                      <SectionTitle title="Mis natilleras" />
                      <div className="detail-card">
                        <div className="detail-icon">
                          <PiggyBank />
                        </div>
                        <h3>Natillera de la oficina</h3>
                        <p>18 miembros · Cuota semanal de {money(20000)}</p>
                        <div className="detail-facts">
                          <div>
                            <span>Próxima cuota</span>
                            <strong>
                              {formatDate(addDays(today(), 7), { day: "numeric", month: "short" })}
                            </strong>
                          </div>
                          <div>
                            <span>Liquidación</span>
                            <strong>Diciembre</strong>
                          </div>
                          <div>
                            <span>Cuotas pagadas</span>
                            <strong>{data.natilleraPayments}</strong>
                          </div>
                        </div>
                        <Button
                          className="w-full h-11"
                          onClick={() => {
                            update({ natilleraPayments: data.natilleraPayments + 1 });
                            setToast("Cuota registrada como pagada");
                          }}
                        >
                          Pagar cuota <ArrowUpRight />
                        </Button>
                      </div>
                      <div className="section-heading">
                        <h2>Metas de ahorro</h2>
                        <Button
                          variant="outline"
                          className="h-9"
                          onClick={() =>
                            setGoalDraft({ name: "", target: "", amount: "", method: "Nequi" })
                          }
                        >
                          <Target className="size-4" /> Nueva meta
                        </Button>
                      </div>
                      <div className="goal-list">
                        {data.goals.map((g) => (
                          <div key={g.id}>
                            <div>
                              <strong>{g.name}</strong>
                              <span>
                                {money(g.saved)} de {money(g.target)}
                              </span>
                            </div>
                            <div className="budget-track">
                              <div
                                style={{
                                  width: `${g.target ? Math.min(100, (g.saved / g.target) * 100) : 0}%`,
                                }}
                              />
                            </div>
                            <small>Ahorra {money(g.quota)} por quincena</small>
                            <div className="goal-actions">
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={g.saved >= g.target}
                                onClick={() =>
                                  setContributionDraft({
                                    goalId: g.id,
                                    amount: "",
                                    method: "Nequi",
                                  })
                                }
                              >
                                <Coins className="size-4" /> Aportar
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label={`Eliminar meta ${g.name}`}
                                title="Eliminar meta"
                                onClick={() => {
                                  if (window.confirm(`¿Eliminar la meta ${g.name}?`))
                                    update({
                                      goals: data.goals.filter((x) => x.id !== g.id),
                                      savingsContributions: data.savingsContributions.filter(
                                        (c) => c.goalId !== g.id,
                                      ),
                                    });
                                }}
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  {financeTab === "Arriendo" && (
                    <>
                      <SectionTitle title="Mi arriendo" />
                      <div className="detail-card">
                        <div className="detail-icon">
                          <Home />
                        </div>
                        <span className="eyebrow">PAGO MENSUAL</span>
                        <h3 className="large-amount">{money(850000)}</h3>
                        <div className="detail-facts">
                          <div>
                            <span>Día de pago</span>
                            <strong>30 de cada mes</strong>
                          </div>
                          <div>
                            <span>Arrendadora</span>
                            <strong>Sra. Yolanda Mosquera</strong>
                          </div>
                          <div>
                            <span>Estado</span>
                            <strong className="text-success">Pendiente</strong>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          className="w-full h-11"
                          onClick={() => setReminderFor("arriendo")}
                        >
                          <Bell /> Avisos{" "}
                          {data.payAlerts.map((n) => (n === 0 ? "el día" : `${n}d`)).join(" · ")}
                        </Button>
                      </div>
                      <SectionTitle title="Historial" />
                      <Empty>Aún no hay pagos de arriendo registrados.</Empty>
                    </>
                  )}
                  {financeTab === "Compras" && (
                    <>
                      <SectionTitle title="Mis compras" />
                      <MovementList items={data.movements.filter((m) => m.kind === "gasto")} />
                    </>
                  )}
                </>
              )}
              {view === "mas" && (
                <>
                  <div className="page-heading">
                    <span className="eyebrow">TODO EN UN SOLO LUGAR</span>
                    <h1>
                      Más para ti<span>.</span>
                    </h1>
                    <p>Herramientas que te acompañan cada día.</p>
                  </div>
                  <div className="more-list">
                    {moreItems.map((item) => (
                      <Button key={item.view} variant="ghost" onClick={() => go(item.view)}>
                        <span className="more-icon">
                          <item.icon />
                        </span>
                        <span>
                          <strong>{item.label}</strong>
                          <small>{item.detail}</small>
                        </span>
                        <ChevronRight className="more-chevron" />
                      </Button>
                    ))}
                  </div>
                  <div className="more-list mt-3">
                    {(["reportes", "negocio"] as Feature[]).map((f) => (
                      <Locked
                        key={f}
                        feature={f}
                        onUpgrade={(x) =>
                          hasFeature(data.plan, x)
                            ? setToast(
                                x === "reportes"
                                  ? `Reporte del mes: gastaste ${money(monthTotal("gasto"))} e ingresaron ${money(monthTotal("ingreso"))}.`
                                  : "Modo negocio o fundación activado",
                              )
                            : setUpgrade(x)
                        }
                        compact
                      />
                    ))}
                  </div>
                  <p className="more-footer">AgendIA-UIB · Hecha para tus días en Colombia</p>
                </>
              )}
              {view === "notas" && (
                <>
                  <PageBack title="Bloc de notas" back={navigateBack} />
                  <div className="feature-intro">
                    <span className="feature-icon">
                      <NotebookPen />
                    </span>
                    <h2>Tus apuntes, a mano.</h2>
                  </div>
                  <Button
                    className="w-full h-11 mb-5"
                    onClick={() => setNoteDraft({ id: null, title: "", body: "" })}
                  >
                    <Plus /> Nuevo apunte
                  </Button>
                  <div className="notes-list">
                    {data.notes.map((note) => (
                      <div className="note-item" key={note.id}>
                        <div>
                          <strong>{note.title}</strong>
                          <p>{note.body || "Sin contenido"}</p>
                          <small>
                            {formatDate(note.updatedAt, {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </small>
                        </div>
                        <div className="note-actions">
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label={`Editar ${note.title}`}
                            title="Editar"
                            onClick={() =>
                              setNoteDraft({ id: note.id, title: note.title, body: note.body })
                            }
                          >
                            <Pencil />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label={`Eliminar ${note.title}`}
                            title="Eliminar"
                            onClick={() => {
                              if (window.confirm(`¿Eliminar ${note.title}?`))
                                update({ notes: data.notes.filter((n) => n.id !== note.id) });
                            }}
                          >
                            <Trash2 />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {!data.notes.length && <Empty>Aún no hay apuntes.</Empty>}
                  </div>
                </>
              )}
              {view === "pqrs" && (
                <>
                  <PageBack title="PQRS" back={navigateBack} />
                  <div className="feature-intro">
                    <span className="feature-icon">
                      <ClipboardList />
                    </span>
                    <h2>Cuéntanos qué pasa.</h2>
                    <p>Petición, queja, reclamo o sugerencia.</p>
                  </div>
                  <div className="local-notice">
                    <Bell className="size-4" /> Este formulario guarda un borrador en este
                    dispositivo. Todavía no se envía al equipo de AgendIA.
                  </div>
                  <div className="modal-form">
                    <label>
                      Tipo de solicitud
                      <select
                        value={pqrsDraft.type}
                        onChange={(e) =>
                          setPqrsDraft({ ...pqrsDraft, type: e.target.value as Pqrs["type"] })
                        }
                      >
                        {["Petición", "Queja", "Reclamo", "Sugerencia"].map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Asunto
                      <Input
                        maxLength={120}
                        value={pqrsDraft.subject}
                        onChange={(e) => setPqrsDraft({ ...pqrsDraft, subject: e.target.value })}
                        placeholder="¿De qué se trata?"
                      />
                    </label>
                    <label>
                      Cuéntanos más
                      <Textarea
                        maxLength={3000}
                        rows={5}
                        value={pqrsDraft.message}
                        onChange={(e) => setPqrsDraft({ ...pqrsDraft, message: e.target.value })}
                        placeholder="Escribe tu solicitud aquí"
                        className="mt-2"
                      />
                    </label>
                    <label>
                      Correo de contacto (opcional)
                      <Input
                        type="email"
                        maxLength={255}
                        value={pqrsDraft.contact}
                        onChange={(e) => setPqrsDraft({ ...pqrsDraft, contact: e.target.value })}
                        placeholder="nombre@correo.com"
                      />
                    </label>
                    <Button className="h-11" onClick={savePqrs}>
                      <Save /> Guardar borrador
                    </Button>
                  </div>
                  <SectionTitle title="Guardadas en este dispositivo" />
                  <div className="notes-list">
                    {data.pqrs.map((item) => (
                      <div className="note-item" key={item.id}>
                        <div>
                          <small>
                            {item.type} ·{" "}
                            {formatDate(item.createdAt, { day: "numeric", month: "long" })} · Sin
                            enviar
                          </small>
                          <strong>{item.subject}</strong>
                          <p>{item.message}</p>
                          {item.contact && <small>{item.contact}</small>}
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label={`Eliminar ${item.subject}`}
                          title="Eliminar"
                          onClick={() => {
                            if (window.confirm("¿Eliminar esta solicitud guardada?"))
                              update({ pqrs: data.pqrs.filter((x) => x.id !== item.id) });
                          }}
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    ))}
                    {!data.pqrs.length && <Empty>Aún no hay solicitudes guardadas.</Empty>}
                  </div>
                </>
              )}
              {view === "ajustes" && (
                <>
                  <PageBack title="Ajustes" back={navigateBack} />
                  <SectionTitle title="Tu perfil" />
                  <div className="settings-group">
                    <label>
                      Tu nombre
                      <Input
                        value={data.name}
                        onChange={(e) => update({ name: e.target.value })}
                        className="mt-2 h-11"
                      />
                    </label>
                    <label>Tono del saludo</label>
                    <div className="segmented">
                      {["Cercano", "Formal"].map((t) => (
                        <Button
                          key={t}
                          variant="ghost"
                          className={data.tone === t ? "selected" : ""}
                          onClick={() => update({ tone: t })}
                        >
                          {t}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <SectionTitle title="Frases del día" />
                  <div className="settings-group">
                    <label>Tipos de frases</label>
                    <div className="chip-row">
                      {["Finanzas", "Bíblicas", "Filosofía"].map((c) => (
                        <Button
                          key={c}
                          variant="outline"
                          className={`choice-chip ${data.categories.includes(c) ? "active" : ""}`}
                          onClick={() =>
                            update({
                              categories: data.categories.includes(c)
                                ? data.categories.filter((x) => x !== c)
                                : [...data.categories, c],
                            })
                          }
                        >
                          {c}
                        </Button>
                      ))}
                    </div>
                    <label htmlFor="frequency">Cambiar frase</label>
                    <select
                      id="frequency"
                      value={data.frequency}
                      onChange={(e) => update({ frequency: e.target.value })}
                    >
                      <option>Una vez al día</option>
                      <option>Cada 6 horas</option>
                      <option>Cada vez que abro la app</option>
                    </select>
                  </div>
                  <SectionTitle title="Preferencias" />
                  <div className="settings-group">
                    <label htmlFor="reminders">Recordatorios por defecto</label>
                    <select
                      id="reminders"
                      value={data.reminders}
                      onChange={(e) => update({ reminders: e.target.value })}
                    >
                      <option>1 día, 1 hora y 15 min antes</option>
                      <option>1 día antes</option>
                      <option>1 hora antes</option>
                      <option>15 min antes</option>
                    </select>
                    <div className="setting-toggle">
                      <span>Modo oscuro</span>
                      <Switch checked={data.dark} onCheckedChange={(dark) => update({ dark })} />
                    </div>
                    <div className="setting-toggle">
                      <span>Simular «sin internet»</span>
                      <Switch checked={data.offline} onCheckedChange={setOffline} />
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full h-11 mt-8 text-destructive"
                    onClick={() => {
                      if (window.confirm("¿Restablecer todos los datos de AgendIA?")) {
                        setData({ ...initialData(), onboarded: true });
                        setToast("Datos restablecidos");
                      }
                    }}
                  >
                    <Trash2 /> Restablecer datos
                  </Button>
                </>
              )}
              {view === "reuniones" && (
                <>
                  <PageBack title="Reuniones" back={navigateBack} />
                  <MeetingsView
                    meetings={data.meetings}
                    today={today()}
                    onSave={(m) => update({ meetings: m })}
                    onAddTask={(t) =>
                      setData((p) => ({
                        ...p,
                        tasks: [...p.tasks, { id: Date.now(), text: t, done: false }],
                      }))
                    }
                    toast={setToast}
                    gate={gate}
                    canRecord={() => takeQuota("recordings")}
                  />
                </>
              )}
              {view === "asistente" && (
                <>
                  <PageBack title="Asistente" back={navigateBack} />
                  <AssistantView
                    d={{
                      name: data.name,
                      today: today(),
                      events: data.events,
                      tasks: data.tasks,
                      movements: data.movements,
                      meetings: data.meetings,
                      debts: data.debts,
                      available,
                    }}
                    gate={gate}
                    canAsk={() => takeQuota("questions")}
                  />
                </>
              )}
              {view === "facturas" && (
                <>
                  <PageBack title="Facturas" back={navigateBack} />
                  <InvoicesView
                    bills={data.bills}
                    today={today()}
                    onSave={(b) => update({ bills: b })}
                    onExpense={(b) =>
                      setData((p) => ({
                        ...p,
                        movements: [
                          {
                            id: Date.now(),
                            title: b.store,
                            amount: b.total,
                            method: "Nequi",
                            category: b.category,
                            kind: "gasto",
                            date: b.date,
                          },
                          ...p.movements,
                        ],
                      }))
                    }
                    toast={setToast}
                    gate={gate}
                  />
                </>
              )}
              {view === "whatsapp" && (
                <>
                  <PageBack title="WhatsApp" back={navigateBack} />
                  {hasFeature(data.plan, "whatsapp") ? (
                    <WhatsAppView name={data.name} />
                  ) : (
                    <Locked feature="whatsapp" onUpgrade={setUpgrade} />
                  )}
                </>
              )}
              {view === "planes" && (
                <>
                  <PageBack title="Planes" back={navigateBack} />
                  <PlansView
                    plan={data.plan}
                    setPlan={(plan) => {
                      update({ plan });
                      setToast(`Ahora usas el plan ${plan}`);
                    }}
                    usage={data.usage}
                  />
                </>
              )}
            </main>
            <nav className="bottom-nav" aria-label="Navegación principal">
              <Link to="/" className={view === "inicio" ? "active" : ""}>
                <Home />
                <span>Inicio</span>
              </Link>
              <Link to="/agenda" className={view === "agenda" ? "active" : ""}>
                <CalendarDays />
                <span>Agenda</span>
              </Link>
              <Button
                className="nav-mic"
                aria-label="Usar micrófono"
                title="Usar micrófono"
                onClick={() => {
                  if (takeQuota("voice")) setVoiceOpen(true);
                }}
              >
                <Mic />
              </Button>
              <Link to="/finanzas" className={view === "finanzas" ? "active" : ""}>
                <Wallet />
                <span>Finanzas</span>
              </Link>
              <Link to="/mas" className={isMore ? "active" : ""}>
                <Menu />
                <span>Más</span>
              </Link>
            </nav>
          </>
        )}
        {dialog && (
          <div className="modal-backdrop" onClick={() => setDialog(null)}>
            <div
              className="modal-sheet"
              role="dialog"
              aria-modal="true"
              aria-label={`Nuevo ${dialog}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-head">
                <h2>
                  {dialog === "voz"
                    ? "Tu asistente de voz"
                    : dialog === "evento"
                      ? "Nuevo compromiso"
                      : dialog === "tarea"
                        ? "Nueva tarea"
                        : dialog === "compra"
                          ? "Agregar compra"
                          : dialog === "gasto"
                            ? "Registrar gasto"
                            : "Registrar ingreso"}
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Cerrar"
                  onClick={() => setDialog(null)}
                >
                  <X />
                </Button>
              </div>
              {dialog === "voz" ? (
                <div className="voice-state">
                  <span>
                    <Mic />
                  </span>
                  <p>
                    El asistente de voz estará disponible próximamente. Por ahora, puedes agregar
                    compromisos y movimientos manualmente.
                  </p>
                  <div>
                    <Button variant="outline" onClick={() => openDialog("evento")}>
                      Nuevo evento
                    </Button>
                    <Button onClick={() => openDialog("gasto")}>Registrar gasto</Button>
                  </div>
                </div>
              ) : (
                <div className="modal-form">
                  <label>
                    {dialog === "evento"
                      ? "Nombre del compromiso"
                      : dialog === "compra"
                        ? "¿Qué necesitas comprar?"
                        : dialog === "tarea"
                          ? "¿Qué tienes pendiente?"
                          : "Descripción"}
                    <Input
                      autoFocus
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder={
                        dialog === "evento"
                          ? "Ej. Reunión de equipo"
                          : dialog === "tarea"
                            ? "Ej. Revisar documentos"
                            : "Escribe aquí"
                      }
                    />
                  </label>
                  {(dialog === "gasto" || dialog === "ingreso") && (
                    <>
                      <label>
                        Monto en pesos
                        <Input
                          type="number"
                          min="1"
                          inputMode="numeric"
                          value={form.amount}
                          onChange={(e) => setForm({ ...form, amount: e.target.value })}
                          placeholder="0"
                        />
                      </label>
                      <label>
                        ¿Cómo se pagó?
                        <select
                          value={form.method}
                          onChange={(e) => setForm({ ...form, method: e.target.value })}
                        >
                          {["Nequi", "Bancolombia", "Bre-B", "Efectivo", "Tarjeta"].map((m) => (
                            <option key={m}>{m}</option>
                          ))}
                        </select>
                      </label>
                      {dialog === "gasto" && (
                        <label>
                          Categoría
                          <select
                            value={form.category}
                            onChange={(e) => setForm({ ...form, category: e.target.value })}
                          >
                            {["Alimentación", "Hogar", "Transporte", "Otros"].map((c) => (
                              <option key={c}>{c}</option>
                            ))}
                          </select>
                        </label>
                      )}
                    </>
                  )}
                  {dialog === "evento" && (
                    <>
                      <label>
                        Lugar
                        <Input
                          value={form.place}
                          onChange={(e) => setForm({ ...form, place: e.target.value })}
                          placeholder="Ej. Salón Fiama"
                        />
                      </label>
                      <label>
                        Hora
                        <Input
                          type="time"
                          value={form.time}
                          onChange={(e) => setForm({ ...form, time: e.target.value })}
                        />
                      </label>
                    </>
                  )}
                  {["evento", "gasto", "ingreso"].includes(dialog) && (
                    <label>
                      Fecha
                      <Input
                        type="date"
                        value={form.date}
                        onChange={(e) => setForm({ ...form, date: e.target.value })}
                      />
                    </label>
                  )}
                  {dialog === "compra" && (
                    <label>
                      Tienda
                      <Input
                        value={form.store}
                        onChange={(e) => setForm({ ...form, store: e.target.value })}
                        placeholder="Ej. Supermercado"
                      />
                    </label>
                  )}
                  <Button className="w-full h-12 mt-2" onClick={submit}>
                    Guardar <Check />
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
        {typeof reminderFor === "number" &&
          (() => {
            const e = data.events.find((x) => x.id === reminderFor);
            return e ? (
              <ReminderSheet
                title={e.title}
                subtitle={`${formatDate(e.date, { weekday: "long", day: "numeric", month: "long" })} · ${clock(e.time)} · ${e.place}`}
                initial={cfgOf(e)}
                onClose={() => setReminderFor(null)}
                onTest={() =>
                  setAlarm({ title: e.title, subtitle: `${clock(e.time)} · ${e.place}` })
                }
                onSave={(c) => {
                  update({ eventAlerts: { ...data.eventAlerts, [e.id]: c } });
                  setReminderFor(null);
                  setToast("Recordatorio guardado");
                }}
              />
            ) : null;
          })()}
        {reminderFor === "arriendo" && (
          <PaymentReminderSheet
            title={`Arriendo · ${money(850000)} · día 30`}
            initial={data.payAlerts}
            onClose={() => setReminderFor(null)}
            onTest={() =>
              setAlarm({
                title: "Pago del arriendo",
                subtitle: `${money(850000)} para la Sra. Yolanda Mosquera`,
              })
            }
            onSave={(d) => {
              update({ payAlerts: d });
              setReminderFor(null);
              setToast("Avisos de pago guardados");
            }}
          />
        )}
        {alarm && (
          <AlarmScreen
            title={alarm.title}
            subtitle={alarm.subtitle}
            onSnooze={() => {
              setAlarm(null);
              setToast("Te aviso de nuevo en 5 minutos");
            }}
            onOk={() => setAlarm(null)}
          />
        )}
        {upgrade && (
          <UpgradeSheet
            feature={upgrade}
            current={data.plan}
            onClose={() => setUpgrade(null)}
            onChoose={(plan) => {
              update({ plan });
              setUpgrade(null);
              setToast(`¡Listo! Ahora tienes el plan ${plan}`);
            }}
          />
        )}
        {noteDraft && (
          <div className="modal-backdrop" onClick={() => setNoteDraft(null)}>
            <div
              className="modal-sheet"
              role="dialog"
              aria-modal="true"
              aria-label="Nuevo apunte"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-head">
                <h2>{noteDraft.id ? "Editar apunte" : "Nuevo apunte"}</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Cerrar"
                  onClick={() => setNoteDraft(null)}
                >
                  <X />
                </Button>
              </div>
              <div className="modal-form">
                <label>
                  Título
                  <Input
                    autoFocus
                    maxLength={100}
                    value={noteDraft.title}
                    onChange={(e) => setNoteDraft({ ...noteDraft, title: e.target.value })}
                    placeholder="Ej. Ideas para mañana"
                  />
                </label>
                <label>
                  Apunte
                  <Textarea
                    rows={7}
                    maxLength={5000}
                    value={noteDraft.body}
                    onChange={(e) => setNoteDraft({ ...noteDraft, body: e.target.value })}
                    placeholder="Escribe aquí lo que no quieres olvidar"
                    className="mt-2"
                  />
                </label>
                <Button className="h-12" onClick={saveNote}>
                  <Save /> Guardar apunte
                </Button>
              </div>
            </div>
          </div>
        )}
        {goalDraft && (
          <div className="modal-backdrop" onClick={() => setGoalDraft(null)}>
            <div
              className="modal-sheet"
              role="dialog"
              aria-modal="true"
              aria-label="Nueva meta de ahorro"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-head">
                <h2>Nueva meta de ahorro</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Cerrar"
                  onClick={() => setGoalDraft(null)}
                >
                  <X />
                </Button>
              </div>
              <div className="modal-form">
                <label>
                  ¿Para qué quieres ahorrar?
                  <Input
                    autoFocus
                    maxLength={80}
                    value={goalDraft.name}
                    onChange={(e) => setGoalDraft({ ...goalDraft, name: e.target.value })}
                    placeholder="Ej. Estudio, viaje, negocio"
                  />
                </label>
                <label>
                  ¿Cuánto necesitas?
                  <Input
                    type="number"
                    min="1"
                    inputMode="numeric"
                    value={goalDraft.target}
                    onChange={(e) => setGoalDraft({ ...goalDraft, target: e.target.value })}
                    placeholder="Monto en pesos"
                  />
                </label>
                <label>
                  Aporte inicial (opcional)
                  <Input
                    type="number"
                    min="0"
                    inputMode="numeric"
                    value={goalDraft.amount}
                    onChange={(e) => setGoalDraft({ ...goalDraft, amount: e.target.value })}
                    placeholder="0"
                  />
                </label>
                {Number(goalDraft.amount) > 0 && (
                  <label>
                    Desde
                    <select
                      value={goalDraft.method}
                      onChange={(e) => setGoalDraft({ ...goalDraft, method: e.target.value })}
                    >
                      <option>Nequi</option>
                      <option>Bancolombia</option>
                      <option>Efectivo</option>
                    </select>
                  </label>
                )}
                <Button className="h-12" onClick={saveGoal}>
                  <Target /> Crear meta
                </Button>
              </div>
            </div>
          </div>
        )}
        {contributionDraft && (
          <div className="modal-backdrop" onClick={() => setContributionDraft(null)}>
            <div
              className="modal-sheet"
              role="dialog"
              aria-modal="true"
              aria-label="Aportar a meta"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-head">
                <h2>Aportar a {data.goals.find((g) => g.id === contributionDraft.goalId)?.name}</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Cerrar"
                  onClick={() => setContributionDraft(null)}
                >
                  <X />
                </Button>
              </div>
              <div className="modal-form">
                <label>
                  Monto en pesos
                  <Input
                    autoFocus
                    type="number"
                    min="1"
                    inputMode="numeric"
                    value={contributionDraft.amount}
                    onChange={(e) =>
                      setContributionDraft({ ...contributionDraft, amount: e.target.value })
                    }
                    placeholder="Monto del aporte"
                  />
                </label>
                <label>
                  Desde
                  <select
                    value={contributionDraft.method}
                    onChange={(e) =>
                      setContributionDraft({ ...contributionDraft, method: e.target.value })
                    }
                  >
                    <option>Nequi</option>
                    <option>Bancolombia</option>
                    <option>Efectivo</option>
                  </select>
                </label>
                <Button className="h-12" onClick={() => contribute(contributionDraft.goalId)}>
                  <Coins /> Guardar aporte
                </Button>
              </div>
            </div>
          </div>
        )}
        {voiceOpen && (
          <VoiceSheet debts={data.debts} onClose={() => setVoiceOpen(false)} onSave={saveVoice} />
        )}
        {toast && !undo && (
          <div className="toast-message" role="status">
            {toast}
          </div>
        )}
        {undo && (
          <div className="toast-message undo-toast" role="status">
            <span>{undo.message}</span>
            <button
              type="button"
              onClick={() => {
                setData(undo.snapshot);
                setUndo(null);
                setToast("Cambios deshechos");
              }}
            >
              Deshacer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
function MovementList({ items }: { items: Movement[] }) {
  return (
    <div className="movement-list">
      {items.map((m) => (
        <div className="movement-row" key={m.id}>
          <span className={`movement-icon ${m.kind}`}>
            {m.kind === "ingreso" ? <ArrowDownLeft /> : <ArrowUpRight />}
          </span>
          <div>
            <strong>{m.title}</strong>
            <small>
              {m.method} · {formatDate(m.date, { day: "numeric", month: "short" })}
            </small>
          </div>
          <strong className={m.kind === "ingreso" ? "text-success" : ""}>
            {m.kind === "ingreso" ? "+" : "−"}
            {money(m.amount)}
          </strong>
        </div>
      ))}
      {!items.length && <Empty>Aún no hay movimientos.</Empty>}
    </div>
  );
}
function Debt({
  title,
  detail,
  amount,
  progress,
  incoming = false,
}: {
  title: string;
  detail: string;
  amount: number;
  progress: number;
  incoming?: boolean;
}) {
  return (
    <div className="debt-card">
      <div>
        <strong>{title}</strong>
        <span>{detail}</span>
      </div>
      <strong className={incoming ? "text-success" : ""}>{money(amount)}</strong>
      <div className="budget-track">
        <div style={{ width: `${progress}%` }} />
      </div>
      <small>{progress}% pagado</small>
    </div>
  );
}
function PageBack({ title, back }: { title: string; back: () => void }) {
  return (
    <div className="page-back">
      <Button variant="ghost" size="icon" aria-label="Volver" onClick={back}>
        <ChevronLeft />
      </Button>
      <h1>{title}</h1>
    </div>
  );
}
