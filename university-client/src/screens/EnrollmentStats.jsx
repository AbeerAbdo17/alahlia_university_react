import React, { useState, useEffect, useCallback } from "react";
import {
  FaChartBar, FaTimes, FaChevronDown, FaChevronUp,
  FaUniversity, FaUsers, FaGraduationCap, FaBookOpen, FaStar,
  FaChartLine,
} from "react-icons/fa";
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from "recharts";

const API_BASE = "http://localhost:5000/api";

const FACULTY_COLORS = [
  { bg: "#e0f2fe", accent: "#0284c7", bar: "#38bdf8" },
  { bg: "#f0fdf4", accent: "#16a34a", bar: "#4ade80" },
  { bg: "#fef3c7", accent: "#d97706", bar: "#fbbf24" },
  { bg: "#fdf4ff", accent: "#9333ea", bar: "#c084fc" },
  { bg: "#fff1f2", accent: "#e11d48", bar: "#fb7185" },
  { bg: "#f0f9ff", accent: "#0369a1", bar: "#7dd3fc" },
  { bg: "#fefce8", accent: "#ca8a04", bar: "#facc15" },
];

const PROGRAM_META = {
  bachelor:     { label: "بكالوريوس", color: "#2563eb", bg: "#eff6ff", icon: <FaGraduationCap /> },
  diploma:      { label: "دبلوم",      color: "#16a34a", bg: "#f0fdf4", icon: <FaBookOpen />     },
  postgraduate: { label: "دراسات عليا", color: "#9333ea", bg: "#fdf4ff", icon: <FaStar />        },
};

const PROGRAM_ORDER = ["bachelor", "diploma", "postgraduate"];

// ── Tooltip مخصص للـ charts ──────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#1e293b", borderRadius: 10, padding: "10px 14px",
      boxShadow: "0 8px 24px rgba(0,0,0,0.3)", direction: "rtl",
    }}>
      <div style={{ color: "#94a3b8", fontSize: 11, marginBottom: 6, fontWeight: 700 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: p.color, display: "inline-block" }} />
          <span style={{ color: "#e2e8f0", fontSize: 12 }}>{p.name}</span>
          <span style={{ color: "#fff", fontWeight: 800, fontSize: 13 }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
}

// ── رسم بياني لكلية واحدة (أعمدة أو خطوط) ──────────────────────
function FacultyChart({ faculty, allYears }) {
  const [chartType, setChartType] = useState("bar"); // "bar" | "line"

  // بناء بيانات الـ chart: كل سنة صف، وكل برنامج عمود
  const chartData = allYears.map(yr => {
    const row = { year: yr };
    faculty.programs.forEach(prog => {
      const meta = PROGRAM_META[prog.key];
      row[meta?.label || prog.key] = prog.yearTotals[yr] || 0;
    });
    return row;
  });

  const programKeys = PROGRAM_ORDER
    .filter(k => faculty.programs.some(p => p.key === k))
    .map(k => {
      const prog = faculty.programs.find(p => p.key === k);
      return { key: k, label: PROGRAM_META[k]?.label || k, color: PROGRAM_META[k]?.color || "#64748b" };
    });

  if (chartData.length === 0) return null;

  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: "16px", marginTop: 12, border: "1px solid #e2e8f0" }}>
      {/* أزرار تبديل نوع الرسم */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#64748b" }}>الرسم البياني للكلية</span>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={() => setChartType("bar")}
            style={{
              padding: "4px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700,
              cursor: "pointer", fontFamily: "inherit",
              border: chartType === "bar" ? "none" : "1.5px solid #e2e8f0",
              background: chartType === "bar" ? "#2563eb" : "transparent",
              color: chartType === "bar" ? "#fff" : "#64748b",
              display: "flex", alignItems: "center", gap: 5,
            }}
          >
            <FaChartBar size={11} /> أعمدة
          </button>
          <button
            onClick={() => setChartType("line")}
            style={{
              padding: "4px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700,
              cursor: "pointer", fontFamily: "inherit",
              border: chartType === "line" ? "none" : "1.5px solid #e2e8f0",
              background: chartType === "line" ? "#9333ea" : "transparent",
              color: chartType === "line" ? "#fff" : "#64748b",
              display: "flex", alignItems: "center", gap: 5,
            }}
          >
            <FaChartLine size={11} /> خطوط
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        {chartType === "bar" ? (
          <BarChart data={chartData} barCategoryGap="30%" barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="year" tick={{ fontSize: 11, fill: "#94a3b8", fontFamily: "inherit" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8", fontFamily: "inherit" }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12, fontFamily: "inherit", paddingTop: 8 }} />
            {programKeys.map(p => (
              <Bar key={p.key} dataKey={p.label} fill={p.color} radius={[6, 6, 0, 0]} maxBarSize={40} />
            ))}
          </BarChart>
        ) : (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="year" tick={{ fontSize: 11, fill: "#94a3b8", fontFamily: "inherit" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8", fontFamily: "inherit" }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12, fontFamily: "inherit", paddingTop: 8 }} />
            {programKeys.map(p => (
              <Line
                key={p.key} type="monotone" dataKey={p.label}
                stroke={p.color} strokeWidth={2.5}
                dot={{ fill: p.color, r: 4, strokeWidth: 2, stroke: "#fff" }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

// ── رسم بياني إجمالي لكل الكليات ────────────────────────────────
function OverallChart({ faculties, allYears }) {
  const [chartType, setChartType] = useState("bar");

  // كل سنة صف، وكل كلية عمود
  const chartData = allYears.map(yr => {
    const row = { year: yr };
    faculties.forEach(f => {
      row[f.name] = f.programs.reduce((s, p) => s + (p.yearTotals[yr] || 0), 0);
    });
    return row;
  });

  const facultyColors = ["#2563eb", "#16a34a", "#d97706", "#9333ea", "#e11d48", "#0369a1", "#ca8a04"];

  return (
    <div style={{
      background: "#fff", borderRadius: 14, padding: "18px",
      marginBottom: 20, border: "1.5px solid #e2e8f0",
      boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 14, color: "#1e293b" }}>مقارنة الكليات عبر السنين</div>
          <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>إجمالي الطلاب لكل كلية</div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={() => setChartType("bar")}
            style={{
              padding: "4px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700,
              cursor: "pointer", fontFamily: "inherit",
              border: chartType === "bar" ? "none" : "1.5px solid #e2e8f0",
              background: chartType === "bar" ? "#2563eb" : "transparent",
              color: chartType === "bar" ? "#fff" : "#64748b",
              display: "flex", alignItems: "center", gap: 5,
            }}
          >
            <FaChartBar size={11} /> أعمدة
          </button>
          <button
            onClick={() => setChartType("line")}
            style={{
              padding: "4px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700,
              cursor: "pointer", fontFamily: "inherit",
              border: chartType === "line" ? "none" : "1.5px solid #e2e8f0",
              background: chartType === "line" ? "#9333ea" : "transparent",
              color: chartType === "line" ? "#fff" : "#64748b",
              display: "flex", alignItems: "center", gap: 5,
            }}
          >
            <FaChartLine size={11} /> خطوط
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        {chartType === "bar" ? (
          <BarChart data={chartData} barCategoryGap="25%" barGap={3}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="year" tick={{ fontSize: 11, fill: "#94a3b8", fontFamily: "inherit" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8", fontFamily: "inherit" }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11, fontFamily: "inherit", paddingTop: 8 }} />
            {faculties.map((f, i) => (
              <Bar key={f.id} dataKey={f.name} fill={facultyColors[i % facultyColors.length]} radius={[5, 5, 0, 0]} maxBarSize={30} />
            ))}
          </BarChart>
        ) : (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="year" tick={{ fontSize: 11, fill: "#94a3b8", fontFamily: "inherit" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8", fontFamily: "inherit" }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11, fontFamily: "inherit", paddingTop: 8 }} />
            {faculties.map((f, i) => (
              <Line
                key={f.id} type="monotone" dataKey={f.name}
                stroke={facultyColors[i % facultyColors.length]} strokeWidth={2.5}
                dot={{ fill: facultyColors[i % facultyColors.length], r: 4, strokeWidth: 2, stroke: "#fff" }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

// ── YearBar صغيرة للأقسام ────────────────────────────────────────
function YearBar({ count, maxCount, color }) {
  const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 18, background: "#f1f5f9", borderRadius: 6, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 6, transition: "width 0.6s ease" }} />
      </div>
      <span style={{ minWidth: 30, textAlign: "right", fontWeight: 700, fontSize: 12, color: "#1e293b" }}>{count}</span>
    </div>
  );
}

function DepartmentRow({ dept, allYears, accentColor }) {
  const [open, setOpen] = useState(false);
  const maxCount = Math.max(...allYears.map(y => dept.years[y] || 0), 1);
  const total = allYears.reduce((s, y) => s + (dept.years[y] || 0), 0);

  return (
    <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, marginBottom: 6, overflow: "hidden", background: "#fff" }}>
      <div
        onClick={() => setOpen(v => !v)}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "9px 14px", cursor: "pointer", userSelect: "none",
          background: open ? "#f8fafc" : "#fff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: accentColor, display: "inline-block" }} />
          <span style={{ fontWeight: 700, fontSize: 13, color: "#1e293b" }}>{dept.name}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ background: accentColor + "18", color: accentColor, borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 700 }}>
            {total} طالب
          </span>
          {open ? <FaChevronUp size={11} color="#94a3b8" /> : <FaChevronDown size={11} color="#94a3b8" />}
        </div>
      </div>
      {open && (
        <div style={{ padding: "12px 16px", borderTop: "1px solid #f1f5f9" }}>
          {allYears.map(yr => (
            <div key={yr} style={{ marginBottom: 7 }}>
              <div style={{ fontSize: 11, color: "#64748b", marginBottom: 2, fontWeight: 600, direction: "ltr", textAlign: "right" }}>{yr}</div>
              <YearBar count={dept.years[yr] || 0} maxCount={maxCount} color={accentColor} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProgramSection({ program, allYears, accentColor }) {
  const [open, setOpen] = useState(false);
  const meta = PROGRAM_META[program.key] || { label: program.label, color: accentColor, bg: "#f8fafc", icon: <FaUsers /> };
  const total = allYears.reduce((s, y) => s + (program.yearTotals[y] || 0), 0);
  const maxCount = Math.max(...allYears.map(y => program.yearTotals[y] || 0), 1);

  if (total === 0) return null;

  return (
    <div style={{ border: `1.5px solid ${meta.color}30`, borderRadius: 12, marginBottom: 10, overflow: "hidden", background: meta.bg }}>
      <div
        onClick={() => setOpen(v => !v)}
        style={{ padding: "12px 16px", cursor: "pointer", userSelect: "none", display: "flex", alignItems: "center", justifyContent: "space-between" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: meta.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>
            {meta.icon}
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 13, color: "#1e293b" }}>{meta.label}</div>
            <div style={{ fontSize: 11, color: "#64748b" }}>{program.departments.length} أقسام</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ background: meta.color, color: "#fff", borderRadius: 20, padding: "3px 12px", fontWeight: 800, fontSize: 12 }}>
            {total} طالب
          </span>
          {open ? <FaChevronUp size={11} color="#64748b" /> : <FaChevronDown size={11} color="#64748b" />}
        </div>
      </div>

      <div style={{ padding: "0 16px 10px" }}>
        {allYears.map(yr => (
          <div key={yr} style={{ marginBottom: 5 }}>
            <div style={{ fontSize: 11, color: "#64748b", marginBottom: 2, fontWeight: 600, direction: "ltr", textAlign: "right" }}>{yr}</div>
            <YearBar count={program.yearTotals[yr] || 0} maxCount={maxCount} color={meta.color} />
          </div>
        ))}
      </div>

      {open && (
        <div style={{ borderTop: `1px solid ${meta.color}20`, background: "#fff", padding: "12px 14px" }}>
          <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700, marginBottom: 8 }}>تفاصيل الأقسام:</div>
          {program.departments.map(dept => (
            <DepartmentRow key={dept.id} dept={dept} allYears={allYears} accentColor={meta.color} />
          ))}
        </div>
      )}
    </div>
  );
}

function FacultyCard({ faculty, allYears, colorScheme }) {
  const [expanded, setExpanded] = useState(false);

  const sortedPrograms = [...faculty.programs].sort(
    (a, b) => PROGRAM_ORDER.indexOf(a.key) - PROGRAM_ORDER.indexOf(b.key)
  );

  const totalAll = faculty.programs.reduce(
    (s, p) => s + allYears.reduce((ss, y) => ss + (p.yearTotals[y] || 0), 0), 0
  );

  return (
    <div style={{ background: colorScheme.bg, border: `1.5px solid ${colorScheme.accent}30`, borderRadius: 16, marginBottom: 16, overflow: "hidden" }}>
      <div style={{ padding: "16px 20px" }}>
        {/* رأس الكلية */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: colorScheme.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FaUniversity size={17} color="#fff" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, color: "#1e293b" }}>{faculty.name}</div>
              <div style={{ fontSize: 12, color: "#64748b" }}>
                {faculty.programs.length} برامج — {faculty.programs.reduce((s, p) => s + p.departments.length, 0)} أقسام
              </div>
            </div>
          </div>
          <div style={{ background: colorScheme.accent, color: "#fff", borderRadius: 20, padding: "4px 14px", fontWeight: 800, fontSize: 14, display: "flex", alignItems: "center", gap: 5 }}>
            <FaUsers size={12} /> {totalAll}
          </div>
        </div>

        {/* بطاقات البرامج */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          {sortedPrograms.map(prog => {
            const meta = PROGRAM_META[prog.key] || { label: prog.label, color: colorScheme.accent, bg: "#f8fafc" };
            const t = allYears.reduce((s, y) => s + (prog.yearTotals[y] || 0), 0);
            if (t === 0) return null;
            return (
              <div key={prog.key} style={{ background: meta.bg, border: `1px solid ${meta.color}30`, borderRadius: 10, padding: "6px 12px", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: meta.color, fontSize: 12 }}>{meta.icon}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>{meta.label}</span>
                <span style={{ fontSize: 13, fontWeight: 900, color: meta.color }}>{t}</span>
              </div>
            );
          })}
        </div>

        {/* الرسم البياني للكلية */}
        <FacultyChart faculty={faculty} allYears={allYears} />

        {/* زر التفاصيل */}
        <button
          onClick={() => setExpanded(v => !v)}
          style={{
            marginTop: 12, background: "transparent",
            border: `1.5px solid ${colorScheme.accent}60`,
            borderRadius: 8, padding: "6px 14px",
            color: colorScheme.accent, fontWeight: 700, fontSize: 13,
            cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit",
          }}
        >
          {expanded ? <FaChevronUp size={11} /> : <FaChevronDown size={11} />}
          {expanded ? "إخفاء تفاصيل الأقسام" : "عرض تفاصيل الأقسام"}
        </button>
      </div>

      {expanded && (
        <div style={{ borderTop: `1.5px solid ${colorScheme.accent}20`, background: "#f8fafc", padding: "14px 16px" }}>
          {sortedPrograms.map(prog => (
            <ProgramSection key={prog.key} program={prog} allYears={allYears} accentColor={colorScheme.accent} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── المكوّن الرئيسي ───────────────────────────────────────────────
export default function EnrollmentStats({ onClose }) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res  = await fetch(`${API_BASE}/dashboard/enrollment-stats`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "فشل التحميل");
      setData(json);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const h = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const programTotals = data
    ? data.faculties.reduce((acc, f) => {
        f.programs.forEach(p => {
          const t = data.allYears.reduce((s, y) => s + (p.yearTotals[y] || 0), 0);
          acc[p.key] = (acc[p.key] || 0) + t;
        });
        return acc;
      }, {})
    : {};

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(3px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: "#f8fafc", borderRadius: 20, width: "100%", maxWidth: "min(1200px, 95vw)", maxHeight: "92vh", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 25px 60px rgba(0,0,0,0.25)" }}>

        {/* Header */}
        <div style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)", padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <FaChartBar size={20} color="#93c5fd" />
            <div>
              <div style={{ color: "#fff", fontWeight: 800, fontSize: 16 }}>إحصائيات الطلاب</div>
              <div style={{ color: "#93c5fd", fontSize: 12 }}>مقسّمة حسب الكلية والبرنامج والسنة الأكاديمية</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 8, padding: "6px 8px", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center" }}>
            <FaTimes size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ overflowY: "auto", padding: "20px 28px", flex: 1 }}>
          {loading && (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#64748b" }}>
              <div style={{ width: 38, height: 38, border: "4px solid #e2e8f0", borderTop: "4px solid #2563eb", borderRadius: "50%", margin: "0 auto 14px", animation: "spin 0.8s linear infinite" }} />
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              جارٍ تحميل الإحصائيات...
            </div>
          )}

          {error && (
            <div style={{ background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: 12, padding: "16px 20px", color: "#be123c", textAlign: "center" }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>حدث خطأ</div>
              <div style={{ fontSize: 13 }}>{error}</div>
              <button onClick={load} style={{ marginTop: 12, background: "#be123c", color: "#fff", border: "none", borderRadius: 8, padding: "6px 16px", cursor: "pointer", fontFamily: "inherit", fontWeight: 700 }}>إعادة المحاولة</button>
            </div>
          )}

          {data && !loading && (
            <>
              {/* بطاقات الإجماليات */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px,1fr))", gap: 10, marginBottom: 18 }}>
                <div style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 12, padding: "12px 16px", textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: "#2563eb" }}>{data.faculties.length}</div>
                  <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>كلية</div>
                </div>
                {PROGRAM_ORDER.map(key => {
                  const meta = PROGRAM_META[key];
                  const t = programTotals[key] || 0;
                  if (t === 0) return null;
                  return (
                    <div key={key} style={{ background: meta.bg, border: `1.5px solid ${meta.color}30`, borderRadius: 12, padding: "12px 16px", textAlign: "center" }}>
                      <div style={{ fontSize: 22, fontWeight: 900, color: meta.color }}>{t}</div>
                      <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>{meta.label}</div>
                    </div>
                  );
                })}
                <div style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 12, padding: "12px 16px", textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: "#475569" }}>{Object.values(programTotals).reduce((s, v) => s + v, 0)}</div>
                  <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>الإجمالي</div>
                </div>
              </div>

              {/* رسم بياني إجمالي لكل الكليات */}
              <OverallChart faculties={data.faculties} allYears={data.allYears} />

              {/* كل كلية */}
<div style={{
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(480px, 1fr))",
  gap: 16,
  alignItems: "start",
}}>
  {data.faculties.map((faculty, idx) => (
    <FacultyCard
      key={faculty.id}
      faculty={faculty}
      allYears={data.allYears}
      colorScheme={FACULTY_COLORS[idx % FACULTY_COLORS.length]}
    />
  ))}
</div>

              {data.faculties.length === 0 && (
                <div style={{ textAlign: "center", color: "#94a3b8", padding: "40px 0", fontSize: 14 }}>لا توجد بيانات متاحة</div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}