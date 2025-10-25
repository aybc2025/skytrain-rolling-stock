import React, { useMemo, useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { motion } from "framer-motion";
import { Search, TrainFront, Info, Filter, RefreshCcw, ArrowUpDown } from "lucide-react";

/*
  דרישות:
  - npm i recharts framer-motion lucide-react
  - Tailwind פעיל (v4: פלאגין @tailwindcss/vite בקובץ vite.config.js + @import "tailwindcss"; ב-index.css)
  - public/rolling_stock.json (אם חסר—פולבק פנימי)
*/

// -------------------- FALLBACK DATA (לטעינה אם ה-JSON לא קיים) --------------------
const FALLBACK = {
  totals: {
    inService: 405,
    retired: { model: "Mark I", cars: 6 }
  },
  formation: [
    { labelHe: "סימן I", labelEn: "Mark I", perTrainset: 6 },
    { labelHe: "סימן II/III", labelEn: "Mark II/III", perTrainset: 4 },
    { labelHe: "סימן V", labelEn: "Mark V", perTrainset: 5 },
    { labelHe: "קנדה ליין (EMU)", labelEn: "Canada Line (EMU)", perTrainset: 2 }
  ],
  stock: [
    {
      id: "mk1",
      name: "סימן I",
      nameEn: "Mark I",
      maker: "UTDC / Bombardier",
      enteredService: "1985–הווה",
      status: "בשירות",
      carCount: 144,
      consist: "6 קרונות לרכבת (זוגות נשואים)",
      lines: ["Expo", "Millennium"],
      notes: "6 קרונות פרשו משירות.",
      image: "https://commons.wikimedia.org/wiki/File:Skytrain_Mk_I_in_new_Translink_livery_arriving_at_Holdom_Skytrain_station.jpg"
    },
    {
      id: "mk2",
      name: "סימן II",
      nameEn: "Mark II",
      maker: "Bombardier",
      enteredService: "2002–הווה",
      status: "בשירות",
      carCount: 108,
      consist: "4 קרונות לרכבת (לעיתים 2 במערך נשוי)",
      lines: ["Expo", "Millennium"],
      notes: "",
      image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/SkyTrain_Mark_II.jpg/480px-SkyTrain_Mark_II.jpg"
    },
    {
      id: "mk3",
      name: "סימן III",
      nameEn: "Mark III",
      maker: "Bombardier / Alstom",
      enteredService: "2016–הווה",
      status: "בשירות",
      carCount: 84,
      consist: "4 קרונות לרכבת (קבוע)",
      lines: ["Expo", "Millennium"],
      notes: "",
      image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/SkyTrain_Mark_III.jpg/480px-SkyTrain_Mark_III.jpg"
    },
    {
      id: "mk5",
      name: "סימן V",
      nameEn: "Mark V",
      maker: "Alstom",
      enteredService: "מאז 2025",
      status: "בשירות (פריסה הדרגתית)",
      carCount: 20,
      consist: "5 קרונות לרכבת (קבוע)",
      lines: ["Expo", "Millennium"],
      notes: "",
      image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/TransLink_Mark_V.jpg/480px-TransLink_Mark_V.jpg"
    },
    {
      id: "emu",
      name: "קנדה ליין – EMU",
      nameEn: "Canada Line EMU",
      maker: "Hyundai Rotem",
      enteredService: "2009–הווה",
      status: "בשירות",
      carCount: 64,
      consist: "2 קרונות לרכבת",
      lines: ["Canada"],
      notes: "",
      image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Canada_Line_train.jpg/480px-Canada_Line_train.jpg"
    }
  ],
  summaryTable: [
    { builder: "Urban Transportation Development Corporation", model: "ICTS Mark I", yearAcquired: "1984–1986", quantity: 114, fleetNumbers: "001–056; 061–118" },
    { builder: "Urban Transportation Development Corporation", model: "ICTS Mark I", yearAcquired: "1990–1991", quantity: 16,  fleetNumbers: "121–136" },
    { builder: "Urban Transportation Development Corporation", model: "ICTS Mark I", yearAcquired: "1994–1995", quantity: 20,  fleetNumbers: "137–156" },
    { builder: "Bombardier Transportation", model: "ART Mark II", yearAcquired: "2000–2002", quantity: 60, fleetNumbers: "201–260" },
    { builder: "Bombardier Transportation", model: "ART Mark II", yearAcquired: "2009",       quantity: 34, fleetNumbers: "301–334" },
    { builder: "Bombardier Transportation", model: "ART Mark II", yearAcquired: "2010",       quantity: 14, fleetNumbers: "335–348" },
    { builder: "Bombardier Transportation / Alstom", model: "Innovia Metro Mark III", yearAcquired: "2016",       quantity: 28, fleetNumbers: "401–428" },
    { builder: "Bombardier Transportation / Alstom", model: "Innovia Metro Mark III", yearAcquired: "2018–2020", quantity: 56, fleetNumbers: "429–484" },
    { builder: "Alstom", model: "Innovia Metro Mark V", yearAcquired: "מאז 2025", quantity: 20, fleetNumbers: "" },
    { builder: "Hyundai Rotem", model: "EMU", yearAcquired: "2009",        quantity: 40, fleetNumbers: "101–120; 201–220" },
    { builder: "Hyundai Rotem", model: "EMU", yearAcquired: "2019–2020",  quantity: 24, fleetNumbers: "121–132; 221–232" }
  ],
  capacityTable: [
    // ICTS Mark I
    { model: "ICTS Mark I (1984–1995)", lengthPerCar: "12.7 מ׳ (41′ 8″)", seatsPerCar: "22–36", capacityPerCar: "~80", carsPerTrain: "4 קרונות", lengthTrain: "50.8 מ׳ (166′ 8″)", capacityTrain: "332" },
    { model: "ICTS Mark I (1984–1995)", lengthPerCar: "12.7 מ׳ (41′ 8″)", seatsPerCar: "22–36", capacityPerCar: "~80", carsPerTrain: "6 קרונות", lengthTrain: "76.2 מ׳ (250′ 0″)",  capacityTrain: "498" },

    // ART Mark II (דור 1)
    { model: "ART Mark II (2000–2002)", lengthPerCar: "17.35 מ׳ (56′ 11⅛″)", seatsPerCar: "42", capacityPerCar: "123", carsPerTrain: "2 קרונות", lengthTrain: "34.7 מ׳ (113′ 10⅛″)", capacityTrain: "256" },
    { model: "ART Mark II (2000–2002)", lengthPerCar: "17.35 מ׳ (56′ 11⅛″)", seatsPerCar: "42", capacityPerCar: "123", carsPerTrain: "4 קרונות", lengthTrain: "69.4 מ׳ (227′ 8¼″)",  capacityTrain: "512" },

    // ART Mark II (דור 2; 2009/2010)
    { model: "ART Mark II (2nd generation; 2009/2010)", lengthPerCar: "—", seatsPerCar: "33", capacityPerCar: "130", carsPerTrain: "2 קרונות", lengthTrain: "34.7 מ׳ (113′ 10⅛″)", capacityTrain: "264" },
    { model: "ART Mark II (2nd generation; 2009/2010)", lengthPerCar: "—", seatsPerCar: "33", capacityPerCar: "130", carsPerTrain: "4 קרונות", lengthTrain: "69.4 מ׳ (227′ 8¼″)",  capacityTrain: "528" },

    // Mark III
    { model: "Innovia Metro Mark III (2016–2019)", lengthPerCar: "17.025 מ׳ (55′ 10¼″)", seatsPerCar: "30–33", capacityPerCar: "131–135", carsPerTrain: "4 קרונות", lengthTrain: "68.1 מ׳ (223′ 5⅛″)", capacityTrain: "532" },

    // Mark V
    { model: "Innovia Metro Mark V (since 2025)", lengthPerCar: "—", seatsPerCar: "134–139", capacityPerCar: "—", carsPerTrain: "5 קרונות", lengthTrain: "84.8 מ׳ (278′ 2⅝″)", capacityTrain: "672" },

    // Canada Line EMU
    { model: "Hyundai Rotem EMU (2009–present)", lengthPerCar: "20.5 מ׳ (67′ 3⅛″)", seatsPerCar: "44", capacityPerCar: "167", carsPerTrain: "2 קרונות", lengthTrain: "41 מ׳ (134′ 6⅛″)", capacityTrain: "334" }
  ]
};

// -------------------- UI HELPERS --------------------
const prettyNumber = (n) => (typeof n === "number" ? n.toLocaleString() : n);

// צבעים קבועים לגרף
const CHART_COLORS = {
  mk1: "#1f77b4",
  mk2: "#ff7f0e",
  mk3: "#2ca02c",
  mk5: "#9467bd",
  emu: "#17becf"
};

// תגיות קו (קנדה ליין בתכלת)
const LINE_COLORS = {
  Expo: "bg-cyan-700",
  Millennium: "bg-amber-500",
  Canada: "bg-[#00B3E3] text-white"
};

// -------------------- SMALL COMPONENTS --------------------
function Pill({ label }) {
  return <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700 border">{label}</span>;
}

function LineBadges({ lines }) {
  return (
    <div className="flex gap-1 flex-wrap">
      {lines.map((ln) => (
        <span key={ln} className={`px-2 py-0.5 rounded-full text-xs text-white ${LINE_COLORS[ln] ?? "bg-slate-600"}`}>
          {ln}
        </span>
      ))}
    </div>
  );
}

function StockCard({ item }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow p-4 flex flex-col gap-3 border hover:shadow-md transition-shadow"
    >
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-xl bg-slate-50 border flex items-center justify-center">
          <TrainFront className="w-7 h-7 text-slate-600" />
        </div>
        <div className="flex-1">
          <div className="font-bold text-lg">{item.name}</div>
          <div className="text-sm text-slate-600">{item.maker}</div>
        </div>
        <LineBadges lines={item.lines} />
      </div>

      {item.image && (
        <img src={item.image} alt={item.nameEn || item.name} className="w-full h-40 object-cover rounded-xl border" loading="lazy" />
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <div className="bg-slate-50 rounded-xl p-3 border">
          <div className="text-slate-500">בשירות מאז</div>
          <div className="font-semibold">{item.enteredService}</div>
        </div>
        <div className="bg-slate-50 rounded-xl p-3 border">
          <div className="text-slate-500">מס׳ קרונות</div>
          <div className="font-semibold">{prettyNumber(item.carCount)}</div>
        </div>
        <div className="bg-slate-50 rounded-xl p-3 border">
          <div className="text-slate-500">Formation</div>
          <div className="font-semibold">{item.consist}</div>
        </div>
        <div className="bg-slate-50 rounded-xl p-3 border">
          <div className="text-slate-500">סטטוס</div>
          <div className="font-semibold">{item.status}</div>
        </div>
      </div>

      {item.notes && (
        <div className="flex items-start gap-2 text-sm text-slate-700">
          <Info className="w-4 h-4 mt-0.5 text-slate-500" />
          <p>{item.notes}</p>
        </div>
      )}
    </motion.div>
  );
}

function Donut({ data, onSelect, selectedId }) {
  const totalCars = useMemo(() => data.reduce((a, b) => a + (b.carCount || 0), 0), [data]);
  const chartData = useMemo(() => data.map((d) => ({ name: d.name, value: d.carCount, id: d.id })), [data]);

  return (
    <div className="grid md:grid-cols-2 gap-6 items-center">
      <div className="h-72 w-full">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={110}
              paddingAngle={2}
              onClick={(e) => onSelect(e?.id)}
            >
              {chartData.map((entry) => (
                <Cell
                  key={entry.id}
                  cursor="pointer"
                  fill={CHART_COLORS[entry.id] || undefined}
                  opacity={selectedId && selectedId !== entry.id ? 0.5 : 1}
                />
              ))}
            </Pie>
            <Tooltip formatter={(v) => prettyNumber(v)} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="text-center md:text-left">
        <div className="text-sm uppercase tracking-widest text-slate-500">סה"כ קרונות</div>
        <div className="text-4xl font-extrabold mb-2">{prettyNumber(totalCars)}</div>
        <p className="text-slate-600">לחצו על פלח בעיגול כדי לסנן כרטיסי דגמים.</p>
      </div>
    </div>
  );
}

function SummaryTable({ rows }) {
  const [sortKey, setSortKey] = useState("yearAcquired");
  const [asc, setAsc] = useState(true);

  const sorted = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      const A = String(a[sortKey] ?? "").toLowerCase();
      const B = String(b[sortKey] ?? "").toLowerCase();
      if (A < B) return asc ? -1 : 1;
      if (A > B) return asc ? 1 : -1;
      return 0;
    });
    return copy;
  }, [rows, sortKey, asc]);

  const th = (key, label) => (
    <th
      className="text-left px-3 py-2 font-semibold text-slate-600 cursor-pointer"
      onClick={() => (setSortKey(key), setAsc(key === sortKey ? !asc : true))}
      title="לחץ/י למיון"
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <ArrowUpDown className="w-4 h-4" />
      </span>
    </th>
  );

  return (
    <div className="bg-white border rounded-2xl p-4 overflow-auto">
      <div className="font-semibold mb-3">Summary of SkyTrain fleet</div>
      <table className="min-w-[700px] w-full border-separate border-spacing-0 text-sm">
        <thead className="bg-slate-50">
          <tr>
            {th("builder", "Builder")}
            {th("model", "Model")}
            {th("yearAcquired", "Year acquired")}
            {th("quantity", "Quantity")}
            {th("fleetNumbers", "Fleet numbers")}
          </tr>
        </thead>
        <tbody>
          {sorted.map((r, i) => (
            <tr key={i} className="border-b last:border-b-0">
              <td className="px-3 py-2 border-b">{r.builder}</td>
              <td className="px-3 py-2 border-b">{r.model}</td>
              <td className="px-3 py-2 border-b">{r.yearAcquired}</td>
              <td className="px-3 py-2 border-b">{prettyNumber(r.quantity)}</td>
              <td className="px-3 py-2 border-b">{r.fleetNumbers || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CapacityTable({ rows }) {
  const [sortKey, setSortKey] = useState("model");
  const [asc, setAsc] = useState(true);

  const sorted = useMemo(() => {
    const c = [...rows];
    c.sort((a, b) => {
      const A = String(a[sortKey] ?? "").toLowerCase();
      const B = String(b[sortKey] ?? "").toLowerCase();
      if (A < B) return asc ? -1 : 1;
      if (A > B) return asc ? 1 : -1;
      return 0;
    });
    return c;
  }, [rows, sortKey, asc]);

  const th = (key, label) => (
    <th
      className="text-left px-3 py-2 font-semibold text-slate-600 cursor-pointer whitespace-nowrap"
      onClick={() => (setSortKey(key), setAsc(key === sortKey ? !asc : true))}
      title="לחץ/י למיון"
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <ArrowUpDown className="w-4 h-4" />
      </span>
    </th>
  );

  return (
    <div className="bg-white border rounded-2xl p-4 overflow-auto">
      <div className="font-semibold mb-3">תצורת רכבת וקיבולת</div>
      <table className="min-w-[900px] w-full border-separate border-spacing-0 text-sm">
        <thead className="bg-slate-50">
          <tr>
            {th("model", "Model")}
            {th("lengthPerCar", "אורך/קרון")}
            {th("seatsPerCar", "מושבים/קרון")}
            {th("capacityPerCar", "קיבולת/קרון")}
            {th("carsPerTrain", "קרונות/רכבת")}
            {th("lengthTrain", "אורך/רכבת")}
            {th("capacityTrain", "קיבולת/רכבת")}
          </tr>
        </thead>
        <tbody>
          {sorted.map((r, i) => (
            <tr key={i} className="border-b last:border-b-0">
              <td className="px-3 py-2 border-b whitespace-nowrap">{r.model}</td>
              <td className="px-3 py-2 border-b">{r.lengthPerCar}</td>
              <td className="px-3 py-2 border-b">{r.seatsPerCar}</td>
              <td className="px-3 py-2 border-b">{r.capacityPerCar}</td>
              <td className="px-3 py-2 border-b">{r.carsPerTrain}</td>
              <td className="px-3 py-2 border-b">{r.lengthTrain}</td>
              <td className="px-3 py-2 border-b">{r.capacityTrain}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// -------------------- MAIN APP --------------------
export default function App() {
  const [query, setQuery] = useState("");
  const [lineFilter, setLineFilter] = useState("All");
  const [selectedId, setSelectedId] = useState(null);
  const [data, setData] = useState(FALLBACK);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load external JSON (public/rolling_stock.json)
  useEffect(() => {
    let isMounted = true;
    const url = `${import.meta.env.BASE_URL}rolling_stock.json`;
    setLoading(true);
    fetch(url, { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const json = await r.json();
        if (isMounted) setData(json);
      })
      .catch((e) => {
        console.warn("Using FALLBACK data:", e);
        if (isMounted) setError("נטען מידע ברירת מחדל. וודא/י שקובץ rolling_stock.json קיים ותקין.");
      })
      .finally(() => isMounted && setLoading(false));
    return () => (isMounted = false);
  }, []);

  const stocks = data.stock || [];
  const lines = useMemo(() => ["All", ...Array.from(new Set(stocks.flatMap((d) => d.lines)))], [stocks]);

  const filtered = useMemo(() => {
    let arr = stocks;
    if (selectedId) arr = arr.filter((d) => d.id === selectedId);
    if (lineFilter !== "All") arr = arr.filter((d) => d.lines.includes(lineFilter));
    if (query.trim()) {
      const q = query.toLowerCase();
      arr = arr.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          (d.nameEn || "").toLowerCase().includes(q) ||
          d.maker.toLowerCase().includes(q) ||
          (d.notes ?? "").toLowerCase().includes(q)
      );
    }
    return arr;
  }, [stocks, query, lineFilter, selectedId]);

  const donutData = useMemo(() => {
    let arr = stocks;
    if (lineFilter !== "All") arr = arr.filter((d) => d.lines.includes(lineFilter));
    return arr;
  }, [stocks, lineFilter]);

  return (
    <div className="min-h-dvh bg-slate-50">
      <header className="sticky top-0 z-10 backdrop-blur bg-white/80 border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <TrainFront className="w-6 h-6 text-slate-700" />
          <h1 className="text-lg md:text-xl font-bold">צי הרכבות של סקייטריין — דשבורד</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 flex flex-col gap-6">
        {/* Summary */}
        <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white border rounded-2xl p-4">
            <div className="text-xs text-slate-500">מספר קרונות בשירות</div>
            <div className="text-2xl font-bold">{prettyNumber(data?.totals?.inService ?? 0)}</div>
          </div>
          <div className="bg-white border rounded-2xl p-4">
            <div className="text-xs text-slate-500">קרונות שפרשו</div>
            <div className="text-2xl font-bold">
              {prettyNumber(data?.totals?.retired?.cars ?? 0)} ({data?.totals?.retired?.model ?? ""})
            </div>
          </div>
          <div className="bg-white border rounded-2xl p-4 col-span-2">
            <div className="text-xs text-slate-500 mb-1">Formation / הרכבה</div>
            <ul className="text-sm list-disc ms-5">
              {data?.formation?.map((f, i) => (
                <li key={i}>
                  {f.perTrainset} קרונות לרכבת — {f.labelHe}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Controls */}
        <div className="grid md:grid-cols-3 gap-3">
          <div className="flex items-center gap-2 bg-white border rounded-xl px-3 py-2">
            <Search className="w-4 h-4 text-slate-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="חיפוש דגם / יצרן / הערות"
              className="w-full outline-none text-sm"
            />
          </div>

          <div className="flex items-center gap-2 bg-white border rounded-xl px-3 py-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={lineFilter}
              onChange={(e) => setLineFilter(e.target.value)}
              className="w-full text-sm bg-transparent outline-none"
            >
              {lines.map((ln) => (
                <option key={ln} value={ln}>
                  {ln === "All" ? "כל הקווים" : ln}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              setSelectedId(null);
              setLineFilter("All");
              setQuery("");
            }}
            className="flex items-center justify-center gap-2 bg-white border rounded-xl px-3 py-2 text-sm hover:bg-slate-50"
            title="איפוס סינונים"
          >
            <RefreshCcw className="w-4 h-4" /> איפוס
          </button>
        </div>

        {/* Donut */}
        <section className="bg-white border rounded-2xl p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Composition by total cars</h2>
            <div className="text-xs text-slate-500">Click a slice to filter</div>
          </div>

          {loading && <div className="text-sm text-slate-500">טוען נתונים…</div>}
          {error && (
            <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3">{error}</div>
          )}

          <Donut data={donutData} onSelect={setSelectedId} selectedId={selectedId} />
        </section>

        {/* Active filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {selectedId && <Pill label={`סינון לפי: ${selectedId}`} />}
          {lineFilter !== "All" && <Pill label={`קו: ${lineFilter}`} />}
          {query.trim() && <Pill label={`חיפוש: "${query}"`} />}
          {!selectedId && lineFilter === "All" && !query.trim() && (
            <span className="text-sm text-slate-500">אין סינון פעיל</span>
          )}
        </div>

        {/* Cards */}
        <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <StockCard key={item.id} item={item} />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center text-slate-500 bg-white border rounded-2xl p-10">
              לא נמצאו תוצאות.
            </div>
          )}
        </section>

        {/* Summary Table */}
        <SummaryTable rows={data.summaryTable || []} />

        {/* Capacity Table */}
        <CapacityTable rows={data.capacityTable || []} />

        {/* Footer note */}
        <footer className="text-center text-xs text-slate-500 py-8">
          מקור נתונים: TransLink / Wikipedia (עדכון ידני). ודא/י רישוי תמונות.
        </footer>
      </main>
    </div>
  );
}
