import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Bot, Phone, MessageSquare, Database, CircuitBoard, ShieldCheck, Headphones, Mail, Download,
  Mic, MicOff, Volume2, VolumeX, ChevronRight, Building2, ClipboardList, Calculator, Cpu, Link2,
  Settings2, Car, Calendar, KanbanSquare,
} from "lucide-react";

// ---------- helpers ----------
const fmt = (n: number) => new Intl.NumberFormat("ru-RU").format(n);
const nowISO = () => new Date().toISOString();
const saveAs = (filename: string, text: string) => {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
};
const toCSV = (rows: Record<string, unknown>[]) => {
  if (!rows?.length) return "id,created_at,name,phone,department,comment,preferred_time,source,status";
  const headers = Object.keys(rows[0]);
  const csv = [headers.join(",")].concat(
    rows.map((r) => headers
      .map((h) => `"${String((r as any)[h] ?? "").replaceAll('"', '""')}"`)
      .join(","))
  );
  return csv.join("\n");
};

// ---------- static ----------
const DEPARTMENTS = [
  { value: "СТО", label: "СТО — ремонт и сервис" },
  { value: "ПРОДАЖИ_АВТО", label: "ПРОДАЖИ АВТО" },
  { value: "ЗАПАСНЫЕ", label: "Запчасти и аксессуары" },
  { value: "ДИРЕКТОР", label: "Руководство" },
  { value: "БУХГАЛТЕРИЯ", label: "Бухгалтерия" },
  { value: "МАРКЕТИНГ", label: "Маркетинг" },
  { value: "ОБОРУДОВАНИЕ", label: "Техническое оборудование" },
] as const;

const FEATURES = [
  { icon: <Headphones className="w-5 h-5" />, title: "Голосовая телефония", desc: "Asterisk AMI 18+, прослушивание входящих и маршрутизация по отделам." },
  { icon: <Bot className="w-5 h-5" />, title: "Нейроконсультация", desc: "Подбор авто: бюджет, кузов, привод. Модель LSTM + правила." },
  { icon: <Database className="w-5 h-5" />, title: "PostgreSQL + Alembic", desc: "users, sessions, messages, dialogues — миграции и логирование." },
  { icon: <MessageSquare className="w-5 h-5" />, title: "Telegram-бот", desc: "Текстовое взаимодействие и уведомления о пропущенных звонках." },
  { icon: <ShieldCheck className="w-5 h-5" />, title: "Уведомления", desc: "Email/Telegram оповещения при неудачных переводах звонков." },
  { icon: <CircuitBoard className="w-5 h-5" />, title: "Структурированное логирование", desc: "structlog в JSON — прозрачно, быстро, надёжно." },
];

type KBItem = { q: RegExp; a: React.ReactNode };
const KB: KBItem[] = [
  { q: /телефон|asterisk|ами|голос/i,
    a: <>Интеграция с <b>Asterisk AMI</b>: прослушивание входящих, воспроизведение аудио, перевод по отделам. В проде — SSL, мониторинг, бэкапы. Версия: <b>18+</b>.</> },
  { q: /алембик|миграц|schema|база|postgres/i,
    a: <>Таблицы <b>users</b>, <b>sessions</b>, <b>messages</b>, <b>dialogues</b>. Миграции — <b>Alembic</b>. Этот UI работает без сервера: заявки в LocalStorage + экспорт CSV.</> },
  { q: /нейро|lstm|модель|подбор/i,
    a: <>LSTM классифицирует <b>бюджет</b> (до 2.5М / 2.5–4М / 4М+), <b>кузов</b>, <b>привод</b>. Тренировка — <code>trainer.py</code>, артефакт — <code>model.pth</code>.</> },
  { q: /отдел|department|перевод/i,
    a: <>Поддерживаемые отделы: {DEPARTMENTS.map(d => d.value).join(", ")}. Выбор — в заявке.</> },
  { q: /скидк|trade|кредит|цена/i,
    a: <>Калькулятор оценивает цену с учётом трейд-ин, кредита и скидки салона — раздел <b>Инструменты → Калькулятор</b>.</> },
  { q: /env|настройк|токен|переменн/i,
    a: <>Собери конфиг в <b>Инструменты → .env генератор</b> и скачай готовый файл.</> },
];

// ---------- small UI atoms ----------
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-zinc-300">{label}</Label>
      {children}
    </div>
  );
}

function PipelineStep({ icon, title, subtitle }: {icon: React.ReactNode; title: string; subtitle: string;}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10">
      <div className="shrink-0 p-2 rounded-lg bg-white/10 border border-white/10 text-zinc-100">{icon}</div>
      <div>
        <div className="text-zinc-100 text-sm font-medium">{title}</div>
        <div className="text-zinc-400 text-xs">{subtitle}</div>
      </div>
    </div>
  );
}
const PipelineArrow = () => (
  <div className="flex items-center justify-center">
    <ChevronRight className="h-5 w-5 text-zinc-500" />
  </div>
);

// ---------- sections ----------
function Navbar({ onScrollToLeads, onOpenChat }: { onScrollToLeads: () => void; onOpenChat: () => void }) {
  return (
    <div className="sticky top-0 z-40 w-full backdrop-blur bg-neutral-950/60 border-b border-white/10">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-xl bg-gradient-to-br from-zinc-200 to-zinc-500" />
          <span className="text-zinc-100 font-semibold tracking-tight">NeuralBot</span>
          <Badge variant="secondary" className="ml-2 bg-white/10 text-zinc-300 border-white/10">Lovable</Badge>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm text-zinc-300">
          <a href="#features" className="hover:text-white">Возможности</a>
          <a href="#architecture" className="hover:text-white">Архитектура</a>
          <a href="#tools" className="hover:text-white">Инструменты</a>
          <button onClick={onScrollToLeads} className="hover:text-white">Заявки</button>
          <button onClick={onOpenChat} className="hover:text-white">Демо-чат</button>
        </div>
        <Button size="sm" variant="secondary" className="bg-white/10 text-zinc-100 border-white/10" onClick={onScrollToLeads}>
          <Phone className="mr-2 h-4 w-4" /> Перезвоните мне
        </Button>
      </div>
    </div>
  );
}

function Hero({ onCTACallback, onOpenChat }: { onCTACallback: () => void; onOpenChat: () => void }) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_80%_0%,rgba(255,255,255,0.08),transparent_60%)]" />
      <div className="mx-auto max-w-7xl px-4 pt-16 pb-24">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-5xl font-semibold tracking-tight text-zinc-100"
            >
              Интеллектуальный консультант для автосалона
            </motion.h1>
            <p className="mt-5 text-zinc-300 max-w-2xl leading-relaxed">
              Голос, Telegram и база данных в одном месте. NeuralBot принимает звонки через Asterisk, подбирает авто с помощью нейросети и фиксирует диалоги в PostgreSQL.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" onClick={onOpenChat}>
                <Bot className="mr-2 h-5 w-5" /> Смотреть демо-чат
              </Button>
              <Button size="lg" variant="secondary" className="bg-white/10 text-zinc-100 border-white/10" onClick={onCTACallback}>
                <Phone className="mr-2 h-5 w-5" /> Оставить номер
              </Button>
              <a href="https://t.me/" target="_blank" rel="noreferrer">
                <Button size="lg" variant="outline" className="border-white/20 text-zinc-200">
                  <MessageSquare className="mr-2 h-5 w-5" /> Написать в Telegram
                </Button>
              </a>
            </div>
            <div className="mt-6 flex items-center gap-3 text-xs text-zinc-400">
              <ShieldCheck className="h-4 w-4" /> Неброская, дорогая палитра. Стеклянные карточки, аккуратные анимации.
            </div>
          </div>
          <div className="lg:col-span-5">
            <DemoDiagram />
          </div>
        </div>
      </div>
    </section>
  );
}

function DemoDiagram() {
  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-zinc-100 text-base flex items-center gap-2"><CircuitBoard className="h-4 w-4" /> Поток звонка</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-zinc-300 text-sm">
          <div className="flex flex-col gap-3">
            <PipelineStep icon={<Phone className="h-4 w-4" />} title="Asterisk AMI" subtitle="Входящий звонок" />
            <PipelineArrow />
            <PipelineStep icon={<Bot className="h-4 w-4" />} title="NeuralBot" subtitle="Анализ намерения" />
            <PipelineArrow />
            <PipelineStep icon={<ClipboardList className="h-4 w-4" />} title="Маршрутизация" subtitle="Перевод в отдел" />
            <PipelineArrow />
            <PipelineStep icon={<Mail className="h-4 w-4" />} title="Уведомления" subtitle="Email / Telegram" />
            <PipelineArrow />
            <PipelineStep icon={<Database className="h-4 w-4" />} title="PostgreSQL" subtitle="Сессии и диалоги" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Features() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-4 py-14">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-zinc-100">Возможности</h2>
        <p className="text-zinc-400 mt-2 max-w-3xl">По README: кратко и по делу.</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {FEATURES.map((f, i) => (
          <Card key={i} className="bg-white/5 border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-zinc-100 text-base flex items-center gap-2">
                <span className="p-2 rounded-lg bg-white/10 border border-white/10">{f.icon}</span>
                {f.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-zinc-400">{f.desc}</CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function Architecture() {
  const code = `src/
├── telephony/
│   └── asterisk_connector.py
├── models.py
├── consultant.py
├── consultant_net.py
├── dialogue.py
├── handlers.py
├── tokenization.py
├── trainer.py
└── bot.py`;
  return (
    <section id="architecture" className="mx-auto max-w-7xl px-4 pb-8">
      <div className="grid lg:grid-cols-2 gap-6 items-start">
        <Card className="bg-white/5 border-white/10">
          <CardHeader><CardTitle className="text-zinc-100 text-base flex items-center gap-2"><Cpu className="h-4 w-4" /> Архитектура кода</CardTitle></CardHeader>
          <CardContent><pre className="text-xs p-4 rounded-lg bg-black/40 border border-white/10 text-zinc-200 overflow-auto">{code}</pre></CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardHeader><CardTitle className="text-zinc-100 text-base flex items-center gap-2"><Settings2 className="h-4 w-4" /> Требования</CardTitle></CardHeader>
          <CardContent className="text-sm text-zinc-300 space-y-3">
            <div><span className="text-zinc-400">Системно:</span> Python 3.8+, PostgreSQL 12+, Asterisk 18+</div>
            <div><span className="text-zinc-400">Python:</span> asyncpg, torch, pyst2, structlog, alembic</div>
            <div><span className="text-zinc-400">Команда:</span> <code>pip install -r requirements.txt</code></div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function PriceCalculator() {
  const [base, setBase] = useState<number>(3000000);
  const [tradeIn, setTradeIn] = useState<number>(5);
  const [credit, setCredit] = useState<number>(7);
  const [dealer, setDealer] = useState<number>(3);
  const price = useMemo(() => {
    const discounts = (tradeIn + credit + dealer) / 100;
    return Math.max(0, Math.round(base * (1 - discounts)));
  }, [base, tradeIn, credit, dealer]);

  return (
    <div className="grid md:grid-cols-2 gap-6 mt-6">
      <Card className="bg-white/5 border-white/10">
        <CardHeader><CardTitle className="text-zinc-100 text-base">Параметры</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Field label="Базовая цена (₽)">
            <Input type="number" value={base} onChange={(e) => setBase(Number(e.target.value || 0))} />
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Трейд-ин %"><Input type="number" value={tradeIn} onChange={(e) => setTradeIn(Number(e.target.value || 0))} /></Field>
            <Field label="Кредит %"><Input type="number" value={credit} onChange={(e) => setCredit(Number(e.target.value || 0))} /></Field>
            <Field label="Салон %"><Input type="number" value={dealer} onChange={(e) => setDealer(Number(e.target.value || 0))} /></Field>
          </div>
          <div className="text-xs text-zinc-400">Оценка комбинированных скидок. Для точности — подключите прайсы.</div>
        </CardContent>
      </Card>
      <Card className="bg-white/5 border-white/10">
        <CardHeader><CardTitle className="text-zinc-100 text-base">Итог</CardTitle></CardHeader>
        <CardContent>
          <div className="text-4xl font-semibold text-zinc-100">{fmt(price)} ₽</div>
          <div className="text-zinc-400 mt-2">Скидка: {(100 - Math.round((price / (base || 1)) * 100))}%</div>
        </CardContent>
      </Card>
    </div>
  );
}

function EnvGenerator({ onDownloadEnv }: { onDownloadEnv: (t: string) => void }) {
  const [env, setEnv] = useState<Record<string, string>>({
    DB_HOST: "127.0.0.1", DB_PORT: "5432", DB_NAME: "neuralbot", DB_USER: "botuser", DB_PASSWORD: "your_password",
    TELEGRAM_TOKEN: "", TG_CHANNEL_ID: "",
    ASTERISK_HOST: "127.0.0.1", ASTERISK_PORT: "5038", ASTERISK_USER: "admin", ASTERISK_SECRET: "password",
    SMTP_SERVER: "smtp.gmail.com", SMTP_PORT: "587", SMTP_LOGIN: "", SMTP_PASSWORD: "", DEPARTMENT_EMAIL: "department@company.com",
  });
  const envText = Object.entries(env).map(([k, v]) => `${k}=${v}`).join("\n");
  return (
    <div className="grid md:grid-cols-2 gap-6 mt-6">
      <Card className="bg-white/5 border-white/10">
        <CardHeader><CardTitle className="text-zinc-100 text-base">Параметры</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {Object.keys(env).map((k) => (
            <Field key={k} label={k}><Input value={env[k]} onChange={(e) => setEnv((p) => ({ ...p, [k]: e.target.value }))} /></Field>
          ))}
        </CardContent>
      </Card>
      <Card className="bg-white/5 border-white/10">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-zinc-100 text-base">.env</CardTitle>
          <Button size="sm" onClick={() => onDownloadEnv(envText)}><Download className="mr-2 h-4 w-4" /> Скачать</Button>
        </CardHeader>
        <CardContent>
          <Textarea className="min-h-[360px]" value={envText} readOnly />
          <div className="text-xs text-zinc-400 mt-2">Файл готов к использованию в корне проекта.</div>
        </CardContent>
      </Card>
    </div>
  );
}

function LeadsTable({ leads, onExportCSV }: { leads: any[]; onExportCSV: () => void }) {
  return (
    <div className="mt-6">
      <Card className="bg-white/5 border-white/10">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-zinc-100 text-base">Заявки на перезвон</CardTitle>
          <Button variant="outline" className="border-white/20 text-zinc-100" onClick={onExportCSV}>
            <Download className="mr-2 h-4 w-4" /> Экспорт CSV
          </Button>
        </CardHeader>
        <CardContent>
          {leads.length === 0 ? (
            <div className="text-zinc-400 text-sm">Пока пусто. Оставьте номер — заявки появятся здесь.</div>
          ) : (
            <div className="overflow-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-zinc-400">
                    <th className="text-left p-2">Дата</th>
                    <th className="text-left p-2">Имя</th>
                    <th className="text-left p-2">Телефон</th>
                    <th className="text-left p-2">Отдел</th>
                    <th className="text-left p-2">Комментарий</th>
                    <th className="text-left p-2">Когда удобно</th>
                    <th className="text-left p-2">Источник</th>
                    <th className="text-left p-2">Статус</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {leads.map((l) => (
                    <tr key={l.id} className="text-zinc-200">
                      <td className="p-2">{new Date(l.created_at).toLocaleString()}</td>
                      <td className="p-2">{l.name}</td>
                      <td className="p-2">{l.phone}</td>
                      <td className="p-2">{l.department}</td>
                      <td className="p-2">{l.comment}</td>
                      <td className="p-2">{l.preferred_time || "—"}</td>
                      <td className="p-2">{l.source}</td>
                      <td className="p-2">{l.status || "Новый"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CallbackForm({ onSubmit }: { onSubmit: (x: any) => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [dept, setDept] = useState(DEPARTMENTS[1].value);
  const [comment, setComment] = useState("");
  const [prefTime, setPrefTime] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return alert("Введите телефон");
    onSubmit({ name, phone, department: dept, comment, preferred_time: prefTime });
    setName(""); setPhone(""); setComment(""); setPrefTime("");
  };

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader><CardTitle className="text-zinc-100 text-base flex items-center gap-2"><Phone className="h-4 w-4" /> Оставить номер для перезвона</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={submit} className="grid md:grid-cols-2 gap-4">
          <Field label="Имя"><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Например, Роман" /></Field>
          <Field label="Телефон *"><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+7 XXX XXX-XX-XX" /></Field>
          <Field label="Отдел">
            <Select value={dept} onValueChange={setDept}>
              <SelectTrigger><SelectValue placeholder="Выберите отдел" /></SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map((d) => (<SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Когда удобно"><Input value={prefTime} onChange={(e) => setPrefTime(e.target.value)} placeholder="Сегодня 15:00 / Завтра до 12:00" /></Field>
          <div className="md:col-span-2"><Field label="Комментарий"><Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Модель, бюджет, предпочтения" /></Field></div>
          <div className="md:col-span-2 flex items-center justify-between">
            <div className="text-xs text-zinc-500">Данные сохраняются только в вашем браузере. Можно экспортировать в CSV.</div>
            <Button type="submit"><Phone className="mr-2 h-4 w-4" /> Отправить</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// ---------- showcase / test-drive / crm ----------
function CarShowcase() {
  const CARS = [
    { id: 1, model: "Geely Coolray", type: "Кроссовер", drive: "передний", budget: "до 2.5М", price: 2100000, color: "Белый" },
    { id: 2, model: "Geely Tugella", type: "Купе-кроссовер", drive: "полный", budget: "2.5-4М", price: 3500000, color: "Черный" },
    { id: 3, model: "Geely Monjaro", type: "Кроссовер", drive: "полный", budget: "4М+", price: 4800000, color: "Серый" },
  ];
  const [filter, setFilter] = useState({ type: "", drive: "", budget: "" });
  const cars = CARS.filter((c) =>
    (!filter.type || c.type.includes(filter.type)) &&
    (!filter.drive || c.drive === filter.drive) &&
    (!filter.budget || c.budget === filter.budget)
  );
  return (
    <section className="mx-auto max-w-7xl px-4 py-14">
      <h2 className="text-2xl font-semibold text-zinc-100 mb-6 flex items-center gap-2"><Car className="h-5 w-5" /> Автомобили в наличии</h2>
      <div className="flex flex-wrap gap-4 mb-6">
        <Select value={filter.type} onValueChange={(v) => setFilter((p) => ({ ...p, type: v }))}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Тип кузова" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">Любой</SelectItem>
            <SelectItem value="Кроссовер">Кроссовер</SelectItem>
            <SelectItem value="Купе-кроссовер">Купе-кроссовер</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filter.drive} onValueChange={(v) => setFilter((p) => ({ ...p, drive: v }))}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Привод" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">Любой</SelectItem>
            <SelectItem value="передний">Передний</SelectItem>
            <SelectItem value="полный">Полный</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filter.budget} onValueChange={(v) => setFilter((p) => ({ ...p, budget: v }))}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Бюджет" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">Любой</SelectItem>
            <SelectItem value="до 2.5М">до 2.5М</SelectItem>
            <SelectItem value="2.5-4М">2.5-4М</SelectItem>
            <SelectItem value="4М+">4М+</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {cars.map((c) => (
          <Card key={c.id} className="bg-white/5 border-white/10">
            <CardHeader><CardTitle className="text-zinc-100 text-base flex items-center gap-2">{c.model}</CardTitle></CardHeader>
            <CardContent className="text-sm text-zinc-300 space-y-1">
              <div>Кузов: {c.type}</div><div>Привод: {c.drive}</div><div>Бюджет: {c.budget}</div>
              <div>Цена: {fmt(c.price)} ₽</div><div>Цвет: {c.color}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function TestDriveForm({ onSubmit }: { onSubmit: (x: any) => void }) {
  const MODELS = ["Geely Coolray", "Geely Tugella", "Geely Monjaro"];
  const [name, setName] = useState(""); const [phone, setPhone] = useState("");
  const [model, setModel] = useState(MODELS[0]); const [date, setDate] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return alert("Введите телефон");
    onSubmit({ name, phone, model, preferred_time: date, source: "TestDrive" });
    setName(""); setPhone(""); setDate("");
  };
  return (
    <Card className="bg-white/5 border-white/10 mt-8">
      <CardHeader><CardTitle className="text-zinc-100 text-base flex items-center gap-2"><Calendar className="h-4 w-4" /> Запись на тест-драйв</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={submit} className="grid md:grid-cols-2 gap-4">
          <Field label="Имя"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <Field label="Телефон *"><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></Field>
          <Field label="Модель">
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{MODELS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Дата и время"><Input type="text" value={date} onChange={(e) => setDate(e.target.value)} placeholder="Завтра 15:00" /></Field>
          <div className="md:col-span-2 flex justify-end"><Button type="submit">Отправить</Button></div>
        </form>
      </CardContent>
    </Card>
  );
}

function CRMKanban({ leads, setLeads }: { leads: any[]; setLeads: React.Dispatch<React.SetStateAction<any[]>> }) {
  const statuses = ["Новый", "В работе", "Завершен"];
  const moveLead = (id: string, status: string) => setLeads((ls) => ls.map((l) => l.id === id ? { ...l, status } : l));
  return (
    <section className="mx-auto max-w-7xl px-4 py-14">
      <h2 className="text-2xl font-semibold text-zinc-100 mb-6 flex items-center gap-2"><KanbanSquare className="h-5 w-5" /> CRM-lite</h2>
      <div className="grid md:grid-cols-3 gap-4">
        {statuses.map((s) => (
          <div key={s} className="bg-white/5 border-white/10 rounded-xl p-3">
            <div className="font-medium text-zinc-200 mb-2">{s}</div>
            <div className="space-y-2">
              {leads.filter((l) => (l.status || "Новый") === s).map((l) => (
                <div key={l.id} className="p-2 rounded-lg bg-white/10 text-zinc-100 text-sm">
                  <div>{l.name || "Без имени"} ({l.phone})</div>
                  <div className="text-xs text-zinc-400">{l.department || l.model || "—"}</div>
                  <div className="flex gap-1 mt-2">
                    {statuses.filter((x) => x !== s).map((x) => (
                      <Button key={x} size="sm" variant="outline" className="border-white/20 text-zinc-300" onClick={() => moveLead(l.id, x)}>{x}</Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ---------- chat widget ----------
function FloatingChat({
  open, onToggle, onSend, messages, input, setInput, ttsOn, setTtsOn, sttOn, startSTT, stopSTT, sttSupported,
}: any) {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, open]);
  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open ? (
        <Card className="w-[360px] h-[520px] bg-neutral-900/95 border-white/10 shadow-2xl backdrop-blur">
          <CardHeader className="py-3 flex flex-row items-center justify-between">
            <CardTitle className="text-zinc-100 text-base flex items-center gap-2"><Bot className="h-4 w-4" /> NeuralBot</CardTitle>
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant="ghost" className="text-zinc-300 hover:text-white" onClick={() => setTtsOn(!ttsOn)}>
                      {ttsOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Озвучка ответов</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              {sttSupported && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button size="icon" variant="ghost" className="text-zinc-300 hover:text-white" onClick={sttOn ? stopSTT : startSTT}>
                        {sttOn ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Голосовой ввод</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              <Button size="sm" variant="outline" className="border-white/20 text-zinc-200" onClick={onToggle}>Свернуть</Button>
            </div>
          </CardHeader>
          <CardContent className="h-[420px] p-3 flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {messages.map((m: any, i: number) => (
                <div key={i} className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${m.role === "user" ? "ml-auto bg-white/10 text-zinc-100" : "bg-white/5 text-zinc-200 border border-white/10"}`}>
                  {m.content}
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
            <form
              onSubmit={(e) => { e.preventDefault(); if (!input.trim()) return; onSend(input); }}
              className="mt-3 flex items-center gap-2"
            >
              <Input placeholder="Спросите о проекте…" value={input} onChange={(e) => setInput(e.target.value)} />
              <Button type="submit">Отправить</Button>
            </form>
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              {["Какие отделы поддерживаете?", "Как настроить .env?", "Что с миграциями БД?", "Как посчитать скидку?"].map((s) => (
                <button key={s} onClick={() => onSend(s)} className="px-2 py-1 rounded-full bg-white/10 text-zinc-300 hover:text-white">{s}</button>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button size="lg" className="shadow-xl" onClick={onToggle}><Bot className="mr-2 h-5 w-5" /> Чат</Button>
      )}
    </div>
  );
}

// ---------- page ----------
export default function Index() {
  // leads storage
  const [leads, setLeads] = useState<any[]>(() => {
    try {
      const raw = localStorage.getItem("neuralbot_leads") || "[]";
      const parsed = JSON.parse(raw);
      return parsed.map((l: any) => ({ status: "Новый", ...l }));
    } catch { return []; }
  });
  useEffect(() => { localStorage.setItem("neuralbot_leads", JSON.stringify(leads)); }, [leads]);
  const addLead = (partial: any) => {
    const id = (crypto as any)?.randomUUID?.() || String(Math.random()).slice(2);
    const lead = { id, created_at: nowISO(), source: "Lovable", status: "Новый", ...partial };
    setLeads((p) => [lead, ...p]);
  };

  // chat demo
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([
    { role: "assistant", content: <>Привет! Я демо-версия NeuralBot без бэкенда. Отвечу на вопросы по проекту и помогу оставить заявку.</> },
  ]);
  const [input, setInput] = useState(""); const [ttsOn, setTtsOn] = useState(false);
  useEffect(() => {
    if (!ttsOn) return;
    const last = messages[messages.length - 1];
    if (last?.role === "assistant") {
      const text = typeof last.content === "string" ? last.content : (last.content as any)?.props?.children?.map?.(String).join(" ") || "";
      if (text) {
        const u = new SpeechSynthesisUtterance(text.replace(/<[^>]+>/g, " "));
        u.lang = "ru-RU"; window.speechSynthesis.speak(u);
      }
    }
  }, [messages, ttsOn]);
  const recRef = useRef<any>(null); const [sttOn, setSttOn] = useState(false);
  const sttSupported = typeof window !== "undefined" && ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  const startSTT = () => {
    if (!sttSupported || sttOn) return;
    const R = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const rec = new R(); rec.lang = "ru-RU"; rec.interimResults = false;
    rec.onresult = (e: any) => { const text = Array.from(e.results).map((r: any) => r[0].transcript).join(" "); setInput((prev) => (prev ? prev + " " : "") + text); };
    rec.onend = () => setSttOn(false); rec.start(); recRef.current = rec; setSttOn(true);
  };
  const stopSTT = () => { recRef.current?.stop(); setSttOn(false); };

  const ask = (q: string) => {
    const hit = KB.find((k) => k.q.test(q));
    return hit?.a || <>Я расскажу об архитектуре, .env, миграциях БД, отделах, телефонии и калькуляторе. Спросите: <i>«Как настроить .env?»</i></>;
  };
  const onSend = (text: string) => {
    setMessages((m) => [...m, { role: "user", content: text }]); setInput("");
    const answer = ask(text); setTimeout(() => setMessages((m) => [...m, { role: "assistant", content: answer }]), 250);
  };

  const leadsRef = useRef<HTMLDivElement | null>(null);
  const scrollToLeads = () => leadsRef.current?.scrollIntoView({ behavior: "smooth" });
  const onExportCSV = () => saveAs(`neuralbot_leads_${new Date().toISOString().slice(0,10)}.csv`, toCSV(leads));
  const onDownloadEnv = (text: string) => saveAs(".env", text);

  return (
    <div className="min-h-screen bg-neutral-950 text-zinc-100">
      <Navbar onScrollToLeads={scrollToLeads} onOpenChat={() => setChatOpen(true)} />
      <Hero onCTACallback={scrollToLeads} onOpenChat={() => setChatOpen(true)} />
      <Features />
      <Architecture />
      <CarShowcase />

      <section className="mx-auto max-w-7xl px-4 pb-14">
        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <CallbackForm onSubmit={addLead} />
            <TestDriveForm onSubmit={addLead} />
          </div>
          <div className="lg:col-span-2 flex flex-col gap-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader><CardTitle className="text-zinc-100 text-base flex items-center gap-2"><Building2 className="h-4 w-4" /> Отделы</CardTitle></CardHeader>
              <CardContent className="text-sm text-zinc-300">
                <ul className="space-y-2">
                  {DEPARTMENTS.map((d) => (<li key={d.value} className="flex items-center gap-2"><Badge variant="outline" className="border-white/20">{d.value}</Badge> <span className="text-zinc-400">{d.label}</span></li>))}
                </ul>
              </CardContent>
            </Card>
            <Card className="bg-white/5 border-white/10">
              <CardHeader><CardTitle className="text-zinc-100 text-base flex items-center gap-2"><Link2 className="h-4 w-4" /> Быстрые ссылки</CardTitle></CardHeader>
              <CardContent className="text-sm text-zinc-300 space-y-2">
                <div>Запуск Telegram-бота: <code>python bot.py</code></div>
                <div>Голосовой сервис: <code>python src/telephony/asterisk_connector.py</code></div>
                <div>Миграции Alembic: <code>alembic upgrade head</code></div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section ref={leadsRef} className="mx-auto max-w-7xl px-4 pb-20">
        <section id="tools" className="py-14">
          <h2 className="text-2xl font-semibold text-zinc-100 mb-6">Инструменты</h2>
          <Tabs defaultValue="calc" className="w-full">
            <TabsList className="bg-white/5 border border-white/10">
              <TabsTrigger value="calc" className="data-[state=active]:bg-white/10"><Calculator className="h-4 w-4 mr-2" /> Калькулятор</TabsTrigger>
              <TabsTrigger value="env" className="data-[state=active]:bg-white/10"><Settings2 className="h-4 w-4 mr-2" /> .env генератор</TabsTrigger>
              <TabsTrigger value="leads" className="data-[state=active]:bg-white/10"><ClipboardList className="h-4 w-4 mr-2" /> Заявки ({leads.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="calc"><PriceCalculator /></TabsContent>
            <TabsContent value="env"><EnvGenerator onDownloadEnv={onDownloadEnv} /></TabsContent>
            <TabsContent value="leads"><LeadsTable leads={leads} onExportCSV={onExportCSV} /></TabsContent>
          </Tabs>
        </section>
        <LeadsTable leads={leads} onExportCSV={onExportCSV} />
      </section>

      <CRMKanban leads={leads} setLeads={setLeads} />

      <footer className="mx-auto max-w-7xl px-4 py-12 text-sm text-zinc-400 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>© {new Date().getFullYear()} NeuralBot. Все права защищены.</div>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-white">Политика конфиденциальности</a>
          <a href="#" className="hover:text-white">Контакты</a>
        </div>
      </footer>

      <FloatingChat
        open={chatOpen} onToggle={() => setChatOpen(!chatOpen)} onSend={(t: string) => {
          setMessages((m) => [...m, { role: "user", content: t }]); setInput("");
          const answer = KB.find(k => k.q.test(t))?.a || <>Спросите: <i>«Как настроить .env?»</i></>;
          setTimeout(() => setMessages((m) => [...m, { role: "assistant", content: answer }]), 250);
        }}
        messages={messages} input={input} setInput={setInput}
        ttsOn={ttsOn} setTtsOn={setTtsOn}
        sttOn={sttOn}
        startSTT={() => {
          if (!sttSupported || sttOn) return;
          const R = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
          const rec = new R(); rec.lang = "ru-RU"; rec.interimResults = false;
          rec.onresult = (e: any) => { const text = Array.from(e.results).map((r: any) => r[0].transcript).join(" "); setInput((prev) => (prev ? prev + " " : "") + text); };
          rec.onend = () => setSttOn(false); rec.start(); (recRef as any).current = rec; setSttOn(true);
        }}
        stopSTT={() => { (recRef as any).current?.stop(); setSttOn(false); }}
        sttSupported={!!sttSupported}
      />

      {/* background gradients */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(40%_40%_at_30%_0%,rgba(219,190,140,0.10),transparent_60%),radial-gradient(50%_50%_at_100%_50%,rgba(200,200,200,0.06),transparent_60%)]" />
    </div>
  );
}
