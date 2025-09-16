import React, { useEffect, useState } from "react";
import { Car, Calendar, KanbanSquare } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ---------- Helpers ----------
const fmt = (n: number) => new Intl.NumberFormat("ru-RU").format(n);
const nowISO = () => new Date().toISOString();

// ---------- Static content ----------
const CARS = [
  { id: 1, model: "Geely Coolray", type: "Кроссовер", drive: "передний", budget: "до 2.5М", price: 2100000, color: "Белый" },
  { id: 2, model: "Geely Tugella", type: "Купе-кроссовер", drive: "полный", budget: "2.5-4М", price: 3500000, color: "Черный" },
  { id: 3, model: "Geely Monjaro", type: "Кроссовер", drive: "полный", budget: "4М+", price: 4800000, color: "Серый" },
];

// ---------- Components ----------
function CarShowcase() {
  const ANY = "any";
  const [filter, setFilter] = useState({ type: ANY, drive: ANY, budget: ANY });

  const cars = CARS.filter((c) =>
    (filter.type === ANY || c.type.includes(filter.type)) &&
    (filter.drive === ANY || c.drive === filter.drive) &&
    (filter.budget === ANY || c.budget === filter.budget)
  );

  return (
    <section className="mx-auto max-w-7xl px-4 py-14">
      <h2 className="mb-6 flex items-center gap-2 text-2xl font-semibold text-zinc-100">
        <Car className="h-5 w-5" /> Автомобили в наличии
      </h2>

      <div className="mb-6 flex flex-wrap gap-4">
        {/* Тип кузова */}
        <Select
          value={filter.type}
          onValueChange={(v) => setFilter((p) => ({ ...p, type: v }))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Тип кузова" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Любой</SelectItem>
            <SelectItem value="Кроссовер">Кроссовер</SelectItem>
            <SelectItem value="Купе-кроссовер">Купе-кроссовер</SelectItem>
          </SelectContent>
        </Select>

        {/* Привод */}
        <Select
          value={filter.drive}
          onValueChange={(v) => setFilter((p) => ({ ...p, drive: v }))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Привод" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Любой</SelectItem>
            <SelectItem value="передний">Передний</SelectItem>
            <SelectItem value="полный">Полный</SelectItem>
          </SelectContent>
        </Select>

        {/* Бюджет */}
        <Select
          value={filter.budget}
          onValueChange={(v) => setFilter((p) => ({ ...p, budget: v }))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Бюджет" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Любой</SelectItem>
            <SelectItem value="до 2.5М">до 2.5М</SelectItem>
            <SelectItem value="2.5-4М">2.5-4М</SelectItem>
            <SelectItem value="4М+">4М+</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {cars.map((c) => (
          <Card key={c.id} className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-zinc-100">
                {c.model}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm text-zinc-300">
              <div>Кузов: {c.type}</div>
              <div>Привод: {c.drive}</div>
              <div>Бюджет: {c.budget}</div>
              <div>Цена: {fmt(c.price)} ₽</div>
              <div>Цвет: {c.color}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function TestDriveForm({ onSubmit }: { onSubmit: (lead: any) => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [model, setModel] = useState(CARS[0].model);
  const [date, setDate] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return alert("Введите телефон");
    onSubmit({
      id: crypto.randomUUID(),
      created_at: nowISO(),
      name,
      phone,
      model,
      preferred_time: date,
      status: "Новый",
      source: "TestDrive",
    });
    setName("");
    setPhone("");
    setDate("");
  };

  return (
    <Card className="mt-8 bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base text-zinc-100">
          <Calendar className="h-4 w-4" /> Запись на тест-драйв
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
          <Input placeholder="Имя" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Телефон *" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {CARS.map((c) => (
                <SelectItem key={c.id} value={c.model}>{c.model}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input placeholder="Дата и время" value={date} onChange={(e) => setDate(e.target.value)} />
          <div className="md:col-span-2 flex justify-end">
            <Button type="submit">Отправить</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function CRMKanban({
  leads,
  setLeads,
}: {
  leads: any[];
  setLeads: React.Dispatch<React.SetStateAction<any[]>>;
}) {
  const statuses = ["Новый", "В работе", "Завершен"];
  const moveLead = (id: string, status: string) =>
    setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, status } : l)));

  return (
    <section className="mx-auto max-w-7xl px-4 py-14">
      <h2 className="mb-6 flex items-center gap-2 text-2xl font-semibold text-zinc-100">
        <KanbanSquare className="h-5 w-5" /> CRM-lite
      </h2>
      <div className="grid gap-4 md:grid-cols-3">
        {statuses.map((s) => (
          <div key={s} className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="mb-2 font-medium text-zinc-200">{s}</div>
            <div className="space-y-2">
              {leads
                .filter((l) => (l.status || "Новый") === s)
                .map((l) => (
                  <div key={l.id} className="rounded-lg bg-white/10 p-2 text-sm text-zinc-100">
                    <div>
                      {l.name || "Без имени"} ({l.phone})
                    </div>
                    <div className="text-xs text-zinc-400">{l.model || "—"}</div>
                    <div className="mt-2 flex gap-1">
                      {statuses
                        .filter((x) => x !== s)
                        .map((x) => (
                          <Button key={x} onClick={() => moveLead(l.id, x)} className="px-2 py-1 text-xs">
                            {x}
                          </Button>
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

// ---------- Main App ----------
export default function App() {
  const [leads, setLeads] = useState<any[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("neuralbot_leads") || "[]");
    } catch {
      return [];
    }
  });
  useEffect(() => {
    localStorage.setItem("neuralbot_leads", JSON.stringify(leads));
  }, [leads]);

  return (
    <div className="min-h-screen bg-neutral-950 text-zinc-100">
      <CarShowcase />
      <section className="mx-auto max-w-7xl px-4 pb-20">
        <TestDriveForm onSubmit={(lead) => setLeads((p) => [lead, ...p])} />
      </section>
      <CRMKanban leads={leads} setLeads={setLeads} />
    </div>
  );
}
